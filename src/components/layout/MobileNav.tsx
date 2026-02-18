'use client';

import { useState, useEffect, ReactNode } from 'react';

interface MobileNavProps {
    children: ReactNode;
}

export default function MobileNav({ children }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Close on route change (listen for popstate)
    useEffect(() => {
        const handleRouteChange = () => setIsOpen(false);
        window.addEventListener('popstate', handleRouteChange);
        return () => window.removeEventListener('popstate', handleRouteChange);
    }, []);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <>
            {/* Hamburger button — only visible on mobile */}
            <button
                className="mobile-nav-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation"
            >
                <span className={`hamburger ${isOpen ? 'open' : ''}`}>
                    <span />
                    <span />
                    <span />
                </span>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="mobile-nav-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar wrapper with mobile class */}
            <div className={`sidebar-mobile-wrapper ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
                {children}
            </div>
        </>
    );
}
