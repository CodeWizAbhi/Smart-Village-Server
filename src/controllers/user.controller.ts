import { Response } from 'express';
import { User } from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { successResponse, errorResponse } from '../utils/response';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).select('-password');
    if (!user) {
      errorResponse(res, 404, 'User not found');
      return;
    }
    successResponse(res, 200, 'Profile fetched successfully', user);
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      errorResponse(res, 404, 'User not found');
      return;
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.village = req.body.village || user.village;
    user.district = req.body.district || user.district;
    user.taluka = req.body.taluka || user.taluka;

    if (req.body.password) {
      const bcrypt = require('bcrypt');
      user.password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
    }

    const updatedUser = await user.save();

    successResponse(res, 200, 'Profile updated successfully', {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};
