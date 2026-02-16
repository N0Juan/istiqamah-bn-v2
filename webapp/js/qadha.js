// Qadha Tracker Module
const QadhaTracker = {
    prayers: {
        suboh: { name: 'Suboh', count: 0 },
        zohor: { name: 'Zohor', count: 0 },
        asar: { name: 'Asar', count: 0 },
        maghrib: { name: 'Maghrib', count: 0 },
        isyak: { name: 'Isyak', count: 0 }
    },

    init() {
        // Load saved qadha counts
        const saved = localStorage.getItem('qadha_tracker');
        if (saved) {
            const data = JSON.parse(saved);
            Object.keys(this.prayers).forEach(key => {
                if (data[key] !== undefined) {
                    this.prayers[key].count = data[key];
                }
            });
        }

        this.render();
        this.updateTotal();
    },

    render() {
        const container = document.getElementById('qadha-prayers');
        container.innerHTML = '';

        Object.keys(this.prayers).forEach(key => {
            const prayer = this.prayers[key];
            const card = this.createPrayerCard(key, prayer);
            container.appendChild(card);
        });
    },

    createPrayerCard(key, prayer) {
        const card = document.createElement('div');
        card.className = 'qadha-prayer-item';

        const header = document.createElement('div');
        header.className = 'qadha-prayer-name';
        header.textContent = prayer.name;

        const controls = document.createElement('div');
        controls.className = 'qadha-controls';

        const decrementBtn = document.createElement('button');
        decrementBtn.className = 'qadha-btn decrement';
        decrementBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
        `;
        decrementBtn.addEventListener('click', () => this.decrement(key));

        const count = document.createElement('div');
        count.className = 'qadha-count';
        count.id = `qadha-count-${key}`;
        count.textContent = prayer.count;

        const incrementBtn = document.createElement('button');
        incrementBtn.className = 'qadha-btn increment';
        incrementBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
        `;
        incrementBtn.addEventListener('click', () => this.increment(key));

        controls.appendChild(decrementBtn);
        controls.appendChild(count);
        controls.appendChild(incrementBtn);

        card.appendChild(header);
        card.appendChild(controls);

        return card;
    },

    increment(prayerKey) {
        this.prayers[prayerKey].count++;
        this.updatePrayerDisplay(prayerKey);
        this.updateTotal();
        this.save();

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },

    decrement(prayerKey) {
        if (this.prayers[prayerKey].count > 0) {
            this.prayers[prayerKey].count--;
            this.updatePrayerDisplay(prayerKey);
            this.updateTotal();
            this.save();

            // Haptic feedback
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        }
    },

    updatePrayerDisplay(prayerKey) {
        const countEl = document.getElementById(`qadha-count-${prayerKey}`);
        if (countEl) {
            countEl.textContent = this.prayers[prayerKey].count;
        }
    },

    updateTotal() {
        const total = Object.values(this.prayers).reduce((sum, prayer) => sum + prayer.count, 0);
        document.getElementById('qadha-total').textContent = total;
    },

    save() {
        const data = {};
        Object.keys(this.prayers).forEach(key => {
            data[key] = this.prayers[key].count;
        });
        localStorage.setItem('qadha_tracker', JSON.stringify(data));
    }
};
