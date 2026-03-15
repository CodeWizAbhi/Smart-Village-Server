import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintsMap,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  voteComplaint,
  addComment
} from '../controllers/complaint.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

router.route('/')
  .post(protect, upload.array('images', 3), createComplaint)
  .get(protect, getComplaints);

router.get('/map', protect, getComplaintsMap);

router.route('/:id')
  .get(protect, getComplaintById)
  .delete(protect, adminOnly, deleteComplaint);

router.put('/:id/status', protect, adminOnly, updateComplaintStatus);
router.post('/:id/vote', protect, voteComplaint);
router.post('/:id/comment', protect, addComment);

export default router;
