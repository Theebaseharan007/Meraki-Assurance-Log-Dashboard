import express from 'express';
import {
  getRuns,
  getTeams,
  getDashboardSummary,
  getStats
} from '../controllers/managerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateDateQuery } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication and manager role
router.use(authenticate, authorize('manager'));

// @route   GET /api/manager/runs
// @desc    Get runs for a specific date (and optional team)
// @access  Private (Manager only)
router.get('/runs', validateDateQuery, getRuns);

// @route   GET /api/manager/teams
// @desc    Get teams under the current manager
// @access  Private (Manager only)
router.get('/teams', getTeams);

// @route   GET /api/manager/dashboard
// @desc    Get dashboard summary for manager
// @access  Private (Manager only)
router.get('/dashboard', getDashboardSummary);

// @route   GET /api/manager/stats
// @desc    Get submission statistics for manager
// @access  Private (Manager only)
router.get('/stats', getStats);

export default router;
