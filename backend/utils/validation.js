import { body, param, query, validationResult } from 'express-validator';

// Utility function to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

// User validation rules
export const validateSignup = [
  body('role')
    .isIn(['manager', 'teamLead'])
    .withMessage('Role must be either "manager" or "teamLead"'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('team')
    .if(body('role').equals('teamLead'))
    .notEmpty()
    .withMessage('Team name is required for team leads')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  
  body('managerEmail')
    .if(body('role').equals('teamLead'))
    .notEmpty()
    .withMessage('Manager email is required for team leads')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid manager email address'),
  
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('role')
    .isIn(['manager', 'teamLead'])
    .withMessage('Role must be either "manager" or "teamLead"'),
  
  handleValidationErrors
];

// Submission validation rules
export const validateSubmission = [
  body('team')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  
  body('testName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Test name must be between 2 and 200 characters'),
  
  body('sections')
    .isArray({ min: 1 })
    .withMessage('At least one section is required'),
  
  body('sections.*.name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Section name must be between 1 and 200 characters'),
  
  body('sections.*.result')
    .isIn(['passed', 'failed', 'skipped', 'errored'])
    .withMessage('Section result must be one of: passed, failed, skipped, errored'),
  
  body('sections.*.subsections')
    .optional()
    .isArray()
    .withMessage('Subsections must be an array'),
  
  body('sections.*.subsections.*.name')
    .if(body('sections.*.subsections').exists())
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subsection name must be between 1 and 200 characters'),
  
  body('sections.*.subsections.*.result')
    .if(body('sections.*.subsections').exists())
    .isIn(['passed', 'failed', 'skipped', 'errored'])
    .withMessage('Subsection result must be one of: passed, failed, skipped, errored'),
  
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO 8601 date'),
  
  handleValidationErrors
];

// Parameter validation rules
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Query validation rules
export const validateDateQuery = [
  query('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  
  query('team')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Team name must be between 1 and 100 characters'),
  
  handleValidationErrors
];

export const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search term must be between 1 and 200 characters'),
  
  handleValidationErrors
];

export default {
  handleValidationErrors,
  validateSignup,
  validateLogin,
  validateSubmission,
  validateObjectId,
  validateDateQuery,
  validatePaginationQuery
};
