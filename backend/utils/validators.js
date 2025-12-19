const { body, param, validationResult } = require("express-validator");

/**
 * Validation Utilities
 * Reusable validation rules for input sanitization
 */

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Registration validation rules
 */
const registerValidation = [
  body("studentId")
    .trim()
    .notEmpty()
    .withMessage("Student ID is required")
    .matches(/^[A-Z0-9]{6,12}$/i)
    .withMessage("Student ID must be 6-12 alphanumeric characters"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("department").trim().notEmpty().withMessage("Department is required"),

  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .isInt({ min: 1, max: 4 })
    .withMessage("Year must be between 1 and 4"),
];

/**
 * Login validation rules
 */
const loginValidation = [
  body("studentId").trim().notEmpty().withMessage("Student ID is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Candidate creation validation rules
 */
const candidateValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Candidate name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("position")
    .notEmpty()
    .withMessage("Position is required")
    .isIn(["President", "Vice President", "Secretary", "Treasurer"])
    .withMessage("Invalid position"),

  body("department").trim().notEmpty().withMessage("Department is required"),

  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .isInt({ min: 1, max: 4 })
    .withMessage("Year must be between 1 and 4"),

  body("manifesto")
    .trim()
    .notEmpty()
    .withMessage("Manifesto is required")
    .isLength({ max: 500 })
    .withMessage("Manifesto cannot exceed 500 characters"),
];

/**
 * Vote validation rules
 */
const voteValidation = [
  body("votes")
    .isArray({ min: 1 })
    .withMessage("At least one vote is required"),

  body("votes.*.position")
    .notEmpty()
    .withMessage("Position is required")
    .isIn(["President", "Vice President", "Secretary", "Treasurer"])
    .withMessage("Invalid position"),

  body("votes.*.candidateId")
    .notEmpty()
    .withMessage("Candidate ID is required")
    .isMongoId()
    .withMessage("Invalid candidate ID"),
];

/**
 * MongoDB ID validation
 */
const idValidation = [param("id").isMongoId().withMessage("Invalid ID format")];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  candidateValidation,
  voteValidation,
  idValidation,
};
