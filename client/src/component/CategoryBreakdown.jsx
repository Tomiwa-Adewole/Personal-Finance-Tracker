export default function CategoryBreakdown({ transactions }) {
  const expenses = transactions.filter((tx) => tx.type === "expense");
  const totalExpenses = expenses.reduce(
    (sum, tx) => sum + Number(tx.amount),
    0,
  );

  const grouped = expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
    return acc;
  }, {});

  const sortedCategories = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Spending by Category
      </h2>

      {sortedCategories.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          Add an expense transaction to see your category breakdown.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedCategories.map(([category, amount]) => {
            const share =
              totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

            return (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-gray-600">
                    ${amount.toFixed(2)} ({share.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${share}%` }}
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
