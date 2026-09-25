import { Hero } from '../sections/Hero.jsx';
import { About } from '../sections/About.jsx';
import { Skills } from '../sections/Skills.jsx';
import { Projects } from '../sections/Projects.jsx';
import { Experience } from '../sections/Experience.jsx';
import { Education } from '../sections/Education.jsx';
import { Contact } from '../sections/Contact.jsx';

/**
 * The public portfolio. Each section owns its own <section> landmark, id and
 * background so the page composition stays readable here.
 */
export function PortfolioPage() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Education />
      <Contact />
    </>
  );
}

export default PortfolioPage;
