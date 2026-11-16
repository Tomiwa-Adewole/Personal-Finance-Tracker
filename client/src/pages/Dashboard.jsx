import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  getTransactions,
  getFinancialSummary,
} from "../api/transactionService";
import { getBudgets } from "../api/budgetService";
import SummaryCards from "../component/SummaryCards";
import TransactionForm from "../component/TransactionForm";
import TransactionList from "../component/TransactionList";
import BudgetTracker from "../component/BudgetTracker";
import CategoryBreakdown from "../component/CategoryBreakdown";
import FinancialCharts from "../component/FinancialCharts";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const refreshDashboard = useCallback(async () => {
    try {
      const [txData, summaryData, budgetData] = await Promise.all([
        getTransactions(),
        getFinancialSummary(),
        getBudgets(),
      ]);
      setTransactions(
        Array.isArray(txData) ? txData : txData.transactions || [],
      );
      setSummary(summaryData.summary || summaryData);
      setBudgets(
        Array.isArray(budgetData) ? budgetData : budgetData.budgets || [],
      );
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getTransactions(), getFinancialSummary(), getBudgets()])
      .then(([txData, summaryData, budgetData]) => {
        if (!isMounted) return;
        setTransactions(
          Array.isArray(txData) ? txData : txData.transactions || [],
        );
        setSummary(summaryData.summary || summaryData);
        setBudgets(
          Array.isArray(budgetData) ? budgetData : budgetData.budgets || [],
        );
      })
      .catch((error) => {
        if (isMounted) console.error("Error loading dashboard data:", error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTransactionDeleted = (deletedId) => {
    if (editingTransaction?._id === deletedId) {
      setEditingTransaction(null);
    }
    refreshDashboard();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Personal Finance Tracker
            </h1>
            <p className="text-sm text-gray-600">
              Welcome back, {user?.email || "User"}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition duration-200"
          >
            Logout
          </button>
        </header>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading financial data...
          </div>
        ) : (
          <>
            <SummaryCards summary={summary} />
            <FinancialCharts transactions={transactions} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1 space-y-6">
                <TransactionForm
                  key={editingTransaction?._id || "new"}
                  onTransactionSaved={refreshDashboard}
                  editingTransaction={editingTransaction}
                  onCancelEdit={() => setEditingTransaction(null)}
                />
                <CategoryBreakdown transactions={transactions} />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <BudgetTracker
                  budgets={budgets}
                  transactions={transactions}
                  onBudgetUpdated={refreshDashboard}
                />
                <TransactionList
                  transactions={transactions}
                  onTransactionDeleted={handleTransactionDeleted}
                  onEditTransaction={(tx) => setEditingTransaction(tx)}
                  editingId={editingTransaction?._id}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
