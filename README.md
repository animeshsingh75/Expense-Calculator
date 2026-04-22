# Expense Tracker

A full-stack personal expense tracker built as a production-quality exercise. The goal was to keep the feature set small while making the system correct under real-world conditions — unreliable networks, duplicate submissions, and page refreshes.

---

## Running Locally

**Backend**

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL
npm install
npm run dev                   # http://localhost:3001
```

**Frontend**

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

**Tests**

```bash
# Backend (Node built-in test runner)
cd backend && npm test

# Frontend (Vitest + Testing Library)
cd frontend && npm test
```

---

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/expenses` | Create an expense. Requires `Idempotency-Key` header. |
| `GET` | `/expenses` | List expenses. Optional: `?category=Food&sort=date_desc` |
| `GET` | `/health` | Liveness check. |

**POST /expenses — request body**

```json
{
  "amount": "12.50",
  "category": "Food",
  "description": "Lunch",
  "date": "2025-06-15"
}
```

---

## Key Design Decisions

### 1. PostgreSQL for persistence

I chose PostgreSQL over an in-memory store or JSON file because the brief explicitly asks for production-like quality and mentions real-world conditions. SQLite was a close alternative — it would have simplified deployment — but Postgres gives proper concurrent-write safety, a native `DATE` type, and `UNIQUE` constraints that the idempotency design relies on. The schema is auto-migrated on startup with `CREATE TABLE IF NOT EXISTS`, so there is no separate migration step.

### 2. Money stored as INTEGER paise, not DECIMAL or FLOAT

`amount` is stored as an `INTEGER` representing paise (1 rupee = 100 paise). This is the standard technique for avoiding floating-point rounding errors in financial software. `12.50` becomes `1250` on the way in and `"12.50"` (a string) on the way out, so the API never hands a JavaScript `number` to the consumer for a money value.

The alternative — `NUMERIC(12,2)` — is also correct, but the integer-paise approach is simpler to reason about: there is no rounding at any layer.

### 3. Idempotency keys for safe retries

The assignment specifically calls out: *the API should behave correctly even if the client retries the same request due to network issues or page reloads.*

Every `POST /expenses` request must include an `Idempotency-Key` header (a UUID). The key is stored in the database with a `UNIQUE` constraint on `idempotency_key`. If the same key arrives a second time, the existing record is returned with `200` instead of creating a duplicate — identical to how Stripe, Square, and most payment APIs handle this.

On the frontend, the key is generated once per form session (`useRef`) and only rotated after a successful submission. This means:

- Double-click submit → same key → server deduplicates → one record created.
- Page refresh → new component mount → new key → treated as a fresh intent to submit.

### 4. Idempotency key is required, not optional

Making the key optional would silently allow clients that forget the header to create duplicates. Requiring it forces the contract explicitly and makes the safety guarantee unconditional.

### 5. Server-side filtering and sorting

Filtering and sorting are applied at the database query level (`WHERE category = $1`, `ORDER BY date DESC`), not client-side on a cached array. This keeps the frontend stateless with respect to the full dataset and makes the behaviour correct even as the list grows. The `GET /expenses` route is the single source of truth — the frontend just re-queries it when filters change.

### 6. Category as a validated enum (not a DB enum type)

Categories are validated server-side against a `Set` in application code rather than a PostgreSQL `ENUM` type. The behaviour is the same — invalid values are rejected — but adding a new category later only requires changing one line of code rather than an `ALTER TYPE` migration.

### 7. Date validated as a real calendar date

`isValidDate` uses two checks: a regex for the format (`YYYY-MM-DD`) and a round-trip through `Date` to reject non-existent dates like `2025-02-30`. The backend stores dates in a `DATE` column so no timezone drift occurs — the date the user picked is the date stored.

### 8. Frontend: React + Vite + Tailwind

Standard modern React stack. Tailwind keeps styling co-located and avoids the overhead of a component library for a small UI. No state management library — `useState` and `useEffect` are sufficient for this scale.

### 9. Stale fetch cancellation

Both `useEffect` hooks in `App.jsx` set a `cancelled` flag and check it before calling `setState`. This prevents a slow response from an earlier filter selection from overwriting the result of a later one (a classic React race condition).

### 10. Total and per-category breakdown

`TotalBar` computes the total and per-category subtotals from the currently visible expense list (after filters are applied). This satisfies the "total of the current list" requirement and adds the per-category summary listed as a nice-to-have in the brief.

---

## Trade-offs Made Due to the Timebox

- **No authentication.** The tool is single-user. Adding auth would be the first production concern after this exercise.
- **No pagination.** All expenses are returned in a single query, which also keeps the total and per-category breakdown accurate over the full filtered result set. For a personal tracker this is acceptable; a multi-user or long-running app would need cursor-based pagination plus a separate count/summary strategy.
- **No edit or delete.** The brief did not ask for these and they add non-trivial surface area (confirmation states, optimistic updates, re-validation).
- **Filter state is not persisted across page refreshes.** The default sort (newest first) is set in constants; category filter resets to "All" on reload. Persisting to `localStorage` or the URL query string was cut for time.
- **No rate limiting or request size limits.** Fine for a personal tool; required before any public-facing deployment.

---

## Intentionally Not Done

- **Multi-user support / auth** — out of scope.
- **Recurring expenses / budgets** — out of scope.
- **Optimistic UI updates** — the list refreshes from the server after every successful create. This is simpler and always correct; optimistic updates add complexity without changing correctness guarantees for a single-user tool on a local network.
- **Edit/delete expenses** — not in the acceptance criteria.
- **Integration tests against a real database** — the backend unit tests cover the pure utility functions (`parseAmount`, `isValidDate`). A full integration test suite would spin up a test database and assert HTTP responses end-to-end; that was cut for time.
