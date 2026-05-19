import React from 'react';
import EmptyState from './EmptyState';
import { MdTableRows } from 'react-icons/md';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  readonly columns: Column<T>[];
  readonly data: T[];
  readonly loading?: boolean;
  readonly keyExtractor: (row: T) => string | number;
  readonly emptyMessage?: string;
  readonly emptyIcon?: React.ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  keyExtractor,
  emptyMessage = 'No data found.',
  emptyIcon,
}: DataTableProps<T>) {
  return (
    <div className="table-card">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className={col.align === 'right' ? 'right' : ''}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map(col => (
                      <td key={col.key}>
                        <div className="skeleton sk-row" style={{ height: 14, borderBottom: 'none', borderRadius: 4 }} />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map(row => (
                  <tr key={keyExtractor(row)}>
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={col.align === 'right' ? 'right' : ''}
                      >
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && data.length === 0 && (
          <EmptyState
            icon={emptyIcon ?? <MdTableRows />}
            title={emptyMessage}
          />
        )}
      </div>
    </div>
  );
}
