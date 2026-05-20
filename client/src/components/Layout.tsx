import { NavLink, Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from '../auth';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-full text-sm font-semibold transition max-sm:w-full max-sm:text-center ${
      isActive
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-400/20'
        : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
    }`;

  function setLang(lang: 'ru' | 'en') {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <header className="sticky top-0 z-30 border-b border-brand-100/80 bg-white/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Link to="/" className="flex items-center gap-3 font-bold text-brand-800">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-sky-400 text-sm font-black text-white shadow-lg shadow-brand-400/25">
              SPT
            </span>
            <span className="hidden sm:inline leading-tight">
              <span className="block">{t('app.name')}</span>
              <span className="block text-xs font-medium text-slate-500">{t('app.region')}</span>
            </span>
          </Link>
          <button
            className="ml-auto rounded-full border border-brand-200 bg-white px-3 py-2 text-sm font-bold text-brand-700 sm:hidden"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? '×' : '☰'}
          </button>
          <nav
            className={`w-full flex-col gap-1 rounded-3xl border border-brand-100 bg-white/95 p-2 shadow-lg shadow-brand-900/10 sm:w-auto sm:flex sm:flex-row sm:rounded-full sm:p-1 ${
              menuOpen ? 'flex' : 'hidden'
            }`}
          >
            <NavLink to="/" end className={linkClass}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/events" className={linkClass}>
              {t('nav.events')}
            </NavLink>
            <NavLink to="/venues" className={linkClass}>
              {t('nav.venues')}
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              {t('nav.about')}
            </NavLink>
            {user && (
              <NavLink to="/profile" className={linkClass}>
                {t('nav.profile')}
              </NavLink>
            )}
            {user && (
              <NavLink to="/orders" className={linkClass}>
                {t('nav.myTickets')}
              </NavLink>
            )}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={linkClass}>
                {t('nav.admin')}
              </NavLink>
            )}
          </nav>
          <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
            <div className="flex rounded-full border border-brand-100 bg-white p-1 text-xs shadow-sm">
              <button
                className={`rounded-full px-3 py-1 ${
                  i18n.language === 'ru' ? 'bg-brand-600 text-white' : 'text-slate-600'
                }`}
                onClick={() => setLang('ru')}
              >
                RU
              </button>
              <button
                className={`rounded-full px-3 py-1 ${
                  i18n.language === 'en' ? 'bg-brand-600 text-white' : 'text-slate-600'
                }`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-slate-600">
                  {t('common.signedInAs')} <strong>{user.name}</strong>
                </span>
                <button onClick={logout} className="btn-outline max-sm:flex-1">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline max-sm:flex-1">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary max-sm:flex-1">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-5 sm:px-4 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-brand-100/80 bg-white/70 py-8 text-center text-sm text-slate-500 backdrop-blur">
        © {new Date().getFullYear()} {t('app.name')} · {t('app.region')}
      </footer>
    </div>
  );
}
