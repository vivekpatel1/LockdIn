import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure behavior for when the app is in foreground
try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
} catch (error) {
    console.log("Notification handler setup failed (likely Expo Go)", error);
}

export async function requestNotificationPermissions() {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return false;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('focus-mode', {
                name: 'Focus Mode Active',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return true;
    } catch (error) {
        console.log('Error requesting notification permissions (likely Expo Go limitation):', error);
        return false;
    }
}

export async function scheduleFocusNotification(taskName = 'Focus Task') {
    // Cancel any existing ones first just in case
    await cancelFocusNotification();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Focus Mode Active 🔒",
            body: `You are in a session for "${taskName}". Return to the app!`,
            data: { type: 'focus_reminder' },
            priority: Notifications.AndroidNotificationPriority.MAX,
            sound: true,
        },
        trigger: {
            seconds: 1,
            repeats: false,
        },
    });
}

export async function schedulePausedNotification(taskName = 'Focus Task') {
    await cancelFocusNotification();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "⏸️ FOCUS PAUSED",
            body: `Timer stopped. You are losing progress on "${taskName}". Get back to work.`,
            data: { type: 'focus_paused' },
            priority: Notifications.AndroidNotificationPriority.MAX,
            sound: true,
        },
        trigger: {
            seconds: 1,
            repeats: false,
        },
    });
}

export async function cancelFocusNotification() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
}
