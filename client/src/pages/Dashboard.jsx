import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Paper } from "@mui/material";

import Accounts from "../components/Dashboard/Accounts";
import Transactions from "../components/Dashboard/Transactions";
import Budgets from "../components/Dashboard/Budgets";  
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <Box sx={{ p: 2 }}>
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="dashboard tabs"
        >
          <Tab label="Accounts" />
          <Tab label="Transactions" />
          <Tab label="Budgets" />
        </Tabs>
      </Paper>
      <Box sx={{ mt: 1 }}>
        {activeTab === 1 && <Accounts />}
        {activeTab === 2 && <Transactions />}
        {activeTab === 3 && <Budgets />}
      </Box>
    </Box>
    </div>
  );
}
