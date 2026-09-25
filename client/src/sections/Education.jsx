import { education, sections } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { PlaceholderBadge } from '../components/ui/PlaceholderBadge.jsx';
import './Timeline.css';

/**
 * Education, sharing the timeline card styling with Experience so the two
 * sections read as a matched pair.
 */
export function Education() {
  const { eyebrow, title, intro } = sections.education;
  const entries = education ?? [];

  return (
    <section
      className="section section--alt"
      id="education"
      aria-labelledby="education-heading"
    >
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} id="education-heading" />

        {entries.length === 0 ? (
          <div className="state-block" data-reveal="">
            <span className="state-block__icon">
              <Icon name="spark" size={32} />
            </span>
            <h3 className="state-block__title">No entries yet</h3>
            <p className="state-block__body">
              Education details have not been added to this portfolio yet. Programmes are listed in
              <code> src/content/portfolio.js</code>.
            </p>
          </div>
        ) : (
          <ol className="timeline" data-reveal-group="">
            {entries.map((entry) => (
              <li className="timeline__item" key={entry.id} data-reveal="">
                <div className="timeline__marker" aria-hidden="true" />

                <article className="timeline__card">
                  <header className="timeline__head">
                    <h3 className="timeline__position">{entry.degree}</h3>
                    {entry.isPlaceholder && <PlaceholderBadge>Example entry</PlaceholderBadge>}
                  </header>

                  <p className="timeline__org">
                    <span className="timeline__org-name">{entry.institution}</span>
                    {entry.location && (
                      <>
                        <span className="timeline__sep" aria-hidden="true">
                          ·
                        </span>
                        <span>{entry.location}</span>
                      </>
                    )}
                  </p>

                  {entry.year && (
                    <p className="timeline__dates">
                      <Icon name="pin" size={13} />
                      {entry.year}
                    </p>
                  )}

                  {entry.description && (
                    <p className="timeline__description">{entry.description}</p>
                  )}

                  {entry.highlights?.length > 0 && (
                    <ul className="timeline__list">
                      {entry.highlights.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

export default Education;
