import { LOCALE, CURRENCY_FORMAT } from '../constants';

function fmt(amount) {
  return amount.toLocaleString(LOCALE, CURRENCY_FORMAT);
}

export default function TotalBar({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
    return acc;
  }, {});

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-700">
          Total: <strong className="text-base text-gray-900">₹{fmt(total)}</strong>
        </span>
        <span className="text-sm text-gray-400">
          {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
        </span>
      </div>

      {sorted.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {sorted.map(([category, amount]) => (
            <div key={category} className="flex flex-col bg-gray-50 rounded-md px-3 py-2">
              <span className="text-xs text-gray-500 truncate">{category}</span>
              <span className="text-sm font-medium text-gray-900">₹{fmt(amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
