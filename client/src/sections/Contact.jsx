import { contact, sections } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { ContactForm } from '../components/contact/ContactForm.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { PlaceholderBadge } from '../components/ui/PlaceholderBadge.jsx';
import './Contact.css';

/**
 * 06 / Contact — Signature #FDBF2D gold primary email callout + Swiss form.
 */
export function Contact() {
  const { eyebrow, title, intro } = sections.contact;

  return (
    <section className="section section--page" id="contact" aria-labelledby="contact-heading">
      <div className="container">
        <SectionHeading
          index="06"
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          id="contact-heading"
        />

        <div className="contact__grid">
          <div className="contact__details" data-reveal="">
            <p className="contact__intro">{contact.intro}</p>

            {/* Primary Email Callout in signature Solar Gold (#FDBF2D + #000000 ink, 12.67:1 AAA) */}
            <a className="contact__email contact__email--featured" href={`mailto:${contact.email}`}>
              <span className="contact__email-icon" aria-hidden="true">
                <Icon name="mail" size={18} />
              </span>
              <span className="contact__email-body">
                <span className="contact__email-label">Direct Email</span>
                <span className="contact__email-value">{contact.email}</span>
              </span>
              <Icon name="arrowUpRight" size={18} />
            </a>

            {contact.phone && (
              <a className="contact__email" href={contact.phone.href}>
                <span className="contact__email-icon" aria-hidden="true">
                  <Icon name="phone" size={18} />
                </span>
                <span className="contact__email-body">
                  <span className="contact__email-label">Phone</span>
                  <span className="contact__email-value">{contact.phone.display}</span>
                </span>
                <Icon name="arrowUpRight" size={16} />
              </a>
            )}

            <ul className="contact__links">
              {contact.links.map((link) => {
                const isPlaceholder = !link.href || link.href === '#';

                return (
                  <li key={link.id} className="contact__link-item">
                    {isPlaceholder ? (
                      <span className="contact__link contact__link--pending">
                        <span className="contact__link-icon" aria-hidden="true">
                          <Icon name={link.icon} size={18} />
                        </span>
                        <span className="contact__link-text">
                          <span className="contact__link-label">
                            {link.label}
                            <PlaceholderBadge>Add link</PlaceholderBadge>
                          </span>
                          <span className="contact__link-value">{link.value}</span>
                        </span>
                      </span>
                    ) : (
                      <a
                        className="contact__link"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="contact__link-icon" aria-hidden="true">
                          <Icon name={link.icon} size={18} />
                        </span>
                        <span className="contact__link-text">
                          <span className="contact__link-label">{link.label}</span>
                          <span className="contact__link-value">{link.value}</span>
                        </span>
                        <Icon name="arrowUpRight" size={16} />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="contact__form-wrap" data-reveal="">
            <ContactForm />
            {contact.formNote && (
              <p className="contact__note">
                {contact.formNote}{' '}
                <a href={`mailto:${contact.email}`}>{contact.email}</a>.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
