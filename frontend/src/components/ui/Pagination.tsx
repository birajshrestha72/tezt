import React from 'react';
import './Pagination.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="wm-pagination">
      <button 
        className="wm-pagination-btn" 
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      
      <div className="wm-pagination-pages">
        {pages.map(p => (
          <button 
            key={p} 
            className={`wm-pagination-page${page === p ? ' wm-pagination-page--active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <button 
        className="wm-pagination-btn" 
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
