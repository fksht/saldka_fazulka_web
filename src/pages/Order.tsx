import { useState } from 'react';
import { ArrowRight, CheckCircle2, Minus, Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderForm from '../components/forms/OrderForm';
import { Button, ButtonLink } from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { dataService } from '../services/dataService';
import { emailService } from '../services/emailService';
import { OrderDraft } from '../types';
import { formatCurrency } from '../utils/format';

const OrderPage = () => {
  const { items, total, hasCustomPricing, removeItem, updateQuantity, updateNote, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'form' | 'success'>('cart');
  const [orderId, setOrderId] = useState<string>('');

  const handleOrderSubmit = async (draft: OrderDraft) => {
    const order = await dataService.createOrder(draft);
    await emailService.sendOrderEmails(order);
    setOrderId(order.id);
    clearCart();
    setStep('success');
  };

  if (step === 'success') {
    return (
      <main className="bg-cream-50 px-4 py-20 sm:px-6">
        <section className="mx-auto max-w-2xl rounded-lg border border-cream-300 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage-50 text-sage-700">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">Dopyt odoslaný</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-cocoa-950">Ďakujeme za objednávku</h1>
          <p className="mt-5 leading-7 text-cocoa-600">
            Číslo požiadavky je <strong className="text-cocoa-900">{orderId}</strong>. Rekapitulácia bola pripravená pre emailový
            tok a objednávka bude potvrdená až po vzájomnej dohode.
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
      <section className="border-b border-cream-300 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">Objednávka / dopyt</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-cocoa-950 sm:text-5xl">Nezáväzná objednávka sladkostí</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-cocoa-600">
            Vyberte produkty, doplňte predstavu a odošlite dopyt. Platba zatiaľ neprebieha online.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {step === 'cart' ? (
            <div className="space-y-6">
              {items.length > 0 ? (
                <>
                  <div className="overflow-hidden rounded-lg border border-cream-300 bg-white shadow-sm">
                    <div className="divide-y divide-cream-200">
                      {items.map((item) => (
                        <div key={item.productId} className="p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h2 className="text-lg font-bold text-cocoa-950">{item.productName}</h2>
                              <p className="mt-1 text-sm text-cocoa-500">
                                {item.unitPrice ? `${formatCurrency(item.unitPrice)} / ks` : 'Cena bude potvrdená po dohode'}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center rounded-full border border-cream-300 bg-cream-50 p-1">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-cocoa-700 hover:bg-white"
                                >
                                  <span className="sr-only">Znížiť počet</span>
                                  <Minus className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <span className="w-8 text-center font-bold text-cocoa-900">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-cocoa-700 hover:bg-white"
                                >
                                  <span className="sr-only">Zvýšiť počet</span>
                                  <Plus className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </div>
                              <p className="w-24 text-right font-bold text-cocoa-950">
                                {item.unitPrice ? formatCurrency(item.unitPrice * item.quantity) : 'po dohode'}
                              </p>
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId)}
                                className="rounded-full p-2 text-cocoa-400 hover:bg-red-50 hover:text-red-700"
                              >
                                <span className="sr-only">Odstrániť položku</span>
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>

                          <label className="mt-4 block">
                            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Poznámka k položke</span>
                            <input
                              value={item.note ?? ''}
                              onChange={(event) => updateNote(item.productId, event.target.value)}
                              className="w-full rounded-lg border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                              placeholder="Napr. bez orechov, farba dekoru, text na cupcake..."
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-5 rounded-lg border border-cream-300 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">Predpokladaná suma</p>
                      <p className="mt-1 font-serif text-3xl font-bold text-cocoa-950">
                        {total > 0 ? formatCurrency(total) : 'Cena po dohode'}
                      </p>
                      {hasCustomPricing && (
                        <p className="mt-1 text-sm text-cocoa-500">Niektoré položky majú individuálnu cenu.</p>
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
                <div className="rounded-lg border border-dashed border-cream-400 bg-white p-12 text-center">
                  <ShoppingBasket className="mx-auto mb-5 h-12 w-12 text-cream-400" aria-hidden="true" />
                  <h2 className="font-serif text-3xl font-bold text-cocoa-950">Dopyt je zatiaľ prázdny</h2>
                  <p className="mx-auto mt-3 max-w-md text-cocoa-600">
                    Vyberte si z ponuky alebo pridajte tortu na mieru a potom doplňte kontaktné údaje.
                  </p>
                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <ButtonLink to="/ponuka">
                      Pozrieť ponuku
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </ButtonLink>
                    <Link to="/kontakt" className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-cocoa-700 hover:bg-cream-100">
                      Kontaktovať cukrárku
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <OrderForm
              items={items}
              total={total}
              hasCustomPricing={hasCustomPricing}
              onCancel={() => setStep('cart')}
              onSubmit={handleOrderSubmit}
            />
          )}
        </div>
      </section>
    </main>
  );
};

export default OrderPage;
