import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { CakeBuilderConfig, CakeBuilderOption, CakeBuilderSize, PriceType } from '../../types';
import { dataService } from '../../services/dataService';
import { Button } from '../ui/Button';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 text-sm text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100';

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const parseNumber = (raw: string): number | undefined => {
  if (raw.trim() === '') return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
};

// ---- Priced option list (bases / creams / fillings / dietary) ----

type OptionListEditorProps = {
  title: string;
  description: string;
  options: CakeBuilderOption[];
  onChange: (next: CakeBuilderOption[]) => void;
  idPrefix: string;
  priceLabel: string;
  withGroup?: boolean;
  namePlaceholder?: string;
};

const OptionListEditor = ({
  title,
  description,
  options,
  onChange,
  idPrefix,
  priceLabel,
  withGroup = false,
  namePlaceholder = 'Názov',
}: OptionListEditorProps) => {
  const updateAt = (index: number, patch: Partial<CakeBuilderOption>) =>
    onChange(options.map((option, i) => (i === index ? { ...option, ...patch } : option)));

  return (
    <section className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-cocoa-950">{title}</h3>
          <p className="mt-0.5 text-xs text-cocoa-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...options, { id: createId(idPrefix), name: '' }])}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-semibold text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Pridať
        </button>
      </div>
      {options.length === 0 ? (
        <p className="text-xs italic text-cocoa-500">Zatiaľ nič — pridaj kliknutím na „Pridať“.</p>
      ) : (
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={option.id} className="flex flex-wrap items-center gap-2">
              <input
                value={option.name}
                onChange={(event) => updateAt(index, { name: event.target.value })}
                className={`${inputClass} min-w-[10rem] flex-1`}
                placeholder={namePlaceholder}
              />
              {withGroup && (
                <input
                  value={option.group ?? ''}
                  onChange={(event) => updateAt(index, { group: event.target.value || undefined })}
                  className={`${inputClass} w-40`}
                  placeholder="Skupina (napr. Sviеže)"
                />
              )}
              <div className="relative w-28 shrink-0">
                <input
                  type="number"
                  step="0.01"
                  value={option.priceDelta ?? ''}
                  onChange={(event) => updateAt(index, { priceDelta: parseNumber(event.target.value) })}
                  className={`${inputClass} pr-6 text-right`}
                  placeholder="0"
                  title={priceLabel}
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-cocoa-400">
                  €
                </span>
              </div>
              <button
                type="button"
                onClick={() => onChange(options.filter((_, i) => i !== index))}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cocoa-500 transition hover:bg-red-50 hover:text-red-700"
                title="Odstrániť"
              >
                <span className="sr-only">Odstrániť</span>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-cocoa-500">{priceLabel} sa pripočíta k cene torty. Nechaj prázdne = 0 €.</p>
    </section>
  );
};

// ---- Size list ----

type SizeListEditorProps = {
  sizes: CakeBuilderSize[];
  onChange: (next: CakeBuilderSize[]) => void;
};

const SizeListEditor = ({ sizes, onChange }: SizeListEditorProps) => {
  const updateAt = (index: number, patch: Partial<CakeBuilderSize>) =>
    onChange(sizes.map((size, i) => (i === index ? { ...size, ...patch } : size)));

  return (
    <section className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-cocoa-950">Veľkosti</h3>
          <p className="mt-0.5 text-xs text-cocoa-500">Základná cena torty podľa veľkosti.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange([...sizes, { id: createId('size'), name: '', portions: '', price: 0, priceType: 'from' }])
          }
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-semibold text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Pridať
        </button>
      </div>
      {sizes.length === 0 ? (
        <p className="text-xs italic text-cocoa-500">Zatiaľ žiadne veľkosti.</p>
      ) : (
        <div className="space-y-2">
          {sizes.map((size, index) => (
            <div key={size.id} className="flex flex-wrap items-center gap-2">
              <input
                value={size.name}
                onChange={(event) => updateAt(index, { name: event.target.value })}
                className={`${inputClass} w-32`}
                placeholder="Názov (Stredná)"
              />
              <input
                value={size.diameter ?? ''}
                onChange={(event) => updateAt(index, { diameter: event.target.value || undefined })}
                className={`${inputClass} w-24`}
                placeholder="⌀ 18 cm"
              />
              <input
                value={size.portions}
                onChange={(event) => updateAt(index, { portions: event.target.value })}
                className={`${inputClass} min-w-[8rem] flex-1`}
                placeholder="cca 13–15 porcií"
              />
              <div className="relative w-24 shrink-0">
                <input
                  type="number"
                  step="0.01"
                  value={size.price}
                  onChange={(event) => updateAt(index, { price: parseNumber(event.target.value) ?? 0 })}
                  className={`${inputClass} pr-6 text-right`}
                  placeholder="0"
                  title="Cena"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-cocoa-400">
                  €
                </span>
              </div>
              <select
                value={size.priceType}
                onChange={(event) => updateAt(index, { priceType: event.target.value as PriceType })}
                className={`${inputClass} w-28`}
                title="Typ ceny"
              >
                <option value="from">od ceny</option>
                <option value="fixed">fixná</option>
                <option value="individual">individuálne</option>
              </select>
              <button
                type="button"
                onClick={() => onChange(sizes.filter((_, i) => i !== index))}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cocoa-500 transition hover:bg-red-50 hover:text-red-700"
                title="Odstrániť"
              >
                <span className="sr-only">Odstrániť</span>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// ---- Manager ----

const CakeBuilderManager = () => {
  const [config, setConfig] = useState<CakeBuilderConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void dataService.getCakeConfig().then((loaded) => {
      if (active) setConfig(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  const patch = (next: Partial<CakeBuilderConfig>) =>
    setConfig((current) => (current ? { ...current, ...next } : current));

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    setError(null);
    try {
      await dataService.saveCakeConfig(config);
      setSavedAt(Date.now());
    } catch {
      setError('Uloženie zlyhalo. Skús to prosím znova.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
        <p className="font-medium text-cocoa-500">Načítavam konfiguráciu tort…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-cream-200 bg-cream-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-cocoa-950">Torty na mieru</h2>
          <p className="mt-1 text-sm text-cocoa-600">
            Spravuj veľkosti, korpusy, krémy, doplnky a špeciálne verzie aj s cenami. Zmeny sa prejavia v konfigurátore
            tort po uložení.
          </p>
        </div>
        <Button type="button" onClick={handleSave} disabled={isSaving} className="shrink-0">
          <Save className="h-4 w-4" aria-hidden="true" />
          {isSaving ? 'Ukladám…' : 'Uložiť zmeny'}
        </Button>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {savedAt && !error && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">Uložené ✓</p>
      )}

      <SizeListEditor sizes={config.sizes} onChange={(sizes) => patch({ sizes })} />

      <OptionListEditor
        title="Korpusy"
        description="Základné príchute korpusu. Príplatok je voliteľný."
        options={config.bases}
        onChange={(bases) => patch({ bases })}
        idPrefix="base"
        priceLabel="Príplatok"
        namePlaceholder="Napr. Vanilkový"
      />

      <OptionListEditor
        title="Krémy"
        description="Príchute krémov. Skupina zoskupí krémy v konfigurátore (napr. Sviеže, Orieškové). Drahší krém = príplatok."
        options={config.creams}
        onChange={(creams) => patch({ creams })}
        idPrefix="cream"
        priceLabel="Príplatok"
        withGroup
        namePlaceholder="Napr. Pistáciový krém"
      />

      <OptionListEditor
        title="Doplnky vnútri torty"
        description="Ovocie, oriešky, sušienky, karamel… Zákazník si ich vyberie. Drahší doplnok = príplatok."
        options={config.fillings}
        onChange={(fillings) => patch({ fillings })}
        idPrefix="filling"
        priceLabel="Príplatok"
        namePlaceholder="Napr. maliny"
      />

      <OptionListEditor
        title="Špeciálne / diétne verzie"
        description="Vegánska, bezlepková, bezlaktózová… Príplatok za prácnejšiu/drahšiu verziu zadáš tu."
        options={config.dietary}
        onChange={(dietary) => patch({ dietary })}
        idPrefix="diet"
        priceLabel="Príplatok"
        namePlaceholder="Napr. Vegánska verzia"
      />

      <section className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm">
        <h3 className="font-display text-xl font-semibold text-cocoa-950">Nastavenia</h3>
        <label className="mt-3 block max-w-xs">
          <span className="mb-1 block text-sm font-semibold text-cocoa-700">Max. počet krémov</span>
          <input
            type="number"
            min="1"
            value={config.maxCreams}
            onChange={(event) => patch({ maxCreams: Math.max(1, parseNumber(event.target.value) ?? 1) })}
            className={inputClass}
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-semibold text-cocoa-700">
            Poznámky pod konfigurátorom (každý riadok = jedna poznámka)
          </span>
          <textarea
            rows={4}
            value={config.notes.join('\n')}
            onChange={(event) => patch({ notes: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })}
            className={inputClass}
          />
        </label>
      </section>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {isSaving ? 'Ukladám…' : 'Uložiť zmeny'}
        </Button>
      </div>
    </div>
  );
};

export default CakeBuilderManager;
