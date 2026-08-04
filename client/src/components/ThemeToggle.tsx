'use client';

import { IconMoon, IconSun } from '@/components/icons';
import { useTheme } from '@/lib/theme';
import { cx } from '@/lib/format';

/**
 * Theme switch.
 *
 * The button shows the theme you will GET by clicking, not the one you are
 * already in. A bare sun/moon icon makes people stop and work out which way
 * round it is, so the word is spelled out next to it wherever there is room.
 */
export function ThemeToggle({
  className,
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { theme, toggle } = useTheme();
  const goingToLight = theme === 'dark';
  const label = goingToLight ? 'Light' : 'Dark';

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${label.toLowerCase()} mode`}
      title={`Switch to ${label.toLowerCase()} mode`}
      className={cx(
        'inline-flex h-9 items-center gap-2 rounded-lg border border-line px-2.5 text-[13px] text-muted transition-colors hover:bg-raised hover:text-ink',
        className,
      )}
    >
      {goingToLight ? (
        <IconSun className="h-4 w-4 shrink-0" />
      ) : (
        <IconMoon className="h-4 w-4 shrink-0" />
      )}
      {showLabel && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}
