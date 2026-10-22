import { useEffect, useMemo, useState } from 'react';
import './ui.css';

/**
 * Accessible typewriter (typing + deleting) loop.
 *
 * - Announces the primary phrase cleanly to screen readers via `aria-label`
 *   while animating an `aria-hidden` visual span.
 * - Immediately renders the full static phrase when `prefers-reduced-motion`
 *   is enabled.
 */
export function Typewriter({
  phrases = ['Full-Stack Web Developer'],
  typeSpeed = 72,
  deleteSpeed = 38,
  holdDelay = 2100,
  nextDelay = 320,
}) {
  const list = useMemo(
    () => (Array.isArray(phrases) && phrases.length > 0 ? phrases : ['Full-Stack Web Developer']),
    [phrases],
  );

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState(list[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event) => setReducedMotion(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Start the first hold pause from the full primary phrase so visitors see
  // "Full-Stack Web Developer" immediately on page load before it deletes & types.
  useEffect(() => {
    if (reducedMotion) {
      setText(list[0]);
      return undefined;
    }

    const currentPhrase = list[phraseIndex % list.length];
    let delay = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && text === currentPhrase) {
      delay = holdDelay;
    } else if (isDeleting && text === '') {
      delay = nextDelay;
    }

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        if (text.length < currentPhrase.length) {
          setText(currentPhrase.slice(0, text.length + 1));
        } else {
          setIsDeleting(true);
        }
      } else if (text.length > 0) {
        setText(currentPhrase.slice(0, text.length - 1));
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % list.length);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [text, isDeleting, phraseIndex, list, reducedMotion, typeSpeed, deleteSpeed, holdDelay, nextDelay]);

  return (
    <span className="typewriter" aria-label={list[0]}>
      <span className="typewriter__text" aria-hidden="true">
        {text}
      </span>
      <span className="typewriter__cursor" aria-hidden="true">
        |
      </span>
    </span>
  );
}

export default Typewriter;
