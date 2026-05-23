# Flo — Expense Tracker

A clean expense tracker built with React. Features authentication, interactive charts, category breakdowns and monthly summaries.

## Features

- **Authentication** — Sign up / login with localStorage persistence
- **Dashboard** — KPI cards (balance, income, expenses, savings rate), recent transactions, top expense categories
- **Transactions** — Full CRUD with search, filter by type/category, sort by date or amount
- **Charts** — Area chart (income vs expenses), bar chart (savings), donut chart (category breakdown), grouped bar chart
- **Monthly Summary** — Month selector for the last 6 months, income + expense breakdowns with progress bars
- **Demo Data** — Auto-seeded 6 months of realistic demo transactions on first login

## Tech Stack

- React 18 (Create React App)
- Recharts (charts)
- date-fns (date utilities)
- uuid (transaction IDs)
- localStorage (auth + data persistence)

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── context/
│   ├── AuthContext.js       # Auth state, login/signup/logout
│   └── TransactionContext.js # Transaction CRUD + categories + demo data
├── components/
│   ├── Sidebar.js / .css    # Navigation sidebar
│   └── TransactionModal.js / .css  # Add/edit transaction modal
├── pages/
│   ├── AuthPage.js / .css   # Login & signup
│   ├── Dashboard.js / .css  # Overview with KPIs
│   ├── Transactions.js / .css # Full transaction list
│   ├── Charts.js / .css     # Visual charts
│   └── Monthly.js / .css    # Monthly summaries
├── App.js / .css            # Root layout + routing
└── index.css                # Global CSS variables & resets
```
