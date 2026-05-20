import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import type { Order } from '../types';
import { formatDateTime, formatPrice } from '../utils';
import { qrImageUrl } from '../qr';

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/mine').then((res) => {
      setOrders(res.data.orders);
      setLoading(false);
    });
  }, []);

  async function refund(id: string) {
    if (!confirm(t('orders.refundConfirm'))) return;
    const { data } = await api.post(`/orders/${id}/refund`);
    setOrders((value) => value.map((order) => (order.id === id ? data.order : order)));
  }

  if (loading) return <div className="p-8 text-center text-slate-600">{t('common.loading')}</div>;
  if (orders.length === 0)
    return <div className="p-8 text-center text-slate-600">{t('orders.empty')}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('orders.myOrders')}</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <div className="text-xs text-slate-600">
                  {t('orders.orderId')} #{o.id.slice(-8).toUpperCase()}
                </div>
                <div className="text-sm text-slate-600">
                  {formatDateTime(o.createdAt, i18n.language)}
                </div>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
                <span
                  className={`badge ${
                    o.status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700'
                      : o.status === 'CANCELLED'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {o.status}
                </span>
                <span className="font-semibold">{formatPrice(o.total, i18n.language)}</span>
                {o.status === 'PAID' && (
                  <button onClick={() => refund(o.id)} className="btn-outline px-3 py-1 text-xs">
                    {t('orders.refund')}
                  </button>
                )}
              </div>
            </div>
            {o.payment && (
              <div className="mb-3 rounded-2xl border border-brand-200/10 bg-brand-50/80 p-3 text-sm text-slate-600">
                {t('orders.receipt')}: {formatPrice(o.payment.amount, i18n.language)} •{' '}
                {o.payment.cardBrand} ****{o.payment.cardLast4}
                {Number(o.payment.discount) > 0 && (
                  <>
                    {' '}
                    • {t('orders.discount')} {formatPrice(o.payment.discount, i18n.language)}
                  </>
                )}
              </div>
            )}
            <ul className="divide-y divide-brand-100">
              {o.items.map((it) => (
                <li
                  key={it.id}
                  className="py-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {it.ticketType?.event?.title}{' '}
                      <span className="text-slate-500 font-normal">
                        ({it.ticketType?.event?.venue?.name})
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {it.ticketType?.event?.startsAt &&
                        formatDateTime(it.ticketType.event.startsAt, i18n.language)}
                    </div>
                    <div className="text-sm text-slate-600 mt-0.5">
                      {it.ticketType?.sector?.name} • {t('orders.row')} {it.seatRow},{' '}
                      {t('orders.seat')} {it.seatNumber}
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between gap-3 text-right sm:w-auto">
                    <img
                      src={qrImageUrl(it.ticketCode, 96)}
                      alt={it.ticketCode}
                      className="h-20 w-20 rounded-xl bg-white p-1"
                    />
                    <div>
                    <div className="text-xs text-slate-600">{t('orders.ticketCode')}</div>
                    <div className="font-mono text-sm bg-brand-50 px-2 py-1 rounded">
                      {it.ticketCode}
                    </div>
                    {it.refunded && <div className="mt-1 text-xs text-red-700">{t('orders.refunded')}</div>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
