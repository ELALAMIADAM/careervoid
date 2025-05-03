import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import {
  createInterviewPrep,
  getUserInterviewPreps,
  getInterviewPrepById,
  updateInterviewPrep,
  deleteInterviewPrep,
  generateQuestionsForInterviewPrep,
  saveQuestionAnswer,
  getAISuggestions
} from '../controllers/interview.controller';

const router = express.Router();

// Protected routes
router.use(authenticate);

// Create interview prep
router.post('/', createInterviewPrep);

// Get all interview preps for the user
router.get('/', getUserInterviewPreps);

// Get interview prep by ID
router.get('/:id', getInterviewPrepById);

// Update interview prep
router.put('/:id', updateInterviewPrep);

// Delete interview prep
router.delete('/:id', deleteInterviewPrep);

// Generate questions for an interview prep
router.post('/:id/generate-questions', generateQuestionsForInterviewPrep);

// Save answer to a question
router.post('/:id/save-answer', saveQuestionAnswer);

// Get AI suggestions for answers
router.get('/:id/suggestions', getAISuggestions);

export const interviewRoutes = router; 