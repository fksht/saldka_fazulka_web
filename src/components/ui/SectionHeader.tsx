import { ReactNode } from 'react';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  children?: ReactNode;
};

const SectionHeader = ({ eyebrow, title, description, align = 'center', children }: SectionHeaderProps) => (
  <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
    {eyebrow && (
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-rose-600">{eyebrow}</p>
    )}
    <h2 className="font-serif text-3xl font-bold leading-tight text-cocoa-900 sm:text-4xl">{title}</h2>
    {description && <p className="mt-4 text-base leading-7 text-cocoa-600 sm:text-lg">{description}</p>}
    {children && <div className="mt-6">{children}</div>}
  </div>
);

export default SectionHeader;
