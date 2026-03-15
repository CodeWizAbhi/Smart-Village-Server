import { Request, Response } from 'express';
import { Complaint } from '../models/Complaint.model';
import { Comment } from '../models/Comment.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { successResponse, errorResponse } from '../utils/response';
import { sendNotification } from '../services/notification.service';
import { getDashboardStats } from '../services/complaint.service';
import fs from 'fs';

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, latitude, longitude, address } = req.body;
    let images: string[] = [];

    if (req.files) {
      const files = req.files as Express.Multer.File[];
      images = files.map(file => `/uploads/complaints/${file.filename}`);
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      images,
      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        address,
      },
      reportedBy: req.user!._id,
    });

    // Notify logic can go here

    successResponse(res, 201, 'Complaint created successfully', complaint);
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};

export const getComplaints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status } = req.query;
    let filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter)
      .populate('reportedBy', 'name village mobile')
      .sort({ createdAt: -1 });

    successResponse(res, 200, 'Complaints fetched successfully', complaints);
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};

export const getComplaintsMap = async (req: Request, res: Response): Promise<void> => {
  try {
    const complaints = await Complaint.find().select('title location status category');
    
    const mapData = complaints.map(c => ({
      _id: c._id,
      title: c.title,
      status: c.status,
      category: c.category,
      latitude: c.location.latitude,
      longitude: c.location.longitude,
      address: c.location.address,
    }));

    successResponse(res, 200, 'Map data fetched successfully', mapData);
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};

export const getComplaintById = async (req: Request, res: Response): Promise<void> => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reportedBy', 'name village mobile profileImage')
      .populate('voters', 'name');

    if (!complaint) {
      errorResponse(res, 404, 'Complaint not found');
      return;
    }

    successResponse(res, 200, 'Complaint fetched successfully', complaint);
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};

export const updateComplaintStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      errorResponse(res, 404, 'Complaint not found');
      return;
    }

    complaint.status = status;
    await complaint.save();

    // Trigger notification here optionally
    successResponse(res, 200, 'Status updated successfully', complaint);
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};

export const deleteComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      errorResponse(res, 404, 'Complaint not found');
      return;
    }

    await complaint.deleteOne();
    successResponse(res, 200, 'Complaint deleted successfully');
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};

export const voteComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      errorResponse(res, 404, 'Complaint not found');
      return;
    }

    const userId = req.user!._id;

    if (complaint.voters.includes(userId)) {
      errorResponse(res, 400, 'You have already supported this complaint');
      return;
    }

    complaint.voters.push(userId);
    complaint.votes += 1;
    await complaint.save();

    successResponse(res, 200, 'Vote added successfully', { votes: complaint.votes });
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    
    const comment = await Comment.create({
      complaintId: req.params.id as any,
      userId: req.user!._id,
      message,
    });

    successResponse(res, 201, 'Comment added successfully', comment);
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getDashboardStats();
    successResponse(res, 200, 'Dashboard stats fetched successfully', stats);
  } catch (error: any) {
    errorResponse(res, 500, error.message);
  }
};
