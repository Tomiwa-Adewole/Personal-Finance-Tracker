export default function SummaryCards({ summary }) {
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = summary?.totalExpenses ?? summary?.totalExpense ?? 0;
  const balance = summary?.balance ?? summary?.netBalance ?? 0;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Balance</p>
        <p
          className={`text-2xl font-bold ${balance >= 0 ? "text-gray-900" : "text-red-600"}`}
        >
          {formatCurrency(balance)}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Income</p>
        <p className="text-2xl font-bold text-emerald-600">
          +{formatCurrency(totalIncome)}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
        <p className="text-2xl font-bold text-rose-600">
          -{formatCurrency(totalExpenses)}
        </p>
      </div>
    </div>
  );
}
