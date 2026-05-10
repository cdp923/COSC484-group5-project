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

  const token = localStorage.getItem("token");

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch(userURL, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
        });
        if(response.status === 401) { // if token is invalid / unauthorized user then redirect to login page
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (!response.ok) { // if response is not ok then throw an error
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // if response is ok then set the user data to the state else throw an error
        setUsers(data);
      } catch (err) {
        setError(err.message);
        console.error("fetch failed", err); // if fetch fails then set the error to the state
      } finally {
        setLoading(false); // if fetch is successful then set loading to false
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