import { FormEvent, useEffect, useState } from 'react';
import { Edit2, Eye, EyeOff, Loader2, PackageCheck, Plus, Save, Trash2, X } from 'lucide-react';
import * as z from 'zod';
import { dataService } from '../../services/dataService';
import { CandyBarPackage, CandyBarPackageFormValues } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Button } from '../ui/Button';

type PackageFormState = {
  name: string;
  guestCount: string;
  totalPieces: string;
  dessertTypeCount: string;
  price: string;
  compositionText: string;
};

const packageSchema = z.object({
  name: z.string().trim().min(2, 'Zadajte názov balíčka'),
  guestCount: z.string().trim().min(2, 'Zadajte počet hostí'),
  totalPieces: z.coerce.number().int('Počet kusov musí byť celé číslo').positive('Počet kusov musí byť vyšší ako 0'),
  dessertTypeCount: z.coerce.number().int('Počet druhov musí byť celé číslo').positive('Počet druhov musí byť vyšší ako 0'),
  price: z.coerce.number().positive('Cena musí byť vyššia ako 0'),
  compositionText: z.string().trim().min(3, 'Doplňte zloženie balíčka'),
});

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-4 py-3 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100';

const emptyFormState: PackageFormState = {
  name: '',
  guestCount: '',
  totalPieces: '',
  dessertTypeCount: '',
  price: '',
  compositionText: '',
};

const toFormState = (pkg: CandyBarPackage): PackageFormState => ({
  name: pkg.name,
  guestCount: pkg.guestCount,
  totalPieces: String(pkg.totalPieces),
  dessertTypeCount: String(pkg.dessertTypeCount),
  price: String(pkg.price),
  compositionText: pkg.composition.map((item) => `${item.label} | ${item.pieces}`).join('\n'),
});

const parseComposition = (value: string) =>
  value
    .split('\n')
    .map((line) => {
      const [label, pieces] = line.split('|').map((part) => part.trim());
      return label && pieces ? { label, pieces } : null;
    })
    .filter((item): item is { label: string; pieces: string } => Boolean(item));

