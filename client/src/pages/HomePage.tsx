import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import type { SportEvent } from '../types';
import { formatDateTime, formatPrice } from '../utils';

interface HomeSummary {
  stats: {
    eventsCount: number;
    sportsCount: number;
    venuesCount: number;
    citiesCount: number;
  };
  nextEvents: SportEvent[];
  collections?: {
    popular: SportEvent[];
    budget: SportEvent[];
    weekend: SportEvent[];
  };
}

const defaultSummary: HomeSummary = {
  stats: {
    eventsCount: 0,
    sportsCount: 0,
    venuesCount: 0,
    citiesCount: 0,
  },
  nextEvents: [],
  collections: { popular: [], budget: [], weekend: [] },
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState<HomeSummary>(defaultSummary);

  useEffect(() => {
    api.get('/events/featured/summary').then((res) => setSummary(res.data));
  }, []);

  const stats = [
    { label: t('home.stats.events'), value: summary.stats.eventsCount },
    { label: t('home.stats.sports'), value: summary.stats.sportsCount },
    { label: t('home.stats.venues'), value: summary.stats.venuesCount },
    { label: t('home.stats.cities'), value: summary.stats.citiesCount },
  ];

  return (
    <div className="space-y-10">
      <section className="hero-card p-5 md:p-10 overflow-hidden relative">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <span className="badge bg-brand-300/15 text-brand-100 ring-1 ring-brand-200/30">
              {t('app.name')}
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-6xl">
              {t('home.heroTitle')}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-brand-50 sm:text-lg">{t('home.heroText')}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/events" className="btn bg-white text-brand-700 shadow-lg shadow-brand-900/20 hover:bg-brand-50">
                {t('home.findTickets')}
              </Link>
              <Link to="/venues" className="btn border border-brand-300/40 text-white hover:bg-white/10">
                {t('nav.venues')}
              </Link>
            </div>
          </div>
          <div className="glass-card p-5 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-100">{t('home.nextEvents')}</p>
            <div className="mt-4 space-y-3">
              {summary.nextEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block rounded-2xl border border-brand-200/15 bg-white/10 p-4 transition hover:bg-white/20"
                >
                  <div className="text-sm text-brand-100">
                    {event.sport?.icon} {event.sport?.name} • {event.venue?.city}
                  </div>
                  <div className="mt-1 font-semibold">{event.title}</div>
                  <div className="mt-1 text-sm text-brand-100">
                    {formatDateTime(event.startsAt, i18n.language)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="stat-card">
            <div className="text-3xl font-black text-brand-600">{item.value}</div>
            <div className="mt-1 text-sm text-slate-600">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="feature-card">
          <div className="feature-icon">🏟️</div>
          <h2>{t('home.features.catalogTitle')}</h2>
          <p>{t('home.features.catalogText')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎫</div>
          <h2>{t('home.features.seatsTitle')}</h2>
          <p>{t('home.features.seatsText')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h2>{t('home.features.apiTitle')}</h2>
          <p>{t('home.features.apiText')}</p>
        </div>
      </section>

      <section className="section-card p-5 sm:p-6">
        <p className="section-kicker">{t('home.collections.kicker')}</p>
        <h2 className="mt-2 text-2xl font-bold">{t('home.collections.title')}</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {[
            { title: t('home.collections.popular'), events: summary.collections?.popular ?? [] },
            { title: t('home.collections.budget'), events: summary.collections?.budget ?? [] },
            { title: t('home.collections.weekend'), events: summary.collections?.weekend ?? [] },
          ].map((collection) => (
            <div key={collection.title} className="rounded-3xl border border-brand-200/15 bg-brand-50/80 p-4">
              <h3 className="font-bold text-brand-700">{collection.title}</h3>
              <div className="mt-3 space-y-3">
                {collection.events.length === 0 ? (
                  <p className="text-sm text-slate-500">{t('common.empty')}</p>
                ) : (
                  collection.events.map((event) => (
                    <Link key={event.id} to={`/events/${event.id}`} className="block rounded-2xl bg-white p-3 hover:bg-brand-50">
                      <div className="text-sm text-slate-600">{event.sport?.icon} {event.venue?.city}</div>
                      <div className="mt-1 font-semibold">{event.title}</div>
                      <div className="mt-1 text-xs text-brand-700">{event.minPrice ? formatPrice(event.minPrice, i18n.language) : t('events.available')}</div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">{t('home.nextEvents')}</p>
            <h2 className="text-2xl font-bold">{t('events.title')}</h2>
          </div>
          <Link to="/events" className="btn-outline">
            {t('home.viewAll')}
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {summary.nextEvents.map((event) => (
            <Link to={`/events/${event.id}`} key={event.id} className="event-tile">
              <div className="text-3xl">{event.sport?.icon}</div>
              <h3>{event.title}</h3>
              <p>{event.venue?.name}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span>{formatDateTime(event.startsAt, i18n.language)}</span>
                <strong>{formatPrice(event.minPrice, i18n.language)}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
