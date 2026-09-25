import { useCallback, useEffect, useRef, useState } from 'react';
import { useProjects } from '../hooks/useProjects.js';
import { createProject, updateProject, deleteProject } from '../services/projects.js';
import {
  fetchMessages,
  fetchAdminStatus,
  readStoredSession,
  clearSession,
} from '../services/adminApi.js';
import { ApiError } from '../services/api.js';
import { profile } from '../content/portfolio.js';

import { AdminLogin } from '../components/admin/AdminLogin.jsx';
import { ProjectForm } from '../components/admin/ProjectForm.jsx';
import { ProjectTable } from '../components/admin/ProjectTable.jsx';
import { MessagesPanel } from '../components/admin/MessagesPanel.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { Button } from '../components/ui/Button.jsx';
import './AdminPage.css';

/**
 * Admin dashboard at /admin.
 *
 * Manages the contents of the `projects` table through the REST API - nothing
 * here touches the database directly. Requires a signed session token obtained
 * from the sign-in screen (see components/admin/AdminLogin.jsx).
 */
export function AdminPage() {
  const [session, setSession] = useState(() => readStoredSession());
  const [tab, setTab] = useState('projects');

  // ---- Not signed in -----------------------------------------------------
  if (!session?.token) {
    return <AdminLogin onAuthenticated={setSession} />;
  }

  return (
    <AdminDashboard
      session={session}
      tab={tab}
      onTabChange={setTab}
      onSignOut={() => {
        clearSession();
        setSession(null);
      }}
      onSessionExpired={() => {
        clearSession();
        setSession(null);
      }}
    />
  );
}

