'use client';

import { useEffect } from 'react';

interface ToastProps {
    message: string | null;
    type?: 'success' | 'error';
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    const bgColor = type === 'success' ? 'var(--color-success, #22c55e)' : 'var(--color-danger, #ef4444)';

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                background: bgColor,
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 9999,
                animation: 'fadeInUp 0.3s ease',
            }}
        >
            {type === 'success' ? '✅' : '❌'} {message}
        </div>
    );
}
