import { useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { Button } from '../ui/Button.jsx';
import './ProjectCard.css';

/**
 * A single project card.
 *
 * Every field comes from the API. Both optional fields are handled gracefully:
 *
 *  - Missing image  -> a generated placeholder panel, and a broken image URL
 *                      falls back to the same panel via onError.
 *  - Missing link   -> the action renders as a non-interactive "Link
 *                      unavailable" chip instead of an anchor that goes nowhere.
 */
export function ProjectCard({ project, index = 0 }) {
  const [imageFailed, setImageFailed] = useState(false);

  const hasImage = Boolean(project.image) && !imageFailed;
  const hasLink = Boolean(project.link);
  const initial = project.name?.trim()?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <article className="project-card" data-reveal="" style={{ '--reveal-delay': `${(index % 3) * 80}ms` }}>
      <div className="project-card__media">
        {hasImage ? (
          <img
            src={project.image}
            /* Describes the project rather than the file. */
            alt={`Preview of ${project.name}`}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="project-card__img"
          />
        ) : (
          <div className="project-card__placeholder" aria-hidden="true">
            <span className="project-card__placeholder-mark">{initial}</span>
            <span className="project-card__placeholder-text">No image provided</span>
          </div>
        )}
      </div>

      <div className="project-card__body">
        <h3 className="project-card__title">{project.name}</h3>
        <p className="project-card__description">{project.description}</p>
      </div>

      <div className="project-card__footer">
        {hasLink ? (
          <Button
            variant="accent"
            size="sm"
            href={project.link}
            icon={<Icon name="externalLink" size={15} />}
            iconPosition="end"
            aria-label={`View ${project.name} (opens in a new tab)`}
          >
            View Project
          </Button>
        ) : (
          <span className="project-card__nolink">
            <Icon name="alert" size={14} />
            Link not available yet
          </span>
        )}
      </div>
    </article>
  );
}

/** Skeleton shown while the project list is loading. */
export function ProjectCardSkeleton() {
  return (
    <div className="project-card project-card--skeleton" aria-hidden="true">
      <div className="project-card__media skeleton" />
      <div className="project-card__body">
        <div className="skeleton" style={{ height: '1.25rem', width: '58%' }} />
        <div className="skeleton" style={{ height: '0.85rem', width: '100%', marginTop: '0.75rem' }} />
        <div className="skeleton" style={{ height: '0.85rem', width: '88%', marginTop: '0.45rem' }} />
        <div className="skeleton" style={{ height: '0.85rem', width: '64%', marginTop: '0.45rem' }} />
      </div>
      <div className="project-card__footer">
        <div className="skeleton" style={{ height: '38px', width: '132px' }} />
      </div>
    </div>
  );
}

export default ProjectCard;
