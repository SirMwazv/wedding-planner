'use client';

import { useState } from 'react';
import { updateSupplier } from '@/lib/actions/suppliers';
import { SUPPLIER_CATEGORIES, SUPPLIER_STATUS_LABELS } from '@/lib/types/database';
import type { SupplierStatus } from '@/lib/types/database';
import Link from 'next/link';

interface EditSupplierFormProps {
    supplier: {
        id: string;
        name: string;
        category: string | null;
        status: string;
        contact_name: string | null;
        phone: string | null;
        whatsapp_number: string | null;
        instagram_handle: string | null;
        email: string | null;
        notes: string | null;
    };
}

export default function EditSupplierForm({ supplier }: EditSupplierFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await updateSupplier(supplier.id, formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <Link href={`/dashboard/suppliers/${supplier.id}`} className="text-sm text-muted mb-sm" style={{ display: 'block' }}>
                        ← Back to Supplier
                    </Link>
                    <h2>Edit Supplier</h2>
                    <p>Update details for {supplier.name}</p>
                </div>
            </div>

            <div className="panel" style={{ maxWidth: '600px' }}>
                <div className="panel-header">
                    <span className="panel-title">Supplier Details</span>
                </div>
                <div className="panel-body">
                    {error && <div className="auth-error">{error}</div>}

                    <form action={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Supplier Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="form-input"
                                defaultValue={supplier.name}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="category">Category</label>
                                <select id="category" name="category" className="form-input form-select" defaultValue={supplier.category || ''}>
                                    <option value="">Select category</option>
                                    {SUPPLIER_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="status">Status</label>
                                <select id="status" name="status" className="form-input form-select" defaultValue={supplier.status}>
                                    {(Object.entries(SUPPLIER_STATUS_LABELS) as [SupplierStatus, string][]).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="contact_name">Contact Person</label>
                            <input id="contact_name" name="contact_name" type="text" className="form-input" defaultValue={supplier.contact_name || ''} />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="phone">Phone</label>
                                <input id="phone" name="phone" type="tel" className="form-input" defaultValue={supplier.phone || ''} />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="whatsapp_number">WhatsApp</label>
                                <input id="whatsapp_number" name="whatsapp_number" type="tel" className="form-input" defaultValue={supplier.whatsapp_number || ''} />
                                <span className="form-hint">Many vendors prefer WhatsApp</span>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="instagram_handle">Instagram</label>
                                <input id="instagram_handle" name="instagram_handle" type="text" className="form-input" defaultValue={supplier.instagram_handle || ''} />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email</label>
                                <input id="email" name="email" type="email" className="form-input" defaultValue={supplier.email || ''} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="notes">Notes</label>
                            <textarea id="notes" name="notes" className="form-input" defaultValue={supplier.notes || ''} rows={3} />
                        </div>

                        <div className="flex gap-sm">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <Link href={`/dashboard/suppliers/${supplier.id}`} className="btn btn-secondary">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
