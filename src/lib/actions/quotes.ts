'use server';

import { createClient } from '@/lib/supabase/server';
import type { Currency } from '@/lib/types/database';

export async function getQuotes(supplierId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('quotes')
        .select('*, payments(*)')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

    return data || [];
}

export async function createQuote(formData: FormData) {
    const supabase = await createClient();

    const quoteData = {
        supplier_id: formData.get('supplier_id') as string,
        amount: parseFloat(formData.get('amount') as string) || 0,
        currency: (formData.get('currency') as Currency) || 'ZAR',
        deposit_required: parseFloat(formData.get('deposit_required') as string) || 0,
        deposit_paid: parseFloat(formData.get('deposit_paid') as string) || 0,
        due_date: (formData.get('due_date') as string) || undefined,
        quote_file_url: (formData.get('quote_file_url') as string) || undefined,
        notes: (formData.get('notes') as string) || undefined,
    };

    const { data, error } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select()
        .single();

    if (error) return { error: error.message };
    return { data };
}

export async function updateQuote(id: string, formData: FormData) {
    const supabase = await createClient();

    const updates = {
        amount: parseFloat(formData.get('amount') as string) || 0,
        currency: formData.get('currency') as string,
        deposit_required: parseFloat(formData.get('deposit_required') as string) || 0,
        deposit_paid: parseFloat(formData.get('deposit_paid') as string) || 0,
        due_date: (formData.get('due_date') as string) || null,
        notes: (formData.get('notes') as string) || null,
        is_accepted: formData.get('is_accepted') === 'true',
    };

    const { error } = await supabase.from('quotes').update(updates).eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
}

export async function deleteQuote(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('quotes').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
}

/**
 * Upload a quote file to Supabase Storage
 */
export async function uploadQuoteFile(formData: FormData) {
    const supabase = await createClient();
    const file = formData.get('file') as File;
    const supplierId = formData.get('supplier_id') as string;

    if (!file) return { error: 'No file provided' };

    const ext = file.name.split('.').pop();
    const path = `quotes/${supplierId}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
        .from('documents')
        .upload(path, file);

    if (error) return { error: error.message };

    const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path);

    return { url: urlData.publicUrl };
}
