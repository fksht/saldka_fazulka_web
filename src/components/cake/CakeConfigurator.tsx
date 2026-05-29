import { ChangeEvent, useMemo, useState } from 'react';
import { Check, Plus, ShoppingBasket, X } from 'lucide-react';
import {
  CAKE_BASES,
  CAKE_CREAMS,
  CAKE_NOTES,
  CAKE_SIZES,
  CREAM_GROUP_LABELS,
} from '../../data/sladkaFazulkaCatalog';
import { CakeConfiguration, CreamGroup } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Button } from '../ui/Button';

type CakeConfiguratorProps = {
  onAdd: (config: CakeConfiguration) => void;
};

const stepBadge = (n: number, label: string) => (
  <header className="mb-5 flex items-center gap-3">
    <span className="inline-flex h-9 items-center gap-2 rounded-full bg-cocoa-800 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-cream-50">
      Krok {n}
    </span>
    <h3 className="font-display text-2xl font-semibold text-cocoa-950">{label}</h3>
  </header>
);

const normalizeHttpUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};

const CakeConfigurator = ({ onAdd }: CakeConfiguratorProps) => {
  const [baseId, setBaseId] = useState<string>(CAKE_BASES[0].id);
  const [baseVariant, setBaseVariant] = useState<string | undefined>(undefined);
  const [creamIds, setCreamIds] = useState<string[]>([]);
  const [sizeId, setSizeId] = useState<string>(CAKE_SIZES[1].id);
  const [note, setNote] = useState('');
  const [inspirationUrl, setInspirationUrl] = useState('');
  const [inspirationImage, setInspirationImage] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isVegan, setIsVegan] = useState(false);
  const [isLowSugar, setIsLowSugar] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  const handleInspirationImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Nahrajte prosím obrázok.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Obrázok je príliš veľký (max 5 MB).');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setInspirationImage(String(reader.result));
      setImageError(null);
    };
    reader.readAsDataURL(file);
  };

  const selectedBase = useMemo(() => CAKE_BASES.find((b) => b.id === baseId)!, [baseId]);
  const selectedSize = useMemo(() => CAKE_SIZES.find((s) => s.id === sizeId)!, [sizeId]);
  const selectedCreams = useMemo(
    () => CAKE_CREAMS.filter((c) => creamIds.includes(c.id)),
    [creamIds],
  );

  const toggleCream = (id: string) => {
    setCreamIds((current) => {
      if (current.includes(id)) return current.filter((existing) => existing !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  const creamGroups = useMemo(() => {
    const groups: Record<CreamGroup, typeof CAKE_CREAMS> = {
      svieze: [],
      sladke: [],
      orieskove: [],
      kavove: [],
      rastlinne: [],
    };
    CAKE_CREAMS.forEach((cream) => {
      groups[cream.group].push(cream);
    });
    return groups;
  }, []);

  const canSubmit = creamIds.length > 0;

  const handleAdd = () => {
    if (!canSubmit) return;
    const normalizedInspirationUrl = normalizeHttpUrl(inspirationUrl);
    if (normalizedInspirationUrl === null) {
      setUrlError('Zadajte platný odkaz začínajúci na http:// alebo https://, alebo pole nechajte prázdne.');
      return;
    }
    setUrlError(null);

    const extras: string[] = [];
    if (isVegan) extras.push('Vegánska verzia');
    if (isLowSugar) extras.push('Low sugar verzia');

    onAdd({
      baseId: selectedBase.id,
      baseName: selectedBase.name,
      baseVariant,
      creamIds: selectedCreams.map((c) => c.id),
      creamNames: selectedCreams.map((c) => c.name),
      sizeId: selectedSize.id,
      sizeName: `${selectedSize.name} ${selectedSize.diameter !== '—' ? selectedSize.diameter : ''}`.trim(),
      sizePortions: selectedSize.portions,
      sizePriceFrom: selectedSize.priceFrom,
      extras: extras.length > 0 ? extras : undefined,
      note: note.trim() || undefined,
      inspirationUrl: normalizedInspirationUrl,
      inspirationImage,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2400);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-12">
        {/* Step 1: korpus */}
        <section>
          {stepBadge(1, 'Korpus')}
          <div className="grid gap-3 sm:grid-cols-2">
            {CAKE_BASES.map((base) => {
              const active = base.id === baseId;
              return (
                <button
                  key={base.id}
                  type="button"
                  onClick={() => {
                    setBaseId(base.id);
                    setBaseVariant(base.variants?.[0]);
                  }}
                  className={`rounded-2xl border p-5 text-left transition ${
                    active
                      ? 'border-rose-300 bg-rose-50/70 shadow-md ring-1 ring-rose-200'
                      : 'border-cream-200 bg-white hover:border-rose-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-lg font-semibold text-cocoa-950">{base.name}</p>
                    {active && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-cocoa-600">{base.description}</p>
                  {active && base.variants && (
                    <div className="mt-4 space-y-2 border-t border-cream-200 pt-4">
                      {base.variants.map((variant) => (
                        <label key={variant} className="flex items-center gap-2 text-sm text-cocoa-700">
                          <input
                            type="radio"
                            name="baseVariant"
                            value={variant}
                            checked={baseVariant === variant}
                            onChange={(event) => setBaseVariant(event.target.value)}
                            className="h-4 w-4 border-cream-300 text-rose-600 focus:ring-rose-200"
                          />
                          <span>{variant}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800">
            🌱 Na želanie pripravím každý korpus aj vo <strong className="font-semibold">vegánskej</strong> alebo{' '}
            <strong className="font-semibold">low sugar</strong> verzii — stačí ju označiť nižšie v sekcii Špeciálne požiadavky.
          </p>
        </section>

        {/* Step 2: krém */}
        <section>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex h-9 items-center gap-2 rounded-full bg-cocoa-800 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-cream-50">
              Krok 2
            </span>
            <h3 className="font-display text-2xl font-semibold text-cocoa-950">Krém</h3>
            <span className="ml-auto rounded-full bg-cream-100 px-3 py-1 text-xs font-bold text-cocoa-700">
              Vybrané {creamIds.length} / max 3
            </span>
          </div>
          <div className="space-y-7">
            {(Object.keys(creamGroups) as CreamGroup[]).map((group) => {
              const items = creamGroups[group];
              if (!items.length) return null;
              const meta = CREAM_GROUP_LABELS[group];
              return (
                <div key={group}>
                  <p className="mb-2 flex items-center gap-2 text-sm font-bold text-cocoa-800">
                    <span className="text-lg">{meta.icon}</span>
                    {meta.title}
                  </p>
                  <div className="grid gap-2">
                    {items.map((cream) => {
                      const active = creamIds.includes(cream.id);
                      return (
                        <button
                          key={cream.id}
                          type="button"
                          onClick={() => toggleCream(cream.id)}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                            active
                              ? 'border-rose-300 bg-rose-50/70 text-cocoa-900 shadow-sm'
                              : 'border-cream-200 bg-white text-cocoa-700 hover:border-rose-200'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                              active ? 'border-rose-500 bg-rose-500 text-white' : 'border-cream-300 bg-white'
                            }`}
                          >
                            {active ? (
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <Plus className="h-3 w-3 text-cocoa-400" aria-hidden="true" />
                            )}
                          </span>
                          <span className="flex-1">{cream.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 3: veľkosť */}
        <section>
          {stepBadge(3, 'Veľkosť')}
          <div className="grid gap-2">
            {CAKE_SIZES.map((size) => {
              const active = size.id === sizeId;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSizeId(size.id)}
                  className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition sm:flex-row sm:items-center sm:justify-between ${
                    active ? 'border-rose-300 bg-rose-50/70 shadow-sm' : 'border-cream-200 bg-white hover:border-rose-200'
                  }`}
                >
                  <div>
                    <p className="font-display text-lg font-semibold text-cocoa-950">
                      {size.name}
                      {size.diameter !== '—' && <span className="ml-2 text-cocoa-500">{size.diameter}</span>}
                    </p>
                    <p className="text-sm text-cocoa-600">{size.portions}</p>
                  </div>
                  <p className="font-display text-xl font-semibold text-cocoa-900">
                    {size.priceType === 'individual'
                      ? 'Individuálne'
                      : `${size.priceType === 'from' ? 'od ' : ''}${formatCurrency(size.priceFrom)}`}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Diet preferences */}
        <section className="rounded-2xl border border-cream-200 bg-white p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-600">Špeciálne požiadavky</p>
          <p className="mt-2 text-sm text-cocoa-600">Na želanie pripravím vegánsku alebo low sugar verziu.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isVegan
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100'
                  : 'border-cream-300 bg-cream-50 text-cocoa-700 hover:border-emerald-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isVegan}
                onChange={(event) => setIsVegan(event.target.checked)}
                className="h-4 w-4 rounded border-cream-300 text-emerald-600 focus:ring-emerald-200"
              />
              Vegánska verzia
            </label>
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isLowSugar
                  ? 'border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-100'
                  : 'border-cream-300 bg-cream-50 text-cocoa-700 hover:border-rose-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isLowSugar}
                onChange={(event) => setIsLowSugar(event.target.checked)}
                className="h-4 w-4 rounded border-cream-300 text-rose-600 focus:ring-rose-200"
              />
              Low sugar verzia
            </label>
          </div>
        </section>

        {/* Extra notes */}
        <section className="rounded-2xl border border-cream-200 bg-white p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-600">Doplňujúce poznámky</p>
          <label className="mt-3 block">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Téma, dekor, postavičky, text na tortu</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-cream-200 bg-cream-50 px-4 py-3 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder={'Napríklad: jemný kvetinový dekor v bielo-zlatej palete, text „Olívia 1“…'}
            />
          </label>
          <label className="mt-3 block">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Inšpirácia (URL)</span>
            <input
              value={inspirationUrl}
              onChange={(event) => {
                setInspirationUrl(event.target.value);
                setUrlError(null);
              }}
              className="w-full rounded-lg border border-cream-200 bg-cream-50 px-4 py-3 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="https://…"
            />
            {urlError && <span className="mt-1 block text-sm font-semibold text-red-600">{urlError}</span>}
          </label>
          <div className="mt-3">
            <p className="mb-1 text-sm font-semibold text-cocoa-700">Nahrať obrázok inšpirácie</p>
            <p className="mb-2 text-xs text-cocoa-500">Voliteľné. Foto torty z Pinterestu, screenshot a podobne (max 5 MB).</p>
            {inspirationImage ? (
              <div className="flex items-start gap-3 rounded-xl border border-cream-200 bg-cream-50 p-3">
                <img
                  src={inspirationImage}
                  alt="Inšpirácia k torte"
                  className="h-20 w-20 flex-none rounded-lg object-cover ring-1 ring-cream-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setInspirationImage(undefined);
                    setImageError(null);
                  }}
                  className="ml-auto inline-flex items-center gap-1 rounded-full border border-cream-300 px-3 py-1.5 text-xs font-semibold text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Odstrániť
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleInspirationImage}
                className="block w-full text-sm text-cocoa-600 file:mr-4 file:rounded-full file:border-0 file:bg-cocoa-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-cocoa-900"
              />
            )}
            {imageError && <p className="mt-2 text-sm font-semibold text-red-600">{imageError}</p>}
          </div>
        </section>
      </div>

      {/* Summary sidebar */}
      <aside className="sticky top-24 h-fit space-y-5 rounded-3xl border border-cream-200 bg-white p-7 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Vaša torta</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-cocoa-950">Rekapitulácia</h3>
        </div>

        <div className="space-y-4 border-t border-cream-200 pt-4 text-sm text-cocoa-700">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">Korpus</p>
            <p className="font-semibold text-cocoa-900">
              {selectedBase.name}
              {baseVariant ? <span className="font-normal text-cocoa-600"> · {baseVariant}</span> : null}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">Krém</p>
            {selectedCreams.length === 0 ? (
              <p className="italic text-cocoa-500">Vyberte 1 – 3 krémy</p>
            ) : (
              <ul className="space-y-1 text-sm text-cocoa-700">
                {selectedCreams.map((cream) => (
                  <li key={cream.id}>· {cream.name}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">Veľkosť</p>
            <p className="font-semibold text-cocoa-900">
              {selectedSize.name}{' '}
              {selectedSize.diameter !== '—' && <span className="text-cocoa-500">({selectedSize.diameter})</span>}
            </p>
            <p className="text-sm text-cocoa-600">{selectedSize.portions}</p>
          </div>
          {(isVegan || isLowSugar) && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">Špeciálne</p>
              <ul className="space-y-1 text-sm text-cocoa-700">
                {isVegan && <li>· Vegánska verzia</li>}
                {isLowSugar && <li>· Low sugar verzia</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gold-200 bg-gold-100/40 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold-700">Cena</p>
          <p className="mt-1 font-display text-3xl font-semibold text-cocoa-950">
            {selectedSize.priceType === 'individual'
              ? 'Individuálne'
              : `${selectedSize.priceType === 'from' ? 'od ' : ''}${formatCurrency(selectedSize.priceFrom)}`}
          </p>
          <p className="mt-2 text-xs leading-5 text-cocoa-600">
            {selectedSize.priceType === 'individual'
              ? 'Cena bude stanovená po dohode podľa veľkosti, počtu poschodí a náročnosti dekoru.'
              : 'Cena pri tortách na mieru bude potvrdená po dohode podľa náročnosti dekoru.'}
          </p>
        </div>

        <Button type="button" onClick={handleAdd} disabled={!canSubmit} className="w-full">
          <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
          {justAdded ? 'Pridané — pokračujte v dopyte' : 'Pridať tortu do dopytu'}
        </Button>

        <ul className="space-y-1.5 border-t border-cream-200 pt-4 text-xs leading-5 text-cocoa-500">
          {CAKE_NOTES.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default CakeConfigurator;
