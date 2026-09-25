import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '../ui/Button.jsx';
import { Icon } from '../ui/Icon.jsx';
import { ApiError } from '../../services/api.js';
import { uploadProjectImage } from '../../services/uploads.js';
import { optimizeImage, formatBytes, ImageError } from '../../utils/optimizeImage.js';

/**
 * Project image field: pick a file, or fall back to pasting a URL.
 *
 * The upload starts the moment a file is chosen, not when the form is
 * submitted. That means by the time the admin has finished typing the
 * description, the image is usually already stored and the URL is sitting in
 * the form - so pressing "Add project" feels instant rather than like a wait.
 *
 * Upload state lives here rather than in ProjectForm because the form only
 * cares about the resulting URL. `onChange` is called with `{ url, publicId }`
 * once the upload succeeds.
 *
 * @param {object} props
 * @param {string} props.value            current image URL
 * @param {string} props.publicId         storage id for an uploaded image ('' for URLs)
 * @param {(next: {url: string, publicId: string}) => void} props.onChange
 * @param {string} props.token            admin session token
 * @param {boolean} props.uploadsConfigured  false hides the picker entirely
 * @param {number} [props.maxUploadMb]
 * @param {string} [props.error]
 * @param {string} [props.errorId]
 * @param {string} [props.hintId]
 * @param {string} [props.inputId]
 * @param {boolean} [props.disabled]
 */
