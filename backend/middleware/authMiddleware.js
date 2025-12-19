const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

/**
 * Admin Authorization Middleware
 * Ensures user has admin privileges
 */
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized as admin",
    });
  }
};

/**
 * Vote Lock Middleware
 * Prevents users who have already voted from voting again
 */
const voteLock = async (req, res, next) => {
  try {
    if (req.user.hasVoted) {
      return res.status(403).json({
        success: false,
        message: "You have already voted. Each user can only vote once.",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking vote status",
    });
  }
};

module.exports = { protect, admin, voteLock };
