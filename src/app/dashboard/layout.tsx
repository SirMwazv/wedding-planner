import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

import { getCurrentCouple } from '@/lib/supabase/server';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const coupleData = await getCurrentCouple();
    const coupleName = coupleData?.couple.name;

    return (
        <div className="dashboard-layout">
            {/* Desktop sidebar — hidden on mobile via CSS */}
            <div className="sidebar-desktop">
                <Sidebar coupleName={coupleName} />
            </div>

            {/* Mobile nav — visible on mobile only */}
            <MobileNav>
                <Sidebar coupleName={coupleName} />
            </MobileNav>

            <main className="dashboard-content">
                {children}
            </main>
        </div>
    );
}
