import Submission from '../models/Submission.js';
import User from '../models/User.js';

// @desc    Get runs for a specific date (and optional team)
// @route   GET /api/manager/runs
// @access  Private (Manager only)
export const getRuns = async (req, res) => {
  try {
    const { date, team } = req.query;
    const managerId = req.user._id;

    // Validate date format
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Date is required and must be in YYYY-MM-DD format'
      });
    }

    // Get runs for the specified date
    const runs = await Submission.getRunsForDate(managerId, date, team);

    // Calculate status counts and test names by status for each run
    const runsWithChartData = runs.map(run => {
      const statusCounts = Submission.getStatusCounts([run]);
      const testNamesByStatus = Submission.getTestNamesByStatus([run]);
      
      return {
        ...run.toJSON(),
        chartData: {
          statusCounts,
          testNamesByStatus
        }
      };
    });

    // Also provide aggregate data for all runs
    const aggregateStatusCounts = Submission.getStatusCounts(runs);
    const aggregateTestNamesByStatus = Submission.getTestNamesByStatus(runs);

    res.json({
      success: true,
      data: {
        date,
        team: team || 'all',
        runs: runsWithChartData,
        totalRuns: runs.length,
        aggregateData: {
          statusCounts: aggregateStatusCounts,
          testNamesByStatus: aggregateTestNamesByStatus
        }
      }
    });

  } catch (error) {
    console.error('Get runs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching runs'
    });
  }
};

// @desc    Get teams under the current manager
// @route   GET /api/manager/teams
// @access  Private (Manager only)
export const getTeams = async (req, res) => {
  try {
    const managerId = req.user._id;

    // Get all teams under this manager
    const teams = await User.getTeamsForManager(managerId);
    
    // Get team leads for additional info
    const teamLeads = await User.find({
      managerId: managerId,
      role: 'teamLead'
    }).select('name email team');

    // Group team leads by team
    const teamsWithLeads = teams.map(teamName => {
      const leads = teamLeads.filter(lead => lead.team === teamName);
      return {
        name: teamName,
        leads: leads.map(lead => ({
          id: lead._id,
          name: lead.name,
          email: lead.email
        }))
      };
    });

    res.json({
      success: true,
      data: {
        teams: teamsWithLeads,
        totalTeams: teams.length,
        totalTeamLeads: teamLeads.length
      }
    });

  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teams'
    });
  }
};

// @desc    Get dashboard summary for manager
// @route   GET /api/manager/dashboard
// @access  Private (Manager only)
export const getDashboardSummary = async (req, res) => {
  try {
    const managerId = req.user._id;
    const { days = 7 } = req.query; // Default to last 7 days

    // Calculate date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    // Get submissions in date range
    const submissions = await Submission.find({
      managerId: managerId,
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('leadId', 'name email team').sort({ timestamp: -1 });

    // Get teams
    const teams = await User.getTeamsForManager(managerId);
    const teamLeads = await User.find({
      managerId: managerId,
      role: 'teamLead'
    }).select('name email team');

    // Calculate summary statistics
    const totalSubmissions = submissions.length;
    const statusCounts = Submission.getStatusCounts(submissions);
    
    // Group submissions by date
    const submissionsByDate = {};
    submissions.forEach(submission => {
      const dateKey = submission.timestamp.toISOString().split('T')[0];
      if (!submissionsByDate[dateKey]) {
        submissionsByDate[dateKey] = [];
      }
      submissionsByDate[dateKey].push(submission);
    });

    // Recent activity (last 5 submissions)
    const recentActivity = submissions.slice(0, 5).map(sub => sub.toJSON());

    res.json({
      success: true,
      data: {
        summary: {
          totalTeams: teams.length,
          totalTeamLeads: teamLeads.length,
          totalSubmissions,
          dateRange: {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
            days: parseInt(days)
          }
        },
        statusCounts,
        submissionsByDate: Object.keys(submissionsByDate).map(date => ({
          date,
          count: submissionsByDate[date].length,
          submissions: submissionsByDate[date].map(sub => sub.toJSON())
        })),
        recentActivity,
        teams: teams.map(teamName => {
          const leads = teamLeads.filter(lead => lead.team === teamName);
          const teamSubmissions = submissions.filter(sub => sub.team === teamName);
          return {
            name: teamName,
            leadsCount: leads.length,
            submissionsCount: teamSubmissions.length,
            leads: leads.map(lead => ({
              id: lead._id,
              name: lead.name,
              email: lead.email
            }))
          };
        })
      }
    });

  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard summary'
    });
  }
};

// @desc    Get submission statistics for manager
// @route   GET /api/manager/stats
// @access  Private (Manager only)
export const getStats = async (req, res) => {
  try {
    const managerId = req.user._id;
    const { period = 'week' } = req.query; // week, month, quarter, year

    // Calculate date range based on period
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    startDate.setHours(0, 0, 0, 0);

    // Aggregate statistics using MongoDB aggregation pipeline
    const stats = await Submission.aggregate([
      {
        $match: {
          managerId: managerId,
          timestamp: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            team: '$team',
            status: '$status'
          },
          count: { $sum: 1 },
          submissions: { $push: '$testName' }
        }
      },
      {
        $group: {
          _id: '$_id.team',
          statusBreakdown: {
            $push: {
              status: '$_id.status',
              count: '$count',
              submissions: '$submissions'
            }
          },
          totalSubmissions: { $sum: '$count' }
        }
      },
      {
        $sort: { totalSubmissions: -1 }
      }
    ]);

    // Calculate overall totals
    let totalSubmissions = 0;
    const overallStatusCounts = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errored: 0
    };

    stats.forEach(teamStat => {
      totalSubmissions += teamStat.totalSubmissions;
      teamStat.statusBreakdown.forEach(statusInfo => {
        overallStatusCounts[statusInfo.status] += statusInfo.count;
      });
    });

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        overall: {
          totalSubmissions,
          statusCounts: overallStatusCounts
        },
        byTeam: stats.map(teamStat => ({
          team: teamStat._id,
          totalSubmissions: teamStat.totalSubmissions,
          statusBreakdown: teamStat.statusBreakdown.reduce((acc, status) => {
            acc[status.status] = {
              count: status.count,
              submissions: status.submissions
            };
            return acc;
          }, {})
        }))
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

export default {
  getRuns,
  getTeams,
  getDashboardSummary,
  getStats
};
