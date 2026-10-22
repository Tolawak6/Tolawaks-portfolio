import { Hero } from '../sections/Hero.jsx';
import { About } from '../sections/About.jsx';
import { Experience } from '../sections/Experience.jsx';
import { Skills } from '../sections/Skills.jsx';
import { Projects } from '../sections/Projects.jsx';
import { Contact } from '../sections/Contact.jsx';

/**
 * Clean, zero-repetition portfolio layout:
 *  1. Hero (circular portrait, typewriter role, single Download CV button)
 *  2. About Me (concise bio + Education / Core Focus / Languages cards)
 *  3. Experience (stacked role cards with Current badge & dates)
 *  4. Tech Stack (categorized tool badges with inline SVG icons)
 *  5. Projects (PostgreSQL-driven cards with tech pills + Code & Live links)
 *  6. Get in Touch (6 social/contact cards + direct PostgreSQL message form)
 */
export function PortfolioPage() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Projects />
      <Contact />
    </>
  );
}

export default PortfolioPage;
