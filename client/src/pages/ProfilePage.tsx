import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../auth';
import type { Order, PaymentCard, WaitlistSubscription } from '../types';
import { formatDateTime, formatPrice } from '../utils';
import { digitsOnly, formatCardNumber, formatExpiry, isValidCardNumber, isValidExpiry } from '../validation';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedCard, setSavedCard] = useState<PaymentCard | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistSubscription[]>([]);
  const [cardForm, setCardForm] = useState({
    holder: user?.name ?? '',
    number: '',
    expiry: '',
  });
  const [cardError, setCardError] = useState<string | null>(null);
  const expiryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([api.get('/orders/mine'), api.get('/cards'), api.get('/waitlist/mine')]).then(([ordersRes, cardsRes, waitlistRes]) => {
      setOrders(ordersRes.data.orders);
      setSavedCard(cardsRes.data.cards[0] ?? null);
      setWaitlist(waitlistRes.data.subscriptions);
    });
  }, []);

  const ticketsCount = useMemo(
    () => orders.reduce((sum, order) => sum + order.items.length, 0),
    [orders],
  );
  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total), 0),
    [orders],
  );

  async function saveCard(e: FormEvent) {
    e.preventDefault();
    setCardError(null);
    if (!isValidCardNumber(cardForm.number)) {
      setCardError(t('payment.invalidCard'));
      return;
    }
    if (!isValidExpiry(cardForm.expiry)) {
      setCardError(t('payment.invalidExpiry'));
      return;
    }
    const { data } = await api.post('/cards', {
      holder: cardForm.holder,
      cardNumber: cardForm.number,
      expiry: cardForm.expiry,
    });
    setSavedCard(data.card);
    setCardForm((value) => ({ ...value, number: '' }));
  }

  async function removeCard() {
    if (savedCard) await api.delete(`/cards/${savedCard.id}`);
    setSavedCard(null);
  }

  function updateCardNumber(value: string) {
    const formatted = formatCardNumber(value);
    setCardForm((state) => ({ ...state, number: formatted }));
    if (digitsOnly(formatted).length >= 16) expiryRef.current?.focus();
  }

  function updateExpiry(value: string) {
    setCardForm((state) => ({ ...state, expiry: formatExpiry(value) }));
  }

  return (
    <div className="space-y-6">
      <section className="profile-hero p-5 text-white sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-brand-100 sm:text-sm sm:tracking-[0.3em]">{t('profile.kicker')}</p>
        <h1 className="mt-3 break-words text-2xl font-black sm:text-3xl">{user?.name}</h1>
        <p className="mt-1 text-brand-50">{user?.email}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="glass-card p-4">
            <div className="text-2xl font-black sm:text-3xl">{orders.length}</div>
            <div className="text-sm text-brand-100">{t('profile.orders')}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-2xl font-black sm:text-3xl">{ticketsCount}</div>
            <div className="text-sm text-brand-100">{t('profile.tickets')}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-2xl font-black sm:text-3xl">{formatPrice(totalSpent, i18n.language)}</div>
            <div className="text-sm text-brand-100">{t('profile.spent')}</div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:gap-6">
        <section className="section-card p-5 sm:p-6">
          <p className="section-kicker">{t('profile.cardBinding')}</p>
          <h2 className="mt-2 text-2xl font-bold">{t('profile.paymentCard')}</h2>
          {savedCard ? (
            <div className="mt-5">
              <div className="payment-card-preview">
                <div className="flex justify-between">
                  <span>{savedCard.brand}</span>
                  <span>
                    ••/{String(savedCard.expiryMonth).padStart(2, '0')}/{String(savedCard.expiryYear).slice(-2)}
                  </span>
                </div>
                <div className="mt-8 text-xl tracking-[0.18em] sm:text-2xl sm:tracking-[0.25em]">•••• •••• •••• {savedCard.last4}</div>
                <div className="mt-6 text-sm uppercase tracking-widest">{savedCard.holder}</div>
              </div>
              <button onClick={removeCard} className="btn-outline mt-4 w-full">
                {t('profile.removeCard')}
              </button>
            </div>
          ) : (
            <form onSubmit={saveCard} className="mt-5 space-y-4">
              <div>
                <label className="label">{t('payment.cardHolder')}</label>
                <input
                  className="input"
                  required
                  value={cardForm.holder}
                  onChange={(e) => setCardForm((value) => ({ ...value, holder: e.target.value }))}
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
                  value={cardForm.number}
                  onChange={(e) => updateCardNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="label">{t('payment.expiry')}</label>
                <input
                  className="input"
                  ref={expiryRef}
                  required
                  placeholder="12/28"
                  maxLength={5}
                  value={cardForm.expiry}
                  onChange={(e) => updateExpiry(e.target.value)}
                />
              </div>
              <button className="btn-primary w-full">{t('profile.bindCard')}</button>
              {cardError && <p className="text-sm text-red-700">{cardError}</p>}
            </form>
          )}
        </section>

        <section className="section-card p-5 sm:p-6">
          <p className="section-kicker">{t('profile.waitlist')}</p>
          <h2 className="mt-2 text-2xl font-bold">{t('profile.notifications')}</h2>
          <div className="mt-5 space-y-3">
            {waitlist.length === 0 ? (
              <p className="text-slate-500">{t('common.empty')}</p>
            ) : (
              waitlist.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border border-brand-200/15 bg-white p-4">
                  <div className="font-semibold">{item.event?.title}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {item.event?.venue?.name} • {item.event?.startsAt && formatDateTime(item.event.startsAt, i18n.language)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="section-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-kicker">{t('nav.myTickets')}</p>
              <h2 className="mt-2 text-2xl font-bold">{t('orders.myOrders')}</h2>
            </div>
            <Link to="/events" className="btn-outline">
              {t('home.findTickets')}
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {orders.length === 0 ? (
              <p className="text-slate-500">{t('orders.empty')}</p>
            ) : (
              orders.slice(0, 4).map((order) => (
                <div key={order.id} className="rounded-3xl border border-brand-200/15 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-bold">#{order.id.slice(-8).toUpperCase()}</div>
                      <div className="text-sm text-slate-600">
                        {formatDateTime(order.createdAt, i18n.language)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black">{formatPrice(order.total, i18n.language)}</div>
                      <div className="text-xs text-slate-600">{order.items.length} tickets</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
