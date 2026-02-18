'use client';

import { useState } from 'react';
import { deleteSupplier } from '@/lib/actions/suppliers';

interface SupplierDeleteProps {
    supplierId: string;
}

export default function SupplierDelete({ supplierId }: SupplierDeleteProps) {
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setLoading(true);
        const result = await deleteSupplier(supplierId);
        if (result?.error) {
            alert(result.error);
            setLoading(false);
            setConfirming(false);
        }
        // deleteSupplier redirects on success
    }

    if (confirming) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--color-danger)' }}>Delete this supplier?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="btn btn-danger btn-sm"
                >
                    {loading ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="btn btn-secondary btn-sm"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="btn btn-outline-danger btn-sm"
        >
            🗑️ Delete
        </button>
    );
}
