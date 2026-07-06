import { Link } from 'react-router-dom';
import type { Team } from '../../types/team';
import { resolveImageUrl } from '../../utils/imageUrl';
import page from '../../styles/publicPage.module.css';
import styles from './TeamCard.module.css';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link to={`/teams/${team.id}`} className={page.card}>
      <div className={styles.logoWrapper}>
        <img src={resolveImageUrl(team.logo_url)} alt={team.name} className={styles.logo} loading="lazy" />
      </div>
      <div className={page.cardBody}>
        <h3 className={page.cardTitle}>{team.name}</h3>
        {team.description && (
          <p className={styles.description}>
            {team.description}
          </p>
        )}
      </div>
    </Link>
  );
}
