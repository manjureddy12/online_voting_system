const express = require("express");
const router = express.Router();
const {
  addCandidate,
  getAllCandidates,
  updateCandidate,
  deleteCandidate,
  getStatistics,
  getAllUsers,
  resetElection,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  candidateValidation,
  idValidation,
  validate,
} = require("../utils/validators");

/**
 * Admin Routes
 * All routes require authentication and admin privileges
 */

// Apply protect and admin middleware to all routes
router.use(protect, admin);

// @route   POST /api/admin/candidates
router.post("/candidates", candidateValidation, validate, addCandidate);

// @route   GET /api/admin/candidates
router.get("/candidates", getAllCandidates);

// @route   PUT /api/admin/candidates/:id
router.put("/candidates/:id", idValidation, validate, updateCandidate);

// @route   DELETE /api/admin/candidates/:id
router.delete("/candidates/:id", idValidation, validate, deleteCandidate);

// @route   GET /api/admin/stats
router.get("/stats", getStatistics);

// @route   GET /api/admin/users
router.get("/users", getAllUsers);

// @route   POST /api/admin/reset
router.post("/reset", resetElection);

module.exports = router;
