import './ui.css';

const LEVEL_LABELS = {
  confident: 'Confident',
  working: 'Working knowledge',
  learning: 'Currently learning',
};

/**
 * A single technology chip.
 *
 * `level` is optional and unset by default - the chip then makes no claim about
 * proficiency at all. When a level is present it is conveyed by both a colour
 * dot and a visually-hidden text label, so it never relies on colour alone.
 */
export function Tag({ children, level }) {
  const hasLevel = Boolean(level) && Boolean(LEVEL_LABELS[level]);

  return (
    <li className="tag">
      {hasLevel && <span className={`tag__dot tag__dot--${level}`} aria-hidden="true" />}
      <span>{children}</span>
      {hasLevel && <span className="visually-hidden">- {LEVEL_LABELS[level]}</span>}
    </li>
  );
}

export default Tag;
