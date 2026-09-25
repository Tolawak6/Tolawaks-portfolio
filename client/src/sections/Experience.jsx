import { experience, sections } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { PlaceholderBadge } from '../components/ui/PlaceholderBadge.jsx';
import './Timeline.css';

/**
 * Experience, as a vertical timeline.
 *
 * Entries come from src/content/portfolio.js. If the array is empty the section
 * shows a tidy message instead of an empty gap. Entries flagged
 * `isPlaceholder: true` are visibly badged so an example can never be mistaken
 * for a real claim.
 */
export function Experience() {
  const { eyebrow, title, intro } = sections.experience;
  const entries = experience ?? [];

  return (
    <section className="section section--page" id="experience" aria-labelledby="experience-heading">
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} id="experience-heading" />

        {entries.length === 0 ? (
          <div className="state-block" data-reveal="">
            <span className="state-block__icon">
              <Icon name="code" size={32} />
            </span>
            <h3 className="state-block__title">No entries yet</h3>
            <p className="state-block__body">
              Work history has not been added to this portfolio yet. Roles are listed in
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
                    <h3 className="timeline__position">{entry.position}</h3>
                    {entry.isPlaceholder && <PlaceholderBadge>Example entry</PlaceholderBadge>}
                  </header>

                  <p className="timeline__org">
                    <span className="timeline__org-name">{entry.organization}</span>
                    {entry.location && (
                      <>
                        <span className="timeline__sep" aria-hidden="true">
                          ·
                        </span>
                        <span>{entry.location}</span>
                      </>
                    )}
                  </p>

                  {(entry.startDate || entry.endDate) && (
                    <p className="timeline__dates">
                      <Icon name="pin" size={13} />
                      {[entry.startDate, entry.endDate].filter(Boolean).join(' — ')}
                    </p>
                  )}

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
