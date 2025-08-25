import mongoose from 'mongoose';

const subsectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subsection name is required'],
    trim: true,
    maxlength: [200, 'Subsection name cannot exceed 200 characters']
  },
  result: {
    type: String,
    enum: ['passed', 'failed', 'skipped', 'errored'],
    required: [true, 'Subsection result is required']
  }
}, { _id: true });

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true,
    maxlength: [200, 'Section name cannot exceed 200 characters']
  },
  result: {
    type: String,
    enum: ['passed', 'failed', 'skipped', 'errored'],
    required: [true, 'Section result is required']
  },
  subsections: {
    type: [subsectionSchema],
    default: []
  }
}, { _id: true });

const submissionSchema = new mongoose.Schema({
  team: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lead ID is required'],
    validate: {
      validator: async function(leadId) {
        const lead = await mongoose.model('User').findById(leadId);
        return lead && lead.role === 'teamLead';
      },
      message: 'Lead ID must reference a valid team lead'
    }
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Manager ID is required']
  },
  testName: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true,
    maxlength: [200, 'Test name cannot exceed 200 characters']
  },
  sections: {
    type: [sectionSchema],
    required: [true, 'At least one section is required'],
    validate: {
      validator: function(sections) {
        return sections && sections.length > 0;
      },
      message: 'At least one section is required'
    }
  },
  status: {
    type: String,
    enum: ['passed', 'failed', 'skipped', 'errored']
    // Status is calculated automatically in pre-save middleware, not required in input
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: [true, 'Timestamp is required']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for efficient queries
submissionSchema.index({ leadId: 1, timestamp: -1 });
submissionSchema.index({ managerId: 1, timestamp: -1 });
submissionSchema.index({ team: 1, timestamp: -1 });
submissionSchema.index({ timestamp: -1 });
submissionSchema.index({ 
  timestamp: -1, 
  managerId: 1, 
  team: 1 
}, { 
  name: 'manager_team_date_index' 
});

// Pre-save middleware to calculate status from sections/subsections
submissionSchema.pre('save', function(next) {
  this.status = this.calculateAggregateStatus();
  next();
});

// Method to calculate aggregate status
submissionSchema.methods.calculateAggregateStatus = function() {
  const statusPriority = {
    'errored': 4,
    'failed': 3,
    'skipped': 2,
    'passed': 1
  };

  let worstStatus = 'passed';
  let worstPriority = 1;

  // Check all sections and subsections
  for (const section of this.sections) {
    // Check section result
    const sectionPriority = statusPriority[section.result];
    if (sectionPriority > worstPriority) {
      worstStatus = section.result;
      worstPriority = sectionPriority;
    }

    // Check subsection results
    for (const subsection of section.subsections) {
      const subsectionPriority = statusPriority[subsection.result];
      if (subsectionPriority > worstPriority) {
        worstStatus = subsection.result;
        worstPriority = subsectionPriority;
      }
    }
  }

  return worstStatus;
};

// Static method to get runs for a specific date and optional team
submissionSchema.statics.getRunsForDate = async function(managerId, date, team = null) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const query = {
    managerId: managerId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  };

  if (team) {
    query.team = team;
  }

  return await this.find(query)
    .populate('leadId', 'name email')
    .sort({ timestamp: 1 });
};

// Static method to get status counts for chart data
submissionSchema.statics.getStatusCounts = function(submissions) {
  const counts = {
    passed: 0,
    failed: 0,
    skipped: 0,
    errored: 0
  };

  submissions.forEach(submission => {
    submission.sections.forEach(section => {
      counts[section.result] = (counts[section.result] || 0) + 1;
      
      section.subsections.forEach(subsection => {
        counts[subsection.result] = (counts[subsection.result] || 0) + 1;
      });
    });
  });

  return counts;
};

// Static method to get test names by status for tooltips
submissionSchema.statics.getTestNamesByStatus = function(submissions) {
  const testsByStatus = {
    passed: [],
    failed: [],
    skipped: [],
    errored: []
  };

  submissions.forEach(submission => {
    submission.sections.forEach(section => {
      testsByStatus[section.result].push(`${submission.testName} - ${section.name}`);
      
      section.subsections.forEach(subsection => {
        testsByStatus[subsection.result].push(
          `${submission.testName} - ${section.name} - ${subsection.name}`
        );
      });
    });
  });

  return testsByStatus;
};

export default mongoose.model('Submission', submissionSchema);
