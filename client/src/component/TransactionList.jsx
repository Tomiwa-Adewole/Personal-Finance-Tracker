import { useState, useMemo } from "react";
import { deleteTransaction } from "../api/transactionService";

const CATEGORIES = [
  "All",
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

export default function TransactionList({
  transactions,
  onTransactionDeleted,
  onEditTransaction,
  editingId,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      onTransactionDeleted(id);
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.title
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      const matchesType = typeFilter === "all" || tx.type === typeFilter;
      const matchesCategory =
        categoryFilter === "All" || tx.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "all" ||
    categoryFilter !== "All";

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setCategoryFilter("All");
  };

  // Handler to export filtered transactions as a CSV file
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ["Title", "Type", "Category", "Amount", "Date"];
    const rows = filteredTransactions.map((tx) => [
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.type,
      `"${tx.category}"`,
      tx.amount,
      new Date(tx.date).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `finance_report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Transactions
          <span className="ml-2 text-xs font-normal text-gray-500">
            ({filteredTransactions.length} of {transactions.length})
          </span>
        </h2>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Reset Filters
            </button>
          )}

          {filteredTransactions.length > 0 && (
            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
            >
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Types</option>
          <option value="income">Income Only</option>
          <option value="expense">Expenses Only</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "All" ? "All Categories" : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table or Empty States */}
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          No transactions yet. Add one using the form to get started!
        </p>
      ) : filteredTransactions.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          No transactions match your current filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 px-2">Title</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2 text-right">Amount</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx._id}
                  className={`transition ${
                    editingId === tx._id ? "bg-blue-50/70" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="py-3 px-2 font-medium text-gray-900">
                    {tx.title}
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td
                    className={`py-3 px-2 text-right font-semibold ${
                      tx.type === "income"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}$
                    {Number(tx.amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right space-x-3">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tx._id)}
                      className="text-gray-400 hover:text-red-600 text-xs font-medium transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
