import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables reliably from backend/.env or cwd
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Connect to MongoDB
connectDB();

// Verify Cloudinary status on startup
import { isCloudinaryConfigured } from './config/cloudinary.js';
if (isCloudinaryConfigured()) {
  console.log('[Cloudinary] Configured successfully for cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.warn('[Cloudinary] WARNING: Cloudinary credentials missing in .env');
}

const app = express();

// Middlewares
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev to avoid blocking admin/frontend
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', apiRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    project: 'Sprimax API',
    status: 'Running',
    documentation: '/api/health',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Sprimax Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
