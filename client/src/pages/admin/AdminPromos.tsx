import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import type { PromoCode } from '../../types';

export default function AdminPromos() {
  const { t } = useTranslation();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [form, setForm] = useState({ code: '', description: '', percentOff: 10 });

  function load() {
    api.get('/admin/promos').then((res) => setPromos(res.data.promos));
  }

  useEffect(load, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    await api.post('/admin/promos', { ...form, active: true });
    setForm({ code: '', description: '', percentOff: 10 });
    load();
  }

  async function remove(id: string) {
    await api.delete(`/admin/promos/${id}`);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('admin.promos')}</h1>
      <form onSubmit={submit} className="card grid gap-3 p-4 md:grid-cols-[1fr_1fr_140px_auto]">
        <input className="input" value={form.code} onChange={(e) => setForm((v) => ({ ...v, code: e.target.value }))} placeholder="SPT10" required />
        <input className="input" value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} placeholder={t('admin.description')} />
        <input className="input" type="number" min={1} max={90} value={form.percentOff} onChange={(e) => setForm((v) => ({ ...v, percentOff: Number(e.target.value) }))} />
        <button className="btn-primary">{t('common.create')}</button>
      </form>
      <div className="space-y-3">
        {promos.map((promo) => (
          <div key={promo.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="font-mono text-lg font-black text-brand-700">{promo.code}</div>
              <div className="text-sm text-slate-600">{promo.description}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge bg-emerald-500/15 text-emerald-300">−{promo.percentOff}%</span>
              <button onClick={() => remove(promo.id)} className="btn-danger px-3 py-1 text-xs">{t('common.delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
