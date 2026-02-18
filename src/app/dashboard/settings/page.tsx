import { getCurrentCouple, createClient } from '@/lib/supabase/server';
import CoupleRequired from '@/components/CoupleRequired';

export default async function SettingsPage() {
    const coupleData = await getCurrentCouple();
    if (!coupleData) return <CoupleRequired />;

    const { couple, role, userId } = coupleData;

    // Get user data
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <div className="page-header">
                <div>
                    <h2>Settings</h2>
                    <p>Manage your wedding details and account</p>
                </div>
            </div>

            <div className="grid-2">
                {/* Wedding Details */}
                <div className="panel">
                    <div className="panel-header">
                        <span className="panel-title">Wedding Details</span>
                    </div>
                    <div className="panel-body">
                        <div className="list-item">
                            <div className="list-item-content">
                                <div className="list-item-subtitle">Couple Name</div>
                                <div className="list-item-title">{couple.name || '—'}</div>
                            </div>
                        </div>
                        <div className="list-item">
                            <div className="list-item-content">
                                <div className="list-item-subtitle">Currency</div>
                                <div className="list-item-title">{couple.primary_currency}</div>
                            </div>
                        </div>
                        <div className="list-item">
                            <div className="list-item-content">
                                <div className="list-item-subtitle">Your Role</div>
                                <div className="list-item-title" style={{ textTransform: 'capitalize' }}>{role}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account */}
                <div className="panel">
                    <div className="panel-header">
                        <span className="panel-title">Account</span>
                    </div>
                    <div className="panel-body">
                        <div className="list-item">
                            <div className="list-item-content">
                                <div className="list-item-subtitle">Email</div>
                                <div className="list-item-title">{user?.email || '—'}</div>
                            </div>
                        </div>
                        <div className="list-item">
                            <div className="list-item-content">
                                <div className="list-item-subtitle">Account ID</div>
                                <div className="list-item-title font-mono text-sm">{userId.slice(0, 8)}...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
