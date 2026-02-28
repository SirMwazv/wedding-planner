/**
 * JubileeLine — Horizontal milestone timeline component
 * Inspired by the London Jubilee Line tube map.
 * 
 * Renders milestones as connected nodes on a horizontal line.
 * Supports full-size and compact (dashboard card) modes.
 */

interface Milestone {
    id: string;
    title: string;
    status: string;
    due_date: string | null;
    sort_order: number;
}

interface JubileeLineProps {
    milestones: Milestone[];
    eventColor?: string;
    compact?: boolean;
}

const STATUS_COLORS: Record<string, { dot: string; bg: string }> = {
    completed: { dot: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    in_progress: { dot: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    pending: { dot: 'var(--color-text-tertiary)', bg: 'var(--color-bg)' },
};

export default function JubileeLine({ milestones, eventColor = 'var(--color-sidebar)', compact = false }: JubileeLineProps) {
    if (milestones.length === 0) {
        return (
            <div className="jubilee-empty">
                <span className="text-xs text-muted">No milestones yet — mark tasks as milestones to build your timeline</span>
            </div>
        );
    }

    const completedCount = milestones.filter(m => m.status === 'completed').length;
    const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    return (
        <div className={`jubilee-line ${compact ? 'jubilee-compact' : ''}`}>
            {/* Progress summary */}
            {!compact && (
                <div className="jubilee-summary">
                    <span className="text-xs text-muted">{completedCount} of {milestones.length} milestones completed</span>
                    <span className="text-xs font-mono" style={{ color: completedCount === milestones.length ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                        {progressPercent}%
                    </span>
                </div>
            )}

            {/* Timeline track */}
            <div className="jubilee-track">
                {/* Background line */}
                <div className="jubilee-rail" style={{ background: 'var(--color-border-light)' }} />
                {/* Filled portion */}
                <div
                    className="jubilee-rail jubilee-rail-filled"
                    style={{
                        background: eventColor,
                        width: milestones.length > 1
                            ? `${(completedCount / (milestones.length - 1)) * 100}%`
                            : completedCount > 0 ? '100%' : '0%',
                    }}
                />

                {/* Nodes */}
                {milestones.map((m, i) => {
                    const colors = STATUS_COLORS[m.status] || STATUS_COLORS.pending;
                    const leftPercent = milestones.length > 1 ? (i / (milestones.length - 1)) * 100 : 50;

                    return (
                        <div
                            key={m.id}
                            className="jubilee-node"
                            style={{ left: `${leftPercent}%` }}
                        >
                            <div
                                className={`jubilee-dot ${m.status === 'completed' ? 'jubilee-dot-completed' : m.status === 'in_progress' ? 'jubilee-dot-active' : ''}`}
                                style={{
                                    borderColor: m.status === 'completed' ? 'var(--color-success)' : m.status === 'in_progress' ? 'var(--color-warning)' : 'var(--color-border)',
                                    background: m.status === 'completed' ? 'var(--color-success)' : 'white',
                                }}
                                title={`${m.title} — ${m.status.replace('_', ' ')}`}
                            >
                                {m.status === 'completed' && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            {!compact && (
                                <div className="jubilee-label">
                                    <div className={`jubilee-label-title ${m.status === 'completed' ? 'completed' : ''}`}>
                                        {m.title}
                                    </div>
                                    {m.due_date && (
                                        <div className="jubilee-label-date">
                                            {new Date(m.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Compact progress text */}
            {compact && (
                <div className="jubilee-compact-summary">
                    <span className="text-xs text-muted">{completedCount}/{milestones.length} milestones</span>
                </div>
            )}
        </div>
    );
}
