<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $stats = [
            'totalProducts' => Product::count(),
            'lowStockProducts' => Product::whereColumn('stock', '<=', 'min_stock')->count(),
            'totalCategories' => Category::count(),
            'totalSuppliers' => Supplier::count(),
            'todayStockIn' => StockTransaction::where('type', 'in')
                ->whereDate('created_at', today())
                ->sum('quantity'),
            'todayStockOut' => StockTransaction::where('type', 'out')
                ->whereDate('created_at', today())
                ->sum('quantity'),
        ];

        $lowStockItems = Product::with('category')
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock')
            ->limit(10)
            ->get();

        $recentTransactions = StockTransaction::with(['product', 'user'])
            ->latest()
            ->limit(10)
            ->get();

        $stockMovement = StockTransaction::selectRaw('DATE(created_at) as date, type, SUM(quantity) as total')
            ->whereBetween('created_at', [now()->subDays(7), now()])
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get()
            ->groupBy('type');

        return inertia('warehouse/dashboard', [
            'stats' => $stats,
            'lowStockItems' => $lowStockItems,
            'recentTransactions' => $recentTransactions,
            'stockMovement' => [
                'in' => $stockMovement->get('in', collect())->values(),
                'out' => $stockMovement->get('out', collect())->values(),
            ],
        ]);
    }
}
