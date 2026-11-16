import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#f43f5e",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function FinancialCharts({ transactions }) {
  const expensesByCategory = transactions.reduce((totals, transaction) => {
    if (transaction.type === "expense") {
      const amount = Number(transaction.amount) || 0;
      totals[transaction.category] =
        (totals[transaction.category] || 0) + amount;
    }
    return totals;
  }, {});

  const categoryData = Object.entries(expensesByCategory)
    .filter(([, amount]) => amount > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totals = transactions.reduce(
    (result, transaction) => {
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === "income") result.income += amount;
      if (transaction.type === "expense") result.expenses += amount;
      return result;
    },
    { income: 0, expenses: 0 },
  );

  const cashflowData = [
    { name: "Income", amount: totals.income },
    { name: "Expenses", amount: totals.expenses },
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Spending by Category
        </h2>
        {categoryData.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">
            Add an expense transaction to see your spending breakdown.
          </p>
        ) : (
          <div
            className="h-72"
            role="img"
            aria-label="Donut chart of spending by category"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="78%"
                  paddingAngle={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Income vs. Expenses
        </h2>
        <div
          className="h-72"
          role="img"
          aria-label="Bar chart comparing total income and expenses"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cashflowData}
              margin={{ top: 8, right: 12, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="amount" name="Total" radius={[6, 6, 0, 0]}>
                <Cell fill="#10b981" />
                <Cell fill="#f43f5e" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
