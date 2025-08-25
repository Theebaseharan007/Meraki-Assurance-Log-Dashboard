import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import 'react-datepicker/dist/react-datepicker.css';

// Custom input component for date time picker
const CustomInput = forwardRef(({ value, onClick, placeholder, error, label, className }, ref) => (
  <div className="w-full">
    {label && (
      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        <Clock className="h-4 w-4 text-gray-600 dark:text-gray-300" />
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
          "flex h-10 w-full rounded-md border border-input bg-background pl-3 pr-12 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          error && "border-red-500",
          className
        )}
      />
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 pointer-events-none">
        <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
        <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
      </div>
    </div>
    {error && (
      <p className="text-sm text-red-500 mt-1">{error}</p>
    )}
  </div>
));

CustomInput.displayName = 'CustomInput';

const DateTimePicker = ({
  selected,
  onChange,
  placeholder = "Select date and time",
  label,
  error,
  className,
  dateFormat = "MMM dd, yyyy h:mm aa",
  showMonthDropdown = true,
  showYearDropdown = true,
  dropdownMode = "select",
  maxDate,
  minDate,
  showTimeSelect = true,
  timeFormat = "HH:mm",
  timeIntervals = 15,
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
        dateFormat={dateFormat}
        showMonthDropdown={showMonthDropdown}
        showYearDropdown={showYearDropdown}
        dropdownMode={dropdownMode}
        maxDate={maxDate}
        minDate={minDate}
        showTimeSelect={showTimeSelect}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        popperClassName="react-datepicker-popper"
        popperPlacement="bottom-start"
        {...props}
      />
      
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
        
        .react-datepicker {
          background-color: hsl(var(--popover));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          font-family: inherit;
        }
        
        .react-datepicker__header {
          background-color: hsl(var(--muted));
          border-bottom: 1px solid hsl(var(--border));
          border-radius: 8px 8px 0 0;
        }
        
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: hsl(var(--foreground));
          font-weight: 500;
        }
        
        .react-datepicker__day {
          color: hsl(var(--foreground));
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .react-datepicker__day:hover {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }
        
        .react-datepicker__day--selected {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        
        .react-datepicker__day--selected:hover {
          background-color: hsl(var(--primary));
        }
        
        .react-datepicker__day--today {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          font-weight: 500;
        }
        
        .react-datepicker__day--outside-month {
          color: hsl(var(--muted-foreground));
        }
        
        .react-datepicker__time-container {
          border-left: 1px solid hsl(var(--border));
        }
        
        .react-datepicker__time-container .react-datepicker__time {
          background: hsl(var(--popover));
        }
        
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
          width: 85px;
        }
        
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list {
          padding-left: 0;
          padding-right: 0;
          width: 85px;
        }
        
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {
          color: hsl(var(--foreground));
          height: 30px;
          padding: 5px 10px;
          white-space: nowrap;
        }
        
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }
        
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          font-weight: 500;
        }
        
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected:hover {
          background-color: hsl(var(--primary));
        }
        
        .react-datepicker__month-dropdown,
        .react-datepicker__year-dropdown {
          background-color: hsl(var(--popover));
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          color: hsl(var(--foreground));
        }
        
        .react-datepicker__month-option,
        .react-datepicker__year-option {
          color: hsl(var(--foreground));
        }
        
        .react-datepicker__month-option:hover,
        .react-datepicker__year-option:hover {
          background-color: hsl(var(--accent));
        }
        
        .react-datepicker__month-option--selected,
        .react-datepicker__year-option--selected {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        
        .react-datepicker__navigation {
          top: 13px;
        }
        
        .react-datepicker__navigation--previous {
          border-right-color: hsl(var(--foreground));
        }
        
        .react-datepicker__navigation--next {
          border-left-color: hsl(var(--foreground));
        }
        
        .react-datepicker__navigation:hover *::before {
          border-color: hsl(var(--primary));
        }
      `}</style>
    </div>
  );
};

export default DateTimePicker;
