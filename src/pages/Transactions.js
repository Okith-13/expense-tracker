import React, { useState, useMemo } from 'react';
import { useTransactions, getCategoryById, ALL_CATEGORIES } from '../context/TransactionContext';
import { format } from 'date-fns';
import TransactionModal from '../components/TransactionModal';
import './Transactions.css';

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); }

export default function Transactions() {
  const { transactions, addTransaction, editTransaction, deleteTransaction } = useTransactions();
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filterType !== 'all') list = list.filter(t => t.type === filterType);
    if (filterCat !== 'all') list = list.filter(t => t.category === filterCat);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        getCategoryById(t.category).label.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'amount') return b.amount - a.amount;
      return 0;
    });
    return list;
  }, [transactions, filterType, filterCat, search, sortBy]);

  const handleEdit = (txn) => {
    setEditData(txn);
    setShowModal(true);
  };

  const handleSave = (data) => {
    if (editData) editTransaction(editData.id, data);
    else addTransaction(data);
    setEditData(null);
  };

  const handleClose = () => { setShowModal(false); setEditData(null); };

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="page-sub">{filtered.length} transactions</p>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add transaction</button>
      </div>

      <div className="txn-toolbar">
        <input className="search-input" placeholder="🔍 Search transactions…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filters">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">All categories</option>
            {ALL_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date">Sort: Date</option>
            <option value="amount">Sort: Amount</option>
          </select>
        </div>
      </div>

      <div className="txn-summary">
        <span className="sum-income">↑ {fmt(totalIncome)}</span>
        <span className="sum-expense">↓ {fmt(totalExpense)}</span>
        <span className="sum-net">Net: <b>{fmt(totalIncome - totalExpense)}</b></span>
      </div>

      <div className="txn-table-wrap">
        <table className="txn-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const cat = getCategoryById(t.category);
              return (
                <tr key={t.id}>
                  <td>
                    <div className="cat-cell">
                      <span className="cat-emoji">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                  </td>
                  <td className="desc-cell">{t.description || '—'}</td>
                  <td className="date-cell">{format(new Date(t.date), 'MMM d, yyyy')}</td>
                  <td><span className={`badge ${t.type}`}>{t.type}</span></td>
                  <td className={`amount-cell ${t.type}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="row-btn edit" onClick={() => handleEdit(t)}>✏️</button>
                      <button className="row-btn del" onClick={() => deleteTransaction(t.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="empty-row">No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && <TransactionModal onClose={handleClose} onSave={handleSave} editData={editData} />}
    </div>
  );
}
