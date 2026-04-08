<?php

namespace App\Enums;

enum Role: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN = 'admin';
    case PEGAWAI = 'pegawai';

    public function label(): string
    {
        return match($this) {
            self::SUPER_ADMIN => 'Super Admin',
            self::ADMIN => 'Admin',
            self::PEGAWAI => 'Pegawai',
        };
    }

    public function permissions(): array
    {
        return match($this) {
            self::SUPER_ADMIN => [
                'manage_users',
                'manage_settings',
                'view_logs',
                'manage_ai',
                'manage_inventory',
                'manage_reports',
                'manage_suppliers',
                'use_ai_chat',
                'record_stock',
                'view_products',
            ],
            self::ADMIN => [
                'manage_inventory',
                'manage_reports',
                'manage_suppliers',
                'use_ai_chat',
                'record_stock',
                'view_products',
            ],
            self::PEGAWAI => [
                'record_stock',
                'view_products',
            ],
        };
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions());
    }
}
