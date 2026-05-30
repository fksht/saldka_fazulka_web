import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Loader2, Mail, MessageSquare, Phone, Send, User, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import OrderSummary from '../order/OrderSummary';
import { OrderDraft, OrderItem, PickupMode } from '../../types';
import { Button } from '../ui/Button';

const MIN_LEAD_DAYS = 5;

const formatDateInput = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const getMinDeliveryDate = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  now.setDate(now.getDate() + MIN_LEAD_DAYS);
  return formatDateInput(now);
};

const isValidPhone = (value: string) => {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  return /^[+\d\s().-]+$/.test(trimmed) && digits.length >= 9 && digits.length <= 15;
};

const baseSchemaShape = {
  customerName: z.string().trim().min(2, 'Zadajte meno a priezvisko'),
  customerEmail: z.string().trim().email('Zadajte platný email'),
  customerPhone: z.string().trim().refine(isValidPhone, 'Zadajte platné telefónne číslo'),
  eventType: z.string().optional(),
  servings: z.coerce.number().min(1, 'Počet porcií musí byť aspoň 1').max(500, 'Pre väčšie objednávky napíšte počet do poznámky').optional().or(z.literal('')),
  note: z.string().max(1200, 'Poznámka je príliš dlhá').optional(),
};

const buildSchema = (requiresPickup: boolean) => {
  if (!requiresPickup) {
    return z.object({
      ...baseSchemaShape,
      pickupDate: z.string().optional(),
      pickupMode: z.enum(['pickup-kosice', 'delivery-agreed']).optional(),
    });
  }
  return z.object({
    ...baseSchemaShape,
    pickupDate: z
      .string()
      .min(1, 'Vyberte dátum vyzdvihnutia / udalosti')
      .refine(
        (value) => value >= getMinDeliveryDate(),
        `Najskorší možný termín je ${MIN_LEAD_DAYS} dní od dnes (5 – 7 dní pred udalosťou ideálne).`,
      ),
    pickupMode: z.enum(['pickup-kosice', 'delivery-agreed']),
  });
};

type FormData = z.infer<ReturnType<typeof buildSchema>>;

type OrderFormProps = {
  items: OrderItem[];
  total: number;
  onSubmit: (data: OrderDraft) => Promise<void>;
  onCancel: () => void;
};

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-4 py-3 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100';

const iconInputClass =
  'w-full rounded-lg border border-cream-200 bg-white py-3 pl-11 pr-4 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100';

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-sm font-medium text-red-600">{message}</p> : null;

const OrderForm = ({ items, total, onSubmit, onCancel }: OrderFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasCustomCake = items.some((item) => item.kind === 'custom-cake');
  // The servings/guests field is only relevant for the bigger "individual" cake size.
  const hasIndividualSizeCake = items.some((item) => item.cakeConfiguration?.sizeId === 'size-individualna');
  const isTastingOnly = items.length > 0 && items.every((item) => item.kind === 'tasting');
  const requiresPickup = !isTastingOnly;

  const schema = useMemo(() => buildSchema(requiresPickup), [requiresPickup]);
  const minDate = useMemo(() => getMinDeliveryDate(), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventType: '',
      pickupMode: requiresPickup ? 'pickup-kosice' : undefined,
      note: '',
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        pickupDate: requiresPickup ? data.pickupDate : undefined,
        pickupMode: requiresPickup ? (data.pickupMode as PickupMode) : undefined,
        eventType: data.eventType || undefined,
        servings: typeof data.servings === 'number' ? data.servings : undefined,
        note: data.note || undefined,
        items,
        estimatedTotal: total,
      });
    } catch {
      setSubmitError('Objednávku sa nepodarilo odoslať. Skúste to prosím znova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-8 lg:grid-cols-[1fr_0.86fr]">
      <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Nezáväzná objednávka</p>
          <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-cocoa-950">Kontaktné údaje a vaša predstava</h2>
          <p className="mt-3 text-sm leading-6 text-cocoa-600">
            Po odoslaní vám príde rekapitulácia na email. Objednávka je potvrdená až po našej vzájomnej dohode.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Meno a priezvisko</span>
            <span className="relative block">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
              <input {...register('customerName')} className={iconInputClass} placeholder="Jana Nováková" autoComplete="name" />
            </span>
            <FieldError message={errors.customerName?.message} />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Email</span>
            <span className="relative block">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
              <input {...register('customerEmail')} className={iconInputClass} placeholder="jana@priklad.sk" autoComplete="email" />
            </span>
            <FieldError message={errors.customerEmail?.message} />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Telefón</span>
            <span className="relative block">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
              <input {...register('customerPhone')} className={iconInputClass} placeholder="+421 9xx xxx xxx" autoComplete="tel" />
            </span>
            <FieldError message={errors.customerPhone?.message} />
          </label>

          {requiresPickup && (
            <>
              <label>
                <span className="mb-1 block text-sm font-semibold text-cocoa-700">Dátum udalosti / vyzdvihnutia</span>
                <span className="relative block">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
                  <input type="date" min={minDate} {...register('pickupDate')} className={iconInputClass} />
                </span>
                <span className="mt-1 block text-xs text-cocoa-500">
                  Najskorší možný termín je {MIN_LEAD_DAYS} dní od dnes. Pre torty a candy bary odporúčam 4 – 8 týždňov vopred.
                </span>
                <FieldError message={errors.pickupDate?.message} />
              </label>

              <label>
                <span className="mb-1 block text-sm font-semibold text-cocoa-700">Spôsob prevzatia</span>
                <select {...register('pickupMode')} className={inputClass}>
                  <option value="pickup-kosice">Vyzdvihnutie v Košiciach po dohode</option>
                  <option value="delivery-agreed">Doručenie / candy bar servis (dohodou)</option>
                </select>
              </label>
            </>
          )}

          {isTastingOnly && (
            <p className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-sm leading-6 text-cocoa-700">
              Termín ochutnávky ste si vybrali pri pridaní do dopytu — finálny dátum doladím po našom kontakte.
            </p>
          )}

          {hasCustomCake && (
            <label>
              <span className="mb-1 block text-sm font-semibold text-cocoa-700">Typ udalosti</span>
              <select {...register('eventType')} className={inputClass}>
                <option value="">Vyberte možnosť</option>
                <option>Svadba</option>
                <option>Oslava / narodeniny</option>
                <option>Krstiny</option>
                <option>Firemné pohostenie</option>
                <option>Darček</option>
                <option>Iné</option>
              </select>
            </label>
          )}

          {hasIndividualSizeCake && (
            <label>
              <span className="mb-1 block text-sm font-semibold text-cocoa-700">Počet porcií / hostí</span>
              <span className="relative block">
                <Users className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
                <input type="number" min={1} {...register('servings')} className={iconInputClass} placeholder="napr. 40" />
              </span>
              <FieldError message={errors.servings?.message} />
            </label>
          )}

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Poznámka / predstava</span>
            <span className="relative block">
              <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-cocoa-400" aria-hidden="true" />
              <textarea
                {...register('note')}
                rows={5}
                className="w-full rounded-lg border border-cream-200 bg-white py-3 pl-11 pr-4 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                placeholder="Alergie, farby, téma oslavy, text na tortu, čas vyzdvihnutia…"
              />
            </span>
            <FieldError message={errors.note?.message} />
          </label>
        </div>

        {submitError && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{submitError}</p>}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Späť na košík
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            Odoslať nezáväznú objednávku
          </Button>
        </div>
      </div>

      <OrderSummary items={items} />
    </form>
  );
};

export default OrderForm;
