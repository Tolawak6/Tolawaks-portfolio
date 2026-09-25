import { contact, sections } from '../content/portfolio.js';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { ContactForm } from '../components/contact/ContactForm.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { PlaceholderBadge } from '../components/ui/PlaceholderBadge.jsx';
import './Contact.css';

/**
 * Contact: direct details on one side, and a form that posts to /api/contact.
 *
 * Links whose href is still '#' are shown as "not added yet" rather than as
 * anchors that do nothing.
 */
export function Contact() {
  const { eyebrow, title, intro } = sections.contact;

  return (
    <section className="section section--page" id="contact" aria-labelledby="contact-heading">
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} id="contact-heading" />

        <div className="contact__grid">
          <div className="contact__details" data-reveal="">
            <p className="contact__intro">{contact.intro}</p>

            <a className="contact__email" href={`mailto:${contact.email}`}>
              <span className="contact__email-icon" aria-hidden="true">
                <Icon name="mail" size={18} />
              </span>
              <span className="contact__email-body">
                <span className="contact__email-label">Email</span>
                <span className="contact__email-value">{contact.email}</span>
              </span>
              <Icon name="arrowUpRight" size={16} />
            </a>

            {/* Optional: delete `contact.phone` in portfolio.js to remove this. */}
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
                      // Not an anchor: there is nowhere to go yet.
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
