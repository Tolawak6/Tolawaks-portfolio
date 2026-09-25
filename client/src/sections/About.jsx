import { about, sections } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import './About.css';

/**
 * About: an introduction plus a short factual summary of where I work in the
 * stack. All copy lives in src/content/portfolio.js.
 */
export function About() {
  const { eyebrow, title, intro } = sections.about;

  return (
    <section className="section section--alt" id="about" aria-labelledby="about-heading">
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} id="about-heading" />

        <div className="about__grid">
          <div className="about__prose" data-reveal="">
            {about.paragraphs.map((paragraph, index) => (
              // Index is a stable key here: the list is static, ordered copy.
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {about.highlights.length > 0 && (
            <aside className="about__panel" aria-label="Summary" data-reveal="">
              <ul className="about__highlights">
                {about.highlights.map((item) => (
                  <li key={item.label} className="about__highlight">
                    <p className="about__highlight-label">{item.label}</p>
                    <p className="about__highlight-value">{item.value}</p>
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
