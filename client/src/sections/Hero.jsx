import { heroActions, profile } from '../content/portfolio.js';
import { Button } from '../components/ui/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import './Hero.css';

const HERO_PILLARS = [
  { code: '01', label: 'Frontend', detail: 'React · Vite · Tailwind CSS' },
  { code: '02', label: 'Backend', detail: 'Node.js · Express · Django · FastAPI' },
  { code: '03', label: 'Databases', detail: 'PostgreSQL · MySQL · MongoDB' },
  { code: '04', label: 'Python & AI', detail: 'Machine Learning · Data Analysis' },
];

/**
 * Editorial Swiss Hero (#000000 + #FDBF2D):
 * - Oversized split display typography with Solar Gold accent.
 * - Authentic framed portrait with architectural corner brackets & spec plate.
 * - Full-bleed #FDBF2D gold specification band at the base (12.67:1 AAA).
 */
export function Hero() {
  const { photo } = profile;
  const nameParts = profile.name.trim().split(/\s+/);
  const firstName = nameParts[0] || profile.name;
  const restName = nameParts.slice(1).join(' ');

  return (
    <section className="hero" id="home" aria-labelledby="hero-heading">
      <div className="container hero__inner">
        <div className="hero__content">
          <div className="hero__top-meta">
            <span className="hero__index" aria-hidden="true">
              00 // PORTFOLIO
            </span>
            {profile.availability && (
              <p className="hero__badge">
                <span className="hero__badge-dot" aria-hidden="true" />
                {profile.availability}
              </p>
            )}
          </div>

          <h1 className="hero__name" id="hero-heading">
            <span className="hero__name-first">{firstName}</span>
            {restName && (
              <>
                {' '}
                <span className="hero__name-accent">
                  {restName}
                  <span className="hero__name-dot" aria-hidden="true">
                    .
                  </span>
                </span>
              </>
            )}
          </h1>

          <div className="hero__role-bar">
            <span className="hero__role-slash" aria-hidden="true">
              //
            </span>
            <p className="hero__title">{profile.title}</p>
          </div>

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
              <span>{profile.location}</span>
            </li>
            <li>
              <Icon name="code" size={15} />
              <span>B.Sc. Computer Science · Haramaya University</span>
            </li>
          </ul>
        </div>

        <div className="hero__portrait-wrap">
          {/* Architectural offset frame in #FDBF2D */}
          <span className="hero__portrait-offset" aria-hidden="true" />
          <span className="hero__portrait-corner" aria-hidden="true" />

          <figure className="hero__portrait">
            <div className="hero__portrait-media">
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="hero__portrait-img"
              />
            </div>
            <figcaption className="hero__portrait-caption">
              <span className="hero__portrait-tag">FIG. 01</span>
              <span className="hero__portrait-caption-name">{profile.fullName}</span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Signature full-bleed #FDBF2D Solar Gold architectural specification strip */}
      <div className="hero__band" aria-label="Core technical capabilities">
        <div className="container">
          <ul className="hero__band-grid">
            {HERO_PILLARS.map((pillar) => (
              <li key={pillar.code} className="hero__band-item">
                <span className="hero__band-code" aria-hidden="true">
                  {pillar.code}
                </span>
                <div>
                  <p className="hero__band-label">{pillar.label}</p>
                  <p className="hero__band-detail">{pillar.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Hero;
