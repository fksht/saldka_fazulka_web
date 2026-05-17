import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-cocoa-800 text-white hover:bg-cocoa-900 shadow-sm',
  secondary: 'bg-white text-cocoa-800 border border-cream-300 hover:border-rose-300 hover:bg-rose-50',
  ghost: 'text-cocoa-700 hover:bg-cream-100',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100',
};

const baseClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:pointer-events-none disabled:opacity-60';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export const Button = ({ className, variant = 'primary', children, ...props }: ButtonProps) => (
  <button className={twMerge(baseClass, variantClass[variant], className)} {...props}>
    {children}
  </button>
);

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export const ButtonLink = ({ className, variant = 'primary', children, ...props }: ButtonLinkProps) => (
  <Link className={twMerge(baseClass, variantClass[variant], className)} {...props}>
    {children}
  </Link>
);
