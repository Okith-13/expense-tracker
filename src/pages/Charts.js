import React, { useMemo } from 'react';
import { useTransactions, getCategoryById, CATEGORIES } from '../context/TransactionContext';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Charts.css';

const EXPENSE_COLORS = ['#c0392b','#d4820a','#1a6b7a','#5b3a8e','#2d5016','#8a2be2','#d2691e','#4682b4','#2e8b57','#cd853f'];

function fmt(n) { return '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n); }

export default function Charts() {
  const { transactions } = useTransactions();
  const now = new Date();

  // Last 6 months area/bar chart data
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const month = transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
      const income = month.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = month.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { month: format(d, 'MMM'), income: Math.round(income), expenses: Math.round(expenses), savings: Math.round(income - expenses) };
    });
  }, [transactions]);

  // Expense category breakdown (all time or this month)
  const thisMonth = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
  }, [transactions]);

  const pieData = useMemo(() => {
    const catMap = {};
    thisMonth.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    return Object.entries(catMap)
      .map(([catId, value]) => ({ name: getCategoryById(catId).label, value: Math.round(value), icon: getCategoryById(catId).icon }))
      .sort((a, b) => b.value - a.value);
  }, [thisMonth]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <p className="tt-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="charts-page">
      <div className="page-header">
        <div>
          <h1>Charts</h1>
          <p className="page-sub">Visual breakdown of your finances</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card wide">
          <h3>Income vs Expenses — Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d5016" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2d5016" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c0392b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d4" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8a8078' }} />
              <YAxis tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} tick={{ fontSize: 12, fill: '#8a8078' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="income" stroke="#2d5016" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#c0392b" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card wide">
          <h3>Monthly Savings</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d4" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8a8078' }} />
              <YAxis tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} tick={{ fontSize: 12, fill: '#8a8078' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="savings" name="Savings" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.savings >= 0 ? '#2d5016' : '#c0392b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Expense Breakdown — This Month</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.slice(0, 6).map((d, i) => (
                  <div key={i} className="pie-legend-item">
                    <span className="pie-dot" style={{ background: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }} />
                    <span>{d.icon} {d.name}</span>
                    <span className="pie-val">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="empty">No expenses this month.</p>}
        </div>

        <div className="chart-card">
          <h3>Income vs Expenses — Bar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d4" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8a8078' }} />
              <YAxis tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} tick={{ fontSize: 12, fill: '#8a8078' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#2d5016" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#c0392b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
