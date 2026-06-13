import { useEffect, useState } from 'react';
import { fetchMohylaGame, MOHYLA_GAME_ID } from '../../api/games';
import type { MohylaGame } from '../../types/game';
import styles from './MohylaGamesPage.module.css';

export function MohylaGamesPage() {
  const [game, setGame] = useState<MohylaGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMohylaGame(MOHYLA_GAME_ID)
      .then(setGame)
      .catch(() => setError('Сторінку не знайдено'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={styles.state}>Завантаження...</p>;
  if (error || !game) return <p className={styles.error}>{error || 'Сторінку не знайдено'}</p>;
  if (!game.is_published) return <p className={styles.state}>Сторінка тимчасово недоступна</p>;

  return (
    <article className={styles.page}>
      <h1 className={styles.title}>{game.title}</h1>
      <p className={styles.lead}>{game.short_description}</p>
      <div className={styles.content}>{game.content}</div>
    </article>
  );
}
