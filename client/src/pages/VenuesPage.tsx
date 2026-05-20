import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import type { SportEvent, Venue } from '../types';
import { formatDateTime } from '../utils';

interface VenueWithEvents extends Venue {
  events: SportEvent[];
}

export default function VenuesPage() {
  const { t, i18n } = useTranslation();
  const [venues, setVenues] = useState<VenueWithEvents[]>([]);

  useEffect(() => {
    api.get('/events/venues/list').then((res) => setVenues(res.data.venues));
  }, []);

  return (
    <div className="space-y-6">
      <section className="section-card p-6">
        <p className="section-kicker">{t('nav.venues')}</p>
        <h1 className="text-3xl font-black">{t('venues.title')}</h1>
        <p className="mt-2 max-w-2xl text-slate-600">{t('venues.subtitle')}</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {venues.map((venue) => (
          <article key={venue.id} className="venue-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand-300">{venue.city}</p>
                <h2 className="mt-1 text-xl font-bold">{venue.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{venue.address}</p>
              </div>
              <div className="rounded-2xl bg-brand-300/10 px-3 py-2 text-center">
                <div className="text-lg font-black text-brand-700">{venue.sectors?.length ?? 0}</div>
                <div className="text-xs text-slate-600">{t('events.sectors')}</div>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50 p-4">
              <h3 className="text-sm font-semibold text-slate-800">{t('venues.upcoming')}</h3>
              <div className="mt-3 space-y-2">
                {venue.events.length === 0 ? (
                  <p className="text-sm text-slate-600">{t('venues.noUpcoming')}</p>
                ) : (
                  venue.events.map((event) => (
                    <Link
                      to={`/events/${event.id}`}
                      key={event.id}
                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm transition hover:text-brand-700"
                    >
                      <span>
                        {event.sport?.icon} {event.title}
                      </span>
                      <span className="text-slate-500">
                        {formatDateTime(event.startsAt, i18n.language)}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
