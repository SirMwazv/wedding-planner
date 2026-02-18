'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Toast from '@/components/Toast';

const MESSAGES: Record<string, string> = {
    created: 'Successfully created!',
    deleted: 'Successfully deleted!',
    updated: 'Successfully updated!',
    joined: 'Successfully joined!',
};

export default function SuccessToast() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const status = searchParams.get('success');
        if (status && MESSAGES[status]) {
            setMessage(MESSAGES[status]);
            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete('success');
            router.replace(url.pathname + url.search, { scroll: false });
        }
    }, [searchParams, router]);

    return <Toast message={message} onClose={() => setMessage(null)} />;
}
