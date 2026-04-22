import { selectCls } from "../constants";

export default function FilterSort({ categories, filters, onChange }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Filter
      </span>

      <select
        className={selectCls}
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide ml-2">
        Sort
      </span>

      <select
        className={selectCls}
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value })}
      >
        <option value="">Default</option>
        <option value="date_desc">Newest first</option>
      </select>
    </div>
  );
}
