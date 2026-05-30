import { useEffect, useState } from 'react';
import { Calendar, Loader2, Mail, Package, Phone, RefreshCw, Trash2, User } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Order, OrderStatus } from '../../types';
import { formatDate } from '../../utils/format';
import { formatOrderEstimatedTotal, getOrderPricingSummary } from '../../utils/orderPricing';
import { Button } from '../ui/Button';

const statusLabels: Record<OrderStatus, string> = {
  new: 'Nová',
  contacted: 'Kontaktované',
  confirmed: 'Potvrdená',
  completed: 'Dokončená',
  delivered: 'Doručená',
  cancelled: 'Zrušená',
};

const statusClass: Record<OrderStatus, string> = {
  new: 'bg-blue-50 text-blue-700',
  contacted: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-sage-50 text-sage-700',
  completed: 'bg-cream-200 text-cocoa-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

const AUTO_DELETE_MS = 7 * 24 * 60 * 60 * 1000;
const autoDeleteAt = (order: Order) =>
  order.status === 'delivered' && order.deliveredAt ? new Date(order.deliveredAt).getTime() + AUTO_DELETE_MS : null;

const OrderDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    let data = await dataService.getOrders();

    // Auto-delete orders that were delivered more than 7 days ago.
    const now = Date.now();
    const expired = data.filter((order) => {
      const at = autoDeleteAt(order);
      return at !== null && now >= at;
    });
    if (expired.length > 0) {
      await Promise.all(expired.map((order) => dataService.deleteOrder(order.id).catch(() => undefined)));
      const expiredIds = new Set(expired.map((order) => order.id));
      data = data.filter((order) => !expiredIds.has(order.id));
    }

    setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await dataService.updateOrderStatus(id, status);
    await fetchOrders();
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm('Naozaj odstrániť túto objednávku? Túto akciu nie je možné vrátiť.')) return;
    setDeletingId(id);
    try {
      await dataService.deleteOrder(id);
      await fetchOrders();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-3xl font-bold text-cocoa-950">Objednávky</h2>
          <p className="mt-1 text-sm text-cocoa-500">Prehľad dopytov od zákazníkov a ich stavov.</p>
        </div>
        <Button type="button" variant="secondary" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Obnoviť
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-cream-400 bg-white p-12 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-cream-400" aria-hidden="true" />
          <p className="font-semibold text-cocoa-700">Zatiaľ nie sú žiadne objednávky.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const items = order.items ?? [];
            const pricing = getOrderPricingSummary(items);

            return (
              <article key={order.id} className="rounded-lg border border-cream-300 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-cream-100 p-3 text-cocoa-700">
                    <Package className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-cocoa-950">{order.id}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-cocoa-500">{new Date(order.createdAt).toLocaleString('sk-SK')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(event) => void updateStatus(order.id, event.target.value as OrderStatus)}
                    className="rounded-lg border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-cocoa-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void deleteOrder(order.id)}
                    disabled={deletingId === order.id}
                    aria-label="Odstrániť objednávku"
                    title="Odstrániť objednávku"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cream-300 bg-white text-cocoa-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {deletingId === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {autoDeleteAt(order) !== null && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Automaticky sa zmaže {new Date(autoDeleteAt(order) as number).toLocaleDateString('sk-SK')}
                </p>
              )}

              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 font-bold text-cocoa-900">
                    <User className="h-4 w-4 text-rose-500" aria-hidden="true" />
                    {order.customerName}
                  </p>
                  <p className="flex items-center gap-2 text-cocoa-600">
                    <Mail className="h-4 w-4 text-cocoa-400" aria-hidden="true" />
                    {order.customerEmail}
                  </p>
                  <p className="flex items-center gap-2 text-cocoa-600">
                    <Phone className="h-4 w-4 text-cocoa-400" aria-hidden="true" />
                    {order.customerPhone}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-cocoa-600">
                  <p className="flex items-center gap-2 font-bold text-cocoa-900">
                    <Calendar className="h-4 w-4 text-rose-500" aria-hidden="true" />
                    {formatDate(order.pickupDate)}
                  </p>
                  {order.eventType && <p>Udalosť: {order.eventType}</p>}
                  {order.servings && <p>Porcie: {order.servings}</p>}
                  {order.preferredFlavor && <p>Príchuť: {order.preferredFlavor}</p>}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Položky</p>
                  <div className="mt-2 space-y-1 text-sm text-cocoa-700">
                    {items.map((item) => (
                      <p key={item.productId}>
                        {item.quantity}x {item.productName}
                        {item.variant && (
                          <span className="text-rose-700">
                            {' '}— {item.variantLabel ? `${item.variantLabel}: ` : ''}{item.variant}
                          </span>
                        )}
                      </p>
                    ))}
                  </div>
                  <p className="mt-3 font-bold text-cocoa-950">
                    {formatOrderEstimatedTotal({ ...pricing, estimatedTotal: order.estimatedTotal })}
                  </p>
                </div>
              </div>

              {order.note && (
                <div className="mt-5 rounded-lg bg-cream-50 p-4 text-sm leading-6 text-cocoa-600">
                  <span className="font-bold text-cocoa-800">Poznámka:</span> {order.note}
                </div>
              )}

              {items
                .filter((item) => item.tastingDetails)
                .map((item) => (
                  <div key={`tast-${item.productId}`} className="mt-5 rounded-lg bg-rose-50/50 p-4 text-sm leading-6 text-cocoa-700">
                    <p className="font-bold text-cocoa-900">Detaily ochutnávky — {item.productName}</p>
                    {item.tastingDetails?.selections && item.tastingDetails.selections.length > 0 && (
                      <p className="mt-1">
                        <span className="font-semibold">{item.tastingDetails.selectionLabel ?? 'Výber'}:</span>{' '}
                        {item.tastingDetails.selections.join('; ')}
                      </p>
                    )}
                    {item.tastingDetails?.preferredDate && (
                      <p className="mt-1">
                        <span className="font-semibold">Preferovaný termín:</span> {item.tastingDetails.preferredDate}
                      </p>
                    )}
                    {item.tastingDetails?.note && (
                      <p className="mt-1">
                        <span className="font-semibold">Poznámka:</span> {item.tastingDetails.note}
                      </p>
                    )}
                  </div>
                ))}

              {items
                .filter((item) => item.cakeConfiguration?.inspirationImage || item.cakeConfiguration?.inspirationUrl)
                .map((item) => (
                  <div key={`insp-${item.productId}`} className="mt-5 rounded-lg bg-cream-50 p-4 text-sm leading-6 text-cocoa-600">
                    <p className="font-bold text-cocoa-800">Inšpirácia pre {item.productName}</p>
                    {item.cakeConfiguration?.inspirationUrl && (
                      <a
                        href={item.cakeConfiguration.inspirationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block break-all text-rose-700 underline"
                      >
                        {item.cakeConfiguration.inspirationUrl}
                      </a>
                    )}
                    {item.cakeConfiguration?.inspirationImage && (
                      <a
                        href={item.cakeConfiguration.inspirationImage}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block w-fit"
                      >
                        <img
                          src={item.cakeConfiguration.inspirationImage}
                          alt={`Inšpirácia k ${item.productName}`}
                          className="max-h-48 rounded-lg ring-1 ring-cream-200"
                        />
                      </a>
                    )}
                  </div>
                ))}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderDashboard;
