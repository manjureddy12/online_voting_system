const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const User = require("../models/User");
const { ErrorResponse } = require("../middleware/errorHandler");

/**
 * Vote Controller
 * Handles voting operations
 */

/**
 * @desc    Get all active candidates
 * @route   GET /api/votes/candidates
 * @access  Private
 */
const getCandidates = async (req, res, next) => {
  try {
    const candidates = await Candidate.find({ isActive: true })
      .sort({ position: 1, name: 1 })
      .select("name position department year manifesto photoUrl");

    // Group candidates by position
    const groupedCandidates = candidates.reduce((acc, candidate) => {
      const position = candidate.position;
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(candidate);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: {
        candidates: groupedCandidates,
        allCandidates: candidates,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cast a vote
 * @route   POST /api/votes/cast
 * @access  Private (requires voteLock middleware)
 */
const castVote = async (req, res, next) => {
  try {
    const { votes } = req.body; // Array of { position, candidateId }
    const userId = req.user.id;

    // Validate that user hasn't voted (double-check)
    if (req.user.hasVoted) {
      return next(new ErrorResponse("You have already voted", 403));
    }

    // Check if vote record already exists
    const existingVote = await Vote.findOne({ user: userId });
    if (existingVote) {
      return next(new ErrorResponse("Vote record already exists", 403));
    }

    // Validate all candidates exist and are active
    const candidateIds = votes.map((v) => v.candidateId);
    const candidates = await Candidate.find({
      _id: { $in: candidateIds },
      isActive: true,
    });

    if (candidates.length !== candidateIds.length) {
      return next(
        new ErrorResponse("One or more candidates are invalid or inactive", 400)
      );
    }

    // Ensure one vote per position
    const positions = votes.map((v) => v.position);
    const uniquePositions = [...new Set(positions)];
    if (positions.length !== uniquePositions.length) {
      return next(
        new ErrorResponse(
          "Cannot vote for multiple candidates for the same position",
          400
        )
      );
    }

    // Validate position-candidate matching
    for (const vote of votes) {
      const candidate = candidates.find(
        (c) => c._id.toString() === vote.candidateId
      );
      if (candidate.position !== vote.position) {
        return next(new ErrorResponse("Candidate position mismatch", 400));
      }
    }

    // Create vote record
    const voteRecord = await Vote.create({
      user: userId,
      candidates: votes.map((v) => ({
        position: v.position,
        candidate: v.candidateId,
      })),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Increment vote counts for all candidates
    await Promise.all(
      candidateIds.map((candidateId) =>
        Candidate.findByIdAndUpdate(
          candidateId,
          { $inc: { voteCount: 1 } },
          { new: true }
        )
      )
    );

    // Mark user as voted
    await req.user.markAsVoted();

    res.status(201).json({
      success: true,
      message: "Vote cast successfully",
      data: {
        voteId: voteRecord._id,
        timestamp: voteRecord.timestamp,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if user has voted
 * @route   GET /api/votes/status
 * @access  Private
 */
const getVoteStatus = async (req, res, next) => {
  try {
    const hasVoted = req.user.hasVoted;
    const votedAt = req.user.votedAt;

    res.status(200).json({
      success: true,
      data: {
        hasVoted,
        votedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get election results
 * @route   GET /api/votes/results
 * @access  Private
 */
const getResults = async (req, res, next) => {
  try {
    const results = await Candidate.getResults();
    const totalVotes = await Vote.getTotalVotes();
    const totalUsers = await User.countDocuments();

    // Group results by position
    const groupedResults = results.reduce((acc, candidate) => {
      const position = candidate.position;
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(candidate);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        results: groupedResults,
        allResults: results,
        statistics: {
          totalVotes,
          totalUsers,
          votingPercentage:
            totalUsers > 0 ? ((totalVotes / totalUsers) * 100).toFixed(2) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidates,
  castVote,
  getVoteStatus,
  getResults,
};
