import { Link, usePage } from '@inertiajs/react';
import {
    Package,
    Users,
    LayoutGrid,
    ArrowDownToLine,
    ArrowUpFromLine,
    Tags,
    Truck,
    MessageSquare,
    TrendingUp,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { WarehouseIcon } from '@/layouts/auth/auth-split-layout';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: ('super_admin' | 'admin' | 'pegawai')[];
}

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Produk',
        href: '/products',
        icon: Package,
        roles: ['super_admin', 'admin'],
    },
    {
        title: 'Kategori',
        href: '/categories',
        icon: Tags,
        roles: ['super_admin', 'admin'],
    },
    {
        title: 'Supplier',
        href: '/suppliers',
        icon: Truck,
        roles: ['super_admin', 'admin'],
    },
    {
        title: 'Stok Masuk',
        href: '/stock?type=in',
        icon: ArrowDownToLine,
    },
    {
        title: 'Stok Keluar',
        href: '/stock?type=out',
        icon: ArrowUpFromLine,
    },
    {
        title: 'AI Chat',
        href: '/ai-chat',
        icon: MessageSquare,
        roles: ['super_admin', 'admin'],
    },
    {
        title: 'Pengguna',
        href: '/users',
        icon: Users,
        roles: ['super_admin'],
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: { role: string } | null } }>().props;
    const userRole = auth?.user?.role as 'super_admin' | 'admin' | 'pegawai' | undefined;

    const filteredNavItems = mainNavItems.filter((item) => {
        if (!item.roles) {
return true;
}

        return item.roles.includes(userRole as 'super_admin' | 'admin' | 'pegawai');
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div
                                    style={{
                                        width: '35px',
                                        height: '35px',
                                        background: '#e8b84b',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <WarehouseIcon />
                                </div>
                                {'Gudangku'}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems.map(item => ({
                    title: item.title,
                    href: item.href,
                    icon: item.icon,
                }))} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
