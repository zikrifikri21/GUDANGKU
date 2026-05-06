<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\StockTransaction;

class StockTransactionCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public StockTransaction $transaction
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('warehouse'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'stock.transaction.created';
    }

    public function broadcastWith(): array
    {
        return [
            'transaction_id' => $this->transaction->id,
            'product_id' => $this->transaction->product_id,
            'user_id' => $this->transaction->user_id,
            'type' => $this->transaction->type,
            'quantity' => $this->transaction->quantity,
            'note' => $this->transaction->note,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}