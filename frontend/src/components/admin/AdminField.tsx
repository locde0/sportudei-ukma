import {
  useState,
  useRef,
  useEffect,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import styles from './AdminField.module.css';

interface BaseProps {
  label: string;
  hint?: string;
  required?: boolean;
  footer?: ReactNode;
}

type InputFieldProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };

type TextareaFieldProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' };

type SelectFieldProps = BaseProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    as: 'select';
    options: { value: string; label: string }[];
  };

function stripFieldProps<T extends BaseProps & { as?: string }>(
  props: T,
): Omit<T, keyof BaseProps | 'as' | 'options'> {
  const { label: _l, hint: _h, required: _r, footer: _f, as: _a, ...rest } = props as T & {
    options?: unknown;
  };
  if ('options' in rest) {
    const { options: _o, ...inputRest } = rest as { options?: unknown };
    return inputRest as Omit<T, keyof BaseProps | 'as' | 'options'>;
  }
  return rest as Omit<T, keyof BaseProps | 'as' | 'options'>;
}

export function AdminField(props: InputFieldProps | TextareaFieldProps | SelectFieldProps) {
  const { label, hint, required, footer, as = 'input' } = props;
  const id = props.id ?? props.name;

  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (as !== 'select') return;
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [as]);

  const selectProps = as === 'select' ? (props as SelectFieldProps) : null;
  const selectedOption = selectProps?.options.find((o) => o.value === selectProps.value);

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      {as === 'textarea' ? (
        <textarea
          className={styles.textarea}
          id={id}
          {...stripFieldProps(props as TextareaFieldProps)}
        />
      ) : as === 'select' && selectProps ? (
        <div className={styles.customSelectWrapper} ref={selectRef}>
          <div
            className={`${styles.select} ${isOpen ? styles.selectOpen : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            id={id}
            tabIndex={0}
          >
            {selectedOption ? selectedOption.label : 'Оберіть...'}
          </div>
          {isOpen && (
            <div className={styles.selectDropdown}>
              {selectProps.options.map((opt) => (
                <div
                  key={opt.value}
                  className={`${styles.selectOption} ${
                    opt.value === selectProps.value ? styles.selectOptionActive : ''
                  }`}
                  onClick={() => {
                    const e = {
                      target: { value: opt.value },
                    } as unknown as React.ChangeEvent<HTMLSelectElement>;
                    selectProps.onChange?.(e);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <input
          className={styles.input}
          id={id}
          {...stripFieldProps(props as InputFieldProps)}
        />
      )}

      {(hint || footer) && (
        <div className={styles.footer}>
          {hint && <span className={styles.hint}>{hint}</span>}
          {footer}
        </div>
      )}
    </div>
  );
}
