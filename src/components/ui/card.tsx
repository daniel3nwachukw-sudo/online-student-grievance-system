import { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';

export function Card({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={clsx('rounded-3xl border border-slate-200 bg-white p-6 shadow-sm', className)} {...props} />
  );
}
