import { Complaint } from '../models/Complaint.model';
import { IComplaint } from '../types';

export const getDashboardStats = async () => {
  const totalComplaints = await Complaint.countDocuments();
  const resolvedComplaints = await Complaint.countDocuments({ status: 'RESOLVED' });
  const pendingComplaints = await Complaint.countDocuments({ status: 'PENDING' });
  const inProgressComplaints = await Complaint.countDocuments({ status: 'IN_PROGRESS' });

  const categoryAggregation = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);
  
  const mostCommonCategory = categoryAggregation.length > 0 ? categoryAggregation[0]._id : null;

  return {
    totalComplaints,
    resolvedComplaints,
    pendingComplaints,
    inProgressComplaints,
    mostCommonCategory
  };
};
