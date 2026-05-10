import { useEffect, useState } from "react";
import { useAuthFetch, API_BASE } from "../../lib/authFetch";
import "./styles/budgets.css";

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

  if (loading) return <p>Loading budgets...</p>;

  return (
    <>
      <div className="budgets-container">
        <h3>Create a Budget</h3>
        {error && <p className="error">{error}</p>}
        <form className="budgets-form" onSubmit={handleCreate}> 
          <label htmlFor="budget-name">Budget Name</label>
          <input
            type="text"
            id="budget-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="budget-limit">Total Limit ($)</label>
          <input
            type="number"
            id="budget-limit"
            min="0"
            step="0.01"
            value={totalLimit}
            onChange={(e) => setTotalLimit(e.target.value)}
            required
          />

          <label htmlFor="budget-period">Period</label>
          <select
            id="budget-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            required
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
    </>
  );
}
