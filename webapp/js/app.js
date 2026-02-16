// Main App Controller
const App = {
    currentPage: 'prayer',
    deferredPrompt: null,

    async init() {
        try {
            console.log('Starting app initialization...');

            // Initialize all modules
            console.log('Initializing PrayerTimes...');
            await PrayerTimes.init();

            console.log('Initializing Tasbih...');
            Tasbih.init();

            console.log('Initializing QuranTracker...');
            QuranTracker.init();

            console.log('Initializing QadhaTracker...');
            QadhaTracker.init();

            console.log('Initializing DailyHadith...');
            DailyHadith.init();

            // Initialize notifications
            console.log('Initializing Notifications...');
            Notifications.init();

            // Setup navigation
            console.log('Setting up navigation...');
            this.setupNavigation();

            // Setup settings
            console.log('Setting up settings...');
            this.setupSettings();

            // Setup PWA install
            console.log('Setting up PWA install...');
            this.setupPWAInstall();

            // Request notification permission if enabled
            this.checkNotificationPermission();

            // Hide loading overlay
            this.hideLoading();

            console.log('✅ IstiqamahBN initialized successfully!');
        } catch (error) {
            console.error('❌ Error during initialization:', error);
            // Hide loading overlay even if there's an error
            this.hideLoading();
            // Show error to user
            alert('Failed to initialize app. Please refresh the page.\n\nError: ' + error.message);
        }
    },

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-item');

        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetPage = btn.dataset.page;
                this.navigateTo(targetPage);
            });
        });
    },

    navigateTo(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update nav buttons
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

        this.currentPage = pageName;
    },

    setupSettings() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const savedTheme = localStorage.getItem('theme') || 'light';

        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            darkModeToggle.checked = true;
        }

        darkModeToggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });

        // Notifications toggle
        const notificationsToggle = document.getElementById('notifications-toggle');
        const notificationsEnabled = localStorage.getItem('notifications_enabled') === 'true';
        notificationsToggle.checked = notificationsEnabled;

        notificationsToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            localStorage.setItem('notifications_enabled', enabled);

            if (enabled) {
                this.requestNotificationPermission();
            }
        });

        // End time reminders toggle
        const endRemindersToggle = document.getElementById('end-reminders-toggle');
        const endRemindersEnabled = localStorage.getItem('end_reminders_enabled') === 'true';
        endRemindersToggle.checked = endRemindersEnabled;

        endRemindersToggle.addEventListener('change', (e) => {
            localStorage.setItem('end_reminders_enabled', e.target.checked);
        });

        // Reminder advance time
        const reminderAdvance = document.getElementById('reminder-advance');
        const savedAdvance = localStorage.getItem('reminder_advance') || '5';
        reminderAdvance.value = savedAdvance;

        reminderAdvance.addEventListener('change', (e) => {
            localStorage.setItem('reminder_advance', e.target.value);
        });

        // Test notification button
        const testNotificationBtn = document.getElementById('test-notification-btn');
        if (testNotificationBtn) {
            testNotificationBtn.addEventListener('click', () => {
                console.log('Test notification button clicked');
                console.log('Current notification permission:', Notification.permission);

                if (Notification.permission === 'granted') {
                    console.log('Permission granted, showing test notification');
                    Notifications.testNotification();
                } else if (Notification.permission === 'default') {
                    console.log('Requesting notification permission...');
                    this.requestNotificationPermission().then(() => {
                        console.log('Permission result:', Notification.permission);
                        if (Notification.permission === 'granted') {
                            Notifications.testNotification();
                        }
                    });
                } else {
                    console.error('Notifications blocked');
                    alert('Notifications are blocked. Please enable them in your browser settings.');
                }
            });
        } else {
            console.error('Test notification button not found');
        }
    },

    setupPWAInstall() {
        const installButton = document.getElementById('install-button');

        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing
            e.preventDefault();
            // Save the event so it can be triggered later
            this.deferredPrompt = e;
            // Show install button
            installButton.style.display = 'flex';
        });

        // Install button click
        installButton.addEventListener('click', async () => {
            if (!this.deferredPrompt) return;

            // Show the install prompt
            this.deferredPrompt.prompt();

            // Wait for the user's response
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);

            // Clear the prompt
            this.deferredPrompt = null;
            installButton.style.display = 'none';
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('IstiqamahBN installed successfully');
            this.deferredPrompt = null;
            installButton.style.display = 'none';
        });
    },

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            return;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
        }
    },

    checkNotificationPermission() {
        const notificationsEnabled = localStorage.getItem('notifications_enabled') === 'true';

        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
            this.requestNotificationPermission();
        }
    },

    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    },

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.classList.remove('active');
        // Force hide with inline styles as fallback
        loadingOverlay.style.opacity = '0';
        loadingOverlay.style.pointerEvents = 'none';
        // Remove from DOM after transition
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500);
        console.log('Loading overlay hidden');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Handle online/offline events
window.addEventListener('online', () => {
    console.log('App is online');
    // Refresh prayer times when coming back online
    if (App.currentPage === 'prayer') {
        PrayerTimes.fetchPrayerTimes();
    }
});

window.addEventListener('offline', () => {
    console.log('App is offline - using cached data');
});

// Global test function for debugging
window.testNotif = function() {
    console.log('=== Testing Notification ===');
    console.log('Permission:', Notification.permission);
    
    if (Notification.permission !== 'granted') {
        console.log('Requesting permission...');
        Notification.requestPermission().then(perm => {
            console.log('Permission granted:', perm);
            if (perm === 'granted') {
                new Notification('✅ Test Works!', { body: 'Notifications are working!' });
            }
        });
    } else {
        try {
            console.log('Creating notification...');
            const n = new Notification('✅ Test Works!', { 
                body: 'Notifications are working!',
                icon: '/icons/icon-192.png'
            });
            console.log('Notification object:', n);
            console.log('✅ Notification created successfully!');
        } catch(e) {
            console.error('❌ Error creating notification:', e);
        }
    }
};

console.log('💡 Tip: Run testNotif() in console to test notifications');
