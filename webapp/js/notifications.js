// Prayer Time Notifications Module
// Supports Web Push (background) with local notification fallback
const Notifications = {
    checkInterval: null,
    notifiedPrayers: new Set(),
    lastCheckDate: null,
    pushSubscription: null,
    vapidPublicKey: null,

    init() {
        this.startLocalChecker();
        this.initPushSubscription();
        console.log('Notifications module initialized');
    },

    // --- Web Push subscription management ---

    async initPushSubscription() {
        const enabled = localStorage.getItem('notifications_enabled') === 'true';
        if (!enabled) return;

        if (!('PushManager' in window) || !('serviceWorker' in navigator)) {
            console.log('Push API not supported, using local notifications only');
            return;
        }

        try {
            const reg = await navigator.serviceWorker.ready;
            const existing = await reg.pushManager.getSubscription();

            if (existing) {
                this.pushSubscription = existing;
                console.log('Existing push subscription found');
                await this.syncSettingsToBackend();
            }
        } catch (e) {
            console.error('Error checking push subscription:', e);
        }
    },

    async subscribeToPush() {
        if (!('PushManager' in window) || !('serviceWorker' in navigator)) {
            console.log('Push API not supported');
            return false;
        }

        try {
            // Fetch VAPID public key from backend
            if (!this.vapidPublicKey) {
                const resp = await fetch('/api/v1/push/vapid-public-key');
                if (!resp.ok) {
                    console.error('Failed to fetch VAPID key:', resp.status);
                    return false;
                }
                const data = await resp.json();
                this.vapidPublicKey = data.publicKey;
            }

            const reg = await navigator.serviceWorker.ready;

            // Check for existing subscription
            let subscription = await reg.pushManager.getSubscription();

            if (!subscription) {
                const applicationServerKey = this._urlBase64ToUint8Array(this.vapidPublicKey);
                subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey,
                });
                console.log('New push subscription created');
            }

            this.pushSubscription = subscription;

            // Send subscription + settings to backend
            await this._sendSubscriptionToBackend(subscription);
            localStorage.setItem('push_subscribed', 'true');
            return true;

        } catch (e) {
            console.error('Push subscription failed:', e);
            return false;
        }
    },

    async unsubscribeFromPush() {
        try {
            if (this.pushSubscription) {
                const endpoint = this.pushSubscription.endpoint;
                await this.pushSubscription.unsubscribe();
                this.pushSubscription = null;

                // Tell backend to remove
                await fetch('/api/v1/push/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint }),
                });

                localStorage.removeItem('push_subscribed');
                console.log('Push unsubscribed');
            }
        } catch (e) {
            console.error('Error unsubscribing:', e);
        }
    },

    async _sendSubscriptionToBackend(subscription) {
        const subJSON = subscription.toJSON();
        const settings = this._getCurrentSettings();

        await fetch('/api/v1/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subscription: {
                    endpoint: subJSON.endpoint,
                    keys: {
                        p256dh: subJSON.keys.p256dh,
                        auth: subJSON.keys.auth,
                    },
                },
                settings: settings,
            }),
        });
    },

    async syncSettingsToBackend() {
        if (!this.pushSubscription) return;

        const settings = this._getCurrentSettings();

        try {
            await fetch('/api/v1/push/update-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: this.pushSubscription.endpoint,
                    settings: settings,
                }),
            });
            console.log('Push settings synced to backend');
        } catch (e) {
            console.error('Failed to sync push settings:', e);
        }
    },

    _getCurrentSettings() {
        return {
            district: (typeof PrayerTimes !== 'undefined' && PrayerTimes.selectedDistrict)
                ? PrayerTimes.selectedDistrict
                : (localStorage.getItem('selected_district') || 'bruneiMuara'),
            reminder_advance: parseInt(localStorage.getItem('reminder_advance') || '5'),
            end_reminders_enabled: localStorage.getItem('end_reminders_enabled') === 'true',
            end_reminder_advance: parseInt(localStorage.getItem('end_reminder_advance') || '15'),
        };
    },

    _urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    },

    // --- Local notification fallback (fires only when tab is open) ---

    startLocalChecker() {
        this.checkInterval = setInterval(() => {
            this.checkPrayerTimeNotifications();
        }, 60000);
        this.checkPrayerTimeNotifications();
    },

    stopLocalChecker() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    },

    checkPrayerTimeNotifications() {
        const notificationsEnabled = localStorage.getItem('notifications_enabled') === 'true';
        if (!notificationsEnabled) return;

        // Skip local notifications if push is active — backend handles it
        if (this.pushSubscription) return;

        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        if (!PrayerTimes.currentPrayerTimes) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const today = now.toDateString();
        if (this.lastCheckDate !== today) {
            this.notifiedPrayers.clear();
            this.lastCheckDate = today;
        }

        const reminderAdvance = parseInt(localStorage.getItem('reminder_advance') || '5');
        const endRemindersEnabled = localStorage.getItem('end_reminders_enabled') === 'true';

        const districtNames = {
            bruneiMuara: 'Brunei Muara',
            tutong: 'Tutong',
            belait: 'Belait'
        };
        const districtName = districtNames[PrayerTimes.selectedDistrict] || 'Brunei Muara';

        PrayerTimes.mainPrayers.forEach((prayer, index) => {
            const prayerTime = PrayerTimes.applyDistrictOffset(
                PrayerTimes.currentPrayerTimes.prayer_times[prayer]
            );
            const [hours, minutes] = prayerTime.split(':').map(Number);
            const prayerMinutes = hours * 60 + minutes;

            const notificationTime = prayerMinutes - reminderAdvance;

            if (currentMinutes >= notificationTime && currentMinutes < notificationTime + 1) {
                const notificationKey = `${prayer}-reminder`;
                if (!this.notifiedPrayers.has(notificationKey)) {
                    this.showPrayerReminder(prayer, prayerTime, reminderAdvance, districtName);
                    this.notifiedPrayers.add(notificationKey);
                }
            }

            if (endRemindersEnabled && index < PrayerTimes.mainPrayers.length - 1) {
                const nextPrayer = PrayerTimes.mainPrayers[index + 1];
                const nextPrayerTime = PrayerTimes.applyDistrictOffset(
                    PrayerTimes.currentPrayerTimes.prayer_times[nextPrayer]
                );
                const [nextHours, nextMinutes] = nextPrayerTime.split(':').map(Number);
                const endMinutes = nextHours * 60 + nextMinutes;
                const endNotificationTime = endMinutes - 15;

                if (currentMinutes >= endNotificationTime && currentMinutes < endNotificationTime + 1) {
                    if (currentMinutes >= prayerMinutes) {
                        const endNotificationKey = `${prayer}-end`;
                        if (!this.notifiedPrayers.has(endNotificationKey)) {
                            this.showEndTimeReminder(prayer, nextPrayerTime, districtName);
                            this.notifiedPrayers.add(endNotificationKey);
                        }
                    }
                }
            }
        });
    },

    showPrayerReminder(prayer, time, minutesBefore, districtName) {
        const prayerNames = {
            suboh: 'Suboh (Fajr)',
            zohor: 'Zohor (Dhuhr)',
            asar: 'Asar (Asr)',
            maghrib: 'Maghrib',
            isyak: 'Isyak (Isha)'
        };

        const formattedTime = PrayerTimes.formatTime12Hour(time);
        const prayerName = prayerNames[prayer] || prayer;

        new Notification(`${prayerName} - ${minutesBefore} min`, {
            body: `${prayerName} time is in ${minutesBefore} minutes at ${formattedTime} in ${districtName}`,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-96.png',
            tag: `prayer-${prayer}`,
            requireInteraction: false,
            vibrate: [200, 100, 200]
        });
    },

    showEndTimeReminder(prayer, endTime, districtName) {
        const prayerNames = {
            suboh: 'Suboh (Fajr)',
            zohor: 'Zohor (Dhuhr)',
            asar: 'Asar (Asr)',
            maghrib: 'Maghrib',
            isyak: 'Isyak (Isha)'
        };

        const formattedEndTime = PrayerTimes.formatTime12Hour(endTime);
        const prayerName = prayerNames[prayer] || prayer;

        new Notification(`⏰ ${prayerName} Ending Soon`, {
            body: `${prayerName} prayer time ends at ${formattedEndTime} in ${districtName}. Please pray if you haven't yet.`,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-96.png',
            tag: `prayer-end-${prayer}`,
            requireInteraction: true,
            vibrate: [300, 100, 300, 100, 300]
        });
    },

    // --- Test notification ---

    testNotification() {
        console.log('testNotification called, permission:', Notification.permission);
        try {
            if (Notification.permission === 'granted') {
                const notification = new Notification('🕌 Test Notification', {
                    body: this.pushSubscription
                        ? 'Push notifications active! You will receive alerts even when the browser is closed.'
                        : 'Local notifications active. Keep the app open for alerts.',
                    icon: '/icons/icon-192.png',
                    tag: 'test-notification',
                    requireInteraction: false
                });

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
                return true;
            } else {
                alert('Please grant notification permission first');
                return false;
            }
        } catch (error) {
            console.error('Error creating notification:', error);
            alert('Error creating notification: ' + error.message);
            return false;
        }
    }
};
