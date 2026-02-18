'use client';

import { useState } from 'react';
import { createTask } from '@/lib/actions/tasks';

interface TaskActionsProps {
    events: { id: string; name: string }[];
}

export default function TaskActions({ events }: TaskActionsProps) {
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await createTask(formData);
        if (result?.error) {
            setError(result.error);
        } else {
            setShowForm(false);
            window.location.reload();
        }
        setLoading(false);
    }

    return (
        <>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                + Add Task
            </button>

            {showForm && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="modal-content">
                        <h3>Add Task</h3>
                        {error && <div className="auth-error">{error}</div>}

                        <form action={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="event_id">Ceremony</label>
                                <select id="event_id" name="event_id" className="form-input form-select" required>
                                    <option value="">Select ceremony</option>
                                    {events.map((e) => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="title">Task Title</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Book photographer"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="form-input"
                                    rows={2}
                                    placeholder="Optional details..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="due_date">Due Date</label>
                                    <input id="due_date" name="due_date" type="date" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="assigned_to">Assigned To</label>
                                    <input
                                        id="assigned_to"
                                        name="assigned_to"
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Bride"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-sm">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Task'}
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
