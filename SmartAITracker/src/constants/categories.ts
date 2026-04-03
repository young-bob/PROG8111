/**
 * Smart AI Tracker — Category Constants
 */
import {CategoryName} from '../types';

export const EXPENSE_CATEGORIES: CategoryName[] = [
  'Food',
  'Shopping',
  'Transport',
  'Fun',
  'Bills',
  'Others',
];

export const INCOME_CATEGORIES: CategoryName[] = [
  'Salary',
  'Invest',
  'Gift',
  'Bonus',
  'Freelance',
  'Others',
];

// Color mapping for category display
export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#10b981',
  Shopping: '#f59e0b',
  Transport: '#3b82f6',
  Fun: '#8b5cf6',
  Bills: '#ef4444',
  Salary: '#10b981',
  Invest: '#06b6d4',
  Gift: '#ec4899',
  Bonus: '#f59e0b',
  Freelance: '#6366f1',
  Others: '#94a3b8',
};
