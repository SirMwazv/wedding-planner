import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dashboard-layout">
            {/* Desktop sidebar — hidden on mobile via CSS */}
            <div className="sidebar-desktop">
                <Sidebar />
            </div>

            {/* Mobile nav — visible on mobile only */}
            <MobileNav>
                <Sidebar />
            </MobileNav>

            <main className="dashboard-content">
                {children}
            </main>
        </div>
    );
}
