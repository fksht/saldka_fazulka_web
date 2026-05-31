import { Users, Cookie, ShoppingBasket, Sparkles } from 'lucide-react';
import { CandyBarPackage } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Button } from '../ui/Button';

type PackageCardProps = {
  pkg: CandyBarPackage;
  onRequest: (pkg: CandyBarPackage) => void;
  highlight?: boolean;
};

const PackageCard = ({ pkg, onRequest, highlight = false }: PackageCardProps) => (
  <article
    className={`relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-7 ${
      highlight ? 'border-rose-300 ring-2 ring-rose-100' : 'border-cream-200 hover:border-rose-200'
    }`}
  >
    {highlight && (
      <span className="absolute -top-px right-6 inline-flex items-center gap-1 rounded-b-xl bg-rose-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
        <Sparkles className="h-3 w-3" aria-hidden="true" />
        Odporúčam
      </span>
    )}

    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-700">Candy bar balíček</p>
      <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-cocoa-950">{pkg.name}</h3>
    </div>

    <div className="mt-4 flex flex-wrap gap-2 text-sm">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1 font-semibold text-cocoa-700">
        <Users className="h-3.5 w-3.5 text-cocoa-500" aria-hidden="true" /> {pkg.guestCount}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1 font-semibold text-cocoa-700">
        <Cookie className="h-3.5 w-3.5 text-cocoa-500" aria-hidden="true" /> {pkg.totalPieces} ks
      </span>
      <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700">
        {pkg.dessertTypeCount} druhov
      </span>
    </div>

    <ul className="mt-5 flex-1 space-y-2 border-t border-dashed border-cream-200 pt-4 text-sm text-cocoa-700">
      {pkg.composition.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-3">
          <span>{item.label}</span>
          <span className="text-cocoa-500">{item.pieces}</span>
        </li>
      ))}
    </ul>

    <div className="mt-6 flex items-end justify-between gap-3 border-t border-cream-200 pt-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gold-700">Cena balíčka</p>
        <p className="font-display text-3xl font-semibold leading-none text-cocoa-950">{formatCurrency(pkg.price)}</p>
      </div>
      <Button type="button" onClick={() => onRequest(pkg)}>
        <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
        Dopytovať
      </Button>
    </div>
  </article>
);

export default PackageCard;
