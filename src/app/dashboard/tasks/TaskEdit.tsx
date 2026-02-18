'use client';

import { useState } from 'react';
import { updateTask } from '@/lib/actions/tasks';
import { useRouter } from 'next/navigation';

interface Member {
    id: string;
    role: string;
    display_name: string;
}

interface TaskEditProps {
    task: {
        id: string;
        title: string;
        description: string | null;
        due_date: string | null;
        assigned_to: string | null;
    };
    members: Member[];
    onClose: () => void;
}

export default function TaskEdit({ task, members, onClose }: TaskEditProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await updateTask(task.id, formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            onClose();
            router.refresh();
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h3>Edit Task</h3>
                {error && <div className="auth-error">{error}</div>}

                <form action={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="edit_title">Task Title</label>
                        <input
                            id="edit_title"
                            name="title"
                            type="text"
                            className="form-input"
                            defaultValue={task.title}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="edit_description">Description</label>
                        <textarea
                            id="edit_description"
                            name="description"
                            className="form-input"
                            rows={2}
                            defaultValue={task.description || ''}
                            placeholder="Optional details..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="edit_due_date">Due Date</label>
                            <input
                                id="edit_due_date"
                                name="due_date"
                                type="date"
                                className="form-input"
                                defaultValue={task.due_date || ''}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="edit_assigned_to">Assigned To</label>
                            <select
                                id="edit_assigned_to"
                                name="assigned_to"
                                className="form-input form-select"
                                defaultValue={task.assigned_to || ''}
                            >
                                <option value="">Unassigned</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.display_name} ({m.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-sm">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
