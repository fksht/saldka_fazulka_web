import { assetPath } from '../../data/sladkaFazulkaCatalog';
import { Product } from '../../types';

type DietaryBadgeField = 'vegan' | 'withoutMilk' | 'lactoseFree' | 'glutenFree';

type DietaryBadgeDef = {
  field: DietaryBadgeField;
  src: string;
  alt: string;
  title: string;
};

/** Order here controls the order badges stack on the product. */
export const DIETARY_BADGES: DietaryBadgeDef[] = [
  { field: 'vegan', src: 'images/sladka-fazulka/badges/vegan.png', alt: 'Vegánsky produkt', title: 'Vegánsky' },
  { field: 'withoutMilk', src: 'images/sladka-fazulka/badges/without-milk.png', alt: 'Bez mlieka', title: 'Bez mlieka' },
  { field: 'lactoseFree', src: 'images/sladka-fazulka/badges/lactose-free.png', alt: 'Bez laktózy', title: 'Bez laktózy' },
  { field: 'glutenFree', src: 'images/sladka-fazulka/badges/gluten-free.png', alt: 'Bezlepkové', title: 'Bezlepkové' },
];

type DietaryBadgesProps = {
  product: Pick<Product, DietaryBadgeField>;
  size?: number;
  className?: string;
};

const DietaryBadges = ({ product, size = 52, className = '' }: DietaryBadgesProps) => {
  const active = DIETARY_BADGES.filter((badge) => product[badge.field]);
  if (active.length === 0) return null;

  return (
    <div className={`flex flex-col items-end gap-1.5 ${className}`}>
      {active.map((badge) => (
        <div key={badge.field} className="group/badge pointer-events-auto relative">
          <img
            src={assetPath(badge.src)}
            alt={badge.alt}
            width={size}
            height={size}
            className="drop-shadow-sm"
            style={{ width: size, height: size, objectFit: 'contain' }}
          />
          {/* Instant hover label — placed to the left so it stays on-card (badges sit at the right edge). */}
          <span
            role="tooltip"
            className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-cocoa-900/95 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity duration-150 group-hover/badge:opacity-100"
          >
            {badge.title}
          </span>
        </div>
      ))}
    </div>
  );
};

export default DietaryBadges;
