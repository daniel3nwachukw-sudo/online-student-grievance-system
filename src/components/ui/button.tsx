import { ComponentPropsWithoutRef, ElementType } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
}

export function Button({ className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800',
        className,
      )}
      {...props}
    />
  );
}
