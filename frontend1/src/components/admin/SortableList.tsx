import { useState, type DragEvent, type ReactNode } from 'react';
import styles from './SortableList.module.css';

function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

interface SortableListProps<T extends { id: number }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  disabled?: boolean;
  onDragStart?: () => void;
  confirmingId?: number | null;
}

export function SortableList<T extends { id: number }>({
  items,
  onReorder,
  renderItem,
  disabled,
  onDragStart,
  confirmingId,
}: SortableListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (disabled) return;
    setDragIndex(index);
    if (onDragStart) onDragStart();
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (disabled || dragIndex === null) return;
    setDropIndex(index);
  };

  const handleDrop = (index: number) => {
    if (disabled || dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDropIndex(null);
      return;
    }
    onReorder(reorder(items, dragIndex, index));
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <li
          key={item.id}
          className={[
            styles.item,
            confirmingId === item.id ? styles.itemConfirming : '',
            dragIndex === index ? styles.dragging : '',
            dropIndex === index && dragIndex !== index ? styles.dropTarget : '',
          ]
            .filter(Boolean)
            .join(' ')}
          draggable={!disabled}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
        >
          <span
            className={styles.handle}
            aria-hidden
            onPointerDown={() => {
              if (onDragStart) onDragStart();
            }}
          >
            ⠿
          </span>
          <div className={styles.content}>{renderItem(item, index)}</div>
        </li>
      ))}
    </ul>
  );
}
