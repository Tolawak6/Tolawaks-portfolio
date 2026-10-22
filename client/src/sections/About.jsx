import { about, education, sections } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import './About.css';

export function About() {
  return (
    <section id="about" className="section section--alt" aria-labelledby="about-heading">
      <div className="container">
        <SectionHeading
          id="about-heading"
          eyebrow={sections.about.eyebrow}
          title={sections.about.title}
        />

        <p className="about-summary" data-reveal="">
          {about.summary}
        </p>

        {/* 3 non-overlapping cards: Education | Core Focus | Languages */}
        <div className="about-cards" data-reveal-group="">
          <article className="arch-card about-card" data-reveal="">
            <div className="about-card__head">
              <span className="about-card__icon" aria-hidden="true">
                <Icon name="graduation" size={20} />
              </span>
              <h3 className="about-card__title">Education</h3>
            </div>

            <div className="about-card__entries">
              {education.map((item) => (
                <div key={item.id} className="about-card__entry">
                  <p className="about-card__primary">{item.degree}</p>
                  <p className="about-card__secondary">{item.institution}</p>
                  <p className="about-card__meta">
                    {item.year} · {item.location} 
                  </p>
                  <p className='about-card__secondary'>CGPA : {item.CGPA}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="arch-card about-card" data-reveal="">
            <div className="about-card__head">
              <span className="about-card__icon" aria-hidden="true">
                <Icon name="briefcase" size={20} />
              </span>
              <h3 className="about-card__title">Current Role</h3>
            </div>

            <div className="about-card__entries">
              <div className="about-card__entry">
                <p className="about-card__primary">{about.focus.primary}</p>
                <p className="about-card__secondary">{about.focus.secondary}</p>
                <p className="about-card__meta">{about.focus.meta}</p>
              </div>
            </div>
          </article>

          <article className="arch-card about-card" data-reveal="">
            <div className="about-card__head">
              <span className="about-card__icon" aria-hidden="true">
                <Icon name="globe" size={20} />
              </span>
              <h3 className="about-card__title">Languages</h3>
            </div>

            <ul className="about-langs">
              {about.languages.map((lang) => (
                <li key={lang.name} className="about-langs__row">
                  <span className="about-langs__name">{lang.name}</span>
                  <span className="about-langs__level">{lang.level}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

export default About;
