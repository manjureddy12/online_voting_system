const mongoose = require("mongoose");

/**
 * Candidate Schema
 * Represents a candidate in the election
 */
const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      enum: {
        values: ["President", "Vice President", "Secretary", "Treasurer"],
        message: "{VALUE} is not a valid position",
      },
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1, "Year must be between 1 and 4"],
      max: [4, "Year must be between 1 and 4"],
    },
    manifesto: {
      type: String,
      required: [true, "Manifesto is required"],
      maxlength: [500, "Manifesto cannot exceed 500 characters"],
    },
    photoUrl: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    voteCount: {
      type: Number,
      default: 0,
      min: [0, "Vote count cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index for efficient queries
 */
candidateSchema.index({ position: 1, isActive: 1 });
candidateSchema.index({ voteCount: -1 });

/**
 * Method to increment vote count
 */
candidateSchema.methods.incrementVote = async function () {
  this.voteCount += 1;
  await this.save();
};

/**
 * Static method to get candidates by position
 * @param {string} position - The position to filter by
 * @returns {Promise<Array>} Array of candidates
 */
candidateSchema.statics.getByPosition = function (position) {
  return this.find({ position, isActive: true }).sort({ name: 1 });
};

/**
 * Static method to get election results
 * @returns {Promise<Array>} Candidates sorted by vote count
 */
candidateSchema.statics.getResults = function () {
  return this.find({ isActive: true })
    .sort({ position: 1, voteCount: -1 })
    .select("name position department year voteCount manifesto photoUrl");
};

module.exports = mongoose.model("Candidate", candidateSchema);
