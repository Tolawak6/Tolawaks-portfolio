import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Handles scrolling for hash links across routes.
 *
 * In-page links (#about) scroll natively thanks to `scroll-behavior: smooth`.
 * This component covers the cross-route case - for example following
 * "/#projects" from the admin page - and resets scroll to the top when moving
 * to a page with no hash.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Wait one frame so the target section exists before we scroll to it.
    const frame = window.requestAnimationFrame(() => {
      if (!hash) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        return;
      }

      const target = document.getElementById(hash.slice(1));
      if (!target) return;

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Keep the URL shareable without adding a history entry on every click.
      window.history.replaceState(null, '', `${pathname}${hash}`);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}

export default ScrollManager;
