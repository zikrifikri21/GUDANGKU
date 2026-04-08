<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\Supplier;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index()
    {
        return inertia('warehouse/ai-chat/index');
    }

    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $message = strtolower($validated['message']);
        $response = $this->generateResponse($message);

        return response()->json([
            'response' => $response,
        ]);
    }

    private function generateResponse(string $message): string
    {
        $data = $this->getDatabaseData();

        if (str_contains($message, 'stok') && str_contains($message, 'rendah')) {
            return $this->getLowStockResponse($data['lowStockProducts']);
        }

        if (str_contains($message, 'stok') && str_contains($message, 'total')) {
            return $this->getTotalStockResponse($data['totalProducts']);
        }

        if (str_contains($message, 'produk') || str_contains($message, 'barang')) {
            return $this->getProductsResponse($data['products']);
        }

        if (str_contains($message, 'supplier')) {
            return $this->getSuppliersResponse($data['suppliers']);
        }

        if (str_contains($message, 'transaksi') || str_contains($message, 'keluar') || str_contains($message, 'masuk')) {
            return $this->getTransactionsResponse($data['recentTransactions']);
        }

        if (str_contains($message, 'kategori')) {
            return $this->getCategoriesResponse($data['categories']);
        }

        return "Maaf, saya tidak mengerti pertanyaan Anda. Silakan tanyakan tentang:\n" .
               "- Stok produk\n" .
               "- Produk dengan stok rendah\n" .
               "- Daftar supplier\n" .
               "- Transaksi terbaru\n" .
               "- Kategori produk";
    }

    private function getDatabaseData(): array
    {
        return [
            'products' => Product::with('category')->limit(10)->get(),
            'lowStockProducts' => Product::with('category')
                ->whereColumn('stock', '<=', 'min_stock')
                ->get(),
            'suppliers' => Supplier::withCount('products')->get(),
            'categories' => Category::withCount('products')->get(),
            'totalProducts' => Product::count(),
            'recentTransactions' => StockTransaction::with(['product', 'user'])
                ->latest()
                ->limit(5)
                ->get(),
        ];
    }

    private function getLowStockResponse($products): string
    {
        if ($products->isEmpty()) {
            return "Semua produk memiliki stok yang cukup. Tidak ada produk dengan stok rendah.";
        }

        $response = "Berikut adalah produk dengan stok rendah:\n\n";
        foreach ($products as $product) {
            $response .= "- {$product->name} ({$product->category->name}): {$product->stock} {$product->unit} (min: {$product->min_stock})\n";
        }

        return $response;
    }

    private function getTotalStockResponse(int $total): string
    {
        return "Total produk dalam gudang adalah {$total} item.";
    }

    private function getProductsResponse($products): string
    {
        if ($products->isEmpty()) {
            return "Belum ada produk dalam gudang.";
        }

        $response = "Daftar produk dalam gudang:\n\n";
        foreach ($products as $product) {
            $status = $product->stock <= $product->min_stock ? ' [STOK RENDAH]' : '';
            $response .= "- {$product->name} ({$product->category->name}): {$product->stock} {$product->unit}{$status}\n";
        }

        return $response;
    }

    private function getSuppliersResponse($suppliers): string
    {
        if ($suppliers->isEmpty()) {
            return "Belum ada supplier terdaftar.";
        }

        $response = "Daftar supplier:\n\n";
        foreach ($suppliers as $supplier) {
            $response .= "- {$supplier->name} ({$supplier->products_count} produk)\n";
            if ($supplier->contact) {
                $response .= "  Kontak: {$supplier->contact}\n";
            }
        }

        return $response;
    }

    private function getCategoriesResponse($categories): string
    {
        if ($categories->isEmpty()) {
            return "Belum ada kategori.";
        }

        $response = "Daftar kategori:\n\n";
        foreach ($categories as $category) {
            $response .= "- {$category->name}: {$category->products_count} produk\n";
        }

        return $response;
    }

    private function getTransactionsResponse($transactions): string
    {
        if ($transactions->isEmpty()) {
            return "Belum ada transaksi.";
        }

        $response = "Transaksi terbaru:\n\n";
        foreach ($transactions as $transaction) {
            $type = $transaction->type === 'in' ? 'Masuk' : 'Keluar';
            $date = $transaction->created_at->format('d/m/Y H:i');
            $response .= "- [{$type}] {$transaction->product->name}: {$transaction->quantity} unit ({$date})\n";
        }

        return $response;
    }
}
