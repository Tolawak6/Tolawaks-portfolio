import './ui.css';

/**
 * Indeterminate loading indicator with an accessible label.
 * The visible text (when provided) is outside the live region so it is not
 * announced twice.
 */
export function Spinner({ size = 'md', label = 'Loading', className = '' }) {
  return (
    <div className={`spinner-wrap ${className}`.trim()} role="status" aria-live="polite">
      <span className={`spinner ${size === 'lg' ? 'spinner--lg' : ''}`.trim()} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

export default Spinner;
