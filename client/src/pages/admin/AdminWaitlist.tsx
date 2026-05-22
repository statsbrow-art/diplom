import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import type { WaitlistSubscription } from '../../types';
import { formatDateTime } from '../../utils';

export default function AdminWaitlist() {
  const { t, i18n } = useTranslation();
  const [subscriptions, setSubscriptions] = useState<WaitlistSubscription[]>([]);

  function load() {
    api.get('/admin/waitlist').then((res) => setSubscriptions(res.data.subscriptions));
  }

  useEffect(load, []);

  async function notify(id: string) {
    await api.post(`/admin/waitlist/${id}/notify`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('admin.waitlist')}</h1>
      <div className="space-y-3">
        {subscriptions.map((item) => (
          <div key={item.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="font-bold">{item.event?.title}</div>
              <div className="text-sm text-slate-600">
                {item.user?.name} • {item.user?.email} • {item.event?.startsAt && formatDateTime(item.event.startsAt, i18n.language)}
              </div>
            </div>
            <button onClick={() => notify(item.id)} className="btn-outline px-3 py-1 text-xs">
              {t('admin.notifyUser')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
