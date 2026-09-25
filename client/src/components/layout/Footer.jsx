import { Link } from 'react-router-dom';
import { contact, navigation, profile } from '../../content/portfolio.js';
import { Icon } from '../ui/Icon.jsx';
import './Footer.css';

export function Footer() {
  const year = new Date().getFullYear();
  const realLinks = contact.links.filter((link) => link.href && link.href !== '#');

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__identity">
            <span className="site-footer__mark" aria-hidden="true">
              {profile.initials}
            </span>
            <div>
              <p className="site-footer__name">{profile.name}</p>
              <p className="site-footer__role">{profile.title}</p>
            </div>
          </div>

          <nav className="site-footer__nav" aria-label="Footer">
            <ul className="site-footer__list">
              {navigation.slice(1).map((item) => (
                <li key={item.id}>
                  <a href={`/#${item.id}`}>{item.label}</a>
                </li>
              ))}
              <li>
                <Link to="/admin">Admin</Link>
              </li>
            </ul>
          </nav>

          <div className="site-footer__contact">
            <a className="site-footer__email" href={`mailto:${contact.email}`}>
              <Icon name="mail" size={16} />
              {contact.email}
            </a>
            {realLinks.length > 0 && (
              <ul className="site-footer__social">
                {realLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                    >
                      <Icon name={link.icon} size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            © {year} {profile.name}. Built with React, Node.js, Express and PostgreSQL.
          </p>
          <a href="#home" className="site-footer__top-link">
            Back to top
            <Icon name="arrowUp" size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