const PackageManager = () => {
  const [packages, setPackages] = useState<CandyBarPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<CandyBarPackage | null>(null);
  const [formState, setFormState] = useState<PackageFormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    const data = await dataService.getCandyBarPackages();
    setPackages(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchPackages();
  }, []);

  const startEditing = (pkg: CandyBarPackage) => {
    setEditingPackage(pkg);
    setFormState(toFormState(pkg));
    setFormError(null);
  };

  const startCreating = () => {
    setEditingPackage(null);
    setFormState(emptyFormState);
    setFormError(null);
  };

  const closeForm = () => {
    setEditingPackage(null);
    setFormState(null);
    setFormError(null);
  };

  const updateField = (key: keyof PackageFormState, value: string) => {
    setFormState((current) => (current ? { ...current, [key]: value } : current));
  };

  const toggleHidden = async (pkg: CandyBarPackage) => {
    await dataService.updateCandyBarPackage(pkg.id, { hidden: !pkg.hidden });
    await fetchPackages();
  };

  const deletePackage = async (pkg: CandyBarPackage) => {
    if (!window.confirm(`Zmazať balíček "${pkg.name}"?`)) return;
    if (editingPackage?.id === pkg.id) closeForm();
    await dataService.deleteCandyBarPackage(pkg.id);
    await fetchPackages();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState) return;

    const parsed = packageSchema.safeParse(formState);
    const composition = parseComposition(formState.compositionText);
    if (!parsed.success || composition.length === 0) {
      setFormError('Skontrolujte údaje balíčka a zloženie vo formáte „názov | množstvo".');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const values: CandyBarPackageFormValues = {
      name: parsed.data.name,
      guestCount: parsed.data.guestCount,
      totalPieces: parsed.data.totalPieces,
      dessertTypeCount: parsed.data.dessertTypeCount,
      price: parsed.data.price,
      composition,
      imageUrl: editingPackage?.imageUrl,
    };

    try {
      if (editingPackage) {
        await dataService.updateCandyBarPackage(editingPackage.id, values);
      } else {
        await dataService.addCandyBarPackage(values);
      }
      closeForm();
      await fetchPackages();
    } catch {
      setFormError('Balíček sa nepodarilo uložiť. Skúste to prosím znova.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
      </div>
    );
  }

  if (formState) {
    const isNew = !editingPackage;
    return (
      <form onSubmit={handleSubmit} className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-600">
              {isNew ? 'Nový balíček' : 'Upraviť balíček'}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-cocoa-950">
              {isNew ? 'Pridať candy bar balíček' : editingPackage!.name}
            </h2>
          </div>
          <button type="button" className="rounded-full p-2 text-cocoa-500 hover:bg-cream-100 hover:text-cocoa-900" onClick={closeForm}>
            <span className="sr-only">Zavrieť formulár</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Názov</span>
            <input required value={formState.name} onChange={(event) => updateField('name', event.target.value)} className={inputClass} placeholder="Candy bar XL" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Pre koľko hostí</span>
            <input required value={formState.guestCount} onChange={(event) => updateField('guestCount', event.target.value)} className={inputClass} placeholder="20 hostí" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Cena v EUR</span>
            <input required type="number" min="0" step="0.01" value={formState.price} onChange={(event) => updateField('price', event.target.value)} className={inputClass} placeholder="200" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Počet kusov</span>
            <input required type="number" min="1" value={formState.totalPieces} onChange={(event) => updateField('totalPieces', event.target.value)} className={inputClass} placeholder="100" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Počet druhov</span>
            <input required type="number" min="1" value={formState.dessertTypeCount} onChange={(event) => updateField('dessertTypeCount', event.target.value)} className={inputClass} placeholder="8" />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Zloženie balíčka</span>
            <textarea
              rows={8}
              value={formState.compositionText}
              onChange={(event) => updateField('compositionText', event.target.value)}
              className={inputClass}
              placeholder="Tartaletky (2 druhy) | 10 + 10 ks"
            />
            <span className="mt-1 block text-xs text-cocoa-500">Každý riadok: názov položky | množstvo.</span>
          </label>
        </div>

        {formError && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{formError}</p>}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={closeForm}>
            Zrušiť
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSaving ? 'Ukladám…' : isNew ? 'Pridať balíček' : 'Uložiť balíček'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-3xl font-bold text-cocoa-950">Candy bar balíčky</h2>
          <p className="mt-1 text-sm text-cocoa-500">Pridávajte, upravujte a skrývajte balíčky podľa cenníka.</p>
        </div>
        <Button type="button" onClick={startCreating}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Pridať balíček
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-cream-400 bg-white p-12 text-center">
          <PackageCheck className="mx-auto mb-4 h-12 w-12 text-cream-400" aria-hidden="true" />
          <p className="font-semibold text-cocoa-700">Zatiaľ nie sú pridané žiadne balíčky.</p>
          <Button type="button" className="mt-5" onClick={startCreating}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Pridať prvý balíček
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-cream-300 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="bg-cream-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Balíček</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Hostia</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Obsah</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Cena</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Stav</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Akcie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className={`hover:bg-cream-50/70 ${pkg.hidden ? 'opacity-70' : ''}`}>
                    <td className="px-5 py-4">
                      <p className="font-bold text-cocoa-950">{pkg.name}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-cocoa-600">{pkg.guestCount}</td>
                    <td className="px-5 py-4 text-sm text-cocoa-600">
                      {pkg.totalPieces} ks · {pkg.dessertTypeCount} druhov
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-cocoa-900">{formatCurrency(pkg.price)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          pkg.hidden ? 'bg-cocoa-100 text-cocoa-700' : 'bg-sage-50 text-sage-700'
                        }`}
                      >
                        {pkg.hidden ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                            Skryté
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            Viditeľné
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-full p-2 text-cocoa-500 transition hover:bg-cream-100 hover:text-cocoa-900"
                          onClick={() => startEditing(pkg)}
                          title="Upraviť"
                        >
                          <span className="sr-only">Upraviť balíček</span>
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="rounded-full p-2 text-cocoa-500 transition hover:bg-cream-100 hover:text-cocoa-900"
                          onClick={() => toggleHidden(pkg)}
                          title={pkg.hidden ? 'Zobraziť na webe' : 'Skryť z webu'}
                        >
                          <span className="sr-only">{pkg.hidden ? 'Zobraziť' : 'Skryť'}</span>
                          {pkg.hidden ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
                        </button>
                        <button
                          type="button"
                          className="rounded-full p-2 text-cocoa-500 transition hover:bg-red-50 hover:text-red-700"
                          onClick={() => deletePackage(pkg)}
                          title="Zmazať"
                        >
                          <span className="sr-only">Zmazať balíček</span>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManager;
