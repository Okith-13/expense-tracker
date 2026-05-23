import React, { useMemo, useState } from 'react';
import { useTransactions, getCategoryById } from '../context/TransactionContext';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import TransactionModal from '../components/TransactionModal';
import './Dashboard.css';

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n); }

export default function Dashboard({ setPage }) {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const [showModal, setShowModal] = useState(false);

  const now = new Date();
  const thisMonth = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
  }, [transactions]);

  const lastMonth = useMemo(() => {
    const prev = subMonths(now, 1);
    const start = startOfMonth(prev);
    const end = endOfMonth(prev);
    return transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
  }, [transactions]);

  const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;
  const lastIncome = lastMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const lastExpenses = lastMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const pct = (curr, prev) => prev === 0 ? null : ((curr - prev) / prev * 100).toFixed(1);
  const incomeChg = pct(income, lastIncome);
  const expenseChg = pct(expenses, lastExpenses);

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  // Top expense categories this month
  const catMap = {};
  thisMonth.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-sub">{format(now, 'MMMM yyyy')} overview</p>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add transaction</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card balance">
          <span className="kpi-label">Net Balance</span>
          <span className={`kpi-value ${balance >= 0 ? 'pos' : 'neg'}`}>{fmt(balance)}</span>
          <span className="kpi-hint">This month</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Income</span>
          <span className="kpi-value income">{fmt(income)}</span>
          {incomeChg !== null && <span className={`kpi-chg ${parseFloat(incomeChg) >= 0 ? 'up' : 'down'}`}>{parseFloat(incomeChg) >= 0 ? '↑' : '↓'} {Math.abs(incomeChg)}% vs last month</span>}
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Expenses</span>
          <span className="kpi-value expense">{fmt(expenses)}</span>
          {expenseChg !== null && <span className={`kpi-chg ${parseFloat(expenseChg) <= 0 ? 'up' : 'down'}`}>{parseFloat(expenseChg) >= 0 ? '↑' : '↓'} {Math.abs(expenseChg)}% vs last month</span>}
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Savings Rate</span>
          <span className="kpi-value">{income > 0 ? ((balance / income) * 100).toFixed(0) : 0}%</span>
          <span className="kpi-hint">of income saved</span>
        </div>
      </div>

      <div className="dash-cols">
        <div className="dash-col">
          <div className="section-header">
            <h3>Recent transactions</h3>
            <button className="link-btn" onClick={() => setPage('transactions')}>View all</button>
          </div>
          <div className="recent-list">
            {recent.map(t => {
              const cat = getCategoryById(t.category);
              return (
                <div key={t.id} className="recent-item">
                  <div className="txn-icon">{cat.icon}</div>
                  <div className="txn-info">
                    <span className="txn-desc">{t.description || cat.label}</span>
                    <span className="txn-date">{format(new Date(t.date), 'MMM d')}</span>
                  </div>
                  <span className={`txn-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dash-col">
          <div className="section-header"><h3>Top expenses</h3></div>
          <div className="cat-list">
            {topCats.map(([catId, amount]) => {
              const cat = getCategoryById(catId);
              const pct = expenses > 0 ? (amount / expenses * 100).toFixed(0) : 0;
              return (
                <div key={catId} className="cat-row">
                  <div className="cat-row-info">
                    <span>{cat.icon} {cat.label}</span>
                    <span className="cat-row-amt">{fmt(amount)}</span>
                  </div>
                  <div className="cat-bar-track">
                    <div className="cat-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {topCats.length === 0 && <p className="empty">No expenses this month.</p>}
          </div>
        </div>
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSave={addTransaction} />}
    </div>
  );
}
