import styles from './AdminToggle.module.css';

interface AdminToggleProps {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function AdminToggle({
  id,
  label,
  hint,
  checked,
  onChange,
  disabled,
}: AdminToggleProps) {
  return (
    <div className={styles.row}>
      <div className={styles.copy}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {hint && <p className={styles.hint}>{hint}</p>}
      </div>
      <label className={styles.toggle}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className={styles.track} />
        <span className={styles.thumb} />
      </label>
    </div>
  );
}
