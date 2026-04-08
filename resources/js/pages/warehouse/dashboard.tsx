import { PageProps } from '@inertiajs/core';
import AppLayout from '@/layouts/app-layout';
import {
    Package,
    AlertTriangle,
    Tags,
    Truck,
    ArrowDownToLine,
    ArrowUpFromLine,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Stat {
    totalProducts: number;
    lowStockProducts: number;
    totalCategories: number;
    totalSuppliers: number;
    todayStockIn: number;
    todayStockOut: number;
}

interface LowStockItem {
    id: number;
    name: string;
    stock: number;
    min_stock: number;
    unit: string;
    category: {
        name: string;
    };
}

interface Transaction {
    id: number;
    type: 'in' | 'out';
    quantity: number;
    created_at: string;
    product: {
        name: string;
        sku: string;
    };
    user: {
        name: string;
    };
}

interface DashboardProps extends PageProps {
    stats: Stat;
    lowStockItems: LowStockItem[];
    recentTransactions: Transaction[];
}

export default function Dashboard({ stats, lowStockItems }: DashboardProps) {
    const statCards = [
        {
            title: 'Total Produk',
            value: stats.totalProducts,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Stok Rendah',
            value: stats.lowStockProducts,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
        },
        {
            title: 'Kategori',
            value: stats.totalCategories,
            icon: Tags,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Supplier',
            value: stats.totalSuppliers,
            icon: Truck,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Masuk Hari Ini',
            value: stats.todayStockIn,
            icon: ArrowDownToLine,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100',
        },
        {
            title: 'Keluar Hari Ini',
            value: stats.todayStockOut,
            icon: ArrowUpFromLine,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Selamat datang di sistem manajemen gudang
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Produk Stok Rendah
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStockItems.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Semua produk memiliki stok yang cukup
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {lowStockItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between border-b pb-2 last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.category.name}
                                            </p>
                                        </div>
                                        <Badge variant="destructive">
                                            {item.stock} {item.unit}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-orange-500" />
                            Produk Stok Rendah (Detail)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead>Stok</TableHead>
                                    <TableHead>Min</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStockItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.name}
                                        </TableCell>
                                        <TableCell>{item.stock}</TableCell>
                                        <TableCell>{item.min_stock}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    item.stock === 0
                                                        ? 'destructive'
                                                        : 'secondary'
                                                }
                                            >
                                                {item.stock === 0
                                                    ? 'Habis'
                                                    : 'Rendah'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
        {page}
    </AppLayout>
);
