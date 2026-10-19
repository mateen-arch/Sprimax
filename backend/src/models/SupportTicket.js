import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      default: () => `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Bug', 'Feature request', 'Account access', 'Other'],
      default: 'Bug',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    pageUrl: {
      type: String,
      default: '',
    },
    screenshot: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Open', 'In Review', 'Resolved', 'Closed'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    adminEmail: {
      type: String,
      default: 'sprimaxindia@gmail.com',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('SupportTicket', supportTicketSchema);
