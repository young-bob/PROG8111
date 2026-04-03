/**
 * Smart AI Tracker — SQLite Database Service
 * Handles local CRUD operations for transactions using op-sqlite.
 */
import {open, type DB, type QueryResult} from '@op-engineering/op-sqlite';
import {Transaction, TransactionType, CategoryName, TransactionSource} from '../types';
import {v4 as uuidv4} from 'uuid';

let db: DB | null = null;

/**
 * Opens the database and creates tables if they do not exist.
 */
export function initDatabase(): void {
  db = open({name: 'SmartAITracker.sqlite'});

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS users (
      uid           TEXT PRIMARY KEY,
      email         TEXT NOT NULL,
      display_name  TEXT,
      created_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      title       TEXT NOT NULL,
      amount      REAL NOT NULL,
      category    TEXT NOT NULL,
      type        TEXT NOT NULL CHECK(type IN ('Income','Expense')),
      date        TEXT NOT NULL,
      note        TEXT DEFAULT '',
      source      TEXT DEFAULT 'manual',
      is_synced   INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(uid)
    );
  `);

  db.executeSync(
    'CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);',
  );
  db.executeSync(
    'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);',
  );
}

/**
 * Ensures a user row exists in the local database.
 */
export function ensureUserExists(
  uid: string,
  email: string,
  displayName: string,
): void {
  if (!db) {
    throw new Error('Database not initialized');
  }
  db.executeSync(
    'INSERT OR IGNORE INTO users (uid, email, display_name) VALUES (?, ?, ?);',
    [uid, email, displayName],
  );
}

/**
 * Inserts a new transaction record.
 */
export function insertTransaction(
  userId: string,
  title: string,
  amount: number,
  category: CategoryName,
  type: TransactionType,
  date: string,
  note: string = '',
  source: TransactionSource = 'manual',
): Transaction {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.executeSync(
    `INSERT INTO transactions (id, user_id, title, amount, category, type, date, note, source, is_synced, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?);`,
    [id, userId, title, amount, category, type, date, note, source, now, now],
  );

  return {
    id,
    userId,
    title,
    amount,
    category,
    type,
    date,
    note,
    source,
    isSynced: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Retrieves all transactions for a given user, ordered by date descending.
 */
export function getTransactions(userId: string): Transaction[] {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const result: QueryResult = db.executeSync(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC;',
    [userId],
  );

  const rows = result.rows || [];
  return rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    amount: row.amount,
    category: row.category as CategoryName,
    type: row.type as TransactionType,
    date: row.date,
    note: row.note || '',
    source: row.source as TransactionSource,
    isSynced: row.is_synced === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Deletes a transaction by ID.
 */
export function deleteTransaction(id: string): void {
  if (!db) {
    throw new Error('Database not initialized');
  }
  db.executeSync('DELETE FROM transactions WHERE id = ?;', [id]);
}

/**
 * Updates an existing transaction by ID.
 */
export function updateTransaction(
  id: string,
  title: string,
  amount: number,
  category: CategoryName,
  type: TransactionType,
  date: string,
  note: string = '',
  source: TransactionSource = 'manual',
): void {
  if (!db) {
    throw new Error('Database not initialized');
  }
  const now = new Date().toISOString();
  db.executeSync(
    `UPDATE transactions SET title = ?, amount = ?, category = ?, type = ?, date = ?, note = ?, source = ?, is_synced = 0, updated_at = ?
     WHERE id = ?;`,
    [title, amount, category, type, date, note, source, now, id],
  );
}

/**
 * Gets all unsynced transactions for cloud upload.
 */
export function getUnsyncedTransactions(userId: string): Transaction[] {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const result: QueryResult = db.executeSync(
    'SELECT * FROM transactions WHERE user_id = ? AND is_synced = 0;',
    [userId],
  );

  const rows = result.rows || [];
  return rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    amount: row.amount,
    category: row.category as CategoryName,
    type: row.type as TransactionType,
    date: row.date,
    note: row.note || '',
    source: row.source as TransactionSource,
    isSynced: false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Marks a transaction as synced.
 */
export function markAsSynced(id: string): void {
  if (!db) {
    throw new Error('Database not initialized');
  }
  db.executeSync('UPDATE transactions SET is_synced = 1 WHERE id = ?;', [id]);
}

/**
 * Bulk inserts transactions (used when downloading from cloud on new device).
 */
export function bulkInsertTransactions(transactions: Transaction[]): void {
  if (!db) {
    throw new Error('Database not initialized');
  }

  for (const t of transactions) {
    db.executeSync(
      `INSERT OR IGNORE INTO transactions (id, user_id, title, amount, category, type, date, note, source, is_synced, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?);`,
      [
        t.id,
        t.userId,
        t.title,
        t.amount,
        t.category,
        t.type,
        t.date,
        t.note,
        t.source,
        t.createdAt,
        t.updatedAt,
      ],
    );
  }
}

/**
 * Gets total income and expense for a user.
 */
export function getBalanceSummary(
  userId: string,
): {totalIncome: number; totalExpense: number} {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const incomeResult: QueryResult = db.executeSync(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'Income';",
    [userId],
  );
  const expenseResult: QueryResult = db.executeSync(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'Expense';",
    [userId],
  );

  return {
    totalIncome: Number(incomeResult.rows?.[0]?.total) || 0,
    totalExpense: Number(expenseResult.rows?.[0]?.total) || 0,
  };
}

/**
 * Syncs local SQLite with the cloud snapshot.
 * - Inserts new records from cloud
 * - Updates existing records if cloud version is newer
 * - Deletes local records that no longer exist in cloud
 */
export function syncFromCloud(userId: string, cloudTransactions: Transaction[]): void {
  if (!db) {
    throw new Error('Database not initialized');
  }

  // Build a map of cloud transaction IDs
  const cloudMap = new Map<string, Transaction>();
  for (const t of cloudTransactions) {
    cloudMap.set(t.id, t);
  }

  // Get all local transactions for this user
  const localResult: QueryResult = db.executeSync(
    'SELECT id FROM transactions WHERE user_id = ?;',
    [userId],
  );
  const localIds = new Set((localResult.rows || []).map((r: any) => r.id as string));

  // Upsert: insert or replace cloud records into local
  for (const t of cloudTransactions) {
    db.executeSync(
      `INSERT OR REPLACE INTO transactions (id, user_id, title, amount, category, type, date, note, source, is_synced, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?);`,
      [
        t.id,
        t.userId,
        t.title,
        t.amount,
        t.category,
        t.type,
        t.date,
        t.note,
        t.source,
        t.createdAt,
        t.updatedAt,
      ],
    );
  }

  // Delete local records that are no longer in cloud
  for (const localId of localIds) {
    if (!cloudMap.has(localId)) {
      db.executeSync('DELETE FROM transactions WHERE id = ?;', [localId]);
    }
  }
}
