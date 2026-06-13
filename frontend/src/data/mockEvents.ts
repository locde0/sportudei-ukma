import type {
  EventDetail,
  EventListItem,
  PublicEventDetail,
  PublicEventListItem,
} from '../types/event';

const PLACEHOLDER = (seed: number) =>
  `https://picsum.photos/seed/sportudei${seed}/800/500`;

export const mockEventsList: EventListItem[] = [
  {
    id: 1,
    title: 'Благодійний марафон NaUKMA',
    short_description:
      'Щорічний забіг на підтримку студентських спортивних ініціатив. Дистанції 5 та 10 км.',
    event_date: '2026-04-12T09:00:00Z',
    location: 'Кампус NaUKMA, парк',
    is_published: true,
    main_photo_url: PLACEHOLDER(1),
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'Чемпіонат з волейболу між факультетами',
    short_description:
      'Міжфакультетський турнір. Команди по 6 гравців, реєстрація до 20 березня.',
    event_date: '2026-03-28T14:00:00Z',
    location: 'Спортзал КМЦ',
    is_published: true,
    main_photo_url: PLACEHOLDER(2),
    created_at: '2026-02-01T12:00:00Z',
  },
  {
    id: 3,
    title: 'Лекція «Здоровий спосіб життя студента»',
    short_description:
      'Онлайн-зустріч із нутриціологом про харчування, сон та фізичну активність.',
    event_date: '2026-03-05T18:00:00Z',
    location: 'Google Meet',
    is_published: true,
    main_photo_url: PLACEHOLDER(3),
    created_at: '2026-02-10T09:00:00Z',
  },
  {
    id: 4,
    title: 'Турнір з міні-футболу Sportudei Cup',
    short_description:
      'Змагання між університетськими командами Києва. Формат 5×5, призовий фонд.',
    event_date: '2026-05-20T10:00:00Z',
    location: 'Стадіон «Динамо», м. Київ',
    is_published: true,
    main_photo_url: PLACEHOLDER(4),
    created_at: '2026-02-20T14:00:00Z',
  },
];

export const mockEventsDetail: Record<number, EventDetail> = {
  1: {
    id: 1,
    title: 'Благодійний марафон NaUKMA',
    short_description:
      'Щорічний забіг на підтримку студентських спортивних ініціатив. Дистанції 5 та 10 км.',
    content: `Sportudei-UKMA запрошує всіх студентів та викладачів на щорічний благодійний марафон!

**Програма:**
- 09:00 — реєстрація учасників
- 10:00 — старт на дистанцію 5 км
- 10:30 — старт на дистанцію 10 км
- 12:00 — нагородження переможців

Усі зібрані кошти спрямовуються на розвиток студентського спорту в Академії.`,
    event_date: '2026-04-12T09:00:00Z',
    location: 'Кампус NaUKMA, парк',
    registration_url: 'https://forms.gle/example-marathon',
    is_published: true,
    photos: [
      { id: 1, image_url: PLACEHOLDER(11), is_main: true, display_order: 0 },
      { id: 2, image_url: PLACEHOLDER(12), is_main: false, display_order: 1 },
      { id: 3, image_url: PLACEHOLDER(13), is_main: false, display_order: 2 },
      { id: 4, image_url: PLACEHOLDER(14), is_main: false, display_order: 3 },
      { id: 5, image_url: PLACEHOLDER(15), is_main: false, display_order: 4 },
    ],
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  2: {
    id: 2,
    title: 'Чемпіонат з волейболу між факультетами',
    short_description:
      'Міжфакультетський турнір. Команди по 6 гравців, реєстрація до 20 березня.',
    content: `Змагання з волейболу — одна з найулюбленіших традицій Sportudei-UKMA.

Факультети формують команди по 6 гравців (мінімум 2 представники іншої статі). Турнір проходитиме за олімпійською системою.`,
    event_date: '2026-03-28T14:00:00Z',
    location: 'Спортзал КМЦ',
    registration_url: 'https://forms.gle/example-volleyball',
    is_published: true,
    photos: [
      { id: 6, image_url: PLACEHOLDER(21), is_main: true, display_order: 0 },
      { id: 7, image_url: PLACEHOLDER(22), is_main: false, display_order: 1 },
      { id: 8, image_url: PLACEHOLDER(23), is_main: false, display_order: 2 },
    ],
    created_at: '2026-02-01T12:00:00Z',
    updated_at: '2026-02-01T12:00:00Z',
  },
  3: {
    id: 3,
    title: 'Лекція «Здоровий спосіб життя студента»',
    short_description:
      'Онлайн-зустріч із нутриціологом про харчування, сон та фізичну активність.',
    content: `Запрошуємо на онлайн-лекцію про баланс між навчанням та здоров'ям.

Теми: режим сну, харчування в гуртожитку, прості вправи без залу.`,
    event_date: '2026-03-05T18:00:00Z',
    location: 'Google Meet',
    registration_url: 'https://meet.google.com/example',
    is_published: true,
    photos: [{ id: 4, image_url: PLACEHOLDER(31), is_main: true, display_order: 0 }],
    created_at: '2026-02-10T09:00:00Z',
    updated_at: '2026-02-10T09:00:00Z',
  },
  4: {
    id: 4,
    title: 'Турнір з міні-футболу Sportudei Cup',
    short_description:
      'Змагання між університетськими командами Києва. Формат 5×5, призовий фонд.',
    content: `Sportudei Cup — відкритий турнір з міні-футболу для студентських команд.

Реєстрація команд до 1 травня. Максимум 16 команд.`,
    event_date: '2026-05-20T10:00:00Z',
    location: 'Стадіон «Динамо», м. Київ',
    registration_url: null,
    is_published: true,
    photos: [
      { id: 9, image_url: PLACEHOLDER(41), is_main: true, display_order: 0 },
      { id: 10, image_url: PLACEHOLDER(42), is_main: false, display_order: 1 },
      { id: 11, image_url: PLACEHOLDER(43), is_main: false, display_order: 2 },
      { id: 12, image_url: PLACEHOLDER(44), is_main: false, display_order: 3 },
    ],
    created_at: '2026-02-20T14:00:00Z',
    updated_at: '2026-02-20T14:00:00Z',
  },
};

export const mockPublicEventsList: PublicEventListItem[] = mockEventsList.map(
  ({ id, title, short_description, event_date, location, main_photo_url }, index) => ({
    id,
    title,
    short_description: short_description ?? '',
    event_date,
    location,
    main_photo_url,
    status: (index === 0 ? 'in_progress' : index === 1 ? 'planned' : 'completed') as const,
  }),
);

export const mockPublicEventsDetail: Record<number, PublicEventDetail> =
  Object.fromEntries(
    Object.entries(mockEventsDetail).map(([id, event]) => [
      id,
      {
        id: event.id,
        title: event.title,
        short_description: event.short_description,
        content: event.content,
        event_date: event.event_date,
        location: event.location,
        registration_url: event.registration_url ?? '',
        status: 'planned' as const,
        photos: event.photos,
      },
    ]),
  );
