import { useState } from 'react';
import { contact, sections } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { ContactForm } from '../components/contact/ContactForm.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import './Contact.css';

export function Contact() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <section className="section section--alt" id="contact" aria-labelledby="contact-heading">
      <div className="container">
        <SectionHeading
          eyebrow={sections.contact.eyebrow}
          title={sections.contact.title}
          id="contact-heading"
        />

        {/* 3-column social & contact grid modeled directly on image-4.png */}
        <ul className="contact-cards" data-reveal-group="">
          {contact.cards.map((card) => {
            const inner = (
              <>
                <span className="contact-card__icon" aria-hidden="true">
                  <Icon name={card.icon} size={20} />
                </span>
                <span className="contact-card__copy">
                  <span className="contact-card__label">{card.label}</span>
                  <span className="contact-card__value">{card.value}</span>
                </span>
                {card.href && (
                  <span className="contact-card__arrow" aria-hidden="true">
                    <Icon name={card.external ? 'arrowUpRight' : 'arrowRight'} size={15} />
                  </span>
                )}
              </>
            );

            return (
              <li key={card.id} data-reveal="">
                {card.href ? (
                  <a
                    href={card.href}
                    target={card.external ? '_blank' : undefined}
                    rel={card.external ? 'noopener noreferrer' : undefined}
                    className="arch-card contact-card contact-card--link"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="arch-card contact-card">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="contact-footer" data-reveal="">
          <p className="contact-footer__note">{contact.intro}</p>

          <Button
            type="button"
            variant={formOpen ? 'secondary' : 'primary'}
            onClick={() => setFormOpen((open) => !open)}
            aria-expanded={formOpen}
            aria-controls="direct-contact-panel"
            icon={<Icon name={formOpen ? 'close' : 'send'} size={16} />}
            iconPosition="start"
          >
            {formOpen ? 'Close Message Form' : 'Send a Direct Message'}
          </Button>
        </div>

        {formOpen && (
          <div id="direct-contact-panel" className="contact-drawer">
            <ContactForm />
          </div>
        )}
      </div>
    </section>
  );
}

export default Contact;
