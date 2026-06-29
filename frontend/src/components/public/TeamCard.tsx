import { Link } from 'react-router-dom';
import type { Team } from '../../types/team';
import { resolveImageUrl } from '../../utils/imageUrl';
import page from '../../styles/publicPage.module.css';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link to={`/teams/${team.id}`} className={page.card}>
      <div className={page.logoWrap}>
        <img src={resolveImageUrl(team.logo_url)} alt="" className={page.logo} />
      </div>
      <div className={page.cardBody}>
        <h3 className={page.cardTitle}>{team.name}</h3>
        {team.description && (
          <p className={page.cardText}>
            {team.description.length > 100
              ? `${team.description.slice(0, 100)}…`
              : team.description}
          </p>
        )}
      </div>
    </Link>
  );
}
