import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigation, profile } from '../../content/portfolio.js';
import { useScrollSpy, useScrolled } from '../../hooks/useScrollSpy.js';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js';
import { useTheme } from '../../hooks/useTheme.js';
import { Icon } from '../ui/Icon.jsx';
import './Header.css';

const SECTION_IDS = navigation.map((item) => item.id);

/**
 * Sticky architectural Swiss header (#000000 + #FDBF2D, Dark & Light modes).
 *
 * Keeps top actions clean & non-repetitive:
 * - Brand mark + "Tolawak M. Abetu"
 * - Section links (About, Experience, Tech Stack, Projects, Contact)
 * - GitHub profile link on top + Light/Dark theme toggle
 *   ("Download CV" lives solely in the Hero CTA so it is not repeated)
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();
  const onHomePage = location.pathname === '/';
  const scrolled = useScrolled(10);
  const activeId = useScrollSpy(onHomePage ? SECTION_IDS : []);
  const { isDark, toggleTheme } = useTheme();
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  useLockBodyScroll(menuOpen);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    let rafId = 0;
    const updateProgress = () => {
      rafId = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };

    const onScroll = () => {
      if (!rafId) rafId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) panelRef.current?.querySelector('a')?.focus();
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 980px)');
    const onChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const sectionHref = (id) => (onHomePage ? `#${id}` : `/#${id}`);
  const desktopItems = navigation.filter((item) => item.id !== 'home');
  const nextModeLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand" aria-label={`${profile.name} - home`}>
          <span className="site-header__mark" aria-hidden="true">
            {profile.initials}
          </span>
          <span className="site-header__brand-copy">
            <span className="site-header__name">{profile.name}</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <ul className="site-nav__list">
            {desktopItems.map((item) => {
              const isActive = onHomePage && activeId === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={sectionHref(item.id)}
                    className={`site-nav__link ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-header__actions">
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="site-header__icon-btn site-header__github"
            aria-label={`GitHub profile (${profile.githubHandle})`}
            title={`GitHub (@${profile.githubHandle})`}
          >
            <Icon name="github" size={18} />
            <span className="site-header__github-label">GitHub</span>
          </a>

          <button
            type="button"
            className="site-header__icon-btn site-header__theme-btn"
            onClick={toggleTheme}
            aria-label={nextModeLabel}
            title={nextModeLabel}
          >
            <Icon name={isDark ? 'sun' : 'moon'} size={18} />
          </button>

          <button
            ref={toggleRef}
            type="button"
            className="site-header__toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {/* Subtle reading progress bar */}
      <div className="site-header__progress" aria-hidden="true">
        <span
          className="site-header__progress-bar"
          style={{ transform: `scaleX(${scrollProgress})` }}
        />
      </div>

      {menuOpen && (
        <div className="mobile-menu" id="mobile-menu" ref={panelRef}>
          <nav className="container" aria-label="Mobile">
            <ul className="mobile-menu__list">
              {navigation.map((item) => {
                const isActive = onHomePage && activeId === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={sectionHref(item.id)}
                      className="mobile-menu__link"
                      aria-current={isActive ? 'true' : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                      <Icon name="arrowRight" size={16} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
