import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOTP } from '../../api/auth';
import { setAccessToken } from '../../api/client';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import styles from './VerifyOTP.module.css';

export function VerifyOTP() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email as string | undefined;

  useEffect(() => {
    if (!email) navigate('/admin/login');
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { access_token } = await verifyOTP({ email: email!, code });
      setAccessToken(access_token);
      navigate('/admin');
    } catch {
      setError('Неправильний код або час дії минув');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.themeSlot}>
        <ThemeToggle />
      </div>

      <div className={styles.panel}>
        <h1 className={styles.title}>Код підтвердження</h1>
        <p className={styles.subtitle}>Надіслано на {email}</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleVerify}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            className={styles.codeInput}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
          />

          <button
            type="submit"
            className={styles.submit}
            disabled={loading || code.length < 6}
          >
            {loading ? 'Перевіряємо…' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  );
}
