import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Heart, Link as LinkIcon, Loader2, Mail, MessageSquare, Phone, Send, User, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { OrderDraft, OrderItem } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Button } from '../ui/Button';

const schema = z.object({
  customerName: z.string().min(2, 'Zadajte meno a priezvisko'),
  customerEmail: z.string().email('Zadajte platný email'),
  customerPhone: z.string().min(9, 'Zadajte platné telefónne číslo'),
  pickupDate: z.string().min(1, 'Vyberte dátum vyzdvihnutia alebo dodania'),
  eventType: z.string().optional(),
  servings: z.coerce.number().min(1, 'Počet porcií musí byť aspoň 1').max(300, 'Pre väčšie objednávky napíšte počet do poznámky').optional().or(z.literal('')),
  preferredFlavor: z.string().optional(),
  inspirationUrl: z.string().url('Zadajte platný odkaz alebo pole nechajte prázdne').optional().or(z.literal('')),
  note: z.string().max(1200, 'Poznámka je príliš dlhá').optional(),
});

type FormData = z.infer<typeof schema>;

type OrderFormProps = {
  items: OrderItem[];
  total: number;
  hasCustomPricing: boolean;
  onSubmit: (data: OrderDraft) => Promise<void>;
  onCancel: () => void;
};

const inputClass =
  'w-full rounded-lg border border-cream-300 bg-white px-4 py-3 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100';

const iconInputClass =
  'w-full rounded-lg border border-cream-300 bg-white py-3 pl-11 pr-4 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100';

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-sm font-medium text-red-600">{message}</p> : null;

const OrderForm = ({ items, total, hasCustomPricing, onSubmit, onCancel }: OrderFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventType: '',
      preferredFlavor: '',
      inspirationUrl: '',
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
        pickupDate: data.pickupDate,
        eventType: data.eventType || undefined,
        servings: typeof data.servings === 'number' ? data.servings : undefined,
        preferredFlavor: data.preferredFlavor || undefined,
        inspirationUrl: data.inspirationUrl || undefined,
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
      <div className="rounded-lg border border-cream-300 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">Nezáväzná objednávka</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-cocoa-950">Kontaktné údaje a predstava</h2>
          <p className="mt-3 text-sm leading-6 text-cocoa-600">
            Po odoslaní príde rekapitulácia na email. Objednávka je potvrdená až po vzájomnej dohode.
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
              <input {...register('customerPhone')} className={iconInputClass} placeholder="09xx xxx xxx" autoComplete="tel" />
            </span>
            <FieldError message={errors.customerPhone?.message} />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Dátum vyzdvihnutia / dodania</span>
            <span className="relative block">
              <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
              <input type="date" {...register('pickupDate')} className={iconInputClass} />
            </span>
            <FieldError message={errors.pickupDate?.message} />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Typ udalosti</span>
            <select {...register('eventType')} className={inputClass}>
              <option value="">Vyberte možnosť</option>
              <option>Narodeniny</option>
              <option>Svadba</option>
              <option>Krstiny</option>
              <option>Firemné pohostenie</option>
              <option>Darček</option>
              <option>Iné</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Počet porcií</span>
            <span className="relative block">
              <Users className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
              <input type="number" min={1} {...register('servings')} className={iconInputClass} placeholder="napr. 12" />
            </span>
            <FieldError message={errors.servings?.message} />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Preferovaná príchuť</span>
            <span className="relative block">
              <Heart className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
              <input {...register('preferredFlavor')} className={iconInputClass} placeholder="čokoláda, ovocie, vanilka..." />
            </span>
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Odkaz na inšpiráciu</span>
            <span className="relative block">
              <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
              <input {...register('inspirationUrl')} className={iconInputClass} placeholder="https://..." />
            </span>
            <FieldError message={errors.inspirationUrl?.message} />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Poznámka / predstava</span>
            <span className="relative block">
              <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-cocoa-400" aria-hidden="true" />
              <textarea
                {...register('note')}
                rows={5}
                className="w-full rounded-lg border border-cream-300 bg-white py-3 pl-11 pr-4 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                placeholder="Alergie, farby, téma oslavy, text na tortu, čas vyzdvihnutia..."
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
            Odoslať dopyt
          </Button>
        </div>
      </div>

      <aside className="h-fit rounded-lg border border-cream-300 bg-cream-50 p-5 sm:p-7">
        <h3 className="font-serif text-2xl font-bold text-cocoa-950">Rekapitulácia</h3>
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex items-start justify-between gap-4 border-b border-cream-300 pb-4 last:border-b-0">
              <div>
                <p className="font-semibold text-cocoa-900">{item.productName}</p>
                <p className="text-sm text-cocoa-500">{item.quantity} ks</p>
              </div>
              <p className="text-right text-sm font-bold text-cocoa-900">
                {item.unitPrice ? formatCurrency(item.unitPrice * item.quantity) : 'po dohode'}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-cream-300 pt-5">
          <span className="font-bold text-cocoa-950">Predpokladaná suma</span>
          <span className="font-serif text-2xl font-bold text-cocoa-900">
            {total > 0 ? formatCurrency(total) : 'po dohode'}
          </span>
        </div>

        <div className="mt-5 rounded-lg border border-cream-300 bg-white p-4 text-sm leading-6 text-cocoa-600">
          {hasCustomPricing
            ? 'Objednávka obsahuje položku s individuálnou cenou. Cena bude potvrdená po dohode.'
            : 'Suma je orientačná. Finálne detaily a termín budú potvrdené po dohode.'}
        </div>
      </aside>
    </form>
  );
};

export default OrderForm;
