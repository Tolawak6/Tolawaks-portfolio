import { Icon } from './Icon.jsx';
import './ui.css';

const ICONS = {
  error: 'alert',
  success: 'check',
  info: 'alert',
};

/**
 * Inline feedback message.
 *
 * `role="alert"` on errors makes screen readers announce them as soon as they
 * appear; success uses a polite `status` role so it does not interrupt.
 */
export function Alert({ variant = 'info', title, children, actions, icon, className = '' }) {
  const isError = variant === 'error';

  return (
    <div
      className={`alert alert--${variant} ${className}`.trim()}
      role={isError ? 'alert' : 'status'}
    >
      <span className="alert__icon">
        <Icon name={icon ?? ICONS[variant] ?? 'alert'} size={18} />
      </span>
      <div>
        {title && <p className="alert__title">{title}</p>}
        {children && <div className="alert__body">{children}</div>}
        {actions && <div className="alert__actions">{actions}</div>}
      </div>
    </div>
  );
}

export default Alert;
