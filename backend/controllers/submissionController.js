import Submission from '../models/Submission.js';
import User from '../models/User.js';

// @desc    Create a new submission
// @route   POST /api/submissions
// @access  Private (Team Lead only)
export const createSubmission = async (req, res) => {
  try {
    const { team, testName, sections, timestamp } = req.body;
    const leadId = req.user._id;

    // Get the team lead's manager
    const teamLead = await User.findById(leadId).populate('managerId');
    if (!teamLead || !teamLead.managerId) {
      return res.status(400).json({
        success: false,
        message: 'Team lead must have an associated manager'
      });
    }

    // Create submission data
    const submissionData = {
      team: team || teamLead.team, // Use provided team or default to user's team
      leadId,
      managerId: teamLead.managerId._id,
      testName,
      sections
    };

    // Set custom timestamp if provided
    if (timestamp) {
      submissionData.timestamp = new Date(timestamp);
    }

    // Create submission
    const submission = await Submission.create(submissionData);

    // Populate lead info for response
    await submission.populate('leadId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: {
        submission: submission.toJSON()
      }
    });

  } catch (error) {
    console.error('Create submission error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating submission'
    });
  }
};

// @desc    Get submissions for current team lead
// @route   GET /api/submissions/mine
// @access  Private (Team Lead only)
export const getMySubmissions = async (req, res) => {
  try {
    const leadId = req.user._id;
    const { page = 1, limit = 10, search } = req.query;

    // Build query
    const query = { leadId };
    
    if (search) {
      query.testName = { $regex: search, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get submissions with pagination
    const [submissions, totalCount] = await Promise.all([
      Submission.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('leadId', 'name email'),
      Submission.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        submissions: submissions.map(sub => sub.toJSON()),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
};

// @desc    Get a single submission by ID
// @route   GET /api/submissions/:id
// @access  Private (Team Lead - own submissions only, Manager - team submissions)
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Build query based on user role
    let query = { _id: id };
    
    if (user.role === 'teamLead') {
      // Team leads can only access their own submissions
      query.leadId = user._id;
    } else if (user.role === 'manager') {
      // Managers can access submissions from their team leads
      query.managerId = user._id;
    }

    const submission = await Submission.findOne(query)
      .populate('leadId', 'name email team');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or access denied'
      });
    }

    res.json({
      success: true,
      data: {
        submission: submission.toJSON()
      }
    });

  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submission'
    });
  }
};

// @desc    Update a submission
// @route   PUT /api/submissions/:id
// @access  Private (Team Lead - own submissions only)
export const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { team, testName, sections, timestamp } = req.body;
    const leadId = req.user._id;

    // Find submission (ensure ownership)
    const submission = await Submission.findOne({ 
      _id: id, 
      leadId 
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or access denied'
      });
    }

    // Update fields
    const updates = {};
    if (team !== undefined) updates.team = team;
    if (testName !== undefined) updates.testName = testName;
    if (sections !== undefined) updates.sections = sections;
    if (timestamp !== undefined) updates.timestamp = new Date(timestamp);

    // Update submission
    const updatedSubmission = await Submission.findByIdAndUpdate(
      id,
      updates,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('leadId', 'name email');

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: {
        submission: updatedSubmission.toJSON()
      }
    });

  } catch (error) {
    console.error('Update submission error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating submission'
    });
  }
};

// @desc    Delete a submission
// @route   DELETE /api/submissions/:id
// @access  Private (Team Lead - own submissions only)
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const leadId = req.user._id;

    // Find and delete submission (ensure ownership)
    const submission = await Submission.findOneAndDelete({ 
      _id: id, 
      leadId 
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });

  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting submission'
    });
  }
};

export default {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission
};
