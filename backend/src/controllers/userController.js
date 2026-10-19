import User from '../models/User.js';

// Default initial admin profile
const DEFAULT_PROFILE = {
  name: 'Mateen Baig',
  displayName: 'Mateen',
  email: 'sprimaxindia@gmail.com',
  phone: '+91 9039072804',
  jobTitle: 'Super Administrator & Operations Director',
  bio: 'Managing industrial welding consumables manufacturing, global compliance certifications, and enterprise distribution networks.',
  avatar: '',
  role: 'Super Admin',
  status: 'Active',
  memberSince: 'January 2024',
  lastLogin: 'Today, 07:15 AM (IST)',
  twoFactorEnabled: false,
  preferences: {
    language: 'English (US)',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Kolkata (IST)',
    theme: 'Light',
  },
  notifications: {
    emailEnquiries: true,
    lowInventory: true,
    weeklyDigest: false,
    securityAlerts: true,
  },
  activityLog: [
    {
      id: 'act-1',
      action: 'Updated Product Catalogue',
      details: 'Modified specifications and pricing tier for LOW HYDROGEN ELECTRODE E7018-1',
      timestamp: 'Today, 06:40 AM',
      ip: '103.211.54.12',
    },
    {
      id: 'act-2',
      action: 'Approved Customer Enquiry',
      details: 'Reviewed and forwarded Bulk Quotation request #ENQ-2026-904',
      timestamp: 'Yesterday, 04:15 PM',
      ip: '103.211.54.12',
    },
    {
      id: 'act-3',
      action: 'Synchronized ISO Certifications',
      details: 'Verified validity date range for AWS D1.1 and EN 1090-2 execution standards',
      timestamp: 'Oct 17, 2026 11:20 AM',
      ip: '103.211.54.12',
    },
    {
      id: 'act-4',
      action: 'Security Sign-in',
      details: 'Successful 2FA password authentication from Chrome / Windows 11',
      timestamp: 'Oct 16, 2026 09:00 AM',
      ip: '103.211.54.12',
    },
  ],
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
export const createUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.create({ name, email, role });
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current admin profile (auto-initializes default if none)
// @route   GET /api/users/profile
// @access  Public
export const getAdminProfile = async (req, res, next) => {
  try {
    let profile = await User.findOne({ role: 'Super Admin' });
    if (!profile) {
      profile = await User.create(DEFAULT_PROFILE);
    }
    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @route   PUT /api/users/profile
// @access  Public
export const updateAdminProfile = async (req, res, next) => {
  try {
    let profile = await User.findOne({ role: 'Super Admin' });
    if (!profile) {
      profile = new User(DEFAULT_PROFILE);
    }

    // Merge changes
    Object.assign(profile, req.body);

    // If activityLog is supplied, keep it updated
    if (req.body.newActivityAction) {
      profile.activityLog.unshift({
        id: `act-${Date.now()}`,
        action: req.body.newActivityAction,
        details: req.body.newActivityDetails || 'Profile configuration updated',
        timestamp: 'Just now',
        ip: req.ip || '127.0.0.1',
      });
      if (profile.activityLog.length > 20) {
        profile.activityLog = profile.activityLog.slice(0, 20);
      }
    }

    const saved = await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: saved,
    });
  } catch (error) {
    next(error);
  }
};
