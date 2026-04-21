import type { PageProps } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

interface Category {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
}

interface CategoriesProps extends PageProps {
    categories: {
        data: Category[];
        links: unknown[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
    success?: string;
    error?: string;
}

export default function CategoriesIndex({ categories, filters, success, error }: CategoriesProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showSuccess, setShowSuccess] = useState(success || '');
    const [showError, setShowError] = useState(error || '');

    const { data, setData, post, put, delete: destroy, processing, errors } = useForm({
        name: '',
        description: '',
    });

    useState(() => {
        if (success) {
            const timer = setTimeout(() => setShowSuccess(''), 5000);

            return () => clearTimeout(timer);
        }
    });

    useState(() => {
        if (error) {
            const timer = setTimeout(() => setShowError(''), 5000);

            return () => clearTimeout(timer);
        }
    });

    const resetForm = () => {
        setData({ name: '', description: '' });
        setEditingCategory(null);
    };

    const openCreate = () => {
        resetForm();
        setIsOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        setData({ name: category.name, description: category.description || '' });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCategory) {
            put(`/categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
            });
        } else {
            post('/categories', {
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            destroy(`/categories/${id}`);
        }
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
                    <h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
                    <p className="text-muted-foreground">Kelola kategori produk</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Kategori
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <form action="/categories" method="get" className="flex-1 flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="search"
                            placeholder="Cari kategori..."
                            defaultValue={filters.search}
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        Cari
                    </Button>
                </form>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    Tidak ada data kategori
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.data.map((category, index) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        {(categories.current_page - 1) * categories.per_page + index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.description || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(category)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(category.id)}
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Masukkan nama kategori"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Input
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Masukkan deskripsi (opsional)"
                            />
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

CategoriesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Kategori', href: '/categories' }]}>
        {page}
    </AppLayout>
);
