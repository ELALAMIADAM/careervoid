import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import {
  generateCareerPath,
  getUserCareerPath,
  deleteCareerPath,
  addCareerPathNode,
  addCareerPathConnection
} from '../controllers/careerPath.controller';

const router = express.Router();

// Protected routes
router.use(authenticate);

// Generate career path
router.post('/generate', generateCareerPath);

// Get user career path
router.get('/', getUserCareerPath);

// Delete user career path
router.delete('/', deleteCareerPath);

// Add a node to career path
router.post('/nodes', addCareerPathNode);

// Add a connection between nodes
router.post('/connections', addCareerPathConnection);

export const careerPathRoutes = router; 