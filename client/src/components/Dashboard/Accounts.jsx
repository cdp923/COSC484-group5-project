import { useEffect, useState } from "react";
import { useAuthFetch, API_BASE } from "../../lib/authFetch";
import "./styles/dashboard-panel.css";

const ACCOUNTS_URL = `${API_BASE}/accounts`;

export default function Accounts() {
  const authFetch = useAuthFetch();

  // state variables 
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("checking");
  const [balance, setBalance] = useState("");

  async function loadAccounts() { // function to load user's accounts from the API
    try {
      setError(null);
      const data = await authFetch(ACCOUNTS_URL); // fetches accounts from the API using the authFetch wrapper
      setAccounts(data);
    } catch (err) {
      if (err.message !== "Unauthorized") setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { // loads accounts when the component mounts
    loadAccounts();
  }, []);

  async function handleCreate(e) { // function for creating a new account
    e.preventDefault();
    try {
      const created = await authFetch(ACCOUNTS_URL, { // creates a new account using the authFetch wrapper
        method: "POST",
        body: JSON.stringify({ name, accountType, balance: Number(balance) }),
      });
      setAccounts((prev) => [...prev, created]);
      setName("");
      setBalance("");
      setAccountType("checking");
    } catch (err) {
      if (err.message !== "Unauthorized") setError(err.message);
    }
  }

  async function handleDelete(id) { // function for deleting an account
    try {
      await authFetch(`${ACCOUNTS_URL}/${id}`, { method: "DELETE" }); // deletes account from the API using the authFetch wrapper
      setAccounts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      if (err.message !== "Unauthorized") setError(err.message);
    }
  }

  if (loading) return <p>Loading accounts...</p>; // shown when accounts API is fetching

  return (
    <div className="dashboard-panel">
      <div className="panel-form">
        <h3>Create Account</h3>
        {error && <p className="error">{error}</p>}
        {/* form to create a new account sits on the left side of the dashboard panel */}
        <form onSubmit={handleCreate}>
          <label htmlFor="name">Account Name</label>
          <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required
          />

          <label htmlFor="accountType">Account Type</label>
          <select id="accountType" name="accountType" value={accountType} onChange={(e) => setAccountType(e.target.value)} required>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit">Credit</option>
            <option value="investment">Investment</option>
          </select>

          <label htmlFor="balance">Starting Balance</label>
          <input type="number" id="balance" name="balance" value={balance} onChange={(e) => setBalance(e.target.value)} required />

          <button className="btn btn-secondary" type="submit">
            Create Account
          </button>
        </form>
      </div>
      {/* table to display user's accounts sits on the right side of the dashboard panel */}
      <div className="panel-table">
        <h3>Accounts</h3>
        {accounts.length === 0 ? (
          <p className="empty-msg">No accounts yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account._id}>
                  <td><strong>{account.name || "Unnamed"}</strong></td>
                  <td><span className="acct-type">{account.accountType || "N/A"}</span></td>
                  <td>${Number(account.balance).toFixed(2)}</td>
                  <td>
                    <button className="btn-danger" onClick={() => handleDelete(account._id)}>
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
