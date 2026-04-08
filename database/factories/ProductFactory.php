<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $units = ['pcs', 'box', 'kg', 'liter', 'meter', 'roll'];
        
        return [
            'category_id' => Category::factory(),
            'supplier_id' => Supplier::factory(),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####-??')),
            'name' => str_replace('.', '', ucwords(fake()->sentence(3))), 
            'description' => fake()->paragraph(),
            'stock' => fake()->numberBetween(0, 500),
            'unit' => fake()->randomElement($units),
            'min_stock' => fake()->numberBetween(5, 50),
            'price' => fake()->numberBetween(10, 500) * 1000,
        ];
    }

    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock' => fake()->numberBetween(1, 5),
        ]);
    }
}
