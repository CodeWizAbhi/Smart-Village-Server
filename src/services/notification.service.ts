import admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Make sure to initialize firebase-admin with your service account
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

export const sendNotification = async (fcmToken: string, title: string, body: string, data?: any) => {
  try {
    if (!admin.apps.length) {
      logger.warn('Firebase admin not initialized, skipping notification');
      return;
    }
    const message = {
      notification: { title, body },
      data: data || {},
      token: fcmToken,
    };
    
    const response = await admin.messaging().send(message);
    logger.info(`Successfully sent message: ${response}`);
  } catch (error) {
    logger.error('Error sending notification', error);
  }
};
