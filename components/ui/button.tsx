import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          'bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900',
        variant === 'secondary' &&
          'border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800',
        variant === 'ghost' && 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        className,
      )}
      {...props}
    />
  );
}
