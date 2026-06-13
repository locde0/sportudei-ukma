import { useEffect, useId, useRef, useState } from 'react';
import {
  buildDatetimeLocal,
  formatDateButton,
  formatDatetimePreview,
  getCalendarMonthLabel,
  getCalendarWeeks,
  isSameDay,
  parseDatetimeLocal,
  type DatetimeParts,
} from '../../utils/date';
import styles from './EventDateTimePicker.module.css';

interface EventDateTimePickerProps {
  id?: string;
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const TIME_PRESETS = [
  { label: '09:00', hours: 9, minutes: 0 },
  { label: '12:00', hours: 12, minutes: 0 },
  { label: '18:00', hours: 18, minutes: 0 },
];

function todayParts(): DatetimeParts {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
    hours: now.getHours(),
    minutes: now.getMinutes(),
  };
}

function defaultValue(): string {
  const today = todayParts();
  return buildDatetimeLocal({ ...today, hours: 10, minutes: 0 });
}

function roundMinutes(minutes: number): number {
  return Math.round(minutes / 5) * 5;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function EventDateTimePicker({
  id: idProp,
  label = 'Дата і час',
  required,
  value,
  onChange,
}: EventDateTimePickerProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  const parts = parseDatetimeLocal(value);
  const preview = formatDatetimePreview(value);
  const today = todayParts();
  const panelOpen = calendarOpen || timeOpen;

  const [viewYear, setViewYear] = useState(parts?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState(parts?.month ?? today.month);

  useEffect(() => {
    if (!parts) return;
    setViewYear(parts.year);
    setViewMonth(parts.month);
  }, [parts?.year, parts?.month]);

  useEffect(() => {
    if (!panelOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) {
        setCalendarOpen(false);
        setTimeOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCalendarOpen(false);
        setTimeOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [panelOpen]);

  const patch = (patchParts: Partial<DatetimeParts>) => {
    const base = parts ?? { ...today, hours: 10, minutes: 0 };
    onChange(buildDatetimeLocal({ ...base, ...patchParts }));
  };

  const applyToday = (hours = parts?.hours ?? 10, minutes = parts?.minutes ?? 0) => {
    onChange(buildDatetimeLocal({ ...today, hours, minutes }));
    setViewYear(today.year);
    setViewMonth(today.month);
    setCalendarOpen(false);
  };

  const applyTime = (hours: number, minutes: number, close = false) => {
    patch({ hours, minutes });
    if (close) setTimeOpen(false);
  };

  const shiftMonth = (delta: number) => {
    const date = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
  };

  const selectDay = (day: number) => {
    patch({ year: viewYear, month: viewMonth, day });
    setCalendarOpen(false);
  };

  const weeks = getCalendarWeeks(viewYear, viewMonth);
  const todayDate = new Date(today.year, today.month, today.day);
  const selectedDate = parts
    ? new Date(parts.year, parts.month, parts.day)
    : null;

  const hourValue = parts?.hours ?? 10;
  const minuteValue = parts ? roundMinutes(parts.minutes) : 0;
  const timeLabel = value ? `${pad2(hourValue)}:${pad2(minuteValue)}` : 'Оберіть час';

  return (
    <div className={styles.field} ref={rootRef}>
      <label className={styles.label} htmlFor={`${id}-date`}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <input
        type="text"
        value={value}
        required={required}
        tabIndex={-1}
        aria-hidden
        className={styles.srOnly}
        readOnly
      />

      <div
        className={`${styles.picker} ${value ? styles.pickerFilled : ''} ${panelOpen ? styles.pickerOpen : ''}`}
      >
        <div className={styles.preview}>
          <div className={styles.previewDate}>
            <span className={styles.previewDay}>{preview?.day ?? '—'}</span>
            <div className={styles.previewMeta}>
              <span className={styles.previewWeekday}>
                {preview?.weekday ?? 'День тижня'}
              </span>
              <span className={styles.previewMonth}>
                {preview?.monthYear ?? 'Оберіть дату'}
              </span>
            </div>
          </div>
          <div className={styles.previewTime}>
            <span className={styles.previewTimeLabel}>Час</span>
            <span className={styles.previewTimeValue}>{preview?.time ?? '—:—'}</span>
          </div>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            id={`${id}-date`}
            className={`${styles.controlBtn} ${calendarOpen ? styles.controlBtnOpen : ''}`}
            onClick={() => {
              setCalendarOpen((prev) => !prev);
              setTimeOpen(false);
            }}
            aria-expanded={calendarOpen}
            aria-haspopup="dialog"
          >
            <span className={styles.controlIcon} aria-hidden>
              ◷
            </span>
            <span className={styles.controlText}>{formatDateButton(value)}</span>
          </button>

          <button
            type="button"
            id={`${id}-time`}
            className={`${styles.controlBtn} ${timeOpen ? styles.controlBtnOpen : ''}`}
            onClick={() => {
              setTimeOpen((prev) => !prev);
              setCalendarOpen(false);
            }}
            aria-expanded={timeOpen}
            aria-haspopup="dialog"
          >
            <span className={styles.controlIcon} aria-hidden>
              ◔
            </span>
            <span className={styles.controlText}>{timeLabel}</span>
          </button>
        </div>

        {calendarOpen && (
          <div className={styles.calendar} role="dialog" aria-label="Календар">
            <div className={styles.calendarHead}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => shiftMonth(-1)}
                aria-label="Попередній місяць"
              >
                ‹
              </button>
              <span className={styles.calendarTitle}>
                {getCalendarMonthLabel(viewYear, viewMonth)}
              </span>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => shiftMonth(1)}
                aria-label="Наступний місяць"
              >
                ›
              </button>
            </div>

            <div className={styles.weekdays}>
              {WEEKDAYS.map((day) => (
                <span key={day} className={styles.weekday}>
                  {day}
                </span>
              ))}
            </div>

            <div className={styles.days}>
              {weeks.flat().map((date, index) => {
                if (!date) {
                  return <span key={`empty-${index}`} className={styles.dayEmpty} />;
                }

                const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                const isToday = isSameDay(date, todayDate);

                return (
                  <button
                    key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                    type="button"
                    className={`${styles.dayBtn} ${isSelected ? styles.daySelected : ''} ${isToday ? styles.dayToday : ''}`}
                    onClick={() => selectDay(date.getDate())}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className={styles.panelFoot}>
              <button type="button" className={styles.quickBtn} onClick={() => applyToday()}>
                Сьогодні
              </button>
              <button
                type="button"
                className={styles.quickBtn}
                onClick={() => {
                  onChange(defaultValue());
                  setViewYear(today.year);
                  setViewMonth(today.month);
                  setCalendarOpen(false);
                }}
              >
                10:00 сьогодні
              </button>
            </div>
          </div>
        )}

        {timeOpen && (
          <div className={styles.timePanel} role="dialog" aria-label="Час">
            <div className={styles.timePanelHead}>
              <span className={styles.timePanelTitle}>Оберіть час</span>
              <span className={styles.timePanelValue}>{timeLabel}</span>
            </div>

            <div className={styles.timeSections}>
              <div className={styles.timeSection}>
                <span className={styles.timeSectionLabel}>Година</span>
                <div className={styles.timeGrid}>
                  {HOURS.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      className={`${styles.timeOption} ${hourValue === hour ? styles.timeOptionSelected : ''}`}
                      onClick={() => applyTime(hour, minuteValue)}
                    >
                      {pad2(hour)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.timeSection}>
                <span className={styles.timeSectionLabel}>Хвилини</span>
                <div className={styles.timeGridMinutes}>
                  {MINUTES.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      className={`${styles.timeOption} ${minuteValue === minute ? styles.timeOptionSelected : ''}`}
                      onClick={() => applyTime(hourValue, minute)}
                    >
                      {pad2(minute)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.panelFoot}>
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={styles.quickBtn}
                  onClick={() => applyTime(preset.hours, preset.minutes, true)}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                className={styles.quickBtn}
                onClick={() => {
                  const now = todayParts();
                  applyTime(now.hours, roundMinutes(now.minutes), true);
                }}
              >
                Зараз
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
