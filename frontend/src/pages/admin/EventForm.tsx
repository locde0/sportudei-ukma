import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  buildCreateEventFormData,
  createEvent,
  fetchAdminEvent,
  updateEvent,
  uploadEventPhoto,
} from '../../api/events';
import { AdminField } from '../../components/admin/AdminField';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSection } from '../../components/admin/AdminSection';
import { EventGalleryEditor } from '../../components/admin/EventGalleryEditor';
import { EventDateTimePicker } from '../../components/admin/EventDateTimePicker';
import { Button, LinkButton } from '../../components/ui/Button';
import type { EventPhoto, EventStatus, LocalGalleryItem } from '../../types/event';
import { toDatetimeLocalValue } from '../../utils/date';
import { EVENT_STATUS_OPTIONS } from '../../components/ui/EventStatusBadge';
import styles from './AdminFormLayout.module.css';

const SHORT_DESC_MAX = 200;

function sortPhotos(photos: EventPhoto[] | null | undefined): EventPhoto[] {
  return [...(photos ?? [])].sort((a, b) => a.display_order - b.display_order);
}

export function EventForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [content, setContent] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [status, setStatus] = useState<EventStatus>('planned');

  const [localItems, setLocalItems] = useState<LocalGalleryItem[]>([]);
  const localItemsRef = useRef(localItems);
  localItemsRef.current = localItems;
  const [remotePhotos, setRemotePhotos] = useState<EventPhoto[]>([]);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) {
      localItemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setTitle('');
      setShortDesc('');
      setContent('');
      setEventDate('');
      setLocation('');
      setRegistrationUrl('');
      setIsPublished(false);
      setStatus('planned');
      setLocalItems([]);
      setRemotePhotos([]);
      setLoading(false);
      setError('');
      return;
    }

    if (!id) return;

    setLoading(true);
    setError('');

    fetchAdminEvent(Number(id))
      .then((event) => {
        setTitle(event.title);
        setShortDesc(event.short_description);
        setContent(event.content);
        setEventDate(toDatetimeLocalValue(event.event_date));
        setLocation(event.location);
        setRegistrationUrl(event.registration_url ?? '');
        setIsPublished(event.is_published);
        setStatus(event.status ?? 'planned');
        setRemotePhotos(sortPhotos(event.photos));
      })
      .catch(() => setError('Не вдалося завантажити подію'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    return () => {
      localItemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const buildCreateFormData = (): FormData =>
    buildCreateEventFormData({
      title,
      short_description: shortDesc,
      content,
      event_date: new Date(eventDate).toISOString(),
      location,
      registration_url: registrationUrl,
      is_published: isPublished,
      photos: localItems.map((item) => item.file),
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !eventDate || !location.trim() || !content.trim()) {
      setError('Не вдалося зберегти. Перевірте поля та спробуйте ще раз.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (shortDesc.length > SHORT_DESC_MAX) {
      setError(`Короткий опис — максимум ${SHORT_DESC_MAX} символів`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit && id) {
        await updateEvent(Number(id), {
          title,
          short_description: shortDesc,
          content,
          event_date: new Date(eventDate).toISOString(),
          location,
          registration_url: registrationUrl,
          is_published: isPublished,
          status,
          photos: remotePhotos.map((p, index) => ({
            id: p.id,
            is_main: p.is_main,
            display_order: index,
          })),
        });
      } else {
        await createEvent(buildCreateFormData());
      }
      navigate('/admin/events');
    } catch {
      setError('Не вдалося зберегти. Перевірте поля та спробуйте ще раз.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        Завантажуємо подію…
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/admin/events')}>
        ← До списку подій
      </button>

      <AdminPageHeader
        eyebrow={isEdit ? 'Редагування' : 'Створення'}
        title={isEdit ? title || 'Подія' : 'Нова подія'}
        description={
          isEdit
            ? 'Оновіть інформацію про подію та галерею.'
            : 'Додайте фото, змініть порядок перетягуванням і оберіть обкладинку.'
        }
      />

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.grid}>
        <div className={styles.mainCol}>
          <AdminSection
            icon="✦"
            title="Заголовок і превʼю"
            description="Те, що побачать відвідувачі в каталозі"
          >
            <AdminField
              id="title"
              label="Назва події"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Благодійний марафон NaUKMA"
            />
            <AdminField
              id="shortDesc"
              label="Короткий опис"
              required
              maxLength={SHORT_DESC_MAX}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="До 200 символів для картки події"
              footer={
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.75rem',
                    color:
                      shortDesc.length > SHORT_DESC_MAX
                        ? 'var(--color-danger)'
                        : 'var(--color-text-muted)',
                  }}
                >
                  {shortDesc.length}/{SHORT_DESC_MAX}
                </span>
              }
            />
          </AdminSection>

          <AdminSection
            icon="¶"
            title="Повний опис"
            description="Детальна інформація на сторінці події"
          >
            <AdminField
              as="textarea"
              id="content"
              label="Текст події"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Розклад, правила участі, що взяти з собою…"
            />
          </AdminSection>

          <AdminSection
            icon="◷"
            title="Коли і де"
            description="Дата, час та локація проведення"
          >
            <div className={styles.fieldPair}>
              <EventDateTimePicker
                id="eventDate"
                required
                value={eventDate}
                onChange={setEventDate}
              />
              <AdminField
                id="location"
                label="Локація"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="КМЦ, парк НаУКМА, Google Meet…"
              />
            </div>
            <AdminField
              id="registrationUrl"
              label="Посилання на реєстрацію"
              type="url"
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
              placeholder="https://forms.gle/…"
              hint="Необовʼязково — кнопка зʼявиться на сторінці події"
            />
            </AdminSection>

            {isEdit && (
              <AdminSection
                icon="◉"
                title="Статус події"
                description="Заплановано, в процесі або завершено"
              >
                <AdminField
                  as="select"
                  id="eventStatus"
                  label="Статус"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  options={EVENT_STATUS_OPTIONS}
                />
              </AdminSection>
            )}

            <AdminSection
              icon="▣"
              title="Галерея"
            description="Перетягніть картки для зміни порядку"
          >
            {isEdit && id ? (
              <EventGalleryEditor
                mode="edit"
                photos={remotePhotos}
                onChange={setRemotePhotos}
                onUpload={(file) => uploadEventPhoto(Number(id), file)}
              />
            ) : (
              <EventGalleryEditor
                mode="create"
                items={localItems}
                onChange={setLocalItems}
              />
            )}
          </AdminSection>
        </div>

        <aside className={styles.sideCol}>
          <div className={styles.publishCard}>
            <p className={styles.publishCardTitle}>Статус</p>

            <div className={styles.publishRow}>
              <div>
                <p className={styles.publishLabel}>
                  {isPublished ? 'Опубліковано' : 'Чернетка'}
                </p>
                <p className={styles.publishHint}>
                  {isPublished
                    ? 'Видно на головній сторінці'
                    : 'Збережеться, але не показується'}
                </p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <span className={styles.toggleTrack} />
                <span className={styles.toggleThumb} />
              </label>
            </div>

            <div className={styles.sideActions}>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Зберігаємо…' : isEdit ? 'Зберегти зміни' : 'Створити подію'}
              </Button>
              <LinkButton to="/admin/events" variant="secondary" disabled={submitting}>
                Скасувати
              </LinkButton>
            </div>
          </div>


        </aside>
      </form>
    </div>
  );
}
