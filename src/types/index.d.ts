import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  mobile: string;
  email: string;
  password?: string;
  role: 'villager' | 'admin';
  village: string;
  district: string;
  taluka: string;
  profileImage?: string;
  createdAt: Date;
}

export interface IComplaint extends Document {
  title: string;
  description: string;
  category: 'ROAD' | 'WATER' | 'STREET_LIGHT' | 'GARBAGE' | 'DRAINAGE';
  images: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  reportedBy: Types.ObjectId | IUser;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  votes: number;
  voters: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment extends Document {
  complaintId: Types.ObjectId;
  userId: Types.ObjectId | IUser;
  message: string;
  createdAt: Date;
}
