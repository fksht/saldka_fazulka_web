import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import { CATEGORIES } from '../../services/mockData';
import { PriceType, Product, ProductFormValues, ProductOptionGroup } from '../../types';
import { slugify } from '../../services/dataService';
import { uploadImage } from '../../services/storage';
import { ALLERGENS, assetPath } from '../../data/sladkaFazulkaCatalog';
import { getProductOptionGroups } from '../../utils/productOptions';
import { DIETARY_BADGES } from '../products/DietaryBadges';
import { Button } from '../ui/Button';

type AdminProductFormProps = {
  product?: Product;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
};

const emptyValues: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  category: 'Tartaletky',
  imageUrl: '',
  galleryImages: [],
  price: null,
  priceType: 'fixed',
  unitLabel: 'ks',
  allergens: [],
  tags: [],
  optionGroups: [],
  vegan: false,
  withoutMilk: false,
  lactoseFree: false,
  glutenFree: false,
  minimumOrderQuantity: undefined,
  available: true,
  featured: false,
};

const MAX_OPTION_GROUPS = 4;
const MAX_CHOICES_PER_GROUP = 5;

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-4 py-3 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100';

type DietaryField = 'vegan' | 'withoutMilk' | 'lactoseFree' | 'glutenFree';

const VERSION_GROUP_LABEL = 'Verzia';
const VERSION_NAME_BY_FIELD: Record<DietaryField, string> = {
  vegan: 'Vegánska',
  withoutMilk: 'Bez mlieka',
  lactoseFree: 'Bez laktózy',
  glutenFree: 'Bezlepková',
};
const KNOWN_VERSION_NAMES = Object.values(VERSION_NAME_BY_FIELD);

// Keep an editable "Verzia" option group in sync with the product's dietary
// badges: enabling a badge adds its version (price editable like any option),
// disabling it removes that version. The whole group disappears when no badge
// is set. Admin-added custom choices and per-version prices are preserved.
const syncVersionGroup = (
  groups: ProductOptionGroup[],
  badges: Pick<ProductFormValues, DietaryField>,
): ProductOptionGroup[] => {
  const desired = (Object.keys(VERSION_NAME_BY_FIELD) as DietaryField[])
    .filter((field) => badges[field])
    .map((field) => VERSION_NAME_BY_FIELD[field]);
  const others = groups.filter((group) => group.label !== VERSION_GROUP_LABEL);
  if (desired.length === 0) return others;

  const existing = groups.find((group) => group.label === VERSION_GROUP_LABEL);
  const prev = existing?.choices ?? [];
  const findPrev = (name: string) => prev.find((choice) => choice.name === name);
  const klasicka = findPrev('Klasická') ?? { name: 'Klasická' };
  const versionChoices = desired.map((name) => findPrev(name) ?? { name });
  const custom = prev.filter((choice) => choice.name !== 'Klasická' && !KNOWN_VERSION_NAMES.includes(choice.name));
  const versionGroup: ProductOptionGroup = {
    label: VERSION_GROUP_LABEL,
    choices: [klasicka, ...versionChoices, ...custom],
  };
  return existing ? groups.map((g) => (g.label === VERSION_GROUP_LABEL ? versionGroup : g)) : [...others, versionGroup];
};

