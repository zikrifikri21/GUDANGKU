<?php

namespace App\Http\Controllers\Warehouse;

use App\Events\LowStockAlert;
use App\Events\StockTransactionCreated;
use App\Events\StockUpdated;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Broadcast;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->type ?? 'in';

        $products = Product::with('category')
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'text' => "{$product->name} (SKU: {$product->sku}) - Stok: {$product->stock} {$product->unit}",
                    'current_stock' => $product->stock,
                    'unit' => $product->unit,
                ];
            });

        $transactions = StockTransaction::with(['product', 'user'])
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($request->product_id, function ($query, $productId) {
                $query->where('product_id', $productId);
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return inertia('warehouse/stock/index', [
            'products' => $products,
            'transactions' => $transactions,
            'filters' => $request->only('type', 'product_id', 'date_from', 'date_to'),
        ]);
    }

    public function indexIn(Request $request)
    {
        $type = 'in';

        $products = Product::with('category')
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'text' => "{$product->name} (SKU: {$product->sku}) - Stok: {$product->stock} {$product->unit}",
                    'current_stock' => $product->stock,
                    'unit' => $product->unit,
                ];
            });

        $transactions = StockTransaction::with(['product', 'user'])
            ->where('type', $type)
            ->when($request->product_id, function ($query, $productId) {
                $query->where('product_id', $productId);
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return inertia('warehouse/stock/index', [
            'products' => $products,
            'transactions' => $transactions,
            'filters' => $request->only('product_id', 'date_from', 'date_to'),
            'activeTab' => 'in',
        ]);
    }

    public function indexOut(Request $request)
    {
        $type = 'out';

        $products = Product::with('category')
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'text' => "{$product->name} (SKU: {$product->sku}) - Stok: {$product->stock} {$product->unit}",
                    'current_stock' => $product->stock,
                    'unit' => $product->unit,
                ];
            });

        $transactions = StockTransaction::with(['product', 'user'])
            ->where('type', $type)
            ->when($request->product_id, function ($query, $productId) {
                $query->where('product_id', $productId);
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return inertia('warehouse/stock/index', [
            'products' => $products,
            'transactions' => $transactions,
            'filters' => $request->only('product_id', 'date_from', 'date_to'),
            'activeTab' => 'out',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string',
        ]);

        $product = Product::with('category')->findOrFail($validated['product_id']);

        if ($validated['type'] === 'out' && $product->stock < $validated['quantity']) {
            return redirect()->back()->with('error', 'Stok tidak mencukupi');
        }

        $transaction = DB::transaction(function () use ($validated, $product, $request) {
            if ($validated['type'] === 'in') {
                $product->increment('stock', $validated['quantity']);
            } else {
                $product->decrement('stock', $validated['quantity']);
            }

            $transaction = StockTransaction::create([
                'product_id' => $validated['product_id'],
                'user_id' => $request->user()->id,
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'note' => $validated['note'] ?? null,
            ]);

            return $transaction->fresh(['product', 'user']);
        });

        try {
            // Dispatch event
            event(new StockTransactionCreated($transaction));
            Log::info('StockTransactionCreated event dispatched successfully');
        } catch (\Exception $e) {
            Log::error('Failed to broadcast event: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
        }

        $product->refresh();

        try {
            $type = $validated['type'] === 'in' ? 'masuk' : 'keluar';
            event(new StockUpdated(
                productId: $product->id,
                productName: $product->name,
                type: $type,
                quantity: $validated['quantity'],
                stockRemaining: $product->stock,
                actorId: $request->user()->id,
                actorName: $request->user()->name,
            ));
            Log::info('StockUpdated event dispatched successfully');
        } catch (\Exception $e) {
            Log::error('Failed to broadcast StockUpdated: ' . $e->getMessage());
        }

        if ($product->isLowStock()) {
            try {
                event(new LowStockAlert($product));
                Log::info('LowStockAlert event dispatched successfully');
            } catch (\Exception $e) {
                Log::error('Failed to broadcast LowStockAlert: ' . $e->getMessage());
            }
        }

        $action = $validated['type'] === 'in' ? 'ditambahkan' : 'dikurangi';
        return redirect()->back()->with('success', "Stok berhasil {$action}");
    }

    public function latest()
    {
        $transactions = StockTransaction::with(['product', 'user'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'product_id' => $transaction->product_id,
                    'product_name' => $transaction->product->name,
                    'type' => $transaction->type === 'in' ? 'masuk' : 'keluar',
                    'quantity' => $transaction->quantity,
                    'stock_remaining' => $transaction->product->stock,
                    'actor_id' => $transaction->user_id,
                    'actor_name' => $transaction->user->name,
                    'timestamp' => $transaction->created_at->toIso8601String(),
                ];
            });

        return response()->json($transactions);
    }
}
