import { useEffect } from 'react';

/**
 * Adds a subtle fade-up as elements scroll into view.
 *
 * Elements opt in with `data-reveal`, and any container marked
 * `data-reveal-group` staggers its children.
 *
 * Two details matter here:
 *
 *  1. Content is rendered by the API response, not at mount. Project cards,
 *     the "no projects yet" block and admin table rows all appear later, so a
 *     MutationObserver registers newly added [data-reveal] elements as they
 *     arrive. Without it, anything rendered after the first paint would stay
 *     at opacity 0 forever.
 *
 *  2. Anything already inside the viewport is revealed immediately rather than
 *     waiting for a scroll - otherwise a short page could hide content that
 *     never triggers an intersection.
 *
 * Implemented with IntersectionObserver and a class toggle rather than an
 * animation library: no dependency, no layout thrash, and everything stays
 * visible when JavaScript or animation is unavailable.
 */
export function useRevealOnScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsObserver = 'IntersectionObserver' in window;

    /* ---------------------------------------------------------------
     * No observer, or the user prefers reduced motion: reveal everything
     * up front and keep it that way as new nodes appear.
     * --------------------------------------------------------------- */
    if (prefersReducedMotion || !supportsObserver) {
      const revealAll = (root = document) => {
        root.querySelectorAll?.('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
      };
      revealAll();

      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            if (node.matches?.('[data-reveal]')) node.classList.add('is-revealed');
            revealAll(node);
          });
        });
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });

      return () => mutationObserver.disconnect();
    }

    /* ---------------------------------------------------------------
     * Normal path: reveal once, then stop tracking that element.
     *
     * The set of already-registered elements is scoped to THIS effect run
     * rather than stored on the DOM node. React StrictMode invokes effects
     * twice in development; the first observer is disconnected on cleanup, so
     * a guard that survived on the element would leave those nodes with no
     * live observer and they would stay at opacity 0 forever.
     * --------------------------------------------------------------- */
    const registered = new WeakSet();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    /** Registers one element, revealing it at once if it is already on screen. */
    function register(element) {
      // Anything already revealed needs no further work.
      if (element.classList.contains('is-revealed')) return;
      if (registered.has(element)) return;
      registered.add(element);

      const rect = element.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

      if (inViewport) element.classList.add('is-revealed');
      else observer.observe(element);
    }

    /** Applies the staggered delay to each direct child of a reveal group. */
    function applyStagger(group) {
      Array.from(group.children).forEach((child, index) => {
        child.style.setProperty('--reveal-delay', `${Math.min(index, 8) * 70}ms`);
      });
    }

    function scan(root = document) {
      root.querySelectorAll?.('[data-reveal-group]').forEach(applyStagger);
      if (root.matches?.('[data-reveal-group]')) applyStagger(root);

      if (root.matches?.('[data-reveal]')) register(root);
      root.querySelectorAll?.('[data-reveal]').forEach(register);
    }

    scan();

    // Pick up elements rendered later (API results, admin rows, tab panels).
    const mutationObserver = new MutationObserver((mutations) => {
      const touched = new Set();
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) touched.add(node);
        });
      });
      touched.forEach((node) => scan(node));
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}

export default useRevealOnScroll;
