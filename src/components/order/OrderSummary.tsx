import { ShoppingBasket } from 'lucide-react';
import { OrderItem } from '../../types';
import {
  formatOrderEstimatedTotal,
  formatOrderItemLinePrice,
  getOrderPricingSummary,
} from '../../utils/orderPricing';

type OrderSummaryProps = {
  items: OrderItem[];
  title?: string;
  className?: string;
};

const OrderSummary = ({ items, title = 'Rekapitulácia', className = '' }: OrderSummaryProps) => {
  const pricing = getOrderPricingSummary(items);

  return (
    <aside className={`h-fit rounded-2xl border border-cream-200 bg-cream-50 p-5 sm:p-7 ${className}`}>
      <h3 className="font-display text-2xl font-semibold text-cocoa-950">{title}</h3>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="border-b border-cream-200 pb-4 last:border-b-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-1 items-start gap-3">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-14 w-14 flex-none rounded-xl object-contain bg-white p-1 ring-1 ring-cream-200"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-white ring-1 ring-cream-200">
                    <ShoppingBasket className="h-5 w-5 text-cocoa-300" aria-hidden="true" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-cocoa-900">{item.productName}</p>
                  {item.selectedOptions && item.selectedOptions.length > 0 ? (
                    <p className="text-xs font-semibold text-rose-700">
                      {item.selectedOptions.map((option) => `${option.label}: ${option.value}`).join(' · ')}
                    </p>
                  ) : (
                    item.variant && (
                      <p className="text-xs font-semibold text-rose-700">
                        {item.variantLabel ? `${item.variantLabel}: ` : ''}{item.variant}
                      </p>
                    )
                  )}
                  <p className="text-sm text-cocoa-500">
                    {item.quantity} × {item.unitLabel ?? 'ks'}
                  </p>
                </div>
              </div>
              <p className="text-right text-sm font-bold text-cocoa-900">{formatOrderItemLinePrice(item)}</p>
            </div>
            {item.tastingDetails && (
              <ul className="mt-2 space-y-1 rounded-lg bg-rose-50/60 p-3 text-xs text-cocoa-600">
                {item.tastingDetails.selections && item.tastingDetails.selections.length > 0 && (
                  <li>
                    · {item.tastingDetails.selectionLabel ?? 'Výber'}:{' '}
                    <strong className="text-cocoa-800">{item.tastingDetails.selections.join('; ')}</strong>
                  </li>
                )}
                {item.tastingDetails.preferredDate && (
                  <li>· Termín: <strong className="text-cocoa-800">{item.tastingDetails.preferredDate}</strong></li>
                )}
                {item.tastingDetails.note && <li>· Poznámka: {item.tastingDetails.note}</li>}
              </ul>
            )}
            {item.cakeConfiguration && (
              <ul className="mt-2 space-y-1 rounded-lg bg-white p-3 text-xs text-cocoa-600">
                <li>
                  · Korpus:{' '}
                  <strong className="text-cocoa-800">
                    {item.cakeConfiguration.baseName}
                    {item.cakeConfiguration.baseVariant ? ` (${item.cakeConfiguration.baseVariant})` : ''}
                  </strong>
                </li>
                <li>
                  · Krémy: <strong className="text-cocoa-800">{item.cakeConfiguration.creamNames.join('; ')}</strong>
                </li>
                <li>
                  · Veľkosť:{' '}
                  <strong className="text-cocoa-800">
                    {item.cakeConfiguration.sizeName} — {item.cakeConfiguration.sizePortions}
                  </strong>
                </li>
                {item.cakeConfiguration.fillingNames && item.cakeConfiguration.fillingNames.length > 0 && (
                  <li>
                    · Doplnky: <strong className="text-cocoa-800">{item.cakeConfiguration.fillingNames.join(', ')}</strong>
                  </li>
                )}
                {item.cakeConfiguration.extras && item.cakeConfiguration.extras.length > 0 && (
                  <li>
                    · Špeciálne: <strong className="text-emerald-700">{item.cakeConfiguration.extras.join(', ')}</strong>
                  </li>
                )}
                {item.cakeConfiguration.note && <li>· Poznámka: {item.cakeConfiguration.note}</li>}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-cream-200 pt-5">
        <span className="font-bold text-cocoa-950">{pricing.hasCustomPricing ? 'Predpokladaná suma' : 'Celková suma'}</span>
        <span className="font-display text-2xl font-semibold text-cocoa-900">{formatOrderEstimatedTotal(pricing)}</span>
      </div>

      <div className="mt-5 rounded-lg border border-cream-200 bg-white p-4 text-sm leading-6 text-cocoa-600">
        {pricing.hasCustomPricing
          ? 'Niektoré položky majú cenu „od" alebo individuálnu. Finálna cena bude potvrdená po dohode.'
          : 'Finálne detaily a termín potvrdím po dohode.'}
      </div>
    </aside>
  );
};

export default OrderSummary;
