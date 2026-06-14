import { type ReactNode, useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useI18n } from '../i18n';

export interface Column<T> {
  key: keyof T & string;
  label: string;
  render?: (val: T[keyof T], row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onDelete,
  emptyMessage,
}: DataTableProps<T>) {
  const { t } = useI18n();
  const displayEmptyMessage = emptyMessage || t('common.no_data');

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      setScrollTop(el.scrollTop);
    };

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height || el.clientHeight);
      }
    });

    el.addEventListener('scroll', handleScroll, { passive: true });
    resizeObserver.observe(el);

    setScrollTop(el.scrollTop);
    setContainerHeight(el.clientHeight);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [data.length]);

  if (data.length === 0) {
    return <div className="data-table-empty">{displayEmptyMessage}</div>;
  }

  // Virtualization constants
  const rowHeight = 52; // Average height of table row in pixels
  const buffer = 5; // Number of extra rows to render above/below viewport
  const colCount = columns.length + (onDelete ? 1 : 0);

  const startIdx = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const endIdx = Math.min(
    data.length,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + buffer
  );

  const topSpacerHeight = startIdx * rowHeight;
  const bottomSpacerHeight = (data.length - endIdx) * rowHeight;

  const visibleData = data.slice(startIdx, endIdx);

  return (
    <div
      className="table-container"
      ref={containerRef}
      style={{ overflowY: 'auto', maxHeight: '600px', position: 'relative' }}
    >
      <table className="table">
        <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--surface)' }}>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {onDelete && <th style={{ width: '60px' }}>{t('common.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {topSpacerHeight > 0 && (
            <tr style={{ height: `${topSpacerHeight}px` }}>
              <td colSpan={colCount} style={{ padding: 0, border: 'none' }} />
            </tr>
          )}
          {visibleData.map((row) => (
            <tr key={row.id} style={{ height: `${rowHeight}px` }}>
              {columns.map((col) => {
                const cellValue = row[col.key];
                return (
                  <td key={col.key}>
                    {col.render ? col.render(cellValue, row) : String(cellValue ?? '')}
                  </td>
                );
              })}
              {onDelete && (
                <td>
                  <button
                    className="btn btn--icon btn--danger"
                    onClick={() => onDelete(row.id)}
                    title={t('common.delete')}
                    aria-label={t('common.delete_record')}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
          {bottomSpacerHeight > 0 && (
            <tr style={{ height: `${bottomSpacerHeight}px` }}>
              <td colSpan={colCount} style={{ padding: 0, border: 'none' }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
