import { useState } from "react";
import {
  createTransaction,
  updateTransaction,
} from "../api/transactionService";

const CATEGORIES = [
  "Salary",
  "Freelance",
  "Food & Dining",
  "Transportation",
  "Utilities",
  "Housing",
  "Entertainment",
  "Shopping",
  "Other",
];

export default function TransactionForm({
  onTransactionSaved,
  editingTransaction,
  onCancelEdit,
}) {
  const defaultDate = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState(editingTransaction?.title || "");
  const [amount, setAmount] = useState(
    editingTransaction?.amount?.toString() || "",
  );
  const [type, setType] = useState(editingTransaction?.type || "expense");
  const [category, setCategory] = useState(
    editingTransaction?.category || "Food & Dining",
  );
  const [date, setDate] = useState(
    editingTransaction?.date
      ? new Date(editingTransaction.date).toISOString().split("T")[0]
      : defaultDate,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("Food & Dining");
    setDate(new Date().toISOString().split("T")[0]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      title,
      amount: parseFloat(amount),
      type,
      category,
      date,
    };

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, payload);
        if (onCancelEdit) onCancelEdit();
      } else {
        await createTransaction(payload);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${editingTransaction ? "update" : "add"} transaction`,
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    if (onTransactionSaved) {
      onTransactionSaved();
    }
  };

  const hasInputs = title.trim() !== "" || amount !== "";

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border transition ${
        editingTransaction
          ? "border-blue-400 ring-1 ring-blue-100"
          : "border-gray-100"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {editingTransaction ? "Edit Transaction" : "Add Transaction"}
        </h2>

        {editingTransaction ? (
          <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
            Editing
          </span>
        ) : savedNotice ? (
          <span className="text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
            Added! Ready for next
          </span>
        ) : (
          hasInputs && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 transition"
            >
              Clear
            </button>
          )
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`py-2 text-sm font-medium rounded-lg border transition ${
              type === "expense"
                ? "bg-rose-50 border-rose-500 text-rose-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`py-2 text-sm font-medium rounded-lg border transition ${
              type === "income"
                ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Income
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Groceries, Monthly Salary"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50"
          >
            {submitting
              ? editingTransaction
                ? "Updating..."
                : "Adding..."
              : editingTransaction
                ? "Update Transaction"
                : "Add Transaction"}
          </button>

          {editingTransaction && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
