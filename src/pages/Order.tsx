import { useState } from 'react';
import { ArrowRight, CheckCircle2, Heart, Minus, Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderForm from '../components/forms/OrderForm';
import { Button, ButtonLink } from '../components/ui/Button';
import GoldDivider from '../components/ui/GoldDivider';
import { useCart } from '../context/CartContext';
import { dataService } from '../services/dataService';
import { emailService } from '../services/emailService';
import { OrderDraft } from '../types';
import { formatOrderEstimatedTotal, formatOrderItemLinePrice, formatOrderItemUnitPrice } from '../utils/orderPricing';

const OrderPage = () => {
  const { items, total, hasCustomPricing, removeItem, updateQuantity, updateNote, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'form' | 'success'>('cart');
  const [orderId, setOrderId] = useState<string>('');

  const handleOrderSubmit = async (draft: OrderDraft) => {
    const order = await dataService.createOrder(draft);
    // The reliable notification is sent server-side by a Supabase webhook when
    // the order row is inserted. This frontend call is a best-effort fallback
    // (used only if VITE_EMAIL_ENDPOINT is set) and must never block the order.
    try {
      await emailService.sendOrderEmails(order);
    } catch (error) {
      console.warn('Email notification skipped (handled server-side):', error);
    }
    setOrderId(order.id);
    clearCart();
    setStep('success');
  };

  if (step === 'success') {
    return (
      <main className="bg-cream-50 px-4 py-20 sm:px-6">
        <section className="mx-auto max-w-2xl rounded-3xl border border-cream-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage-50 text-sage-700">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Dopyt odoslaný</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-cocoa-950 sm:text-5xl">Ďakujeme za objednávku</h1>
          <div className="mt-5">
            <GoldDivider />
          </div>
          <p className="mt-6 leading-8 text-cocoa-700">
            Vaše číslo požiadavky je <strong className="text-cocoa-900">{orderId}</strong>.
          </p>
          <p className="mt-2 leading-7 text-cocoa-600">
            Rekapituláciu posielam na váš email. Ozvem sa vám čo najskôr — objednávka je potvrdená až po vzájomnej dohode.
          </p>
          <ButtonLink to="/" className="mt-8">
            Späť na úvod
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-cream-50">
      <section className="relative overflow-hidden border-b border-cream-200 bg-white py-14 sm:py-20">
        <div className="watercolor-wash absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Objednávka / dopyt</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] text-cocoa-950 sm:text-5xl">
            Nezáväzná objednávka sladkostí
          </h1>
          <div className="mt-5">
            <GoldDivider />
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-cocoa-600 sm:text-lg sm:leading-8">
            Vyberte produkty, doplňte svoju predstavu a odošlite dopyt. Platba zatiaľ neprebieha online — termín a finálnu cenu si potvrdíme osobne.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {step === 'cart' ? (
            <div className="space-y-6">
              {items.length > 0 ? (
                <>
                  <div className="overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-sm">
                    <div className="divide-y divide-cream-200">
                      {items.map((item) => (
                        <div key={item.productId} className="p-5 sm:p-6">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 flex-1 items-start gap-4">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="h-20 w-20 flex-none rounded-2xl object-contain bg-cream-50 p-1.5 ring-1 ring-cream-200 sm:h-24 sm:w-24"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-20 w-20 flex-none items-center justify-center rounded-2xl bg-cream-50 ring-1 ring-cream-200 sm:h-24 sm:w-24">
                                  <ShoppingBasket className="h-7 w-7 text-cocoa-300" aria-hidden="true" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h2 className="font-display text-lg font-semibold text-cocoa-950">{item.productName}</h2>
                                {item.variant && (
                                  <p className="mt-1 text-sm font-semibold text-rose-700">
                                    {item.variantLabel ? `${item.variantLabel}: ` : ''}{item.variant}
                                  </p>
                                )}
                                <p className="mt-1 text-sm text-cocoa-500">{formatOrderItemUnitPrice(item)}</p>
                                {item.tastingDetails && (
                                  <ul className="mt-3 space-y-1 rounded-xl bg-rose-50/60 p-3 text-xs text-cocoa-600">
                                    {item.tastingDetails.selections && item.tastingDetails.selections.length > 0 && (
                                      <li>
                                        · {item.tastingDetails.selectionLabel ?? 'Výber'}:{' '}
                                        <strong className="text-cocoa-800">{item.tastingDetails.selections.join('; ')}</strong>
                                      </li>
                                    )}
                                    {item.tastingDetails.preferredDate && (
                                      <li>· Preferovaný termín: <strong className="text-cocoa-800">{item.tastingDetails.preferredDate}</strong></li>
                                    )}
                                    {item.tastingDetails.note && (
                                      <li>· Poznámka: {item.tastingDetails.note}</li>
                                    )}
                                  </ul>
                                )}
                                {item.cakeConfiguration && (
                                  <ul className="mt-3 space-y-1 rounded-xl bg-cream-50 p-3 text-xs text-cocoa-600">
                                    <li>· Korpus: <strong className="text-cocoa-800">{item.cakeConfiguration.baseName}{item.cakeConfiguration.baseVariant ? ` (${item.cakeConfiguration.baseVariant})` : ''}</strong></li>
                                    <li>· Krémy: <strong className="text-cocoa-800">{item.cakeConfiguration.creamNames.join('; ')}</strong></li>
                                    <li>· Veľkosť: <strong className="text-cocoa-800">{item.cakeConfiguration.sizeName} — {item.cakeConfiguration.sizePortions}</strong></li>
                                    {item.cakeConfiguration.extras && item.cakeConfiguration.extras.length > 0 && (
                                      <li>· Špeciálne: <strong className="text-emerald-700">{item.cakeConfiguration.extras.join(', ')}</strong></li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center rounded-full border border-cream-200 bg-cream-50 p-1">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  disabled={item.quantity <= (item.minimumOrderQuantity ?? 1)}
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-cocoa-700 transition hover:bg-white disabled:pointer-events-none disabled:opacity-35"
                                >
                                  <span className="sr-only">Znížiť počet</span>
                                  <Minus className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <span className="w-10 text-center font-bold text-cocoa-900">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-cocoa-700 transition hover:bg-white"
                                >
                                  <span className="sr-only">Zvýšiť počet</span>
                                  <Plus className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </div>
                              <p className="w-24 text-right font-display text-lg font-semibold text-cocoa-950">{formatOrderItemLinePrice(item)}</p>
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId)}
                                className="rounded-full p-2 text-cocoa-400 transition hover:bg-red-50 hover:text-red-700"
                              >
                                <span className="sr-only">Odstrániť položku</span>
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>

                          {item.kind === 'custom-cake' && (
                            <label className="mt-4 block">
                              <span className="mb-1 block text-sm font-semibold text-cocoa-700">Poznámka k torte</span>
                              <input
                                value={item.note ?? ''}
                                onChange={(event) => updateNote(item.productId, event.target.value)}
                                className="w-full rounded-lg border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                                placeholder="Napr. farba dekoru, téma, text na tortu…"
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-5 rounded-3xl border border-cream-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-600">
                        {hasCustomPricing ? 'Predpokladaná suma' : 'Celková suma'}
                      </p>
                      <p className="mt-1 font-display text-4xl font-semibold text-cocoa-950">
                        {formatOrderEstimatedTotal({ estimatedTotal: total, hasCustomPricing })}
                      </p>
                      {hasCustomPricing && (
                        <p className="mt-1 text-sm text-cocoa-500">Niektoré položky majú cenu „od" alebo individuálnu.</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <ButtonLink to="/ponuka" variant="secondary">
                        Pridať ďalšie
                      </ButtonLink>
                      <Button type="button" onClick={() => setStep('form')}>
                        Pokračovať
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-cream-300 bg-white p-12 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                    <Heart className="h-7 w-7 fill-rose-200 text-rose-500" aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-3xl font-semibold text-cocoa-950">Dopyt je zatiaľ prázdny</h2>
                  <p className="mx-auto mt-3 max-w-md leading-7 text-cocoa-600">
                    Pridajte si zákusky z ponuky, candy bar balíček alebo si vyskladajte tortu na mieru.
                  </p>
                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <ButtonLink to="/ponuka">
                      Pozrieť ponuku
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </ButtonLink>
                    <ButtonLink to="/torty-na-mieru" variant="secondary">
                      Konfigurátor torty
                    </ButtonLink>
                    <Link
                      to="/kontakt"
                      className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-cocoa-700 transition hover:bg-cream-100"
                    >
                      Kontaktovať Zuzku
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <OrderForm
              items={items}
              total={total}
              onCancel={() => setStep('cart')}
              onSubmit={handleOrderSubmit}
            />
          )}
        </div>
      </section>

      {step === 'cart' && items.length > 0 && (
        <section className="pb-16">
          <div className="mx-auto max-w-5xl rounded-3xl bg-cream-100/60 px-6 py-8 text-center sm:px-10">
            <p className="text-sm leading-7 text-cocoa-700">
              <ShoppingBasket className="mr-2 inline h-4 w-4 text-rose-500" aria-hidden="true" />
              Po odoslaní vám príde rekapitulácia na email. <strong className="text-cocoa-900">Objednávka je potvrdená až po vzájomnej dohode.</strong>
            </p>
          </div>
        </section>
      )}
    </main>
  );
};

export default OrderPage;
