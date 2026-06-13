import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import styles from './HeroSection.module.css';

const HERO_TITLE_LINE_1 = 'Спорт сьогодні!';
const HERO_TITLE_LINE_2 = 'Спорт завжди!';
const HERO_SUBTITLE = 'Офіційна платформа спортивного життя Києво-Могилянської Академії. Будь у центрі подій, вболівай за своїх та ставай частиною спортивної історії університету.';

export function HeroSection() {
  const { settings } = useSiteSettings();

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.heroBackground} />
      <div className={styles.heroGlow1} />
      <div className={styles.heroGlow2} />
      
      <div className={styles.inner}>
        <span className={styles.eyebrow}>Спортудей · НаУКМА</span>
        
        <h1 className={styles.title}>
          <span className={styles.titleAccent}>{HERO_TITLE_LINE_1}</span>
          <span>{HERO_TITLE_LINE_2}</span>
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
