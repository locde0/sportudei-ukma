import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchTeam } from '../../api/teams';
import { resolveImageUrl } from '../../utils/imageUrl';
import type { Team } from '../../types/team';
import page from '../../styles/publicPage.module.css';
import styles from './TeamDetailPage.module.css';

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const teamId = Number(id);
    if (!teamId) {
      setError('Невірний ідентифікатор команди');
      setLoading(false);
      return;
    }

    let ignore = false;
    fetchTeam(teamId)
      .then((data) => { if (!ignore) setTeam(data); })
      .catch(() => { if (!ignore) setError('Команду не знайдено'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [id]);

  if (loading) return <p className={page.state}>Завантаження...</p>;
  if (error || !team) return <p className={page.error}>{error || 'Команду не знайдено'}</p>;

  return (
    <article className={page.page}>
      <button onClick={() => navigate(-1)} className={page.back}>
        ← Назад
      </button>

      <div className={styles.hero}>
        <div className={styles.logoWrapper}>
          <img src={resolveImageUrl(team.logo_url)} alt={team.name} className={styles.logo} />
        </div>
        <div className={styles.info}>
          <h1 className={styles.title}>{team.name}</h1>
          {team.description && (
            <div className={styles.content}>{team.description}</div>
          )}
        </div>
      </div>
    </article>
  );
}
