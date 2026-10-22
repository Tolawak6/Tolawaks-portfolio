import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Icon } from '../ui/Icon.jsx';
import { ImagePicker } from './ImagePicker.jsx';
import { ApiError } from '../../services/api.js';

const EMPTY = {
  name: '',
  image: '',
  imagePublicId: '',
  link: '',
  codeLink: '',
  technologiesText: '',
  description: '',
};

function parseTechnologies(raw) {
  const seen = new Set();
  const out = [];
  for (const part of String(raw ?? '').split(',')) {
    const tag = part.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

/** Mirrors the API validation rules so mistakes are caught before a round trip. */
function validate(values) {
  const errors = {};

  const name = values.name.trim();
  if (!name) errors.name = 'Project name is required.';
  else if (name.length > 150) errors.name = 'Keep the name under 150 characters.';

  const description = values.description.trim();
  if (!description) errors.description = 'Description is required.';
  else if (description.length > 2000) errors.description = 'Keep the description under 2000 characters.';

  const image = values.image.trim();
  if (image && !values.imagePublicId && !isUrlLike(image)) {
    errors.image = 'Use a full URL (https://…) or a path starting with "/".';
  }

  const link = values.link.trim();
  if (link && !isUrlLike(link)) {
    errors.link = 'Use a full URL (https://…) or a path starting with "/".';
  }

  const codeLink = values.codeLink.trim();
  if (codeLink && !isUrlLike(codeLink)) {
    errors.codeLink = 'Use a full URL (https://…) or a path starting with "/".';
  }

  const tags = parseTechnologies(values.technologiesText);
  if (tags.length > 20) {
    errors.technologies = 'List at most 20 technologies per project.';
  } else if (tags.some((t) => t.length > 40)) {
    errors.technologies = 'Keep each technology name under 40 characters.';
  }

  return errors;
}

function isUrlLike(value) {
  if (value.startsWith('/')) return !value.startsWith('//');
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Add / edit form for a project.
 */
export function ProjectForm({
  project = null,
  onSubmit,
  onCancel,
  busy = false,
  submitError = null,
  token,
  uploadsConfigured = true,
  maxUploadMb = 4,
}) {
  const uid = useId();
  const isEditing = Boolean(project);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [uploadBusy, setUploadBusy] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const nameRef = useRef(null);

  useEffect(() => {
    setValues(
      project
        ? {
            name: project.name ?? '',
            image: project.image ?? '',
            imagePublicId: project.imagePublicId ?? '',
            link: project.link ?? '',
            codeLink: project.codeLink ?? '',
            technologiesText: Array.isArray(project.technologies)
              ? project.technologies.join(', ')
              : '',
            description: project.description ?? '',
          }
        : EMPTY,
    );
    setErrors({});
    setFormKey((key) => key + 1);
  }, [project]);

  useEffect(() => {
    if (submitError instanceof ApiError && Object.keys(submitError.fieldErrors).length > 0) {
      setErrors(submitError.fieldErrors);
    }
  }, [submitError]);

  const previewTags = useMemo(
    () => parseTechnologies(values.technologiesText),
    [values.technologiesText],
  );

  const fieldId = (field) => `${uid}-${field}`;
  const errorId = (field) => `${uid}-${field}-error`;

  const update = (field, errKey = field) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[errKey] ? { ...prev, [errKey]: undefined } : prev));
  };

  const handleImageChange = ({ url, publicId }) => {
    setValues((prev) => ({ ...prev, image: url, imagePublicId: publicId }));
    setErrors((prev) => (prev.image ? { ...prev, image: undefined } : prev));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (uploadBusy) return;

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const first = Object.keys(nextErrors)[0];
      const focusKey = first === 'technologies' ? 'technologiesText' : first;
      document.getElementById(fieldId(focusKey))?.focus();
      return;
    }

    const payload = {
      name: values.name.trim(),
      image: values.image.trim(),
      imagePublicId: values.imagePublicId,
      link: values.link.trim(),
      codeLink: values.codeLink.trim(),
      technologies: parseTechnologies(values.technologiesText),
      description: values.description.trim(),
    };

    const succeeded = await onSubmit(payload);
    if (succeeded && !isEditing) {
      setValues(EMPTY);
      setErrors({});
      setFormKey((key) => key + 1);
      nameRef.current?.focus();
    }
  }

  const formDisabled = busy || uploadBusy;

  return (
    <form className="project-form" onSubmit={handleSubmit} noValidate>
      <div className="project-form__head">
        <h3 className="project-form__title">
          {isEditing ? `Edit “${project.name}”` : 'Add a project'}
        </h3>
        <p className="project-form__subtitle">
          {isEditing
            ? 'Changes are saved to PostgreSQL and appear on the portfolio immediately.'
            : 'The project is stored in PostgreSQL and appears on the portfolio straight away.'}
        </p>
      </div>

      <div className="form-grid form-grid--two">
        <div className="field">
          <label className="field__label" htmlFor={fieldId('name')}>
            Project name
          </label>
          <input
            ref={nameRef}
            id={fieldId('name')}
            className={`input ${errors.name ? 'input--invalid' : ''}`.trim()}
            value={values.name}
            onChange={update('name')}
            maxLength={150}
            required
            disabled={formDisabled}
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
          <label className="field__label" htmlFor={fieldId('technologiesText')}>
            Technologies
            <span className="field__optional">Comma-separated</span>
          </label>
          <input
            id={fieldId('technologiesText')}
            className={`input ${errors.technologies ? 'input--invalid' : ''}`.trim()}
            value={values.technologiesText}
            onChange={update('technologiesText', 'technologies')}
            placeholder="React, Node.js, PostgreSQL, Tailwind CSS"
            disabled={formDisabled}
            aria-invalid={errors.technologies ? 'true' : undefined}
            aria-describedby={errors.technologies ? errorId('technologies') : undefined}
          />
          {previewTags.length > 0 && (
            <div className="project-form__tag-preview" aria-label="Technology tags preview">
              {previewTags.map((tag) => (
                <span key={tag} className="project-form__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {errors.technologies && (
            <p className="field__error" id={errorId('technologies')}>
              <Icon name="alert" size={13} />
              {errors.technologies}
            </p>
          )}
        </div>
      </div>

      <div className="form-grid form-grid--two">
        <div className="field">
          <label className="field__label" htmlFor={fieldId('codeLink')}>
            Code URL (GitHub)
            <span className="field__optional">Optional</span>
          </label>
          <input
            id={fieldId('codeLink')}
            className={`input ${errors.codeLink ? 'input--invalid' : ''}`.trim()}
            value={values.codeLink}
            onChange={update('codeLink')}
            placeholder="https://github.com/Tolawak6/project"
            inputMode="url"
            disabled={formDisabled}
            aria-invalid={errors.codeLink ? 'true' : undefined}
            aria-describedby={errors.codeLink ? errorId('codeLink') : undefined}
          />
          {errors.codeLink && (
            <p className="field__error" id={errorId('codeLink')}>
              <Icon name="alert" size={13} />
              {errors.codeLink}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor={fieldId('link')}>
            Live Demo URL
            <span className="field__optional">Optional</span>
          </label>
          <input
            id={fieldId('link')}
            className={`input ${errors.link ? 'input--invalid' : ''}`.trim()}
            value={values.link}
            onChange={update('link')}
            placeholder="https://your-project.vercel.app"
            inputMode="url"
            disabled={formDisabled}
            aria-invalid={errors.link ? 'true' : undefined}
            aria-describedby={errors.link ? errorId('link') : undefined}
          />
          {errors.link && (
            <p className="field__error" id={errorId('link')}>
              <Icon name="alert" size={13} />
              {errors.link}
            </p>
          )}
        </div>
      </div>

      <ImagePicker
        key={formKey}
        inputId={fieldId('image')}
        value={values.image}
        publicId={values.imagePublicId}
        onChange={handleImageChange}
        onBusyChange={setUploadBusy}
        token={token}
        uploadsConfigured={uploadsConfigured}
        maxUploadMb={maxUploadMb}
        disabled={busy}
        error={errors.image}
        errorId={errorId('image')}
        hintId={`${fieldId('image')}-hint`}
      />

      <div className="field">
        <label className="field__label" htmlFor={fieldId('description')}>
          Description
        </label>
        <textarea
          id={fieldId('description')}
          className={`textarea ${errors.description ? 'textarea--invalid' : ''}`.trim()}
          value={values.description}
          onChange={update('description')}
          rows={4}
          maxLength={2000}
          required
          disabled={formDisabled}
          aria-invalid={errors.description ? 'true' : undefined}
          aria-describedby={errors.description ? errorId('description') : undefined}
        />
        {errors.description && (
          <p className="field__error" id={errorId('description')}>
            <Icon name="alert" size={13} />
            {errors.description}
          </p>
        )}
      </div>

      {submitError && !(submitError instanceof ApiError && Object.keys(submitError.fieldErrors).length) && (
        <Alert variant="error" title="Could not save the project">
          <p>{submitError.message}</p>
        </Alert>
      )}

      <div className="form-actions">
        <Button
          variant="primary"
          type="submit"
          loading={busy}
          disabled={uploadBusy}
          icon={<Icon name={isEditing ? 'check' : 'plus'} size={16} />}
        >
          {busy ? 'Saving…' : isEditing ? 'Save changes' : 'Add project'}
        </Button>
        {uploadBusy && <span className="form-actions__note">Waiting for the image…</span>}
        {isEditing && (
          <Button variant="ghost" onClick={onCancel} disabled={formDisabled}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default ProjectForm;
