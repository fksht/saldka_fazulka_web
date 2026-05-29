import { ALLERGENS } from '../../data/sladkaFazulkaCatalog';

type AllergenBadgesProps = {
  allergens: number[];
  size?: 'sm' | 'md';
  emptyLabel?: string;
};

const ALLERGEN_LOOKUP = new Map(ALLERGENS.map((a) => [a.id, a.name] as const));

const AllergenBadges = ({ allergens, size = 'sm', emptyLabel = 'Alergény budú upresnené' }: AllergenBadgesProps) => {
  if (!allergens.length) {
    return <p className="text-xs italic text-cocoa-500">{emptyLabel}</p>;
  }

  const padding = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';

  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Alergény">
      {allergens.map((id) => {
        const name = ALLERGEN_LOOKUP.get(id) ?? `Alergén ${id}`;
        return (
          <span
            key={id}
            className={`inline-flex items-center gap-1 rounded-full border border-gold-200 bg-cream-50 font-bold uppercase tracking-[0.12em] text-cocoa-700 ${padding}`}
            title={name}
          >
            <span className="text-gold-600">{id}</span>
            <span className="hidden text-cocoa-500 normal-case tracking-normal sm:inline">{name}</span>
          </span>
        );
      })}
    </div>
  );
};

export default AllergenBadges;
