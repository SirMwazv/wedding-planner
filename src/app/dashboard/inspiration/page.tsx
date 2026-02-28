import { getCurrentCouple } from '@/lib/supabase/server';
import CoupleRequired from '@/components/CoupleRequired';
import { getInspirationPhotos } from '@/lib/actions/inspiration';
import InspirationGallery from './InspirationGallery';

export default async function InspirationPage() {
    const coupleData = await getCurrentCouple();
    if (!coupleData) return <CoupleRequired />;

    const photos = await getInspirationPhotos();

    return (
        <InspirationGallery photos={photos} />
    );
}
