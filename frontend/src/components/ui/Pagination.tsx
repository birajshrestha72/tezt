import React from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface PaginationProps {
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly onChange: (page: number) => void;
}

export default function Pagination({ total, page, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = Math.min((page - 1) * pageSize + 1, total);
  const end   = Math.min(page * pageSize, total);

  const pages = buildPages(page, totalPages);

  return (
    <div className="table-footer">
      <span className="table-count">
        Showing {start}–{end} of {total} entries
      </span>
      <div className="pagination">
        <button
          className="pag-btn"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <MdChevronLeft />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i < pages.length / 2 ? 'left' : 'right'}`} className="pag-btn" style={{ cursor: 'default', opacity: 0.5 }}>…</span>
          ) : (
            <button
              key={p}
              className={`pag-btn${p === page ? ' active' : ''}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          className="pag-btn"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          <MdChevronRight />
        </button>
      </div>
    </div>
  );
}

function buildPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}
