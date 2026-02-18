'use client';

import { useState } from 'react';

interface DeleteButtonProps {
    onDelete: () => Promise<{ error?: string } | void>;
    itemName: string;
    className?: string;
}

export default function DeleteButton({ onDelete, itemName, className }: DeleteButtonProps) {
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setLoading(true);
        const result = await onDelete();
        if (result?.error) {
            alert(result.error);
            setLoading(false);
            setConfirming(false);
        }
        // If successful, the server action will redirect
    }

    if (confirming) {
        return (
            <div className={`flex items-center gap-2 ${className || ''}`}>
                <span className="text-sm text-danger">Delete {itemName}?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="btn btn-sm"
                    style={{ background: 'var(--color-danger)', color: 'white', fontSize: '12px', padding: '4px 12px' }}
                >
                    {loading ? '...' : 'Yes, delete'}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '12px', padding: '4px 12px' }}
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className={`btn btn-ghost btn-sm ${className || ''}`}
            style={{ color: 'var(--color-danger)', fontSize: '12px' }}
        >
            🗑️ Delete
        </button>
    );
}
