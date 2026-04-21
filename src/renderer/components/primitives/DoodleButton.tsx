import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'mint' | 'blue' | 'peach';

interface DoodleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function DoodleButton({ variant = 'default', className, children, ...rest }: DoodleButtonProps) {
  const cls = ['btn-doodle', variant !== 'default' ? variant : '', className ?? ''].filter(Boolean).join(' ');
  return <button className={cls} {...rest}>{children}</button>;
}
