import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTeams } from '../../api/teams';
import { TeamCard } from '../../components/public/TeamCard';
import type { Team } from '../../types/team';
import page from '../../styles/publicPage.module.css';

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams()
      .then(setTeams)
      .catch(() => setError('Не вдалося завантажити команди'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={page.page}>
      <Link to="/#teams" className={page.back}>
        ← На головну
      </Link>
      <header className={page.header}>
        <h1 className={page.title}>Команди</h1>
      </header>

      {loading && <p className={page.state}>Завантаження...</p>}
      {error && <p className={page.error}>{error}</p>}
      {!loading && !error && teams.length === 0 && (
        <p className={page.empty}>Команд наразі немає</p>
      )}
      {!loading && !error && teams.length > 0 && (
        <div className={page.grid}>
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
