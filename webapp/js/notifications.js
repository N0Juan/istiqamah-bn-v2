// Prayer Time Notifications Module
const Notifications = {
    checkInterval: null,
    notifiedPrayers: new Set(), // Track which prayers we've already notified about today
    lastCheckDate: null,

    init() {
        // Start checking for prayer times
        this.startChecking();
        console.log('Notifications module initialized');
    },

    startChecking() {
        // Check every minute
        this.checkInterval = setInterval(() => {
            this.checkPrayerTimeNotifications();
        }, 60000); // 60 seconds

        // Also check immediately
        this.checkPrayerTimeNotifications();
    },

    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    },

    checkPrayerTimeNotifications() {
        // Check if notifications are enabled
        const notificationsEnabled = localStorage.getItem('notifications_enabled') === 'true';
        if (!notificationsEnabled) return;

        // Check if we have permission
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        // Reset notified prayers at midnight
        const today = new Date().toDateString();
        if (this.lastCheckDate !== today) {
            this.notifiedPrayers.clear();
            this.lastCheckDate = today;
        }

        // Get current prayer times
        if (!PrayerTimes.currentPrayerTimes) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Get settings
        const reminderAdvance = parseInt(localStorage.getItem('reminder_advance') || '5');
        const endRemindersEnabled = localStorage.getItem('end_reminders_enabled') === 'true';

        // Get district name for notification
        const districtNames = {
            bruneiMuara: 'Brunei Muara',
            tutong: 'Tutong',
            belait: 'Belait'
        };
        const districtName = districtNames[PrayerTimes.selectedDistrict] || 'Brunei Muara';

        // Check each main prayer
        PrayerTimes.mainPrayers.forEach((prayer, index) => {
            const prayerTime = PrayerTimes.applyDistrictOffset(
                PrayerTimes.currentPrayerTimes.prayer_times[prayer]
            );
            const [hours, minutes] = prayerTime.split(':').map(Number);
            const prayerMinutes = hours * 60 + minutes;

            // Calculate notification time (X minutes before)
            const notificationTime = prayerMinutes - reminderAdvance;

            // Check if it's time to notify (within 1 minute window)
            if (currentMinutes >= notificationTime && currentMinutes < notificationTime + 1) {
                const notificationKey = `${prayer}-reminder`;

                if (!this.notifiedPrayers.has(notificationKey)) {
                    this.showPrayerReminder(prayer, prayerTime, reminderAdvance, districtName);
                    this.notifiedPrayers.add(notificationKey);
                }
            }

            // Check for end time reminders
            if (endRemindersEnabled && index < PrayerTimes.mainPrayers.length - 1) {
                const nextPrayer = PrayerTimes.mainPrayers[index + 1];
                const nextPrayerTime = PrayerTimes.applyDistrictOffset(
                    PrayerTimes.currentPrayerTimes.prayer_times[nextPrayer]
                );
                const [nextHours, nextMinutes] = nextPrayerTime.split(':').map(Number);
                const endMinutes = nextHours * 60 + nextMinutes;

                // Notify 15 minutes before prayer time ends
                const endNotificationTime = endMinutes - 15;

                if (currentMinutes >= endNotificationTime && currentMinutes < endNotificationTime + 1) {
                    // Only show if we're past the prayer time (in the prayer window)
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

        console.log(`Notification shown: ${prayerName} in ${minutesBefore} minutes`);
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

        console.log(`End time notification shown: ${prayerName} ending at ${formattedEndTime}`);
    },

    // Test notification
    testNotification() {
        console.log('testNotification called, permission:', Notification.permission);

        try {
            if (Notification.permission === 'granted') {
                console.log('Creating test notification...');
                const notification = new Notification('🕌 Test Notification', {
                    body: 'Notifications are working! You will receive prayer time reminders.',
                    icon: '/icons/icon-192.png',
                    tag: 'test-notification',
                    requireInteraction: false
                });

                notification.onclick = () => {
                    console.log('Notification clicked');
                    window.focus();
                    notification.close();
                };

                notification.onerror = (error) => {
                    console.error('Notification error:', error);
                };

                console.log('Test notification created successfully');
                return true;
            } else {
                console.error('Notification permission not granted:', Notification.permission);
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
