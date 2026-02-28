import { getSupplier } from '@/lib/actions/suppliers';
import { SUPPLIER_STATUS_LABELS } from '@/lib/types/database';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { SupplierStatus, Currency, PaymentMethod } from '@/lib/types/database';
import QuoteCards from './QuoteCards';
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
        social_media: string | null;
        email: string | null;
        notes: string | null;
        quoted_amount: number;
        paid_amount: number;
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
                        {s.social_media && (
                            <div className="list-item">
                                <div className="list-item-content">
                                    <div className="list-item-subtitle">Social Media</div>
                                    <div className="list-item-title">🌐 {s.social_media}</div>
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
                        {!s.contact_name && !s.phone && !s.whatsapp_number && !s.social_media && !s.email && (
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

            {/* Quotes — fully interactive client component */}
            <QuoteCards
                supplierId={s.id}
                eventCurrency={eventCurrency}
                quotes={quotes}
            />
        </>
    );
}
