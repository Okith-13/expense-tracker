import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

const TransactionContext = createContext(null);

export const CATEGORIES = {
  income: [
    { id: 'salary', label: 'Salary', icon: '💼' },
    { id: 'freelance', label: 'Freelance', icon: '💻' },
    { id: 'investment', label: 'Investment', icon: '📈' },
    { id: 'gift', label: 'Gift', icon: '🎁' },
    { id: 'other_income', label: 'Other', icon: '✨' },
  ],
  expense: [
    { id: 'housing', label: 'Housing', icon: '🏠' },
    { id: 'food', label: 'Food & Dining', icon: '🍽️' },
    { id: 'transport', label: 'Transport', icon: '🚗' },
    { id: 'health', label: 'Health', icon: '⚕️' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'utilities', label: 'Utilities', icon: '⚡' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'other_expense', label: 'Other', icon: '📦' },
  ],
};

export const ALL_CATEGORIES = [...CATEGORIES.income, ...CATEGORIES.expense];

export function getCategoryById(id) {
  return ALL_CATEGORIES.find(c => c.id === id) || { id, label: id, icon: '📦' };
}

function getUserKey(email) { return `flo_txns_${email}`; }

function loadTransactions(email) {
  try { return JSON.parse(localStorage.getItem(getUserKey(email))) || []; } catch { return []; }
}

function saveTransactions(email, txns) {
  localStorage.setItem(getUserKey(email), JSON.stringify(txns));
}

// Seed demo data for a new user
function seedDemoData(email) {
  const now = new Date();
  const txns = [];
  const incomeCategories = CATEGORIES.income.map(c => c.id);
  const expenseCategories = CATEGORIES.expense.map(c => c.id);

  for (let m = 5; m >= 0; m--) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
    // Income
    txns.push({ id: uuidv4(), type: 'income', amount: 3800 + Math.random() * 400, category: 'salary', description: 'Monthly Salary', date: new Date(month.getFullYear(), month.getMonth(), 1).toISOString() });
    if (Math.random() > 0.4) txns.push({ id: uuidv4(), type: 'income', amount: 200 + Math.random() * 600, category: 'freelance', description: 'Freelance Project', date: new Date(month.getFullYear(), month.getMonth(), 15).toISOString() });
    // Expenses
    const expItems = [
      { amount: 1200, category: 'housing', description: 'Rent', day: 1 },
      { amount: 80 + Math.random() * 40, category: 'utilities', description: 'Electricity & Water', day: 5 },
      { amount: 300 + Math.random() * 100, category: 'food', description: 'Groceries', day: 8 },
      { amount: 60 + Math.random() * 40, category: 'transport', description: 'Commute', day: 10 },
      { amount: 40 + Math.random() * 60, category: 'entertainment', description: 'Streaming & Entertainment', day: 12 },
      { amount: 80 + Math.random() * 120, category: 'shopping', description: 'Shopping', day: 18 },
      { amount: 30 + Math.random() * 50, category: 'food', description: 'Restaurants', day: 20 },
      { amount: 20 + Math.random() * 80, category: 'health', description: 'Pharmacy', day: 22 },
    ];
    expItems.forEach(item => {
      txns.push({ id: uuidv4(), type: 'expense', ...item, amount: parseFloat(item.amount.toFixed(2)), date: new Date(month.getFullYear(), month.getMonth(), item.day).toISOString() });
    });
  }
  saveTransactions(email, txns);
  return txns;
}

export function TransactionProvider({ children }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user) { setTransactions([]); return; }
    let txns = loadTransactions(user.email);
    if (txns.length === 0) txns = seedDemoData(user.email);
    setTransactions(txns);
  }, [user]);

  const persist = (txns) => {
    setTransactions(txns);
    if (user) saveTransactions(user.email, txns);
  };

  const addTransaction = (data) => {
    const txn = { id: uuidv4(), ...data, date: new Date(data.date).toISOString() };
    persist([txn, ...transactions]);
  };

  const deleteTransaction = (id) => persist(transactions.filter(t => t.id !== id));

  const editTransaction = (id, data) => {
    persist(transactions.map(t => t.id === id ? { ...t, ...data, date: new Date(data.date).toISOString() } : t));
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction, editTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => useContext(TransactionContext);
