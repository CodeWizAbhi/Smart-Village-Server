import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User.model';
import { errorResponse } from '../utils/response';
import { IUser } from '../types';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    errorResponse(res, 401, 'Not authorized, no token');
    return;
  }

  try {
    const decoded: any = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      errorResponse(res, 401, 'Not authorized, user not found');
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    errorResponse(res, 401, 'Not authorized, token failed');
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    errorResponse(res, 403, 'Not authorized, admin only');
  }
};
