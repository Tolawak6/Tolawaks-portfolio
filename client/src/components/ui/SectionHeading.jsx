import './ui.css';

/**
 * Editorial Swiss section header: optional tabular index ("01".."06"),
 * gold eyebrow, expressive display title, intro copy, and an architectural
 * divider rule with a gold leading bar.
 */
export function SectionHeading({ index, eyebrow, title, intro, id, align = 'start' }) {
  const isCentered = align === 'center';

  return (
    <div
      className={`section-heading ${isCentered ? 'section-heading--center' : ''}`.trim()}
      data-reveal=""
    >
      <div className="section-heading__meta">
        {index && (
          <span className="section-heading__index" aria-hidden="true">
            {index}
          </span>
        )}
        {eyebrow && (
          <p className="eyebrow" style={isCentered ? { justifyContent: 'center' } : undefined}>
            {eyebrow}
          </p>
        )}
      </div>

      <div className="section-heading__main">
        <h2 className="section-heading__title" id={id}>
          {title}
        </h2>
        {intro && <p className="section-heading__intro">{intro}</p>}
      </div>

      <div className="section-heading__rule" aria-hidden="true">
        <span className="section-heading__rule-accent" />
      </div>
    </div>
  );
}

export default SectionHeading;
