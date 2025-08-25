import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Textarea = forwardRef(({ 
  className, 
  label, 
  error, 
  rows = 3,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="text-sm font-medium mb-2 block">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          error && "border-red-500",
          className
        )}
        ref={ref}
        rows={rows}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
