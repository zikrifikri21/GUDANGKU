import { usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';
import { useWarehouseRealtime, showSonnerToast } from '@/hooks/use-reverb';

interface AuthPageProps extends PageProps {
    auth?: { user: { id: number; name: string } };
}

interface RealtimeToastsProps {
    onStockTransaction?: (data: Record<string, unknown>) => void;
    onLowStockAlert?: (data: Record<string, unknown>) => void;
    onProductCreated?: (data: Record<string, unknown>) => void;
    onProductUpdated?: (data: Record<string, unknown>) => void;
    onProductDeleted?: (data: Record<string, unknown>) => void;
}

export function RealtimeToasts(props: RealtimeToastsProps) {
    const { props: pageProps } = usePage<AuthPageProps>();
    const currentUserId = pageProps.auth?.user?.id;

    useWarehouseRealtime({
    onStockTransaction: (data) => {
        const actorId = (data as any).actor_id;
        if (actorId === currentUserId) return;

        // Backend kirim "masuk"/"keluar", bukan "in"/"out"
        const isIn   = (data as any).type === 'masuk';
        const type   = isIn ? 'success' : 'error';
        const action = isIn ? 'Masuk' : 'Keluar';

        // Field-nya product_name, bukan product.name
        const productName = (data as any).product_name ?? 'Unknown';
        const quantity    = (data as any).quantity ?? '';

        showSonnerToast({
            title:   `Stok ${action}`,
            message: `${productName} - ${quantity} unit`,
            type,
        });

        props.onStockTransaction?.(data);
    },

        onLowStockAlert: (data) => {
            console.log('⚠️ Low stock data:', JSON.stringify(data, null, 2));

            const name  = (data as any).name ?? (data as any).product?.name ?? 'Unknown';
            const stock = (data as any).stock ?? (data as any).current_stock ?? 0;

            showSonnerToast({
                title:   'Peringatan Stok Menipis',
                message: `${name} - Stok: ${stock}`,
                type:    'warning',
            });

            props.onLowStockAlert?.(data);
        },

        onProductCreated: (data) => {
            console.log('✅ Product created data:', JSON.stringify(data, null, 2));

            const name = (data as any).name ?? (data as any).product?.name ?? 'Unknown';

            showSonnerToast({
                title:   'Produk Baru',
                message: `${name} berhasil ditambahkan`,
                type:    'success',
            });

            props.onProductCreated?.(data);
        },

        onProductUpdated: (data) => {
            console.log('✏️ Product updated data:', JSON.stringify(data, null, 2));

            if ((data as any).actor_id === currentUserId) return;

            const name = (data as any).name ?? (data as any).product?.name ?? 'Unknown';

            showSonnerToast({
                title:   'Produk Diperbarui',
                message: `${name} telah diperbarui`,
                type:    'info',
            });

            props.onProductUpdated?.(data);
        },

        onProductDeleted: (data) => {
            console.log('🗑️ Product deleted data:', JSON.stringify(data, null, 2));

            if ((data as any).actor_id === currentUserId) return;

            const name = (data as any).name ?? (data as any).product?.name ?? 'Unknown';

            showSonnerToast({
                title:   'Produk Dihapus',
                message: `${name} telah dihapus`,
                type:    'error',
            });

            props.onProductDeleted?.(data);
        },
    });

    return null;
}