export function ImagePicker({
  value,
  publicId = '',
  onChange,
  token,
  uploadsConfigured = true,
  maxUploadMb = 5,
  onBusyChange,
  error,
  errorId,
  hintId,
  inputId,
  disabled = false,
}) {
  const uid = useId();
  const fileId = inputId ?? `${uid}-file`;
  const fileInputRef = useRef(null);

  // 'upload' shows the picker; 'url' shows the paste field. Someone editing a
  // project that already uses a pasted URL lands straight in 'url'.
  const [mode, setMode] = useState(value && !publicId ? 'url' : 'upload');
  const [status, setStatus] = useState('idle'); // idle | optimizing | uploading | done | error
  const [progress, setProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState(null);
  const [savedBytes, setSavedBytes] = useState(null);
  const [message, setMessage] = useState(null);
  const [remoteFailed, setRemoteFailed] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Wrapped in an object so "drag over a child" does not count as leaving.
  const dragDepth = useRef(0);

  // Never leave a blob URL behind: it pins the whole image in memory.
  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const busy = status === 'optimizing' || status === 'uploading';

  // The form blocks submission while an upload is in flight, so it needs to
  // know about it. Reported upward rather than duplicated as separate state.
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  async function handleFile(file) {
    if (!file) return;

    setMessage(null);
    setProgress(0);
    setSavedBytes(null);

    let prepared;
    try {
      setStatus('optimizing');
      prepared = await optimizeImage(file);
    } catch (caught) {
      setStatus('error');
      setMessage(
        caught instanceof ImageError
          ? caught.message
          : 'That image could not be processed. Please try another file.',
      );
      return;
    }

    // Show the image immediately from a local blob URL - the admin sees what
    // they picked without waiting for the network.
    setLocalPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return prepared.previewUrl;
    });
    setRemoteFailed(false);
    setSavedBytes(
      prepared.optimized && prepared.bytes < prepared.originalBytes
        ? { from: prepared.originalBytes, to: prepared.bytes }
        : null,
    );

    if (!uploadsConfigured) return;

    try {
      setStatus('uploading');
      const uploaded = await uploadProjectImage(prepared.file, token, {
        onProgress: setProgress,
      });

      setStatus('done');
      onChange({ url: uploaded.url, publicId: uploaded.publicId });
    } catch (caught) {
      setStatus('error');
      // A 401 is handled by the dashboard (it drops the session), so only
      // surface genuine upload failures here.
      const isAuth = caught instanceof ApiError && caught.status === 401;
      if (!isAuth) {
        setMessage(caught?.message ?? 'The image could not be uploaded.');
      }
    }
  }

  function handleInputChange(event) {
    const file = event.target.files?.[0];
    // Reset immediately so picking the same file twice still fires a change.
    event.target.value = '';
    handleFile(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (disabled || busy) return;
    const file = event.dataTransfer?.files?.[0];
    handleFile(file);
  }

  function handleRemove() {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
    setStatus('idle');
    setProgress(0);
    setMessage(null);
    setSavedBytes(null);
    setRemoteFailed(false);
    onChange({ url: '', publicId: '' });
  }

  function switchMode(next) {
    setMode(next);
    setMessage(null);
    setStatus('idle');
    setProgress(0);
    setSavedBytes(null);
  }

  // What to render in the preview box.
  const previewSrc = localPreview || value;
  const hasImage = Boolean(previewSrc);
  const describeIds = [error ? errorId : hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="image-picker">
      <div className="image-picker__head">
        <label className="field__label" htmlFor={fileId}>
          Project image
          <span className="field__optional">Optional</span>
        </label>

        {uploadsConfigured && (
          <div className="image-picker__modes">
            <button
              type="button"
              className={`image-picker__mode ${mode === 'upload' ? 'is-active' : ''}`}
              onClick={() => switchMode('upload')}
              aria-pressed={mode === 'upload'}
              disabled={disabled || busy}
            >
              Upload
            </button>
            <button
              type="button"
              className={`image-picker__mode ${mode === 'url' ? 'is-active' : ''}`}
              onClick={() => switchMode('url')}
              aria-pressed={mode === 'url'}
              disabled={disabled || busy}
            >
              Use a URL
            </button>
          </div>
        )}
      </div>

      {mode === 'upload' && uploadsConfigured ? (
        <>
          {/*
           * The file input is clipped rather than display:none so it stays in
           * the accessibility tree and reachable by Tab. The wrapping element
           * picks up the focus ring via :focus-within.
           */}
          <div
            className={`image-picker__drop ${dragging ? 'is-dragging' : ''} ${
              disabled ? 'is-disabled' : ''
            }`.trim()}
            onDragEnter={(event) => {
              event.preventDefault();
              dragDepth.current += 1;
              if (!disabled && !busy) setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              dragDepth.current -= 1;
              if (dragDepth.current <= 0) {
                dragDepth.current = 0;
                setDragging(false);
              }
            }}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              id={fileId}
              type="file"
              accept="image/*"
              className="visually-hidden"
              onChange={handleInputChange}
              disabled={disabled || busy}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={describeIds}
            />

            <span className="image-picker__drop-icon" aria-hidden="true">
              <Icon name="arrowUp" size={18} />
            </span>

            <div className="image-picker__drop-text">
              <span className="image-picker__drop-title">
                {busy ? 'Uploading…' : 'Choose an image'}
              </span>
              <span className="image-picker__drop-hint">
                {busy
                  ? 'Please keep this tab open.'
                  : `From your computer or phone · JPEG, PNG, WebP or GIF · up to ${maxUploadMb} MB`}
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={disabled || busy}
              loading={busy}
              onClick={() => fileInputRef.current?.click()}
              icon={<Icon name="plus" size={15} />}
            >
              {busy ? 'Working…' : 'Choose Image'}
            </Button>
          </div>

          {busy && (
            <div className="image-picker__progress">
              <div
                className="image-picker__bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
                aria-label="Upload progress"
              >
                <span
                  className="image-picker__bar-fill"
                  style={{ width: `${Math.max(4, Math.round(progress * 100))}%` }}
                />
              </div>
              <span className="image-picker__progress-text">
                {status === 'optimizing' ? 'Optimising…' : `Uploading ${Math.round(progress * 100)}%`}
              </span>
            </div>
          )}
        </>
      ) : (
        <input
          id={fileId}
          className={`input ${error ? 'input--invalid' : ''}`.trim()}
          value={value}
          onChange={(event) => onChange({ url: event.target.value, publicId: '' })}
          placeholder="https://example.com/screenshot.png"
          inputMode="url"
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describeIds}
        />
      )}

      {hasImage && previewSrc !== value && (
        // eslint-disable-next-line jsx-a11y/alt-text -- decorative; the field label carries the meaning
        <img src={previewSrc} alt="" className="visually-hidden" aria-hidden="true" />
      )}

      {hasImage && (
        <div className="image-picker__preview">
          {remoteFailed ? (
            <p className="project-form__preview-failed">
              <Icon name="alert" size={13} />
              That image could not be loaded. Check the URL, or choose a file instead.
            </p>
          ) : (
            <img
              src={previewSrc}
              alt="Preview of the selected project image"
              className="image-picker__preview-img"
              onError={() => setRemoteFailed(true)}
              onLoad={() => setRemoteFailed(false)}
            />
          )}

          <div className="image-picker__preview-meta">
            <span className="image-picker__preview-label">
              {status === 'done' ? 'Uploaded' : status === 'error' ? 'Not saved' : 'Preview'}
            </span>
            {savedBytes && (
              <span className="image-picker__saved">
                {formatBytes(savedBytes.from)} → {formatBytes(savedBytes.to)}
              </span>
            )}
            <div className="image-picker__preview-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || busy}
                icon={<Icon name="trash" size={14} />}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload-specific errors lead with their own message. */}
      {message && (
        <p className="field__error" role="alert">
          <Icon name="alert" size={13} />
          {message}
        </p>
      )}

      {error && (
        <p className="field__error" id={errorId}>
          <Icon name="alert" size={13} />
          {error}
        </p>
      )}

      {!error && !message && (
        <p className="field__hint" id={hintId}>
          {mode === 'url' && uploadsConfigured
            ? 'The image is fetched from wherever you host it. Leave empty to show a placeholder instead.'
            : 'Large photos are resized automatically before upload, so the site stays fast.'}
        </p>
      )}
    </div>
  );
}

export default ImagePicker;
