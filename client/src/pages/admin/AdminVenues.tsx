import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import type { Venue } from '../../types';

export default function AdminVenues() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Venue[]>([]);
  const [form, setForm] = useState({ name: '', city: '', address: '' });
  const [openVenue, setOpenVenue] = useState<string | null>(null);
  const [secForm, setSecForm] = useState({ name: '', rows: 5, seatsPerRow: 10 });

  function load() {
    api.get('/admin/venues').then((res) => setItems(res.data.venues));
  }
  useEffect(load, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    await api.post('/admin/venues', form);
    setForm({ name: '', city: '', address: '' });
    load();
  }
  async function update(v: Venue) {
    await api.put(`/admin/venues/${v.id}`, { name: v.name, city: v.city, address: v.address });
    load();
  }
  async function remove(id: string) {
    if (!confirm('?')) return;
    await api.delete(`/admin/venues/${id}`);
    load();
  }
  async function addSector(venueId: string) {
    await api.post('/admin/sectors', { venueId, ...secForm });
    setSecForm({ name: '', rows: 5, seatsPerRow: 10 });
    load();
  }
  async function removeSector(id: string) {
    if (!confirm('?')) return;
    await api.delete(`/admin/sectors/${id}`);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('admin.venues')}</h1>
      <form onSubmit={add} className="card p-4 grid gap-3 md:grid-cols-4">
        <div>
          <label className="label">{t('common.venue')}</label>
          <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">{t('common.city')}</label>
          <input className="input" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required />
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full">{t('admin.addVenue')}</button>
        </div>
      </form>

      <div className="space-y-3">
        {items.map((v) => (
          <div key={v.id} className="card p-4">
            <div className="grid md:grid-cols-4 gap-3 items-end">
              <input
                className="input"
                value={v.name}
                onChange={(e) => setItems((arr) => arr.map((x) => (x.id === v.id ? { ...x, name: e.target.value } : x)))}
              />
              <input
                className="input"
                value={v.city}
                onChange={(e) => setItems((arr) => arr.map((x) => (x.id === v.id ? { ...x, city: e.target.value } : x)))}
              />
              <input
                className="input"
                value={v.address}
                onChange={(e) => setItems((arr) => arr.map((x) => (x.id === v.id ? { ...x, address: e.target.value } : x)))}
              />
              <div className="flex gap-2">
                <button onClick={() => update(v)} className="btn-outline flex-1">
                  {t('common.save')}
                </button>
                <button onClick={() => remove(v.id)} className="btn-danger">
                  ✕
                </button>
              </div>
            </div>
            <div className="mt-3">
              <button
                className="text-sm text-brand-700 hover:underline"
                onClick={() => setOpenVenue(openVenue === v.id ? null : v.id)}
              >
                {t('admin.sectorsOfVenue', { name: v.name })} ({v.sectors?.length ?? 0})
              </button>
              {openVenue === v.id && (
                <div className="mt-3 space-y-2">
                  {v.sectors?.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 text-sm">
                      <span className="flex-1">
                        <strong>{s.name}</strong> — {s.rows} × {s.seatsPerRow}
                      </span>
                      <button onClick={() => removeSector(s.id)} className="btn-danger text-xs px-2 py-1">
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-brand-200/15">
                    <input
                      className="input w-32"
                      placeholder="Name"
                      value={secForm.name}
                      onChange={(e) => setSecForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    <input
                      type="number"
                      className="input w-24"
                      placeholder={t('admin.rows')}
                      value={secForm.rows}
                      onChange={(e) => setSecForm((f) => ({ ...f, rows: Number(e.target.value) }))}
                    />
                    <input
                      type="number"
                      className="input w-32"
                      placeholder={t('admin.seatsPerRow')}
                      value={secForm.seatsPerRow}
                      onChange={(e) => setSecForm((f) => ({ ...f, seatsPerRow: Number(e.target.value) }))}
                    />
                    <button onClick={() => addSector(v.id)} className="btn-primary text-sm">
                      {t('admin.addSector')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
