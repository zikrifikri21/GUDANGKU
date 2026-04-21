import { useRealtime, StockUpdatedPayload } from '@/components/realtime-provider';

export type { StockUpdatedPayload };

export function useRealtimeStock() {
    const { isConnected, lastStockEvent } = useRealtime();

    return {
        lastStockEvent,
        isConnected,
    };
}