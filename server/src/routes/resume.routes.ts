import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  uploadResume, 
  getUserResumes, 
  getResumeById, 
  analyzeResume, 
  deleteResume, 
  findMatchingJobs 
} from '../controllers/resume.controller';
import upload from '../services/upload.service';

const router = express.Router();

// Protected routes
router.use(authenticate);

// Upload a new resume
router.post(
  '/upload', 
  upload.single('resume'), 
  uploadResume
);

// Get all resumes for the current user
router.get('/', getUserResumes);

// Get a specific resume by ID
router.get('/:id', getResumeById);

// Analyze a resume
router.get('/:id/analyze', analyzeResume);

// Delete a resume
router.delete('/:id', deleteResume);

// Find matching jobs for a resume
router.get('/:id/matching-jobs', findMatchingJobs);

export const resumeRoutes = router; 