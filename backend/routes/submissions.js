import express from 'express';
import {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission
} from '../controllers/submissionController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  validateSubmission,
  validateObjectId,
  validatePaginationQuery
} from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/submissions
// @desc    Create a new submission
// @access  Private (Team Lead only)
router.post('/', 
  authorize('teamLead'), 
  validateSubmission, 
  createSubmission
);

// @route   GET /api/submissions/mine
// @desc    Get submissions for current team lead
// @access  Private (Team Lead only)
router.get('/mine', 
  authorize('teamLead'), 
  validatePaginationQuery, 
  getMySubmissions
);

// @route   GET /api/submissions/:id
// @desc    Get a single submission by ID
// @access  Private (Team Lead - own submissions, Manager - team submissions)
router.get('/:id', 
  authorize('teamLead', 'manager'), 
  validateObjectId, 
  getSubmissionById
);

// @route   PUT /api/submissions/:id
// @desc    Update a submission
// @access  Private (Team Lead - own submissions only)
router.put('/:id', 
  authorize('teamLead'), 
  validateObjectId, 
  validateSubmission, 
  updateSubmission
);

// @route   DELETE /api/submissions/:id
// @desc    Delete a submission
// @access  Private (Team Lead - own submissions only)
router.delete('/:id', 
  authorize('teamLead'), 
  validateObjectId, 
  deleteSubmission
);

export default router;
