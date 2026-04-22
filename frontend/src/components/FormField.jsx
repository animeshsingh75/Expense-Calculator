import { labelCls } from '../constants';

export default function FormField({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={labelCls}>{label}</label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
