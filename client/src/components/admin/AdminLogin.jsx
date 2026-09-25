import { useEffect, useId, useState } from 'react';
import { createSession, fetchAdminStatus, storeSession } from '../../services/adminApi.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Icon } from '../ui/Icon.jsx';

/**
 * Admin sign-in.
 *
 * The key you type is the server's ADMIN_API_KEY. It is sent once to
 * POST /api/admin/session and exchanged for a short-lived signed token; only
 * that token is kept in the browser, and only for the lifetime of the tab.
 *
 * Nothing is hardcoded here, so there is no client-side password to read out of
 * the bundle or bypass by editing the JavaScript.
 */
export function AdminLogin({ onAuthenticated }) {
  const uid = useId();
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  // Find out whether the server even has admin auth switched on, so the form
  // can explain the situation instead of failing confusingly.
  useEffect(() => {
    let active = true;
    fetchAdminStatus()
      .then((data) => {
        if (active) setServerStatus(data);
      })
      .catch(() => {
        if (active) setServerStatus({ authConfigured: null, unreachable: true });
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!apiKey.trim()) {
      setError(new Error('Please enter your admin key.'));
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      const session = await createSession(apiKey.trim());
      storeSession(session);
      setApiKey(''); // Never keep the raw key in component state longer than needed.
      onAuthenticated(session);
    } catch (caught) {
      setError(caught);
      setStatus('error');
    }
  }

  const authDisabled = serverStatus?.authConfigured === false;
  const serverUnreachable = serverStatus?.unreachable === true;

  return (
    <main className="admin-login" id="main">
      <div className="admin-login__card">
        <span className="admin-login__icon" aria-hidden="true">
          <Icon name="lock" size={22} />
        </span>

        <h1 className="admin-login__title">Admin sign in</h1>
        <p className="admin-login__lead">
          Enter the admin key from your <code>server/.env</code> file to manage portfolio
          projects.
        </p>

        {authDisabled && (
          <Alert variant="error" title="Admin auth is not configured on the server">
            <p>
              Set <code>ADMIN_API_KEY</code> and <code>ADMIN_SESSION_SECRET</code> in{' '}
              <code>server/.env</code>, then restart the API. Generate a pair with{' '}
              <code>npm run admin:key</code> inside the <code>server</code> folder.
            </p>
          </Alert>
        )}

        {serverUnreachable && (
          <Alert variant="error" title="Cannot reach the API">
            <p>
              The portfolio API did not respond. Make sure the backend is running on port 4000,
              then reload this page.
            </p>
          </Alert>
        )}

        <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor={`${uid}-key`}>
              Admin key
            </label>
            <input
              id={`${uid}-key`}
              type="password"
              className="input"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              autoComplete="current-password"
              autoFocus
              disabled={authDisabled}
              aria-invalid={status === 'error' ? 'true' : undefined}
              aria-describedby={`${uid}-hint`}
            />
            <p className="field__hint" id={`${uid}-hint`}>
              The key stays on the server. The browser only ever receives a short-lived,
              signed session token.
            </p>
          </div>

          {status === 'error' && error && (
            <Alert variant="error" title="Sign in failed">
              <p>{error.message}</p>
            </Alert>
          )}

          <Button
            variant="primary"
            type="submit"
            block
            loading={status === 'submitting'}
            disabled={authDisabled}
            icon={<Icon name="lock" size={16} />}
          >
            {status === 'submitting' ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="admin-login__back">
          <a href="/">← Back to the portfolio</a>
        </p>
      </div>
    </main>
  );
}

export default AdminLogin;
