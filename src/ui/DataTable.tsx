import { type ReactNode } from 'react';
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

  if (data.length === 0) {
    return <div className="data-table-empty">{displayEmptyMessage}</div>;
  }
 
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {onDelete && <th style={{ width: '60px' }}>{t('common.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
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
        </tbody>
      </table>
    </div>
  );
}
