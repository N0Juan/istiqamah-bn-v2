// Quran Progress Tracker Module
const QuranTracker = {
    currentPage: 1,
    totalPages: 604,

    // Juz boundaries (starting pages)
    juzBoundaries: [
        1, 22, 42, 62, 82, 102, 122, 142, 162, 182,
        202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
        402, 422, 442, 462, 482, 502, 522, 542, 562, 582
    ],

    init() {
        // Load saved progress
        const saved = localStorage.getItem('quran_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.currentPage = progress.currentPage || 1;
        }

        this.updateDisplay();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Page input
        const pageInput = document.getElementById('quran-page-input');
        pageInput.addEventListener('input', (e) => {
            let page = parseInt(e.target.value);
            if (isNaN(page)) return;

            // Clamp to valid range
            page = Math.max(1, Math.min(this.totalPages, page));
            this.setPage(page);
        });

        pageInput.addEventListener('blur', (e) => {
            // Ensure valid value on blur
            if (!e.target.value || parseInt(e.target.value) < 1) {
                e.target.value = this.currentPage;
            }
        });

        // Quick action buttons
        document.querySelectorAll('.quran-quick-actions .quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const increment = parseInt(e.target.dataset.increment);
                this.incrementPage(increment);
            });
        });
    },

    setPage(page) {
        // Clamp to valid range
        this.currentPage = Math.max(1, Math.min(this.totalPages, page));
        this.updateDisplay();
        this.save();
    },

    incrementPage(amount) {
        this.setPage(this.currentPage + amount);
    },

    getCurrentJuz() {
        // Find which Juz the current page belongs to
        for (let i = this.juzBoundaries.length - 1; i >= 0; i--) {
            if (this.currentPage >= this.juzBoundaries[i]) {
                return i + 1;
            }
        }
        return 1;
    },

    getProgressPercentage() {
        return ((this.currentPage / this.totalPages) * 100).toFixed(1);
    },

    updateDisplay() {
        // Update page display
        document.getElementById('quran-current-page').textContent = this.currentPage;
        document.getElementById('quran-page-input').value = this.currentPage;

        // Update percentage
        const percentage = this.getProgressPercentage();
        document.getElementById('quran-percentage').textContent = `${percentage}%`;

        // Update Juz
        const currentJuz = this.getCurrentJuz();
        document.getElementById('current-juz').textContent = `Juz ${currentJuz}`;

        // Update circular progress
        const progressCircle = document.getElementById('quran-progress-circle');
        if (progressCircle) {
            const circumference = 534.07; // 2 * π * 85
            const progress = this.currentPage / this.totalPages;
            const offset = circumference - (progress * circumference);

            progressCircle.style.strokeDashoffset = offset;
        }

        // Visual feedback for milestones
        if (this.currentPage === this.totalPages) {
            this.onCompletion();
        }
    },

    onCompletion() {
        // Celebrate Quran completion
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Quran Completed! 🎉', {
                body: 'Alhamdulillah! You have completed reading the Quran.',
                icon: '/icons/icon-192.png'
            });
        }

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    },

    save() {
        localStorage.setItem('quran_progress', JSON.stringify({
            currentPage: this.currentPage,
            lastUpdated: new Date().toISOString()
        }));
    }
};
