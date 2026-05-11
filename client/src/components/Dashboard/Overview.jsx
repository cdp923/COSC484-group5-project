import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { useAuthFetch, API_BASE } from "../../lib/authFetch";
import "./styles/overview.css";

Chart.register(...registerables); 

// API URLs
const TRANSACTIONS_URL = `${API_BASE}/transactions`;
const ACCOUNTS_URL = `${API_BASE}/accounts`;
const BUDGETS_URL = `${API_BASE}/budgets`;

// Chart colors using oklch color space
const CHART_COLORS = [
  "oklch(50% 0.12 260)",
  "oklch(75% 0.15 145)",
  "oklch(82% 0.14 85)",
  "oklch(62% 0.19 25)",
  "oklch(76% 0.08 230)",
  "oklch(62% 0.12 160)",
  "oklch(72% 0.16 45)",
  "oklch(52% 0.15 310)",
];

function formatMoney(n) { // formatted money to 2 decimal places
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) { // formatted date to month, day, year
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Overview() {
  const authFetch = useAuthFetch();

  // State variables for accounts, transactions, budgets, loading, and error
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for chart elements
  const balanceDoughnutRef = useRef(null);
  const transactionBarRef = useRef(null);
  const accountTypeBarRef = useRef(null);
  const spendingLineRef = useRef(null);

  const chartInstances = useRef([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const [accounts, transactions, budgets] = await Promise.all([
          authFetch(ACCOUNTS_URL),
          authFetch(TRANSACTIONS_URL),
          authFetch(BUDGETS_URL),
        ]);
        if (!cancelled) {
          setAccounts(accounts);
          setTransactions(transactions);
          setBudgets(budgets);
        }
      } catch (error) {
        if (!cancelled && error.message !== "Unauthorized") setError(error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [authFetch]);

  useEffect(() => { // destroys chart instances when the component unmounts
    chartInstances.current.forEach((chartInstance) => chartInstance.destroy());
    chartInstances.current = [];

    if (loading) return;

    // Balances chart
    if (balanceDoughnutRef.current && accounts.length > 0) {
      const ctx = balanceDoughnutRef.current.getContext("2d");
      chartInstances.current.push(
        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: accounts.map((account) => account.name),
            datasets: [{
              data: accounts.map((account) => Number(account.balance)),
              backgroundColor: CHART_COLORS.slice(0, accounts.length),
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "right" } },
          },
        })
      );
    }

    // Transaction totals bar chart
    if (transactionBarRef.current && transactions.length > 0) {
      const totals = { income: 0, expense: 0, transfer: 0 };
      transactions.forEach((transaction) => {
        const key = String(transaction.type).toLowerCase();
        if (key in totals) totals[key] += Number(transaction.amount);
      });

      const ctx = transactionBarRef.current.getContext("2d");
      chartInstances.current.push( // pushes new chart instance to the chartInstances ref
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Income", "Expense", "Transfer"],
            datasets: [{
              label: "Total ($)",
              data: [totals.income, totals.expense, totals.transfer],
              backgroundColor: ["oklch(75% 0.15 145)", "oklch(62% 0.19 25)", "oklch(50% 0.12 260)"],
              borderRadius: 6,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { callback: (v) => "$" + v } },
            },
          },
        })
      );
    }

    // Balance by account type horizontal bar chart
    if (accountTypeBarRef.current && accounts.length > 0) {
      const byType = {};
      accounts.forEach((account) => {
        const type = account.accountType || "other";
        byType[type] = (byType[type] || 0) + Number(account.balance);
      });
      const typeLabels = Object.keys(byType).map((type) => type.charAt(0).toUpperCase() + type.slice(1));
      const typeValues = Object.values(byType);

      const ctx = accountTypeBarRef.current.getContext("2d");
      chartInstances.current.push( // pushes new chart instance to the chartInstances ref
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: typeLabels,
            datasets: [{
              label: "Balance ($)",
              data: typeValues,
              backgroundColor: CHART_COLORS.slice(0, typeLabels.length),
              borderRadius: 6,
            }],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { beginAtZero: true, ticks: { callback: (v) => "$" + v } },
            },
          },
        })
      );
    }

    // Spending over time line chart
    if (spendingLineRef.current && transactions.length > 0) {
      const expenses = transactions // filters transactions to only include expenses
        .filter((transaction) => transaction.type === "expense")
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (expenses.length > 0) {
        const dailyMap = {};
        expenses.forEach((transaction) => { // maps transactions to daily totals
          const day = new Date(transaction.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          dailyMap[day] = (dailyMap[day] || 0) + Number(transaction.amount);
        });
        const labels = Object.keys(dailyMap);
        const data = Object.values(dailyMap);

        const ctx = spendingLineRef.current.getContext("2d");
        chartInstances.current.push( // pushes new chart instance to the chartInstances ref
          new Chart(ctx, {
            type: "line",
            data: {
              labels,
              datasets: [{
                label: "Expenses ($)",
                data,
                borderColor: "oklch(62% 0.19 25)",
                backgroundColor: "oklch(62% 0.19 25 / 0.1)",
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointBackgroundColor: "oklch(62% 0.19 25)",
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, ticks: { callback: (v) => "$" + v } },
              },
            },
          })
        );
      }
    }

    return () => { // destroys chart instances when the component unmounts
      chartInstances.current.forEach((chartInstance) => chartInstance.destroy());
      chartInstances.current = [];
    };
  }, [loading, accounts, transactions]);

  if (loading) return <p>Loading overview...</p>; // shows when the overview is loading

  // Computed stats
  const totalBalance = accounts.reduce((s, account) => s + Number(account.balance), 0); // total balance of all accounts
  const totalIncome = transactions.filter((transaction) => transaction.type === "income").reduce((s, transaction) => s + Number(transaction.amount), 0); // total income of all transactions
  const totalExpenses = transactions.filter((transaction) => transaction.type === "expense").reduce((s, transaction) => s + Number(transaction.amount), 0); // total expenses of all transactions
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5); // recent transactions sorted by date

  const accountMap = {};
  accounts.forEach((account) => { accountMap[account._id] = account.name; }); // maps accounts to their ids

  return (
    <div className="overview">
      {error && <p className="error">{error}</p>}

      {/* ── Summary cards ── */}
      <div className="overview-cards">
        <div className="overview-card">
          <h4>Total Balance</h4>
          <div className={`value ${totalBalance >= 0 ? "positive" : "negative"}`}>
            {formatMoney(totalBalance)}
          </div>
        </div>
        <div className="overview-card">
          <h4>Total Income</h4>
          <div className="value positive">{formatMoney(totalIncome)}</div>
        </div>
        <div className="overview-card">
          <h4>Total Expenses</h4>
          <div className="value negative">{formatMoney(totalExpenses)}</div>
        </div>
        <div className="overview-card">
          <h4>Accounts</h4>
          <div className="value">{accounts.length}</div>
        </div>
        <div className="overview-card">
          <h4>Transactions</h4>
          <div className="value">{transactions.length}</div>
        </div>
      </div>

      {/* Individual account balances */}
      {accounts.length > 0 && ( // shows when there are accounts
        <div className="overview-cards">
          {accounts.map((account) => ( // maps accounts to the overview cards
            <div className="overview-card" key={account._id}>
              <h4>{account.name || "Unnamed Account"}</h4>
              <div className={`value ${Number(account.balance) >= 0 ? "positive" : "negative"}`}>
                {formatMoney(account.balance)}
              </div>
              <span className="account-type-label">{account.accountType || "N/A"}</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="overview-charts">
        <div className="chart-panel">
          <h3>Balances by Account</h3>
          {accounts.length === 0 ? ( // shows when there are no accounts
            <div className="chart-empty">No accounts to display.</div>
          ) : (
            <div className="chart-wrap"><canvas ref={balanceDoughnutRef} /></div>
          )}
        </div>

        <div className="chart-panel">
          <h3>Transaction Totals by Type</h3>
          {transactions.length === 0 ? ( // shows when there are no transactions
            <div className="chart-empty">No transactions to display.</div>
          ) : (
            <div className="chart-wrap"><canvas ref={transactionBarRef} /></div>
          )}
        </div>

        <div className="chart-panel">
          <h3>Balance by Account Type</h3>
          {accounts.length === 0 ? ( // shows when there are no accounts
            <div className="chart-empty">No accounts to display.</div>
          ) : (
            <div className="chart-wrap"><canvas ref={accountTypeBarRef} /></div>
          )}
        </div>

        <div className="chart-panel">
          <h3>Spending Over Time</h3>
          {transactions.filter((transaction) => transaction.type === "expense").length === 0 ? (
            <div className="chart-empty">No expense data yet.</div>
          ) : (
            <div className="chart-wrap"><canvas ref={spendingLineRef} /></div>
          )}
        </div>
      </div>

      {/* Budget progress */}
      <div className="overview-budgets">
        <h3>Budget Progress</h3>
        {budgets.length === 0 ? (
          <p className="overview-empty">No budgets created yet.</p>
        ) : (
          budgets.map((budget) => { // maps budgets to their progress
            const taggedSpent = transactions // filters transactions to only include expenses with the same budget id
              .filter((transaction) => transaction.type === "expense" && transaction.budgetId === budget._id)
              .reduce((sum, transaction) => sum + Number(transaction.amount), 0); // reduces transactions to their total spent
            const storedSpent = Number(budget.spent || 0);
            const spent = Math.max(taggedSpent, storedSpent);
            const limit = Number(budget.totalLimit);
            const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0; // calculates the percentage of the budget spent
            let barColor = "oklch(75% 0.15 145)";
            if (percentage > 75) barColor = "oklch(82% 0.14 85)";
            if (percentage > 90) barColor = "oklch(62% 0.19 25)";

            return (
              <div className="budget-row" key={budget._id}>
                <div className="budget-header">
                  <span className="budget-name">{budget.name} ({budget.period})</span>
                  <span className="budget-amounts">
                    {formatMoney(spent)} / {formatMoney(limit)}
                  </span>
                </div>
                <div className="budget-track">
                  <div
                    className="budget-fill"
                    style={{ width: `${percentage}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recent transactions */}
      <div className="overview-recent">
        <h3>Recent Transactions</h3>
        {recentTransactions.length === 0 ? ( // shows when there are no recent transactions
          <p className="overview-empty">No transactions yet.</p>
        ) : (
          <table className="recent-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Account</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
                {recentTransactions.map((transaction) => ( // maps recent transactions to the table
                <tr key={transaction._id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>
                    <span className={`type-badge ${transaction.type}`}>{transaction.type}</span>
                  </td>
                  <td>{transaction.description || "—"}</td>
                  <td>{accountMap[transaction.accountId] || "—"}</td>
                  <td>{formatMoney(transaction.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
