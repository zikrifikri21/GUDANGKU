import { useEffect, useCallback, useRef, useState } from 'react';
import {
    toast,
    Toaster
    
} from 'sonner';
import type {ExternalToast} from 'sonner';

interface ReverbMessage {
    event: string;
    data: Record<string, unknown>;
}

interface UseReverbOptions {
    channel: string;
    onMessage?: (message: ReverbMessage) => void;
    onStockTransaction?: (data: Record<string, unknown>) => void;
    onLowStockAlert?: (data: Record<string, unknown>) => void;
    onProductCreated?: (data: Record<string, unknown>) => void;
    onProductUpdated?: (data: Record<string, unknown>) => void;
    onProductDeleted?: (data: Record<string, unknown>) => void;
    onCounterIncremented?: (data: Record<string, unknown>) => void;
}

export function useReverb(options: UseReverbOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
    const [echoReady, setEchoReady] = useState(false);

    const channelRef = useRef<any>(null);
    const subscribedRef = useRef(false);

    const onMessageRef = useRef(options.onMessage);
    const onStockTransactionRef = useRef(options.onStockTransaction);
    const onLowStockAlertRef = useRef(options.onLowStockAlert);
    const onProductCreatedRef = useRef(options.onProductCreated);
    const onProductUpdatedRef = useRef(options.onProductUpdated);
    const onProductDeletedRef = useRef(options.onProductDeleted);
    const onCounterIncrementedRef = useRef(options.onCounterIncremented);

    useEffect(() => {
        onMessageRef.current = options.onMessage;
        onStockTransactionRef.current = options.onStockTransaction;
        onLowStockAlertRef.current = options.onLowStockAlert;
        onProductCreatedRef.current = options.onProductCreated;
        onProductUpdatedRef.current = options.onProductUpdated;
        onProductDeletedRef.current = options.onProductDeleted;
        onCounterIncrementedRef.current = options.onCounterIncremented;
    });

    useEffect(() => {
        if ((globalThis as any).Echo) {
            setEchoReady(true);
            return;
        }

        const checkEcho = setInterval(() => {
            if ((globalThis as any).Echo) {
                setEchoReady(true);
                clearInterval(checkEcho);
            }
        }, 100);

        return () => clearInterval(checkEcho);
    }, []);

    useEffect(() => {
        if (!echoReady || subscribedRef.current) return;

        const echo = (globalThis as any).Echo;
        if (!echo) return;

        const { channel } = options;
        console.log('📡 Subscribing to channel:', channel);
        subscribedRef.current = true;

        try {
            channelRef.current = echo.channel(channel);

            channelRef.current
                .listen('.stock.updated', (data: Record<string, unknown>) => {
                    console.log('✅ StockUpdated received:', data);
                    onStockTransactionRef.current?.(data);
                    onMessageRef.current?.({ event: 'stock-transaction', data });
                })
                .listen('.stock.transaction.created', (data: Record<string, unknown>) => {
                    console.log('✅ StockTransactionCreated received:', data);
                    onStockTransactionRef.current?.(data);
                    onMessageRef.current?.({ event: 'stock-transaction', data });
                })
                .listen('low.stock.alert', (data: Record<string, unknown>) => {
                    console.log('✅ LowStockAlert received:', data);
                    onLowStockAlertRef.current?.(data);
                    onMessageRef.current?.({ event: 'low-stock-alert', data });
                })
                .listen('product.created', (data: Record<string, unknown>) => {
                    console.log('✅ ProductCreated received:', data);
                    onProductCreatedRef.current?.(data);
                    onMessageRef.current?.({ event: 'product-created', data });
                })
                .listen('product.updated', (data: Record<string, unknown>) => {
                    console.log('✅ ProductUpdated received:', data);
                    onProductUpdatedRef.current?.(data);
                    onMessageRef.current?.({ event: 'product-updated', data });
                })
                .listen('product.deleted', (data: Record<string, unknown>) => {
                    console.log('✅ ProductDeleted received:', data);
                    onProductDeletedRef.current?.(data);
                    onMessageRef.current?.({ event: 'product-deleted', data });
                });

            if (echo.connector?.pusher) {
                echo.connector.pusher.connection.bind('connected', () => {
                    console.log('✅ Reverb connected');
                    setConnectionState('connected');
                    setIsConnected(true);
                });
                echo.connector.pusher.connection.bind('disconnected', () => {
                    console.log('❌ Reverb disconnected');
                    setConnectionState('disconnected');
                    setIsConnected(false);
                });
                echo.connector.pusher.connection.bind('connecting', () => {
                    console.log('⏳ Connecting to Reverb...');
                    setConnectionState('connecting');
                });
                echo.connector.pusher.connection.bind('connection_failed', () => {
                    console.log('❌ Reverb connection failed');
                    setConnectionState('disconnected');
                    setIsConnected(false);
                });
            }
        } catch (error) {
            console.error('Error subscribing to channel:', error);
            subscribedRef.current = false;
        }

        return () => {
            console.log('🧹 Cleaning up channel subscription');
            try {
                channelRef.current?.unbindAll?.();
                channelRef.current?.unlistenAll?.();
                (globalThis as any).Echo?.leaveChannel?.(channel);
            } catch (e) {
                console.log('Cleanup warning:', e);
            }
            channelRef.current = null;
            subscribedRef.current = false;
            setIsConnected(false);
            setConnectionState('disconnected');
        };
    }, [echoReady, options.channel]);

    return { isConnected, connectionState };
}

