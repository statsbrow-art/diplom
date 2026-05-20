import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import type { Sport } from '../../types';

export default function AdminSports() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Sport[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');

  function load() {
    api.get('/admin/sports').then((res) => setItems(res.data.sports));
  }
  useEffect(load, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    await api.post('/admin/sports', { name, icon: icon || null });
    setName('');
    setIcon('');
    load();
  }

  async function remove(id: string) {
    if (!confirm('?')) return;
    await api.delete(`/admin/sports/${id}`);
    load();
  }

  async function update(s: Sport) {
    await api.put(`/admin/sports/${s.id}`, { name: s.name, icon: s.icon ?? null });
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('admin.sports')}</h1>
      <form onSubmit={add} className="card p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="label">{t('common.sport')}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="w-24">
          <label className="label">Icon</label>
          <input className="input" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="⚽" />
        </div>
        <button className="btn-primary">{t('admin.addSport')}</button>
      </form>

      <div className="card divide-y divide-brand-100">
        {items.map((s) => (
          <div key={s.id} className="p-3 flex items-center gap-3">
            <input
              className="input w-16"
              value={s.icon ?? ''}
              onChange={(e) => setItems((arr) => arr.map((x) => (x.id === s.id ? { ...x, icon: e.target.value } : x)))}
            />
            <input
              className="input flex-1"
              value={s.name}
              onChange={(e) => setItems((arr) => arr.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))}
            />
            <button onClick={() => update(s)} className="btn-outline">
              {t('common.save')}
            </button>
            <button onClick={() => remove(s.id)} className="btn-danger">
              {t('common.delete')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
