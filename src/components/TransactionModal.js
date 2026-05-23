import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../context/TransactionContext';
import './TransactionModal.css';

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionModal({ onClose, onSave, editData }) {
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: 'food',
    description: '',
    date: today(),
    ...editData,
  });

  useEffect(() => {
    if (editData) setForm({ ...editData, date: editData.date?.slice(0, 10) || today() });
  }, [editData]);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleTypeChange = (type) => {
    const defaultCat = CATEGORIES[type][0].id;
    setForm(f => ({ ...f, type, category: defaultCat }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    onSave({ ...form, amount: parseFloat(parseFloat(form.amount).toFixed(2)) });
    onClose();
  };

  const cats = CATEGORIES[form.type] || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editData ? 'Edit transaction' : 'New transaction'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit} className="modal-form">
          <div className="type-toggle">
            <button type="button" className={form.type === 'income' ? 'active income' : ''} onClick={() => handleTypeChange('income')}>
              ↑ Income
            </button>
            <button type="button" className={form.type === 'expense' ? 'active expense' : ''} onClick={() => handleTypeChange('expense')}>
              ↓ Expense
            </button>
          </div>

          <div className="field">
            <label>Amount</label>
            <div className="amount-wrap">
              <span className="currency">$</span>
              <input name="amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={handle} placeholder="0.00" required autoFocus />
            </div>
          </div>

          <div className="field">
            <label>Category</label>
            <div className="cat-grid">
              {cats.map(c => (
                <button type="button" key={c.id} className={`cat-btn ${form.category === c.id ? 'selected' : ''}`} onClick={() => setForm(f => ({ ...f, category: c.id }))}>
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="modal-row">
            <div className="field">
              <label>Date</label>
              <input name="date" type="date" value={form.date} onChange={handle} required />
            </div>
            <div className="field" style={{ flex: 2 }}>
              <label>Description</label>
              <input name="description" value={form.description} onChange={handle} placeholder="What was this for?" />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn-save ${form.type}`}>
              {editData ? 'Save changes' : `Add ${form.type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
