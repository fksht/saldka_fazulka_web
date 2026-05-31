import { Gift, ShoppingBasket } from 'lucide-react';
import { WeddingBox } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Button } from '../ui/Button';

type WeddingBoxCardProps = {
  box: WeddingBox;
  onRequest: (box: WeddingBox) => void;
};

const WeddingBoxCard = ({ box, onRequest }: WeddingBoxCardProps) => (
  <article className="relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-cream-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-200 hover:shadow-lg">
    <span
      className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-[3rem] bg-gradient-to-br from-gold-100 to-rose-50"
      aria-hidden="true"
    />
    <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
      <Gift className="h-6 w-6" aria-hidden="true" />
    </div>
    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-700">Výslužka Deluxe</p>
    <h3 className="mt-2 font-display text-3xl font-semibold leading-tight text-cocoa-950">{box.name}</h3>
    <p className="mt-2 text-sm text-cocoa-600">{box.suitableFor}</p>

    <div className="mt-6 rounded-2xl bg-cream-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">Obsah krabičky</p>
      <p className="mt-1 font-display text-2xl font-semibold text-cocoa-900">Mix {box.pieces} ks</p>
    </div>

    <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-cream-200 pt-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gold-700">Cena</p>
        <p className="font-display text-3xl font-semibold leading-none text-cocoa-950">
          {formatCurrency(box.price)}
          <span className="ml-1 text-base font-normal text-cocoa-500">/ krabička</span>
        </p>
      </div>
      <Button type="button" onClick={() => onRequest(box)}>
        <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
        Dopytovať
      </Button>
    </div>
  </article>
);

export default WeddingBoxCard;
