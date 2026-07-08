import type { CSSProperties } from 'react';

export type AccentTone = 'cyan' | 'lime' | 'purple' | 'amber' | 'white';

type AccentTitleProps = {
  text: string;
  accent?: AccentTone;
  className?: string;
  id?: string;
};

export function AccentTitle({
  text,
  accent = 'cyan',
  className,
  id,
}: AccentTitleProps) {
  const [initial = '', ...rest] = Array.from(text);

  return (
    <h2
      className={className}
      id={id}
      style={{ '--section-accent': `var(--${accent})` } as CSSProperties}
    >
      <span className="accent-title__initial">{initial}</span>
      {rest.join('')}
    </h2>
  );
}
