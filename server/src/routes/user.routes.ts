import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/user.model';

const router = express.Router();

// Protected routes
router.use(authenticate);

// Get user profile
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    // Only allow users to access their own profile unless admin
    if (req.params.id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to access this user profile' });
    }

    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user.get({ plain: true });
    
    res.json({ 
      message: 'User profile retrieved', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
router.post('/', (req: AuthRequest, res) => {
  res.json({ message: 'Create user', data: req.body, userId: req.userId });
});

// Update user profile
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    // Only allow users to update their own profile unless admin
    if (req.params.id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to update this user profile' });
    }

    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const allowedFields = ['firstName', 'lastName', 'goal', 'industry', 'experience', 'workType'];
    const updates: any = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update user
    await user.update(updates);

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user.get({ plain: true });
    
    res.json({ 
      message: 'User profile updated', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    // Only allow users to delete their own account unless admin
    if (req.params.id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this user' });
    }

    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await user.destroy();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save onboarding preferences
router.post('/onboarding', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { goal, industry, experience, workType } = req.body;
    
    // Find the user
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user with onboarding preferences
    await user.update({
      goal,
      industry,
      experience,
      workType,
      profileCompleted: true
    });
    
    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user.get({ plain: true });
    
    res.status(200).json({ 
      message: 'Onboarding preferences saved',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error saving onboarding preferences:', error);
    res.status(500).json({ message: 'Failed to save onboarding preferences' });
  }
});

export const userRoutes = router; 