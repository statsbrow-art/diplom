import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import type { SportEvent, Sport } from '../types';
import { formatDateTime, formatPrice } from '../utils';

export default function EventsListPage() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [filters, setFilters] = useState({ sportId: '', city: '', q: '', from: '', to: '' });
  const [eventsLoaded, setEventsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/events/sports'), api.get('/events/cities')]).then(([sp, c]) => {
      setSports(sp.data.sports);
      setCities(c.data.cities);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params: Record<string, string> = {};
    if (filters.sportId) params.sportId = filters.sportId;
    if (filters.city) params.city = filters.city;
    if (filters.q) params.q = filters.q;
    if (filters.from) params.from = new Date(filters.from).toISOString();
    if (filters.to) params.to = new Date(filters.to).toISOString();
    api.get('/events', { params }).then((res) => {
      if (cancelled) return;
      setEvents(res.data.events);
      setEventsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="section-card p-5 flex flex-wrap items-end justify-between gap-4 sm:p-6">
        <div>
          <p className="section-kicker">{t('events.catalog')}</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">{t('events.title')}</h1>
          <p className="mt-2 text-slate-600">{t('app.tagline')}</p>
        </div>
        <div className="rounded-3xl border border-brand-300/20 bg-brand-300/10 px-5 py-3 text-sm font-semibold text-brand-700">
          {events.length} {t('events.available')}
        </div>
      </div>

      <div className="card grid gap-3 p-4 sm:p-5 md:grid-cols-5">
        <div>
          <label className="label">{t('common.search')}</label>
          <input
            className="input"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="..."
          />
        </div>
        <div>
          <label className="label">{t('common.sport')}</label>
          <select
            className="input"
            value={filters.sportId}
            onChange={(e) => setFilters((f) => ({ ...f, sportId: e.target.value }))}
          >
            <option value="">{t('common.all')}</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon ? `${s.icon} ` : ''}
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t('common.city')}</label>
          <select
            className="input"
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
          >
            <option value="">{t('common.all')}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t('common.from')}</label>
          <input
            type="date"
            className="input"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">{t('common.to')}</label>
          <input
            type="date"
            className="input"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          />
        </div>
      </div>

      {!eventsLoaded ? (
        <div className="text-center text-slate-600 py-12">{t('common.loading')}</div>
      ) : events.length === 0 ? (
        <div className="text-center text-slate-600 py-12">{t('events.noEvents')}</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Link
              to={`/events/${e.id}`}
              key={e.id}
              className="event-tile flex min-h-64 flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-300/10 text-2xl">
                  {e.sport?.icon}
                </div>
                {e.source && (
                  <span className="badge bg-emerald-50 text-emerald-700">
                    {t('events.belarusBadge')}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-700">
                <span>{e.sport?.name}</span>
                <span>•</span>
                <span>{e.venue?.city}</span>
              </div>
              <h3>{e.title}</h3>
              <p>{e.venue?.name}</p>
              <p className="mt-3 text-sm text-slate-800">
                {t('events.startsAt')}: {formatDateTime(e.startsAt, i18n.language)}
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-brand-200/15 pt-4">
                <span className="text-sm font-bold text-slate-900">
                  {e.minPrice != null
                    ? `${t('events.buyFrom')} ${formatPrice(e.minPrice, i18n.language)}`
                    : ''}
                </span>
                <span className="text-brand-300 text-sm font-bold">{t('events.details')} →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
