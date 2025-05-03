import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import {
  generateCoverLetter,
  getUserCoverLetters,
  getCoverLetterById,
  updateCoverLetter,
  deleteCoverLetter
} from '../controllers/coverLetter.controller';

const router = express.Router();

// Protected routes
router.use(authenticate);

// Generate cover letter
router.post('/generate', generateCoverLetter);

// Get all cover letters for user
router.get('/', getUserCoverLetters);

// Get cover letter by ID
router.get('/:id', getCoverLetterById);

// Update cover letter
router.put('/:id', updateCoverLetter);

// Delete cover letter
router.delete('/:id', deleteCoverLetter);

export const coverLetterRoutes = router; 