import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigation, profile } from '../../content/portfolio.js';
import { useScrollSpy, useScrolled } from '../../hooks/useScrollSpy.js';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js';
import { Icon } from '../ui/Icon.jsx';
import './Header.css';

const SECTION_IDS = navigation.map((item) => item.id);

/**
 * Sticky architectural Swiss header (#000000 + #FDBF2D).
 *
 * - Solid #FDBF2D monogram badge with #000000 ink.
 * - Numbered navigation items with scroll-spy active highlight.
 * - Dedicated high-contrast header CTA on desktop + accessible mobile drawer.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const onHomePage = location.pathname === '/';
  const scrolled = useScrolled(10);
  const activeId = useScrollSpy(onHomePage ? SECTION_IDS : []);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  useLockBodyScroll(menuOpen);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

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

  // Primary nav skips "Home" visually because the brand mark links home, keeping
  // the Swiss bar crisp and uncluttered; "Home" stays first in the mobile menu.
  const desktopItems = navigation.filter((item) => item.id !== 'home');

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand" aria-label={`${profile.name} - home`}>
          <span className="site-header__mark" aria-hidden="true">
            {profile.initials}
          </span>
          <span className="site-header__brand-copy">
            <span className="site-header__name">{profile.name}</span>
            <span className="site-header__role">{profile.title}</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <ul className="site-nav__list">
            {desktopItems.map((item, idx) => {
              const isActive = onHomePage && activeId === item.id;
              const num = String(idx + 1).padStart(2, '0');
              return (
                <li key={item.id}>
                  <a
                    href={sectionHref(item.id)}
                    className={`site-nav__link ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className="site-nav__num" aria-hidden="true">
                      {num}
                    </span>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-header__actions">
          <a href={sectionHref('contact')} className="site-header__cta">
            Let&apos;s Talk
            <Icon name="arrowUpRight" size={15} />
          </a>

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

      {menuOpen && (
        <div className="mobile-menu" id="mobile-menu" ref={panelRef}>
          <nav className="container" aria-label="Mobile">
            <ul className="mobile-menu__list">
              {navigation.map((item, idx) => {
                const isActive = onHomePage && activeId === item.id;
                const num = String(idx).padStart(2, '0');
                return (
                  <li key={item.id}>
                    <a
                      href={sectionHref(item.id)}
                      className="mobile-menu__link"
                      aria-current={isActive ? 'true' : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="mobile-menu__left">
                        <span className="mobile-menu__num" aria-hidden="true">
                          {num}
                        </span>
                        <span>{item.label}</span>
                      </span>
                      <Icon name="arrowRight" size={18} />
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="mobile-menu__footer">
              <a
                href={sectionHref('contact')}
                className="btn btn--primary btn--block"
                onClick={() => setMenuOpen(false)}
              >
                Start a Conversation
                <Icon name="arrowRight" size={16} />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
