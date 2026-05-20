import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import type { OrderItem } from '../../types';
import { formatDateTime } from '../../utils';

interface CheckResult {
  valid: boolean;
  ticket: (OrderItem & {
    order?: { status: string; user?: { email: string; name: string } };
  }) | null;
}

export default function AdminTickets() {
  const { t, i18n } = useTranslation();
  const [ticketCode, setTicketCode] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const { data } = await api.post('/admin/orders/check-ticket', { ticketCode });
    setResult(data);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('admin.ticketCheck')}</h1>
      <form onSubmit={submit} className="card flex gap-3 p-4">
        <input
          className="input"
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          placeholder="ABC123"
        />
        <button className="btn-primary">{t('admin.checkTicket')}</button>
      </form>
      {result && (
        <div className={`card p-5 ${result.valid ? 'border-emerald-300/40' : 'border-red-400/40'}`}>
          <div className={`text-xl font-black ${result.valid ? 'text-emerald-300' : 'text-red-700'}`}>
            {result.valid ? t('admin.ticketValid') : t('admin.ticketInvalid')}
          </div>
          {result.ticket && (
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <div>{result.ticket.ticketType?.event?.title}</div>
              <div>
                {result.ticket.ticketType?.sector?.name} • {t('orders.row')} {result.ticket.seatRow},{' '}
                {t('orders.seat')} {result.ticket.seatNumber}
              </div>
              <div>{result.ticket.order?.user?.name} • {result.ticket.order?.user?.email}</div>
              {result.ticket.ticketType?.event?.startsAt && (
                <div>{formatDateTime(result.ticket.ticketType.event.startsAt, i18n.language)}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
