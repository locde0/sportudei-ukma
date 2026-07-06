import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { login } from '../../api/auth';
import { getAccessToken } from '../../api/client';
import { Logo } from '../../components/brand/Logo';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { IconArrowLeft } from '../../components/ui/Icons';
import styles from './Login.module.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (getAccessToken()) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/admin/verify', { state: { email } });
    } catch {
      setError('Неправильний логін або пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <IconArrowLeft size={16} /> На головну
        </Link>
        <ThemeToggle />
      </div>

      <div className={styles.panel}>
        <div className={styles.brand}>
          <Logo size={80} showText={false} />
          <span className={styles.brandSub}>Панель керування</span>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@sportudei.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Надсилаємо код…' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  );
}
