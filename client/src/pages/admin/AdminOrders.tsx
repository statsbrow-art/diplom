import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import type { Order } from '../../types';
import { formatDateTime, formatPrice } from '../../utils';

export default function AdminOrders() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);

  function load() {
    api.get('/admin/orders').then((res) => setOrders(res.data.orders));
  }
  useEffect(load, []);

  async function cancel(id: string) {
    if (!confirm('?')) return;
    await api.post(`/admin/orders/${id}/cancel`);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('admin.orders')}</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <div className="text-xs text-slate-600">
                  {t('orders.orderId')} #{o.id.slice(-8).toUpperCase()}
                </div>
                <div className="text-sm">
                  <strong>{o.user?.name}</strong>{' '}
                  <span className="text-slate-500">({o.user?.email})</span>
                </div>
                <div className="text-xs text-slate-600">
                  {formatDateTime(o.createdAt, i18n.language)}
                </div>
              </div>
              <div className="flex items-center gap-3">
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
                  <button onClick={() => cancel(o.id)} className="btn-danger text-xs px-2 py-1">
                    {t('admin.cancelOrder')}
                  </button>
                )}
              </div>
            </div>
            <ul className="text-sm divide-y divide-brand-100">
              {o.items.map((it) => (
                <li key={it.id} className="py-1.5 flex justify-between gap-2">
                  <span>
                    {it.ticketType?.event?.title} • {it.ticketType?.sector?.name} •{' '}
                    {t('orders.row')} {it.seatRow}, {t('orders.seat')} {it.seatNumber}
                  </span>
                  <span className="font-mono text-xs bg-brand-50 px-2 py-0.5 rounded">
                    {it.ticketCode}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
