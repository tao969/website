/**
 * ContentSection — Feature Component
 *
 * Each text element has its own triggerOnView observer.
 * Scramble fires on scroll-down only (handled in ScrambleText).
 * RevealSection handles the fade-in with stagger delays.
 */

import { RevealSection } from '@/components/ui/reveal';
import { ScrambleText } from '@/components/ui/scramble';
import Link from 'next/link';
import styles from './content-section.module.scss';

interface ContentSectionLink {
  text: string;
  href: string;
}

interface ContentSectionProps {
  id?: string;
  index: string;
  title: string;
  paragraphs: readonly string[];
  link?: ContentSectionLink;
}

export function ContentSection({
  id,
  index,
  title,
  paragraphs,
  link,
}: ContentSectionProps) {
  return (
    <section id={id} className={styles.section}>
      <div className="container">
        <div className={styles.sectionInner}>

          <RevealSection className={styles.sectionLabel} delay={0}>
            <span className={styles.sectionIndex}>{index}</span>
            <ScrambleText as="span" className={styles.sectionTitle} triggerOnView>
              {title}
            </ScrambleText>
          </RevealSection>

          <div className={styles.sectionBody}>
            {paragraphs.map((paragraph, i) => (
              <RevealSection key={i} delay={120 + i * 120}>
                <ScrambleText
                  as="p"
                  className={styles.bodyText}
                  triggerOnView
                  viewDelay={120 + i * 120}
                  interactive={false}
                >
                  {paragraph}
                </ScrambleText>
              </RevealSection>
            ))}

            {link && (
              <RevealSection delay={120 + paragraphs.length * 120}>
                <Link href={link.href} className={styles.sectionLink}>
                  <ScrambleText>{link.text}</ScrambleText>
                  <span className={styles.linkArrow} aria-hidden>
                    &#8599;
                  </span>
                </Link>
              </RevealSection>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

