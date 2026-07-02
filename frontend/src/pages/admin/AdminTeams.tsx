import { useCallback, useEffect, useState } from 'react';
import { deleteTeam, fetchAdminTeams } from '../../api/teams';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button, LinkButton } from '../../components/ui/Button';
import { resolveImageUrl } from '../../utils/imageUrl';
import type { Team } from '../../types/team';
import styles from './AdminListLayout.module.css';

export function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteErrorId, setDeleteErrorId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminTeams()
      .then(setTeams)
      .catch(() => setError('Не вдалося завантажити команди'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (confirmId === null) return;
    const handleClickOutside = () => {
      setConfirmId(null);
      setDeleteErrorId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [confirmId]);

  const handleDeleteClick = (id: number) => {
    setConfirmId(id);
    setDeleteErrorId(null);
  };

  const cancelDelete = () => {
    if (deletingId !== null) return;
    setConfirmId(null);
    setDeleteErrorId(null);
  };

  const confirmDelete = async (id: number) => {
    setDeletingId(id);
    setDeleteErrorId(null);
    try {
      await deleteTeam(id);
      load();
      setConfirmId(null);
    } catch {
      setDeleteErrorId(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Контент"
        title="Команди"
        description="Керуйте командами."
        actions={<LinkButton to="/admin/teams/new">+ Нова команда</LinkButton>}
      />

      {error && (
        <div className={`${styles.stateBox} ${styles.stateBoxError}`}>{error}</div>
      )}
      {loading && (
        <div className={styles.stateBox}>Завантаження…</div>
      )}
      {!loading && !error && teams.length === 0 && (
        <div className={styles.stateBox}>
          <div className={styles.emptyIcon}>⬢</div>
          <p className={styles.emptyTitle}>Команд ще немає</p>
          <p>Додайте першу команду — вона зʼявиться тут і на головній сторінці.</p>
          <div style={{ marginTop: '1.25rem' }}>
            <LinkButton to="/admin/teams/new">Створити команду</LinkButton>
          </div>
        </div>
      )}
      {!loading && !error && teams.length > 0 && (
        <div className={styles.list}>
          {teams.map((team) => {
            const isConfirming = confirmId === team.id;
            return (
            <article
              key={team.id}
              className={`${styles.card} ${isConfirming ? styles.cardConfirming : ''}`}
            >
              <div className={styles.thumbWrap}>
                {team.logo_url ? (
                  <img src={resolveImageUrl(team.logo_url)} alt="" className={styles.thumbContain} />
                ) : (
                  <div className={styles.thumbEmpty}>◎</div>
                )}
              </div>
              <div className={styles.body}>
                <div className={styles.meta}>
                  <span className={styles.id}>#{team.id}</span>
                  <Badge active={team.is_active} labelTrue="Активна" labelFalse="Неактивна" />
                </div>
                <h2 className={styles.title}>{team.name}</h2>
                <div className={styles.details}>
                  <span className={styles.detail} style={{ WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', display: '-webkit-box', overflow: 'hidden' }}>
                    {team.description}
                  </span>
                </div>
              </div>
              <div className={styles.actions}>
                <LinkButton to={`/admin/teams/${team.id}`} variant="secondary" size="sm">
                  Редагувати
                </LinkButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(team.id);
                  }}
                  disabled={deletingId !== null}
                >
                  Видалити
                </Button>
              </div>

              {confirmId === team.id && (
                <div
                  className={styles.confirmOverlay}
                  role="dialog"
                  aria-modal="true"
                  onClick={cancelDelete}
                >
                  <div className={styles.confirmCenter}>
                    <p className={styles.confirmTitle}>Видалити команду?</p>
                    {deleteErrorId === team.id && (
                      <p className={styles.confirmError}>Не вдалося видалити</p>
                    )}
                  </div>
                  <div
                    className={styles.confirmActions}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDelete(team.id)}
                      disabled={deletingId === team.id}
                    >
                      {deletingId === team.id ? 'Видалення…' : 'Так'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={cancelDelete}
                      disabled={deletingId === team.id}
                    >
                      Ні
                    </Button>
                  </div>
                </div>
              )}
            </article>
          )})}
        </div>
      )}
    </div>
  );
}
