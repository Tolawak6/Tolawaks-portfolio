import { Link } from 'react-router-dom';
import './ui.css';

/**
 * One button used everywhere.
 *
 * Renders as an <a> when `href` is given (external links get the right
 * rel/target), as a react-router <Link> when `to` is given, and as a real
 * <button> otherwise - so semantics always match the action.
 *
 * @param {'primary'|'secondary'|'accent'|'ghost'|'danger'} [variant]
 * @param {'sm'|'md'|'lg'} [size]
 */
export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  href,
  to,
  type = 'button',
  loading = false,
  disabled = false,
  block = false,
  icon = null,
  iconPosition = 'start',
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {!loading && icon && iconPosition === 'start' && icon}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'end' && icon}
    </>
  );

  // Anchors: never apply `disabled`, use aria-disabled + tabIndex instead so the
  // element keeps its native role.
  if (href && !loading) {
    const isExternal = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...(disabled ? { 'aria-disabled': 'true', tabIndex: -1 } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }

  if (to && !loading) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}

export default Button;
