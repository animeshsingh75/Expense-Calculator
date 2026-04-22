import { useState, useRef } from "react";
import { createExpense, generateIdempotencyKey } from "../api/expenses";
import { CATEGORIES, EMPTY_FORM, inputCls } from "../constants";
import FormField from "./FormField";

export default function ExpenseForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [apiError, setApiError] = useState("");
  const idempotencyKey = useRef(generateIdempotencyKey());

  function validate(fields) {
    const errors = {};
    const amount = parseFloat(fields.amount);
    if (!fields.amount || isNaN(amount) || amount <= 0)
      errors.amount = "Enter a positive amount";
    if (!fields.category) errors.category = "Select a category";
    if (!fields.date) errors.date = "Select a date";
    return errors;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStatus("loading");
    try {
      const created = await createExpense(
        {
          amount: form.amount,
          category: form.category,
          description: form.description,
          date: form.date,
        },
        idempotencyKey.current,
      );
      idempotencyKey.current = generateIdempotencyKey();
      setForm(EMPTY_FORM);
      setErrors({});
      setStatus("idle");
      onCreated(created);
    } catch (err) {
      setApiError(err?.message || "Something went wrong. Please try again later.");
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-800 m-0">Add Expense</h2>

      <FormField id="amount" label="Amount (₹)" error={errors.amount}>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={handleChange}
          disabled={isLoading}
          className={inputCls}
        />
      </FormField>

      <FormField id="category" label="Category" error={errors.category}>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          disabled={isLoading}
          className={inputCls}
        >
          <option value="">Select…</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="description" label="Description">
        <input
          id="description"
          name="description"
          type="text"
          placeholder="Optional"
          maxLength={500}
          value={form.description}
          onChange={handleChange}
          disabled={isLoading}
          className={inputCls}
        />
      </FormField>

      <FormField id="date" label="Date" error={errors.date}>
        <input
          id="date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          disabled={isLoading}
          className={inputCls}
        />
      </FormField>

      {status === "error" && (
        <p className="text-xs text-red-500">
          {apiError}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Saving…" : "Add Expense"}
      </button>
    </form>
  );
}
