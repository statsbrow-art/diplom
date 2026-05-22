import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { t } = useTranslation();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
    }`;
  return (
    <div className="grid gap-4 md:grid-cols-[200px_1fr] md:gap-6">
      <aside className="card flex gap-1 overflow-x-auto p-3 md:block md:h-fit md:overflow-visible">
        <NavLink to="/admin" end className={linkClass}>
          {t('admin.dashboard')}
        </NavLink>
        <NavLink to="/admin/events" className={linkClass}>
          {t('admin.events')}
        </NavLink>
        <NavLink to="/admin/venues" className={linkClass}>
          {t('admin.venues')}
        </NavLink>
        <NavLink to="/admin/sports" className={linkClass}>
          {t('admin.sports')}
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          {t('admin.users')}
        </NavLink>
        <NavLink to="/admin/orders" className={linkClass}>
          {t('admin.orders')}
        </NavLink>
        <NavLink to="/admin/tickets" className={linkClass}>
          {t('admin.ticketCheck')}
        </NavLink>
        <NavLink to="/admin/promos" className={linkClass}>
          {t('admin.promos')}
        </NavLink>
        <NavLink to="/admin/waitlist" className={linkClass}>
          {t('admin.waitlist')}
        </NavLink>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
