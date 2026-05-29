import { Heart } from 'lucide-react';

type GoldDividerProps = {
  label?: string;
  align?: 'left' | 'center';
  icon?: 'heart' | 'dot' | 'none';
  className?: string;
};

const GoldDivider = ({ label, align = 'center', icon = 'heart', className = '' }: GoldDividerProps) => {
  const Icon =
    icon === 'heart' ? (
      <Heart className="h-3 w-3 fill-gold-400 text-gold-400" aria-hidden="true" />
    ) : icon === 'dot' ? (
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
    ) : null;

  const justify = align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <div className={`flex items-center gap-3 text-gold-500 ${justify} ${className}`} aria-hidden={!label}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent via-gold-300 to-gold-400" />
      {label ? (
        <span className="font-script text-lg leading-none text-gold-500 sm:text-xl">{label}</span>
      ) : (
        Icon
      )}
      <span className="h-px w-12 bg-gradient-to-l from-transparent via-gold-300 to-gold-400" />
    </div>
  );
};

export default GoldDivider;
