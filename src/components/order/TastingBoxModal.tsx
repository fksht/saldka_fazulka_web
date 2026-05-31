import { Calendar, ShoppingBasket, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CAKE_CREAMS, CREAM_GROUP_LABELS, PRODUCTS } from '../../data/sladkaFazulkaCatalog';
import { CreamGroup, TastingBox, TastingDetails } from '../../types';
import { formatPrice } from '../../utils/format';
import { Button } from '../ui/Button';

type TastingBoxModalProps = {
  tasting: TastingBox | null;
  onClose: () => void;
  onConfirm: (tasting: TastingBox, details: TastingDetails) => void;
};

const MAX_CREAM_SELECTIONS = 3;
const MAX_DESSERT_SELECTIONS = 12;

const todayInputValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const TastingBoxModal = ({ tasting, onClose, onConfirm }: TastingBoxModalProps) => {
  const isBento = tasting?.id === 'tasting-torta';
  const isDesserts = tasting?.id === 'tasting-zakusky';

  const [selectedSelections, setSelectedSelections] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  useEffect(() => {
    if (!tasting) return;
    setSelectedSelections([]);
    setNote('');
    setPreferredDate('');
  }, [tasting]);

  useEffect(() => {
    if (!tasting) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tasting, onClose]);

  const creamGroups = useMemo(() => {
    const groups: Record<CreamGroup, typeof CAKE_CREAMS> = {
      svieze: [],
      sladke: [],
      orieskove: [],
      kavove: [],
      rastlinne: [],
    };
    CAKE_CREAMS.forEach((cream) => groups[cream.group].push(cream));
    return groups;
  }, []);

  const dessertGroups = useMemo(() => {
    const groups = new Map<string, { id: string; name: string }[]>();
    PRODUCTS.filter((p) => p.available && (p.minimumOrderQuantity ?? 0) >= 1)
      .filter((p) => p.category !== 'Dezertné torty')
      .forEach((product) => {
        const list = groups.get(product.category) ?? [];
        list.push({ id: product.id, name: product.name });
        groups.set(product.category, list);
      });
    return Array.from(groups.entries());
  }, []);

  if (!tasting) return null;

  const maxSelections = isBento ? MAX_CREAM_SELECTIONS : MAX_DESSERT_SELECTIONS;
  const selectionLabel = isBento ? 'Krémy' : 'Dezerty';

  const toggleSelection = (name: string) => {
    setSelectedSelections((current) => {
      if (current.includes(name)) return current.filter((existing) => existing !== name);
      if (current.length >= maxSelections) return current;
      return [...current, name];
    });
  };

  const handleConfirm = () => {
    onConfirm(tasting, {
      selections: selectedSelections.length > 0 ? selectedSelections : undefined,
      selectionLabel: selectedSelections.length > 0 ? selectionLabel : undefined,
      preferredDate: preferredDate || undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-cocoa-950/70 p-3 sm:p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="watercolor-wash relative flex items-start justify-between gap-3 border-b border-cream-200 px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold-700">Dopytovať ochutnávku</p>
            <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-cocoa-950 sm:text-2xl">
              {tasting.title}
            </h3>
            <p className="mt-1 text-xs text-cocoa-500">
              {formatPrice(tasting.price, tasting.priceType)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-cocoa-500 transition hover:bg-cream-100"
          >
            <span className="sr-only">Zavrieť</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {isBento && (
            <div>
              <p className="text-sm font-semibold text-cocoa-700">Vyberte krémy do bento tortičky</p>
              <p className="mt-1 text-xs text-cocoa-500">
                Max <strong>{MAX_CREAM_SELECTIONS}</strong> druhy krému na jednu tortičku (vybrané {selectedSelections.length}/{MAX_CREAM_SELECTIONS}).
              </p>
              <div className="mt-4 space-y-4">
                {(Object.keys(creamGroups) as CreamGroup[]).map((group) => {
                  const creams = creamGroups[group];
                  if (creams.length === 0) return null;
                  const label = CREAM_GROUP_LABELS[group];
                  return (
                    <div key={group}>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">
                        {label?.icon} {label?.title}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {creams.map((cream) => {
                          const isSelected = selectedSelections.includes(cream.name);
                          const disabled = !isSelected && selectedSelections.length >= MAX_CREAM_SELECTIONS;
                          return (
                            <button
                              key={cream.id}
                              type="button"
                              onClick={() => toggleSelection(cream.name)}
                              disabled={disabled}
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                isSelected
                                  ? 'border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-100'
                                  : disabled
                                    ? 'border-cream-200 bg-cream-50 text-cocoa-400'
                                    : 'border-cream-300 bg-white text-cocoa-700 hover:border-rose-300 hover:bg-rose-50'
                              }`}
                            >
                              {cream.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isDesserts && (
            <div>
              <p className="text-sm font-semibold text-cocoa-700">Označte dezerty, ktoré chcete ochutnať</p>
              <p className="mt-1 text-xs text-cocoa-500">
                Voliteľné — vyberte max <strong>{MAX_DESSERT_SELECTIONS}</strong> ks (označené {selectedSelections.length}/{MAX_DESSERT_SELECTIONS}). Pri ochutnávke spolu doladím konečný výber a cenu.
              </p>
              <div className="mt-4 space-y-4">
                {dessertGroups.map(([category, list]) => (
                  <div key={category}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">{category}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {list.map((dessert) => {
                        const isSelected = selectedSelections.includes(dessert.name);
                        const disabled = !isSelected && selectedSelections.length >= MAX_DESSERT_SELECTIONS;
                        return (
                          <button
                            key={dessert.id}
                            type="button"
                            onClick={() => toggleSelection(dessert.name)}
                            disabled={disabled}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                              isSelected
                                ? 'border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-100'
                                : disabled
                                  ? 'border-cream-200 bg-cream-50 text-cocoa-400'
                                  : 'border-cream-300 bg-white text-cocoa-700 hover:border-rose-300 hover:bg-rose-50'
                            }`}
                          >
                            {dessert.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-cocoa-700">Preferovaný termín ochutnávky</span>
              <span className="relative block">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
                <input
                  type="date"
                  min={todayInputValue()}
                  value={preferredDate}
                  onChange={(event) => setPreferredDate(event.target.value)}
                  className="w-full rounded-lg border border-cream-300 bg-white py-2.5 pl-10 pr-4 text-sm text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                />
              </span>
              <span className="mt-1 block text-xs text-cocoa-500">Voliteľné. Konkrétny termín doladím.</span>
            </label>
            <div />
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Vaša poznámka</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-cream-300 bg-white px-4 py-3 text-sm text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder={isBento ? 'Napríklad: vegan náhradu pribináčika, intolerancia laktózy…' : 'Napríklad: bez orechov, dôraz na čokoládové, ochutnávka v sobotu poobede…'}
            />
          </label>
        </div>

        <div className="flex flex-col gap-2 border-t border-cream-200 bg-cream-50/60 px-5 py-4 sm:flex-row sm:px-7">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Zrušiť
          </Button>
          <Button type="button" onClick={handleConfirm} className="flex-1">
            <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
            Pridať ochutnávku do dopytu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TastingBoxModal;
