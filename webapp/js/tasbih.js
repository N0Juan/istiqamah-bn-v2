// Tasbih Counter Module
const Tasbih = {
    count: 0,
    target: 33,
    history: [],

    init() {
        // Load saved state
        const saved = localStorage.getItem('tasbih_state');
        if (saved) {
            const state = JSON.parse(saved);
            this.count = state.count || 0;
            this.target = state.target || 33;
        }

        this.updateDisplay();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Main counter button
        document.getElementById('tasbih-button').addEventListener('click', () => {
            this.increment();
        });

        // Target buttons
        document.querySelectorAll('.target-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetValue = e.target.dataset.target;

                if (targetValue === 'custom') {
                    const custom = prompt('Enter custom target:', this.target);
                    if (custom && !isNaN(custom)) {
                        this.setTarget(parseInt(custom));
                    }
                } else {
                    this.setTarget(parseInt(targetValue));
                }

                // Update active state
                document.querySelectorAll('.target-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Reset button
        document.getElementById('tasbih-reset').addEventListener('click', () => {
            if (confirm('Reset counter to 0?')) {
                this.reset();
            }
        });
    },

    increment() {
        this.count++;

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }

        // Check if target reached
        if (this.count === this.target) {
            this.onTargetReached();
        }

        this.updateDisplay();
        this.save();
    },

    setTarget(newTarget) {
        this.target = newTarget;
        document.getElementById('tasbih-target-display').textContent = this.target;
        this.updateDisplay();
        this.save();
    },

    reset() {
        // Save to history
        if (this.count > 0) {
            this.history.push({
                count: this.count,
                target: this.target,
                date: new Date().toISOString()
            });
            localStorage.setItem('tasbih_history', JSON.stringify(this.history));
        }

        this.count = 0;
        this.updateDisplay();
        this.save();
    },

    updateDisplay() {
        document.getElementById('tasbih-count').textContent = this.count;
        document.getElementById('tasbih-target-display').textContent = this.target;

        // Update circular progress
        const progress = (this.count / this.target) * 100;
        const circle = document.getElementById('tasbih-progress-circle');
        const circumference = 534.07; // 2 * π * 85
        const offset = circumference - (progress / 100) * circumference;

        if (circle) {
            circle.style.strokeDashoffset = offset;
        }
    },

    onTargetReached() {
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100, 50, 100]);
        }

        // Visual feedback
        const button = document.getElementById('tasbih-button');
        button.style.transform = 'scale(1.1)';
        setTimeout(() => {
            button.style.transform = '';
        }, 300);

        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Target Reached!', {
                body: `Subhanallah! You've completed ${this.target} tasbih.`,
                icon: '/icons/icon-192.png'
            });
        }
    },

    save() {
        localStorage.setItem('tasbih_state', JSON.stringify({
            count: this.count,
            target: this.target
        }));
    }
};

// Add gradient for SVG circle
document.addEventListener('DOMContentLoaded', () => {
    const svg = document.querySelector('.tasbih-circle');
    if (svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'tasbih-gradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('style', 'stop-color:#0F4C5C;stop-opacity:1');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('style', 'stop-color:#5C8D89;stop-opacity:1');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.insertBefore(defs, svg.firstChild);
    }
});
