'use client';

import { useState } from 'react';
import { createQuote } from '@/lib/actions/quotes';
import { CURRENCY_OPTIONS } from '@/lib/types/database';
import type { Currency } from '@/lib/types/database';

interface SupplierActionsProps {
    supplierId: string;
    eventCurrency: Currency;
}

export default function SupplierActions({ supplierId, eventCurrency }: SupplierActionsProps) {
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleQuoteSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        formData.set('supplier_id', supplierId);
        const result = await createQuote(formData);
        if (result?.error) {
            setError(result.error);
        } else {
            setShowQuoteForm(false);
            window.location.reload();
        }
        setLoading(false);
    }

    return (
        <>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowQuoteForm(!showQuoteForm)}>
                {showQuoteForm ? 'Cancel' : '+ Add Quote'}
            </button>

            {showQuoteForm && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowQuoteForm(false)}>
                    <div className="modal-content">
                        <h3>Add Quote</h3>
                        {error && <div className="auth-error">{error}</div>}

                        <form action={handleQuoteSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="amount">Amount</label>
                                    <input id="amount" name="amount" type="number" step="0.01" className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="currency">Currency</label>
                                    <select id="currency" name="currency" className="form-input form-select" defaultValue={eventCurrency}>
                                        {CURRENCY_OPTIONS.map((c) => (
                                            <option key={c.value} value={c.value}>{c.value}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="deposit_required">Deposit Required</label>
                                    <input id="deposit_required" name="deposit_required" type="number" step="0.01" className="form-input" defaultValue="0" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="deposit_paid">Deposit Paid</label>
                                    <input id="deposit_paid" name="deposit_paid" type="number" step="0.01" className="form-input" defaultValue="0" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="due_date">Due Date</label>
                                <input id="due_date" name="due_date" type="date" className="form-input" />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="notes">Notes</label>
                                <textarea id="notes" name="notes" className="form-input" rows={2} placeholder="Quote details..." />
                            </div>

                            <div className="flex gap-sm">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Quote'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowQuoteForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
