import { useState } from 'react';
import { PageProps } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDownToLine, ArrowUpFromLine, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SelectProduct {
    id: number;
    text: string;
    current_stock: number;
    unit: string;
}

interface Transaction {
    id: number;
    type: 'in' | 'out';
    quantity: number;
    note: string | null;
    created_at: string;
    product: {
        name: string;
        sku: string;
    };
    user: {
        name: string;
    };
}

interface StockProps extends PageProps {
    products: SelectProduct[];
    transactions: {
        data: Transaction[];
        links: unknown[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        type?: string;
        product_id?: string;
        date_from?: string;
        date_to?: string;
    };
    success?: string;
    error?: string;
}

export default function StockIndex({ products, transactions, filters, success, error }: StockProps) {
    const [transactionType, setTransactionType] = useState<'in' | 'out'>(
        (filters.type as 'in' | 'out') || 'in'
    );
    const [showSuccess, setShowSuccess] = useState(success || '');
    const [showError, setShowError] = useState(error || '');
    const [selectedProductId, setSelectedProductId] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        type: transactionType,
        quantity: 0,
        note: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId) {
            setShowError('Silakan pilih produk terlebih dahulu');
            return;
        }
        
        const selectedProduct = products.find(
            (p) => p.id === Number(selectedProductId)
        );

        if (transactionType === 'out' && selectedProduct) {
            if (data.quantity > selectedProduct.current_stock) {
                setShowError('Jumlah keluar melebihi stok yang tersedia');
                return;
            }
        }

        setData('type', transactionType);
        post('/stock', {
            data: {
                product_id: selectedProductId,
                type: transactionType,
                quantity: data.quantity,
                note: data.note,
            },
            onSuccess: () => {
                setSelectedProductId('');
                setData({ product_id: '', type: transactionType, quantity: 0, note: '' });
                window.location.reload();
            },
        });
    };

    const selectedProduct = products.find(
        (p) => p.id === Number(selectedProductId)
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="p-6 space-y-6">
            {showSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {showSuccess}
                </div>
            )}
            {showError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {showError}
                </div>
            )}

            <div>
                <h1 className="text-2xl font-bold tracking-tight">Transaksi Stok</h1>
                <p className="text-muted-foreground">
                    Kelola stok masuk dan keluar
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <div className="border rounded-lg p-6 space-y-6">
                        <Tabs
                            value={transactionType}
                            onValueChange={(v) => setTransactionType(v as 'in' | 'out')}
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="in" className="flex items-center gap-2">
                                    <ArrowDownToLine className="h-4 w-4" />
                                    Masuk
                                </TabsTrigger>
                                <TabsTrigger value="out" className="flex items-center gap-2">
                                    <ArrowUpFromLine className="h-4 w-4" />
                                    Keluar
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="product_id">Produk</Label>
                                <Select
                                    value={selectedProductId || undefined}
                                    onValueChange={(value) =>
                                        setSelectedProductId(value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Produk" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem
                                                key={product.id}
                                                value={String(product.id)}
                                            >
                                                {product.text}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.product_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.product_id}
                                    </p>
                                )}
                            </div>

                            {selectedProduct && (
                                <div className="bg-muted rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Stok Tersedia
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {selectedProduct.current_stock}{' '}
                                        {selectedProduct.unit}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Jumlah</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={data.quantity || ''}
                                    onChange={(e) =>
                                        setData('quantity', Number(e.target.value))
                                    }
                                    placeholder="Masukkan jumlah"
                                />
                                {errors.quantity && (
                                    <p className="text-sm text-destructive">
                                        {errors.quantity}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note">Catatan</Label>
                                <Input
                                    id="note"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    placeholder="Catatan (opsional)"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                variant={transactionType === 'in' ? 'default' : 'destructive'}
                                disabled={processing}
                            >
                                {processing
                                    ? 'Menyimpan...'
                                    : transactionType === 'in'
                                      ? 'Tambah Stok'
                                      : 'Kurangi Stok'}
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="border rounded-lg">
                        <div className="p-4 border-b">
                            <form
                                action="/stock"
                                method="get"
                                className="flex flex-wrap gap-4 items-end"
                            >
                                <Select
                                    name="type"
                                    defaultValue={filters.type || 'all'}
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tipe</SelectItem>
                                        <SelectItem value="in">Masuk</SelectItem>
                                        <SelectItem value="out">Keluar</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    name="date_from"
                                    type="date"
                                    defaultValue={filters.date_from}
                                    placeholder="Dari Tanggal"
                                    className="w-[180px]"
                                />
                                <Input
                                    name="date_to"
                                    type="date"
                                    defaultValue={filters.date_to}
                                    placeholder="Sampai Tanggal"
                                    className="w-[180px]"
                                />
                                <Button type="submit" variant="secondary">
                                    <Search className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            </form>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Produk</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Catatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-8"
                                        >
                                            Tidak ada data transaksi
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.data.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {formatDate(transaction.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {transaction.product.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {transaction.product.sku}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        transaction.type === 'in'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {transaction.type === 'in'
                                                        ? 'Masuk'
                                                        : 'Keluar'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                {transaction.type === 'in' ? '+' : '-'}
                                                {transaction.quantity}
                                            </TableCell>
                                            <TableCell>{transaction.user.name}</TableCell>
                                            <TableCell className="max-w-[150px] truncate">
                                                {transaction.note || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}

StockIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Stok', href: '/stock' }]}>
        {page}
    </AppLayout>
);
