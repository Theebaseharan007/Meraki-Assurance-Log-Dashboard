import React from 'react';
import { cn } from '../../utils/cn';
import { getStatusColor } from '../../utils/format';

const badgeVariants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-input bg-background text-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
};

const Badge = React.forwardRef(({ 
  className, 
  variant = 'default',
  status,
  children,
  ...props 
}, ref) => {
  // If status is provided, use status-based styling
  const statusClass = status ? getStatusColor(status) : null;
  
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        statusClass || badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Badge.displayName = 'Badge';

// Status-specific badge components for convenience
export const StatusBadge = ({ status, children, ...props }) => (
  <Badge status={status} {...props}>
    {children || status}
  </Badge>
);

export const PassedBadge = ({ children, ...props }) => (
  <StatusBadge status="passed" {...props}>
    {children || 'Passed'}
  </StatusBadge>
);

export const FailedBadge = ({ children, ...props }) => (
  <StatusBadge status="failed" {...props}>
    {children || 'Failed'}
  </StatusBadge>
);

export const SkippedBadge = ({ children, ...props }) => (
  <StatusBadge status="skipped" {...props}>
    {children || 'Skipped'}
  </StatusBadge>
);

export const ErroredBadge = ({ children, ...props }) => (
  <StatusBadge status="errored" {...props}>
    {children || 'Errored'}
  </StatusBadge>
);

export { Badge, badgeVariants };
