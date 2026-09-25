import './ui.css';

/**
 * Consistent eyebrow + title + intro at the top of each section.
 * `id` is used to label the section via aria-labelledby.
 */
export function SectionHeading({ eyebrow, title, intro, id, align = 'start' }) {
  return (
    <div
      className="section-heading"
      data-reveal=""
      style={align === 'center' ? { marginInline: 'auto', textAlign: 'center' } : undefined}
    >
      {eyebrow && (
        <p className="eyebrow" style={align === 'center' ? { justifyContent: 'center' } : undefined}>
          {eyebrow}
        </p>
      )}
      <h2 className="section-heading__title" id={id}>
        {title}
      </h2>
      {intro && <p className="section-heading__intro">{intro}</p>}
    </div>
  );
}

export default SectionHeading;
