import { useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { TechIcon } from '../ui/TechIcon.jsx';
import './ProjectCard.css';

const VISIBLE_TAG_LIMIT = 4;

/**
 * Clean scannable Project Card (modeled after image-2.png):
 * - Top 16:10 screenshot preview
 * - Title + concise summary
 * - Technology badges (with operable "+N" expand button when > 4)
 * - Bottom "Code" (GitHub) and "Live" (external demo) action links
 */
export function ProjectCard({ project, index = 0 }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const hasImage = Boolean(project.image) && !imageFailed;
  const hasLive = Boolean(project.link);
  const hasCode = Boolean(project.codeLink);
  const tags = Array.isArray(project.technologies) ? project.technologies : [];
  const visibleTags = showAllTags ? tags : tags.slice(0, VISIBLE_TAG_LIMIT);
  const hiddenCount = Math.max(0, tags.length - VISIBLE_TAG_LIMIT);
  const initial = project.name?.trim()?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <article
      className="arch-card project-card"
      data-reveal=""
      style={{ '--reveal-delay': `${(index % 3) * 75}ms` }}
    >
      <div className="project-card__media">
        {hasImage ? (
          <img
            src={project.image}
            alt={`Preview of ${project.name}`}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="project-card__img"
          />
        ) : (
          <div className="project-card__placeholder" aria-hidden="true">
            <span className="project-card__placeholder-mark">{initial}</span>
            <span className="project-card__placeholder-text">Preview coming soon</span>
          </div>
        )}
      </div>

      <div className="project-card__body">
        <h3 className="project-card__title">{project.name}</h3>
        <p className="project-card__description">{project.description}</p>

        {tags.length > 0 && (
          <ul className="project-card__tags" aria-label={`Technologies used in ${project.name}`}>
            {visibleTags.map((tag) => (
              <li key={tag} className="project-card__tag">
                <TechIcon name={tag} size={13} />
                <span>{tag}</span>
              </li>
            ))}

            {hiddenCount > 0 && !showAllTags && (
              <li>
                <button
                  type="button"
                  className="project-card__tag project-card__tag--more"
                  onClick={() => setShowAllTags(true)}
                  aria-label={`Show ${hiddenCount} more ${hiddenCount === 1 ? 'technology' : 'technologies'}`}
                >
                  +{hiddenCount}
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="project-card__footer">
        {hasCode && (
          <a
            href={project.codeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card__link"
            aria-label={`View source code for ${project.name} (opens in a new tab)`}
          >
            <Icon name="github" size={16} />
            <span>Code</span>
          </a>
        )}

        {hasLive && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card__link project-card__link--live"
            aria-label={`Open live project ${project.name} (opens in a new tab)`}
          >
            <Icon name="externalLink" size={16} />
            <span>Live</span>
          </a>
        )}

        {!hasCode && !hasLive && (
          <span className="project-card__nolink">Links coming soon</span>
        )}
      </div>
    </article>
  );
}

/** Skeleton shown while the project list is loading. */
export function ProjectCardSkeleton() {
  return (
    <div className="arch-card project-card project-card--skeleton" aria-hidden="true">
      <div className="project-card__media skeleton" />
      <div className="project-card__body">
        <div className="skeleton" style={{ height: '1.2rem', width: '62%' }} />
        <div className="skeleton" style={{ height: '0.85rem', width: '100%', marginTop: '0.7rem' }} />
        <div className="skeleton" style={{ height: '0.85rem', width: '82%', marginTop: '0.4rem' }} />
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.9rem' }}>
          <div className="skeleton" style={{ height: '24px', width: '64px' }} />
          <div className="skeleton" style={{ height: '24px', width: '76px' }} />
          <div className="skeleton" style={{ height: '24px', width: '58px' }} />
        </div>
      </div>
      <div className="project-card__footer">
        <div className="skeleton" style={{ height: '22px', width: '64px' }} />
        <div className="skeleton" style={{ height: '22px', width: '64px' }} />
      </div>
    </div>
  );
}

export default ProjectCard;
