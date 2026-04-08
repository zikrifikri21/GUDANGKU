import { useState } from 'react';
import { PageProps } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
import { Pencil, Trash2, Plus, Search, AlertTriangle } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Supplier {
    id: number;
    name: string;
}

interface Product {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    stock: number;
    min_stock: number;
    unit: string;
    price: number;
    category: Category;
    supplier: Supplier | null;
    image: string | null;
}

interface ProductsProps extends PageProps {
    products: {
        data: Product[];
        links: unknown[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    filters: {
        search?: string;
        category?: string;
        low_stock?: string;
    };
    success?: string;
    error?: string;
}

export default function ProductsIndex({ products, categories, filters, success, error }: ProductsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showLowStock, setShowLowStock] = useState(filters.low_stock === '1');
    const [showSuccess, setShowSuccess] = useState(success || '');
    const [showError, setShowError] = useState(error || '');
    const [categoryValue, setCategoryValue] = useState<string>('');
    const [unitValue, setUnitValue] = useState<string>('pcs');

    const { data, setData, post, put, delete: destroy, processing, errors } = useForm({
        category_id: '',
        supplier_id: '',
        sku: '',
        name: '',
        description: '',
        stock: 0,
        unit: 'pcs',
        min_stock: 10,
        price: 0,
        image: null as File | null,
    });

    const resetForm = () => {
        setData({
            category_id: '',
            supplier_id: '',
            sku: '',
            name: '',
            description: '',
            stock: 0,
            unit: 'pcs',
            min_stock: 10,
            price: 0,
            image: null,
        });
        setCategoryValue('');
        setUnitValue('pcs');
        setEditingProduct(null);
    };

    const openCreate = () => {
        resetForm();
        setIsOpen(true);
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setData({
            category_id: String(product.category_id),
            supplier_id: product.supplier_id ? String(product.supplier_id) : '',
            sku: product.sku,
            name: product.name,
            description: product.description || '',
            stock: product.stock,
            unit: product.unit,
            min_stock: product.min_stock,
            price: product.price,
            image: null,
        });
        setCategoryValue(String(product.category_id));
        setUnitValue(product.unit);
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('category_id', categoryValue);
        formData.append('unit', unitValue);
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'category_id' && key !== 'unit' && value !== null && value !== '') {
                formData.append(key, String(value));
            }
        });

        if (editingProduct) {
            put(`/products/${editingProduct.id}`, {
                data: formData,
                encType: 'multipart/form-data',
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
            });
        } else {
            post('/products', {
                data: formData,
                encType: 'multipart/form-data',
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            destroy(`/products/${id}`);
        }
    };

    const toggleLowStock = (value: boolean) => {
        setShowLowStock(value);
        const url = new URL(window.location.href);
        if (value) {
            url.searchParams.set('low_stock', '1');
        } else {
            url.searchParams.delete('low_stock');
        }
        window.location.href = url.toString();
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(price);
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

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Produk</h1>
                    <p className="text-muted-foreground">Kelola data produk</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <form action="/products" method="get" className="flex-1 flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="search"
                            placeholder="Cari produk..."
                            defaultValue={filters.search}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        name="category"
                        defaultValue={filters.category || 'all'}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button type="submit" variant="secondary">
                        Cari
                    </Button>
                </form>
                <Button
                    variant={showLowStock ? 'default' : 'outline'}
                    onClick={() => toggleLowStock(!showLowStock)}
                >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Stok Rendah
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Stok</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Tidak ada data produk
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-mono text-sm">
                                        {product.sku}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>
                                    <TableCell>{product.category.name}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                product.stock <= product.min_stock
                                                    ? 'destructive'
                                                    : 'secondary'
                                            }
                                        >
                                            {product.stock} {product.unit}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatPrice(product.price)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(product)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    placeholder="SKU-0001"
                                />
                                {errors.sku && (
                                    <p className="text-sm text-destructive">{errors.sku}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Produk</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Nama produk"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Kategori</Label>
                                <Select
                                    value={categoryValue || undefined}
                                    onValueChange={(value) => {
                                        setCategoryValue(value);
                                        setData('category_id', value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={String(category.id)}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.category_id}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit</Label>
                                <Select
                                    value={unitValue || undefined}
                                    onValueChange={(value) => {
                                        setUnitValue(value);
                                        setData('unit', value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pcs">Pcs</SelectItem>
                                        <SelectItem value="box">Box</SelectItem>
                                        <SelectItem value="kg">Kg</SelectItem>
                                        <SelectItem value="liter">Liter</SelectItem>
                                        <SelectItem value="meter">Meter</SelectItem>
                                        <SelectItem value="roll">Roll</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stok</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData('stock', Number(e.target.value))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="min_stock">Minimal Stok</Label>
                                <Input
                                    id="min_stock"
                                    type="number"
                                    min="0"
                                    value={data.min_stock}
                                    onChange={(e) =>
                                        setData('min_stock', Number(e.target.value))
                                    }
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Harga</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', Number(e.target.value))
                                }
                            />
                            {errors.price && (
                                <p className="text-sm text-destructive">{errors.price}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Input
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Deskripsi produk (opsional)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image">Gambar</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setData('image', e.target.files?.[0] || null)
                                }
                            />
                            {errors.image && (
                                <p className="text-sm text-destructive">{errors.image}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

ProductsIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Produk', href: '/products' }]}>
        {page}
    </AppLayout>
);
