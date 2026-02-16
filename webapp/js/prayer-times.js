// Prayer Times Module
const PrayerTimes = {
    districts: {
        bruneiMuara: { name: 'Brunei Muara / Temburong', offset: 0 },
        tutong: { name: 'Tutong', offset: 1 },
        belait: { name: 'Belait', offset: 3 }
    },

    prayerNames: {
        imsak: 'Imsak',
        suboh: 'Suboh',
        syuruk: 'Syuruk',
        doha: 'Doha',
        zohor: 'Zohor',
        asar: 'Asar',
        maghrib: 'Maghrib',
        isyak: 'Isyak'
    },

    mainPrayers: ['suboh', 'zohor', 'asar', 'maghrib', 'isyak'],

    currentPrayerTimes: null,
    selectedDistrict: 'bruneiMuara',
    countdownInterval: null,

    async init() {
        // Load saved district
        const savedDistrict = localStorage.getItem('selected_district');
        if (savedDistrict) {
            this.selectedDistrict = savedDistrict;
            document.getElementById('district-select').value = savedDistrict;
        }

        // Setup event listeners
        document.getElementById('district-select').addEventListener('change', (e) => {
            this.selectedDistrict = e.target.value;
            localStorage.setItem('selected_district', this.selectedDistrict);
            this.updateDisplay();
        });

        // Fetch and display prayer times
        await this.fetchPrayerTimes();

        // Start countdown
        this.startCountdown();

        // Update date display
        this.updateDateDisplay();
    },

    async fetchPrayerTimes() {
        try {
            console.log('Fetching prayer times from API...');
            const data = await API.getTodayPrayerTimes();
            console.log('Prayer times received:', data);
            this.currentPrayerTimes = data;

            // Cache for offline
            localStorage.setItem('cached_today_prayer_times', JSON.stringify(data));

            this.updateDisplay();
        } catch (error) {
            console.error('Failed to fetch prayer times:', error);

            // Try to load from cache
            const cached = localStorage.getItem('cached_today_prayer_times');
            if (cached) {
                console.log('Using cached prayer times');
                this.currentPrayerTimes = JSON.parse(cached);
                this.updateDisplay();
            } else {
                console.error('No cached prayer times available');
                this.showError('Unable to load prayer times. Please check your connection.');
            }
        }
    },

    applyDistrictOffset(timeStr) {
        if (!timeStr) return '00:00';

        const offset = this.districts[this.selectedDistrict].offset;
        if (offset === 0) return timeStr;

        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes + offset, 0, 0);

        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },

    formatTime12Hour(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
    },

    updateDisplay() {
        if (!this.currentPrayerTimes) return;

        const grid = document.getElementById('prayer-times-grid');
        grid.innerHTML = '';

        const times = this.currentPrayerTimes.prayer_times;

        // Create cards for all prayer times
        Object.entries(times).forEach(([key, time]) => {
            const adjustedTime = this.applyDistrictOffset(time);
            const card = this.createPrayerCard(key, adjustedTime);
            grid.appendChild(card);
        });

        // Update next prayer
        this.updateNextPrayer();
    },

    createPrayerCard(prayerKey, time) {
        const card = document.createElement('div');
        card.className = 'prayer-time-card';
        card.dataset.prayer = prayerKey;

        const nameEl = document.createElement('div');
        nameEl.className = 'prayer-name';
        nameEl.textContent = this.prayerNames[prayerKey];

        const timeEl = document.createElement('div');
        timeEl.className = 'prayer-time';
        timeEl.textContent = this.formatTime12Hour(time);

        card.appendChild(nameEl);
        card.appendChild(timeEl);

        return card;
    },

    updateNextPrayer() {
        if (!this.currentPrayerTimes) return;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const times = this.currentPrayerTimes.prayer_times;
        let nextPrayer = null;
        let nextPrayerTime = null;

        // Find next main prayer
        for (const prayer of this.mainPrayers) {
            const adjustedTime = this.applyDistrictOffset(times[prayer]);
            const [hours, minutes] = adjustedTime.split(':').map(Number);
            const prayerMinutes = hours * 60 + minutes;

            if (prayerMinutes > currentTime) {
                nextPrayer = prayer;
                nextPrayerTime = adjustedTime;
                break;
            }
        }

        // If no prayer found (past Isyak), next is Suboh tomorrow
        if (!nextPrayer) {
            nextPrayer = 'suboh';
            nextPrayerTime = this.applyDistrictOffset(times.suboh);
        }

        // Update UI
        document.getElementById('next-prayer-name').textContent = this.prayerNames[nextPrayer];
        document.getElementById('next-prayer-time').textContent = this.formatTime12Hour(nextPrayerTime);

        // Highlight current prayer card
        document.querySelectorAll('.prayer-time-card').forEach(card => {
            card.classList.remove('current');
        });
        document.querySelector(`[data-prayer="${nextPrayer}"]`)?.classList.add('current');
    },

    startCountdown() {
        this.updateCountdown();
        this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
    },

    updateCountdown() {
        if (!this.currentPrayerTimes) return;

        const now = new Date();
        const times = this.currentPrayerTimes.prayer_times;

        // Find next prayer time
        let nextPrayerTime = null;
        for (const prayer of this.mainPrayers) {
            const adjustedTime = this.applyDistrictOffset(times[prayer]);
            const [hours, minutes] = adjustedTime.split(':').map(Number);

            const prayerDate = new Date();
            prayerDate.setHours(hours, minutes, 0, 0);

            if (prayerDate > now) {
                nextPrayerTime = prayerDate;
                break;
            }
        }

        // If past all prayers, count to tomorrow's Suboh
        if (!nextPrayerTime) {
            const adjustedTime = this.applyDistrictOffset(times.suboh);
            const [hours, minutes] = adjustedTime.split(':').map(Number);

            nextPrayerTime = new Date();
            nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
            nextPrayerTime.setHours(hours, minutes, 0, 0);
        }

        const diff = nextPrayerTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.querySelector('.countdown-hours').textContent = String(hours).padStart(2, '0');
        document.querySelector('.countdown-minutes').textContent = String(minutes).padStart(2, '0');
        document.querySelector('.countdown-seconds').textContent = String(seconds).padStart(2, '0');
    },

    updateDateDisplay() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', options);

        const hijriDate = this.currentPrayerTimes?.hijri_date || '';

        document.getElementById('current-date').textContent = `${dateStr}${hijriDate ? ' • ' + hijriDate : ''}`;
    },

    showError(message) {
        // Simple error display
        console.error(message);
    }
};
