import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { parseAmount, isValidDate } from '../utils.js';

const router = Router();

// Serialize DB row for API response.
// amount is stored as INTEGER paise; return as decimal string to avoid float precision issues.
function serialize(row) {
  return {
    id: row.id,
    amount: (row.amount / 100).toFixed(2),
    category: row.category,
    description: row.description ?? '',
    date: row.date.toISOString().slice(0, 10),
    created_at: row.created_at,
  };
}

const VALID_CATEGORIES = new Set(['Food', 'Transport', 'Shopping', 'Utilities', 'Health', 'Entertainment', 'Other']);
const MAX_DESCRIPTION_LENGTH = 500;


// POST /expenses
router.post('/', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency-Key header is required' });
  }

  const { amount, category, description, date } = req.body;

  // Validate
  const amountPaise = parseAmount(amount);
  if (!amountPaise) {
    return res.status(422).json({ error: 'Amount must be a positive number.' });
  }
  if (!category || !VALID_CATEGORIES.has(category)) {
    return res.status(422).json({ error: `Category must be one of: ${[...VALID_CATEGORIES].join(', ')}.` });
  }
  if (description != null && description.length > MAX_DESCRIPTION_LENGTH) {
    return res.status(422).json({ error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.` });
  }
  if (!date || !isValidDate(date)) {
    return res.status(422).json({ error: 'Date must be a valid calendar date in YYYY-MM-DD format.' });
  }

  // Idempotency check — return the existing record if this key was already used
  const existing = await pool.query(
    'SELECT * FROM expenses WHERE idempotency_key = $1',
    [idempotencyKey],
  );
  if (existing.rows.length > 0) {
    return res.status(200).json(serialize(existing.rows[0]));
  }

  const id = uuidv4();
  const { rows } = await pool.query(
    `INSERT INTO expenses (id, idempotency_key, amount, category, description, date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, idempotencyKey, amountPaise, category.trim(), description?.trim() ?? null, date],
  );

  return res.status(201).json(serialize(rows[0]));
});

// GET /expenses?category=Food&sort=date_desc
router.get('/', async (req, res) => {
  const { category, sort } = req.query;

  const conditions = [];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = sort === 'date_desc' ? 'ORDER BY date DESC, created_at DESC' : 'ORDER BY created_at DESC';

  const { rows } = await pool.query(`SELECT * FROM expenses ${where} ${order}`, params);
  return res.json(rows.map(serialize));
});

export default router;
