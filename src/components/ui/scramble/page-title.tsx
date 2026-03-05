'use client';

import { ScrambleText } from './scramble';

interface PageTitleProps {
  className?: string;
  children: string;
}

export function PageTitle({ className, children }: PageTitleProps) {
  return (
    <ScrambleText as="h1" className={className} triggerOnMount interactive={false}>
      {children}
    </ScrambleText>
  );
}
