import { sections, skillGroups } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Tag } from '../components/ui/Tag.jsx';
import './Skills.css';

/**
 * Skills, grouped by where they sit in a project.
 *
 * There are deliberately no percentage bars or "expert" labels: unless a skill
 * opts in to a `level` in portfolio.js, this section makes no claim about
 * proficiency, only that the technology is one I work with.
 */
export function Skills() {
  const { eyebrow, title, intro } = sections.skills;

  return (
    <section className="section section--page" id="skills" aria-labelledby="skills-heading">
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} id="skills-heading" />

        <ul className="skills__grid" data-reveal-group="">
          {skillGroups.map((group) => (
            <li className="skill-card" key={group.id} data-reveal="">
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
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Skills;
