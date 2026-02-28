'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/actions/auth';
import ThemeToggle from '@/components/ThemeToggle';

interface SidebarProps {
    coupleName?: string;
    weddingDate?: string;
}

export default function Sidebar({ coupleName, weddingDate }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/dashboard/events', label: 'Events', icon: '📅' },
        { href: '/dashboard/suppliers', label: 'Suppliers', icon: '👥' },
        { href: '/dashboard/budget', label: 'Budget', icon: '💼' },
        { href: '/dashboard/inspiration', label: 'Inspiration', icon: '📸' },
        { href: '/dashboard/tasks', label: 'Tasks', icon: '✅' },
    ];

    const bottomItems = [
        { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">💍</div>
                <h1>This Is Us</h1>
            </div>

            <div className="event-selector">
                <div className="event-selector-dot" />
                <div className="event-selector-info">
                    <div className="event-selector-name">{coupleName || 'My Wedding'}</div>
                    <div className="event-selector-date">{weddingDate || 'Date not set'}</div>
                </div>
                <span className="event-selector-chevron">▾</span>
            </div>

            <nav className="sidebar-section">
                <div className="sidebar-section-title">Navigation</div>
                <ul className="sidebar-nav">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                            >
                                <span className="sidebar-link-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="sidebar-section-title" style={{ marginTop: 'var(--space-md)' }}>Account</div>
                <ul className="sidebar-nav">
                    {bottomItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                            >
                                <span className="sidebar-link-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
                    <ThemeToggle />
                    <form action={signOut}>
                        <button type="submit" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            <span className="sidebar-link-icon">🚪</span>
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}
