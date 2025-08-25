import React from 'react';
import { cn } from '../../utils/cn';

const buttonVariants = {
  default: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const buttonSizes = {
  sm: 'h-8 px-3 text-xs',
  default: 'h-10 px-4 py-2',
  lg: 'h-12 px-8 text-base',
  xl: 'h-14 px-10 text-lg',
};

const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  children,
  ...props
}, ref) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        loading && 'pointer-events-none opacity-75',
        className
      )}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading && (
        <div className="loading-dots mr-2">
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
