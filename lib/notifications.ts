import webpush from 'web-push';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:support@itservicesfreetown.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url: string;
    [key: string]: any;
  };
}

/**
 * Sends a notification to all registered technicians or a specific one.
 */
export async function sendForumNotification(payload: NotificationPayload, targetTechnicianId?: string) {
  try {
    // 1. Fetch relevant subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: targetTechnicianId ? { technicianId: targetTechnicianId } : {},
      include: { technician: { select: { name: true } } }
    });

    if (subscriptions.length === 0) {
      console.log('No push subscriptions found for notification.');
      return;
    }

    const notificationData = JSON.stringify(payload);

    // 2. Send pushes
    const promises = subscriptions.map(async (sub) => {
      try {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(pushConfig, notificationData);
      } catch (error: any) {
        // 3. Handle expired subscriptions (410 Gone or 404 Not Found)
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Removing expired subscription: ${sub.endpoint}`);
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error('Push notification error for single subscription:', error);
        }
      }
    });

    await Promise.all(promises);
    console.log(`Notifications processed for ${subscriptions.length} devices.`);

  } catch (error) {
    console.error('Fatal error in sendForumNotification:', error);
  }
}
