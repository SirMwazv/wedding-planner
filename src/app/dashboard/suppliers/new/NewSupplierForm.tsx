'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupplier } from '@/lib/actions/suppliers';
import { SUPPLIER_CATEGORIES, SUPPLIER_STATUS_LABELS } from '@/lib/types/database';
import type { SupplierStatus } from '@/lib/types/database';
import Link from 'next/link';

interface Props {
    events: { id: string; name: string }[];
}

export default function NewSupplierForm({ events }: Props) {
    const searchParams = useSearchParams();
    const eventIdFromUrl = searchParams.get('event_id') || '';

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [eventId, setEventId] = useState(eventIdFromUrl);

    useEffect(() => {
        if (eventIdFromUrl) setEventId(eventIdFromUrl);
    }, [eventIdFromUrl]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await createSupplier(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <Link href="/dashboard/suppliers" className="text-sm text-muted mb-sm" style={{ display: 'block' }}>
                        ← Back to Suppliers
                    </Link>
                    <h2>Add Supplier</h2>
                    <p>Add a vendor or service provider — formal or informal</p>
                </div>
            </div>

            <div className="panel" style={{ maxWidth: '600px' }}>
                <div className="panel-header">
                    <span className="panel-title">Supplier Details</span>
                </div>
                <div className="panel-body">
                    {error && <div className="auth-error">{error}</div>}

                    <form action={handleSubmit}>
                        <input type="hidden" name="event_id" value={eventId} />

                        <div className="form-group">
                            <label className="form-label" htmlFor="event_select">Ceremony</label>
                            <select
                                id="event_select"
                                className="form-input form-select"
                                value={eventId}
                                onChange={(e) => setEventId(e.target.value)}
                                required
                            >
                                <option value="">Select ceremony</option>
                                {events.map((e) => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Supplier Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="form-input"
                                placeholder="e.g. Nomsa's Traditional Catering"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="category">Category</label>
                                <select id="category" name="category" className="form-input form-select">
                                    <option value="">Select category</option>
                                    {SUPPLIER_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="status">Status</label>
                                <select id="status" name="status" className="form-input form-select">
                                    {(Object.entries(SUPPLIER_STATUS_LABELS) as [SupplierStatus, string][]).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="contact_name">Contact Person</label>
                            <input id="contact_name" name="contact_name" type="text" className="form-input" placeholder="e.g. Nomsa Moyo" />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="phone">Phone</label>
                                <input id="phone" name="phone" type="tel" className="form-input" placeholder="+27 82 123 4567" />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="whatsapp_number">WhatsApp</label>
                                <input id="whatsapp_number" name="whatsapp_number" type="tel" className="form-input" placeholder="+27 82 123 4567" />
                                <span className="form-hint">Many vendors prefer WhatsApp</span>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="instagram_handle">Instagram</label>
                                <input id="instagram_handle" name="instagram_handle" type="text" className="form-input" placeholder="nomsacatering" />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email</label>
                                <input id="email" name="email" type="email" className="form-input" placeholder="vendor@example.com" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="notes">Notes</label>
                            <textarea id="notes" name="notes" className="form-input" placeholder="Pricing discussed, recommendations, etc." rows={3} />
                        </div>

                        <div className="flex gap-sm">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Supplier'}
                            </button>
                            <Link href="/dashboard/suppliers" className="btn btn-secondary">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
