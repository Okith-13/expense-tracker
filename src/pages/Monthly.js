import React, { useState, useMemo } from 'react';
import { useTransactions, getCategoryById } from '../context/TransactionContext';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import './Monthly.css';

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); }

export default function Monthly() {
  const { transactions } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = current, 1 = last, etc.

  const months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), i);
      return { label: format(d, 'MMMM yyyy'), date: d };
    });
  }, []);

  const current = months[selectedMonth];

  const monthTxns = useMemo(() => {
    const start = startOfMonth(current.date);
    const end = endOfMonth(current.date);
    return transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
  }, [transactions, current]);

  const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;

  const catBreakdown = useMemo(() => {
    const map = {};
    monthTxns.filter(t => t.type === 'expense').forEach(t => {
      if (!map[t.category]) map[t.category] = { total: 0, count: 0 };
      map[t.category].total += t.amount;
      map[t.category].count++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [monthTxns]);

  const incomeBreakdown = useMemo(() => {
    const map = {};
    monthTxns.filter(t => t.type === 'income').forEach(t => {
      if (!map[t.category]) map[t.category] = { total: 0, count: 0 };
      map[t.category].total += t.amount;
      map[t.category].count++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [monthTxns]);

  return (
    <div className="monthly-page">
      <div className="page-header">
        <div>
          <h1>Monthly Summary</h1>
          <p className="page-sub">Month-by-month breakdown</p>
        </div>
      </div>

      <div className="month-tabs">
        {months.map((m, i) => (
          <button key={i} className={`month-tab ${selectedMonth === i ? 'active' : ''}`} onClick={() => setSelectedMonth(i)}>
            {format(m.date, 'MMM yyyy')}
          </button>
        ))}
      </div>

      <div className="monthly-kpi">
        <div className={`monthly-kpi-card ${balance >= 0 ? 'pos' : 'neg'}`}>
          <span className="kpi-label">Net Balance</span>
          <span className="kpi-big">{fmt(balance)}</span>
        </div>
        <div className="monthly-kpi-card income-card">
          <span className="kpi-label">Total Income</span>
          <span className="kpi-big green">{fmt(income)}</span>
          <span className="kpi-hint">{monthTxns.filter(t => t.type === 'income').length} transactions</span>
        </div>
        <div className="monthly-kpi-card expense-card">
          <span className="kpi-label">Total Expenses</span>
          <span className="kpi-big red">{fmt(expenses)}</span>
          <span className="kpi-hint">{monthTxns.filter(t => t.type === 'expense').length} transactions</span>
        </div>
        <div className="monthly-kpi-card">
          <span className="kpi-label">Savings Rate</span>
          <span className="kpi-big">{income > 0 ? ((balance / income) * 100).toFixed(1) : 0}%</span>
          <span className="kpi-hint">of income retained</span>
        </div>
      </div>

      <div className="monthly-cols">
        <div className="monthly-section">
          <h3>💸 Expense Breakdown</h3>
          {catBreakdown.length === 0 && <p className="empty">No expenses this month.</p>}
          {catBreakdown.map(([catId, data]) => {
            const cat = getCategoryById(catId);
            const pct = expenses > 0 ? (data.total / expenses * 100).toFixed(0) : 0;
            return (
              <div key={catId} className="breakdown-row">
                <div className="breakdown-top">
                  <span className="breakdown-cat">{cat.icon} {cat.label}</span>
                  <span className="breakdown-info">
                    <span className="breakdown-count">{data.count} txn{data.count !== 1 ? 's' : ''}</span>
                    <span className="breakdown-amt red">{fmt(data.total)}</span>
                  </span>
                </div>
                <div className="breakdown-bar-track">
                  <div className="breakdown-bar-fill expense" style={{ width: `${pct}%` }} />
                </div>
                <span className="breakdown-pct">{pct}% of expenses</span>
              </div>
            );
          })}
        </div>

        <div className="monthly-section">
          <h3>💰 Income Breakdown</h3>
          {incomeBreakdown.length === 0 && <p className="empty">No income this month.</p>}
          {incomeBreakdown.map(([catId, data]) => {
            const cat = getCategoryById(catId);
            const pct = income > 0 ? (data.total / income * 100).toFixed(0) : 0;
            return (
              <div key={catId} className="breakdown-row">
                <div className="breakdown-top">
                  <span className="breakdown-cat">{cat.icon} {cat.label}</span>
                  <span className="breakdown-info">
                    <span className="breakdown-count">{data.count} txn{data.count !== 1 ? 's' : ''}</span>
                    <span className="breakdown-amt green">{fmt(data.total)}</span>
                  </span>
                </div>
                <div className="breakdown-bar-track">
                  <div className="breakdown-bar-fill income" style={{ width: `${pct}%` }} />
                </div>
                <span className="breakdown-pct">{pct}% of income</span>
              </div>
            );
          })}

          <div className="txn-log">
            <h4>All transactions</h4>
            {monthTxns.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => {
              const cat = getCategoryById(t.category);
              return (
                <div key={t.id} className="log-row">
                  <span className="log-icon">{cat.icon}</span>
                  <span className="log-desc">{t.description || cat.label}</span>
                  <span className="log-date">{format(new Date(t.date), 'MMM d')}</span>
                  <span className={`log-amt ${t.type}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</span>
                </div>
              );
            })}
            {monthTxns.length === 0 && <p className="empty">No transactions.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
