import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExpenseForm from '../src/components/ExpenseForm';

vi.mock('../src/api/expenses', () => ({
  createExpense: vi.fn(),
  generateIdempotencyKey: () => 'test-idem-key',
}));

import { createExpense } from '../src/api/expenses';

function fillValidForm() {
  fireEvent.change(screen.getByLabelText('Amount (₹)'), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Food' } });
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2025-06-15' } });
}

describe('ExpenseForm — validation', () => {
  beforeEach(() => vi.resetAllMocks());

  it('shows errors for all required fields when submitted empty', async () => {
    render(<ExpenseForm onCreated={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText('Enter a positive amount')).toBeInTheDocument();
    expect(screen.getByText('Select a category')).toBeInTheDocument();
    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('clears the amount error when the user types a value', async () => {
    render(<ExpenseForm onCreated={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    await screen.findByText('Enter a positive amount');
    fireEvent.change(screen.getByLabelText('Amount (₹)'), { target: { value: '5' } });
    expect(screen.queryByText('Enter a positive amount')).not.toBeInTheDocument();
  });

  it('does not submit when amount is zero', async () => {
    render(<ExpenseForm onCreated={() => {}} />);
    fireEvent.change(screen.getByLabelText('Amount (₹)'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText('Enter a positive amount')).toBeInTheDocument();
    expect(createExpense).not.toHaveBeenCalled();
  });
});

describe('ExpenseForm — successful submit', () => {
  beforeEach(() => vi.resetAllMocks());

  it('calls onCreated with the returned expense', async () => {
    const created = { id: 'new-id', amount: '10.00', category: 'Food' };
    createExpense.mockResolvedValue(created);
    const onCreated = vi.fn();

    render(<ExpenseForm onCreated={onCreated} />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
  });

  it('resets the form fields after a successful submit', async () => {
    createExpense.mockResolvedValue({ id: 'x' });
    render(<ExpenseForm onCreated={() => {}} />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));

    await waitFor(() =>
      expect(screen.getByLabelText('Amount (₹)').value).toBe('')
    );
    expect(screen.getByLabelText('Category').value).toBe('');
  });

  it('shows "Saving…" on the button while the request is in flight', async () => {
    createExpense.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ExpenseForm onCreated={() => {}} />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();
  });
});

describe('ExpenseForm — API error', () => {
  beforeEach(() => vi.resetAllMocks());

  it('shows the server error message', async () => {
    createExpense.mockRejectedValue(new Error('Amount must be a positive number.'));
    render(<ExpenseForm onCreated={() => {}} />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText(/Amount must be a positive number\./)).toBeInTheDocument();
  });

  it('restores the submit button after an error', async () => {
    createExpense.mockRejectedValue(new Error('Server error'));
    render(<ExpenseForm onCreated={() => {}} />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByRole('button', { name: 'Add Expense' })).toBeInTheDocument();
  });
});
