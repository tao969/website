import { Suspense } from 'react';
import { BuiltWith } from '@/components/sections/home/built-with';
import { HeroSection } from '@/components/sections/home/hero';
import { ContentSection } from '@/components/ui/content-section';
import { HOME_CONTENT } from '@/config';
import { RevealSection } from '@/components/ui/reveal';
import styles from './page.module.scss';

const HOME_SECTIONS = [
  {
    id: 'about',
    index: '01',
    title: HOME_CONTENT.about.title,
    paragraphs: HOME_CONTENT.about.content,
  },
  {
    id: 'work',
    index: '02',
    title: HOME_CONTENT.work.title,
    paragraphs: HOME_CONTENT.work.content,
    link: { text: HOME_CONTENT.work.linkText, href: HOME_CONTENT.work.linkHref },
  },
  {
    id: 'articles',
    index: '03',
    title: HOME_CONTENT.articles.title,
    paragraphs: HOME_CONTENT.articles.content,
    link: { text: HOME_CONTENT.articles.linkText, href: HOME_CONTENT.articles.linkHref },
  },
] as const;

export default function HomePage() {
  return (
    <div className={styles.page}>

      <HeroSection />

      <Suspense fallback={<div className={styles.sectionFallback} aria-hidden />}>
        <RevealSection>
          <BuiltWith />
        </RevealSection>
      </Suspense>

      {HOME_SECTIONS.map((section) => (
        <ContentSection
          key={section.id}
          id={section.id}
          index={section.index}
          title={section.title}
          paragraphs={section.paragraphs}
          link={section.link}
        />
      ))}

    </div>
  );
}
