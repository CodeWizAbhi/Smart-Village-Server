import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { config } from '../config/env';
import { successResponse, errorResponse } from '../utils/response';

const generateToken = (id: string) => {
  return jwt.sign({ id }, config.jwtSecret as string, {
    expiresIn: config.jwtExpire as any,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, mobile, email, password, village, district, taluka } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (userExists) {
      errorResponse(res, 400, 'User already exists');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
      village,
      district,
      taluka,
    });

    if (user) {
      successResponse(res, 201, 'User registered successfully', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id as any as string),
      });
    } else {
      errorResponse(res, 400, 'Invalid user data');
    }
  } catch (error: any) {
    errorResponse(res, 500, error.message || 'Server error');
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      successResponse(res, 200, 'Login successful', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id as any as string),
      });
    } else {
      errorResponse(res, 401, 'Invalid credentials');
    }
  } catch (error: any) {
    errorResponse(res, 500, error.message || 'Server error');
  }
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile, role: 'admin' });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      successResponse(res, 200, 'Admin login successful', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id as any as string),
      });
    } else {
      errorResponse(res, 401, 'Invalid admin credentials');
    }
  } catch (error: any) {
    errorResponse(res, 500, error.message || 'Server error');
  }
};
