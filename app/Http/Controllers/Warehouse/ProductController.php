<?php

namespace App\Http\Controllers\Warehouse;

use App\Events\LowStockAlert;
use App\Events\ProductCreated;
use App\Events\ProductDeleted;
use App\Events\ProductUpdated;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['category', 'supplier'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
            })
            ->when($request->category, function ($query, $category) {
                $query->where('category_id', $category);
            })
            ->when($request->low_stock, function ($query) {
                $query->whereColumn('stock', '<=', 'min_stock');
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $categories = Category::orderBy('name')->get();

        return inertia('warehouse/products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only('search', 'category', 'low_stock'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'sku' => 'required|string|max:50|unique:products,sku',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:20',
            'min_stock' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($validated);
        $product->load(['category', 'supplier']);

        event(new ProductCreated($product));

        if ($product->isLowStock()) {
            event(new LowStockAlert($product));
        }

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'sku' => 'required|string|max:50|unique:products,sku,' . $product->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:20',
            'min_stock' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);
        $product->load(['category', 'supplier']);

        event(new ProductUpdated($product));

        if ($product->isLowStock()) {
            event(new LowStockAlert($product));
        }

        return redirect()->back()->with('success', 'Produk berhasil diperbarui');
    }

    public function destroy(Product $product)
    {
        if ($product->stockTransactions()->count() > 0) {
            return redirect()->back()->with('error', 'Produk tidak dapat dihapus karena memiliki riwayat transaksi');
        }

        $productId = $product->id;
        $productName = $product->name;

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        event(new ProductDeleted($productId, $productName));

        return redirect()->back()->with('success', 'Produk berhasil dihapus');
    }

    public function stocks()
    {
        $stocks = Product::select('id', 'stock')
            ->get()
            ->map(function ($product) {
                return [
                    'product_id' => $product->id,
                    'stock' => $product->stock,
                ];
            });

        return response()->json($stocks);
    }
}
