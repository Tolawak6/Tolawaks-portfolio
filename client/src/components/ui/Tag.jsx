import { TechIcon } from './TechIcon.jsx';
import './ui.css';

const LEVEL_LABELS = {
  confident: 'Confident',
  working: 'Working knowledge',
  learning: 'Currently learning',
};

/**
 * A single technology chip with an inline tool SVG icon (modeled after clean
 * developer tech-stack badges).
 */
export function Tag({ children, level, showIcon = true }) {
  const hasLevel = Boolean(level) && Boolean(LEVEL_LABELS[level]);
  const label = typeof children === 'string' ? children : '';

  return (
    <li className="tag">
      {showIcon && label && <TechIcon name={label} size={16} className="tag__icon" />}
      <span>{children}</span>
      {hasLevel && <span className={`tag__dot tag__dot--${level}`} aria-hidden="true" />}
      {hasLevel && <span className="visually-hidden">- {LEVEL_LABELS[level]}</span>}
    </li>
  );
}

export default Tag;
