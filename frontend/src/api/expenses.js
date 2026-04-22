import { v4 as uuidv4 } from 'uuid';
import { BASE_URL } from '../constants';

export function generateIdempotencyKey() {
  return uuidv4();
}

export async function fetchExpenses({ category, sort } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (sort) params.set('sort', sort);

  const res = await fetch(`${BASE_URL}/expenses?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch expenses: ${res.status}`);
  return res.json();
}

export async function createExpense(data, idempotencyKey) {
  const res = await fetch(`${BASE_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}
