import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { userRoutes } from './routes/user.routes';
import { jobRoutes } from './routes/job.routes';
import { resumeRoutes } from './routes/resume.routes';
import { coverLetterRoutes } from './routes/coverLetter.routes';
import { interviewRoutes } from './routes/interview.routes';
import { careerPathRoutes } from './routes/careerPath.routes';
import { authRoutes } from './routes/auth.routes';
import { testConnection } from './config/database';
import { initDatabase } from './models';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/cover-letters', coverLetterRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/career-path', careerPathRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CareerVoid API is running' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database models and relationships
    await initDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 