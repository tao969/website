'use client';
import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string; // Untuk div luar
  innerClassName?: string; // Untuk div dalam
}

/**
 * Komponen panel yang dapat digunakan kembali yang menyediakan gaya kontainer
 * standar aplikasi dengan border dan latar belakang blur. Sentralisasi gaya ini
 * memastikan konsistensi visual dan menyederhanakan komposisi komponen.
 */
export const Panel: React.FC<PanelProps> = ({
  children,
  className = '',
  innerClassName = '',
}) => {
  return (
    <div
      className={`p-px border backdrop-blur-sm transition-colors duration-200 bg-neutral-200/50 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900/50 ${className}`}
    >
      <div className={`bg-white dark:bg-neutral-900 h-full w-full ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
};
