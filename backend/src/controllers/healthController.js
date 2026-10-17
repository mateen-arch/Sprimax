import mongoose from 'mongoose';

// @desc    Check API and Database Health
// @route   GET /api/health
// @access  Public
export const getHealth = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    success: true,
    message: 'Sprimax API is up and running!',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: `${process.uptime().toFixed(1)}s`,
  });
};
