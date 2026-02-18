import { getCurrentCouple } from '@/lib/supabase/server';
import CoupleRequired from '@/components/CoupleRequired';
import { getEvents } from '@/lib/actions/events';
import { getAllTasks } from '@/lib/actions/tasks';
import { formatDate } from '@/lib/utils/currency';
import TaskActions from './TaskActions';
import TaskCheckbox from './TaskCheckbox';
import type { TaskStatus } from '@/lib/types/database';

const CEREMONY_COLORS: Record<string, string> = {
    white_wedding: 'var(--color-ceremony-white)',
    traditional: 'var(--color-ceremony-traditional)',
    kitchen_party: 'var(--color-ceremony-kitchen)',
    lobola: 'var(--color-ceremony-lobola)',
};

type Task = {
    id: string;
    event_id: string;
    title: string;
    description: string | null;
    status: string;
    due_date: string | null;
    assigned_to: string | null;
    events?: { name: string; couple_id?: string };
};

type EventInfo = {
    id: string;
    name: string;
    type: string;
};

export default async function TasksPage() {
    const coupleData = await getCurrentCouple();
    if (!coupleData) return <CoupleRequired />;

    const events = await getEvents() as EventInfo[];
    const tasks = await getAllTasks() as Task[];

    // Stats
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const overdueTasks = tasks.filter((t) =>
        t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()
    ).length;

    // Group tasks by event
    const tasksByEvent: Record<string, Task[]> = {};
    tasks.forEach((t) => {
        const eventName = t.events?.name || 'Unassigned';
        if (!tasksByEvent[eventName]) tasksByEvent[eventName] = [];
        tasksByEvent[eventName].push(t);
    });

    // Get event types for colors
    const eventTypeMap: Record<string, string> = {};
    events.forEach((e) => {
        eventTypeMap[e.name] = e.type;
    });

    return (
        <>
            <div className="page-header">
                <div>
                    <h2>Tasks</h2>
                    <p>Manage your wedding planning checklist</p>
                </div>
                <div className="page-header-actions">
                    <TaskActions events={events.map((e) => ({ id: e.id, name: e.name }))} />
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-value">{totalTasks}</div>
                    <div className="stat-label">Total Tasks</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{pendingTasks}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>{completedTasks}</div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🚨</div>
                    <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{overdueTasks}</div>
                    <div className="stat-label">Overdue</div>
                </div>
            </div>

            {/* Tasks List */}
            {totalTasks === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">✅</div>
                        <h3>No tasks yet</h3>
                        <p>Start adding tasks to your wedding planning checklist</p>
                    </div>
                </div>
            ) : (
                <div className="panel">
                    <div className="panel-body">
                        {Object.entries(tasksByEvent).map(([eventName, eventTasks]) => {
                            const eventType = eventTypeMap[eventName] || 'white_wedding';
                            const dotColor = CEREMONY_COLORS[eventType] || 'var(--color-ceremony-white)';

                            return (
                                <div key={eventName}>
                                    <div className="task-group-header">
                                        <span className="group-dot" style={{ background: dotColor }} />
                                        {eventName}
                                    </div>

                                    {eventTasks.map((task) => {
                                        const isCompleted = task.status === 'completed';
                                        const isOverdue = !isCompleted && task.due_date && new Date(task.due_date) < new Date();

                                        return (
                                            <div key={task.id} className="task-item">
                                                <TaskCheckbox
                                                    taskId={task.id}
                                                    currentStatus={task.status as TaskStatus}
                                                />
                                                <div className="task-content">
                                                    <div className={`task-title ${isCompleted ? 'completed' : ''}`}>
                                                        {task.title}
                                                    </div>
                                                    {task.description && (
                                                        <div className="text-xs text-muted">{task.description}</div>
                                                    )}
                                                </div>
                                                <div className="task-meta">
                                                    {task.assigned_to && (
                                                        <span className="badge badge-category">{task.assigned_to}</span>
                                                    )}
                                                    {task.due_date && (
                                                        <span className={`text-sm ${isOverdue ? 'text-outstanding' : 'text-muted'}`}>
                                                            {formatDate(task.due_date)}
                                                        </span>
                                                    )}
                                                    {isOverdue && (
                                                        <span className="badge badge-priority-high">Overdue</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}
