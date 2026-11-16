const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { validateTransaction } = require("../middleware/validateMiddleware");
const {
  getTransactions,
  getSummary,
  getCategoryBreakdown,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

router.get("/", verifyToken, getTransactions);
router.get("/summary", verifyToken, getSummary);
router.get("/breakdown", verifyToken, getCategoryBreakdown);
router.post("/", verifyToken, validateTransaction, createTransaction);
router.put("/:id", verifyToken, validateTransaction, updateTransaction);
router.delete("/:id", verifyToken, deleteTransaction);

module.exports = router;