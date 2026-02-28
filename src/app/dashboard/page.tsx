import { getCurrentCouple, createClient } from '@/lib/supabase/server';
import CoupleRequired from '@/components/CoupleRequired';
import { getEvents } from '@/lib/actions/events';
import { getAllSuppliers } from '@/lib/actions/suppliers';
import { getAllTasks, getAllMilestones } from '@/lib/actions/tasks';
import { formatCurrency, formatRelativeDate } from '@/lib/utils/currency';
import JubileeLine from '@/components/JubileeLine';
import Link from 'next/link';
import type { Currency, Supplier, Quote } from '@/lib/types/database';

const CEREMONY_COLORS: Record<string, string> = {
    white_wedding: 'var(--color-ceremony-white)',
    traditional: 'var(--color-ceremony-traditional)',
    kitchen_party: 'var(--color-ceremony-kitchen)',
    lobola: 'var(--color-ceremony-lobola)',
    umembeso: 'var(--color-ceremony-traditional)',
    umabo: 'var(--color-ceremony-traditional)',
    engagement: 'var(--color-ceremony-white)',
    other: 'var(--color-ceremony-white)',
};

const CEREMONY_ICONS: Record<string, string> = {
    white_wedding: '💒',
    traditional: '🪘',
    kitchen_party: '🎉',
    lobola: '🤝',
    umembeso: '🎁',
    umabo: '🎁',
    engagement: '💍',
    kurova_guva: '🕯️',
    other: '📅',
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
    const milestones = await getAllMilestones();

    // Pending tasks & upcoming payments
    const pendingTasks = tasks.filter((t: { status: string }) => t.status !== 'completed').length;
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

    // Per-event data with milestones
    type EventData = {
        id: string;
        name: string;
        type: string;
        date: string | null;
        daysUntil: number | null;
        quoted: number;
        paid: number;
        supplierCount: number;
        milestones: Array<{ id: string; title: string; status: string; due_date: string | null; sort_order: number }>;
    };

    const eventCards: EventData[] = events.map((e: { id: string; name: string; type: string; date: string | null }) => {
        const eventSuppliers = suppliers.filter((s: { event_id: string }) => s.event_id === e.id);
        const quoted = eventSuppliers.reduce((sum: number, s: Supplier) => sum + Number((s as any).quoted_amount || 0), 0);
        const paid = eventSuppliers.reduce((sum: number, s: Supplier) => sum + Number((s as any).paid_amount || 0), 0);
        const eventMilestones = milestones.filter((m: { event_id: string }) => m.event_id === e.id);

        const daysUntil = e.date ? Math.ceil((new Date(e.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

        return {
            id: e.id,
            name: e.name,
            type: e.type,
            date: e.date,
            daysUntil,
            quoted,
            paid,
            supplierCount: eventSuppliers.length,
            milestones: eventMilestones,
        };
    });

    // Sort: upcoming events first (by date), then events without dates
    eventCards.sort((a, b) => {
        if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (a.date) return -1;
        if (b.date) return 1;
        return 0;
    });

    // Overall totals
    const totalQuoted = eventCards.reduce((s, e) => s + e.quoted, 0);
    const totalPaid = eventCards.reduce((s, e) => s + e.paid, 0);

    return (
        <>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p>{events.length} ceremonies · {pendingTasks} pending tasks</p>
                </div>
                <div className="page-header-actions">
                    <Link href="/dashboard/events/new" className="btn btn-secondary">+ Add Event</Link>
                    <Link href="/dashboard/suppliers/new" className="btn btn-primary">+ Add Supplier</Link>
                </div>
            </div>

            {/* Welcome Hero */}
            <div className="welcome-hero">
                <div>
                    <h3>Welcome back, {displayName}</h3>
                    <p>
                        {pendingTasks} pending tasks · {upcomingPayments.length} upcoming payments
                        {totalQuoted > 0 && <> · {formatCurrency(totalPaid, currency)} of {formatCurrency(totalQuoted, currency)} paid</>}
                    </p>
                </div>
                {eventCards[0]?.daysUntil !== null && eventCards[0]?.daysUntil !== undefined && (
                    <div className="welcome-hero-countdown">
                        <div className="countdown-number">{eventCards[0].daysUntil}</div>
                        <div className="countdown-label">days until {eventCards[0].name}</div>
                    </div>
                )}
            </div>

            {/* Event Cards — one per ceremony */}
            {eventCards.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <h3>No events yet</h3>
                        <p>Add your first ceremony to get started</p>
                        <Link href="/dashboard/events/new" className="btn btn-primary">+ New Event</Link>
                    </div>
                </div>
            ) : (
                <div className="event-cards-grid">
                    {eventCards.map((ev) => {
                        const color = CEREMONY_COLORS[ev.type] || CEREMONY_COLORS.other;
                        const icon = CEREMONY_ICONS[ev.type] || CEREMONY_ICONS.other;
                        const budgetPercent = ev.quoted > 0 ? Math.min(100, Math.round((ev.paid / ev.quoted) * 100)) : 0;

                        return (
                            <div key={ev.id} className="event-dashboard-card" style={{ borderTopColor: color }}>
                                {/* Header */}
                                <div className="event-card-header">
                                    <div className="event-card-title-row">
                                        <span className="event-card-icon">{icon}</span>
                                        <div>
                                            <h3 className="event-card-name">{ev.name}</h3>
                                            <span className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>
                                                {ev.type.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    {ev.daysUntil !== null && (
                                        <div className="event-card-countdown">
                                            <span className="event-card-days">{ev.daysUntil}</span>
                                            <span className="event-card-days-label">days</span>
                                        </div>
                                    )}
                                </div>

                                {/* Date */}
                                {ev.date && (
                                    <div className="event-card-date">
                                        📅 {new Date(ev.date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                )}

                                {/* Jubilee Line */}
                                <div className="event-card-timeline">
                                    <JubileeLine
                                        milestones={ev.milestones}
                                        eventColor={color}
                                        compact={true}
                                    />
                                </div>

                                {/* Budget Bar */}
                                {ev.quoted > 0 && (
                                    <div className="event-card-budget">
                                        <div className="event-card-budget-header">
                                            <span className="text-xs text-muted">Budget</span>
                                            <span className="text-xs font-mono">{budgetPercent}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className={`progress-bar-fill ${budgetPercent >= 100 ? 'success' : budgetPercent > 50 ? 'warning' : ''}`}
                                                style={{ width: `${budgetPercent}%`, background: budgetPercent < 50 ? color : undefined }}
                                            />
                                        </div>
                                        <div className="event-card-budget-amounts">
                                            <span className="font-mono text-xs">{formatCurrency(ev.paid, currency)} paid</span>
                                            <span className="font-mono text-xs text-muted">of {formatCurrency(ev.quoted, currency)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Footer stats */}
                                <div className="event-card-footer">
                                    <span className="text-xs text-muted">{ev.supplierCount} suppliers</span>
                                    <span className="text-xs text-muted">{ev.milestones.filter(m => m.status === 'completed').length}/{ev.milestones.length} milestones</span>
                                    <Link href={`/dashboard/events/${ev.id}`} className="text-xs" style={{ color: color, fontWeight: 600 }}>
                                        View details →
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Bottom Row: Suppliers + Upcoming Payments */}
            <div className="grid-2">
                {/* Suppliers */}
                <div className="panel">
                    <div className="panel-header">
                        <span className="panel-title">Recent Suppliers</span>
                        <Link href="/dashboard/suppliers" className="card-link">View all →</Link>
                    </div>
                    <div className="panel-body">
                        {suppliers.length === 0 ? (
                            <p className="text-sm text-muted">No suppliers added yet</p>
                        ) : (
                            suppliers.slice(0, 4).map((s: Supplier) => (
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
