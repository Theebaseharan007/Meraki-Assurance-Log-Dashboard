import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';
import 'react-datepicker/dist/react-datepicker.css';

// Custom input component for month picker
const CustomInput = forwardRef(({ value, onClick, placeholder, error, label, className }, ref) => (
  <div className="w-full">
    {label && (
      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        {label}
      </label>
    )}
    <div className="relative">
      <input
        ref={ref}
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          error && "border-red-500",
          className
        )}
      />
      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
    </div>
    {error && (
      <p className="text-sm text-red-500 mt-1">{error}</p>
    )}
  </div>
));

CustomInput.displayName = 'CustomInput';

const MonthPicker = ({
  selected,
  onChange,
  placeholder = "Select month",
  label,
  error,
  className,
  maxDate,
  minDate,
  ...props
}) => {
  return (
    <div className={cn("relative", className)}>
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        customInput={
          <CustomInput
            placeholder={placeholder}
            error={error}
            label={label}
          />
        }
        dateFormat="MMM yyyy"
        showMonthYearPicker
        showFullMonthYearPicker
        maxDate={maxDate}
        minDate={minDate}
        popperClassName="react-datepicker-popper"
        popperPlacement="bottom-start"
        {...props}
      />
    </div>
  );
};

export default MonthPicker;
