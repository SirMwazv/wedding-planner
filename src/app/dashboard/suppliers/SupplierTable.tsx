'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { SUPPLIER_STATUS_LABELS } from '@/lib/types/database';
import type { Currency, SupplierStatus } from '@/lib/types/database';

interface SupplierRow {
    id: string;
    name: string;
    category: string | null;
    contact_name: string | null;
    status: SupplierStatus;
    event_id: string;
    eventName: string;
    quoted: number;
    paid: number;
    outstanding: number;
}

interface Props {
    suppliers: SupplierRow[];
    currency: Currency;
    categories: string[];
    events: { id: string; name: string }[];
}

const STATUS_BADGE_CLASS: Record<SupplierStatus, string> = {
    researching: 'badge-default',
    contacted: 'badge-info',
    quoted: 'badge-info',
    negotiating: 'badge-warning',
    booked: 'badge-success',
    rejected: 'badge-danger',
};

export default function SupplierTable({ suppliers, currency, categories, events }: Props) {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [eventFilter, setEventFilter] = useState('');
    const [sortField, setSortField] = useState<'name' | 'quoted' | 'paid' | 'category'>('name');
    const [sortAsc, setSortAsc] = useState(true);

    const filtered = useMemo(() => {
        let result = suppliers;

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(q) ||
                (s.contact_name || '').toLowerCase().includes(q) ||
                (s.category || '').toLowerCase().includes(q)
            );
        }

        if (categoryFilter) {
            result = result.filter(s => s.category === categoryFilter);
        }

        if (statusFilter) {
            result = result.filter(s => s.status === statusFilter);
        }

        if (eventFilter) {
            result = result.filter(s => s.event_id === eventFilter);
        }

        result = [...result].sort((a, b) => {
            let cmp = 0;
            if (sortField === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortField === 'category') cmp = (a.category || '').localeCompare(b.category || '');
            else if (sortField === 'quoted') cmp = a.quoted - b.quoted;
            else if (sortField === 'paid') cmp = a.paid - b.paid;
            return sortAsc ? cmp : -cmp;
        });

        return result;
    }, [suppliers, search, categoryFilter, statusFilter, eventFilter, sortField, sortAsc]);

    function toggleSort(field: typeof sortField) {
        if (sortField === field) setSortAsc(!sortAsc);
        else { setSortField(field); setSortAsc(true); }
    }

    const sortIcon = (field: typeof sortField) =>
        sortField === field ? (sortAsc ? ' ↑' : ' ↓') : ' ↕';

    return (
        <>
            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="filter-search">
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    {(Object.entries(SUPPLIER_STATUS_LABELS) as [SupplierStatus, string][]).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>
                <select
                    className="filter-select"
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                >
                    <option value="">All Events</option>
                    {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <span className="filter-count">{filtered.length} supplier{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Table */}
            <div className="panel">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
                                    Supplier{sortIcon('name')}
                                </th>
                                <th onClick={() => toggleSort('category')} style={{ cursor: 'pointer' }}>
                                    Category{sortIcon('category')}
                                </th>
                                <th>Event</th>
                                <th>Status</th>
                                <th onClick={() => toggleSort('quoted')} style={{ cursor: 'pointer' }}>
                                    Quoted{sortIcon('quoted')}
                                </th>
                                <th onClick={() => toggleSort('paid')} style={{ cursor: 'pointer' }}>
                                    Paid{sortIcon('paid')}
                                </th>
                                <th>Outstanding</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-tertiary)' }}>
                                        No suppliers match your filters
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((s) => {
                                    const initial = s.name.charAt(0).toUpperCase();
                                    return (
                                        <tr key={s.id}>
                                            <td>
                                                <Link href={`/dashboard/suppliers/${s.id}`} className="cell-supplier">
                                                    <div className="cell-avatar">{initial}</div>
                                                    <div>
                                                        <div className="cell-name">{s.name}</div>
                                                        {s.contact_name && <div className="cell-contact">{s.contact_name}</div>}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td>{s.category || '—'}</td>
                                            <td>
                                                <div className="cell-event">
                                                    <div className="cell-event-dot" style={{ background: 'var(--color-ceremony-white)' }} />
                                                    {s.eventName}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${STATUS_BADGE_CLASS[s.status] || 'badge-default'}`}>
                                                    <span className="badge-dot" />
                                                    {SUPPLIER_STATUS_LABELS[s.status] || s.status}
                                                </span>
                                            </td>
                                            <td className="cell-amount">{formatCurrency(s.quoted, currency)}</td>
                                            <td className="cell-amount paid">{s.paid > 0 ? formatCurrency(s.paid, currency) : '—'}</td>
                                            <td className="cell-amount outstanding">{s.outstanding > 0 ? formatCurrency(s.outstanding, currency) : '—'}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
