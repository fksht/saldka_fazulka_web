import { ReactNode } from 'react';
import GoldDivider from './GoldDivider';

type SectionHeaderProps = {
  eyebrow?: string;
  scriptEyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  withDivider?: boolean;
  children?: ReactNode;
};

const SectionHeader = ({
  eyebrow,
  scriptEyebrow,
  title,
  description,
  align = 'center',
  withDivider = false,
  children,
}: SectionHeaderProps) => (
  <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
    {eyebrow && (
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">{eyebrow}</p>
    )}
    <h2 className="font-display text-3xl font-semibold leading-[1.1] text-cocoa-950 sm:text-4xl lg:text-[2.75rem]">
      {title}
    </h2>
    {scriptEyebrow && (
      <p className="mt-3 font-script text-2xl text-gold-500 sm:text-3xl">{scriptEyebrow}</p>
    )}
    {withDivider && (
      <div className="mt-5">
        <GoldDivider align={align} />
      </div>
    )}
    {description && (
      <p className="mt-5 text-base leading-7 text-cocoa-600 sm:text-[17px] sm:leading-8">{description}</p>
    )}
    {children && <div className="mt-7">{children}</div>}
  </div>
);

export default SectionHeader;
