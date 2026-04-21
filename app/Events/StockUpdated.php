<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $productId,
        public string $productName,
        public string $type,
        public int $quantity,
        public int $stockRemaining,
        public ?int $actorId,
        public string $actorName
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('warehouse'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'stock.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'product_id' => $this->productId,
            'product_name' => $this->productName,
            'type' => $this->type,
            'quantity' => $this->quantity,
            'stock_remaining' => $this->stockRemaining,
            'actor_id' => $this->actorId,
            'actor_name' => $this->actorName,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}