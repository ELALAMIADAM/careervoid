import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserSchema } from '../../../shared/src';
import { User } from '../models/user.model';

export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validation = UserSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid user data', 
        errors: validation.error.errors 
      });
    }
    
    const { email, firstName, lastName, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Create user in database
    const newUser = await User.create({
      email,
      firstName,
      lastName,
      passwordHash: password, // Will be hashed by model hooks
      profileCompleted: false
    });
    
    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET || 'default_secret_should_be_changed',
      { expiresIn: '7d' }
    );
    
    // Return user data without password hash
    const userWithoutPassword = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      profileCompleted: newUser.profileCompleted
    };
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'default_secret_should_be_changed',
      { expiresIn: '7d' }
    );
    
    // Return user data without password hash
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      goal: user.goal,
      industry: user.industry,
      experience: user.experience,
      workType: user.workType,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
}; 