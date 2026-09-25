import { heroActions, profile } from '../content/portfolio.js';
import { Button } from '../components/ui/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import './Hero.css';

/**
 * Hero: name, title, short introduction and the professional photo, with the
 * text on one side and the photo on the other on desktop. Everything stacks
 * naturally on mobile.
 */
export function Hero() {
  const { photo } = profile;

  return (
    <section className="hero" id="home" aria-labelledby="hero-heading">
      <div className="container hero__inner">
        <div className="hero__content">
          {profile.availability && (
            <p className="hero__badge">
              <span className="hero__badge-dot" aria-hidden="true" />
              {profile.availability}
            </p>
          )}

          <h1 className="hero__name" id="hero-heading">
            {profile.name}
          </h1>

          <p className="hero__title">{profile.title}</p>

          {/* The visible rule keeps the title and the summary visually separate
              without adding another element that screen readers would announce. */}
          <div className="hero__rule" aria-hidden="true" />

          <p className="hero__summary">{profile.heroSummary}</p>

          <div className="hero__actions">
            <Button
              variant="primary"
              size="lg"
              href={heroActions.primary.href}
              icon={<Icon name="arrowRight" size={17} />}
              iconPosition="end"
            >
              {heroActions.primary.label}
            </Button>
            <Button variant="secondary" size="lg" href={heroActions.secondary.href}>
              {heroActions.secondary.label}
            </Button>
          </div>

          <ul className="hero__meta">
            <li>
              <Icon name="pin" size={15} />
              {profile.location}
            </li>
            <li>
              <Icon name="code" size={15} />
              React · Node.js · Express · PostgreSQL · Python
            </li>
          </ul>
        </div>

        <div className="hero__portrait-wrap">
          {/* Decorative offset frame - purely visual, hidden from AT. */}
          <span className="hero__portrait-offset" aria-hidden="true" />

          <figure className="hero__portrait">
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              /* Above the fold: load eagerly and prioritise it. */
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="hero__portrait-img"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}

export default Hero;
