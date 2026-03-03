import { cn } from '@/lib/utils/cn';
import React from 'react';
import styles from './section-grid.module.scss';

type SectionGridProps = {
  children: React.ReactNode;
  className?: string;
  cols?: '2' | '3' | '4';
};

export const SectionGrid = ({
  children,
  className,
  cols,
}: SectionGridProps) => {
  const gridClass = cols ? styles[`gridCols${cols}`] : '';

  return (
    <div className={cn(styles.gridContainer, gridClass, className)}>
      <div className={cn(styles.gridMarker, styles.topLeft)} />
      <div className={cn(styles.gridMarker, styles.topRight)} />
      <div className={cn(styles.gridMarker, styles.bottomLeft)} />
      <div className={cn(styles.gridMarker, styles.bottomRight)} />
      {children}
    </div>
  );
};

type GridItemProps = {
  children: React.ReactNode;
  className?: string;
};

export const GridItem = ({ children, className }: GridItemProps) => {
  return <div className={cn(styles.gridItem, className)}>{children}</div>;
};

