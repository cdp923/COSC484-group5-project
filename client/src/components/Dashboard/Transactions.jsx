import { useEffect, useState } from "react";
import { useAuthFetch, API_BASE } from "../../lib/authFetch";
import "./styles/transactions.css";

const TRANSACTIONS_URL = `${API_BASE}/transactions`;
const ACCOUNTS_URL = `${API_BASE}/accounts`;

export default function Transactions() { // function to get user's transactions from the API
  const authFetch = useAuthFetch();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [accountId, setAccountId] = useState("");
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transferAccountId, setTransferAccountId] = useState("");

  async function loadData() { // fetch to load user's transactions and accounts
    try {
      setError(null);
      const [txns, accts] = await Promise.all([
        authFetch(TRANSACTIONS_URL),
        authFetch(ACCOUNTS_URL),
      ]);
      setTransactions(txns);
      setAccounts(accts);
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
      const created = await authFetch(TRANSACTIONS_URL, {
        method: "POST",
        body: JSON.stringify(body),
      });
      // state setters to update the state variables
      setTransactions((prev) => [...prev, created]);
      setAmount("");
      setDescription("");
      setTransferAccountId("");
    } catch (err) {
      if (err.message !== "Unauthorized") setError(err.message);
    }
  }

  async function handleDelete(id) { // fetch to delete a transaction
    try {
      await authFetch(`${TRANSACTIONS_URL}/${id}`, { method: "DELETE" });
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      if (err.message !== "Unauthorized") setError(err.message);
    }
  }

  if (loading) return <p>Loading transactions...</p>;

  return (
    <>
    </>
  );
}
