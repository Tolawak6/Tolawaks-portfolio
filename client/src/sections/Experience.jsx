import { experience, sections } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { PlaceholderBadge } from '../components/ui/PlaceholderBadge.jsx';
import './Timeline.css';

/**
 * 04 / Experience — Editorial Swiss Chronology Ledger.
 */
export function Experience() {
  const { eyebrow, title, intro } = sections.experience;
  const entries = experience ?? [];

  return (
    <section className="section section--page" id="experience" aria-labelledby="experience-heading">
      <div className="container">
        <SectionHeading
          index="04"
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          id="experience-heading"
        />

        {entries.length === 0 ? (
          <div className="state-block" data-reveal="">
            <span className="state-block__icon">
              <Icon name="code" size={28} />
            </span>
            <h3 className="state-block__title">No entries yet</h3>
            <p className="state-block__body">
              Work history has not been added to this portfolio yet. Roles are listed in
              <code> src/content/portfolio.js</code>.
            </p>
          </div>
        ) : (
          <ol className="timeline" data-reveal-group="">
            {entries.map((entry, idx) => (
              <li className="timeline__item" key={entry.id} data-reveal="">
                <div className="timeline__aside">
                  <span className="timeline__index" aria-hidden="true">
                    04.{idx + 1}
                  </span>
                  {(entry.startDate || entry.endDate) && (
                    <p className="timeline__dates">
                      {[entry.startDate, entry.endDate].filter(Boolean).join(' — ')}
                    </p>
                  )}
                  {entry.location && (
                    <p className="timeline__location">
                      <Icon name="pin" size={13} />
                      <span>{entry.location}</span>
                    </p>
                  )}
                </div>

                <div className="timeline__rail" aria-hidden="true">
                  <span className="timeline__marker" />
                </div>

                <article className="timeline__card">
                  <header className="timeline__head">
                    <h3 className="timeline__position">{entry.position}</h3>
                    {entry.isPlaceholder && <PlaceholderBadge>Example entry</PlaceholderBadge>}
                  </header>

                  <p className="timeline__org">
                    <span className="timeline__org-name">{entry.organization}</span>
                  </p>

                  {entry.description && (
                    <p className="timeline__description">{entry.description}</p>
                  )}

                  {entry.responsibilities?.length > 0 && (
                    <ul className="timeline__list">
                      {entry.responsibilities.map((item, index) => (
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

export default Experience;
