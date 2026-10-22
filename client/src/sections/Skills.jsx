import { sections, skillGroups } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Tag } from '../components/ui/Tag.jsx';
import './Skills.css';

export function Skills() {
  return (
    <section id="skills" className="section section--alt" aria-labelledby="skills-heading">
      <div className="container">
        <SectionHeading
          id="skills-heading"
          eyebrow={sections.skills.eyebrow}
          icon={<Icon name="code" size={26} strokeWidth={2} />}
          title={sections.skills.title}
        />

        <div className="skills-grid" data-reveal-group="">
          {skillGroups.map((group) => (
            <article key={group.id} className="arch-card skill-card" data-reveal="">
              <h3 className="skill-card__title">{group.title}</h3>
              <ul className="skill-card__tags" aria-label={`${group.title} technologies`}>
                {group.skills.map((skill) => (
                  <Tag key={skill.name} level={skill.level}>
                    {skill.name}
                  </Tag>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
