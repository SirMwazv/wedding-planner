'use client';

import { useState } from 'react';
import { updateEvent } from '@/lib/actions/events';
import { EVENT_TYPE_LABELS, CURRENCY_OPTIONS } from '@/lib/types/database';
import type { EventType } from '@/lib/types/database';
import Link from 'next/link';

interface EditEventFormProps {
    event: {
        id: string;
        name: string;
        type: string;
        date: string | null;
        location: string | null;
        guest_count: number | null;
        currency: string;
        notes: string | null;
        description: string | null;
    };
}

export default function EditEventForm({ event }: EditEventFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await updateEvent(event.id, formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <Link href={`/dashboard/events/${event.id}`} className="text-sm text-muted mb-sm" style={{ display: 'block' }}>
                        ← Back to Event
                    </Link>
                    <h2>Edit Ceremony</h2>
                    <p>Update details for {event.name}</p>
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
                                defaultValue={event.name}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="type">Ceremony Type</label>
                            <select id="type" name="type" className="form-input form-select" defaultValue={event.type} required>
                                {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="date">Date</label>
                                <input id="date" name="date" type="date" className="form-input" defaultValue={event.date || ''} />
                                <span className="form-hint">Optional — set when you know</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="currency">Currency</label>
                                <select id="currency" name="currency" className="form-input form-select" defaultValue={event.currency}>
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
                                    defaultValue={event.location || ''}
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
                                    defaultValue={event.guest_count || ''}
                                    placeholder="e.g. 150"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="notes">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                className="form-input"
                                defaultValue={event.notes || ''}
                                placeholder="Any additional details..."
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-sm">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <Link href={`/dashboard/events/${event.id}`} className="btn btn-secondary">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
