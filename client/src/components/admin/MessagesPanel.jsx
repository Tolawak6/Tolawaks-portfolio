import { formatDateTime } from '../../utils/format.js';
import { Icon } from '../ui/Icon.jsx';
import { Spinner } from '../ui/Spinner.jsx';

/**
 * Read-only list of contact form submissions.
 * Messages contain personal details, so they are only returned by the API to an
 * authenticated admin (see GET /api/admin/messages).
 */
export function MessagesPanel({ messages, status, error, onRetry }) {
  if (status === 'loading') {
    return (
      <div className="admin-messages__loading">
        <Spinner label="Loading messages" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="state-block">
        <span className="state-block__icon">
          <Icon name="alert" size={28} />
        </span>
        <h3 className="state-block__title">Messages could not be loaded</h3>
        <p className="state-block__body">{error?.message ?? 'Please try again.'}</p>
        {onRetry && (
          <button type="button" className="btn btn--secondary btn--sm" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="state-block">
        <span className="state-block__icon">
          <Icon name="inboxEmpty" size={30} />
        </span>
        <h3 className="state-block__title">No messages yet</h3>
        <p className="state-block__body">
          Messages sent through the contact form will be listed here.
        </p>
      </div>
    );
  }

  return (
    <ul className="admin-messages">
      {messages.map((message) => (
        <li className="admin-message" key={message.id}>
          <div className="admin-message__head">
            <div>
              <p className="admin-message__from">{message.name}</p>
              <a className="admin-message__email" href={`mailto:${message.email}`}>
                {message.email}
              </a>
            </div>
            <time className="admin-message__date" dateTime={message.createdAt}>
              {formatDateTime(message.createdAt)}
            </time>
          </div>

          {message.subject && <p className="admin-message__subject">{message.subject}</p>}
          <p className="admin-message__body">{message.message}</p>

          <a className="admin-message__reply" href={`mailto:${message.email}`}>
            <Icon name="mail" size={14} />
            Reply
          </a>
        </li>
      ))}
    </ul>
  );
}

export default MessagesPanel;