const AdminProductForm = ({ product, onSubmit, onCancel }: AdminProductFormProps) => {
  const [values, setValues] = useState<ProductFormValues>(() => {
    if (!product) return emptyValues;
    // Normalize legacy single-variant fields into optionGroups so old products edit cleanly.
    return {
      ...product,
      optionGroups: getProductOptionGroups(product),
      variants: undefined,
      variantLabel: undefined,
    };
  });
  const [tagsInput, setTagsInput] = useState(product?.tags.join(', ') ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const optionGroups = values.optionGroups ?? [];

  const mutateGroups = (mutator: (groups: ProductOptionGroup[]) => ProductOptionGroup[]) => {
    setValues((current) => ({ ...current, optionGroups: mutator(current.optionGroups ?? []) }));
  };

  // Toggling a dietary badge also adds/removes its version in the "Verzia" group.
  const toggleDietaryBadge = (field: DietaryField) => {
    setValues((current) => {
      const nextBadges = { ...current, [field]: !current[field] };
      return { ...current, [field]: !current[field], optionGroups: syncVersionGroup(current.optionGroups ?? [], nextBadges) };
    });
  };

  const addGroup = () => {
    mutateGroups((groups) => {
      if (groups.length >= MAX_OPTION_GROUPS) return groups;
      // First group defaults to "Variant" (most common); further ones are named by the user.
      const label = groups.length === 0 ? 'Variant' : '';
      return [...groups, { label, choices: [{ name: '' }] }];
    });
  };

  const removeGroup = (groupIndex: number) => {
    mutateGroups((groups) => groups.filter((_, i) => i !== groupIndex));
  };

  const updateGroupLabel = (groupIndex: number, label: string) => {
    mutateGroups((groups) => groups.map((group, i) => (i === groupIndex ? { ...group, label } : group)));
  };

  const addChoice = (groupIndex: number) => {
    mutateGroups((groups) =>
      groups.map((group, i) =>
        i === groupIndex && group.choices.length < MAX_CHOICES_PER_GROUP
          ? { ...group, choices: [...group.choices, { name: '' }] }
          : group,
      ),
    );
  };

  const removeChoice = (groupIndex: number, choiceIndex: number) => {
    mutateGroups((groups) =>
      groups.map((group, i) =>
        i === groupIndex ? { ...group, choices: group.choices.filter((_, ci) => ci !== choiceIndex) } : group,
      ),
    );
  };

  const updateChoiceName = (groupIndex: number, choiceIndex: number, name: string) => {
    mutateGroups((groups) =>
      groups.map((group, i) =>
        i === groupIndex
          ? { ...group, choices: group.choices.map((choice, ci) => (ci === choiceIndex ? { ...choice, name } : choice)) }
          : group,
      ),
    );
  };

  const updateChoiceDelta = (groupIndex: number, choiceIndex: number, raw: string) => {
    const priceDelta = raw.trim() === '' ? undefined : Number(raw);
    mutateGroups((groups) =>
      groups.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              choices: group.choices.map((choice, ci) =>
                ci === choiceIndex ? { ...choice, priceDelta } : choice,
              ),
            }
          : group,
      ),
    );
  };

  const previewUrl = useMemo(() => values.imageUrl || product?.imageUrl || '', [product?.imageUrl, values.imageUrl]);
  const requiresNumericPrice = values.priceType === 'fixed' || values.priceType === 'from';

  const updateField = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const toggleAllergen = (id: number) => {
    setValues((current) => {
      const exists = current.allergens.includes(id);
      const next = exists ? current.allergens.filter((a) => a !== id) : [...current.allergens, id].sort((a, b) => a - b);
      return { ...current, allergens: next };
    });
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError(null);
    try {
      const url = await uploadImage(file, 'products');
      updateField('imageUrl', url);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Nahranie obrázka zlyhalo.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (requiresNumericPrice && (values.price === null || !Number.isFinite(values.price) || values.price <= 0)) {
      setFormError('Pri fixnej cene alebo cene od zadaj platnú cenu vyššiu ako 0 €.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const cleanTags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    // Drop empty choices/groups and default a missing group label to "Variant".
    const cleanOptionGroups: ProductOptionGroup[] = (values.optionGroups ?? [])
      .map((group) => ({
        label: group.label.trim() || 'Variant',
        choices: group.choices
          .map((choice) => ({
            name: choice.name.trim(),
            priceDelta:
              choice.priceDelta !== undefined && Number.isFinite(choice.priceDelta) && choice.priceDelta !== 0
                ? choice.priceDelta
                : undefined,
          }))
          .filter((choice) => choice.name.length > 0),
      }))
      .filter((group) => group.choices.length > 0);

    try {
      await onSubmit({
        ...values,
        slug: values.slug || slugify(values.name),
        price: requiresNumericPrice ? values.price : null,
        tags: cleanTags,
        optionGroups: cleanOptionGroups.length > 0 ? cleanOptionGroups : undefined,
        // Clear legacy fields — optionGroups is now the single source of truth.
        variants: undefined,
        variantLabel: undefined,
      });
    } catch {
      setFormError('Produkt sa nepodarilo uložiť. Skontroluj údaje a skús to znova.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-700">
            {product ? 'Upraviť produkt' : 'Nový produkt'}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-cocoa-950">
            {product ? product.name : 'Pridať produkt do ponuky'}
          </h2>
        </div>
        <button type="button" className="rounded-full p-2 text-cocoa-500 hover:bg-cream-100 hover:text-cocoa-900" onClick={onCancel}>
          <span className="sr-only">Zavrieť formulár</span>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-cream-200 bg-cream-100">
            {previewUrl ? (
              <img src={previewUrl} alt="Náhľad produktu" className="h-full w-full object-contain p-4" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-cocoa-400">
                <ImagePlus className="h-10 w-10" aria-hidden="true" />
                <span className="text-sm font-semibold">Náhľad obrázka</span>
              </div>
            )}
          </div>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Nahrať obrázok</span>
            <input type="file" accept="image/*" disabled={isUploading} onChange={handleImageUpload} className="block w-full text-sm text-cocoa-600 file:mr-4 file:rounded-full file:border-0 file:bg-cocoa-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-cocoa-900 disabled:opacity-50" />
            {isUploading && <span className="mt-1 block text-xs font-semibold text-cocoa-500">Nahrávam obrázok…</span>}
          </label>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Alebo URL obrázka</span>
            <input value={values.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} className={inputClass} placeholder="/images/sladka-fazulka/products/…" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Názov</span>
            <input
              required
              value={values.name}
              onChange={(event) => {
                updateField('name', event.target.value);
                if (!product) updateField('slug', slugify(event.target.value));
              }}
              className={inputClass}
              placeholder="Napr. Tartaletka Malina & Lotus"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Slug</span>
            <input value={values.slug} onChange={(event) => updateField('slug', event.target.value)} className={inputClass} />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Kategória</span>
            <select value={values.category} onChange={(event) => updateField('category', event.target.value as ProductFormValues['category'])} className={inputClass}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Typ ceny</span>
            <select value={values.priceType} onChange={(event) => updateField('priceType', event.target.value as PriceType)} className={inputClass}>
              <option value="fixed">Fixná cena</option>
              <option value="from">Cena od</option>
              <option value="on_request">Cena po dohode</option>
              <option value="individual">Individuálne</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Cena v EUR</span>
            <input
              type="number"
              step="0.01"
              min="0"
              required={requiresNumericPrice}
              disabled={!requiresNumericPrice}
              value={values.price ?? ''}
              onChange={(event) => updateField('price', event.target.value ? Number(event.target.value) : null)}
              className={inputClass}
              placeholder="2.20"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Jednotka</span>
            <input
              value={values.unitLabel ?? ''}
              onChange={(event) => updateField('unitLabel', event.target.value || undefined)}
              className={inputClass}
              placeholder="ks / porcií / krabička"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Minimálny odber (ks)</span>
            <input
              type="number"
              min="1"
              value={values.minimumOrderQuantity ?? ''}
              onChange={(event) => updateField('minimumOrderQuantity', event.target.value ? Number(event.target.value) : undefined)}
              className={inputClass}
              placeholder="10"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Popis</span>
            <textarea
              required
              rows={4}
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              className={inputClass}
              placeholder="Krátky opis produktu…"
            />
          </label>

          <div className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-cocoa-700">Alergény</span>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGENS.map((allergen) => {
                const active = values.allergens.includes(allergen.id);
                return (
                  <button
                    key={allergen.id}
                    type="button"
                    onClick={() => toggleAllergen(allergen.id)}
                    title={allergen.name}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'border-rose-400 bg-rose-50 text-rose-700'
                        : 'border-cream-200 bg-cream-50 text-cocoa-600 hover:border-rose-200'
                    }`}
                  >
                    <span className="font-bold">{allergen.id}</span>
                    <span>{allergen.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Tagy (oddelené čiarkou)</span>
            <input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} className={inputClass} placeholder="malina, lotus, bezlepkové" />
          </label>

          <div className="rounded-xl border border-cream-200 bg-cream-50/60 p-4 sm:col-span-2">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-cocoa-700">Možnosti výberu (varianty, príchute…)</p>
                <p className="mt-0.5 text-xs text-cocoa-500">
                  Voliteľné. Pridaj jednu alebo viac skupín (napr. Variant, Príchuť). Pri každej možnosti môžeš zadať
                  zmenu ceny (napr. +0,30 pre vegánsku). Max {MAX_OPTION_GROUPS} skupiny, {MAX_CHOICES_PER_GROUP}{' '}
                  možností v skupine.
                </p>
              </div>
              <button
                type="button"
                onClick={addGroup}
                disabled={optionGroups.length >= MAX_OPTION_GROUPS}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-semibold text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Pridať skupinu
              </button>
            </div>
            {optionGroups.length > 0 ? (
              <div className="space-y-4">
                {optionGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="rounded-lg border border-cream-200 bg-white p-3">
                    <div className="flex items-end gap-2">
                      <label className="block flex-1">
                        <span className="mb-1 block text-xs font-semibold text-cocoa-600">
                          Názov skupiny (napr. Variant, Príchuť)
                        </span>
                        <input
                          value={group.label}
                          onChange={(event) => updateGroupLabel(groupIndex, event.target.value)}
                          className={inputClass}
                          placeholder="Variant"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeGroup(groupIndex)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cocoa-500 transition hover:bg-red-50 hover:text-red-700"
                        title="Odstrániť skupinu"
                      >
                        <span className="sr-only">Odstrániť skupinu</span>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {group.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="flex items-center gap-2">
                          <input
                            value={choice.name}
                            onChange={(event) => updateChoiceName(groupIndex, choiceIndex, event.target.value)}
                            className={`${inputClass} flex-1`}
                            placeholder={`Možnosť ${choiceIndex + 1} (napr. Vegan)`}
                          />
                          <div className="relative w-28 shrink-0">
                            <input
                              type="number"
                              step="0.01"
                              value={choice.priceDelta ?? ''}
                              onChange={(event) => updateChoiceDelta(groupIndex, choiceIndex, event.target.value)}
                              className={`${inputClass} pr-7 text-right`}
                              placeholder="0"
                              title="Zmena ceny v EUR (napr. 0.30 alebo -0.20)"
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cocoa-400">
                              €
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeChoice(groupIndex, choiceIndex)}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cocoa-500 transition hover:bg-red-50 hover:text-red-700"
                            title="Odstrániť možnosť"
                          >
                            <span className="sr-only">Odstrániť možnosť</span>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addChoice(groupIndex)}
                        disabled={group.choices.length >= MAX_CHOICES_PER_GROUP}
                        className="inline-flex items-center gap-1 rounded-full border border-cream-300 bg-cream-50 px-3 py-1.5 text-xs font-semibold text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Pridať možnosť
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-cocoa-500">
                  Zmena ceny sa pripočíta k základnej cene. Zápornú hodnotu (napr. -0.20) použi pre zľavu.
                </p>
              </div>
            ) : (
              <p className="text-xs italic text-cocoa-500">Žiadne možnosti — zákazník si zvolí len počet kusov.</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-cocoa-700">Odznaky (zobrazia sa na produkte)</span>
            <div className="flex flex-wrap gap-2">
              {DIETARY_BADGES.map((badge) => {
                const active = Boolean(values[badge.field]);
                return (
                  <button
                    key={badge.field}
                    type="button"
                    onClick={() => toggleDietaryBadge(badge.field)}
                    title={badge.title}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                      active
                        ? 'border-rose-400 bg-rose-50 text-rose-700'
                        : 'border-cream-200 bg-cream-50 text-cocoa-600 hover:border-rose-200'
                    }`}
                  >
                    <img src={assetPath(badge.src)} alt="" className="h-6 w-6 object-contain" />
                    {badge.title}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-cocoa-500">Klikni na odznak, ktorý chceš pri produkte zobraziť.</p>
          </div>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <label className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-cream-50 px-4 py-2 text-sm font-semibold text-cocoa-700">
              <input type="checkbox" checked={values.available} onChange={(event) => updateField('available', event.target.checked)} className="h-4 w-4 rounded border-cream-300 text-rose-600 focus:ring-rose-200" />
              Dostupné v ponuke
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-cream-50 px-4 py-2 text-sm font-semibold text-cocoa-700">
              <input type="checkbox" checked={values.featured} onChange={(event) => updateField('featured', event.target.checked)} className="h-4 w-4 rounded border-cream-300 text-rose-600 focus:ring-rose-200" />
              Odporúčané na úvode
            </label>
          </div>
        </div>
      </div>

      {formError && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{formError}</p>}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Zrušiť
        </Button>
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {isSaving ? 'Ukladám…' : 'Uložiť produkt'}
        </Button>
      </div>
    </form>
  );
};

export default AdminProductForm;
