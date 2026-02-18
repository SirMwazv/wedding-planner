'use client';

import { useState } from 'react';
import { updateBudget } from '@/lib/actions/budget';
import { useRouter } from 'next/navigation';

interface BudgetActionsProps {
    currentBudget: number;
    currencySymbol: string;
}

export default function BudgetActions({ currentBudget, currencySymbol }: BudgetActionsProps) {
    const [showForm, setShowForm] = useState(false);
    const [amount, setAmount] = useState(currentBudget.toString());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            setError('Please enter a valid positive number');
            setLoading(false);
            return;
        }

        const result = await updateBudget(numAmount);
        if (result?.error) {
            setError(result.error);
        } else {
            setShowForm(false);
            router.refresh();
        }
        setLoading(false);
    }

    return (
        <>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                {currentBudget > 0 ? '✏️ Edit Budget' : '🎯 Set Budget'}
            </button>

            {showForm && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="modal-content">
                        <h3>{currentBudget > 0 ? 'Update Budget' : 'Set Your Budget'}</h3>
                        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                            Set your total wedding budget. All supplier quotes and payments will be tracked against this amount.
                        </p>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="budget_amount">
                                    Total Budget ({currencySymbol})
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
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
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
