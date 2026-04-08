<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@warehouse.com',
            'role' => Role::SUPER_ADMIN,
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'name' => 'Admin Warehouse',
            'email' => 'admin@warehouse.com',
            'role' => Role::ADMIN,
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'name' => 'Pegawai Gudang',
            'email' => 'pegawai@warehouse.com',
            'role' => Role::PEGAWAI,
            'password' => Hash::make('password'),
        ]);

        $categories = [
            ['name' => 'Elektronik', 'description' => 'Produk elektronik dan komponen'],
            ['name' => 'Alat Tulis Kantor', 'description' => 'ATK danperlengkapan kantor'],
            ['name' => 'Barang Cetakan', 'description' => 'Buku, brosur, dan material cetak'],
            ['name' => 'Peralatan Rumah Tangga', 'description' => 'Peralatan dapur dan rumah'],
            ['name' => 'Bahan Bangunan', 'description' => 'Material konstruksi dan bangunan'],
        ];

        foreach ($categories as $category) {
            Category::factory()->create($category);
        }

        $suppliers = [
            ['name' => 'PT Sinar Jaya Elektronik', 'contact' => '021-1234567', 'address' => 'Jl. Merdeka No. 10, Jakarta'],
            ['name' => 'UD Sumber Rejeki', 'contact' => '021-7654321', 'address' => 'Jl. Sudirman No. 25, Bandung'],
            ['name' => 'CV Maju Bersama', 'contact' => '022-9876543', 'address' => 'Jl. Asia Afrika No. 50, Surabaya'],
            ['name' => 'Toko Karya Mandiri', 'contact' => '031-1122334', 'address' => 'Jl. Pemuda No. 88, Semarang'],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::factory()->create($supplier);
        }

        $productNames = [
            'Kabel USB Type-C 1 Meter',
            'Mouse Wireless Logitech',
            'Keyboard Mechanical RGB',
            'Monitor LED 24 Inch',
            'Pulpen Pilot Hitam',
            'Kertas HVS A4 70gsm',
            'Spidol Snowman Hitam',
            'Buku Tulis 38 Lembar',
            'Panci Stainless 20cm',
            'Wajan Alumunium 26cm',
            'Seng Gelombang 180x90cm',
            'Paku Beton 5cm 1kg',
            'Senter LED Taktis',
            'Tinta Printer Canon GI-790',
            'Isolasi Bening 1.5 inch',
        ];

        $products = [];
        foreach ($productNames as $index => $name) {
            $product = Product::factory()->create([
                'category_id' => ($index % 5) + 1,
                'supplier_id' => ($index % 4) + 1,
                'name' => $name,
                'sku' => 'SKU-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'stock' => rand(10, 200),
                'min_stock' => rand(5, 30),
                'price' => rand(5000, 500000),
            ]);
            $products[] = $product;
        }

        $lowStockProducts = [
            ['name' => 'Baterai AA 4pcs', 'stock' => 3, 'min_stock' => 10, 'price' => 25000],
            ['name' => 'Tisu Box 200sheets', 'stock' => 2, 'min_stock' => 15, 'price' => 15000],
            ['name' => 'Lampu LED 9 Watt', 'stock' => 5, 'min_stock' => 20, 'price' => 35000],
        ];

        foreach ($lowStockProducts as $index => $data) {
            Product::factory()->create([
                'category_id' => 1,
                'supplier_id' => ($index % 4) + 1,
                'name' => $data['name'],
                'sku' => 'SKU-LS-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'stock' => $data['stock'],
                'min_stock' => $data['min_stock'],
                'price' => $data['price'],
            ]);
        }

        $pegawai = User::where('role', Role::PEGAWAI)->first();
        
        foreach ($products as $product) {
            StockTransaction::factory()->stockIn()->create([
                'product_id' => $product->id,
                'user_id' => $pegawai->id,
                'quantity' => $product->stock,
                'note' => 'Stok awal',
            ]);
        }
    }
}
