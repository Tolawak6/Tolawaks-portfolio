import { about, sections } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import './About.css';

/**
 * 01 / About — Editorial Magazine Split + Swiss Specification Ledger.
 * All copy lives in src/content/portfolio.js.
 */
export function About() {
  const { eyebrow, title, intro } = sections.about;

  return (
    <section className="section section--alt" id="about" aria-labelledby="about-heading">
      <div className="container">
        <SectionHeading
          index="01"
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          id="about-heading"
        />

        <div className="about__grid">
          <div className="about__prose" data-reveal="">
            {about.paragraphs.map((paragraph, index) => (
              <p key={index} className={index === 0 ? 'about__lead' : undefined}>
                {paragraph}
              </p>
            ))}
          </div>

          {about.highlights.length > 0 && (
            <aside className="about__panel" aria-label="Technical profile summary" data-reveal="">
              <div className="about__panel-head">
                <span className="about__panel-badge">SPEC // PROFILE</span>
                <span className="about__panel-count">
                  {String(about.highlights.length).padStart(2, '0')} ITEMS
                </span>
              </div>

              <ul className="about__highlights">
                {about.highlights.map((item, idx) => (
                  <li key={item.label} className="about__highlight">
                    <span className="about__highlight-num" aria-hidden="true">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="about__highlight-body">
                      <p className="about__highlight-label">{item.label}</p>
                      <p className="about__highlight-value">{item.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}

export default About;
