const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// ==========================================
// 1. SET OR UPDATE A BUDGET
// ==========================================
const setBudget = async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    if (!category || limit === undefined || !month) {
      return res
        .status(400)
        .json({ message: "Please provide category, limit, and month" });
    }

    // Check if a budget already exists for this user, category, and month
    let budget = await Budget.findOne({ userId: req.userId, category, month });

    if (budget) {
      // Update existing budget
      budget.limit = limit;
      await budget.save();
      return res.status(200).json({
        message: "Budget updated successfully",
        budget,
      });
    }

    // Create a new budget
    budget = new Budget({
      userId: req.userId,
      category,
      limit,
      month,
    });

    const savedBudget = await budget.save();
    res.status(201).json({
      message: "Budget created successfully",
      budget: savedBudget,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update the limit for an existing budget owned by the authenticated user
const updateBudget = async (req, res) => {
  try {
    const { limit } = req.body;

    if (limit === undefined) {
      return res.status(400).json({ message: "Please provide a budget limit" });
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { limit } },
      { new: true, runValidators: true },
    );

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.status(200).json({ message: "Budget updated successfully", budget });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 2. GET BUDGETS WITH ACTUAL SPENDING PROGRESS
// ==========================================
const getBudgetsProgress = async (req, res) => {
  try {
    const { month } = req.query; // Optional filter: ?month=2026-11
    let query = { userId: req.userId };
    if (month) query.month = month;

    const budgets = await Budget.find(query);

    // Calculate actual spending for each budget's category and month
    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        // Parse month ("YYYY-MM") into start and end dates
        const [year, m] = budget.month.split("-");
        const startDate = new Date(`${year}-${m}-01T00:00:00.000Z`);
        const endDate = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999));

        // Find all expense transactions for this user, category, and month range
        const transactions = await Transaction.find({
          userId: req.userId,
          category: budget.category,
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
        });

        // Sum up total spent
        const totalSpent = transactions.reduce((acc, tx) => acc + tx.amount, 0);
        const remaining = budget.limit - totalSpent;
        const percentageUsed =
          budget.limit > 0 ? Math.round((totalSpent / budget.limit) * 100) : 0;

        return {
          id: budget._id,
          category: budget.category,
          month: budget.month,
          limit: budget.limit,
          totalSpent,
          remaining,
          percentageUsed,
          isOverBudget: totalSpent > budget.limit,
        };
      }),
    );

    res.status(200).json(budgetsWithProgress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  setBudget,
  updateBudget,
  deleteBudget,
  getBudgetsProgress,
};
