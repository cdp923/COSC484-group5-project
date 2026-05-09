require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, { dbName: "finance-tracker" })
  .then(() => {
    console.log("Successfully connected to MongoDB via Mongoose!");
  })
  .catch((err) => {
    console.error(err);
  });

const userRouter = require("./Routes/users");
app.use("/api/users", userRouter);

const accountRouter = require("./Routes/accounts");
app.use("/api/accounts", accountRouter);

const transactionRouter = require("./Routes/transactions");
app.use("/api/transactions", transactionRouter);

const recurringTransactionRouter = require("./Routes/recurringTransactions");
app.use("/api/recurringTransactions", recurringTransactionRouter);

const budgetRouter = require("./Routes/budgets");
app.use("/api/budgets", budgetRouter);

const authRouter = require("./Routes/auth");
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Finance Tracker API is running");
});

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
