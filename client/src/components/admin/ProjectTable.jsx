import { useState } from 'react';
import { Button } from '../ui/Button.jsx';
import { Icon } from '../ui/Icon.jsx';
import { formatDate } from '../../utils/format.js';

/** Small row thumbnail with a graceful fallback for missing/broken images. */
function Thumb({ project }) {
  const [failed, setFailed] = useState(false);
  const showImage = project.image && !failed;

  if (!showImage) {
    return (
      <span className="admin-thumb admin-thumb--empty" aria-hidden="true">
        {project.name?.trim()?.charAt(0)?.toUpperCase() ?? '?'}
      </span>
    );
  }

  return (
    <img
      className="admin-thumb"
      src={project.image}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * The list of existing projects with edit and delete actions.
 *
 * Deletion uses an inline confirmation rather than window.confirm: it keeps the
 * interaction keyboard accessible, stays inside the page's focus order, and
 * cannot be dismissed accidentally by Enter on the wrong button.
 */
export function ProjectTable({ projects, onEdit, onDelete, deletingId, editingId }) {
  const [confirmingId, setConfirmingId] = useState(null);

  if (projects.length === 0) {
    return (
      <div className="state-block">
        <span className="state-block__icon">
          <Icon name="layout" size={30} />
        </span>
        <h3 className="state-block__title">No projects yet</h3>
        <p className="state-block__body">
          Add your first project with the form above. It will be stored in PostgreSQL and
          appear on the portfolio immediately.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-table" role="region" aria-label="Existing projects" tabIndex={-1}>
      <table>
        <caption className="visually-hidden">
          All portfolio projects. Each row has actions to edit or delete it.
        </caption>
        <thead>
          <tr>
            <th scope="col">Project</th>
            <th scope="col">Link</th>
            <th scope="col" className="admin-table__hide-sm">Added</th>
            <th scope="col" className="admin-table__hide-sm">Updated</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const isConfirming = confirmingId === project.id;
            const isDeleting = deletingId === project.id;
            const isEditing = editingId === project.id;

            return (
              <tr key={project.id} className={isEditing ? 'is-editing' : ''}>
                <th scope="row" data-label="Project">
                  <div className="admin-table__project">
                    <Thumb project={project} />
                    <div className="admin-table__project-text">
                      <span className="admin-table__name">{project.name}</span>
                      <span className="admin-table__id">ID {project.id}</span>
                    </div>
                  </div>
                </th>

                <td data-label="Link">
                  {project.link ? (
                    <a
                      className="admin-table__link"
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon name="externalLink" size={14} />
                      <span className="admin-table__link-text">{project.link}</span>
                    </a>
                  ) : (
                    <span className="admin-table__muted">Not set</span>
                  )}
                </td>

                <td data-label="Added" className="admin-table__hide-sm">
                  <span className="admin-table__muted">{formatDate(project.createdAt)}</span>
                </td>

                <td data-label="Updated" className="admin-table__hide-sm">
                  <span className="admin-table__muted">{formatDate(project.updatedAt)}</span>
                </td>

                <td data-label="Actions">
                  {isConfirming ? (
                    <div className="admin-table__confirm">
                      <span className="admin-table__confirm-text">Delete this project?</span>
                      <div className="admin-table__actions">
                        <Button
                          variant="danger"
                          size="sm"
                          loading={isDeleting}
                          onClick={async () => {
                            const ok = await onDelete(project);
                            if (ok) setConfirmingId(null);
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmingId(null)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-table__actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(project)}
                        icon={<Icon name="edit" size={14} />}
                        aria-label={`Edit ${project.name}`}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmingId(project.id)}
                        icon={<Icon name="trash" size={14} />}
                        aria-label={`Delete ${project.name}`}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ProjectTable;
