import { useEffect, useState } from "react";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const userURL = `${baseURL}/users/me`;
  const accountsURL = `${baseURL}/accounts`;
  const transactionsURL = `${baseURL}/transactions`;
  const budgetsURL = `${baseURL}/budgets`;

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch(userURL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
        console.error("fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  if (loading) return <p>Loading team members...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}