export default function DashboardLoading() {
    return (
        <div className="loading-skeleton">
            {/* Page header skeleton */}
            <div className="skeleton-group">
                <div className="skeleton skeleton-text" style={{ width: '200px', height: '28px' }} />
                <div className="skeleton skeleton-text" style={{ width: '300px', height: '16px', marginTop: '8px' }} />
            </div>

            {/* Stat cards skeleton */}
            <div className="stats-grid" style={{ marginTop: '32px' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="stat-card">
                        <div className="skeleton skeleton-circle" style={{ width: '36px', height: '36px', marginBottom: '16px' }} />
                        <div className="skeleton skeleton-text" style={{ width: '80px', height: '28px' }} />
                        <div className="skeleton skeleton-text" style={{ width: '100px', height: '14px', marginTop: '8px' }} />
                    </div>
                ))}
            </div>

            {/* Content panel skeleton */}
            <div className="panel" style={{ marginTop: '24px' }}>
                <div className="panel-header">
                    <div className="skeleton skeleton-text" style={{ width: '150px', height: '18px' }} />
                </div>
                <div className="panel-body">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="list-item">
                            <div className="list-item-content" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }} />
                                <div>
                                    <div className="skeleton skeleton-text" style={{ width: '180px', height: '16px' }} />
                                    <div className="skeleton skeleton-text" style={{ width: '120px', height: '12px', marginTop: '4px' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
