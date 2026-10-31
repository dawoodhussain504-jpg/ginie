import en from './locales/en.json';
import hi from './locales/hi.json';

export type Locale = 'en' | 'hi';
export type Dictionary = typeof en;

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  hi,
};

export function getDictionary(locale: Locale = 'en'): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndian(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export { en, hi };
