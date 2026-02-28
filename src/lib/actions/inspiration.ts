'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentCouple } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface InspirationPhoto {
    id: string;
    couple_id: string;
    file_url: string;
    file_path: string;
    caption: string | null;
    created_at: string;
}

export async function getInspirationPhotos(): Promise<InspirationPhoto[]> {
    const coupleData = await getCurrentCouple();
    if (!coupleData) return [];

    const supabase = await createClient();
    const { data } = await supabase
        .from('inspiration_photos')
        .select('*')
        .eq('couple_id', coupleData.couple.id)
        .order('created_at', { ascending: false });

    return (data as InspirationPhoto[]) || [];
}

export async function uploadInspirationPhoto(formData: FormData) {
    const coupleData = await getCurrentCouple();
    if (!coupleData) return { error: 'No couple found' };

    const supabase = await createClient();
    const file = formData.get('file') as File;
    const caption = (formData.get('caption') as string) || null;

    if (!file || file.size === 0) return { error: 'No file provided' };

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        return { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
        return { error: 'File size must be under 10MB' };
    }

    const ext = file.name.split('.').pop();
    const path = `${coupleData.couple.id}/${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('inspiration')
        .upload(path, file);

    if (uploadError) return { error: uploadError.message };

    const { data: urlData } = supabase.storage
        .from('inspiration')
        .getPublicUrl(uploadData.path);

    const { error: insertError } = await supabase
        .from('inspiration_photos')
        .insert({
            couple_id: coupleData.couple.id,
            file_url: urlData.publicUrl,
            file_path: uploadData.path,
            caption,
        });

    if (insertError) return { error: insertError.message };

    revalidatePath('/dashboard/inspiration');
    return { success: true };
}

export async function deleteInspirationPhoto(id: string) {
    const coupleData = await getCurrentCouple();
    if (!coupleData) return { error: 'No couple found' };

    const supabase = await createClient();

    // Get the photo first to delete the file
    const { data: photo } = await supabase
        .from('inspiration_photos')
        .select('file_path')
        .eq('id', id)
        .single();

    if (photo?.file_path) {
        await supabase.storage
            .from('inspiration')
            .remove([photo.file_path]);
    }

    const { error } = await supabase
        .from('inspiration_photos')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/inspiration');
    return { success: true };
}
