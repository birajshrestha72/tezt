import React from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'amber' | 'muted' | 'primary';

interface BadgeProps {
  readonly variant: Variant;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export default function Badge({ variant, children, className = '' }: Readonly<BadgeProps>) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {children}
    </span>
  );
}

const SUCCESS = new Set(['Paid', 'Active', 'Confirmed', 'Received', 'Completed', 'Fulfilled']);
const WARNING = new Set(['Pending']);
const DANGER  = new Set(['Cancelled', 'Rejected', 'Critical']);
const INFO    = new Set(['Shipped', 'Reviewing']);

export function getStatusBadge(status: string): React.JSX.Element {
  let variant: Variant = 'muted';
  if (SUCCESS.has(status)) variant = 'success';
  else if (WARNING.has(status)) variant = 'warning';
  else if (DANGER.has(status))  variant = 'danger';
  else if (INFO.has(status))    variant = 'info';

  return <Badge variant={variant}>{status}</Badge>;
}
