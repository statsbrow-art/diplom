import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { formatDateTime, formatPrice } from '../../utils';

interface Stats {
  usersCount: number;
  eventsCount: number;
  revenue: number;
  paidOrdersCount: number;
  recentOrders: Array<{
    id: string;
    total: string | number;
    status: string;
    createdAt: string;
    user?: { name: string; email: string };
    items: Array<{ id: string }>;
  }>;
  topEvents: Array<{ id: string; title: string; sold: number }>;
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div className="text-slate-500">{t('common.loading')}</div>;

  const cards = [
    { label: t('admin.users'), value: stats.usersCount },
    { label: t('admin.events'), value: stats.eventsCount },
    { label: t('admin.paidOrders'), value: stats.paidOrdersCount },
    { label: t('admin.revenue'), value: formatPrice(stats.revenue, i18n.language) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className="text-sm text-slate-600">{c.label}</div>
            <div className="text-2xl font-semibold mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="font-semibold mb-3">{t('admin.topEvents')}</h2>
          {stats.topEvents.length === 0 ? (
            <p className="text-sm text-slate-600">{t('common.empty')}</p>
          ) : (
            <ul className="divide-y divide-brand-100 text-sm">
              {stats.topEvents.map((e) => (
                <li key={e.id} className="py-2 flex justify-between">
                  <span>{e.title}</span>
                  <span className="text-slate-500">
                    {e.sold} {t('admin.sold')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-3">{t('admin.recentOrders')}</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-slate-600">{t('common.empty')}</p>
          ) : (
            <ul className="divide-y divide-brand-100 text-sm">
              {stats.recentOrders.map((o) => (
                <li key={o.id} className="py-2 flex justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate">{o.user?.name ?? o.user?.email}</div>
                    <div className="text-xs text-slate-600">
                      {formatDateTime(o.createdAt, i18n.language)} • {o.items.length} {t('common.seats')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(o.total, i18n.language)}</div>
                    <div className="text-xs text-slate-600">{o.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
