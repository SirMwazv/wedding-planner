'use client';

import { useState } from 'react';
import { createEvent } from '@/lib/actions/events';
import { EVENT_TYPE_LABELS, CURRENCY_OPTIONS } from '@/lib/types/database';
import type { EventType } from '@/lib/types/database';
import Link from 'next/link';

export default function NewEventPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await createEvent(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <Link href="/dashboard/events" className="text-sm text-muted mb-sm" style={{ display: 'block' }}>
                        ← Back to Events
                    </Link>
                    <h2>New Ceremony</h2>
                    <p>Add a new wedding ceremony or event</p>
                </div>
            </div>

            <div className="panel" style={{ maxWidth: '600px' }}>
                <div className="panel-header">
                    <span className="panel-title">Ceremony Details</span>
                </div>
                <div className="panel-body">
                    {error && <div className="auth-error">{error}</div>}

                    <form action={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Ceremony Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="form-input"
                                placeholder="e.g. Our Lobola Ceremony"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="type">Ceremony Type</label>
                            <select id="type" name="type" className="form-input form-select" required>
                                {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="date">Date</label>
                                <input id="date" name="date" type="date" className="form-input" />
                                <span className="form-hint">Optional — set when you know</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="currency">Currency</label>
                                <select id="currency" name="currency" className="form-input form-select">
                                    {CURRENCY_OPTIONS.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="location">Location</label>
                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Harare, Zimbabwe"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="guest_count">Estimated Guests</label>
                                <input
                                    id="guest_count"
                                    name="guest_count"
                                    type="number"
                                    className="form-input"
                                    placeholder="e.g. 150"
                                />
                                <span className="form-hint">Helps with budgeting</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="notes">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                className="form-input"
                                placeholder="Any additional details..."
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-sm">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Ceremony'}
                            </button>
                            <Link href="/dashboard/events" className="btn btn-secondary">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
