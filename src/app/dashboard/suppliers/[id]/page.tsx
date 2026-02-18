import { getSupplier } from '@/lib/actions/suppliers';
import { SUPPLIER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/types/database';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils/currency';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { SupplierStatus, Currency, PaymentMethod } from '@/lib/types/database';
import SupplierActions from './SupplierActions';
import SupplierDelete from './SupplierDelete';

const STATUS_BADGE: Record<string, string> = {
    researching: 'badge-default',
    contacted: 'badge-info',
    quoted: 'badge-info',
    negotiating: 'badge-warning',
    booked: 'badge-success',
    rejected: 'badge-danger',
};

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supplier = await getSupplier(id);
    if (!supplier) notFound();

    const s = supplier as {
        id: string;
        name: string;
        category: string | null;
        status: SupplierStatus;
        contact_name: string | null;
        phone: string | null;
        whatsapp_number: string | null;
        instagram_handle: string | null;
        email: string | null;
        notes: string | null;
        events?: { name: string; type: string; currency: string };
        quotes?: Array<{
            id: string;
            amount: number;
            currency: string;
            deposit_required: number;
            deposit_paid: number;
            outstanding_balance: number;
            due_date: string | null;
            notes: string | null;
            is_accepted: boolean;
            quote_file_url: string | null;
            payments?: Array<{
                id: string;
                amount: number;
                currency: string;
                paid_at: string;
                method: PaymentMethod;
                reference: string | null;
            }>;
        }>;
    };

    const eventCurrency = ((s.events as { currency: string } | undefined)?.currency || 'ZAR') as Currency;
    const quotes = s.quotes || [];
    const totalQuoted = quotes.reduce((sum, q) => sum + Number(q.amount), 0);
    const totalPaid = quotes.reduce((sum, q) => sum + Number(q.deposit_paid), 0);
    const totalOutstanding = totalQuoted - totalPaid;

    return (
        <>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <Link href="/dashboard/suppliers" className="text-sm text-muted mb-sm" style={{ display: 'block' }}>← Back to Suppliers</Link>
                    <h2>{s.name}</h2>
                    <p>
                        {s.category && <>{s.category} · </>}
                        {s.events && <>{(s.events as { name: string }).name} · </>}
                        <span className={`badge ${STATUS_BADGE[s.status] || 'badge-default'}`}>
                            <span className="badge-dot" />
                            {SUPPLIER_STATUS_LABELS[s.status]}
                        </span>
                    </p>
                </div>
                <div className="page-header-actions">
                    <Link href={`/dashboard/suppliers/${s.id}/edit`} className="btn btn-secondary">✏️ Edit</Link>
                    <SupplierDelete supplierId={s.id} />
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid-3">
                <div className="stat-card">
                    <div className="stat-label">Total Quoted</div>
                    <div className="stat-value">{formatCurrency(totalQuoted, eventCurrency)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Paid</div>
                    <div className="stat-value" style={{ color: 'var(--color-paid)' }}>{formatCurrency(totalPaid, eventCurrency)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Outstanding</div>
                    <div className="stat-value" style={{ color: totalOutstanding > 0 ? 'var(--color-outstanding)' : 'var(--color-paid)' }}>
                        {formatCurrency(totalOutstanding, eventCurrency)}
                    </div>
                </div>
            </div>

            <div className="grid-2">
                {/* Contact Info */}
                <div className="panel">
                    <div className="panel-header">
                        <span className="panel-title">Contact Information</span>
                    </div>
                    <div className="panel-body">
                        {s.contact_name && (
                            <div className="list-item">
                                <div className="list-item-content">
                                    <div className="list-item-subtitle">Contact</div>
                                    <div className="list-item-title">{s.contact_name}</div>
                                </div>
                            </div>
                        )}
                        {s.whatsapp_number && (
                            <div className="list-item">
                                <div className="list-item-content">
                                    <div className="list-item-subtitle">WhatsApp</div>
                                    <div className="list-item-title">💬 {s.whatsapp_number}</div>
                                </div>
                            </div>
                        )}
                        {s.phone && (
                            <div className="list-item">
                                <div className="list-item-content">
                                    <div className="list-item-subtitle">Phone</div>
                                    <div className="list-item-title">📞 {s.phone}</div>
                                </div>
                            </div>
                        )}
                        {s.instagram_handle && (
                            <div className="list-item">
                                <div className="list-item-content">
                                    <div className="list-item-subtitle">Instagram</div>
                                    <div className="list-item-title">📷 @{s.instagram_handle}</div>
                                </div>
                            </div>
                        )}
                        {s.email && (
                            <div className="list-item">
                                <div className="list-item-content">
                                    <div className="list-item-subtitle">Email</div>
                                    <div className="list-item-title">✉️ {s.email}</div>
                                </div>
                            </div>
                        )}
                        {!s.contact_name && !s.phone && !s.whatsapp_number && !s.instagram_handle && !s.email && (
                            <p className="text-sm text-muted">No contact information added yet.</p>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div className="panel">
                    <div className="panel-header">
                        <span className="panel-title">Notes</span>
                    </div>
                    <div className="panel-body">
                        {s.notes ? (
                            <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{s.notes}</p>
                        ) : (
                            <p className="text-sm text-muted">No notes yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quotes */}
            <div className="panel">
                <div className="panel-header">
                    <span className="panel-title">Quotes ({quotes.length})</span>
                    <SupplierActions supplierId={s.id} eventCurrency={eventCurrency} />
                </div>
                <div className="panel-body">
                    {quotes.length === 0 ? (
                        <p className="text-sm text-muted">No quotes yet. Add a quote to start tracking costs.</p>
                    ) : (
                        quotes.map((q) => (
                            <div key={q.id} className="card mb-md" style={{ background: 'var(--color-bg)' }}>
                                <div className="flex-between mb-md">
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--text-xl)', fontFamily: 'var(--font-mono)' }}>
                                            {formatCurrency(Number(q.amount), q.currency as Currency)}
                                        </div>
                                        {q.due_date && (
                                            <div className="text-xs text-muted">Due: {formatRelativeDate(q.due_date)}</div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {q.is_accepted && <span className="badge badge-success"><span className="badge-dot" />Accepted</span>}
                                        {q.quote_file_url && (
                                            <a href={q.quote_file_url} target="_blank" rel="noopener" className="btn btn-ghost btn-sm mt-sm">
                                                📄 View File
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="grid-3" style={{ marginBottom: 'var(--space-sm)' }}>
                                    <div>
                                        <div className="text-xs text-muted">Deposit Required</div>
                                        <div className="font-mono text-sm">{formatCurrency(Number(q.deposit_required), q.currency as Currency)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted">Paid</div>
                                        <div className="font-mono text-sm" style={{ color: 'var(--color-success)' }}>
                                            {formatCurrency(Number(q.deposit_paid), q.currency as Currency)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted">Outstanding</div>
                                        <div className="font-mono text-sm" style={{ color: Number(q.outstanding_balance) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                            {formatCurrency(Number(q.outstanding_balance), q.currency as Currency)}
                                        </div>
                                    </div>
                                </div>

                                {Number(q.amount) > 0 && (
                                    <div className="progress-bar" style={{ marginBottom: 'var(--space-sm)' }}>
                                        <div
                                            className={`progress-bar-fill ${Number(q.deposit_paid) >= Number(q.amount) ? 'success' :
                                                Number(q.deposit_paid) > 0 ? 'warning' : ''
                                                }`}
                                            style={{ width: `${Math.min(100, (Number(q.deposit_paid) / Number(q.amount)) * 100)}%` }}
                                        />
                                    </div>
                                )}

                                {q.notes && <p className="text-xs text-muted">{q.notes}</p>}

                                {/* Payments */}
                                {(q.payments || []).length > 0 && (
                                    <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-sm)' }}>
                                        <div className="text-xs text-muted mb-md" style={{ fontWeight: 600 }}>PAYMENTS</div>
                                        {(q.payments || []).map((p) => (
                                            <div key={p.id} className="list-item">
                                                <div className="list-item-content">
                                                    <div className="list-item-title font-mono">{formatCurrency(Number(p.amount), p.currency as Currency)}</div>
                                                    <div className="list-item-subtitle">
                                                        {formatDate(p.paid_at)} · {PAYMENT_METHOD_LABELS[p.method]}
                                                        {p.reference && <> · Ref: {p.reference}</>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
