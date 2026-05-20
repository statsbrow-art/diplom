import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import type { Order } from '../types';
import { formatDateTime, formatPrice } from '../utils';

export default function PaymentSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/mine').then((res) => {
      setOrders(res.data.orders);
      setLoading(false);
    });
  }, []);

  if (!id) return <Navigate to="/orders" replace />;
  if (loading) return <div className="p-8 text-center text-slate-600">{t('common.loading')}</div>;

  const order = orders.find((item) => item.id === id);
  if (!order) return <Navigate to="/orders" replace />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="hero-card p-6 text-white sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-brand-100">
          {t('payment.successKicker')}
        </p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">{t('payment.successTitle')}</h1>
        <p className="mt-3 max-w-2xl text-brand-50">{t('payment.successText')}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="glass-card p-4">
            <div className="text-xs uppercase tracking-widest text-brand-100">{t('payment.orderNumber')}</div>
            <div className="mt-1 font-mono text-lg font-black">#{order.id.slice(-8).toUpperCase()}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs uppercase tracking-widest text-brand-100">{t('common.total')}</div>
            <div className="mt-1 text-lg font-black">{formatPrice(order.total, i18n.language)}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs uppercase tracking-widest text-brand-100">{t('common.date')}</div>
            <div className="mt-1 text-sm font-bold">{formatDateTime(order.createdAt, i18n.language)}</div>
          </div>
        </div>
      </section>

      <section className="section-card p-5 sm:p-6">
        <h2 className="text-xl font-bold">{t('payment.summary')}</h2>
        <div className="mt-4 divide-y divide-brand-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-4">
              <div className="font-semibold">{item.ticketType?.event?.title}</div>
              <div className="mt-1 text-sm text-slate-600">
                {item.ticketType?.sector?.name} • {t('orders.row')} {item.seatRow},{' '}
                {t('orders.seat')} {item.seatNumber}
              </div>
              <div className="mt-1 text-sm text-slate-600">{t('orders.ticketCode')}: {item.ticketCode}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link to="/orders" className="btn-primary">
            {t('payment.openTickets')}
          </Link>
          <Link to="/events" className="btn-outline">
            {t('home.viewAll')}
          </Link>
        </div>
      </section>
    </div>
  );
}
