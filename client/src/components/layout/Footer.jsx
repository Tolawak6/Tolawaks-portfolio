import { Link } from 'react-router-dom';
import { profile } from '../../content/portfolio.js';
import { Icon } from '../ui/Icon.jsx';
import './Footer.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__left">
          <span className="site-footer__mark" aria-hidden="true">
            {profile.initials}
          </span>
          <p className="site-footer__copy">
            © {year} <strong>{profile.name}</strong>
          </p>
        </div>

        <div className="site-footer__right">
          <Link to="/admin" className="site-footer__admin">
            Admin
          </Link>

          <a href="#home" className="site-footer__top" aria-label="Back to top">
            <Icon name="arrowUp" size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
