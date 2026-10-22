/**
 * =============================================================================
 *  ALL EDITABLE PERSONAL CONTENT LIVES IN THIS ONE FILE.
 * =============================================================================
 *
 * Change your name, bio, skills, experience, education, CV path and social
 * links here - you do not need to edit any React component to update content.
 *
 * Projects are NOT listed here on purpose: they come from PostgreSQL through
 * the Express API and are managed from the /admin dashboard.
 */

/* ---------------------------------------------------------------------------
 * 1. Profile - used by the header, hero, footer and SEO tags
 * ------------------------------------------------------------------------- */
export const profile = {
  name: '>_^Tolawak ',
  fullName: 'Tolawak Merga Abetu',
  initials: 'TA',
  title: 'Full-Stack Web Developer',
  tagline: 'Full-Stack Web Developer',

  // Roles cycled by the typewriter animation in the hero (first item is primary).
  // Keep a single item if you want it to type & delete only "Full-Stack Web Developer".
  typewriterRoles: [
    'Full-Stack Web Developer',
    'Integrating Machine Learning Solutions',
    'API Integration',
  ],

  heroSummary:
    
    'Full-Stack Web Developer with strong passion for building scalable web applications, training and deploying Machine Learning models and exploring Mobile App Development.' +
    'Love turning ideas into practical, innovative solutions through code just talk to me over a coffee. ',
    

  location: 'Addis Ababa, Ethiopia',
  availability: 'Available for developer roles & freelance projects',

  // Replace client/public/cv/Tolawak_Merga_Abetu_CV.pdf with your own PDF anytime.
  cv: {
    href: '/cv/Tolawak_Merga_Abetu_CV.pdf',
    fileName: 'Tolawak_M_Abetu_CV.pdf',
    label: 'Download CV',
  },

  githubUrl: 'https://github.com/Tolawak6',
  githubHandle: 'Tolawak6',
  linkedinUrl: 'https://www.linkedin.com/in/tolawak-merga',

  photo: {
    src: '/images/portrait.jpg',
    alt: 'Portrait of Tolawak M. Abetu',
    width: 832,
    height: 2000,
  },
};

/* ---------------------------------------------------------------------------
 * 2. Calls to action in the hero
 * ------------------------------------------------------------------------- */
export const heroActions = {
  primary: { label: 'View Projects', href: '#projects' },
  secondary: { label: 'Get in Touch', href: '#contact' },
};

/* ---------------------------------------------------------------------------
 * 3. About, Education & Spoken Languages (no repetition of Experience/CV/GitHub)
 * ------------------------------------------------------------------------- */
export const about = {
 

  focus: {
    primary: 'Independant Full-Stack Web Developer',
    secondary: 'React · Node.js/Express · Next.js · Python · PostgreSQL',
    meta: 'Open for Remote Jobs and full-time jobs in Addis Ababa, Ethiopia',
  },

  languages: [
    { name: 'Amharic', level: 'Native' },
    { name: 'English', level: 'Proficient' },
    { name: 'Afan Oromo', level: 'Fluent' },
  ],
};

export const education = [
  {
    id: 'haramaya-bsc',
    degree: 'B.Sc. in Computer Science',
    institution: 'Haramaya University',
    location: 'Haramaya, Ethiopia',
    year: 'May 2022 - June 2025',
    CGPA: '3.12',
  },
];

/* ---------------------------------------------------------------------------
 * 4. Experience (rendered in its own dedicated stacked-card section)
 *    Edit `description` anytime to add specific project outcomes from each role.
 * ------------------------------------------------------------------------- */
export const experience = [
  {
    id: 'freelance',
    position: 'Freelance Developer',
    organization: 'Independent',
    location: 'Addis Ababa',
    startDate: '2026',
    endDate: 'Present',
    type: 'Freelance',
    current: true,
    description:
      'Designing and delivering web applications for local clients using React and Next.js ' +
      'on the frontend, paired with Node.js/Express and PostgreSQL/MongoDB backends.',
  },
  {
    id: 'ess-internship',
    position: 'Web Developer Intern',
    organization: 'Ethiopian Statistical Service',
    location: 'Addis Ababa',
    startDate: 'Jul 2024',
    endDate: 'Aug 2024',
    type: 'Internship',
    current: false,
    description:
      'Collaborated with the software team and developed a full-sack web system for Human Resource which improved adminstrative effors 45% less , Manual paper work and document handling by 90% less and ' +
      'HR report generation time by 80% less than the manual system .',
    score:'Scored: 39.5/40',
  },
];

