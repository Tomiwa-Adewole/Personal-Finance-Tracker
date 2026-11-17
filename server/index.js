const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";
const clientOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction) {
  if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL must be set in production.");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be set in production.");
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production.");
  }

  // Trust the hosting platform's TLS proxy so req.secure reflects HTTPS.
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    if (req.secure) return next();
    return res.status(426).json({ message: "HTTPS is required." });
  });
}

// Middleware
app.use(express.json());
app.use(cors({ origin: clientOrigins }));

// --- ROUTES ---
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const budgetRoutes = require("./routes/budgets");

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);

// Basic Test Route
app.get("/", (req, res) => {
  res.send("Personal Finance Tracker API is running!");
});

// --- ERROR HANDLER (Must be registered AFTER all routes) ---
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// --- DATABASE CONNECTION & SERVER START ---
if (!process.env.MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI environment variable is not defined.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas successfully!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
