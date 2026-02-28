'use client';

import { useState } from 'react';
import { createQuote, updateQuote, deleteQuote } from '@/lib/actions/quotes';
import { CURRENCY_OPTIONS } from '@/lib/types/database';
import type { Currency } from '@/lib/types/database';
import { formatCurrency, formatRelativeDate } from '@/lib/utils/currency';
import { PAYMENT_METHOD_LABELS } from '@/lib/types/database';
import type { PaymentMethod } from '@/lib/types/database';

interface QuoteData {
    id: string;
    amount: number;
    currency: string;
    deposit_required: number;
    deposit_paid: number;
    outstanding_balance: number;
    due_date: string | null;
    notes: string | null;
    is_accepted: boolean;
    quote_file_url: string | null;
    payments?: Array<{
        id: string;
        amount: number;
        currency: string;
        paid_at: string;
        method: PaymentMethod;
        reference: string | null;
    }>;
}

interface Props {
    supplierId: string;
    eventCurrency: Currency;
    quotes: QuoteData[];
}

export default function QuoteCards({ supplierId, eventCurrency, quotes }: Props) {
    const [editingQuote, setEditingQuote] = useState<QuoteData | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleCreate(formData: FormData) {
        setLoading(true);
        setError(null);
        formData.set('supplier_id', supplierId);
        const result = await createQuote(formData);
        if (result?.error) {
            setError(result.error);
        } else {
            setShowCreateForm(false);
            window.location.reload();
        }
        setLoading(false);
    }

    async function handleUpdate(formData: FormData) {
        if (!editingQuote) return;
        setLoading(true);
        setError(null);
        const result = await updateQuote(editingQuote.id, formData);
        if (result?.error) {
            setError(result.error);
        } else {
            setEditingQuote(null);
            window.location.reload();
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        setLoading(true);
        const result = await deleteQuote(id);
        if (result?.error) {
            alert(result.error);
        } else {
            window.location.reload();
        }
        setLoading(false);
    }

    return (
        <div className="panel">
            <div className="panel-header">
                <span className="panel-title">Quotes ({quotes.length})</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateForm(!showCreateForm)}>
                    {showCreateForm ? 'Cancel' : '+ Add Quote'}
                </button>
            </div>
            <div className="panel-body">
                {quotes.length === 0 && !showCreateForm ? (
                    <p className="text-sm text-muted">No quotes yet. Add a quote to start tracking costs.</p>
                ) : (
                    quotes.map((q) => (
                        <div key={q.id} className="card mb-md" style={{ background: 'var(--color-bg)' }}>
                            <div className="flex-between mb-md">
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 'var(--text-xl)', fontFamily: 'var(--font-mono)' }}>
                                        {formatCurrency(Number(q.amount), q.currency as Currency)}
                                    </div>
                                    {q.due_date && (
                                        <div className="text-xs text-muted">Due: {formatRelativeDate(q.due_date)}</div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                                    {q.is_accepted && <span className="badge badge-success"><span className="badge-dot" />Accepted</span>}
                                    {q.quote_file_url && (
                                        <a href={q.quote_file_url} target="_blank" rel="noopener" className="btn btn-ghost btn-sm">
                                            📄
                                        </a>
                                    )}
                                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingQuote(q); setError(null); }} title="Edit quote">
                                        ✏️
                                    </button>
                                    {deletingId === q.id ? (
                                        <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                            <span className="text-xs text-muted">Delete?</span>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)} disabled={loading}>
                                                {loading ? '...' : 'Yes'}
                                            </button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setDeletingId(null)}>No</button>
                                        </div>
                                    ) : (
                                        <button className="btn btn-ghost btn-sm" onClick={() => setDeletingId(q.id)} title="Delete quote" style={{ color: 'var(--color-danger)' }}>
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid-3" style={{ marginBottom: 'var(--space-sm)' }}>
                                <div>
                                    <div className="text-xs text-muted">Deposit Required</div>
                                    <div className="font-mono text-sm">{formatCurrency(Number(q.deposit_required), q.currency as Currency)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted">Paid</div>
                                    <div className="font-mono text-sm" style={{ color: 'var(--color-success)' }}>
                                        {formatCurrency(Number(q.deposit_paid), q.currency as Currency)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted">Outstanding</div>
                                    <div className="font-mono text-sm" style={{ color: Number(q.outstanding_balance) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                        {formatCurrency(Number(q.outstanding_balance), q.currency as Currency)}
                                    </div>
                                </div>
                            </div>

                            {Number(q.amount) > 0 && (
                                <div className="progress-bar" style={{ marginBottom: 'var(--space-sm)' }}>
                                    <div
                                        className={`progress-bar-fill ${Number(q.deposit_paid) >= Number(q.amount) ? 'success' :
                                            Number(q.deposit_paid) > 0 ? 'warning' : ''
                                            }`}
                                        style={{ width: `${Math.min(100, (Number(q.deposit_paid) / Number(q.amount)) * 100)}%` }}
                                    />
                                </div>
                            )}

                            {q.notes && <p className="text-xs text-muted">{q.notes}</p>}

                            {/* Payments */}
                            {(q.payments || []).length > 0 && (
                                <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-sm)' }}>
                                    <div className="text-xs text-muted mb-md" style={{ fontWeight: 600 }}>PAYMENTS</div>
                                    {(q.payments || []).map((p) => (
                                        <div key={p.id} className="list-item">
                                            <div className="list-item-content">
                                                <div className="list-item-title font-mono">{formatCurrency(Number(p.amount), p.currency as Currency)}</div>
                                                <div className="list-item-subtitle">
                                                    {new Date(p.paid_at).toLocaleDateString()} · {PAYMENT_METHOD_LABELS[p.method]}
                                                    {p.reference && <> · Ref: {p.reference}</>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Create Quote Modal */}
            {showCreateForm && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreateForm(false)}>
                    <div className="modal-content">
                        <h3>Add Quote</h3>
                        {error && <div className="auth-error">{error}</div>}
                        <QuoteForm
                            eventCurrency={eventCurrency}
                            loading={loading}
                            onSubmit={handleCreate}
                            onCancel={() => setShowCreateForm(false)}
                            submitLabel={loading ? 'Saving...' : 'Save Quote'}
                        />
                    </div>
                </div>
            )}

            {/* Edit Quote Modal */}
            {editingQuote && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingQuote(null)}>
                    <div className="modal-content">
                        <h3>Edit Quote</h3>
                        {error && <div className="auth-error">{error}</div>}
                        <QuoteForm
                            quote={editingQuote}
                            eventCurrency={eventCurrency}
                            loading={loading}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditingQuote(null)}
                            submitLabel={loading ? 'Saving...' : 'Update Quote'}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/** Shared form for create and edit */
function QuoteForm({
    quote,
    eventCurrency,
    loading,
    onSubmit,
    onCancel,
    submitLabel,
}: {
    quote?: QuoteData;
    eventCurrency: Currency;
    loading: boolean;
    onSubmit: (formData: FormData) => void;
    onCancel: () => void;
    submitLabel: string;
}) {
    return (
        <form action={onSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label" htmlFor="q-amount">Amount</label>
                    <input id="q-amount" name="amount" type="number" step="0.01" className="form-input" defaultValue={quote?.amount || ''} required />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="q-currency">Currency</label>
                    <select id="q-currency" name="currency" className="form-input form-select" defaultValue={quote?.currency || eventCurrency}>
                        {CURRENCY_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>{c.value}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label" htmlFor="q-deposit-req">Deposit Required</label>
                    <input id="q-deposit-req" name="deposit_required" type="number" step="0.01" className="form-input" defaultValue={quote?.deposit_required ?? 0} />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="q-deposit-paid">Deposit Paid</label>
                    <input id="q-deposit-paid" name="deposit_paid" type="number" step="0.01" className="form-input" defaultValue={quote?.deposit_paid ?? 0} />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label" htmlFor="q-due-date">Due Date</label>
                    <input id="q-due-date" name="due_date" type="date" className="form-input" defaultValue={quote?.due_date || ''} />
                </div>
                {quote && (
                    <div className="form-group">
                        <label className="form-label" htmlFor="q-accepted">Status</label>
                        <select id="q-accepted" name="is_accepted" className="form-input form-select" defaultValue={quote.is_accepted ? 'true' : 'false'}>
                            <option value="false">Pending</option>
                            <option value="true">Accepted</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="q-notes">Notes</label>
                <textarea id="q-notes" name="notes" className="form-input" rows={2} placeholder="Quote details..." defaultValue={quote?.notes || ''} />
            </div>

            <div className="flex gap-sm">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {submitLabel}
                </button>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </form>
    );
}
