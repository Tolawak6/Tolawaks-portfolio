import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently in view so the header can highlight the
 * matching nav link.
 *
 * Uses a single IntersectionObserver over the section elements and picks the
 * entry closest to the top of the viewport. Cheaper and smoother than a scroll
 * listener that measures on every frame.
 *
 * @param {string[]} sectionIds  element ids to observe, in page order
 */
export function useScrollSpy(sectionIds) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (elements.length === 0) return undefined;

    // Track ratios for every section so the "most visible" one can win.
    const ratios = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let bestId = null;
        let bestRatio = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (bestId) setActiveId(bestId);
      },
      {
        // Sample at several thresholds so medium-sized sections register.
        threshold: [0, 0.15, 0.3, 0.5, 0.75, 1],
        rootMargin: '-12% 0px -45% 0px',
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}

/**
 * True once the page has scrolled past `offset` pixels.
 * Used to give the header a solid background only after the hero starts moving.
 */
export function useScrolled(offset = 12) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      // Coalesce scroll events into one read per frame.
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > offset);
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [offset]);

  return scrolled;
}
