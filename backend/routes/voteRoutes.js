const express = require("express");
const router = express.Router();
const {
  getCandidates,
  castVote,
  getVoteStatus,
  getResults,
} = require("../controllers/voteController");
const { protect, voteLock } = require("../middleware/authMiddleware");
const { voteValidation, validate } = require("../utils/validators");

/**
 * Voting Routes
 */

// @route   GET /api/votes/candidates
router.get("/candidates", protect, getCandidates);

// @route   POST /api/votes/cast
router.post("/cast", protect, voteLock, voteValidation, validate, castVote);

// @route   GET /api/votes/status
router.get("/status", protect, getVoteStatus);

// @route   GET /api/votes/results
router.get("/results", protect, getResults);

module.exports = router;
