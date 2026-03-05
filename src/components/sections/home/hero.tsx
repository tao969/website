import { ScrambleText } from '@/components/ui/scramble';
import { RevealSection } from '@/components/ui/reveal';
import { HOME_CONTENT } from '@/config';
import styles from './hero.module.scss';

export function HeroSection() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className="container">
        <div className={styles.heroInner}>

          <RevealSection className={styles.meta}>
            <span className={styles.kicker}>{HOME_CONTENT.hero.tagline}</span>
            <p className={styles.context}>{HOME_CONTENT.hero.context}</p>
          </RevealSection>

          <ScrambleText
            as="h1"
            className={styles.name}
            triggerOnMount
            interactive={false}
          >
            {HOME_CONTENT.hero.name}
          </ScrambleText>

        </div>
      </div>
    </section>
  );
}

