import { experience, sections } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import './Experience.css';

/**
 * Stacked architectural Experience cards modeled after your reference layout:
 *  - Role title + Organization, Location on the left
 *  - Optional "Current" badge + Date range & employment type on the right
 *  - Concise summary below
 */
export function Experience() {
  if (!experience || experience.length === 0) return null;

  return (
    <section id="experience" className="section section--page" aria-labelledby="experience-heading">
      <div className="container">
        <SectionHeading
          id="experience-heading"
          eyebrow={sections.experience.eyebrow}
          icon={<Icon name="briefcase" size={25} strokeWidth={1.85} />}
          title={sections.experience.title}
        />

        <div className="experience-list" data-reveal-group="">
          {experience.map((role) => (
            <article key={role.id} className="arch-card experience-card" data-reveal="">
              <div className="experience-card__top">
                <div className="experience-card__identity">
                  <h3 className="experience-card__role">{role.position}</h3>
                  <p className="experience-card__org">
                    {role.organization}
                    {role.location ? `, ${role.location}` : ''}
                  </p>
                </div>

                <div className="experience-card__meta">
                  {role.current && <span className="experience-card__badge">Current</span>}
                  <span className="experience-card__dates">
                    {role.startDate} - {role.endDate}
                    {role.type ? ` (${role.type})` : ''} 
                  </span>
                </div>
              </div>

              {role.description && (
                <p className="experience-card__description">{role.description}</p>
                
              )}
              {role.score &&<span className="experience-card__badge">{role.score}</span>}

              {Array.isArray(role.responsibilities) && role.responsibilities.length > 0 && (
                <ul className="experience-card__bullets">
                  {role.responsibilities.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
