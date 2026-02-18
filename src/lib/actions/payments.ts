'use server';

import { createClient } from '@/lib/supabase/server';
import type { CreatePaymentData, PaymentMethod, Currency } from '@/lib/types/database';

export async function getPayments(quoteId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('quote_id', quoteId)
        .order('paid_at', { ascending: false });

    return data || [];
}

export async function createPayment(formData: FormData) {
    const supabase = await createClient();

    const paymentData: CreatePaymentData = {
        quote_id: formData.get('quote_id') as string,
        amount: parseFloat(formData.get('amount') as string) || 0,
        currency: (formData.get('currency') as Currency) || 'ZAR',
        method: (formData.get('method') as PaymentMethod) || 'bank_transfer',
        reference: (formData.get('reference') as string) || undefined,
        notes: (formData.get('notes') as string) || undefined,
    };

    const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

    if (error) return { error: error.message };

    // Update deposit_paid on the quote
    const { data: existingPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('quote_id', paymentData.quote_id);

    const totalPaid = (existingPayments || []).reduce(
        (sum, p) => sum + Number(p.amount),
        0
    );

    await supabase
        .from('quotes')
        .update({ deposit_paid: totalPaid })
        .eq('id', paymentData.quote_id);

    return { data };
}

export async function deletePayment(id: string, quoteId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) return { error: error.message };

    // Recalculate deposit_paid
    const { data: remainingPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('quote_id', quoteId);

    const totalPaid = (remainingPayments || []).reduce(
        (sum, p) => sum + Number(p.amount),
        0
    );

    await supabase
        .from('quotes')
        .update({ deposit_paid: totalPaid })
        .eq('id', quoteId);

    return { success: true };
}
