import { ScrambleText } from '@/components/ui/scrambletext';
import { AnimatedBrandIcon } from '@/components/ui/badge';
import { HOME_CONTENT } from '@/constants/home';
import Link from 'next/link';
import styles from './home.module.scss';

export default function HomePage() {
  return (
    <div className="container">
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroPanel}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroGreeting}>{HOME_CONTENT.hero.greeting}</span>
              <div className={styles.heroImage}>
                <AnimatedBrandIcon />
              </div>
              <span className={styles.heroName}>{HOME_CONTENT.hero.name}</span>
            </h1>
            <p className={styles.heroSubtitle}>{HOME_CONTENT.hero.subtitle}</p>
          </div>
        </div>
      </section>

      <section id="about" className={styles.section}>
        <div className={styles.sectionContent}>
          <h3 className={styles.sectionTitle}>{HOME_CONTENT.about.title}</h3>
          <div className={styles.sectionPanel}>
            <div className={styles.aboutContent}>
              {HOME_CONTENT.about.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="work" className={styles.section}>
        <div className={styles.sectionContent}>
          <h3 className={styles.sectionTitle}>{HOME_CONTENT.work.title}</h3>
          <div className={styles.sectionPanel}>
            <div className={styles.workContent}>
              <p>{HOME_CONTENT.work.content}</p>
              <Link href={HOME_CONTENT.work.linkHref} className={styles.seeMoreLink}>
                <ScrambleText>{HOME_CONTENT.work.linkText}</ScrambleText>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="articles" className={styles.section}>
        <div className={styles.sectionContent}>
          <h3 className={styles.sectionTitle}>{HOME_CONTENT.articles.title}</h3>
          <div className={styles.sectionPanel}>
            <div className={styles.articlesContent}>
              <p>{HOME_CONTENT.articles.content}</p>
              <Link href={HOME_CONTENT.articles.linkHref} className={styles.seeMoreLink}>
                <ScrambleText>{HOME_CONTENT.articles.linkText}</ScrambleText>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className={styles.section}>
        <div className={styles.sectionContent}>
          <h3 className={styles.sectionTitle}>{HOME_CONTENT.contact.title}</h3>
          <div className={styles.sectionPanel}>
            <div className={styles.contactContent}>
              <p>{HOME_CONTENT.contact.content}</p>
              <Link href={HOME_CONTENT.contact.linkHref} className={styles.seeMoreLink}>
                <ScrambleText>{HOME_CONTENT.contact.linkText}</ScrambleText>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
