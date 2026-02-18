import { getCurrentCouple } from '@/lib/supabase/server';
import CoupleRequired from '@/components/CoupleRequired';
import { getAllSuppliers } from '@/lib/actions/suppliers';
import { getEvents } from '@/lib/actions/events';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import type { Currency, Quote, Supplier, SupplierStatus } from '@/lib/types/database';
import SupplierTable from './SupplierTable';
import SuccessToast from '@/components/SuccessToast';
import { Suspense } from 'react';

export default async function SuppliersPage() {
    const coupleData = await getCurrentCouple();
    if (!coupleData) return <CoupleRequired />;

    const { couple } = coupleData;
    const currency = couple.primary_currency as Currency;
    const suppliers = await getAllSuppliers();
    const events = await getEvents();

    // Totals
    const totalQuoted = suppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.amount), 0), 0);
    const totalPaid = suppliers.reduce((sum: number, s: Supplier & { quotes?: Quote[] }) =>
        sum + (s.quotes || []).reduce((qs: number, q: Quote) => qs + Number(q.deposit_paid), 0), 0);
    const totalOutstanding = totalQuoted - totalPaid;

    // Prepare table data
    const tableData = suppliers.map((s: Supplier & { quotes?: Quote[]; events?: { name: string } }) => {
        const quoted = (s.quotes || []).reduce((sum: number, q: Quote) => sum + Number(q.amount), 0);
        const paid = (s.quotes || []).reduce((sum: number, q: Quote) => sum + Number(q.deposit_paid), 0);
        return {
            id: s.id,
            name: s.name,
            category: s.category,
            contact_name: s.contact_name,
            status: s.status as SupplierStatus,
            event_id: s.event_id,
            eventName: s.events?.name || '—',
            quoted,
            paid,
            outstanding: quoted - paid,
        };
    });

    // Unique categories
    const categories = [...new Set(suppliers.map((s: Supplier) => s.category).filter(Boolean))] as string[];

    // Events for filter
    const eventOptions = events.map((e: { id: string; name: string }) => ({ id: e.id, name: e.name }));

    return (
        <>
            <Suspense><SuccessToast /></Suspense>
            <div className="page-header">
                <div>
                    <h2>Suppliers</h2>
                    <p>{suppliers.length} suppliers across all events</p>
                </div>
                <div className="page-header-actions">
                    <Link href="/dashboard/suppliers/new" className="btn btn-primary">+ Add Supplier</Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid-3">
                <div className="stat-card">
                    <div className="stat-label">Total Quoted</div>
                    <div className="stat-value">{formatCurrency(totalQuoted, currency)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Paid</div>
                    <div className="stat-value" style={{ color: 'var(--color-paid)' }}>{formatCurrency(totalPaid, currency)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Outstanding</div>
                    <div className="stat-value" style={{ color: 'var(--color-outstanding)' }}>{formatCurrency(totalOutstanding, currency)}</div>
                </div>
            </div>

            {suppliers.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3>No suppliers yet</h3>
                        <p>Add your first vendor or service provider to start tracking quotes and payments</p>
                        <Link href="/dashboard/suppliers/new" className="btn btn-primary">Add Supplier</Link>
                    </div>
                </div>
            ) : (
                <SupplierTable
                    suppliers={tableData}
                    currency={currency}
                    categories={categories}
                    events={eventOptions}
                />
            )}
        </>
    );
}
