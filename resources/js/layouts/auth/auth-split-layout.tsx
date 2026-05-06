import { Link, usePage } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
            `}</style>

            <div className="relative grid h-dvh items-center justify-center lg:max-w-none lg:grid-cols-[260px_1fr] lg:px-0"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
                {/* ── Sidebar kiri ── */}
                <aside
                    className="relative hidden h-full flex-col lg:flex"
                    style={{ background: '#1a1a18', padding: '2.5rem 2rem', overflow: 'hidden' }}
                >
                    {/* Tekstur diagonal */}
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage:
                                'repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(255,255,255,0.018) 28px, rgba(255,255,255,0.018) 29px)',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Logo */}
                    <Link
                        href={home()}
                        className="relative z-10 flex flex-col"
                        style={{ marginBottom: 'auto', textDecoration: 'none' }}
                    >
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                background: '#e8b84b',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '12px',
                            }}
                        >
                            <WarehouseIcon />
                        </div>
                        <span
                            style={{
                                fontFamily: "'Syne', system-ui, sans-serif",
                                fontWeight: 800,
                                fontSize: '20px',
                                color: '#f5f2eb',
                                letterSpacing: '-0.5px',
                                lineHeight: 1,
                            }}
                        >
                            {name}
                        </span>
                        <span
                            style={{
                                fontSize: '10px',
                                color: '#666',
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                                marginTop: '4px',
                            }}
                        >
                            Inventory System
                        </span>
                    </Link>

                    {/* Ilustrasi rak — absolute di bagian bawah */}
                    <ShelfIllustration />

                    {/* Tagline fitur */}
                    <ul
                        aria-label="Fitur utama"
                        className="relative z-10"
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '0 0 6rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                        }}
                    >
                        {['Manajemen stok', 'Laporan real-time', 'Multi gudang'].map((f) => (
                            <li
                                key={f}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '12px',
                                    color: '#666',
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#e8b84b',
                                        opacity: 0.5,
                                        flexShrink: 0,
                                        display: 'inline-block',
                                    }}
                                />
                                {f}
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* ── Konten utama (form) ── */}
                <div className="w-full px-8 py-12 lg:p-8" style={{ background: 'white', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">

                        {/* Logo mobile (hanya tampil di bawah lg) */}
                        <Link
                            href={home()}
                            className="relative z-20 flex items-center justify-center lg:hidden"
                            style={{ gap: '8px', textDecoration: 'none' }}
                        >
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    background: '#1a1a18',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <WarehouseIcon color="#e8b84b" />
                            </div>
                            <span
                                style={{
                                    fontFamily: "'Syne', system-ui, sans-serif",
                                    fontWeight: 800,
                                    fontSize: '18px',
                                    color: '#1a1a18',
                                }}
                            >
                                {name}
                            </span>
                        </Link>

                        {/* Badge status */}
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <span
                                aria-label="Status sistem aktif"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: '#fef7e8',
                                    color: '#a06800',
                                    fontSize: '10px',
                                    fontWeight: 500,
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    padding: '3px 10px',
                                    borderRadius: '20px',
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#e8b84b',
                                        display: 'inline-block',
                                    }}
                                />
                                Sistem Aktif
                            </span>
                        </div>

                        {/* Judul & deskripsi */}
                        <div className="flex flex-col items-start gap-1 text-left">
                            <h1
                                style={{
                                    fontFamily: "'Syne', system-ui, sans-serif",
                                    fontWeight: 700,
                                    fontSize: '22px',
                                    color: '#1a1a18',
                                    letterSpacing: '-0.5px',
                                    margin: 0,
                                }}
                            >
                                {title}
                            </h1>
                            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                                {description}
                            </p>
                        </div>

                        {/* Form slot */}
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── SVG Components ───────────────────────────────────────────────────────────

export function WarehouseIcon({ color = '#1a1a18' }: { color?: string }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="10" width="20" height="11" rx="1.5" fill={color} />
            <path d="M2 10L5 4h14l3 6" stroke={color} strokeWidth="1.5" fill="none" />
            <rect x="9" y="14" width="6" height="7" rx="0.5" fill={color} />
        </svg>
    );
}

function ShelfIllustration() {
    return (
        <svg
            viewBox="0 0 260 80"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                height: '80px',
                opacity: 0.35,
                zIndex: 1,
            }}
        >
            <rect x="0" y="40" width="260" height="3" fill="#e8b84b" />
            <rect x="10" y="20" width="22" height="20" rx="2" fill="#444" />
            <rect x="36" y="25" width="16" height="15" rx="2" fill="#555" />
            <rect x="56" y="18" width="28" height="22" rx="2" fill="#444" />
            <rect x="88" y="22" width="20" height="18" rx="2" fill="#555" />
            <rect x="112" y="16" width="24" height="24" rx="2" fill="#444" />
            <rect x="140" y="24" width="18" height="16" rx="2" fill="#555" />
            <rect x="162" y="20" width="26" height="20" rx="2" fill="#444" />
            <rect x="192" y="26" width="20" height="14" rx="2" fill="#555" />
            <rect x="216" y="20" width="18" height="20" rx="2" fill="#444" />
            <rect x="238" y="24" width="16" height="16" rx="2" fill="#555" />
            <rect x="0" y="72" width="260" height="3" fill="#e8b84b" />
        </svg>
    );
}