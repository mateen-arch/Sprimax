import express from 'express';
import {
  getSupportTickets,
  createSupportTicket,
} from '../controllers/supportTicketController.js';

const router = express.Router();

router.route('/')
  .get(getSupportTickets)
  .post(createSupportTicket);

export default router;
