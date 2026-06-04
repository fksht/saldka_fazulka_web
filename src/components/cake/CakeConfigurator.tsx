import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Check, ImagePlus, Loader2, Plus, ShoppingBasket, X } from 'lucide-react';
import { CakeBuilderConfig, CakeBuilderOption, CakeConfiguration } from '../../types';
import { dataService } from '../../services/dataService';
import { formatCurrency } from '../../utils/format';
import { formatPriceDelta } from '../../utils/productOptions';
import { computeCakeTotal } from '../../utils/cakePricing';
import { Button } from '../ui/Button';

type CakeConfiguratorProps = {
  onAdd: (config: CakeConfiguration) => void;
  /** When set, the builder preloads these selections (editing an existing cake). */
  initialConfig?: CakeConfiguration | null;
  submitLabel?: string;
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

const sizePriceLabel = (price: number | null, priceType?: string) => {
  if (price === null || priceType === 'individual') return 'Individuálne';
  return `${priceType === 'from' ? 'od ' : ''}${formatCurrency(price)}`;
};

const CakeConfigurator = ({ onAdd, initialConfig, submitLabel }: CakeConfiguratorProps) => {
  const [config, setConfig] = useState<CakeBuilderConfig | null>(null);
  const [baseId, setBaseId] = useState<string>('');
  const [creamIds, setCreamIds] = useState<string[]>([]);
  const [sizeId, setSizeId] = useState<string>('');
  const [fillingIds, setFillingIds] = useState<string[]>([]);
  const [dietaryIds, setDietaryIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [inspirationUrl, setInspirationUrl] = useState('');
  const [inspirationImage, setInspirationImage] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  useEffect(() => {
    let active = true;
    void dataService.getCakeConfig().then((loaded) => {
      if (!active) return;
      setConfig(loaded);
      if (initialConfig) {
        // Editing an existing cake — restore the previous selections.
        setBaseId(initialConfig.baseId || loaded.bases[0]?.id || '');
        setCreamIds(initialConfig.creamIds ?? []);
        setSizeId(initialConfig.sizeId || loaded.sizes[1]?.id || loaded.sizes[0]?.id || '');
        setFillingIds(initialConfig.fillingIds ?? []);
        setDietaryIds(initialConfig.dietaryIds ?? []);
        setNote(initialConfig.note ?? '');
        setInspirationUrl(initialConfig.inspirationUrl ?? '');
        setInspirationImage(initialConfig.inspirationImage);
      } else {
        setBaseId(loaded.bases[0]?.id ?? '');
        // Default to the second size if present (a small standard cake), else the first.
        setSizeId(loaded.sizes[1]?.id ?? loaded.sizes[0]?.id ?? '');
      }
    });
    return () => {
      active = false;
    };
  }, [initialConfig]);

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

  const selectedBase = useMemo(
    () => config?.bases.find((b) => b.id === baseId),
    [config, baseId],
  );
  const selectedSize = useMemo(() => config?.sizes.find((s) => s.id === sizeId), [config, sizeId]);
  const selectedCreams = useMemo(
    () => config?.creams.filter((c) => creamIds.includes(c.id)) ?? [],
    [config, creamIds],
  );
  const selectedFillings = useMemo(
    () => config?.fillings.filter((f) => fillingIds.includes(f.id)) ?? [],
    [config, fillingIds],
  );
  const selectedDietary = useMemo(
    () => config?.dietary.filter((d) => dietaryIds.includes(d.id)) ?? [],
    [config, dietaryIds],
  );

  // Creams grouped by their free-text group label (order preserved).
  const creamGroups = useMemo(() => {
    const groups: Array<{ label: string; items: CakeBuilderOption[] }> = [];
    (config?.creams ?? []).forEach((cream) => {
      const label = cream.group?.trim() || 'Krémy';
      let group = groups.find((g) => g.label === label);
      if (!group) {
        group = { label, items: [] };
        groups.push(group);
      }
      group.items.push(cream);
    });
    return groups;
  }, [config]);

  const total = useMemo(
    () =>
      computeCakeTotal(selectedSize, [
        selectedBase,
        ...selectedCreams,
        ...selectedFillings,
        ...selectedDietary,
      ]),
    [selectedSize, selectedBase, selectedCreams, selectedFillings, selectedDietary],
  );

  const toggleId = (setter: typeof setCreamIds, id: string, limit?: number) => {
    setter((current) => {
      if (current.includes(id)) return current.filter((existing) => existing !== id);
      if (limit && current.length >= limit) return current;
      return [...current, id];
    });
  };

  const canSubmit = creamIds.length > 0 && Boolean(selectedSize);

  const handleAdd = () => {
    if (!canSubmit || !selectedSize) return;
    const normalizedInspirationUrl = normalizeHttpUrl(inspirationUrl);
    if (normalizedInspirationUrl === null) {
      setUrlError('Zadaj platný odkaz začínajúci na http:// alebo https://, alebo pole nechaj prázdne.');
      return;
    }
    setUrlError(null);

    const dietaryNames = selectedDietary.map((d) => d.name);
    const fillingNames = selectedFillings.map((f) => f.name);

    onAdd({
      baseId: selectedBase?.id ?? '',
      baseName: selectedBase?.name ?? '',
      creamIds: selectedCreams.map((c) => c.id),
      creamNames: selectedCreams.map((c) => c.name),
      sizeId: selectedSize.id,
      sizeName: `${selectedSize.name}${selectedSize.diameter ? ` ${selectedSize.diameter}` : ''}`.trim(),
      sizePortions: selectedSize.portions,
      sizePriceFrom: selectedSize.price,
      fillingNames: fillingNames.length > 0 ? fillingNames : undefined,
      fillingIds: selectedFillings.length > 0 ? selectedFillings.map((f) => f.id) : undefined,
      dietaryNames: dietaryNames.length > 0 ? dietaryNames : undefined,
      dietaryIds: selectedDietary.length > 0 ? selectedDietary.map((d) => d.id) : undefined,
      extras: dietaryNames.length > 0 ? dietaryNames : undefined,
      totalPrice: total,
      priceType: selectedSize.priceType,
      note: note.trim() || undefined,
      inspirationUrl: normalizedInspirationUrl,
      inspirationImage,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2400);
  };

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
        <p className="font-medium text-cocoa-500">Pripravujem konfigurátor tort…</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-12">
        {/* Step 1: korpus */}
        <section>
          {stepBadge(1, 'Korpus')}
          <div className="grid gap-3 sm:grid-cols-2">
            {config.bases.map((base) => {
              const active = base.id === baseId;
              const delta = formatPriceDelta(base.priceDelta);
              return (
                <button
                  key={base.id}
                  type="button"
                  onClick={() => setBaseId(base.id)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    active
                      ? 'border-rose-300 bg-rose-50/70 shadow-md ring-1 ring-rose-200'
                      : 'border-cream-200 bg-white hover:border-rose-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-lg font-semibold text-cocoa-950">
                      {base.name}
                      {delta && <span className="ml-2 text-sm font-bold text-gold-700">{delta}</span>}
                    </p>
                    {active && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  {base.description && <p className="mt-1.5 text-sm leading-6 text-cocoa-600">{base.description}</p>}
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: krém */}
        <section>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex h-9 items-center gap-2 rounded-full bg-cocoa-800 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-cream-50">
              Krok 2
            </span>
            <h3 className="font-display text-2xl font-semibold text-cocoa-950">Krém</h3>
            <span className="ml-auto rounded-full bg-cream-100 px-3 py-1 text-xs font-bold text-cocoa-700">
              Vybrané {creamIds.length}
            </span>
          </div>
          <div className="space-y-7">
            {creamGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-sm font-bold text-cocoa-800">{group.label}</p>
                <div className="grid gap-2">
                  {group.items.map((cream) => {
                    const active = creamIds.includes(cream.id);
                    const delta = formatPriceDelta(cream.priceDelta);
                    return (
                      <button
                        key={cream.id}
                        type="button"
                        onClick={() => toggleId(setCreamIds, cream.id)}
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
                        {delta && <span className="text-xs font-bold text-gold-700">{delta}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 3: doplnky vnútri torty */}
        {config.fillings.length > 0 && (
          <section>
            {stepBadge(3, 'Doplnky vnútri torty')}
            <p className="-mt-2 mb-4 text-sm text-cocoa-600">Voliteľné. Vyber, čo má byť vnútri torty.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {config.fillings.map((filling) => {
                const active = fillingIds.includes(filling.id);
                const delta = formatPriceDelta(filling.priceDelta);
                return (
                  <button
                    key={filling.id}
                    type="button"
                    onClick={() => toggleId(setFillingIds, filling.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? 'border-rose-300 bg-rose-50/70 text-cocoa-900 shadow-sm'
                        : 'border-cream-200 bg-white text-cocoa-700 hover:border-rose-200'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                        active ? 'border-rose-500 bg-rose-500 text-white' : 'border-cream-300 bg-white'
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                    </span>
                    <span className="flex-1">{filling.name}</span>
                    {delta && <span className="text-xs font-bold text-gold-700">{delta}</span>}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 4: veľkosť */}
        <section>
          {stepBadge(4, 'Veľkosť')}
          <div className="grid gap-2">
            {config.sizes.map((size) => {
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
                      {size.diameter && <span className="ml-2 text-cocoa-500">{size.diameter}</span>}
                    </p>
                    <p className="text-sm text-cocoa-600">{size.portions}</p>
                  </div>
                  <p className="font-display text-xl font-semibold text-cocoa-900">
                    {sizePriceLabel(size.priceType === 'individual' ? null : size.price, size.priceType)}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dietary versions */}
        {config.dietary.length > 0 && (
          <section className="rounded-2xl border border-cream-200 bg-white p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-700">Špeciálne / intolerancie</p>
            <p className="mt-2 text-sm text-cocoa-600">
              Na želanie pripravím tortu aj v týchto verziách. Prípadný príplatok je uvedený pri možnosti.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {config.dietary.map((diet) => {
                const active = dietaryIds.includes(diet.id);
                const delta = formatPriceDelta(diet.priceDelta);
                return (
                  <label
                    key={diet.id}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-100'
                        : 'border-cream-300 bg-cream-50 text-cocoa-700 hover:border-rose-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleId(setDietaryIds, diet.id)}
                      className="h-4 w-4 rounded border-cream-300 text-rose-600 focus:ring-rose-200"
                    />
                    {diet.name}
                    {delta && <span className="text-xs font-bold text-gold-700">{delta}</span>}
                  </label>
                );
              })}
            </div>
          </section>
        )}

        {/* Extra notes */}
        <section className="rounded-2xl border border-cream-200 bg-white p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-700">Doplňujúce poznámky</p>
          <label className="mt-3 block">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">
              Farba torty, téma, dekor, postavičky, text na tortu
            </span>
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
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-cocoa-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cocoa-900">
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                Nahrať fotku
                <input type="file" accept="image/*" onChange={handleInspirationImage} className="sr-only" />
              </label>
            )}
            {imageError && <p className="mt-2 text-sm font-semibold text-red-600">{imageError}</p>}
          </div>
        </section>
      </div>

      {/* Summary sidebar */}
      <aside className="sticky top-24 h-fit space-y-5 rounded-3xl border border-cream-200 bg-white p-7 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">Vaša torta</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-cocoa-950">Rekapitulácia</h3>
        </div>

        <div className="space-y-4 border-t border-cream-200 pt-4 text-sm text-cocoa-700">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">Korpus</p>
            <p className="font-semibold text-cocoa-900">{selectedBase?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">Krém</p>
            {selectedCreams.length === 0 ? (
              <p className="italic text-cocoa-500">Vyberte aspoň jeden krém</p>
            ) : (
              <ul className="space-y-1 text-sm text-cocoa-700">
                {selectedCreams.map((cream) => (
                  <li key={cream.id}>· {cream.name}</li>
                ))}
              </ul>
            )}
          </div>
          {selectedFillings.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">Doplnky</p>
              <p className="text-sm text-cocoa-700">{selectedFillings.map((f) => f.name).join(', ')}</p>
            </div>
          )}
          {selectedSize && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">Veľkosť</p>
              <p className="font-semibold text-cocoa-900">
                {selectedSize.name} {selectedSize.diameter && <span className="text-cocoa-500">({selectedSize.diameter})</span>}
              </p>
              <p className="text-sm text-cocoa-600">{selectedSize.portions}</p>
            </div>
          )}
          {selectedDietary.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400">Špeciálne</p>
              <ul className="space-y-1 text-sm text-cocoa-700">
                {selectedDietary.map((diet) => (
                  <li key={diet.id}>· {diet.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gold-200 bg-gold-100/40 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold-700">Cena</p>
          <p className="mt-1 font-display text-3xl font-semibold text-cocoa-950">
            {sizePriceLabel(total, selectedSize?.priceType)}
          </p>
          <p className="mt-2 text-xs leading-5 text-cocoa-600">
            {total === null
              ? 'Cena bude stanovená po dohode podľa veľkosti, počtu poschodí a náročnosti dekoru.'
              : 'Konečná cena pri náročnejšom dekore môže byť upravená po dohode.'}
          </p>
        </div>

        <Button type="button" onClick={handleAdd} disabled={!canSubmit} className="w-full">
          <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
          {justAdded ? 'Uložené — pokračujte v dopyte' : submitLabel ?? 'Pridať tortu do dopytu'}
        </Button>

        {config.notes.length > 0 && (
          <ul className="space-y-1.5 border-t border-cream-200 pt-4 text-xs leading-5 text-cocoa-500">
            {config.notes.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
};

export default CakeConfigurator;
