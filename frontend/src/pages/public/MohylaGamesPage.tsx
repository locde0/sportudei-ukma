import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMohylaGame } from '../../api/games';
import { fetchTeams } from '../../api/teams';
import { TeamCard } from '../../components/public/TeamCard';
import type { MohylaGame } from '../../types/game';
import type { Team } from '../../types/team';
import { IconArrowLeft } from '../../components/ui/Icons';
import page from '../../styles/publicPage.module.css';
import pageStyles from '../../styles/publicPage.module.css';
import styles from './MohylaGamesPage.module.css';

export function MohylaGamesPage() {
  const [game, setGame] = useState<MohylaGame | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchMohylaGame(), fetchTeams()])
      .then(([gameData, teamsData]) => {
        setGame(gameData);
        setTeams(teamsData);
      })
      .catch(() => setError('Не вдалося завантажити сторінку'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={page.state}>Завантаження...</p>;
  if (error || !game) return <p className={page.error}>{error || 'Сторінку не знайдено'}</p>;

  return (
    <article className={page.page}>
        <Link to="/" className={pageStyles.back} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <IconArrowLeft size={16} /> На головну
        </Link>

      <header className={page.header}>
        <h1 className={page.title}>{game.title}</h1>
        {game.description && (
          <p className={page.subtitle}>{game.description}</p>
        )}
      </header>

      {game.content && (
        <div className={styles.prose}>
          {game.content}
        </div>
      )}

      <section className={styles.teamsSection}>
        <h2 className={styles.teamsTitle}>Учасники</h2>
        <p className={styles.teamsSubtitle}>
          Спортивні колективи, що беруть участь у Могилянських іграх
        </p>
        
        {teams.length === 0 ? (
          <p className={page.empty}>Наразі немає зареєстрованих команд</p>
        ) : (
          <div className={page.grid}>
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
