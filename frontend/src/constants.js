export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Utilities', 'Health', 'Entertainment', 'Other'];

export const EMPTY_FORM = { amount: '', category: '', description: '', date: '' };

export const DEFAULT_FILTERS = { category: '', sort: 'date_desc' };

export const LOCALE = 'en-IN';
export const CURRENCY_FORMAT = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

export const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60';
export const labelCls = 'text-xs font-medium text-gray-500 uppercase tracking-wide';
export const selectCls = 'px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
