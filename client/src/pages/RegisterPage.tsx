import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth';
import { isValidEmail } from '../validation';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
      await register(email, password, name);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ??
            t('common.error'))
          : t('common.error');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6 mt-8">
      <h1 className="text-xl font-semibold mb-4">{t('auth.registerTitle')}</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">{t('auth.nameLabel')}</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            autoComplete="name"
          />
        </div>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {t('nav.register')}
        </button>
      </form>
      <p className="text-sm text-center text-slate-600 mt-4">
        <Link to="/login" className="text-brand-300 hover:underline">
          {t('auth.loginCta')}
        </Link>
      </p>
    </div>
  );
}
