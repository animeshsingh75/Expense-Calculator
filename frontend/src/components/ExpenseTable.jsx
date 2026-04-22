import { LOCALE, CURRENCY_FORMAT } from '../constants';

export default function ExpenseTable({ expenses, loading, error, onRetry }) {
  if (loading) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2 text-sm text-red-500">
        <p>Failed to load expenses: {error}</p>
        <button
          onClick={onRetry}
          className="self-start px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (expenses.length === 0) {
    return <p className="text-sm text-gray-400">No expenses yet.</p>;
  }

  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <table className="w-full text-sm bg-white">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, index) => {
            const isLastRow = index === expenses.length - 1;
            const formattedAmount = parseFloat(expense.amount).toLocaleString(LOCALE, CURRENCY_FORMAT);
            const description = expense.description || '—';

            return (
              <tr key={expense.id} className={isLastRow ? '' : 'border-b border-gray-100'}>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{expense.date}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                    {expense.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{description}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-900 tabular-nums">
                  {formattedAmount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
