import { useState, useEffect } from 'react';
export const useIntersectionObserver = (elementRef, options) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    useEffect(() => {
        const element = elementRef.current;
        if (!element) {
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, {
            root: options?.root || null,
            rootMargin: options?.rootMargin || '0px',
            threshold: options?.threshold || 0.1, // Default to 10% visibility
        });
        observer.observe(element);
        return () => {
            observer.unobserve(element);
        };
    }, [elementRef, options]); // Re-run effect if ref or options change
    return isIntersecting;
};
