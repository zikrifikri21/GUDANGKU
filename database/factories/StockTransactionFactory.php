<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StockTransactionFactory extends Factory
{
    protected $model = StockTransaction::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['in', 'out']);
        
        return [
            'product_id' => Product::factory(),
            'user_id' => User::factory()->pegawai(),
            'type' => $type,
            'quantity' => fake()->numberBetween(1, 100),
            'note' => fake()->optional()->sentence(),
        ];
    }

    public function stockIn(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'in',
        ]);
    }

    public function stockOut(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'out',
        ]);
    }
}
