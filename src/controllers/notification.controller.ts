import { Request, Response } from 'express';
import { sendNotification } from '../services/notification.service';
import { successResponse, errorResponse } from '../utils/response';

export const triggerNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, title, body, data } = req.body;
    await sendNotification(token, title, body, data);
    successResponse(res, 200, 'Notification triggered successfully');
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};
