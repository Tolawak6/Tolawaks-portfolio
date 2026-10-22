import { sections } from '../content/portfolio.js';
import { useProjects } from '../hooks/useProjects.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { ProjectCard, ProjectCardSkeleton } from '../components/projects/ProjectCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import './Projects.css';

const SKELETON_COUNT = 3;

/**
 * 03 / Projects — Dynamic portfolio work fetched from GET /api/projects.
 */
export function Projects() {
  const { projects, status, error, reload } = useProjects();
  const { eyebrow, title, intro } = sections.projects;

  return (
    <section className="section section--alt" id="projects" aria-labelledby="projects-heading">
      <div className="container">
        <SectionHeading
          index="03"
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          id="projects-heading"
        />

        <div aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'loading' && (
            <ul className="projects__grid">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <li key={index}>
                  <ProjectCardSkeleton />
                </li>
              ))}
            </ul>
          )}

          {status === 'error' && (
            <Alert
              variant="error"
              title="Projects could not be loaded"
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={reload}
                  icon={<Icon name="refresh" size={15} />}
                >
                  Try again
                </Button>
              }
            >
              <p>
                {error?.isNetworkError
                  ? 'The portfolio API is not responding right now. Please check your connection and try again.'
                  : 'Something went wrong while fetching the project list. Please try again in a moment.'}
              </p>
            </Alert>
          )}

          {status === 'success' && projects.length === 0 && (
            <div className="state-block" data-reveal="">
              <span className="state-block__icon">
                <Icon name="layout" size={30} />
              </span>
              <h3 className="state-block__title">Projects are on the way</h3>
              <p className="state-block__body">
                Nothing is published here yet. Projects are managed from the admin dashboard and
                will appear in this section as soon as they are added.
              </p>
            </div>
          )}

          {status === 'success' && projects.length > 0 && (
            <ul className="projects__grid" data-reveal-group="">
              {projects.map((project, index) => (
                <li key={project.id}>
                  <ProjectCard project={project} index={index} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default Projects;
