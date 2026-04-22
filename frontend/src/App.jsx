import { useState, useEffect } from 'react';
import { fetchExpenses } from './api/expenses';
import { DEFAULT_FILTERS } from './constants';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import FilterSort from './components/FilterSort';
import TotalBar from './components/TotalBar';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchExpenses(filters);
        if (!cancelled) setExpenses(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [filters, refreshCount]);

  useEffect(() => {
    let cancelled = false;

    fetchExpenses({})
      .then((data) => {
        if (!cancelled) {
          setAllCategories([...new Set(data.map((e) => e.category))].sort());
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [refreshCount]);

  function refresh() { setRefreshCount((count) => count + 1); }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6">
        <h1 className="text-xl font-semibold text-gray-900 leading-[56px] m-0">
          Expense Tracker
        </h1>
      </header>

      <main className="flex flex-1">
        <aside className="w-80 shrink-0 bg-white border-r border-gray-200 p-6">
          <ExpenseForm onCreated={refresh} />
        </aside>

        <section className="flex-1 p-6 flex flex-col gap-4 overflow-x-auto">
          <FilterSort categories={allCategories} filters={filters} onChange={setFilters} />
          <TotalBar expenses={expenses} />
          <ExpenseTable
            expenses={expenses}
            loading={loading}
            error={error}
            onRetry={refresh}
          />
        </section>
      </main>
    </div>
  );
}
