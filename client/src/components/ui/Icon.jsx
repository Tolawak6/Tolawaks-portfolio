/**
 * Inline SVG icon set.
 *
 * Inlined rather than pulled from an icon package so the site ships no extra
 * dependency, no icon font, and no network request for a handful of glyphs.
 *
 * All icons are drawn on a 24x24 grid, use currentColor, and are hidden from
 * assistive technology because they always accompany a visible text label.
 */

const PATHS = {
  /* Navigation / UI */
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUpRight: <path d="M7 17L17 7M8 7h9v9" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  externalLink: <path d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  mail: <path d="M3 6.5h18v11H3zM3 7l9 6 9-6" />,
  phone: (
    <path d="M5 3h3.2l1.6 4-2 1.4a12 12 0 0 0 5.8 5.8l1.4-2 4 1.6V17a2 2 0 0 1-2.2 2A16 16 0 0 1 3 5.2 2 2 0 0 1 5 3z" />
  ),
  alert: <path d="M12 8v5M12 16.5h.01M10.3 3.9L2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0z" />,
  refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />,
  check: <path d="M4 12.5l5 5L20 6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <path d="M4 20h4L20 8l-4-4L4 16v4zM14 6l4 4" />,
  trash: <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  lock: <path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" />,
  logout: <path d="M15 4h4v16h-4M11 8l-4 4 4 4M7 12h9" />,
  inbox: <path d="M3 13h5l1 3h6l1-3h5M5 5h14l2 8v6H3v-6z" />,
  inboxEmpty: <path d="M3 13h5l1 3h6l1-3h5M5 5h14l2 8v6H3v-6zM9 9h6" />,
  pin: <path d="M12 22s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  code: <path d="M9 18l-6-6 6-6M15 6l6 6-6 6" />,

  /* Skill category icons */
  layout: <path d="M3 4h18v16H3zM3 10h18M10 10v10" />,
  server: (
    <>
      <path d="M3 4h18v6H3zM3 14h18v6H3z" />
      <path d="M7 7h.01M7 17h.01" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </>
  ),
  tools: <path d="M14.7 6.3a4 4 0 0 0 5 5L21 21H3l7.6-7.6M14.7 6.3L12 3.6" />,
  spark: <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4zM18 16l.8 2.2L21 19l-2.2.8L18 22" />,

  /* Social */
  github: (
    <path
      d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"
      fill="currentColor"
      stroke="none"
    />
  ),
  linkedin: (
    <path
      d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05 4.02 0 4.76 2.64 4.76 6.08V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H9z"
      fill="currentColor"
      stroke="none"
    />
  ),
  send: <path d="M21 3L3 10.5l7 3 3 7L21 3zM10 13.5l4-4" />,
  globe: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3.5 9h17M3.5 15h17M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />,
};

export function Icon({ name, size = 18, strokeWidth = 1.6, className = '', ...rest }) {
  const path = PATHS[name];
  if (!path) return null;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {path}
    </svg>
  );
}

export default Icon;
