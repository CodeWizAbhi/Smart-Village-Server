import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { errorHandler, notFound } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import complaintRoutes from './routes/complaint.routes';
import { getStats } from './controllers/complaint.controller';
import { triggerNotification } from './controllers/notification.controller';
import { protect } from './middleware/auth.middleware';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false })); // allows serving images crossover

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api', limiter);

// Static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);

// Dashboard routes
app.get('/api/dashboard/stats', protect, getStats);

// Notification route (internal admin tool)
app.post('/api/notifications/trigger', protect, triggerNotification);

// Default Route
app.get('/', (req, res) => {
  res.send('Smart Village API is running...');
});

app.use(notFound);
app.use(errorHandler);

export default app;
