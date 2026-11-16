const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { validateBudget } = require("../middleware/validateMiddleware");
const {
  setBudget,
  updateBudget,
  deleteBudget,
  getBudgetsProgress,
} = require("../controllers/budgetController");

router.post("/", verifyToken, validateBudget, setBudget);
router.put("/:id", verifyToken, validateBudget, updateBudget);
router.delete("/:id", verifyToken, deleteBudget);
router.get("/", verifyToken, getBudgetsProgress);

module.exports = router;