/* ---------------------------------------------------------------------------
 * 5. Tech Stack (6 symmetric groups rendered with inline tool SVG icons)
 * ------------------------------------------------------------------------- */
export const skillGroups = [
  {
    id: 'languages',
    title: 'Languages',
    skills: [
      { name: 'JavaScript' },
      { name: 'Python' },
      { name: 'PHP' },
      { name: 'C++' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    skills: [
      { name: 'HTML5' },
      { name: 'CSS3' },
      { name: 'React' },
      { name: 'Vite' },
      { name: 'Tailwind CSS' },
      { name: 'Next.js' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend & APIs',
    skills: [
      { name: 'Node.js' },
      { name: 'Express.js' },
      { name: 'FastAPI' },
      { name: 'RESTful APIs' },
      { name: 'JSON' },
    ],
  },
  {
    id: 'database',
    title: 'Database',
    skills: [{ name: 'PostgreSQL' }, { name: 'MySQL' }, { name: 'MongoDB' }],
  },
  {
    id: 'ai',
    title: 'Machine Learning & AI',
    skills: [{ name: 'Pandas' }, { name: 'Numpy' }, { name:'Scikit-Learn'},{name:'Matplotlib'}, { name: 'Python' }],
  },
  {
    id: 'tools',
    title: 'Mobile & Tools',
    skills: [
      { name: 'Flutter' },
      { name: 'React Native' },
      { name: 'Git' },
      { name: 'GitHub' },
    ],
  },
];

/* ---------------------------------------------------------------------------
 * 6. Contact & Social cards
 * ------------------------------------------------------------------------- */
export const contact = {
  intro: 'Open to full-stack developer roles, freelance projects, and technical collaboration.',
  email: 'tolawak6@gmail.com',
  phone: {
    display: '0909689044',
    href: 'tel:+251909689044',
  },
  cards: [
    {
      id: 'email',
      label: 'Email',
      value: 'tolawak6@gmail.com',
      href: 'mailto:tolawak6@gmail.com',
      icon: 'mail',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      value: 'tolawak-merga',
      href: 'https://www.linkedin.com/in/tolawak-merga',
      icon: 'linkedin',
      external: true,
    },
    {
      id: 'github',
      label: 'GitHub',
      value: 'Tolawak6',
      href: 'https://github.com/Tolawak6',
      icon: 'github',
      external: true,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      value: '@t_o_l_a_w_a_k',
      href: 'https://www.instagram.com/t_o_l_a_w_a_k',
      icon: 'instagram',
      external: true,
    },
    {
      id: 'phone',
      label: 'Phone',
      value: '0909689044',
      href: 'tel:+251909689044',
      icon: 'phone',
    },
    {
      id: 'location',
      label: 'Location',
      value: 'Addis Ababa, Ethiopia',
      href: null,
      icon: 'pin',
    },
  ],
  links: [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      value: 'tolawak-merga',
      href: 'https://www.linkedin.com/in/tolawak-merga',
      icon: 'linkedin',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      value: '@t_o_l_a_w_a_k',
      href: 'https://www.instagram.com/t_o_l_a_w_a_k',
      icon: 'instagram',
    },
  ],
  formNote: 'Prefer writing right here? Send a message directly below or email',
};

/* ---------------------------------------------------------------------------
 * 7. Section headings
 * ------------------------------------------------------------------------- */
export const sections = {
  about: {
    eyebrow: 'cat about.txt',
    title: 'About Me',
    intro: '',
  },
  experience: {
    eyebrow: 'cat experience.log',
    title: 'Experience',
    intro: '',
  },
  skills: {
    eyebrow: 'ls tech-stack/',
    title: 'Tech Stack',
    intro: '',
  },
  projects: {
    eyebrow: 'ls projects/',
    title: 'Projects',
    intro: 'Loaded live from PostgreSQL — explore the code or open the live app.',
  },
  contact: {
    eyebrow: 'ping tolawak',
    title: 'Get in Touch',
    intro: '',
  },
};

/* ---------------------------------------------------------------------------
 * 8. Navigation
 * ------------------------------------------------------------------------- */
export const navigation = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Tech Stack' },
  { id: 'projects', label: 'Projects' },
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
