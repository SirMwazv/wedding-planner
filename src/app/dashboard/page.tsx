import { getCurrentCouple, createClient } from '@/lib/supabase/server';
import CoupleRequired from '@/components/CoupleRequired';
import { getEvents } from '@/lib/actions/events';
import { getAllSuppliers } from '@/lib/actions/suppliers';
import { getAllTasks } from '@/lib/actions/tasks';
import { calculateBudgetSummary } from '@/lib/utils/budget';
import { formatCurrency, formatRelativeDate } from '@/lib/utils/currency';
import Link from 'next/link';
import type { Currency, SupplierStatus, Quote, Supplier } from '@/lib/types/database';

const CEREMONY_COLORS: Record<string, string> = {
    white_wedding: 'green',
    traditional: 'orange',
    kitchen_party: 'purple',
    lobola: 'gold',
    umembeso: 'orange',
    engagement: 'green',
    other: 'green',
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Partner';

    const coupleData = await getCurrentCouple();
    if (!coupleData) return <CoupleRequired />;

    const { couple } = coupleData;
    const currency = couple.primary_currency as Currency;
    const events = await getEvents();
    const suppliers = await getAllSuppliers();
    const tasks = await getAllTasks();

    // Budget calculation
    const suppliersWithQuotes = suppliers.map((s: Supplier & { quotes?: Quote[] }) => ({
        ...s,
        quotes: (s.quotes || []) as Quote[],
    }));
    const budget = calculateBudgetSummary(suppliersWithQuotes, currency);

    // Supplier status counts
    const statusCounts: Record<string, number> = {};
    suppliers.forEach((s: Supplier) => {
        statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    });

    // Pending tasks
    const pendingTasks = tasks.filter((t: { status: string }) => t.status !== 'completed').length;

    // Upcoming payments
    const upcomingPayments = suppliers
        .flatMap((s: Supplier & { quotes?: Quote[] }) =>
            (s.quotes || [])
                .filter((q: Quote) => q.due_date && q.outstanding_balance > 0)
                .map((q: Quote) => ({
                    supplierName: s.name,
                    amount: q.outstanding_balance,
                    currency: q.currency as Currency,
                    dueDate: q.due_date,
                }))
        )
        .sort((a: { dueDate: string | null }, b: { dueDate: string | null }) =>
            new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
        )
        .slice(0, 5);

    // Days until next event
    const nextEvent = events.find((e: { date: string | null }) => e.date && new Date(e.date) > new Date());
    const daysUntil = nextEvent?.date
        ? Math.ceil((new Date(nextEvent.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
    const nextEventName = (nextEvent as { name?: string } | undefined)?.name || 'Wedding';

    // Per-event budget
    const eventBudgets = events.map((e: { id: string; name: string; type: string }) => {
        const eventSuppliers = suppliersWithQuotes.filter((s: { event_id: string }) => s.event_id === e.id);
        const quoted = eventSuppliers.reduce((sum: number, s: { quotes: Quote[] }) =>
            sum + s.quotes.reduce((qs: number, q: Quote) => qs + Number(q.amount), 0), 0);
        const paid = eventSuppliers.reduce((sum: number, s: { quotes: Quote[] }) =>
            sum + s.quotes.reduce((qs: number, q: Quote) => qs + Number(q.deposit_paid), 0), 0);
        return { id: e.id, name: e.name, type: e.type, quoted, paid, percent: quoted > 0 ? Math.round((paid / quoted) * 100) : 0 };
    });

    return (
        <>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p>{nextEventName} · {daysUntil !== null ? `${daysUntil} days away` : 'No date set'}</p>
                </div>
                <div className="page-header-actions">
                    <Link href="/dashboard/suppliers/new" className="btn btn-primary">+ Add Supplier</Link>
                </div>
            </div>

            {/* Welcome Hero */}
            <div className="welcome-hero">
                <div>
                    <h3>Welcome back, {displayName}</h3>
                    <p>You have {pendingTasks} pending tasks and {upcomingPayments.length} upcoming payments this month.</p>
                </div>
                {daysUntil !== null && (
                    <div className="welcome-hero-countdown">
                        <div className="countdown-number">{daysUntil}</div>
                        <div className="countdown-label">days until {nextEventName}</div>
                    </div>
                )}
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">💲</div>
                    <div className="stat-value">{formatCurrency(budget.total_quoted, currency)}</div>
                    <div className="stat-label">Total Budget</div>
                    <div className="stat-subtitle">Across {events.length} events</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-value">{formatCurrency(budget.total_deposits_paid > 0 ? budget.total_quoted - budget.total_outstanding : 0, currency)}</div>
                    <div className="stat-label">Total Booked</div>
                    <div className="stat-subtitle">{budget.booked_count} confirmed suppliers</div>
                    {budget.total_quoted > 0 && (
                        <div className="stat-badge">{Math.round(((budget.total_quoted - budget.total_outstanding) / budget.total_quoted) * 100)}% of budget</div>
                    )}
                </div>

                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{formatCurrency(budget.total_deposits_paid, currency)}</div>
                    <div className="stat-label">Total Paid</div>
                    <div className="stat-subtitle">Across all events</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🕐</div>
                    <div className="stat-value">{formatCurrency(budget.total_outstanding, currency)}</div>
                    <div className="stat-label">Outstanding</div>
                    <div className="stat-subtitle">Remaining balance</div>
                </div>
            </div>

            {/* Budget Overview */}
            <div className="panel">
                <div className="panel-header">
                    <div>
                        <div className="panel-title">Budget Overview</div>
                        <div className="text-sm text-muted mt-sm">Across all {events.length} events</div>
                    </div>
                    <Link href="/dashboard/budget" className="card-link">View details ↗</Link>
                </div>
                <div className="panel-body">
                    {eventBudgets.map((eb) => (
                        <div key={eb.id} className="budget-row">
                            <div className={`budget-dot ${CEREMONY_COLORS[eb.type] || 'green'}`} />
                            <div className="budget-event-name">{eb.name}</div>
                            <div className="budget-progress-wrap">
                                <div
                                    className={`budget-progress-fill ${CEREMONY_COLORS[eb.type] || 'green'}`}
                                    style={{ width: `${Math.min(100, eb.percent)}%` }}
                                />
                            </div>
                            <div className="budget-amounts">
                                {formatCurrency(eb.paid, currency)} of {formatCurrency(eb.quoted, currency)}
                            </div>
                            <div className="budget-percent">{eb.percent}%</div>
                        </div>
                    ))}

                    {/* Budget footer */}
                    <div className="budget-footer">
                        <div className="budget-footer-item">
                            <div className="budget-footer-label">Total Budget</div>
                            <div className="budget-footer-value">{formatCurrency(budget.total_quoted, currency)}</div>
                        </div>
                        <div className="budget-footer-item">
                            <div className="budget-footer-label">Spent</div>
                            <div className="budget-footer-value">{formatCurrency(budget.total_quoted - budget.total_outstanding, currency)}</div>
                        </div>
                        <div className="budget-footer-item">
                            <div className="budget-footer-label">Paid Out</div>
                            <div className="budget-footer-value paid">{formatCurrency(budget.total_deposits_paid, currency)}</div>
                        </div>
                        <div className="budget-footer-item">
                            <div className="budget-footer-label">Remaining</div>
                            <div className="budget-footer-value remaining">{formatCurrency(budget.total_outstanding, currency)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Suppliers + Upcoming Payments */}
            <div className="grid-2">
                {/* Suppliers */}
                <div className="panel">
                    <div className="panel-header">
                        <span className="panel-title">Suppliers</span>
                        <Link href="/dashboard/suppliers" className="card-link">View all →</Link>
                    </div>
                    <div className="panel-body">
                        {suppliers.length === 0 ? (
                            <p className="text-sm text-muted">No suppliers added yet</p>
                        ) : (
                            suppliers.slice(0, 4).map((s: Supplier & { quotes?: Quote[] }) => (
                                <div key={s.id} className="list-item">
                                    <div className="list-item-content">
                                        <div className="list-item-title">{s.name}</div>
                                        <div className="list-item-subtitle">{s.category || 'Uncategorized'}</div>
                                    </div>
                                    <span className={`badge ${s.status === 'booked' ? 'badge-success' :
                                        s.status === 'negotiating' ? 'badge-warning' :
                                            s.status === 'rejected' ? 'badge-danger' :
                                                'badge-info'
                                        }`}>
                                        <span className="badge-dot" />
                                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcoming Payments */}
                <div className="panel">
                    <div className="panel-header">
                        <span className="panel-title">Upcoming Payments</span>
                        {upcomingPayments.length > 0 && (
                            <span className="badge badge-danger">
                                <span className="badge-dot" />
                                {upcomingPayments.length} due
                            </span>
                        )}
                    </div>
                    <div className="panel-body">
                        {upcomingPayments.length === 0 ? (
                            <p className="text-sm text-muted">No upcoming payments</p>
                        ) : (
                            upcomingPayments.map((p: { supplierName: string; amount: number; currency: Currency; dueDate: string | null }, i: number) => (
                                <div key={i} className="list-item">
                                    <div className="list-item-content">
                                        <div className="list-item-title">{p.supplierName}</div>
                                        <div className="list-item-subtitle">{formatRelativeDate(p.dueDate)}</div>
                                    </div>
                                    <div className="list-item-right">
                                        <div className="cell-amount outstanding">{formatCurrency(p.amount, p.currency)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
