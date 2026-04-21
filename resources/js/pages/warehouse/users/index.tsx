import type { PageProps} from '@inertiajs/core';
import { usePage } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';
import { AlertError } from '@/components/alert-error';
import { Badge } from '@/components/ui/badge';
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
import AppLayout from '@/layouts/app-layout';

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface UsersProps extends PageProps {
    users: {
        data: UserData[];
        links: unknown[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    roles: { value: string; label: string }[];
    filters: {
        search?: string;
        role?: string;
    };
    success?: string;
    error?: string;
}

const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-800',
    admin: 'bg-blue-100 text-blue-800',
    pegawai: 'bg-green-100 text-green-800',
};

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    pegawai: 'Pegawai',
};

export default function UsersIndex({ users, roles, filters, success, error }: UsersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [showSuccess, setShowSuccess] = useState(success || '');
    const [showError, setShowError] = useState(error || '');
    const [roleValue, setRoleValue] = useState<string>('pegawai');

    const { data, setData, post, put, delete: destroy, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'pegawai',
    });

    useEffect(() => {
        if (success) {
            setShowSuccess(success);
            const timer = setTimeout(() => setShowSuccess(''), 5000);

            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            setShowError(error);
            const timer = setTimeout(() => setShowError(''), 5000);

            return () => clearTimeout(timer);
        }
    }, [error]);

    const resetForm = () => {
        setData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'pegawai',
        });
        setRoleValue('pegawai');
        setEditingUser(null);
    };

    const openCreate = () => {
        resetForm();
        setIsOpen(true);
    };

    const openEdit = (user: UserData) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role,
        });
        setRoleValue(user.role);
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = {
            ...data,
            role: roleValue,
        };

        if (editingUser) {
            put(`/users/${editingUser.id}`, {
                data: submitData,
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
            });
        } else {
            post('/users', {
                data: submitData,
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            destroy(`/users/${id}`);
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
                    <h1 className="text-2xl font-bold tracking-tight">Pengguna</h1>
                    <p className="text-muted-foreground">Kelola pengguna sistem</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Pengguna
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <form action="/users" method="get" className="flex-1 flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="search"
                            placeholder="Cari pengguna..."
                            defaultValue={filters.search}
                            className="pl-9"
                        />
                    </div>
                    <Select name="role" defaultValue={filters.role || 'all'}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Semua Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Role</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Tidak ada data pengguna
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.data.map((user, index) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        {(users.current_page - 1) * users.per_page + index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge className={roleColors[user.role] || ''}>
                                            {roleLabels[user.role] || user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(user)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(user.id)}
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
                            {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Masukkan nama"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Masukkan email"
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={roleValue || undefined}
                                onValueChange={(value) => setRoleValue(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-destructive">{errors.role}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password {editingUser && '(kosongkan jika tidak diubah)'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan password"
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password}</p>
                            )}
                        </div>
                        {editingUser && (
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                    placeholder="Konfirmasi password"
                                />
                            </div>
                        )}
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

UsersIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pengguna', href: '/users' }]}>
        {page}
    </AppLayout>
);
