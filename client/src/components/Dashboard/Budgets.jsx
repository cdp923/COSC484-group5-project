import { useEffect, useState } from "react";
import { useAuthFetch, API_BASE } from "../../lib/authFetch";
import "./styles/dashboard-panel.css";

const BUDGETS_URL = `${API_BASE}/budgets`;

export default function Budgets() { // function to get user's budgets from the API
  const authFetch = useAuthFetch();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // state variables for budget form
  const [name, setName] = useState("");
  const [totalLimit, setTotalLimit] = useState("");
  const [period, setPeriod] = useState("monthly");

  async function loadBudgets() { // fethc to load user's budgets from the API
    try {
      setError(null);
      const data = await authFetch(BUDGETS_URL);
      setBudgets(data);
    } catch (err) {
      if (err.message !== "Unauthorized") setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { // loads budgets when the component mounts
    loadBudgets();
  }, []);

  async function handleCreate(e) { // fetch to create a new budget
    e.preventDefault();
    try {
      const created = await authFetch(BUDGETS_URL, {
        method: "POST",
        body: JSON.stringify({ name, totalLimit: Number(totalLimit), period }),
      });
      // state setters to update the state variables
      setBudgets((prev) => [...prev, created]);
      setName("");
      setTotalLimit("");
      setPeriod("monthly");
    } catch (err) {
      if (err.message !== "Unauthorized") setError(err.message);
    }
  }

  async function handleDelete(id) { // fetch to delete a budget
    try {
      await authFetch(`${BUDGETS_URL}/${id}`, { method: "DELETE" });
      setBudgets((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      if (err.message !== "Unauthorized") setError(err.message);
    }
  }

  if (loading) return <p>Loading budgets...</p>;

  return (
    <div className="dashboard-panel">
      <div className="panel-form">
        <h3>Create Budget</h3>
        {error && <p className="error">{error}</p>}
        {/* form to create a new budget sits on the left side of the dashboard panel */}
        <form onSubmit={handleCreate}>
          <label htmlFor="budget-name">Budget Name</label>
          <input type="text" id="budget-name" value={name} onChange={(e) => setName(e.target.value)} required
          />

          <label htmlFor="budget-limit">Total Limit ($)</label>
          <input type="number" id="budget-limit" min="0" step="0.01" value={totalLimit} onChange={(e) => setTotalLimit(e.target.value)} required
          />

          <label htmlFor="budget-period">Period</label>
          <select id="budget-period" value={period} onChange={(e) => setPeriod(e.target.value)} required
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <button className="btn btn-secondary" type="submit">
            Create Budget
          </button>
        </form>
      </div>

      {/* table to display user's budgets sits on the right side of the dashboard panel */}
      <div className="panel-table">
        <h3>Budgets</h3>
        {budgets.length === 0 ? (
          <p className="empty-msg">No budgets yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Limit</th>
                <th>Spent</th>
                <th>Period</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => {
                const spent = Number(budget.spent || 0);
                const limit = Number(budget.totalLimit);
                const percentage = limit > 0 ? (spent / limit) * 100 : 0;
                let color = "#2e7d32";
                if (percentage > 75) color = "#e65100";
                if (percentage > 90) color = "#c62828";

                return (
                  <tr key={budget._id}>
                    <td><strong>{budget.name}</strong></td>
                    <td>${limit.toFixed(2)}</td>
                    <td style={{ color }}>${spent.toFixed(2)}</td>
                    <td style={{ textTransform: "capitalize" }}>{budget.period}</td>
                    <td>
                      <button className="btn-danger" onClick={() => handleDelete(budget._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
