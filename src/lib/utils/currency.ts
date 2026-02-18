import type { Currency } from '@/lib/types/database';

const CURRENCY_SYMBOLS: Record<string, string> = {
    ZAR: 'R',
    USD: '$',
    BWP: 'P',
    ZMW: 'K',
    GBP: '£',
    EUR: '€',
};

const CURRENCY_LOCALES: Record<string, string> = {
    ZAR: 'en-ZA',
    USD: 'en-US',
    BWP: 'en-BW',
    ZMW: 'en-ZM',
    GBP: 'en-GB',
    EUR: 'de-DE',
};

export function formatCurrency(amount: number, currency: Currency = 'ZAR'): string {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatted = new Intl.NumberFormat(CURRENCY_LOCALES[currency] || 'en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    return `${symbol}${formatted}`;
}

export function formatDate(dateString: string | null): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatRelativeDate(dateString: string | null): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days}d`;
    if (days < 30) return `${Math.ceil(days / 7)}w`;
    return formatDate(dateString);
}
