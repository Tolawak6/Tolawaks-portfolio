/**
 * =============================================================================
 *  ALL EDITABLE PERSONAL CONTENT LIVES IN THIS ONE FILE.
 * =============================================================================
 *
 * Change your name, bio, skills, experience, education and links here - you
 * should not need to touch any component to update the site's content.
 *
 * Projects are NOT listed here on purpose: they come from PostgreSQL through
 * the Express API and are managed from the /admin dashboard.
 *
 * Everything below reflects the CV you provided. Two items are still
 * placeholders and are marked PLACEHOLDER - replace them or delete the entry.
 *
 * Search for "TODO" to find the two things worth filling in.
 */

/* ---------------------------------------------------------------------------
 * 1. Profile - used by the header, hero, footer and SEO tags
 * ------------------------------------------------------------------------- */
export const profile = {
  name: 'Tolawak Merga',
  // Full legal name, used for structured data / the page title.
  fullName: 'Tolawak Merga Abetu',
  // Shown next to the logo in the header. Keep it short.
  initials: 'TM',
  title: 'Full-Stack Web Developer',
  // One-line summary under the hero title.
  tagline: 'Full-Stack Web Developer',
  // The short paragraph shown beside your photo in the hero.
  heroSummary:
    'Computer Science graduate building web applications end to end - React interfaces on the ' +
    'front, Node.js and Express APIs with PostgreSQL or MySQL behind them. I also work in Python, ' +
    'including machine learning models and data analysis.',

  location: 'Addis Ababa, Ethiopia',
  availability: 'Open to developer roles and freelance work',

  /* ---- Your photo -------------------------------------------------------
   * Prepared headshot at client/public/images/portrait.jpg
   * To swap it: drop in a new file with the same name (or change `src` below).
   * Recommended: 4:5 portrait, at least 900px on the short edge.
   * --------------------------------------------------------------------- */
  photo: {
    src: '/images/portrait.jpg',
    alt: 'Portrait of Tolawak Merga',
    width: 832,
    height: 1040,
  },
};

/* ---------------------------------------------------------------------------
 * 2. Calls to action in the hero
 * ------------------------------------------------------------------------- */
export const heroActions = {
  primary: { label: 'View My Projects', href: '#projects' },
  secondary: { label: 'Contact Me', href: '#contact' },
};

/* ---------------------------------------------------------------------------
 * 3. About section
 *    `paragraphs` is rendered in order; keep each one short.
 *    Drawn from your CV profile statement - no added claims.
 * ------------------------------------------------------------------------- */
export const about = {
  paragraphs: [
    'I am a Computer Science graduate based in Addis Ababa with practical experience building ' +
      'web applications and implementing machine learning models.',

    'My work sits mostly in the JavaScript ecosystem - React and Vite for the frontend, and ' +
      'Node.js with Express and PostgreSQL or MySQL for the backend. I also build APIs in Python ' +
      'with Django and FastAPI, and have worked with PHP and C++ along the way.',

    'I care about clear data models, readable code and interfaces that stay out of the way. I am ' +
      'a good communicator, work well in a team, and enjoy working through problems methodically ' +
      'rather than reaching for the first solution.',
  ],

  /* Quick facts shown beside the text. Edit or remove any entry. */
  highlights: [
    {
      label: 'Focus',
      value: 'Full-stack web development, REST APIs, relational databases',
    },
    {
      label: 'Frontend',
      value: 'React, Vite, Tailwind CSS, responsive layouts',
    },
    {
      label: 'Backend',
      value: 'Node.js, Express, Django, FastAPI, PostgreSQL, MySQL',
    },
    {
      label: 'Also learning',
      value: 'Machine learning and data analysis with Python',
    },
    {
      label: 'Languages',
      value: 'Amharic (native), English (proficient), Afan Oromo (proficient)',
    },
  ],
};

/* ---------------------------------------------------------------------------
 * 4. Skills
 *
 *    `level` is OPTIONAL and deliberately left off, so nothing here overstates
 *    your ability - each chip states only that you work with the technology.
 *    To add a proficiency cue to an individual skill, use one of:
 *
 *      { name: 'React', level: 'confident' }   // primary, day-to-day
 *      { name: 'React', level: 'working' }     // comfortable, built with it
 *      { name: 'React', level: 'learning' }    // actively building up
 * ------------------------------------------------------------------------- */