export function useBrowserNotification() {
    const isSupported = typeof window !== 'undefined' && 'Notification' in window;

    const [permission, setPermission] = useState<NotificationPermission>(() => {
        return isSupported ? Notification.permission : 'default';
    });

    useEffect(() => {
        if (!isSupported) return;
        setPermission(Notification.permission);
    }, [isSupported]);

    const requestPermission = useCallback(async () => {
        if (!isSupported) return false;
        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
    }, [isSupported]);

    const sendNotification = useCallback(
        (title: string, options?: NotificationOptions) => {
            if (isSupported && permission === 'granted') {
                return new Notification(title, {
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    ...options,
                });
            }
            return null;
        },
        [isSupported, permission]
    );

    return { permission, isSupported, requestPermission, sendNotification };
}

interface NotificationOptions {
    body?: string;
    icon?: string;
    tag?: string;
    data?: Record<string, unknown>;
    requireInteraction?: boolean;
}

export function useWarehouseRealtime(options: {
    onStockTransaction?: (data: Record<string, unknown>) => void;
    onLowStockAlert?: (data: Record<string, unknown>) => void;
    onProductCreated?: (data: Record<string, unknown>) => void;
    onProductUpdated?: (data: Record<string, unknown>) => void;
    onProductDeleted?: (data: Record<string, unknown>) => void;
    onCounterIncremented?: (data: Record<string, unknown>) => void;
}) {
    const { sendNotification, requestPermission, permission } = useBrowserNotification();
    const [messages, setMessages] = useState<ReverbMessage[]>([]);

    const onStockTransactionRef = useRef(options.onStockTransaction);
    const onLowStockAlertRef = useRef(options.onLowStockAlert);
    const onProductCreatedRef = useRef(options.onProductCreated);
    const onProductUpdatedRef = useRef(options.onProductUpdated);
    const onProductDeletedRef = useRef(options.onProductDeleted);
    const onCounterIncrementedRef = useRef(options.onCounterIncremented);
    useEffect(() => {
        onStockTransactionRef.current = options.onStockTransaction;
        onLowStockAlertRef.current = options.onLowStockAlert;
        onProductCreatedRef.current = options.onProductCreated;
        onProductUpdatedRef.current = options.onProductUpdated;
        onProductDeletedRef.current = options.onProductDeleted;
        onCounterIncrementedRef.current = options.onCounterIncremented;
    });

    const handleMessage = useCallback((message: ReverbMessage) => {
        console.log('📨 handleMessage called:', message.event, message.data);
        setMessages((prev) => [...prev.slice(-49), message]);
    }, []);

    const { isConnected, connectionState } = useReverb({
        channel: 'warehouse',
        onMessage: handleMessage,
        onStockTransaction: onStockTransactionRef.current,
        onLowStockAlert: onLowStockAlertRef.current,
        onProductCreated: onProductCreatedRef.current,
        onProductUpdated: onProductUpdatedRef.current,
        onProductDeleted: onProductDeletedRef.current,
        onCounterIncremented: onCounterIncrementedRef.current,
    });

    return { isConnected, connectionState, messages, sendNotification, requestPermission, permission };
}

export interface SonnerToastProps {
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export function showSonnerToast(data: SonnerToastProps) {
    const { title, message, type = 'info', duration = 4000 } = data;

    const toastOptions: ExternalToast = {
        duration,
    };

    switch (type) {
        case 'success':
            toast.success(title, {
                ...toastOptions,
                description: message,
            });
            break;
        case 'error':
            toast.error(title, {
                ...toastOptions,
                description: message,
            });
            break;
        case 'warning':
            toast.warning(title, {
                ...toastOptions,
                description: message,
            });
            break;
        default:
            toast(title, {
                ...toastOptions,
                description: message,
            });
    }
}

export function SonnerToaster() {
    return (
        <Toaster
            position="bottom-right"
            richColors
            duration={4000}
            visibleToasts={5}
            closeButton
        />
    );
}