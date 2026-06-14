import { type ReactNode, useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useI18n } from '../i18n';

export interface Column<T> {
  key: keyof T & string;
  label: string;
  render?: (val: T[keyof T], row: T) => ReactNode;
  truncate?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  rowHeight?: number;
  maxHeight?: string;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onDelete,
  emptyMessage,
  rowHeight = 52,
  maxHeight = '600px',
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

  const buffer = 5;
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
      style={{ maxHeight }}
    >
      <table className="table">
        <thead className="table-thead-sticky">
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {onDelete && <th className="table-th-actions">{t('common.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {topSpacerHeight > 0 && (
            <tr style={{ height: `${topSpacerHeight}px` }}>
              <td colSpan={colCount} className="table-spacer" />
            </tr>
          )}
          {visibleData.map((row) => (
            <tr key={row.id} style={{ height: `${rowHeight}px` }}>
              {columns.map((col) => {
                const cellValue = row[col.key];
                return (
                  <td
                    key={col.key}
                    className={col.truncate !== false ? 'table-cell-truncate' : undefined}
                  >
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
              <td colSpan={colCount} className="table-spacer" />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
