import { useEffect, useState } from "react";
import { useAuthFetch, API_BASE } from "../../lib/authFetch";
import "./styles/accounts.css";

const ACCOUNTS_URL = `${API_BASE}/accounts`;

export default function Accounts() {
  const authFetch = useAuthFetch(); // used to make authenticated requests to the API

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

  if (loading) return <p>Loading accounts...</p>; // shown when accounts API is fetching

  return (
    <>
      <div className="accounts-container">
      </div>
    </>
  );
}
