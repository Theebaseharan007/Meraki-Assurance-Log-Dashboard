import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['manager', 'teamLead'],
    required: [true, 'Role is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  team: {
    type: String,
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters'],
    // Required only for team leads
    required: function() {
      return this.role === 'teamLead';
    }
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Required only for team leads
    required: function() {
      return this.role === 'teamLead';
    },
    validate: {
      validator: async function(managerId) {
        if (this.role === 'teamLead' && managerId) {
          const manager = await mongoose.model('User').findById(managerId);
          return manager && manager.role === 'manager';
        }
        return this.role === 'manager' || managerId;
      },
      message: 'Manager ID must reference a valid manager'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ managerId: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static method to find teams under a manager
userSchema.statics.getTeamsForManager = async function(managerId) {
  const teams = await this.distinct('team', { 
    managerId: managerId, 
    role: 'teamLead' 
  });
  return teams.filter(team => team); // Remove null/undefined values
};

export default mongoose.model('User', userSchema);
