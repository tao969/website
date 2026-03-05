import { HeroShell } from '@/components/ui/network-orb';
import { RevealSection } from '@/components/ui/reveal';
import { ScrambleText } from '@/components/ui/scramble';
import styles from './built-with.module.scss';

export function BuiltWith() {
  return (
    <section className={styles.root} aria-label="Built with">
      <div className={styles.canvas}>
        <RevealSection className={styles.header}>
          <span className={styles.label}>00</span>
          <ScrambleText as="span" className={styles.title} triggerOnView>
            built with
          </ScrambleText>
          <p className={styles.description}>Interactive stack map and tooling graph.</p>
        </RevealSection>
        <HeroShell />
      </div>
    </section>
  );
}
