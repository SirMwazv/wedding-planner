import { getCurrentCouple } from '@/lib/supabase/server';
import CoupleRequired from '@/components/CoupleRequired';
import { getEvent, getEventSuppliers, getEventTasks } from '@/lib/actions/events';
import { formatCurrency, formatDate } from '@/lib/utils/currency';
import Link from 'next/link';
import type { Currency, Quote, Supplier } from '@/lib/types/database';
import EventActions from './EventActions';

const CEREMONY_COLORS: Record<string, string> = {
    white_wedding: 'green', traditional: 'orange', kitchen_party: 'purple',
    lobola: 'gold', umembeso: 'orange', engagement: 'green', other: 'green',
};

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const coupleData = await getCurrentCouple();
    if (!coupleData) return <CoupleRequired />;

    const { couple } = coupleData;
    const currency = couple.primary_currency as Currency;
    const event = await getEvent(id);
    if (!event) return <div className="card"><p>Event not found</p></div>;

    const suppliers = await getEventSuppliers(id);
    const tasks = await getEventTasks(id);

    const accentColor = CEREMONY_COLORS[event.type] || 'green';
    const daysUntil = event.date
        ? Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    // Budget
    const totalQuoted = suppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.amount), 0), 0);
    const totalPaid = suppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.deposit_paid), 0), 0);
    const budgetPercent = totalQuoted > 0 ? Math.round((totalPaid / totalQuoted) * 100) : 0;
    const completedTasks = tasks.filter((t: { status: string }) => t.status === 'completed').length;

    return (
        <>
            <div className="page-header">
                <div>
                    <Link href="/dashboard/events" className="text-sm text-muted mb-sm" style={{ display: 'block' }}>← Back to Events</Link>
                    <h2>{event.name}</h2>
                    <p>{event.type.replace(/_/g, ' ')} · {daysUntil !== null ? `${daysUntil} days away` : 'No date set'}</p>
                </div>
                <div className="page-header-actions">
                    <Link href={`/dashboard/events/${id}/edit`} className="btn btn-secondary">✏️ Edit</Link>
                    <EventActions eventId={id} />
                    <Link href={`/dashboard/suppliers/new?event_id=${id}`} className="btn btn-primary">+ Add Supplier</Link>
                </div>
            </div>

            {/* Event Info */}
            <div className="ceremony-card mb-lg">
                <div className={`ceremony-card-top-accent ${accentColor}`} />
                <div className="ceremony-card-header">
                    <div>
                        <div className="ceremony-card-title-row">
                            <span className="badge badge-warning"><span className="badge-dot" />Planning</span>
                            <span className="badge badge-default">{event.type.replace(/_/g, ' ')}</span>
                        </div>
                        {event.description && <div className="ceremony-card-desc mt-sm">{event.description}</div>}
                    </div>
                    {daysUntil !== null && (
                        <div className="ceremony-card-countdown">
                            <div className="days">{daysUntil}</div>
                            <div className="days-label">days away</div>
                        </div>
                    )}
                </div>

                <div className="ceremony-card-meta">
                    {event.date && <span>📅 {formatDate(event.date)}</span>}
                    {event.location && <span>📍 {event.location}</span>}
                    {event.guest_count && <span>👥 {event.guest_count} guests</span>}
                </div>

                <div className="ceremony-card-budget">
                    <div className="ceremony-card-budget-item">
                        <div className="budget-item-label">Budget</div>
                        <div className="budget-item-value">{formatCurrency(totalQuoted, currency)}</div>
                    </div>
                    <div className="ceremony-card-budget-item">
                        <div className="budget-item-label">Paid</div>
                        <div className="budget-item-value paid">{formatCurrency(totalPaid, currency)}</div>
                    </div>
                    <div className="ceremony-card-budget-item">
                        <div className="budget-item-label">Suppliers</div>
                        <div className="budget-item-value">{suppliers.length}</div>
                    </div>
                    <div className="ceremony-card-budget-item">
                        <div className="budget-item-label">Tasks</div>
                        <div className="budget-item-value">{completedTasks}/{tasks.length} done</div>
                    </div>
                </div>

                <div style={{ maxWidth: '400px' }}>
                    <div className="ceremony-card-progress-label">
                        <span>Budget used</span>
                        <span>{budgetPercent}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${budgetPercent}%` }} />
                    </div>
                </div>
            </div>

            {/* Suppliers & Tasks */}
            <div className="grid-2">
                {/* Suppliers */}
                <div className="panel">
                    <div className="panel-header">
                        <span className="panel-title">Suppliers ({suppliers.length})</span>
                    </div>
                    <div className="panel-body">
                        {suppliers.length === 0 ? (
                            <div className="empty-state">
                                <p className="text-sm text-muted">No suppliers yet</p>
                                <Link href={`/dashboard/suppliers/new?event_id=${id}`} className="btn btn-secondary btn-sm">Add Supplier</Link>
                            </div>
                        ) : (
                            suppliers.map((s: Supplier & { quotes?: Quote[] }) => {
                                const quoted = (s.quotes || []).reduce((sum: number, q: Quote) => sum + Number(q.amount), 0);
                                return (
                                    <div key={s.id} className="list-item">
                                        <div className="cell-supplier">
                                            <div className="cell-avatar">{s.name.charAt(0)}</div>
                                            <div className="list-item-content">
                                                <Link href={`/dashboard/suppliers/${s.id}`} className="list-item-title">{s.name}</Link>
                                                <div className="list-item-subtitle">{s.category || 'Uncategorized'}</div>
                                            </div>
                                        </div>
                                        <div className="cell-amount">{formatCurrency(quoted, currency)}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Tasks */}
                <div className="panel">
                    <div className="panel-header">
                        <span className="panel-title">Tasks ({tasks.length})</span>
                    </div>
                    <div className="panel-body">
                        {tasks.length === 0 ? (
                            <p className="text-sm text-muted">No tasks yet</p>
                        ) : (
                            tasks.map((t: { id: string; title: string; status: string; due_date: string | null }) => (
                                <div key={t.id} className="task-item">
                                    <div className={`task-checkbox ${t.status === 'completed' ? 'checked' : ''}`}>
                                        {t.status === 'completed' && '✓'}
                                    </div>
                                    <div className="task-content">
                                        <div className={`task-title ${t.status === 'completed' ? 'completed' : ''}`}>{t.title}</div>
                                    </div>
                                    {t.due_date && (
                                        <span className="text-sm text-muted">{formatDate(t.due_date)}</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
