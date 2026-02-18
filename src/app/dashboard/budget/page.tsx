import { getCurrentCouple } from '@/lib/supabase/server';
import CoupleRequired from '@/components/CoupleRequired';
import { getEvents } from '@/lib/actions/events';
import { getAllSuppliers } from '@/lib/actions/suppliers';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import type { Currency, Quote, Supplier } from '@/lib/types/database';

export default async function BudgetPage() {
    const coupleData = await getCurrentCouple();
    if (!coupleData) return <CoupleRequired />;

    const { couple } = coupleData;
    const currency = couple.primary_currency as Currency;
    const events = await getEvents();
    const suppliers = await getAllSuppliers();

    // Totals
    const totalBudget = suppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.amount), 0), 0);
    const totalPaid = suppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.deposit_paid), 0), 0);
    const totalCommitted = suppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.deposit_required), 0), 0);
    const remaining = totalBudget - totalCommitted;
    const committedPercent = totalBudget > 0 ? Math.round((totalCommitted / totalBudget) * 100) : 0;
    const paidPercent = totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0;
    const remainingPercent = totalBudget > 0 ? Math.round((remaining / totalBudget) * 100) : 0;

    // Category breakdown
    const categoryMap: Record<string, { quoted: number; paid: number; budget: number }> = {};
    suppliers.forEach((s: Supplier & { quotes?: Quote[] }) => {
        const cat = s.category || 'Other';
        if (!categoryMap[cat]) categoryMap[cat] = { quoted: 0, paid: 0, budget: 0 };
        (s.quotes || []).forEach((q: Quote) => {
            categoryMap[cat].quoted += Number(q.amount) || 0;
            categoryMap[cat].paid += Number(q.deposit_paid) || 0;
            categoryMap[cat].budget += Number(q.amount) || 0;
        });
    });

    const categories = Object.entries(categoryMap)
        .map(([name, data]) => ({
            name,
            ...data,
            percent: data.budget > 0 ? Math.round((data.paid / data.budget) * 100) : 0,
        }))
        .sort((a, b) => b.budget - a.budget);

    // Per-event breakdown
    const eventBudgets = events.map((e: { id: string; name: string; type: string }) => {
        const eventSuppliers = suppliers.filter((s: { event_id: string }) => s.event_id === e.id);
        const budget = eventSuppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
            sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.amount), 0), 0);
        const paid = eventSuppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
            sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.deposit_paid), 0), 0);
        return { id: e.id, name: e.name, budget, paid, type: e.type };
    });

    return (
        <>
            <div className="page-header">
                <div>
                    <h2>Budget</h2>
                    <p>Financial overview across all events</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className="tab active">All Events</button>
                {events.map((e: { id: string; name: string }) => (
                    <button key={e.id} className="tab">{e.name}</button>
                ))}
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">{formatCurrency(totalBudget, currency)}</div>
                    <div className="stat-label">Total Budget</div>
                    <div className="stat-subtitle">Planned total</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📌</div>
                    <div className="stat-value" style={{ color: 'var(--color-committed)' }}>{formatCurrency(totalCommitted, currency)}</div>
                    <div className="stat-label">Committed</div>
                    <div className="stat-subtitle">{committedPercent}% of budget</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value" style={{ color: 'var(--color-paid)' }}>{formatCurrency(totalPaid, currency)}</div>
                    <div className="stat-label">Paid Out</div>
                    <div className="stat-subtitle">{paidPercent}% of budget</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💵</div>
                    <div className="stat-value">{formatCurrency(remaining, currency)}</div>
                    <div className="stat-label">Remaining</div>
                    <div className="stat-subtitle">Unallocated</div>
                </div>
            </div>

            {/* Budget Health */}
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
                            Committed
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
                        <div className="health-bar-segment committed" style={{ width: `${committedPercent - paidPercent}%` }} />
                    </div>
                    <div className="health-bar-labels">
                        <span>{formatCurrency(0, currency)}</span>
                        <span>{formatCurrency(totalPaid, currency)} paid · {formatCurrency(totalBudget - totalPaid, currency)} outstanding</span>
                        <span>{formatCurrency(totalBudget, currency)}</span>
                    </div>
                </div>
            </div>

            {/* Category Breakdown + Category Detail */}
            <div className="grid-2">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-title">Category Breakdown</div>
                    </div>
                    <div className="panel-body">
                        {categories.length === 0 ? (
                            <p className="text-sm text-muted">No categories yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {categories.map((cat) => {
                                    const barHeight = totalBudget > 0 ? Math.max(8, Math.round((cat.budget / totalBudget) * 180)) : 0;
                                    return (
                                        <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <span className="text-sm" style={{ width: '120px', fontWeight: 500 }}>{cat.name}</span>
                                            <div style={{ flex: 1, height: '8px', background: 'var(--color-border-light)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${totalBudget > 0 ? (cat.budget / totalBudget) * 100 : 0}%`, background: 'var(--color-sidebar)', borderRadius: 'var(--radius-full)' }} />
                                            </div>
                                            <span className="text-sm font-bold" style={{ width: '80px', textAlign: 'right' }}>{formatCurrency(cat.budget, currency)}</span>
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
                                    <div className="category-amount-total">of {formatCurrency(cat.budget, currency)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
