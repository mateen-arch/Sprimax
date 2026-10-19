import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      default: 'Mateen Baig',
    },
    displayName: {
      type: String,
      trim: true,
      default: 'Mateen',
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      default: 'sprimaxindia@gmail.com',
    },
    phone: {
      type: String,
      trim: true,
      default: '+91 9039072804',
    },
    jobTitle: {
      type: String,
      trim: true,
      default: 'Super Administrator & Operations Director',
    },
    bio: {
      type: String,
      default: 'Managing industrial welding consumables manufacturing, global compliance certifications, and enterprise distribution networks.',
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['Super Admin', 'Admin', 'Editor', 'user'],
      default: 'Super Admin',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
    memberSince: {
      type: String,
      default: 'January 2024',
    },
    lastLogin: {
      type: String,
      default: 'Today, 07:15 AM (IST)',
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    preferences: {
      language: { type: String, default: 'English (US)' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      timezone: { type: String, default: 'Asia/Kolkata (IST)' },
      theme: { type: String, default: 'Light' },
    },
    notifications: {
      emailEnquiries: { type: Boolean, default: true },
      lowInventory: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
      securityAlerts: { type: Boolean, default: true },
    },
    activityLog: [
      {
        id: String,
        action: String,
        details: String,
        timestamp: String,
        ip: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
