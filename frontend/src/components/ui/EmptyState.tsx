import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  readonly icon?: React.ReactNode;
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <span>{icon}</span>}
      <p className="empty-state__title">{title}</p>
      {subtitle && <p className="empty-state__sub">{subtitle}</p>}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
