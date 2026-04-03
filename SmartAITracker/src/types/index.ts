/**
 * Smart AI Tracker — TypeScript Type Definitions
 * All shared interfaces and types used across the application.
 */

// ---- Category Types ----

export type CategoryName =
  | 'Food'
  | 'Shopping'
  | 'Transport'
  | 'Fun'
  | 'Bills'
  | 'Salary'
  | 'Invest'
  | 'Gift'
  | 'Bonus'
  | 'Freelance'
  | 'Others';

export type TransactionType = 'Income' | 'Expense';

export type TransactionSource = 'manual' | 'voice' | 'ai_scan';

// ---- Transaction Model ----

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: CategoryName;
  type: TransactionType;
  date: string; // "YYYY-MM-DD"
  note: string;
  source: TransactionSource;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- User Model ----

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
}

// ---- AI Service Payloads ----

export interface AIParseRequest {
  inputText?: string;
  imageBase64?: string;
  userId: string;
}

export interface AIParseResponse {
  success: boolean;
  data: {
    title: string;
    amount: number;
    category: CategoryName;
    type: TransactionType;
  };
  error?: string;
}

// ---- Navigation Types ----

export type RootDrawerParamList = {
  MainTabs: undefined;
  DrawerHistory: undefined;
  DrawerAnalytics: undefined;
  DrawerSettings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  History: undefined;
  AddPlaceholder: undefined;
  Analytics: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  DrawerRoot: undefined;
  Detail: {transaction?: Transaction} | undefined;
};
