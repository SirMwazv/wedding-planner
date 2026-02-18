'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { SupplierStatus } from '@/lib/types/database';

export async function getSuppliers(eventId?: string) {
    const supabase = await createClient();

    let query = supabase.from('suppliers').select('*, quotes(*)');

    if (eventId) {
        query = query.eq('event_id', eventId);
    }

    const { data } = await query.order('created_at', { ascending: false });
    return data || [];
}

export async function getAllSuppliers() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('suppliers')
        .select('*, quotes(*), events(name, type)')
        .order('created_at', { ascending: false });
    return data || [];
}

export async function getSupplier(id: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('suppliers')
        .select('*, quotes(*, payments(*)), events(name, type, currency)')
        .eq('id', id)
        .single();

    return data;
}

export async function createSupplier(formData: FormData) {
    const supabase = await createClient();

    const supplierData = {
        event_id: formData.get('event_id') as string,
        name: formData.get('name') as string,
        category: (formData.get('category') as string) || undefined,
        contact_name: (formData.get('contact_name') as string) || undefined,
        phone: (formData.get('phone') as string) || undefined,
        whatsapp_number: (formData.get('whatsapp_number') as string) || undefined,
        instagram_handle: (formData.get('instagram_handle') as string) || undefined,
        email: (formData.get('email') as string) || undefined,
        notes: (formData.get('notes') as string) || undefined,
        status: (formData.get('status') as SupplierStatus) || 'researching',
    };

    const { error } = await supabase.from('suppliers').insert(supplierData);

    if (error) return { error: error.message };

    redirect('/dashboard/suppliers?success=created');
}

export async function updateSupplier(id: string, formData: FormData) {
    const supabase = await createClient();

    const updates = {
        name: formData.get('name') as string,
        category: (formData.get('category') as string) || null,
        contact_name: (formData.get('contact_name') as string) || null,
        phone: (formData.get('phone') as string) || null,
        whatsapp_number: (formData.get('whatsapp_number') as string) || null,
        instagram_handle: (formData.get('instagram_handle') as string) || null,
        email: (formData.get('email') as string) || null,
        notes: (formData.get('notes') as string) || null,
        status: formData.get('status') as SupplierStatus,
    };

    const { error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id);

    if (error) return { error: error.message };

    redirect(`/dashboard/suppliers/${id}`);
}

export async function deleteSupplier(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) return { error: error.message };
    redirect('/dashboard/suppliers?success=deleted');
}
