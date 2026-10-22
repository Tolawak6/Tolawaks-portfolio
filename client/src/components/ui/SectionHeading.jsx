import './ui.css';

/**
 * Clean, scannable section header inspired by technical-editorial layouts:
 * optional mono command/eyebrow, optional leading title icon, crisp display
 * title, Solar Gold underline bar, and concise optional intro line.
 */
export function SectionHeading({ eyebrow, icon, title, intro, id, align = 'start' }) {
  const isCentered = align === 'center';

  return (
    <div
      className={`section-heading ${isCentered ? 'section-heading--center' : ''}`.trim()}
      data-reveal=""
    >
      {eyebrow && (
        <p className="section-heading__prompt">
          <span className="section-heading__prompt-prefix" aria-hidden="true">
            $
          </span>
          <span>{eyebrow}</span>
          <span className="section-heading__cursor" aria-hidden="true" />
        </p>
      )}

      <h2 className="section-heading__title" id={id}>
        {icon && (
          <span className="section-heading__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span>{title}</span>
      </h2>

      <div className="section-heading__bar" aria-hidden="true" />

      {intro && <p className="section-heading__intro">{intro}</p>}
    </div>
  );
}

export default SectionHeading;
