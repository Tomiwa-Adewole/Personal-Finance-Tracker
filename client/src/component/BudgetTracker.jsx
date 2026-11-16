import { useState } from "react";
import { createBudget, deleteBudget, updateBudget } from "../api/budgetService";

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Utilities",
  "Housing",
  "Entertainment",
  "Shopping",
  "Other",
];

export default function BudgetTracker({
  budgets,
  transactions,
  onBudgetUpdated,
}) {
  const [category, setCategory] = useState("Food & Dining");
  const [limit, setLimit] = useState("");
  const [editingBudget, setEditingBudget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Calculate total spent per category from expense transactions
  const spentByCategory = transactions.reduce((acc, tx) => {
    if (tx.type === "expense") {
      acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
    }
    return acc;
  }, {});

  const handleAddBudget = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const parsedLimit = Number(limit);
      if (editingBudget) {
        await updateBudget(editingBudget.id, { limit: parsedLimit });
        setEditingBudget(null);
      } else {
        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        await createBudget({ category, limit: parsedLimit, month });
      }
      setLimit("");
      onBudgetUpdated();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${editingBudget ? "update" : "save"} budget`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget({ ...budget, id: budget.id || budget._id });
    setCategory(budget.category);
    setLimit(String(budget.limit ?? budget.amount ?? ""));
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setLimit("");
    setError("");
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      onBudgetUpdated();
    } catch (err) {
      console.error("Failed to delete budget:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Monthly Budgets
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleAddBudget}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
      >
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={Boolean(editingBudget)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          step="0.01"
          min="1"
          required
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="Monthly Limit ($)"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={submitting}
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition duration-200 disabled:opacity-50"
        >
          {submitting
            ? editingBudget
              ? "Updating..."
              : "Saving..."
            : editingBudget
              ? "Save Changes"
              : "Set Budget"}
        </button>
        {editingBudget && (
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={submitting}
            className="sm:col-span-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel editing
          </button>
        )}
      </form>

      {budgets.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          No category budgets set yet. Add a limit above to track spending.
        </p>
      ) : (
        <div className="space-y-4">
          {budgets.map((b) => {
            const budgetLimit = Number(b.limit || b.amount || 0);
            const spent = Number(
              b.totalSpent ?? spentByCategory[b.category] ?? 0,
            );
            const percentage =
              budgetLimit > 0 ? Math.min((spent / budgetLimit) * 100, 100) : 0;
            const isOver = spent > budgetLimit;
            const budgetId = b.id || b._id;

            let barColor = "bg-emerald-500";
            if (isOver) barColor = "bg-rose-600";
            else if (percentage >= 80) barColor = "bg-amber-500";

            return (
              <div
                key={budgetId}
                className="p-4 rounded-lg border border-gray-100 bg-gray-50/50"
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-medium text-sm text-gray-900">
                    {b.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold ${isOver ? "text-rose-600" : "text-gray-600"}`}
                    >
                      ${spent.toFixed(2)} / ${budgetLimit.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEdit(b)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(budgetId)}
                      className="text-gray-400 hover:text-red-600 text-xs transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
