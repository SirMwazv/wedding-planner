'use client';

import { deleteTask } from '@/lib/actions/tasks';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TaskDelete({ taskId }: { taskId: string }) {
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        setLoading(true);
        const result = await deleteTask(taskId);
        if (result?.error) {
            alert(result.error);
            setLoading(false);
            setConfirming(false);
        } else {
            router.refresh();
        }
    }

    if (confirming) {
        return (
            <span className="flex items-center gap-1" style={{ marginLeft: 'auto' }}>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="btn btn-sm"
                    style={{ background: 'var(--color-danger)', color: 'white', fontSize: '11px', padding: '2px 8px' }}
                >
                    {loading ? '...' : 'Delete'}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                >
                    Cancel
                </button>
            </span>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--color-danger)', fontSize: '11px', padding: '2px 6px', marginLeft: 'auto', opacity: 0.6 }}
            title="Delete task"
        >
            🗑️
        </button>
    );
}