export const skillGroups = [
  {
    id: 'frontend',
    title: 'Frontend',
    icon: 'layout',
    summary: 'Interface development, component structure and responsive layout.',
    skills: [
      { name: 'HTML5' },
      { name: 'CSS3' },
      { name: 'JavaScript' },
      { name: 'React' },
      { name: 'Vite' },
      { name: 'Tailwind CSS' },
      { name: 'Bootstrap' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    icon: 'server',
    summary: 'Server-side logic, request handling and API design.',
    skills: [
      { name: 'Node.js' },
      { name: 'Express.js' },
      { name: 'Django' },
      { name: 'FastAPI' },
    ],
  },
  {
    id: 'database',
    title: 'Databases',
    icon: 'database',
    summary: 'Relational modelling, schema design and querying.',
    skills: [{ name: 'PostgreSQL' }, { name: 'MySQL' }, { name: 'MongoDB' }],
  },
  {
    id: 'apis',
    title: 'APIs',
    icon: 'globe',
    summary: 'Designing, consuming and integrating services.',
    skills: [
      { name: 'RESTful APIs' },
      { name: 'API Integration' },
      { name: 'JSON' },
    ],
  },
  {
    id: 'ai',
    title: 'AI & Data',
    icon: 'spark',
    summary: 'Machine learning models and data handling.',
    skills: [
      { name: 'Python' },
      { name: 'Machine Learning' },
      { name: 'Data Analysis' },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile',
    icon: 'code',
    summary: 'Cross-platform application development.',
    skills: [{ name: 'Flutter' }, { name: 'React Native' }],
  },
  {
    id: 'tools',
    title: 'Tools & Languages',
    icon: 'tools',
    summary: 'Version control and additional languages.',
    skills: [
      { name: 'Git' },
      { name: 'GitHub' },
      { name: 'PHP' },
      { name: 'C++' },
    ],
  },
];

/* ---------------------------------------------------------------------------
 * 5. Experience
 *
 *    Your real entries, taken from your CV.
 *
 *    TODO: The CV lists these roles without any description of what you did, so
 *    nothing has been invented here. Add two or three concrete bullets to each
 *    `responsibilities` array - what you built, with what, and what it was for.
 *    That is the single biggest improvement you can make to this page.
 *
 *    Fields: position, organization, location, startDate, endDate, description,
 *            responsibilities[]
 * ------------------------------------------------------------------------- */
export const experience = [
  {
    id: 'ess-internship',
    position: 'Web Developer Intern',
    organization: 'Ethiopian Statistical Service',
    location: 'Addis Ababa, Ethiopia',
    startDate: 'Jul 2024',
    endDate: 'Aug 2024',
    description: '',
    responsibilities: [],
  },
  {
    id: 'freelance',
    position: 'Freelance Developer',
    organization: 'Independent',
    location: 'Addis Ababa, Ethiopia',
    startDate: '2024',
    endDate: 'Present',
    description: '',
    responsibilities: [],
  },
];

/* ---------------------------------------------------------------------------
 * 6. Education
 *    Your real entry, taken from your CV.
 *
 *    TODO: add a sentence about your focus areas, coursework or final project if
 *    you want more weight here - see `description` below.
 *
 *    Fields: degree, institution, location, year, description, highlights[]
 * ------------------------------------------------------------------------- */
export const education = [
  {
    id: 'haramaya-bsc',
    degree: 'B.Sc. in Computer Science',
    institution: 'Haramaya University',
    location: 'Haramaya, Ethiopia',
    year: '2021 - 2025',
    description: '',
    highlights: [],
  },
];

/* ---------------------------------------------------------------------------
 * 7. Contact details
 *
 *    `phone` is optional - delete the entry if you would rather not publish
 *    your number, since a public page is readable by scrapers. Everything else
 *    is unaffected.
 *
 *    PLACEHOLDER: LinkedIn. Set `href` to your real profile URL, or delete the
 *    entry - a link with href: '#' renders as "not added yet", never a broken
 *    link.
 * ------------------------------------------------------------------------- */
export const contact = {
  intro:
    'I am happy to hear about developer roles, freelance work or collaboration. ' +
    'Email is the quickest way to reach me.',
  email: 'tolawak6@gmail.com',
  phone: {
    // Shown as typed on your CV.
    display: '0909689044',
    // Ethiopian mobile numbers are dialled internationally as +251 followed by
    // the number without its leading zero. Adjust if that is not right for you.
    href: 'tel:+251909689044',
  },
  links: [
    {
      id: 'github',
      label: 'GitHub',
      value: 'github.com/Tolawak6',
      href: 'https://github.com/Tolawak6',
      icon: 'github',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      value: 'linkedin.com/in/your-profile', // PLACEHOLDER
      href: '#', // PLACEHOLDER
      icon: 'linkedin',
    },
  ],
  formNote: 'You can also email me directly at',
};

/* ---------------------------------------------------------------------------
 * 8. Section copy - headings and intros
 *    Change any wording here without touching a component.
 * ------------------------------------------------------------------------- */
export const sections = {
  about: {
    eyebrow: 'About',
    title: 'A developer focused on the whole path from data to interface',
    intro:
      'How I approach building software, and the parts of the stack I enjoy working in most.',
  },
  skills: {
    eyebrow: 'Skills',
    title: 'Technologies I work with',
    intro:
      'Grouped by where they sit in a project. No percentage bars - just the tools I actually use.',
  },
  projects: {
    eyebrow: 'Projects',
    title: 'Selected work',
    intro: 'Projects are loaded from the API, so this list stays current without a redeploy.',
  },
  experience: {
    eyebrow: 'Experience',
    title: 'Where I have worked',
    intro: 'Roles, responsibilities and what I contributed.',
  },
  education: {
    eyebrow: 'Education',
    title: 'Education & learning',
    intro: 'Formal study and the areas I keep developing.',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Let us build something',
    intro: 'Send a message and I will get back to you.',
  },
};

/* ---------------------------------------------------------------------------
 * 9. Navigation
 *    `id` must match the `id` of the corresponding section element.
 * ------------------------------------------------------------------------- */
export const navigation = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];

export default {
  profile,
  heroActions,
  about,
  skillGroups,
  experience,
  education,
  contact,
  sections,
  navigation,
};
