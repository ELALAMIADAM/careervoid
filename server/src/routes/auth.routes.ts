import express from 'express';
import { register, login } from '../controllers/auth.controller';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login existing user
router.post('/login', login);

export const authRoutes = router; 