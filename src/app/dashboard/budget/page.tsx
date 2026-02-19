import { getCurrentCouple } from '@/lib/supabase/server';
import CoupleRequired from '@/components/CoupleRequired';
import { getEvents } from '@/lib/actions/events';
import { getAllSuppliers } from '@/lib/actions/suppliers';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import type { Currency, Quote, Supplier } from '@/lib/types/database';
import BudgetActions from './BudgetActions';

export default async function BudgetPage() {
    const coupleData = await getCurrentCouple();
    if (!coupleData) return <CoupleRequired />;

    const { couple } = coupleData;
    const currency = couple.primary_currency as Currency;
    const events = await getEvents() as Array<{ id: string; name: string; type: string; budget?: number; currency?: string }>;
    const suppliers = await getAllSuppliers();

    // Per-event data
    const eventData = events.map((e) => {
        const eventSuppliers = suppliers.filter((s: { event_id: string }) => s.event_id === e.id);
        const quoted = eventSuppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
            sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.amount), 0), 0);
        const paid = eventSuppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
            sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.deposit_paid), 0), 0);
        const budget = Number(e.budget) || 0;
        const overBudget = budget > 0 && quoted > budget;
        return { id: e.id, name: e.name, type: e.type, budget, quoted, paid, overBudget };
    });

    // Totals across all events
    const totalBudget = eventData.reduce((s, e) => s + e.budget, 0);
    const totalQuoted = eventData.reduce((s, e) => s + e.quoted, 0);
    const totalPaid = eventData.reduce((s, e) => s + e.paid, 0);
    const outstanding = totalQuoted - totalPaid;
    const budgetSet = totalBudget > 0;
    const remaining = budgetSet ? totalBudget - totalQuoted : 0;
    const overBudget = budgetSet && totalQuoted > totalBudget;
    const quotedPercent = budgetSet ? Math.min(Math.round((totalQuoted / totalBudget) * 100), 100) : 0;
    const paidPercent = budgetSet ? Math.min(Math.round((totalPaid / totalBudget) * 100), 100) : 0;

    // Category breakdown
    const categoryMap: Record<string, { quoted: number; paid: number }> = {};
    suppliers.forEach((s: Supplier & { quotes?: Quote[] }) => {
        const cat = s.category || 'Other';
        if (!categoryMap[cat]) categoryMap[cat] = { quoted: 0, paid: 0 };
        (s.quotes || []).forEach((q: Quote) => {
            categoryMap[cat].quoted += Number(q.amount) || 0;
            categoryMap[cat].paid += Number(q.deposit_paid) || 0;
        });
    });

    const categories = Object.entries(categoryMap)
        .map(([name, data]) => ({
            name,
            ...data,
            percent: data.quoted > 0 ? Math.round((data.paid / data.quoted) * 100) : 0,
        }))
        .sort((a, b) => b.quoted - a.quoted);

    return (
        <>
            <div className="page-header">
                <div>
                    <h2>Budget</h2>
                    <p>Financial overview across all ceremonies</p>
                </div>
                <div className="page-header-actions">
                    <BudgetActions events={events.map((e) => ({
                        eventId: e.id,
                        eventName: e.name,
                        currentBudget: Number(e.budget) || 0,
                        currencySymbol: currency,
                    }))} />
                </div>
            </div>

            {/* Budget Alert */}
            {!budgetSet && (
                <div className="panel" style={{ borderLeft: '4px solid var(--color-gold)', marginBottom: 'var(--space-lg)' }}>
                    <div className="panel-body">
                        <p style={{ margin: 0 }}>
                            <strong>🎯 No budgets set yet.</strong> Click &quot;Set Budgets&quot; above to define a budget for each ceremony.
                        </p>
                    </div>
                </div>
            )}

            {overBudget && (
                <div className="panel" style={{ borderLeft: '4px solid var(--color-danger)', marginBottom: 'var(--space-lg)' }}>
                    <div className="panel-body">
                        <p style={{ margin: 0 }}>
                            <strong>⚠️ Over budget!</strong> Your total quoted costs exceed your combined budget by {formatCurrency(totalQuoted - totalBudget, currency)}.
                        </p>
                    </div>
                </div>
            )}

            {/* Overall Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-value">{budgetSet ? formatCurrency(totalBudget, currency) : '—'}</div>
                    <div className="stat-label">Total Budget</div>
                    <div className="stat-subtitle">{budgetSet ? `Across ${events.length} ${events.length === 1 ? 'ceremony' : 'ceremonies'}` : 'Not set yet'}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-value" style={{ color: overBudget ? 'var(--color-danger)' : 'var(--color-committed)' }}>
                        {formatCurrency(totalQuoted, currency)}
                    </div>
                    <div className="stat-label">Total Quoted</div>
                    <div className="stat-subtitle">{budgetSet ? `${quotedPercent}% of budget` : 'From supplier quotes'}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value" style={{ color: 'var(--color-paid)' }}>{formatCurrency(totalPaid, currency)}</div>
                    <div className="stat-label">Actual Paid</div>
                    <div className="stat-subtitle">{budgetSet ? `${paidPercent}% of budget` : `${formatCurrency(outstanding, currency)} outstanding`}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">{overBudget ? '🔴' : '💵'}</div>
                    <div className="stat-value" style={{ color: overBudget ? 'var(--color-danger)' : undefined }}>
                        {budgetSet ? formatCurrency(Math.abs(remaining), currency) : formatCurrency(outstanding, currency)}
                    </div>
                    <div className="stat-label">{overBudget ? 'Over Budget' : (budgetSet ? 'Remaining' : 'Outstanding')}</div>
                    <div className="stat-subtitle">{budgetSet ? (overBudget ? 'Quoted exceeds budget' : 'Budget − quoted') : 'Quoted − paid'}</div>
                </div>
            </div>

            {/* Budget Health */}
            {budgetSet && (
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-title">Budget Health</div>
                        <div className="health-bar-legend">
                            <div className="health-bar-legend-item">
                                <div className="health-bar-legend-dot" style={{ background: 'var(--color-paid)' }} />
                                Paid
                            </div>
                            <div className="health-bar-legend-item">
                                <div className="health-bar-legend-dot" style={{ background: 'var(--color-committed)' }} />
                                Quoted
                            </div>
                            <div className="health-bar-legend-item">
                                <div className="health-bar-legend-dot" style={{ background: 'var(--color-border-light)' }} />
                                Remaining
                            </div>
                        </div>
                    </div>
                    <div className="panel-body">
                        <div className="health-bar">
                            <div className="health-bar-segment paid" style={{ width: `${paidPercent}%` }} />
                            <div className="health-bar-segment committed" style={{ width: `${Math.max(0, quotedPercent - paidPercent)}%` }} />
                        </div>
                        <div className="health-bar-labels">
                            <span>{formatCurrency(0, currency)}</span>
                            <span>
                                {formatCurrency(totalPaid, currency)} paid · {formatCurrency(outstanding, currency)} outstanding
                            </span>
                            <span>{formatCurrency(totalBudget, currency)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Per-Event Budget Breakdown */}
            {eventData.length > 0 && (
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-title">Budget by Ceremony</div>
                    </div>
                    <div className="panel-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                            {eventData.map((ev) => {
                                const evBudgetSet = ev.budget > 0;
                                const evQuotedPct = evBudgetSet ? Math.min(Math.round((ev.quoted / ev.budget) * 100), 100) : 0;
                                const evPaidPct = evBudgetSet ? Math.min(Math.round((ev.paid / ev.budget) * 100), 100) : 0;
                                return (
                                    <div key={ev.id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-xs)' }}>
                                            <Link href={`/dashboard/events/${ev.id}`} style={{ fontWeight: 600 }}>
                                                {ev.name}
                                            </Link>
                                            <div className="text-sm">
                                                {evBudgetSet ? (
                                                    <span>
                                                        {ev.overBudget && <span style={{ color: 'var(--color-danger)' }}>⚠️ </span>}
                                                        {formatCurrency(ev.quoted, currency)} / {formatCurrency(ev.budget, currency)}
                                                        <span className="text-muted"> budget</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">No budget set · {formatCurrency(ev.quoted, currency)} quoted</span>
                                                )}
                                            </div>
                                        </div>
                                        {evBudgetSet && (
                                            <div style={{ height: '8px', background: 'var(--color-border-light)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', height: '100%' }}>
                                                    <div style={{ width: `${evPaidPct}%`, background: 'var(--color-paid)', transition: 'width 0.3s' }} />
                                                    <div style={{ width: `${Math.max(0, evQuotedPct - evPaidPct)}%`, background: 'var(--color-committed)', transition: 'width 0.3s' }} />
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-xs text-muted" style={{ marginTop: 'var(--space-xs)' }}>
                                            {formatCurrency(ev.paid, currency)} paid {evBudgetSet && `· ${formatCurrency(ev.budget - ev.quoted, currency)} remaining`}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Category Breakdown + Category Detail */}
            <div className="grid-2">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-title">Category Breakdown</div>
                    </div>
                    <div className="panel-body">
                        {categories.length === 0 ? (
                            <p className="text-sm text-muted">No categories yet — add suppliers with quotes to see your breakdown.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {categories.map((cat) => {
                                    const barPercent = budgetSet
                                        ? Math.min((cat.quoted / totalBudget) * 100, 100)
                                        : totalQuoted > 0 ? (cat.quoted / totalQuoted) * 100 : 0;
                                    return (
                                        <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <span className="text-sm" style={{ width: '120px', fontWeight: 500 }}>{cat.name}</span>
                                            <div style={{ flex: 1, height: '8px', background: 'var(--color-border-light)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${barPercent}%`, background: 'var(--color-sidebar)', borderRadius: 'var(--radius-full)' }} />
                                            </div>
                                            <span className="text-sm font-bold" style={{ width: '80px', textAlign: 'right' }}>{formatCurrency(cat.quoted, currency)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-title">Category Detail</div>
                    </div>
                    <div className="panel-body">
                        {categories.map((cat) => (
                            <div key={cat.name} className="category-item">
                                <div className="category-dot" />
                                <div className="category-name">{cat.name}</div>
                                <div className="category-percent">{cat.percent}%</div>
                                <div className="category-bar">
                                    <div className="category-bar-fill" style={{ width: `${cat.percent}%` }} />
                                </div>
                                <div className="category-amount">
                                    <div className="category-amount-value">{formatCurrency(cat.paid, currency)}</div>
                                    <div className="category-amount-total">of {formatCurrency(cat.quoted, currency)} quoted</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
