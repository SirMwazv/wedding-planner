'use client';

import { useState, useTransition } from 'react';
import { updateTaskStatus } from '@/lib/actions/tasks';
import type { TaskStatus } from '@/lib/types/database';

interface TaskCheckboxProps {
    taskId: string;
    currentStatus: TaskStatus;
}

export default function TaskCheckbox({ taskId, currentStatus }: TaskCheckboxProps) {
    const [status, setStatus] = useState<TaskStatus>(currentStatus);
    const [isPending, startTransition] = useTransition();

    const isCompleted = status === 'completed';

    function handleToggle() {
        const newStatus: TaskStatus = isCompleted ? 'pending' : 'completed';
        // Optimistic update
        setStatus(newStatus);

        startTransition(async () => {
            const result = await updateTaskStatus(taskId, newStatus);
            if (result?.error) {
                // Revert on error
                setStatus(currentStatus);
            }
        });
    }

    return (
        <div
            className={`task-checkbox ${isCompleted ? 'checked' : ''} ${isPending ? 'pending' : ''}`}
            onClick={handleToggle}
            role="checkbox"
            aria-checked={isCompleted}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
        >
            {isCompleted && '✓'}
        </div>
    );
}
