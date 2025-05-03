import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  searchJobs,
  getMatchingJobsForUser,
  analyzeJobDescription,
  searchExternalJobs,
  getExternalJobDetails,
  searchJobsWithResume
} from '../controllers/job.controller';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/search', searchJobs);
router.get('/:id', getJobById);

// Protected routes
router.use(authenticate);

// Create job
router.post('/', createJob);

// Update job
router.put('/:id', updateJob);

// Delete job
router.delete('/:id', deleteJob);

// Get matching jobs for user
router.get('/matches/user', getMatchingJobsForUser);

// Analyze job description
router.post('/analyze', analyzeJobDescription);

// External job search routes
router.get('/external/search', searchExternalJobs);
router.get('/external/:source/:id', getExternalJobDetails);
router.get('/resume-based/search', searchJobsWithResume);

export const jobRoutes = router; 