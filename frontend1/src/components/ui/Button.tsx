import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'md' | 'sm';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined };

type LinkButtonProps = BaseProps & {
  to: string;
  disabled?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const cls = `${styles.button} ${styles[variant]} ${size === 'sm' ? styles.sm : ''} ${className}`;
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
}: LinkButtonProps) {
  const cls = `${styles.button} ${styles[variant]} ${size === 'sm' ? styles.sm : ''} ${className}`;
  if (disabled) {
    return <span className={`${cls} ${styles.button}`} style={{ opacity: 0.55 }}>{children}</span>;
  }
  return (
    <Link to={to} className={cls}>
      {children}
    </Link>
  );
}
