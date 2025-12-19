const mongoose = require("mongoose");

/**
 * Vote Schema
 * Tracks voting records for audit and integrity
 * Note: Does not store which candidate a user voted for (secret ballot)
 * but maintains a record that a vote was cast
 */
const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures one vote per user
    },
    candidates: [
      {
        position: {
          type: String,
          required: true,
          enum: ["President", "Vice President", "Secretary", "Treasurer"],
        },
        candidate: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Candidate",
          required: true,
        },
      },
    ],
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      immutable: true, // Cannot be changed after creation
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index for efficient queries
 */
voteSchema.index({ user: 1 }, { unique: true });
voteSchema.index({ timestamp: -1 });

/**
 * Static method to check if user has voted
 * @param {ObjectId} userId - The user's ID
 * @returns {Promise<boolean>} True if user has voted
 */
voteSchema.statics.hasUserVoted = async function (userId) {
  const vote = await this.findOne({ user: userId });
  return !!vote;
};

/**
 * Static method to get total vote count
 * @returns {Promise<number>} Total number of votes cast
 */
voteSchema.statics.getTotalVotes = async function () {
  return await this.countDocuments();
};

/**
 * Static method to get voting statistics
 * @returns {Promise<Object>} Voting statistics
 */
voteSchema.statics.getStatistics = async function () {
  const totalVotes = await this.countDocuments();
  const votesPerHour = await this.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d %H:00",
            date: "$timestamp",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 24 },
  ]);

  return {
    totalVotes,
    votesPerHour,
  };
};

module.exports = mongoose.model("Vote", voteSchema);
