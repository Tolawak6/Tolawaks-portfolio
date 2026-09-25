import './ui.css';

/**
 * Marks content that is still a stand-in and has not been replaced with real
 * information yet. Keeps example entries from ever reading as a factual claim.
 */
export function PlaceholderBadge({ children = 'Placeholder' }) {
  return (
    <span className="placeholder-badge">
      <span aria-hidden="true">◆</span>
      {children}
    </span>
  );
}

export default PlaceholderBadge;
