import { getCurrentCouple } from '@/lib/supabase/server';
import CoupleRequired from '@/components/CoupleRequired';
import { getEvents } from '@/lib/actions/events';
import { getAllSuppliers } from '@/lib/actions/suppliers';
import { getAllTasks } from '@/lib/actions/tasks';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import type { Currency, Quote, Supplier } from '@/lib/types/database';
import SuccessToast from '@/components/SuccessToast';
import { Suspense } from 'react';

const CEREMONY_COLORS: Record<string, string> = {
    white_wedding: 'green',
    traditional: 'orange',
    kitchen_party: 'purple',
    lobola: 'gold',
    umembeso: 'orange',
    engagement: 'green',
    other: 'green',
};

const CEREMONY_ICONS: Record<string, string> = {
    white_wedding: '💒',
    traditional: '🥁',
    kitchen_party: '🍽️',
    lobola: '🤝',
    umembeso: '🎁',
    engagement: '💍',
    other: '🎉',
};

export default async function EventsPage() {
    const coupleData = await getCurrentCouple();
    if (!coupleData) return <CoupleRequired />;

    const { couple } = coupleData;
    const currency = couple.primary_currency as Currency;
    const events = await getEvents();
    const suppliers = await getAllSuppliers();
    const tasks = await getAllTasks();

    // Totals
    const totalBudget = suppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.amount), 0), 0);
    const totalPaid = suppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.deposit_paid), 0), 0);
    const pendingTasks = tasks.filter((t: { status: string }) => t.status !== 'completed').length;

    return (
        <>
            <Suspense><SuccessToast /></Suspense>
            <div className="page-header">
                <div>
                    <h2>Events</h2>
                    <p>{events.length} ceremonies planned</p>
                </div>
                <div className="page-header-actions">
                    <Link href="/dashboard/events/new" className="btn btn-primary">+ Create Event</Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-value">{events.length}</div>
                    <div className="stat-label">Total Events</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💼</div>
                    <div className="stat-value">{formatCurrency(totalBudget, currency)}</div>
                    <div className="stat-label">Total Budget</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-value" style={{ color: 'var(--color-committed)' }}>{formatCurrency(totalPaid, currency)}</div>
                    <div className="stat-label">Total Spent</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-value" style={{ color: 'var(--color-committed)' }}>{pendingTasks}</div>
                    <div className="stat-label">Pending Tasks</div>
                </div>
            </div>

            {/* Your Ceremonies */}
            <div className="card-title mb-lg" style={{ fontSize: '18px' }}>Your Ceremonies</div>

            {events.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <h3>No ceremonies yet</h3>
                        <p>Add your first ceremony to start planning your special day</p>
                        <Link href="/dashboard/events/new" className="btn btn-primary">Create Event</Link>
                    </div>
                </div>
            ) : (
                events.map((event: { id: string; name: string; type: string; date: string | null; location: string | null; description: string | null; guest_count: number | null }) => {
                    const eventSuppliers = suppliers.filter((s: { event_id: string }) => s.event_id === event.id);
                    const bookedCount = eventSuppliers.filter((s: { status: string }) => s.status === 'booked' || s.status === 'confirmed').length;
                    const eventTasks = tasks.filter((t: { event_id: string }) => t.event_id === event.id);
                    const completedTasks = eventTasks.filter((t: { status: string }) => t.status === 'completed').length;

                    const eventBudget = eventSuppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
                        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.amount), 0), 0);
                    const eventPaid = eventSuppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
                        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.deposit_paid), 0), 0);
                    const eventCommitted = eventSuppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
                        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.deposit_required), 0), 0);
                    const budgetPercent = eventBudget > 0 ? Math.round((eventPaid / eventBudget) * 100) : 0;
                    const taskPercent = eventTasks.length > 0 ? Math.round((completedTasks / eventTasks.length) * 100) : 0;

                    const daysUntil = event.date
                        ? Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : null;

                    const accentColor = CEREMONY_COLORS[event.type] || 'green';

                    return (
                        <div key={event.id} className="ceremony-card">
                            <div className={`ceremony-card-top-accent ${accentColor}`} />

                            <div className="ceremony-card-header">
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <div className="ceremony-card-icon" style={{ background: 'var(--color-bg)' }}>
                                        {CEREMONY_ICONS[event.type] || '🎉'}
                                    </div>
                                    <div>
                                        <div className="ceremony-card-title-row">
                                            <span className="ceremony-card-title">{event.name}</span>
                                            <span className="badge badge-warning"><span className="badge-dot" />Planning</span>
                                            <span className="badge badge-default">{event.type.replace(/_/g, ' ')}</span>
                                        </div>
                                        {event.description && (
                                            <div className="ceremony-card-desc">{event.description}</div>
                                        )}
                                    </div>
                                </div>

                                {daysUntil !== null && (
                                    <div className="ceremony-card-countdown">
                                        <div className="days">{daysUntil}</div>
                                        <div className="days-label">days away</div>
                                    </div>
                                )}
                            </div>

                            {/* Metadata */}
                            <div className="ceremony-card-meta">
                                {event.date && <span>📅 {new Date(event.date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                                {event.location && <span>📍 {event.location}</span>}
                                {event.guest_count && <span>👥 {event.guest_count} guests</span>}
                            </div>

                            {/* Budget mini-summary */}
                            <div className="ceremony-card-budget">
                                <div className="ceremony-card-budget-item">
                                    <div className="budget-item-label">Budget</div>
                                    <div className="budget-item-value">{formatCurrency(eventBudget, currency)}</div>
                                </div>
                                <div className="ceremony-card-budget-item">
                                    <div className="budget-item-label">Committed</div>
                                    <div className="budget-item-value committed">{formatCurrency(eventCommitted, currency)}</div>
                                </div>
                                <div className="ceremony-card-budget-item">
                                    <div className="budget-item-label">Paid out</div>
                                    <div className="budget-item-value paid">{formatCurrency(eventPaid, currency)}</div>
                                </div>
                                <div className="ceremony-card-budget-item">
                                    <div className="budget-item-label">Suppliers</div>
                                    <div className="budget-item-value">{bookedCount}/{eventSuppliers.length} booked</div>
                                </div>
                            </div>

                            {/* Footer with progress bars */}
                            <div className="ceremony-card-footer">
                                <div className="ceremony-card-progress">
                                    <div className="ceremony-card-progress-label">
                                        <span>Budget used</span>
                                        <span>{budgetPercent}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className={`progress-bar-fill ${accentColor === 'green' ? '' : ''}`} style={{ width: `${budgetPercent}%`, background: accentColor === 'orange' ? 'var(--color-ceremony-traditional)' : accentColor === 'purple' ? 'var(--color-ceremony-kitchen)' : 'var(--color-ceremony-white)' }} />
                                    </div>
                                    <div className="ceremony-card-progress-label mt-sm">
                                        <span></span>
                                        <span>{completedTasks}/{eventTasks.length} tasks</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill success" style={{ width: `${taskPercent}%` }} />
                                    </div>
                                </div>

                                <Link href={`/dashboard/events/${event.id}`} className="btn btn-secondary">
                                    View event →
                                </Link>
                            </div>
                        </div>
                    );
                })
            )}
        </>
    );
}
