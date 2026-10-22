import { sections, skillGroups } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Tag } from '../components/ui/Tag.jsx';
import './Skills.css';

/**
 * 02 / Skills — 12-Column Asymmetric Bento Grid.
 *
 * No fabricated proficiency bars: each tile presents the technologies grouped
 * by their architectural layer with clean Swiss indexing.
 */
export function Skills() {
  const { eyebrow, title, intro } = sections.skills;

  return (
    <section className="section section--page" id="skills" aria-labelledby="skills-heading">
      <div className="container">
        <SectionHeading
          index="02"
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          id="skills-heading"
        />

        <ul className="skills__bento" data-reveal-group="">
          {skillGroups.map((group, idx) => {
            const tileIndex = `02.${idx + 1}`;
            return (
              <li
                className={`skill-card skill-card--${group.id}`}
                key={group.id}
                data-reveal=""
                style={{ '--reveal-delay': `${(idx % 3) * 65}ms` }}
              >
                <div className="skill-card__meta">
                  <span className="skill-card__code" aria-hidden="true">
                    {tileIndex}
                  </span>
                  <span className="skill-card__count">
                    {group.skills.length} {group.skills.length === 1 ? 'tool' : 'tools'}
                  </span>
                </div>

                <div className="skill-card__head">
                  <span className="skill-card__icon" aria-hidden="true">
                    <Icon name={group.icon} size={20} />
                  </span>
                  <h3 className="skill-card__title">{group.title}</h3>
                </div>

                {group.summary && <p className="skill-card__summary">{group.summary}</p>}

                <ul className="skill-card__tags">
                  {group.skills.map((skill) => (
                    <Tag key={skill.name} level={skill.level}>
                      {skill.name}
                    </Tag>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default Skills;
