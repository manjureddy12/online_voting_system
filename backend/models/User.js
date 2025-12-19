const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema
 * Represents a user in the voting system
 */
const userSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9]{6,12}$/, "Please provide a valid student ID"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
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
    hasVoted: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    votedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving
 * Uses bcrypt with 10 salt rounds for security
 */
userSchema.pre("save", async function (next) {
  // Only hash password if it has been modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare entered password with hashed password
 * @param {string} enteredPassword - The password to verify
 * @returns {Promise<boolean>} True if password matches
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method to mark user as voted
 */
userSchema.methods.markAsVoted = async function () {
  this.hasVoted = true;
  this.votedAt = new Date();
  await this.save();
};

module.exports = mongoose.model("User", userSchema);
