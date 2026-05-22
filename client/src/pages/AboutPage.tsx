import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section className="hero-card p-8 text-white">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-100">{t('about.kicker')}</p>
        <h1 className="mt-3 text-4xl font-black">{t('about.title')}</h1>
        <p className="mt-4 max-w-3xl text-blue-50">{t('about.text')}</p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="feature-card">
          <div className="feature-icon">1</div>
          <h2>{t('about.steps.discoverTitle')}</h2>
          <p>{t('about.steps.discoverText')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">2</div>
          <h2>{t('about.steps.selectTitle')}</h2>
          <p>{t('about.steps.selectText')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">3</div>
          <h2>{t('about.steps.ticketTitle')}</h2>
          <p>{t('about.steps.ticketText')}</p>
        </div>
      </section>

      <section className="section-card p-6">
        <p className="section-kicker">{t('about.ctaKicker')}</p>
        <h2 className="text-2xl font-bold">{t('about.ctaTitle')}</h2>
        <p className="mt-2 text-slate-600">{t('about.ctaText')}</p>
        <Link to="/events" className="btn-primary mt-5">
          {t('home.findTickets')}
        </Link>
      </section>
    </div>
  );
}
