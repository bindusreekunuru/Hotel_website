import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import searchRouter from './routes/search.js';
import { globalErrorHandler } from './services/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with settings matching frontend deployment
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hotel Information Aggregator service is running.' });
});

// Register search endpoints
app.use('/api', searchRouter);

// Global Error Handler middleware
app.use(globalErrorHandler);

// Start the Express application
app.listen(PORT, () => {
  console.log(`[Express Server] Server running on http://localhost:${PORT}`);
  console.log(`[Express Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Express Server] CORS Origin set to: ${corsOptions.origin}`);
});
