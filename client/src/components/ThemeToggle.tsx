'use client';

import { IconMoon, IconSun } from '@/components/icons';
import { useTheme } from '@/lib/theme';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'Frost' : 'Control Room'}`}
      className={`relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-line text-muted transition-colors hover:text-ink ${className ?? ''}`}
    >
      <span
        className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
        style={{ transform: theme === 'dark' ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        <span className="grid h-full w-full place-items-center">
          <IconMoon className="h-4 w-4" />
        </span>
      </span>
      <span
        className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
        style={{ transform: theme === 'dark' ? 'translateY(100%)' : 'translateY(0)' }}
      >
        <span className="grid h-full w-full place-items-center">
          <IconSun className="h-4 w-4" />
        </span>
      </span>
    </button>
  );
}
