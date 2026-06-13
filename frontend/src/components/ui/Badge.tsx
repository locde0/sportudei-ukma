import styles from './Badge.module.css';

interface BadgeProps {
  published?: boolean;
  active?: boolean;
  labelTrue?: string;
  labelFalse?: string;
}

export function Badge({ published, active, labelTrue, labelFalse }: BadgeProps) {
  const isPositive = published !== undefined ? published : active;
  
  let label = isPositive ? 'Опубліковано' : 'Чернетка';
  if (labelTrue && labelFalse) {
    label = isPositive ? labelTrue : labelFalse;
  }

  return (
    <span className={`${styles.badge} ${isPositive ? styles.published : styles.draft}`}>
      {label}
    </span>
  );
}
