import { useEffect, useState } from "react";
import { useAuthFetch, API_BASE } from "../../lib/authFetch";
import "./styles/transactions.css";

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
    <>
      <div className="transactions-container">
        <h3>New Transaction</h3>
        {error && <p className="error">{error}</p>}
        <form className="transactions-form" onSubmit={handleCreate}>
          <label htmlFor="txn-account">Account</label>
          <select
            id="txn-account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>

          <label htmlFor="txn-type">Type</label>
          <select
            id="txn-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>

          {type === "transfer" && (
            <>
              <label htmlFor="txn-transfer">Transfer To</label>
              <select
                id="txn-transfer"
                value={transferAccountId}
                onChange={(e) => setTransferAccountId(e.target.value)}
                required
              >
                <option value="">Select destination</option>
                {accounts
                  .filter((a) => a._id !== accountId)
                  .map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </>
          )}

          {type === "expense" && budgets.length > 0 && (
            <>
              <label htmlFor="txn-budget">Budget (optional)</label>
              <select
                id="txn-budget"
                value={budgetId}
                onChange={(e) => setBudgetId(e.target.value)}
              >
                <option value="">No budget</option>
                {budgets.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} — {b.period}
                  </option>
                ))}
              </select>
            </>
          )}

          <label htmlFor="txn-amount">Amount</label>
          <input
            type="number"
            id="txn-amount"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label htmlFor="txn-desc">Description</label>
          <input
            type="text"
            id="txn-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button className="btn btn-secondary" type="submit">
            Add Transaction
          </button>
        </form>
      </div>

      <div className="transactions-list">
        <h3>Transactions</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <ul>
            {transactions.map((txn) => (
              <li key={txn._id}>
                <span>
                  <strong>{txn.type}</strong> — ${txn.amount.toFixed(2)}
                  {txn.description && ` — ${txn.description}`}
                </span>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(txn._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
