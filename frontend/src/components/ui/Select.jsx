import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

const Select = React.forwardRef(({ 
  className,
  options = [],
  value,
  onValueChange,
  placeholder = 'Select an option...',
  disabled = false,
  error,
  label,
  description,
  required,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    options.find(option => option.value === value) || null
  );
  const selectRef = useRef(null);
  const inputId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

  // Update selected option when value prop changes
  useEffect(() => {
    const option = options.find(option => option.value === value);
    setSelectedOption(option || null);
  }, [value, options]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(option.value);
    }
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Focus next option logic could be added here
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          // Focus previous option logic could be added here
        }
        break;
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={selectRef}>
        <button
          ref={ref}
          id={inputId}
          type="button"
          className={cn(
            'input flex items-center justify-between cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          {...props}
        >
          <span className={cn(
            'truncate',
            !selectedOption && 'text-muted-foreground'
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={cn(
              'h-4 w-4 transition-transform duration-200 flex-shrink-0',
              isOpen && 'transform rotate-180'
            )} 
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none flex items-center justify-between',
                    selectedOption?.value === option.value && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => handleSelect(option)}
                >
                  <span className="truncate">{option.label}</span>
                  {selectedOption?.value === option.value && (
                    <Check className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
