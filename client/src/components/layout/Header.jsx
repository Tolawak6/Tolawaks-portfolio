import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigation, profile } from '../../content/portfolio.js';
import { useScrollSpy, useScrolled } from '../../hooks/useScrollSpy.js';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js';
import { Icon } from '../ui/Icon.jsx';
import './Header.css';

const SECTION_IDS = navigation.map((item) => item.id);

/**
 * Sticky header.
 *
 * - #27374D background, the primary dark colour of the palette.
 * - Links smooth-scroll to sections on the home page and are highlighted via
 *   scroll-spy.
 * - Collapses to a hamburger menu below 900px; the panel is keyboard
 *   accessible and locks background scrolling while open.
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

  // Close the menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  // Escape closes the menu and returns focus to the toggle.
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

  // Move focus into the panel when it opens so keyboard users land inside it.
  useEffect(() => {
    if (menuOpen) panelRef.current?.querySelector('a')?.focus();
  }, [menuOpen]);

  // Breakpoint change to desktop should not leave the panel mounted.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const onChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const sectionHref = (id) => (onHomePage ? `#${id}` : `/#${id}`);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container site-header__inner">
        {/* Logo: initials mark + name. Both link home. */}
        <Link to="/" className="site-header__brand" aria-label={`${profile.name} - home`}>
          <span className="site-header__mark" aria-hidden="true">
            {profile.initials}
          </span>
          <span className="site-header__name">{profile.name}</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <ul className="site-nav__list">
            {navigation.map((item) => {
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

      {/* Mobile panel. Kept in the DOM only while open so its links are not
          focusable when hidden. */}
      {menuOpen && (
        <div className="mobile-menu" id="mobile-menu" ref={panelRef}>
          <nav aria-label="Mobile">
            <ul className="mobile-menu__list">
              {navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href={sectionHref(item.id)}
                    className="mobile-menu__link"
                    aria-current={onHomePage && activeId === item.id ? 'true' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                    <Icon name="arrowRight" size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
