import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { clearCheckout, loadCheckout } from '../checkout';
import { useAuth } from '../auth';
import type { SportEvent } from '../types';
import { formatDateTime, formatPrice } from '../utils';
import {
  digitsOnly,
  formatCardNumber,
  formatCvv,
  formatExpiry,
  isValidCardNumber,
  isValidCvv,
  isValidExpiry,
} from '../validation';

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payload] = useState(() => loadCheckout());
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [card, setCard] = useState({
    holder: user?.name ?? '',
    number: '',
    expiry: '',
    cvv: '',
    saveCard: true,
  });
  const [promoCode, setPromoCode] = useState('');
  const [promo, setPromo] = useState<{ code: string; percentOff: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (payload) {
      api.get(`/events/${payload.eventId}`).then((res) => setEvent(res.data.event));
    }
  }, [payload]);

  const selectedTickets = useMemo(() => {
    if (!event?.ticketTypes || !payload) return [];
    return payload.seats.map((seat) => {
      const ticketType = event.ticketTypes?.find((item) => item.id === seat.ticketTypeId);
      return { ...seat, ticketType };
    });
  }, [event, payload]);

  const total = selectedTickets.reduce((sum, item) => sum + Number(item.ticketType?.price ?? 0), 0);
  const discount = promo ? Math.round(total * promo.percentOff) / 100 : 0;
  const finalTotal = Math.max(total - discount, 0);

  if (!user) return <Navigate to="/login" replace />;
  if (!payload) return <Navigate to="/events" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!payload) return;
    if (!isValidCardNumber(card.number)) {
      setError(t('payment.invalidCard'));
      return;
    }
    if (!isValidExpiry(card.expiry)) {
      setError(t('payment.invalidExpiry'));
      return;
    }
    if (!isValidCvv(card.cvv)) {
      setError(t('payment.invalidCvv'));
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const { data } = await api.post('/orders', {
        eventId: payload.eventId,
        seats: payload.seats,
        payment: {
          cardHolder: card.holder,
          cardNumber: digitsOnly(card.number),
          expiry: card.expiry,
          cvv: card.cvv,
        },
        promoCode: promo?.code,
      });
      if (card.saveCard) {
        await api.post('/cards', {
          holder: card.holder,
          cardNumber: card.number,
          expiry: card.expiry,
        });
      }
      clearCheckout();
      navigate(`/payment-success/${data.order.id}`);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ??
            t('payment.failed'))
          : t('payment.failed');
      setError(message);
    } finally {
      setProcessing(false);
    }
  }

  async function applyPromo() {
    if (!promoCode.trim()) return;
    const { data } = await api.get(`/orders/validate-promo/${promoCode.trim()}`);
    if (data.valid) {
      setPromo(data.promo);
      setError(null);
    } else {
      setPromo(null);
      setError(t('payment.invalidPromo'));
    }
  }

  function updateCardNumber(value: string) {
    const formatted = formatCardNumber(value);
    setCard((state) => ({ ...state, number: formatted }));
    if (digitsOnly(formatted).length >= 16) expiryRef.current?.focus();
  }

  function updateExpiry(value: string) {
    const formatted = formatExpiry(value);
    setCard((state) => ({ ...state, expiry: formatted }));
    if (digitsOnly(formatted).length === 4) cvvRef.current?.focus();
  }

  function updateCvv(value: string) {
    setCard((state) => ({ ...state, cvv: formatCvv(value) }));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr] lg:gap-6">
      <section className="section-card p-5 sm:p-6">
        <p className="section-kicker">{t('payment.kicker')}</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">{t('payment.title')}</h1>
        <p className="mt-2 text-slate-600">{t('payment.subtitle')}</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">{t('payment.cardHolder')}</label>
            <input
              className="input"
              required
              value={card.holder}
              onChange={(e) => setCard((value) => ({ ...value, holder: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">{t('payment.cardNumber')}</label>
            <input
              className="input"
              required
              inputMode="numeric"
              pattern="[0-9 ]{13,23}"
              maxLength={23}
              placeholder="4242 4242 4242 4242"
              value={card.number}
              onChange={(e) => updateCardNumber(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t('payment.expiry')}</label>
              <input
                className="input"
                ref={expiryRef}
                required
                placeholder="12/28"
                maxLength={5}
                value={card.expiry}
                onChange={(e) => updateExpiry(e.target.value)}
              />
            </div>
            <div>
              <label className="label">CVC/CVV</label>
              <input
                className="input"
                ref={cvvRef}
                required
                inputMode="numeric"
                maxLength={4}
                placeholder="123"
                value={card.cvv}
                onChange={(e) => updateCvv(e.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={card.saveCard}
              onChange={(e) => setCard((value) => ({ ...value, saveCard: e.target.checked }))}
            />
            {t('payment.saveCard')}
          </label>
          <div className="rounded-2xl border border-brand-200/15 bg-brand-50/80 p-3">
            <label className="label">{t('payment.promoCode')}</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="input"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="SPT10"
              />
              <button type="button" onClick={applyPromo} className="btn-outline">
                {t('payment.applyPromo')}
              </button>
            </div>
            {promo && (
              <p className="mt-2 text-sm text-emerald-300">
                {t('payment.promoApplied')}: {promo.code} −{promo.percentOff}%
              </p>
            )}
          </div>
          {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <button className="btn-primary w-full" disabled={processing}>
            {processing ? t('payment.processing') : t('payment.pay')}
          </button>
        </form>
      </section>

      <aside className="card h-fit p-5 sm:p-6 lg:sticky lg:top-28">
        <h2 className="text-xl font-bold">{t('payment.summary')}</h2>
        {event ? (
          <>
            <div className="mt-4 rounded-3xl bg-brand-50 p-4">
              <div className="text-sm font-semibold text-brand-700">
                {event.sport?.icon} {event.sport?.name}
              </div>
              <div className="mt-1 font-bold">{event.title}</div>
              <div className="mt-1 text-sm text-slate-600">
                {event.venue?.name} • {formatDateTime(event.startsAt, i18n.language)}
              </div>
            </div>
            <div className="mt-4 divide-y divide-brand-100">
              {selectedTickets.map((item, index) => (
                <div key={index} className="flex justify-between py-3 text-sm">
                  <span>
                    {item.ticketType?.sector?.name} {t('orders.row')} {item.row},{' '}
                    {t('orders.seat')} {item.number}
                  </span>
                  <strong>{formatPrice(item.ticketType?.price, i18n.language)}</strong>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-between border-t border-brand-200 pt-4 text-lg font-black">
              <span>{t('payment.subtotal')}</span>
              <span>{formatPrice(total, i18n.language)}</span>
            </div>
            {discount > 0 && (
              <div className="mt-2 flex justify-between text-sm text-emerald-300">
                <span>{t('orders.discount')}</span>
                <span>−{formatPrice(discount, i18n.language)}</span>
              </div>
            )}
            <div className="mt-3 flex justify-between border-t border-brand-200 pt-4 text-lg font-black">
              <span>{t('common.total')}</span>
              <span>{formatPrice(finalTotal, i18n.language)}</span>
            </div>
          </>
        ) : (
          <p className="mt-4 text-slate-600">{t('common.loading')}</p>
        )}
        <Link to={`/events/${payload.eventId}`} className="btn-outline mt-5 w-full">
          {t('common.back')}
        </Link>
      </aside>
    </div>
  );
}
