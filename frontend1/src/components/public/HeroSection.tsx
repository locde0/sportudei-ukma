import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import styles from './HeroSection.module.css';

const HERO_TITLE_LINE_1 = 'Спорт сьогодні!';
const HERO_TITLE_LINE_2 = 'Спорт завжди!';
const HERO_SUBTITLE = 'Платформа спортивного життя академії';

export function HeroSection() {
  const { settings } = useSiteSettings();

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>Спортудей · НаУКМА</span>
          <h1 className={styles.title}>
            <span className={styles.titleAccent}>{HERO_TITLE_LINE_1}</span>
            <span className={styles.titleMain}>{HERO_TITLE_LINE_2}</span>
          </h1>
          <p className={styles.subtitle}>{HERO_SUBTITLE}</p>
          
          <div className={styles.actions}>
            {settings.is_schedule_enabled && (
              <a href="/#events" className={styles.ctaPrimary}>
                Розклад подій
              </a>
            )}
            {settings.is_mohyla_games_enabled && (
              <a href="/#mohyla-games" className={styles.ctaSecondary}>
                Могилянські ігри
              </a>
            )}
          </div>
        </div>

        {/* Статистика повністю збережена, але тепер красиво адаптована знизу */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>12+</div>
            <div className={styles.statLabel}>Подій щороку</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>500+</div>
            <div className={styles.statLabel}>Учасників</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>6</div>
            <div className={styles.statLabel}>Видів спорту</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>10</div>
            <div className={styles.statLabel}>Років традиції</div>
          </div>
        </div>
      </div>
    </section>
  );
}