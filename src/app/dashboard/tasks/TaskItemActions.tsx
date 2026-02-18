'use client';

import { useState } from 'react';
import { deleteTask } from '@/lib/actions/tasks';
import { useRouter } from 'next/navigation';
import TaskEdit from './TaskEdit';

interface TaskItemActionsProps {
    task: {
        id: string;
        title: string;
        description: string | null;
        due_date: string | null;
        assigned_to: string | null;
    };
}

export default function TaskItemActions({ task }: TaskItemActionsProps) {
    const [showEdit, setShowEdit] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        setLoading(true);
        const result = await deleteTask(task.id);
        if (result?.error) {
            alert(result.error);
            setLoading(false);
            setConfirming(false);
        } else {
            router.refresh();
        }
    }

    return (
        <>
            <div className="flex items-center gap-1" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                {confirming ? (
                    <>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="btn btn-danger btn-sm"
                        >
                            {loading ? '...' : 'Delete'}
                        </button>
                        <button
                            onClick={() => setConfirming(false)}
                            className="btn btn-secondary btn-sm"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setShowEdit(true)}
                            className="btn btn-ghost btn-sm"
                            title="Edit task"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => setConfirming(true)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                            title="Delete task"
                        >
                            🗑️
                        </button>
                    </>
                )}
            </div>

            {showEdit && (
                <TaskEdit task={task} onClose={() => setShowEdit(false)} />
            )}
        </>
    );
}
