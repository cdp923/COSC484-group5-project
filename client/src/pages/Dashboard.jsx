import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Accounts from "../components/Dashboard/Accounts";
import Transactions from "../components/Dashboard/Transactions";
import Budgets from "../components/Dashboard/Budgets";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>
      <Accounts />
      <Transactions />
      <Budgets />
    </div>
  );
}
