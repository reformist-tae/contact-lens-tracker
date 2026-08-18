import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const NOTIFICATION_ID = 1001;
const CHANNEL_ID = 'lens-tracker-daily';

export async function initNotificationChannel(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'Daily Check-in',
    description: 'Reminds you to log your contact lens usage each day',
    importance: 4, // HIGH
    visibility: 1, // PUBLIC
    vibration: true,
    lights: true,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
}

export async function scheduleNotification(hour: number, minute: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await cancelNotification();
  await LocalNotifications.schedule({
    notifications: [{
      id: NOTIFICATION_ID,
      title: 'LensTracker',
      body: 'Good morning! Are you wearing contact lenses today?',
      channelId: CHANNEL_ID,
      schedule: {
        on: { hour, minute },
        repeats: true,
        allowWhileIdle: true,
      },
    }],
  });
}

export async function cancelNotification(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const pending = await LocalNotifications.getPending();
    const exists = pending.notifications.some(n => n.id === NOTIFICATION_ID);
    if (exists) {
      await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
    }
  } catch {
    // nothing pending to cancel
  }
}
