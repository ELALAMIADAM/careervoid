import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  file?: any; // Multer adds this property to the request
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_should_be_changed');
    
    if (typeof decodedToken === 'object' && 'userId' in decodedToken) {
      req.userId = decodedToken.userId as string;
      next();
    } else {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}; 