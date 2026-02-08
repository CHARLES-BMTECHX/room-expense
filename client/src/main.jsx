import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import DepositList from './components/DepositList.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import BalanceDisplay from './components/BalanceDisplay.jsx';
import AddDeposit from './components/AddDeposit.jsx';
import AddExpense from './components/AddExpense.jsx';
import HomePage from './components/Home.jsx';
import './index.css'; // Make sure you have this if using Tailwind

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="deposits" element={<DepositList />} />
          <Route path="expenses" element={<ExpenseList />} />
          <Route path="balance" element={<BalanceDisplay />} />
          <Route path="add-deposit" element={<AddDeposit />} />
          <Route path="add-expense" element={<AddExpense />} />
        </Route>
        <Route path="*" element={<h1 className="text-center text-4xl mt-20">404 - Not Found</h1>} />
      </Routes>
    </Router>
  </StrictMode>
);