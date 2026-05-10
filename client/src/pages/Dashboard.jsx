import { useEffect, useState, useNavigate, useCallback, useMemo } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const URLS = useMemo(() => ({ // cache the URLS to prevent the URLS objects from being recreated on every render
    user: `${baseURL}/users/me`,

    accounts: `${baseURL}/accounts`,
    account: (id) => `${baseURL}/accounts/${encodeURIComponent(id)}`,

    transactions: `${baseURL}/transactions`,
    transaction: (id) => `${baseURL}/transactions/${encodeURIComponent(id)}`,

    budgets: `${baseURL}/budgets`,
    budget: (id) => `${baseURL}/budgets/${encodeURIComponent(id)}`,
  }), [baseURL]);

  const fetchAllData = useCallback( // function to fetch all data from the API
    async (url, options = {}) => {
      const token = localStorage.getItem("token"); // get token from local storage
      const headers = { Accept: "application/json", ...options?.headers }; // set headers to accept JSON and any other headers passed in
      if (token) headers.Authorization = `Bearer ${token}`;
      if (options.body !== undefined && !(options.body instanceof FormData)) { // if body is not undefined and not a FormData object then set content type to JSON
        headers["Content-Type"] = "application/json";
      }
      const response = await fetch(url, { ...options, headers }); // fetch data
      if (response.status === 401) { // if status is unauthorized then remove token and navigate to login page
        localStorage.removeItem("token");
        navigate("/login");
        throw new Error("Unauthorized");
      }
      const text = await response.text(); // get text from response
      let data = null;
      try {
        data = text ? JSON.parse(text) : null; // parse text to JSON
      } catch {
        data = text; // if text is not JSON then set data to text
      }
      if (!response.ok) {
        const msg = // if response is not ok then throw an error
          (data && data.message) ||
          (data && data.error) ||
          response.statusText ||
          "Request failed"; // if response is not ok then set message to Request failed
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg)); // throw new error with message
      }
      return data;
    },
    [navigate],
  );

  const loadAll = useCallback(async () => { // load all data from the API
    setError(null);
    setLoading(true); // start loading state
    try {
      const [me, accounts, transactions, budgets] = await Promise.all([ // fetch all data from the API
        fetchAllData(URLS.user),
        fetchAllData(URLS.accounts),
        fetchAllData(URLS.transactions),
        fetchAllData(URLS.budgets),
      ]);
      // data setters
      setUser(me); 
      setAccounts(accounts);
      setTransactions(transactions);
      setBudgets(budgets);
    } catch (error) {
      if (error.message !== "Unauthorized") {
        setError(error.message);
        console.error("fetch failed", error);
      }
    } finally {
      setLoading(false); // false loading state once all data is fetched
    }
  }, [fetchAllData, URLS]);

  useEffect(() => {
    if (!localStorage.getItem("token")) { // if token is not in local storage then navigate to login page
      navigate("/login");
      return;
    }
    const id = window.setTimeout(() => {
      void loadAll();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadAll, navigate]);


  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}