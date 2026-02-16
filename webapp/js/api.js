// API Client for IstiqamahBN Backend
const API = {
    // Use relative URL - nginx will proxy /api to backend
    baseURL: '',

    // Fetch today's prayer times
    async getTodayPrayerTimes() {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/prayer-times/brunei/today`);
            if (!response.ok) throw new Error('Failed to fetch prayer times');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Return cached data if available
            const cached = localStorage.getItem('cached_today_prayer_times');
            if (cached) {
                return JSON.parse(cached);
            }
            throw error;
        }
    },

    // Fetch prayer times for a specific date
    async getPrayerTimesByDate(dateStr) {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/prayer-times/brunei/${dateStr}`);
            if (!response.ok) throw new Error('Failed to fetch prayer times');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Fetch full year prayer times
    async getYearPrayerTimes(year) {
        try {
            const cacheKey = `year_prayer_times_${year}`;
            const cached = localStorage.getItem(cacheKey);

            // Check if cached and less than 1 day old
            if (cached) {
                const cachedData = JSON.parse(cached);
                const cacheAge = Date.now() - cachedData.timestamp;
                if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
                    return cachedData.data;
                }
            }

            const response = await fetch(`${this.baseURL}/api/v1/prayer-times/brunei/year/${year}`);
            if (!response.ok) throw new Error('Failed to fetch year prayer times');

            const data = await response.json();

            // Cache the response
            localStorage.setItem(cacheKey, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));

            return data;
        } catch (error) {
            console.error('API Error:', error);

            // Try to return cached data even if expired
            const cacheKey = `year_prayer_times_${year}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                return JSON.parse(cached).data;
            }

            throw error;
        }
    },

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/api/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'offline' };
        }
    }
};
