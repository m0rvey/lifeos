import { type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
 
interface Column<T> {
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
  emptyMessage = 'Нет данных для отображения',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <div className="data-table-empty">{emptyMessage}</div>;
  }
 
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {onDelete && <th style={{ width: '60px' }}>Действия</th>}
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
                    title="Удалить"
                    aria-label="Удалить запись"
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
