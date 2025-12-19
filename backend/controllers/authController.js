const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ErrorResponse } = require("../middleware/errorHandler");

/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "24h",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { studentId, name, email, password, department, year } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ studentId }, { email }],
    });

    if (userExists) {
      return next(
        new ErrorResponse(
          "User already exists with this student ID or email",
          400
        )
      );
    }

    // Create user
    const user = await User.create({
      studentId,
      name,
      email,
      password,
      department,
      year,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          studentId: user.studentId,
          name: user.name,
          email: user.email,
          department: user.department,
          year: user.year,
          hasVoted: user.hasVoted,
          isAdmin: user.isAdmin,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { studentId, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ studentId }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          studentId: user.studentId,
          name: user.name,
          email: user.email,
          department: user.department,
          year: user.year,
          hasVoted: user.hasVoted,
          isAdmin: user.isAdmin,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          studentId: user.studentId,
          name: user.name,
          email: user.email,
          department: user.department,
          year: user.year,
          hasVoted: user.hasVoted,
          isAdmin: user.isAdmin,
          votedAt: user.votedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear token
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    // Token is managed on client side, just send success response
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
