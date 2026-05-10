import { useEffect, useState } from "react";
import { useAuthFetch, API_BASE } from "../../lib/authFetch";
import "./styles/dashboard-panel.css";

const TRANSACTIONS_URL = `${API_BASE}/transactions`;
const ACCOUNTS_URL = `${API_BASE}/accounts`;
const BUDGETS_URL = `${API_BASE}/budgets`;

export default function Transactions() { // function to get user's transactions from the API
  const authFetch = useAuthFetch();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [accountId, setAccountId] = useState("");
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transferAccountId, setTransferAccountId] = useState("");
  const [budgetId, setBudgetId] = useState("");

  async function loadData() { // fetch to load user's transactions and accounts
    try {
      setError(null);
      const [txns, accts, bdgs] = await Promise.all([
        authFetch(TRANSACTIONS_URL),
        authFetch(ACCOUNTS_URL),
        authFetch(BUDGETS_URL),
      ]);
      setTransactions(txns);
      setAccounts(accts);
      setBudgets(bdgs);
    } catch (err) {
      if (err.message !== "Unauthorized") setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { // loads transactions and accounts when the component mounts
    loadData();
  }, []);

  async function handleCreate(e) { // fetch to create a new transaction
    e.preventDefault();
    try {
      const body = {
        accountId,
        type,
        amount: Number(amount),
        description,
      };
      if (type === "transfer" && transferAccountId) {
        body.transferAccountId = transferAccountId;
      }
      if (type === "expense" && budgetId) {
        body.budgetId = budgetId;
      }
      const created = await authFetch(TRANSACTIONS_URL, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setTransactions((prev) => [...prev, created]);
      const [updatedAccounts, updatedBudgets] = await Promise.all([
        authFetch(ACCOUNTS_URL),
        authFetch(BUDGETS_URL),
      ]);
      setAccounts(updatedAccounts);
      setBudgets(updatedBudgets);
      setAmount("");
      setDescription("");
      setTransferAccountId("");
      setBudgetId("");
    } catch (err) {
      if (err.message !== "Unauthorized") setError(err.message);
    }
  }

  async function handleDelete(id) { // fetch to delete a transaction
    try {
      await authFetch(`${TRANSACTIONS_URL}/${id}`, { method: "DELETE" });
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      const [updatedAccounts, updatedBudgets] = await Promise.all([
        authFetch(ACCOUNTS_URL),
        authFetch(BUDGETS_URL),
      ]);
      setAccounts(updatedAccounts);
      setBudgets(updatedBudgets);
    } catch (err) {
      if (err.message !== "Unauthorized") setError(err.message);
    }
  }

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div className="dashboard-panel">
      <div className="panel-form">
        <h3>New Transaction</h3>
        {error && <p className="error">{error}</p>}
        {/* form to create a new transaction sits on the left side of the dashboard panel */}
        <form onSubmit={handleCreate}>
          <label htmlFor="transaction-account">Account</label>
          <select id="transaction-account" name="accountId" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
            <option value="">Select account</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name}
              </option>
            ))}
          </select>

          <label htmlFor="transaction-type">Type</label>
          <select id="transaction-type" name="type" value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>

          {type === "transfer" && (
            <>
              <label htmlFor="transaction-transfer">Transfer To</label>
              <select id="transaction-transfer" value={transferAccountId} onChange={(e) => setTransferAccountId(e.target.value)} required>
                <option value="">Select destination</option>
                {accounts
                  .filter((account) => account._id !== accountId)
                  .map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name}
                    </option>
                  ))}
              </select>
            </>
          )}

          {type === "expense" && budgets.length > 0 && (
            <>
              <label htmlFor="transaction-budget">Budget (optional)</label>
              <select id="transaction-budget" value={budgetId} onChange={(e) => setBudgetId(e.target.value)}>
                <option value="">No budget</option>
                {budgets.map((budget) => (
                  <option key={budget._id} value={budget._id}>
                    {budget.name} — {budget.period}
                  </option>
                ))}
              </select>
            </>
          )}

          <label htmlFor="transaction-amount">Amount</label>
          <input type="number" id="transaction-amount" name="amount" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />

          <label htmlFor="transaction-description">Description</label>
          <input type="text" id="transaction-description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />

          <button className="btn btn-secondary" type="submit">
            Add Transaction
          </button>
        </form>
      </div>

      {/* table to display user's transactions sits on the right side of the dashboard panel */}
      <div className="panel-table">
        <h3>Transactions</h3>
        {transactions.length === 0 ? (
          <p className="empty-msg">No transactions yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Account</th>
                <th>Description</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...transactions]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{new Date(transaction.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                    <td><span className={`type-badge ${transaction.type}`}>{transaction.type}</span></td>
                    <td>{accounts.find((a) => a._id === transaction.accountId)?.name || "—"}</td>
                    <td>{transaction.description || "—"}</td>
                    <td>${Number(transaction.amount).toFixed(2)}</td>
                    <td>
                      <button className="btn-danger" onClick={() => handleDelete(transaction._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
