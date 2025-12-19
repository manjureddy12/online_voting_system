const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const User = require("../models/User");
const { ErrorResponse } = require("../middleware/errorHandler");

/**
 * Admin Controller
 * Handles admin operations for election management
 */

/**
 * @desc    Add a new candidate
 * @route   POST /api/admin/candidates
 * @access  Private/Admin
 */
const addCandidate = async (req, res, next) => {
  try {
    const { name, position, department, year, manifesto, photoUrl } = req.body;

    const candidate = await Candidate.create({
      name,
      position,
      department,
      year,
      manifesto,
      photoUrl,
    });

    res.status(201).json({
      success: true,
      message: "Candidate added successfully",
      data: {
        candidate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all candidates (including inactive)
 * @route   GET /api/admin/candidates
 * @access  Private/Admin
 */
const getAllCandidates = async (req, res, next) => {
  try {
    const candidates = await Candidate.find().sort({
      position: 1,
      voteCount: -1,
    });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: {
        candidates,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update candidate
 * @route   PUT /api/admin/candidates/:id
 * @access  Private/Admin
 */
const updateCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating vote count directly
    delete updates.voteCount;

    const candidate = await Candidate.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!candidate) {
      return next(new ErrorResponse("Candidate not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Candidate updated successfully",
      data: {
        candidate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete candidate (soft delete - set inactive)
 * @route   DELETE /api/admin/candidates/:id
 * @access  Private/Admin
 */
const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!candidate) {
      return next(new ErrorResponse("Candidate not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Candidate deactivated successfully",
      data: {
        candidate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get election statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStatistics = async (req, res, next) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalVotes = await Vote.getTotalVotes();
    const totalCandidates = await Candidate.countDocuments({ isActive: true });
    const usersVoted = await User.countDocuments({ hasVoted: true });

    // Get vote statistics
    const voteStats = await Vote.getStatistics();

    // Get candidates with vote counts
    const candidatesByPosition = await Candidate.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$position",
          candidates: { $push: { name: "$name", voteCount: "$voteCount" } },
          totalVotes: { $sum: "$voteCount" },
        },
      },
    ]);

    // Get department-wise voting statistics
    const departmentStats = await User.aggregate([
      {
        $group: {
          _id: "$department",
          totalStudents: { $sum: 1 },
          votedStudents: {
            $sum: { $cond: ["$hasVoted", 1, 0] },
          },
        },
      },
      {
        $project: {
          department: "$_id",
          totalStudents: 1,
          votedStudents: 1,
          votingPercentage: {
            $multiply: [{ $divide: ["$votedStudents", "$totalStudents"] }, 100],
          },
        },
      },
    ]);

    // Get year-wise voting statistics
    const yearStats = await User.aggregate([
      {
        $group: {
          _id: "$year",
          totalStudents: { $sum: 1 },
          votedStudents: {
            $sum: { $cond: ["$hasVoted", 1, 0] },
          },
        },
      },
      {
        $project: {
          year: "$_id",
          totalStudents: 1,
          votedStudents: 1,
          votingPercentage: {
            $multiply: [{ $divide: ["$votedStudents", "$totalStudents"] }, 100],
          },
        },
      },
      { $sort: { year: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVotes,
          totalCandidates,
          usersVoted,
          votingPercentage:
            totalUsers > 0 ? ((totalVotes / totalUsers) * 100).toFixed(2) : 0,
        },
        voteStatistics: voteStats,
        candidatesByPosition,
        departmentStats,
        yearStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset election (DANGER - use with caution)
 * @route   POST /api/admin/reset
 * @access  Private/Admin
 */
const resetElection = async (req, res, next) => {
  try {
    // Reset all vote counts
    await Candidate.updateMany({}, { voteCount: 0 });

    // Delete all votes
    await Vote.deleteMany({});

    // Reset all users' voting status
    await User.updateMany({}, { hasVoted: false, votedAt: null });

    res.status(200).json({
      success: true,
      message: "Election reset successfully. All votes cleared.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addCandidate,
  getAllCandidates,
  updateCandidate,
  deleteCandidate,
  getStatistics,
  getAllUsers,
  resetElection,
};
