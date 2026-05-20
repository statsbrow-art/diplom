import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import type { ApiSportEvent, SportEvent, Sport, Venue } from '../../types';
import { formatDateTime, formatPrice } from '../../utils';

interface AdminEvent extends SportEvent {
  ticketTypes: NonNullable<SportEvent['ticketTypes']>;
}

export default function AdminEvents() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    sportId: '',
    venueId: '',
    startsAt: '',
    status: 'ON_SALE' as 'ON_SALE' | 'SCHEDULED' | 'CANCELLED' | 'FINISHED',
  });
  const [openEvent, setOpenEvent] = useState<string | null>(null);
  const [ttForm, setTtForm] = useState({ sectorId: '', name: '', price: 0 });
  const [importing, setImporting] = useState(false);
  const [importingCis, setImportingCis] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [apiEvents, setApiEvents] = useState<ApiSportEvent[]>([]);
  const [selectedApiEvents, setSelectedApiEvents] = useState<string[]>([]);

  function load() {
    api.get('/admin/events').then((res) => setEvents(res.data.events));
  }
  useEffect(() => {
    load();
    api.get('/admin/sports').then((r) => setSports(r.data.sports));
    api.get('/admin/venues').then((r) => setVenues(r.data.venues));
  }, []);

  const venueById = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);

  async function add(e: FormEvent) {
    e.preventDefault();
    await api.post('/admin/events', { ...form, startsAt: new Date(form.startsAt).toISOString() });
    setForm({
      title: '',
      description: '',
      sportId: '',
      venueId: '',
      startsAt: '',
      status: 'ON_SALE',
    });
    load();
  }

  async function update(ev: AdminEvent) {
    await api.put(`/admin/events/${ev.id}`, {
      title: ev.title,
      description: ev.description ?? '',
      sportId: ev.sportId,
      venueId: ev.venueId,
      startsAt: new Date(ev.startsAt).toISOString(),
      status: ev.status,
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('?')) return;
    await api.delete(`/admin/events/${id}`);
    load();
  }

  async function addTicketType(eventId: string) {
    await api.post('/admin/ticket-types', {
      eventId,
      sectorId: ttForm.sectorId,
      name: ttForm.name,
      price: Number(ttForm.price),
    });
    setTtForm({ sectorId: '', name: '', price: 0 });
    load();
  }

  async function removeTicketType(id: string) {
    if (!confirm('?')) return;
    await api.delete(`/admin/ticket-types/${id}`);
    load();
  }

  async function importBelarusEvents() {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await api.post('/admin/events/import-belarus');
      setImportResult(
        t('admin.importBelarusResult', {
          created: res.data.created,
          updated: res.data.updated,
          skipped: res.data.skipped,
        }),
      );
      load();
    } finally {
      setImporting(false);
    }
  }

  async function importCisEvents() {
    setImportingCis(true);
    setImportResult(null);
    try {
      const res = await api.post('/admin/events/import-cis');
      setImportResult(
        t('admin.importCisResult', {
          created: res.data.created,
          updated: res.data.updated,
          skipped: res.data.skipped,
        }),
      );
      load();
    } finally {
      setImportingCis(false);
    }
  }

  async function loadApiEvents() {
    setImportingCis(true);
    try {
      const res = await api.get('/admin/events/cis-preview');
      setApiEvents(res.data.events);
    } finally {
      setImportingCis(false);
    }
  }

  function toggleApiEvent(id: string) {
    setSelectedApiEvents((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  }

  async function importSelectedApiEvents() {
    setImportingCis(true);
    setImportResult(null);
    try {
      const res = await api.post('/admin/events/import-cis-selected', {
        externalIds: selectedApiEvents,
      });
      setImportResult(
        t('admin.importCisResult', {
          created: res.data.created,
          updated: res.data.updated,
          skipped: res.data.skipped,
        }),
      );
      setSelectedApiEvents([]);
      load();
    } finally {
      setImportingCis(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{t('admin.events')}</h1>
        <button onClick={importBelarusEvents} disabled={importing} className="btn-outline ml-auto">
          {t('admin.importBelarus')}
        </button>
        <button onClick={importCisEvents} disabled={importingCis} className="btn-outline">
          {t('admin.importCis')}
        </button>
        <button onClick={loadApiEvents} disabled={importingCis} className="btn-outline">
          {t('admin.loadApiEvents')}
        </button>
      </div>
      {importResult && <div className="card p-3 text-sm text-emerald-700">{importResult}</div>}
      {apiEvents.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-bold">{t('admin.importCis')}</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                {t('admin.selectedApiEvents', { count: selectedApiEvents.length })}
              </span>
              <button
                onClick={importSelectedApiEvents}
                disabled={selectedApiEvents.length === 0 || importingCis}
                className="btn-primary"
              >
                {t('admin.importSelectedApi')}
              </button>
            </div>
          </div>
          <div className="mt-4 grid max-h-[34rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
            {apiEvents.map((event) => (
              <label
                key={event.externalId}
                className="flex cursor-pointer gap-3 rounded-2xl border border-brand-200/15 bg-white/60 p-3"
              >
                <input
                  type="checkbox"
                  checked={selectedApiEvents.includes(event.externalId)}
                  onChange={() => toggleApiEvent(event.externalId)}
                />
                <span>
                  <span className="block font-semibold">
                    {event.sportIcon} {event.title}
                  </span>
                  <span className="block text-sm text-slate-600">
                    {event.venueName} • {event.city} • {formatDateTime(event.startsAt, i18n.language)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={add} className="card p-4 grid gap-3 md:grid-cols-3">
        <div className="md:col-span-3">
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        </div>
        <div className="md:col-span-3">
          <label className="label">Description</label>
          <textarea
            className="input"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">{t('common.sport')}</label>
          <select className="input" value={form.sportId} onChange={(e) => setForm((f) => ({ ...f, sportId: e.target.value }))} required>
            <option value="">—</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t('common.venue')}</label>
          <select className="input" value={form.venueId} onChange={(e) => setForm((f) => ({ ...f, venueId: e.target.value }))} required>
            <option value="">—</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.city})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t('common.date')}</label>
          <input
            type="datetime-local"
            className="input"
            value={form.startsAt}
            onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as 'ON_SALE' | 'SCHEDULED' | 'CANCELLED' | 'FINISHED',
              }))
            }
          >
            <option value="ON_SALE">ON_SALE</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="FINISHED">FINISHED</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <button className="btn-primary">{t('admin.addEvent')}</button>
        </div>
      </form>

      <div className="space-y-3">
        {events.map((ev) => {
          const venue = venueById.get(ev.venueId);
          return (
            <div key={ev.id} className="card p-4">
              <div className="grid md:grid-cols-6 gap-2 items-end">
                <input
                  className="input md:col-span-2"
                  value={ev.title}
                  onChange={(e) =>
                    setEvents((arr) => arr.map((x) => (x.id === ev.id ? { ...x, title: e.target.value } : x)))
                  }
                />
                <select
                  className="input"
                  value={ev.sportId}
                  onChange={(e) =>
                    setEvents((arr) => arr.map((x) => (x.id === ev.id ? { ...x, sportId: e.target.value } : x)))
                  }
                >
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <select
                  className="input"
                  value={ev.venueId}
                  onChange={(e) =>
                    setEvents((arr) => arr.map((x) => (x.id === ev.id ? { ...x, venueId: e.target.value } : x)))
                  }
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  className="input"
                  value={new Date(ev.startsAt).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setEvents((arr) =>
                      arr.map((x) => (x.id === ev.id ? { ...x, startsAt: new Date(e.target.value).toISOString() } : x)),
                    )
                  }
                />
                <select
                  className="input"
                  value={ev.status}
                  onChange={(e) =>
                    setEvents((arr) =>
                      arr.map((x) =>
                        x.id === ev.id
                          ? {
                              ...x,
                              status: e.target.value as
                                | 'ON_SALE'
                                | 'SCHEDULED'
                                | 'CANCELLED'
                                | 'FINISHED',
                            }
                          : x,
                      ),
                    )
                  }
                >
                  <option value="ON_SALE">ON_SALE</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="FINISHED">FINISHED</option>
                </select>
              </div>
              <div className="text-xs text-slate-600 mt-2">
                {formatDateTime(ev.startsAt, i18n.language)} • {venue?.name} ({venue?.city})
              </div>
              {ev.source && (
                <div className="text-xs text-emerald-700 mt-1">
                  {t('events.source')}: {ev.source}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button onClick={() => update(ev)} className="btn-outline">
                  {t('common.save')}
                </button>
                <button onClick={() => remove(ev.id)} className="btn-danger">
                  {t('common.delete')}
                </button>
                <button
                  onClick={() => setOpenEvent(openEvent === ev.id ? null : ev.id)}
                  className="btn-outline ml-auto"
                >
                  {t('admin.ticketTypes')} ({ev.ticketTypes.length})
                </button>
              </div>
              {openEvent === ev.id && (
                <div className="mt-3 border-t border-brand-200/15 pt-3 space-y-2">
                  {ev.ticketTypes.map((tt) => (
                    <div key={tt.id} className="flex items-center gap-2 text-sm">
                      <span className="flex-1">
                        <strong>{tt.sector?.name}</strong> • {tt.name} •{' '}
                        {formatPrice(tt.price, i18n.language)}
                      </span>
                      <button onClick={() => removeTicketType(tt.id)} className="btn-danger text-xs px-2 py-1">
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-end gap-2 pt-2">
                    <select
                      className="input w-44"
                      value={ttForm.sectorId}
                      onChange={(e) => setTtForm((f) => ({ ...f, sectorId: e.target.value }))}
                    >
                      <option value="">— {t('common.venue')} —</option>
                      {venue?.sectors?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.rows}×{s.seatsPerRow})
                        </option>
                      ))}
                    </select>
                    <input
                      className="input w-32"
                      placeholder="Name"
                      value={ttForm.name}
                      onChange={(e) => setTtForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    <input
                      type="number"
                      className="input w-32"
                      placeholder={t('common.price')}
                      value={ttForm.price}
                      onChange={(e) => setTtForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    />
                    <button onClick={() => addTicketType(ev.id)} className="btn-primary text-sm">
                      {t('admin.addTicketType')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
