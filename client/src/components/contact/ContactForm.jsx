import { useId, useRef, useState } from 'react';
import { submitContactMessage } from '../../services/contact.js';
import { ApiError } from '../../services/api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Icon } from '../ui/Icon.jsx';
import './ContactForm.css';

const EMPTY = { name: '', email: '', subject: '', message: '' };

/** Client-side checks mirroring the API rules, so obvious mistakes are caught
 *  before a round trip. The API validates again regardless. */
function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';

  if (!values.email.trim()) errors.email = 'Please enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'That does not look like a valid email address.';
  }

  if (!values.message.trim()) errors.message = 'Please enter a message.';
  else if (values.message.trim().length < 10) {
    errors.message = 'Please write at least a few words (10 characters or more).';
  }

  return errors;
}

export function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [submitError, setSubmitError] = useState(null);
  const formRef = useRef(null);

  const fieldId = (field) => `${uid}-${field}`;
  const errorId = (field) => `${uid}-${field}-error`;

  const update = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    // Clear a field's error as soon as the user starts fixing it.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      // Send focus to the first problem field.
      const firstField = Object.keys(nextErrors)[0];
      formRef.current?.querySelector(`#${CSS.escape(fieldId(firstField))}`)?.focus();
      return;
    }

    setStatus('submitting');
    setSubmitError(null);

    try {
      await submitContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });
      setValues(EMPTY);
      setErrors({});
      setStatus('success');
    } catch (error) {
      // Server-side field errors (422) map straight back onto the inputs.
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      setSubmitError(error);
      setStatus('error');
    }
  }

  // ---- Success: replace the form so it cannot be resubmitted by accident ----
  if (status === 'success') {
    return (
      <div className="contact-form contact-form--done">
        <Alert variant="success" title="Message sent">
          <p>Thanks for getting in touch. Your message has been received.</p>
        </Alert>
        <Button variant="secondary" onClick={() => setStatus('idle')}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="contact-form"
      onSubmit={handleSubmit}
      noValidate // We render our own accessible messages instead.
    >
      <div className="form-grid form-grid--two">
        <div className="field">
          <label className="field__label" htmlFor={fieldId('name')}>
            Name
          </label>
          <input
            id={fieldId('name')}
            name="name"
            type="text"
            className={`input ${errors.name ? 'input--invalid' : ''}`.trim()}
            value={values.name}
            onChange={update('name')}
            autoComplete="name"
            required
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? errorId('name') : undefined}
          />
          {errors.name && (
            <p className="field__error" id={errorId('name')}>
              <Icon name="alert" size={13} />
              {errors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor={fieldId('email')}>
            Email
          </label>
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            className={`input ${errors.email ? 'input--invalid' : ''}`.trim()}
            value={values.email}
            onChange={update('email')}
            autoComplete="email"
            required
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? errorId('email') : undefined}
          />
          {errors.email && (
            <p className="field__error" id={errorId('email')}>
              <Icon name="alert" size={13} />
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor={fieldId('subject')}>
          Subject
          <span className="field__optional">Optional</span>
        </label>
        <input
          id={fieldId('subject')}
          name="subject"
          type="text"
          className="input"
          value={values.subject}
          onChange={update('subject')}
          maxLength={200}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor={fieldId('message')}>
          Message
        </label>
        <textarea
          id={fieldId('message')}
          name="message"
          className={`textarea ${errors.message ? 'textarea--invalid' : ''}`.trim()}
          value={values.message}
          onChange={update('message')}
          rows={6}
          required
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={errors.message ? errorId('message') : undefined}
        />
        {errors.message && (
          <p className="field__error" id={errorId('message')}>
            <Icon name="alert" size={13} />
            {errors.message}
          </p>
        )}
      </div>

      {status === 'error' && submitError && (
        <Alert variant="error" title="Message not sent">
          <p>{submitError.message}</p>
        </Alert>
      )}

      <div className="form-actions">
        <Button
          variant="primary"
          type="submit"
          loading={status === 'submitting'}
          icon={<Icon name="send" size={16} />}
        >
          {status === 'submitting' ? 'Sending…' : 'Send message'}
        </Button>
        <p className="contact-form__privacy">
          Your details are only used to reply to you.
        </p>
      </div>
    </form>
  );
}

export default ContactForm;
