/**
 * Inline SVG icons for developer tools & languages (modeled after clean
 * developer tech-stack badges, zero external network dependencies).
 *
 * Uses crisp recognizable silhouettes + brand hues that stay legible in both
 * Dark (#000000) and Light (#FFFFFF) themes.
 */

function normalizeKey(name = '') {
  return String(name)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\.js$/, 'js')
    .replace(/[^a-z0-9+#]/g, '');
}

const ICONS = {
  javascript: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#FDBF2D" />
      <path
        d="M12.6 16.9c0 1.4-.8 2.1-2.1 2.1-1.1 0-1.8-.5-2.1-1.3l1.3-.8c.2.5.5.7.9.7.5 0 .7-.2.7-.9V11h1.3v5.9zm4.7 2.1c-1.4 0-2.3-.7-2.7-1.6l1.3-.7c.3.6.7 1 1.4 1 .6 0 1-.3 1-.7 0-.5-.4-.7-1.1-1l-.4-.2c-1.1-.5-1.9-1.1-1.9-2.3 0-1.2.9-2 2.3-2 1 0 1.7.3 2.2 1.2l-1.2.8c-.3-.5-.6-.7-1-.7-.5 0-.8.3-.8.7 0 .5.3.7 1 1l.4.2c1.3.6 2 1.1 2 2.4 0 1.3-1.1 1.9-2.5 1.9z"
        fill="#000000"
      />
    </>
  ),

  python: (
    <>
      <path
        d="M11.9 2C8.7 2 9 3.4 9 3.4v2h3.1v.7H6.6S4 5.8 4 9.1s2.3 3.1 2.3 3.1h1.4v-1.7s-.1-2.2 2.2-2.2h3.7s2.1 0 2.1-2V3.8S16 2 11.9 2z"
        fill="#3B82F6"
      />
      <circle cx="10.2" cy="4" r="0.8" fill="#FFFFFF" />
      <path
        d="M12.1 22c3.2 0 2.9-1.4 2.9-1.4v-2h-3.1v-.7h5.5S20 18.2 20 14.9s-2.3-3.1-2.3-3.1h-1.4v1.7s.1 2.2-2.2 2.2h-3.7s-2.1 0-2.1 2v2.5S8 22 12.1 22z"
        fill="#FDBF2D"
      />
      <circle cx="13.8" cy="20" r="0.8" fill="#000000" />
    </>
  ),

  'c++': (
    <>
      <polygon
        points="12,2 20.5,7 20.5,17 12,22 3.5,17 3.5,7"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="1.9"
      />
      <path
        d="M11 9.2a3.2 3.2 0 1 0 0 5.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14.2 10.6v2.8M12.8 12h2.8M18 10.6v2.8M16.6 12h2.8"
        stroke="#FDBF2D"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </>
  ),

  php: (
    <>
      <ellipse cx="12" cy="12" rx="10" ry="6.2" fill="none" stroke="#818CF8" strokeWidth="1.8" />
      <path
        d="M6.4 14.5l.7-5h2c1 0 1.5.5 1.4 1.4-.1 1-.8 1.6-1.8 1.6H7.4M11.6 14.5l.8-5M12 12h2.1M14.3 9.5l-.8 5M15.8 14.5l.7-5h1.9c.9 0 1.4.5 1.3 1.4-.1 1-.7 1.6-1.7 1.6h-1.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),

  html5: (
    <>
      <path d="M4 3h16l-1.5 15.2L12 21l-6.5-2.8L4 3z" fill="none" stroke="#F97316" strokeWidth="1.8" />
      <path
        d="M16 7.5H8l.4 4h7.1l-.4 4.2L12 16.8l-3.1-1.1-.2-2"
        fill="none"
        stroke="#F97316"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),

  css3: (
    <>
      <path d="M4 3h16l-1.5 15.2L12 21l-6.5-2.8L4 3z" fill="none" stroke="#38BDF8" strokeWidth="1.8" />
      <path
        d="M8 7.5h8l-.4 4H9.2l.2 2.2 2.6.9 2.6-.9.2-2.2"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),

  react: (
    <>
      <circle cx="12" cy="12" r="2" fill="#38BDF8" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="3.8"
        transform="rotate(60 12 12)"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="1.5"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="3.8"
        transform="rotate(120 12 12)"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="1.5"
      />
    </>
  ),

  reactnative: (
    <>
      <circle cx="12" cy="12" r="2" fill="#60A5FA" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" fill="none" stroke="#60A5FA" strokeWidth="1.5" />
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="3.8"
        transform="rotate(60 12 12)"
        fill="none"
        stroke="#FDBF2D"
        strokeWidth="1.5"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="3.8"
        transform="rotate(120 12 12)"
        fill="none"
        stroke="#60A5FA"
        strokeWidth="1.5"
      />
    </>
  ),

  vite: (
    <>
      <path
        d="M3.5 5.2L11.8 21 20.5 5.2 12.2 7.5 3.5 5.2z"
        fill="none"
        stroke="#A855F7"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14.2 3L10 11.4h3.4L11.5 18l5.5-8.4h-3.3L14.2 3z"
        fill="#FDBF2D"
      />
    </>
  ),

  tailwindcss: (
    <>
      <path
        d="M7 10c1-2.7 2.8-4 5.3-4 3.5 0 4 2.6 5.8 3 1.2.3 2.2-.2 2.9-1.3-1 2.7-2.8 4-5.3 4-3.5 0-4-2.6-5.8-3-1.2-.3-2.2.2-2.9 1.3z"
        fill="#38BDF8"
      />
      <path
        d="M3 16.3c1-2.7 2.8-4 5.3-4 3.5 0 4 2.6 5.8 3 1.2.3 2.2-.2 2.9-1.3-1 2.7-2.8 4-5.3 4-3.5 0-4-2.6-5.8-3-1.2-.3-2.2.2-2.9 1.3z"
        fill="#38BDF8"
      />
    </>
  ),

  bootstrap: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="#A855F7" strokeWidth="1.8" />
      <path
        d="M9 7.5h4.2a2.2 2.2 0 0 1 0 4.4H9V7.5zm0 4.4h4.6a2.3 2.3 0 0 1 0 4.6H9v-4.6z"
        fill="none"
        stroke="#A855F7"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </>
  ),

  nodejs: (
    <>
      <polygon
        points="12,2.4 20.2,7.1 20.2,16.9 12,21.6 3.8,16.9 3.8,7.1"
        fill="none"
        stroke="#22C55E"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 14.8V9.4l5 5.4V9.2"
        fill="none"
        stroke="#22C55E"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),

  expressjs: (
    <>
      <path
        d="M3.5 9h5.8M3.5 12h4.6M3.5 15h5.8M13 9.2l6.8 5.8M19.8 9.2L13 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>
  ),

  django: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3.5" fill="none" stroke="#10B981" strokeWidth="1.8" />
      <path
        d="M11.8 6.8v8.4a2.4 2.4 0 1 1-2.4-2.5h2.4M15.8 9.8v6.2c0 1.4-.6 2.2-1.8 2.6M15.8 7.2h.01"
        fill="none"
        stroke="#10B981"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>
  ),

  fastapi: (
    <>
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="#14B8A6" strokeWidth="1.8" />
      <path d="M13.2 5.8L7.8 13h4.2l-1.2 5.2L16.2 11H12l1.2-5.2z" fill="#14B8A6" />
    </>
  ),

  postgresql: (
    <>
      <ellipse cx="12" cy="6.2" rx="7.5" ry="3" fill="none" stroke="#60A5FA" strokeWidth="1.8" />
      <path
        d="M4.5 6.2v11.6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6.2M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"
        fill="none"
        stroke="#60A5FA"
        strokeWidth="1.8"
      />
    </>
  ),

  mysql: (
    <>
      <ellipse cx="12" cy="6.2" rx="7.5" ry="3" fill="none" stroke="#FDBF2D" strokeWidth="1.8" />
      <path
        d="M4.5 6.2v11.6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6.2M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"
        fill="none"
        stroke="#FDBF2D"
        strokeWidth="1.8"
      />
    </>
  ),

  mongodb: (
    <>
      <path
        d="M12 2.5C16.2 6.8 17.5 10.6 15.8 15c-.9 2.3-2.4 3.7-3.8 4.6-1.4-.9-2.9-2.3-3.8-4.6C6.5 10.6 7.8 6.8 12 2.5z"
        fill="none"
        stroke="#22C55E"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 8v13.5" stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),

  restfulapis: (
    <>
      <circle cx="6" cy="12" r="2.2" fill="none" stroke="#FDBF2D" strokeWidth="1.8" />
      <circle cx="18" cy="7" r="2.2" fill="none" stroke="#FDBF2D" strokeWidth="1.8" />
      <circle cx="18" cy="17" r="2.2" fill="none" stroke="#FDBF2D" strokeWidth="1.8" />
      <path d="M8 11l7.8-3.2M8 13l7.8 3.2" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),

  json: (
    <>
      <path
        d="M8.5 5C6.5 5 6 6 6 7.5v2c0 1.2-.8 2.5-2 2.5 1.2 0 2 1.3 2 2.5v2C6 18 6.5 19 8.5 19M15.5 5c2 0 2.5 1 2.5 2.5v2c0 1.2.8 2.5 2 2.5-1.2 0-2 1.3-2 2.5v2c0 1.5-.5 2.5-2.5 2.5"
        fill="none"
        stroke="#FDBF2D"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>
  ),

  machinelearning: (
    <>
      <circle cx="6" cy="7" r="2" fill="#FDBF2D" />
      <circle cx="6" cy="17" r="2" fill="#FDBF2D" />
      <circle cx="12" cy="12" r="2.2" fill="#38BDF8" />
      <circle cx="18.5" cy="9" r="2" fill="#FDBF2D" />
      <circle cx="18.5" cy="15" r="2" fill="#FDBF2D" />
      <path
        d="M7.8 8.2l2.6 2.4M7.8 15.8l2.6-2.4M14 11.2l2.8-1.5M14 12.8l2.8 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </>
  ),

  dataanalysis: (
    <>
      <path d="M4 19.5h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="5.5" y="12" width="3" height="5.5" rx="0.8" fill="#38BDF8" />
      <rect x="10.5" y="8.5" width="3" height="9" rx="0.8" fill="#FDBF2D" />
      <rect x="15.5" y="5.5" width="3" height="12" rx="0.8" fill="#22C55E" />
    </>
  ),

  flutter: (
    <>
      <path d="M14.2 3L5.2 12l2.8 2.8L19.8 3h-5.6z" fill="#38BDF8" />
      <path d="M14.2 11.5L9.4 16.3l4.8 4.7h5.6l-4.8-4.7 4.8-4.8h-5.6z" fill="#0284C7" />
    </>
  ),

  git: (
    <>
      <path
        d="M12 2.8l9.2 9.2-9.2 9.2L2.8 12 12 2.8z"
        fill="none"
        stroke="#F97316"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.6 6.2l5.6 5.6M12 9v6.2" stroke="#F97316" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="9" r="1.4" fill="#F97316" />
      <circle cx="12" cy="15.4" r="1.4" fill="#F97316" />
      <circle cx="15.2" cy="11.8" r="1.4" fill="#F97316" />
    </>
  ),

  github: (
    <path
      d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"
      fill="currentColor"
    />
  ),

  pandas: (
    <>
      <path d="M5 3h4v18H5z" fill="#150458" />
      <path d="M11 6h4v12h-4z" fill="#150458" />
      <path d="M17 2h4v20h-4z" fill="#150458" />
      <path d="M11 9h4v3h-4z" fill="#FFCA00" />
      <path d="M11 14h4v3h-4z" fill="#E70488" />
    </>
  ),
  
  scikitLearn: (
    <>
      <path
        d="M12 3C7 3 3 7 3 12s4 9 9 9c2.5 0 4.5-1 6-2.8L12 12l6-6C16.5 4 14.5 3 12 3z"
        fill="#F89939"
      />
      <path
        d="M12 12l6-6c2 2 3 4 3 6 0 5-4 9-9 9-2.5 0-4.5-1-6-2.8z"
        fill="#3499CD"
      />
    </>
  ),
  
  numpy: (
    <>
      <path d="M12 2L21 7 12 12 3 7z" fill="#4DABCF" />
      <path d="M3 7l9 5v10l-9-5z" fill="#4D77CF" />
      <path d="M21 7l-9 5v10l9-5z" fill="#3569B8" />
      <path d="M12 2l9 5-9 5-9-5z" fill="#4DABCF" />
    </>
  ),
  
  matplotlib: (
    <>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="#11557C"
        strokeWidth="1.5"
      />
      <path d="M12 12L7 5a8 8 0 0 0-3 7z" fill="#F57C00" />
      <path d="M12 12L19 7a8 8 0 0 0-7-4z" fill="#2CA02C" />
      <path d="M12 12L20 14a8 8 0 0 0-1-7z" fill="#1F77B4" />
      <path d="M12 12L10 20a8 8 0 0 0 8-4z" fill="#D62728" />
      <path d="M12 12L4 14a8 8 0 0 0 6 6z" fill="#FFCA00" />
    </>
  ),
  
  nextjs: (
    <>
      <circle cx="12" cy="12" r="10" fill="#000000" />
      <path
        d="M8 17V7l8 10V7"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
};



const ALIASES = {
  js: 'javascript',
  py: 'python',
  cpp: 'c++',
  html: 'html5',
  css: 'css3',
  reactjs: 'react',
  tailwind: 'tailwindcss',
  node: 'nodejs',
  express: 'expressjs',
  postgres: 'postgresql',
  mongo: 'mongodb',
  restapi: 'restfulapis',
  restapis: 'restfulapis',
  apiintegration: 'restfulapis',
  ml: 'machinelearning',
  charts: 'dataanalysis',
};

export function TechIcon({ name, size = 16, className = '' }) {
  const raw = normalizeKey(name);
  const key = ALIASES[raw] ?? raw;
  const glyph = ICONS[key];

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {glyph ?? (
        <path
          d="M8.5 17.5L3 12l5.5-5.5M15.5 6.5L21 12l-5.5 5.5"
          stroke="var(--c-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default TechIcon;
