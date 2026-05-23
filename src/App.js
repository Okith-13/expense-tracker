import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import AuthPage from './pages/AuthPage';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Charts from './pages/Charts';
import Monthly from './pages/Monthly';
import './App.css';

function AppShell() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (loading) return <div className="loading"><span>flow</span></div>;
  if (!user) return <AuthPage />;

  const pages = { dashboard: Dashboard, transactions: Transactions, charts: Charts, monthly: Monthly };
  const Page = pages[page] || Dashboard;

  return (
    <TransactionProvider>
      <div className="app-layout">
        <Sidebar page={page} setPage={setPage} />
        <main className="app-main">
          <Page setPage={setPage} />
        </main>
      </div>
    </TransactionProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
