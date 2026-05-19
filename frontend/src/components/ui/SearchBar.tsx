import React from 'react';
import { MdSearch } from 'react-icons/md';

interface SearchBarProps {
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly placeholder?: string;
  readonly loading?: boolean;
}

export default function SearchBar({ value, onChange, placeholder = 'Search…', loading = false }: SearchBarProps) {
  return (
    <div className="search-wrap" style={{ position: 'relative' }}>
      <MdSearch className="search-icon" />
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {loading && (
        <span
          className="spinner"
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
        />
      )}
    </div>
  );
}
