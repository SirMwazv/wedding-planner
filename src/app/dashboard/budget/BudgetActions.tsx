'use client';

import { useState } from 'react';
import { updateEventBudget } from '@/lib/actions/budget';
import { useRouter } from 'next/navigation';

interface EventBudgetSetter {
    eventId: string;
    eventName: string;
    currentBudget: number;
    currencySymbol: string;
}

interface BudgetActionsProps {
    events: EventBudgetSetter[];
}

export default function BudgetActions({ events }: BudgetActionsProps) {
    const [editingEvent, setEditingEvent] = useState<EventBudgetSetter | null>(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    function openEdit(ev: EventBudgetSetter) {
        setEditingEvent(ev);
        setAmount(ev.currentBudget > 0 ? ev.currentBudget.toString() : '');
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingEvent) return;
        setLoading(true);
        setError(null);

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            setError('Please enter a valid positive number');
            setLoading(false);
            return;
        }

        const result = await updateEventBudget(editingEvent.eventId, numAmount);
        if (result?.error) {
            setError(result.error);
        } else {
            setEditingEvent(null);
            router.refresh();
        }
        setLoading(false);
    }

    return (
        <>
            <button className="btn btn-primary" onClick={() => {
                if (events.length === 1) {
                    openEdit(events[0]);
                } else {
                    // If multiple events, show a modal to pick which one
                    setEditingEvent({ eventId: '__pick__', eventName: '', currentBudget: 0, currencySymbol: '' });
                }
            }}>
                🎯 Set Budgets
            </button>

            {/* Event picker modal (for multiple events) */}
            {editingEvent?.eventId === '__pick__' && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingEvent(null)}>
                    <div className="modal-content">
                        <h3>Set Budget For</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {events.map((ev) => (
                                <button key={ev.eventId} className="btn btn-secondary" onClick={() => openEdit(ev)}>
                                    {ev.eventName} {ev.currentBudget > 0 ? `(${ev.currencySymbol} ${ev.currentBudget.toLocaleString()})` : '(no budget set)'}
                                </button>
                            ))}
                        </div>
                        <button className="btn btn-ghost" onClick={() => setEditingEvent(null)} style={{ marginTop: 'var(--space-md)' }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Budget editor modal */}
            {editingEvent && editingEvent.eventId !== '__pick__' && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingEvent(null)}>
                    <div className="modal-content">
                        <h3>Set Budget — {editingEvent.eventName}</h3>
                        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                            Set the budget for this ceremony. Supplier quotes and payments will be tracked against it.
                        </p>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="budget_amount">
                                    Budget ({editingEvent.currencySymbol})
                                </label>
                                <input
                                    id="budget_amount"
                                    type="number"
                                    className="form-input"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="e.g. 150000"
                                    min="0"
                                    step="100"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-sm">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Budget'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setEditingEvent(null)}>
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
