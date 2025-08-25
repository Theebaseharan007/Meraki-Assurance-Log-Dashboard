import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'dashboard-app',
      audience: 'dashboard-users'
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { role, name, email, password, team, managerEmail } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Prepare user data
    const userData = {
      role,
      name,
      email,
      passwordHash: password // Will be hashed by pre-save middleware
    };

    // Handle team lead specific data
    if (role === 'teamLead') {
      if (!team || !managerEmail) {
        return res.status(400).json({
          success: false,
          message: 'Team name and manager email are required for team leads'
        });
      }

      // Find manager by email
      const manager = await User.findOne({ 
        email: managerEmail.toLowerCase().trim(), 
        role: 'manager' 
      });

      if (!manager) {
        return res.status(404).json({
          success: false,
          message: 'Manager not found with the provided email'
        });
      }

      userData.team = team;
      userData.managerId = manager._id;
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    // Return user data (password hash excluded by schema transform)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Handle validation errors
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
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user by email and role
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      role 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or role mismatch'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data and token
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    // User is already available from auth middleware
    const user = req.user;

    // For team leads, populate manager info
    if (user.role === 'teamLead' && user.managerId) {
      await user.populate('managerId', 'name email');
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, team, currentPassword, newPassword } = req.body;
    const user = req.user;

    // Get the full user document with password
    const fullUser = await User.findById(user._id);
    if (!fullUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await fullUser.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      // Update password
      fullUser.passwordHash = newPassword; // This will trigger the pre-save hash middleware
    }

    // Update other allowed fields
    const allowedUpdates = ['name', 'email'];
    if (user.role === 'teamLead') {
      allowedUpdates.push('team');
    }

    if (name && allowedUpdates.includes('name')) {
      fullUser.name = name.trim();
    }
    if (email && allowedUpdates.includes('email')) {
      fullUser.email = email.trim().toLowerCase();
    }
    if (team && allowedUpdates.includes('team')) {
      fullUser.team = team.trim();
    }

    // Save the updated user (this will hash the password if changed)
    const updatedUser = await fullUser.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toJSON()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
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
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Since we're using stateless JWT, logout is handled client-side
    // This endpoint is mainly for consistency and potential future enhancements
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

export default {
  signup,
  login,
  getProfile,
  updateProfile,
  logout
};
