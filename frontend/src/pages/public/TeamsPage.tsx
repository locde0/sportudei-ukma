import { useEffect, useState } from 'react';
import { fetchTeams } from '../../api/teams';
import { resolveImageUrl } from '../../utils/imageUrl';
import type { Team } from '../../types/team';
import styles from './TeamsPage.module.css';

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams()
      .then((list) => setTeams(list.filter((t) => t.is_active)))
      .catch(() => setError('Не вдалося завантажити команди'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Команди</h1>
        <p className={styles.subtitle}>Спортивні колективи студентської організації</p>
      </header>

      {loading && <p className={styles.state}>Завантаження...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && teams.length === 0 && (
        <p className={styles.state}>Команд поки немає</p>
      )}
      {!loading && !error && teams.length > 0 && (
        <div className={styles.grid}>
          {teams.map((team) => (
            <article key={team.id} className={styles.card}>
              <img src={resolveImageUrl(team.logo_url)} alt="" className={styles.logo} />
              <h2 className={styles.cardTitle}>{team.name}</h2>
              <p className={styles.description}>{team.description}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
