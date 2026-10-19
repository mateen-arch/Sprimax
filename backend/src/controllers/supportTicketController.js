import SupportTicket from '../models/SupportTicket.js';

// @desc    Get all support tickets
// @route   GET /api/support-tickets
// @access  Public
export const getSupportTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new support ticket
// @route   POST /api/support-tickets
// @access  Public
export const createSupportTicket = async (req, res, next) => {
  try {
    const ticketId = `TICK-${Date.now().toString().slice(-4)}`;
    const ticket = await SupportTicket.create({
      ...req.body,
      ticketId,
    });

    res.status(201).json({
      success: true,
      message: `Support ticket ${ticketId} created successfully. Our developer team has been notified.`,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};
