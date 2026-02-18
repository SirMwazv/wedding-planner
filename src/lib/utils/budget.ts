import type { Quote, BudgetSummary, EventBudgetSummary, Currency, Supplier } from '@/lib/types/database';

/**
 * Calculate budget summary for a set of suppliers with their quotes.
 */
export function calculateBudgetSummary(
    suppliers: (Supplier & { quotes: Quote[] })[],
    currency: Currency = 'ZAR'
): BudgetSummary {
    let totalQuoted = 0;
    let totalDepositsRequired = 0;
    let totalDepositsPaid = 0;
    let totalOutstanding = 0;
    let totalPayments = 0;
    let bookedCount = 0;

    for (const supplier of suppliers) {
        if (supplier.status === 'booked') bookedCount++;

        for (const quote of supplier.quotes || []) {
            totalQuoted += Number(quote.amount) || 0;
            totalDepositsRequired += Number(quote.deposit_required) || 0;
            totalDepositsPaid += Number(quote.deposit_paid) || 0;
            totalOutstanding += Number(quote.outstanding_balance) || 0;
            totalPayments += Number(quote.deposit_paid) || 0;
        }
    }

    return {
        total_quoted: totalQuoted,
        total_deposits_required: totalDepositsRequired,
        total_deposits_paid: totalDepositsPaid,
        total_outstanding: totalOutstanding,
        total_payments: totalPayments,
        currency,
        supplier_count: suppliers.length,
        booked_count: bookedCount,
    };
}

/**
 * Calculate budget summary per event.
 */
export function calculateEventBudgets(
    events: { id: string; name: string; currency: Currency }[],
    suppliers: (Supplier & { quotes: Quote[]; event_id: string })[]
): EventBudgetSummary[] {
    return events.map((event) => {
        const eventSuppliers = suppliers.filter((s) => s.event_id === event.id);
        const summary = calculateBudgetSummary(eventSuppliers, event.currency);
        return {
            ...summary,
            event_id: event.id,
            event_name: event.name,
        };
    });
}

/**
 * Calculate budget utilization percentage.
 */
export function calculateUtilization(quoted: number, paid: number): number {
    if (quoted === 0) return 0;
    return Math.round((paid / quoted) * 100);
}
