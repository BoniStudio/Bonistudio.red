import type { AnchorHTMLAttributes, ReactNode } from 'react';

type GlassButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
};

export function GlassButton({
  children,
  className = '',
  variant = 'secondary',
  ...props
}: GlassButtonProps) {
  const classes = ['glass-button', `glass-button--${variant}`, className].filter(Boolean).join(' ');

  return (
    <a className={classes} {...props}>
      {children}
    </a>
  );
}
