// Validate Transaction creation/update input
const validateTransaction = (req, res, next) => {
  const { title, amount, type, category, date } = req.body;

  // Only validate fields if they are present (useful for PUT requests)
  if (title !== undefined && typeof title !== "string") {
    return res.status(400).json({ message: "Title must be a string" });
  }

  if (amount !== undefined && (typeof amount !== "number" || amount < 0)) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number" });
  }

  if (type !== undefined && !["income", "expense"].includes(type)) {
    return res
      .status(400)
      .json({ message: "Type must be either 'income' or 'expense'" });
  }

  if (category !== undefined && typeof category !== "string") {
    return res.status(400).json({ message: "Category must be a string" });
  }

  if (date !== undefined && Number.isNaN(new Date(date).getTime())) {
    return res.status(400).json({ message: "Date must be a valid date" });
  }

  next();
};

// Validate Budget input
const validateBudget = (req, res, next) => {
  const { category, limit, month } = req.body;

  if (category !== undefined && typeof category !== "string") {
    return res.status(400).json({ message: "Category must be a string" });
  }

  if (limit !== undefined && (typeof limit !== "number" || limit < 0)) {
    return res.status(400).json({ message: "Limit must be a positive number" });
  }

  if (month !== undefined && !/^\d{4}-\d{2}$/.test(month)) {
    return res
      .status(400)
      .json({ message: "Month must be in 'YYYY-MM' format" });
  }

  next();
};

module.exports = {
  validateTransaction,
  validateBudget,
};