function AdminDashboard({ session, tab, onTabChange, onSignOut, onSessionExpired }) {
  const token = session.token;
  const { projects, status, error, reload } = useProjects();

  // Form state: null = adding, otherwise the project being edited.
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const formRef = useRef(null);
  const noticeTimer = useRef(null);

  // Messages are loaded lazily, only when that tab is opened.
  const [messages, setMessages] = useState([]);
  const [messagesStatus, setMessagesStatus] = useState('idle');
  const [messagesError, setMessagesError] = useState(null);

  /*
   * Whether the server has image storage configured. Assumed true until told
   * otherwise so the file picker is not withheld from an admin on a working
   * deployment; if the answer is false the form falls back to the URL field.
   */
  const [adminStatus, setAdminStatus] = useState(null);

  useEffect(() => {
    let active = true;
    fetchAdminStatus()
      .then((status) => {
        if (active) setAdminStatus(status);
      })
      .catch(() => {
        /* Non-fatal: the form simply keeps its optimistic defaults. */
      });
    return () => {
      active = false;
    };
  }, []);

  /**
   * Any 401 means the token expired or the server restarted with a new secret.
   * Drop the session so the sign-in screen comes back rather than leaving the
   * dashboard in a broken half-state.
   */
  const handleApiError = useCallback(
    (caught) => {
      if (caught instanceof ApiError && caught.status === 401) {
        onSessionExpired();
      }
      return caught;
    },
    [onSessionExpired],
  );

  const flash = useCallback((message, variant = 'success') => {
    setNotice({ message, variant });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 5000);
  }, []);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const loadMessages = useCallback(async () => {
    setMessagesStatus('loading');
    setMessagesError(null);
    try {
      const data = await fetchMessages(token);
      setMessages(data);
      setMessagesStatus('success');
    } catch (caught) {
      handleApiError(caught);
      setMessagesError(caught);
      setMessagesStatus('error');
    }
  }, [token, handleApiError]);

  useEffect(() => {
    if (tab === 'messages' && messagesStatus === 'idle') loadMessages();
  }, [tab, messagesStatus, loadMessages]);

  // ---- Create / update ---------------------------------------------------
  async function handleSubmit(payload) {
    setSaving(true);
    setSaveError(null);

    try {
      if (editing) {
        await updateProject(editing.id, payload, token);
        flash(`“${payload.name}” was updated.`);
        setEditing(null);
      } else {
        const created = await createProject(payload, token);
        flash(`“${created.name}” was added.`);
      }
      await reload();
      return true;
    } catch (caught) {
      handleApiError(caught);
      setSaveError(caught);
      return false;
    } finally {
      setSaving(false);
    }
  }

  // ---- Delete ------------------------------------------------------------
  async function handleDelete(project) {
    setDeletingId(project.id);
    try {
      await deleteProject(project.id, token);
      flash(`“${project.name}” was deleted.`);
      if (editing?.id === project.id) setEditing(null);
      await reload();
      return true;
    } catch (caught) {
      handleApiError(caught);
      flash(caught.message ?? 'The project could not be deleted.', 'error');
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  function startEditing(project) {
    setEditing(project);
    setSaveError(null);
    // Bring the form into view and focus its first field.
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      formRef.current?.querySelector('input')?.focus();
    });
  }

  const sessionExpiry = session.expiresAt
    ? new Date(session.expiresAt).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <main className="admin" id="main">
      <div className="container">
        {/* ---------------- Header ---------------- */}
        <header className="admin__header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="admin__title">Project management</h1>
            <p className="admin__subtitle">
              Manage the content that powers the Projects section of {profile.name}&apos;s
              portfolio. Changes are written to PostgreSQL through the REST API.
            </p>
          </div>

          <div className="admin__session">
            <span className="admin__session-note">
              <Icon name="lock" size={14} />
              {sessionExpiry ? `Session ends ${sessionExpiry}` : 'Signed in'}
            </span>
            <Button variant="secondary" size="sm" onClick={onSignOut} icon={<Icon name="logout" size={14} />}>
              Sign out
            </Button>
          </div>
        </header>

        {/* ---------------- Tabs ---------------- */}
        <div className="admin__tabs" role="tablist" aria-label="Admin sections">
          {[
            { id: 'projects', label: 'Projects', count: projects.length },
            { id: 'messages', label: 'Messages', count: messages.length },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              className={`admin__tab ${tab === item.id ? 'is-active' : ''}`}
              onClick={() => onTabChange(item.id)}
              onKeyDown={(event) => {
                // Arrow keys move between tabs, as expected for a tablist.
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                event.preventDefault();
                const next = tab === 'projects' ? 'messages' : 'projects';
                onTabChange(next);
                document.getElementById(`tab-${next}`)?.focus();
              }}
            >
              <Icon name={item.id === 'projects' ? 'layout' : 'inbox'} size={16} />
              {item.label}
              {item.id === 'projects' && status === 'success' && (
                <span className="admin__tab-count">{projects.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ---------------- Success / error notices ---------------- */}
        <div className="admin__notices" aria-live="polite">
          {notice && (
            <Alert variant={notice.variant} title={notice.variant === 'success' ? 'Saved' : 'Problem'}>
              <p>{notice.message}</p>
            </Alert>
          )}
        </div>

        {/* ---------------- Projects tab ---------------- */}
        {tab === 'projects' && (
          <div
            className="admin__panel"
            id="panel-projects"
            role="tabpanel"
            aria-labelledby="tab-projects"
          >
            <section className="admin__section" ref={formRef} aria-labelledby="admin-form-heading">
              <h2 className="visually-hidden" id="admin-form-heading">
                {editing ? 'Edit project' : 'Add project'}
              </h2>
              <ProjectForm
                project={editing}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setEditing(null);
                  setSaveError(null);
                }}
                busy={saving}
                submitError={saveError}
                token={token}
                uploadsConfigured={adminStatus?.uploadsConfigured !== false}
                maxUploadMb={adminStatus?.maxUploadMb ?? 5}
              />
            </section>

            <section className="admin__section" aria-labelledby="admin-list-heading">
              <div className="admin__section-head">
                <h2 className="admin__section-title" id="admin-list-heading">
                  Existing projects
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reload}
                  disabled={status === 'loading'}
                  icon={<Icon name="refresh" size={14} />}
                >
                  Refresh
                </Button>
              </div>

              {status === 'loading' && (
                <div className="admin__loading">
                  <Spinner label="Loading projects" />
                </div>
              )}

              {status === 'error' && (
                <Alert
                  variant="error"
                  title="Projects could not be loaded"
                  actions={
                    <Button variant="secondary" size="sm" onClick={reload}>
                      Try again
                    </Button>
                  }
                >
                  <p>{error?.message ?? 'Please try again in a moment.'}</p>
                </Alert>
              )}

              {status === 'success' && (
                <ProjectTable
                  projects={projects}
                  onEdit={startEditing}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                  editingId={editing?.id}
                />
              )}
            </section>
          </div>
        )}

        {/* ---------------- Messages tab ---------------- */}
        {tab === 'messages' && (
          <div
            className="admin__panel"
            id="panel-messages"
            role="tabpanel"
            aria-labelledby="tab-messages"
          >
            <section className="admin__section" aria-labelledby="admin-messages-heading">
              <div className="admin__section-head">
                <h2 className="admin__section-title" id="admin-messages-heading">
                  Contact messages
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMessages}
                  disabled={messagesStatus === 'loading'}
                  icon={<Icon name="refresh" size={14} />}
                >
                  Refresh
                </Button>
              </div>

              <MessagesPanel
                messages={messages}
                status={messagesStatus}
                error={messagesError}
                onRetry={loadMessages}
              />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminPage;
