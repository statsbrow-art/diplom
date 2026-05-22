import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth';
import { isValidEmail } from '../validation';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError(t('auth.emailInvalid'));
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError(t('auth.invalid'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6 mt-8">
      <h1 className="text-xl font-semibold mb-4">{t('auth.loginTitle')}</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">{t('auth.emailLabel')}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label">{t('auth.passwordLabel')}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {t('nav.login')}
        </button>
      </form>
      <p className="text-sm text-center text-slate-600 mt-4">
        <Link to="/register" className="text-brand-300 hover:underline">
          {t('auth.registerCta')}
        </Link>
      </p>
    </div>
  );
}
