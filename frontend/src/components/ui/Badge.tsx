import React from 'react';
import './Badge.css';

interface BadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'loyalty';
}

export default function Badge({ label, type = 'neutral' }: BadgeProps) {
  return <span className={`wm-badge wm-badge--${type}`}>{label}</span>;
}
