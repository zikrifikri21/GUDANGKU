<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $productId,
        public string $productName
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('warehouse'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'product.deleted';
    }

    public function broadcastWith(): array
    {
        $user = auth()->user();
        return [
            'product_id' => $this->productId,
            'name' => $this->productName,
            'actor_id' => $user?->id,
            'actor_name' => $user?->name ?? 'System',
            'timestamp' => now()->toIso8601String(),
        ];
    }
}