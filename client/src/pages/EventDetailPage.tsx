import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../auth';
import { saveCheckout } from '../checkout';
import type { SportEvent, TicketType } from '../types';
import { formatDateTime, formatPrice } from '../utils';

interface SeatRef {
  ticketTypeId: string;
  row: number;
  number: number;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [taken, setTaken] = useState<Record<string, Array<{ row: number; number: number }>>>({});
  const [activeTT, setActiveTT] = useState<string>('');
  const [selected, setSelected] = useState<SeatRef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [waitlisted, setWaitlisted] = useState(false);

  function load() {
    api.get(`/events/${id}`).then((res) => {
      setEvent(res.data.event);
      setTaken(res.data.taken);
      if (!activeTT && res.data.event.ticketTypes.length > 0) {
        setActiveTT(res.data.event.ticketTypes[0].id);
      }
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const activeTicketType = useMemo<TicketType | undefined>(
    () => event?.ticketTypes?.find((t) => t.id === activeTT),
    [event, activeTT],
  );

  const ticketTypes = event?.ticketTypes ?? [];

  const takenSet = useMemo(() => {
    const set = new Set<string>();
    for (const [ttId, list] of Object.entries(taken)) {
      for (const s of list) set.add(`${ttId}:${s.row}:${s.number}`);
    }
    return set;
  }, [taken]);

  function isSeatTaken(ttId: string, row: number, number: number) {
    return takenSet.has(`${ttId}:${row}:${number}`);
  }

  function sectorAvailability(tt: TicketType) {
    const capacity = (tt.sector?.rows ?? 0) * (tt.sector?.seatsPerRow ?? 0);
    const sold = taken[tt.id]?.length ?? 0;
    return { capacity, free: Math.max(capacity - sold, 0), sold };
  }

  function sectorPosition(index: number) {
    const positions = [
      { gridColumn: '2 / span 3', gridRow: '1' },
      { gridColumn: '5', gridRow: '2 / span 3' },
      { gridColumn: '2 / span 3', gridRow: '5' },
      { gridColumn: '1', gridRow: '2 / span 3' },
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '5', gridRow: '1' },
      { gridColumn: '1', gridRow: '5' },
      { gridColumn: '5', gridRow: '5' },
    ];
    return positions[index % positions.length];
  }

  function sectorSide(index: number) {
    const sides = [
      t('events.sectorNorth'),
      t('events.sectorEast'),
      t('events.sectorSouth'),
      t('events.sectorWest'),
      t('events.sectorCorner'),
      t('events.sectorCorner'),
      t('events.sectorCorner'),
      t('events.sectorCorner'),
    ];
    return sides[index % sides.length];
  }

  function toggleSeat(ttId: string, row: number, number: number) {
    if (isSeatTaken(ttId, row, number)) return;
    setSelected((prev) => {
      const idx = prev.findIndex(
        (s) => s.ticketTypeId === ttId && s.row === row && s.number === number,
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return [...prev, { ticketTypeId: ttId, row, number }];
    });
  }

  const total = useMemo(() => {
    if (!event?.ticketTypes) return 0;
    return selected.reduce((sum, s) => {
      const tt = event.ticketTypes!.find((t) => t.id === s.ticketTypeId);
      return sum + (tt ? Number(tt.price) : 0);
    }, 0);
  }, [selected, event]);

  function purchase() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (selected.length === 0) return;
    saveCheckout({ eventId: id!, seats: selected });
    navigate('/checkout');
  }

  async function joinWaitlist() {
    if (!user) {
      navigate('/login');
      return;
    }
    await api.post('/waitlist', { eventId: id, notifyBy: 'email' });
    setWaitlisted(true);
    setError(t('events.waitlistJoined'));
  }

  if (!event) return <div className="p-8 text-center text-slate-600">{t('common.loading')}</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-5">
          <div className="text-sm text-slate-600 flex items-center gap-2 mb-2">
            <span>{event.sport?.icon}</span>
            <span>{event.sport?.name}</span>
            <span>•</span>
            <span>{event.venue?.city}</span>
            <span>•</span>
            <span>{formatDateTime(event.startsAt, i18n.language)}</span>
          </div>
          <h1 className="text-xl font-bold mb-1 sm:text-2xl">{event.title}</h1>
          <p className="text-slate-600">{event.venue?.name}</p>
          {event.source && (
            <p className="text-sm text-emerald-700 mt-2">
              {t('events.source')}:{' '}
              {event.sourceUrl ? (
                <a className="underline" href={event.sourceUrl} target="_blank" rel="noreferrer">
                  {event.source}
                </a>
              ) : (
                event.source
              )}
            </p>
          )}
          {event.description && <p className="text-slate-600 mt-2">{event.description}</p>}
          <button onClick={joinWaitlist} className="btn-outline mt-4">
            {waitlisted ? t('events.waitlistJoined') : t('events.waitlist')}
          </button>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-3">{t('events.chooseSector')}</h2>
          <p className="mb-4 text-sm text-slate-600">{t('events.sectorMapHint')}</p>
          <div className="mb-5 overflow-x-auto rounded-[2rem] border border-brand-200/15 bg-white/70 p-3 sm:p-4">
            <div
              className="grid min-w-[360px] gap-2 sm:min-w-[620px] sm:gap-3"
              style={{
                gridTemplateColumns: '1fr 1.05fr 1.25fr 1.05fr 1fr',
                gridTemplateRows: 'auto 90px 90px 90px auto',
              }}
            >
              <div
                className="grid place-items-center rounded-[1.5rem] border border-emerald-300/30 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-sky-100 p-2 text-center shadow-inner sm:rounded-[2rem] sm:p-4"
                style={{ gridColumn: '2 / span 3', gridRow: '2 / span 3' }}
              >
                <div className="w-full rounded-[1rem] border border-emerald-300/40 bg-emerald-400/10 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-700 sm:rounded-[1.5rem] sm:py-8 sm:text-xs sm:tracking-[0.4em]">
                  {t('events.field')}
                </div>
              </div>

              {ticketTypes.map((tt, index) => {
                const availability = sectorAvailability(tt);
                const isActive = activeTT === tt.id;
                return (
                  <button
                    key={tt.id}
                    onClick={() => setActiveTT(tt.id)}
                    className={`relative z-10 rounded-2xl border p-2 text-left transition sm:p-3 ${
                      isActive
                        ? 'border-brand-200 bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                        : availability.free === 0
                          ? 'border-red-300 bg-red-50 text-red-700 hover:border-red-400'
                          : 'border-emerald-300/30 bg-white text-slate-900 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                    style={sectorPosition(index)}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-75 sm:text-[10px] sm:tracking-[0.2em]">
                      {sectorSide(index)}
                    </span>
                    <span className="mt-1 block text-xs font-black sm:text-base">
                      {tt.sector?.name} · {tt.name}
                    </span>
                    <span className="mt-1 block text-[10px] sm:text-xs">
                      {formatPrice(tt.price, i18n.language)}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-1 text-[10px] sm:gap-2 sm:text-xs">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      {availability.free} {t('events.legendFree')}
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      {availability.sold}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeTicketType && (
            <>
              <div className="mb-3 flex items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-300" />
                  {t('events.legendFree')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-brand-600" />
                  {t('events.legendSelected')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-red-600" />
                  {t('events.legendTaken')}
                </span>
              </div>
              <div className="overflow-x-auto pb-2">
                <div className="rounded-[2rem] border border-brand-200/20 bg-white/80 p-3 shadow-inner sm:p-4">
                  <div className="mx-auto mb-4 h-20 max-w-md rounded-[50%] border border-emerald-300/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-3 sm:h-24">
                    <div className="grid h-full place-items-center rounded-[50%] border border-emerald-300/40 bg-emerald-500/15 text-xs font-bold uppercase tracking-[0.35em] text-emerald-700">
                      {t('events.field')}
                    </div>
                  </div>
                  <div className="mb-4 rounded-t-[2rem] border border-brand-200/20 bg-white py-3 text-center text-xs uppercase tracking-wide text-brand-700 shadow-inner">
                    {activeTicketType.sector?.name}
                  </div>
                  <div className="mb-4 h-3 rounded-b-full bg-gradient-to-r from-brand-500 via-brand-200 to-brand-500 shadow-lg shadow-brand-500/20" />
                  <div className="inline-block min-w-full rounded-[2rem] border border-brand-200/70 bg-white/70 p-2 sm:p-3">
                    {Array.from({ length: activeTicketType.sector!.rows }, (_, r) => r + 1).map(
                      (row) => (
                        <div
                          key={row}
                          className="flex items-center justify-center gap-0.5 mb-1 sm:gap-1"
                          style={{ transform: `scale(${1 - row * 0.008})` }}
                        >
                          <span className="w-5 text-[10px] text-slate-500 text-right pr-1 sm:w-6 sm:text-xs">{row}</span>
                          {Array.from(
                            { length: activeTicketType.sector!.seatsPerRow },
                            (_, n) => n + 1,
                          ).map((n) => {
                            const isTaken = isSeatTaken(activeTicketType.id, row, n);
                            const isSelected = selected.some(
                              (s) =>
                                s.ticketTypeId === activeTicketType.id &&
                                s.row === row &&
                                s.number === n,
                            );
                            const price = Number(activeTicketType.price);
                            const score =
                              price <= 25 ? t('events.dealGreat') : price <= 50 ? t('events.dealGood') : t('events.dealPremium');
                            return (
                              <button
                                key={n}
                                disabled={isTaken}
                                onClick={() => toggleSeat(activeTicketType.id, row, n)}
                                className={`h-6 w-6 rounded-md border text-[9px] font-bold shadow-sm sm:h-7 sm:w-7 sm:text-[10px] ${
                                  isTaken
                                    ? 'cursor-not-allowed border-red-400/50 bg-red-600 text-white'
                                    : isSelected
                                      ? 'border-brand-200 bg-brand-600 text-white'
                                      : 'border-emerald-300 bg-emerald-500 text-white hover:bg-emerald-400'
                                }`}
                                title={`${t('events.rowShort')}${row} ${t('events.seatShort')}${n} • ${formatPrice(activeTicketType.price, i18n.language)} • ${score}`}
                              >
                                {n}
                              </button>
                            );
                          })}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card p-5 h-fit lg:sticky lg:top-4">
        <h3 className="font-semibold mb-3">{t('events.selectedSeats')}</h3>
        {selected.length === 0 ? (
          <p className="text-sm text-slate-600">{t('common.empty')}</p>
        ) : (
          <ul className="text-sm divide-y divide-brand-100 mb-4">
            {selected.map((s, idx) => {
              const tt = event.ticketTypes?.find((t) => t.id === s.ticketTypeId);
              return (
                <li key={idx} className="flex justify-between py-2">
                  <span>
                    {tt?.sector?.name} {t('events.rowShort')}
                    {s.row}–{t('events.seatShort')}
                    {s.number}
                  </span>
                  <span>{formatPrice(tt?.price, i18n.language)}</span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="flex justify-between font-semibold mb-3">
          <span>{t('common.total')}</span>
          <span>{formatPrice(total, i18n.language)}</span>
        </div>
        {error && <div className="text-sm text-red-700 mb-3">{error}</div>}
        <button
          onClick={purchase}
          disabled={selected.length === 0}
          className="btn-primary w-full"
        >
          {t('events.checkout')}
        </button>
        {!user && (
          <p className="text-xs text-slate-600 text-center mt-2">
            {t('nav.login')} → {t('events.checkout')}
          </p>
        )}
      </div>
    </div>
  );
}
