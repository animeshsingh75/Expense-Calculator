import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseTable from '../src/components/ExpenseTable';

const expenses = [
  { id: '1', date: '2025-06-15', category: 'Food', description: 'lunch', amount: '12.50' },
  { id: '2', date: '2025-06-16', category: 'Transport', description: '', amount: '5.00' },
];

const idle = { loading: false, error: null, onRetry: () => {} };

describe('ExpenseTable — loading state', () => {
  it('shows loading text', () => {
    render(<ExpenseTable expenses={[]} loading={true} error={null} onRetry={() => {}} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('does not render the table while loading', () => {
    render(<ExpenseTable expenses={expenses} loading={true} error={null} onRetry={() => {}} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('ExpenseTable — error state', () => {
  it('shows the error message', () => {
    render(<ExpenseTable expenses={[]} {...idle} error="Network error" />);
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  it('calls onRetry when Retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ExpenseTable expenses={[]} loading={false} error="oops" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('ExpenseTable — empty state', () => {
  it('shows the empty placeholder', () => {
    render(<ExpenseTable expenses={[]} {...idle} />);
    expect(screen.getByText('No expenses yet.')).toBeInTheDocument();
  });
});

describe('ExpenseTable — populated state', () => {
  it('renders a row for each expense', () => {
    render(<ExpenseTable expenses={expenses} {...idle} />);
    expect(screen.getByText('2025-06-15')).toBeInTheDocument();
    expect(screen.getByText('2025-06-16')).toBeInTheDocument();
  });

  it('renders category badges', () => {
    render(<ExpenseTable expenses={expenses} {...idle} />);
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('shows em-dash for an empty description', () => {
    render(<ExpenseTable expenses={expenses} {...idle} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders actual description text when present', () => {
    render(<ExpenseTable expenses={expenses} {...idle} />);
    expect(screen.getByText('lunch')).toBeInTheDocument();
  });
});
