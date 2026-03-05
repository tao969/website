'use client';

/**
 * useTheme — Color-scheme preference hook
 *
 * Persists to localStorage and syncs with prefers-color-scheme.
 * Safe for SSR — resolves on mount.
 */

import { useCallback, useEffect, useState } from 'react';
import { THEME_DATA_ATTR, THEME_STORAGE_KEY } from '@/lib/constants';

export type Theme = 'light' | 'dark' | 'system';

export interface UseThemeReturn {
  theme:         Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme:      (theme: Theme) => void;
  toggleTheme:   () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(resolved: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute(THEME_DATA_ATTR, resolved);
}

export function useTheme(): UseThemeReturn {
  const [theme,         setThemeState]  = useState<Theme>('light');
  const [resolvedTheme, setResolved]    = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored  = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initial = stored ?? 'system';
    const resolved = resolveTheme(initial);
    setThemeState(initial);
    setResolved(resolved);
    applyTheme(resolved);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = getSystemTheme();
        setResolved(resolved);
        applyTheme(resolved);
      }
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    const resolved = resolveTheme(next);
    setThemeState(next);
    setResolved(resolved);
    applyTheme(resolved);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  return { theme, resolvedTheme, setTheme, toggleTheme };
}
