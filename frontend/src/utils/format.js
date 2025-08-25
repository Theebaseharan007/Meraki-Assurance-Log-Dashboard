import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

// Date formatting utilities
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'HH:mm')}`;
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatDateForInput = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

export const formatDateTimeForInput = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "yyyy-MM-dd'T'HH:mm");
};

// Number formatting utilities
export const formatNumber = (num, options = {}) => {
  if (num == null) return '0';
  return new Intl.NumberFormat('en-US', options).format(num);
};

export const formatPercentage = (num, decimals = 1) => {
  if (num == null) return '0%';
  return `${(num * 100).toFixed(decimals)}%`;
};

// Status formatting utilities
export const getStatusColor = (status) => {
  const colors = {
    passed: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
    failed: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
    skipped: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
    errored: 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20'
  };
  return colors[status] || 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
};

export const getStatusIcon = (status) => {
  const icons = {
    passed: '✓',
    failed: '✗',
    skipped: '⊘',
    errored: '⚠'
  };
  return icons[status] || '?';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Chart data formatting utilities
export const formatChartData = (statusCounts) => {
  return Object.entries(statusCounts || {}).map(([status, count]) => ({
    name: capitalizeFirst(status),
    value: count,
    status,
    fill: getChartColor(status)
  }));
};

export const getChartColor = (status) => {
  const colors = {
    passed: '#10b981', // green-500
    failed: '#ef4444', // red-500
    skipped: '#f59e0b', // amber-500
    errored: '#8b5cf6'  // violet-500
  };
  return colors[status] || '#6b7280'; // gray-500
};

// Form validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

// URL utilities
export const buildUrl = (base, params = {}) => {
  const url = new URL(base, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      url.searchParams.append(key, value.toString());
    }
  });
  return url.toString();
};

// Error message formatting
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.errors) {
    return error.response.data.errors.map(e => e.message).join(', ');
  }
  return 'An unexpected error occurred';
};
