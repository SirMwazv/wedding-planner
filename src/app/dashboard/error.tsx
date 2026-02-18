'use client';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="empty-state-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>
                {error.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <button className="btn btn-primary" onClick={reset}>
                Try Again
            </button>
        </div>
    );
}
