import { useState } from 'react';
import { heroActions, profile } from '../content/portfolio.js';
import { Button } from '../components/ui/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Typewriter } from '../components/ui/Typewriter.jsx';
import './Hero.css';

const FALLBACK_PORTRAIT = '/images/portrait-placeholder.svg';

/**
 * Clean, zero-repetition Hero (#000000 + #FDBF2D, Dark & Light modes):
 * - Smaller circular portrait (no badge underneath)
 * - Clean "Tolawak M. Abetu" heading (no yellow underline in Light mode)
 * - Typewriter (typing & deleting) effect on "Full-Stack Web Developer"
 * - Single prominent Download CV button + View Projects + Get in Touch
 */
export function Hero() {
  const [src, setSrc] = useState(profile.photo.src);

  return (
    <section id="home" className="hero" aria-labelledby="hero-heading">
      <div className="hero__glow" aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__content">
          <div className="hero__top-meta">
            <span className="hero__status">
              <span className="hero__status-dot" aria-hidden="true" />
              {profile.availability}
            </span>
          </div>

          <h1 id="hero-heading" className="hero__name">
            Tolawak M. <span className="hero__name-accent">Abetu</span>
          </h1>

          <p className="hero__role">
            <span className="hero__role-prefix" aria-hidden="true">
              //
            </span>{' '}
            <Typewriter phrases={profile.typewriterRoles} />
            <span className="hero__role-sep" aria-hidden="true">
              ·
            </span>
            <span className="hero__role-loc">{profile.location}</span>
          </p>

          <p className="hero__summary">{profile.heroSummary}</p>

          <div className="hero__actions">
            <Button
              href={profile.cv.href}
              download={profile.cv.fileName}
              variant="primary"
              size="lg"
              icon={<Icon name="download" size={17} />}
              iconPosition="start"
            >
              {profile.cv.label}
            </Button>

            <Button
              href={heroActions.primary.href}
              variant="secondary"
              size="lg"
              icon={<Icon name="arrowRight" size={17} />}
              iconPosition="end"
            >
              {heroActions.primary.label}
            </Button>

            <Button href={heroActions.secondary.href} variant="ghost" size="lg">
              {heroActions.secondary.label}
            </Button>
          </div>
        </div>

        <div className="hero__avatar-col">
          <div className="hero__avatar-wrap">
            <span className="hero__avatar-orbit" aria-hidden="true" />
            <div className="hero__avatar-ring">
              <img
                className="hero__avatar-img"
                src={src}
                alt={profile.photo.alt}
                width={250}
                height={250}
                fetchPriority="high"
                decoding="async"
                onError={() => {
                  if (src !== FALLBACK_PORTRAIT) setSrc(FALLBACK_PORTRAIT);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
