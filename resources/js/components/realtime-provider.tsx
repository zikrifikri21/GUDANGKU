import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useWarehouseRealtime, useBrowserNotification, showSonnerToast } from '@/hooks/use-reverb';

export interface StockUpdatedPayload {
    product_id: number;
    product_name: string;
    type: 'masuk' | 'keluar' | 'in' | 'out';
    quantity: number;
    stock_remaining: number;
    actor_id: number;
    actor_name: string;
    timestamp: string;
}

export interface ProductEventPayload {
    event: 'product.created' | 'product.updated' | 'product.deleted';
    product_id: number;
    name?: string;
    sku?: string;
    stock?: number;
    min_stock?: number;
    actor_id?: number;
    actor_name?: string;
    timestamp: string;
}

interface RealtimeContextValue {
    isConnected: boolean;
    requestPermission: () => Promise<boolean>;
    permission: NotificationPermission;
    isSupported: boolean;
    lastStockEvent: StockUpdatedPayload | null;
    lastProductEvent: ProductEventPayload | null;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const getCurrentUserId = (): number | undefined => {
    const meta = document.querySelector('meta[name="user-id"]');
    return meta ? Number(meta.getAttribute('content')) : undefined;
};

export function RealtimeProvider({ children }: { children: ReactNode }) {
    const {
        requestPermission: requestBrowserPermission,
        permission,
        isSupported,
        sendNotification,
    } = useBrowserNotification();

    const [localPermission, setLocalPermission] = useState<NotificationPermission>(permission);
    const [lastStockEvent, setLastStockEvent] = useState<StockUpdatedPayload | null>(null);
    const [lastProductEvent, setLastProductEvent] = useState<ProductEventPayload | null>(null);

    useEffect(() => {
        setLocalPermission(permission);
    }, [permission]);

    useEffect(() => {
        if (localPermission !== 'default') return;
        const timer = setTimeout(() => {
            requestBrowserPermission().then((result) => {
                setLocalPermission(result ? 'granted' : 'denied');
            });
        }, 2000);
        return () => clearTimeout(timer);
    }, [localPermission, requestBrowserPermission]);

    const handleStockTransaction = useCallback((data: Record<string, unknown>) => {
        const currentUserId = getCurrentUserId();
        if ((data as any).actor_id === currentUserId) return;

        const isIn = (data as any).type === 'masuk' || (data as any).type === 'in';
        const productName = (data as any).product_name ?? 'Unknown';
        const quantity = (data as any).quantity ?? '';
        const title = `Stok ${isIn ? 'Masuk' : 'Keluar'}`;
        const message = `${productName} - ${quantity} unit`;

        setLastStockEvent(data as unknown as StockUpdatedPayload);

        showSonnerToast({ title, message, type: isIn ? 'success' : 'error' });
        sendNotification(title, { body: message, tag: 'stock-transaction' });
    }, [sendNotification]);

    const handleLowStockAlert = useCallback((data: Record<string, unknown>) => {
        const name = (data as any).name ?? 'Unknown';
        const stock = (data as any).stock ?? 0;
        const title = 'Peringatan Stok Menipis';
        const message = `${name} - Stok: ${stock}`;

        showSonnerToast({ title, message, type: 'warning' });
        sendNotification(title, { body: message, tag: 'low-stock' });
    }, [sendNotification]);

    const handleProductCreated = useCallback((data: Record<string, unknown>) => {
        const name = (data as any).name ?? 'Unknown';
        const title = 'Produk Baru';
        const message = `${name} berhasil ditambahkan`;

        setLastProductEvent({
            event: 'product.created',
            product_id: (data as any).product_id,
            name: (data as any).name,
            sku: (data as any).sku,
            stock: (data as any).stock,
            min_stock: (data as any).min_stock,
            actor_id: (data as any).actor_id,
            actor_name: (data as any).actor_name,
            timestamp: (data as any).timestamp,
        });

        showSonnerToast({ title, message, type: 'success' });
        sendNotification(title, { body: message, tag: 'product' });
    }, [sendNotification]);

    const handleProductUpdated = useCallback((data: Record<string, unknown>) => {
        const currentUserId = getCurrentUserId();
        if ((data as any).actor_id === currentUserId) return;

        const name = (data as any).name ?? 'Unknown';
        const title = 'Produk Diperbarui';
        const message = `${name} telah diperbarui`;

        setLastProductEvent({
            event: 'product.updated',
            product_id: (data as any).product_id,
            name: (data as any).name,
            sku: (data as any).sku,
            stock: (data as any).stock,
            min_stock: (data as any).min_stock,
            actor_id: (data as any).actor_id,
            actor_name: (data as any).actor_name,
            timestamp: (data as any).timestamp,
        });

        showSonnerToast({ title, message, type: 'info' });
        sendNotification(title, { body: message, tag: 'product' });
    }, [sendNotification]);

    const handleProductDeleted = useCallback((data: Record<string, unknown>) => {
        const currentUserId = getCurrentUserId();
        if ((data as any).actor_id === currentUserId) return;

        const name = (data as any).name ?? 'Unknown';
        const title = 'Produk Dihapus';
        const message = `${name} telah dihapus`;

        setLastProductEvent({
            event: 'product.deleted',
            product_id: (data as any).product_id,
            name: (data as any).name,
            actor_id: (data as any).actor_id,
            actor_name: (data as any).actor_name,
            timestamp: (data as any).timestamp,
        });

        showSonnerToast({ title, message, type: 'error' });
        sendNotification(title, { body: message, tag: 'product' });
    }, [sendNotification]);

    const { isConnected } = useWarehouseRealtime({
        onStockTransaction: handleStockTransaction,
        onLowStockAlert: handleLowStockAlert,
        onProductCreated: handleProductCreated,
        onProductUpdated: handleProductUpdated,
        onProductDeleted: handleProductDeleted,
    });

    const requestPermission = async () => {
        const result = await requestBrowserPermission();
        setLocalPermission(result ? 'granted' : 'denied');
        return result;
    };

    return (
        <RealtimeContext.Provider value={{
            isConnected,
            requestPermission,
            permission: localPermission,
            isSupported,
            lastStockEvent,
            lastProductEvent,
        }}>
            {isSupported && localPermission === 'default' && (
                <button
                    onClick={requestPermission}
                    className="fixed bottom-20 right-4 z-[9999] rounded-lg px-3 py-2 text-sm bg-secondary border border-input cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    🔔 Aktifkan notifikasi browser
                </button>
            )}
            {children}
        </RealtimeContext.Provider>
    );
}

export function useRealtime() {
    const context = useContext(RealtimeContext);

    if (!context) {
        throw new Error('useRealtime must be used within RealtimeProvider');
    }

    return context;
}