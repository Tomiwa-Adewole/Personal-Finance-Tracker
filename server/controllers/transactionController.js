const Transaction = require("../models/Transaction");

// ==========================================
// 1. GET ALL TRANSACTIONS (WITH FILTERS)
// ==========================================
const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    let query = { userId: req.userId };

    if (type) query.type = type;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setUTCHours(23, 59, 59, 999);
        query.date.$lte = endDateTime;
      }
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 2. GET FINANCIAL SUMMARY
// ==========================================
const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === "income") totalIncome += tx.amount;
      else if (tx.type === "expense") totalExpense += tx.amount;
    });

    const netBalance = totalIncome - totalExpense;

    res.status(200).json({
      totalIncome,
      totalExpense,
      netBalance,
      transactionCount: transactions.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 3. GET CATEGORY BREAKDOWN
// ==========================================
const getCategoryBreakdown = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    const breakdown = {};

    transactions.forEach((tx) => {
      if (!breakdown[tx.category]) {
        breakdown[tx.category] = { income: 0, expense: 0, totalAmount: 0 };
      }

      if (tx.type === "income") breakdown[tx.category].income += tx.amount;
      else if (tx.type === "expense")
        breakdown[tx.category].expense += tx.amount;
      breakdown[tx.category].totalAmount += tx.amount;
    });

    res.status(200).json(breakdown);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 4. CREATE TRANSACTION
// ==========================================
const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;

    const newTransaction = new Transaction({
      userId: req.userId,
      title,
      amount,
      type,
      category,
      ...(date ? { date } : {}),
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json({
      message: "Transaction created successfully",
      transaction: savedTransaction,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 5. UPDATE TRANSACTION
// ==========================================
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const allowedFields = ["title", "amount", "type", "category", "date"];
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]]),
    );

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid transaction fields provided" });
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 6. DELETE TRANSACTION
// ==========================================
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTransactions,
  getSummary,
  getCategoryBreakdown,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
