import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { migrate } from './db.js';
import expensesRouter from './routes/expenses.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/expenses', expensesRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Express 5 passes async errors automatically, but keep an explicit handler
// so the JSON shape is consistent across all error types
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

migrate()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to run migrations:', err);
    process.exit(1);
  });
