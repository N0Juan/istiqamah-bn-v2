# Requirements: IstiqamahBN

**Status:** DRAFT — Awaiting Review

## Functional Requirements

### FR-1: Prayer Times Display
- **Description:** Display daily prayer times (Suboh/Fajr, Zohor/Dhuhr, Asar/Asr, Maghrib, Isyak/Isha) for Brunei sourced from MORA website (https://www.mora.gov.bn/SitePages/WaktuSembahyang.aspx), with automatic district-based time adjustments
- **Priority:** Must-have
- **Acceptance Criteria:**
  - [ ] Display all 5 daily prayer times with countdown to next prayer
  - [ ] Highlight current/next prayer time prominently
  - [ ] Show Hijri date alongside Gregorian date
  - [ ] **Display selected district at top of prayer times screen**
  - [ ] **Automatically adjust prayer times based on selected district (Brunei Muara: +0, Tutong: +1 min, Belait: +3 min)**
  - [ ] Update prayer times automatically at midnight
  - [ ] Fetch prayer times from backend API endpoint
  - [ ] Cache prayer times locally for offline access (entire year)
  - [ ] Show Imsak, Syuruk (sunrise), and Doha times for reference
  - [ ] Display prayer times in 12-hour format with AM/PM
  - [ ] Backend scrapes entire year's data from MORA (2026 and future years)

### FR-2: Prayer Notifications
- **Description:** Send timely notifications for prayer start times and end time reminders to help users complete prayers before they become Qadha
- **Priority:** Must-have
- **Acceptance Criteria:**
  - [ ] Request notification permissions on first launch
  - [ ] Send notification at exact prayer time (within 1 minute accuracy)
  - [ ] **Send end time reminder notifications before prayer window closes**
  - [ ] Prayer end times calculated as: Suboh→Syuruk, Zohor→Asar, Asar→Maghrib, Maghrib→Isyak, Isyak→Midnight
  - [ ] Allow users to enable/disable start and end notifications independently per prayer
  - [ ] Customizable end time reminder advance (10, 15, 20, 30 minutes before end)
  - [ ] Provide 3-5 adhan sound options for start time notifications
  - [ ] End time reminders use gentle notification sound (different from adhan)
  - [ ] Silent notification option (banner only, no sound) for both start and end
  - [ ] Notifications include prayer name, current time, and time remaining (for end reminders)
  - [ ] **Notifications include selected district name (e.g., "Suboh starts at 5:15 AM in Brunei Muara")**
  - [ ] **Prayer times in notifications are adjusted for selected district**
  - [ ] Notifications work when app is closed/backgrounded

### FR-3: Tasbih Counter
- **Description:** Digital counter for dhikr/tasbih with customizable targets
- **Priority:** Must-have
- **Acceptance Criteria:**
  - [ ] Large tap area for easy incrementing
  - [ ] Display current count prominently
  - [ ] Set target count (33, 99, 100, custom)
  - [ ] Haptic feedback on each tap
  - [ ] Visual/audio indication when target reached
  - [ ] Reset button with confirmation
  - [ ] Save multiple tasbih types (SubhanAllah, Alhamdulillah, etc.)
  - [ ] Sync count history via iCloud
  - [ ] Optional: Track daily/weekly tasbih totals

### FR-3a: District Selection
- **Description:** Allow users to select their district in Brunei for accurate prayer time adjustments
- **Priority:** Must-have
- **Acceptance Criteria:**
  - [ ] Provide 3 district options: Brunei Muara/Temburong (+0 min), Tutong (+1 min), Belait (+3 min)
  - [ ] Default selection: Brunei Muara/Temburong
  - [ ] District selection accessible in Settings
  - [ ] Apply time offset to ALL 8 prayer times (Imsak, Suboh, Syuruk, Doha, Zohor, Asar, Maghrib, Isyak)
  - [ ] Display selected district on prayer times screen
  - [ ] Show time offset indicator for non-Brunei Muara districts (e.g., "Belait (+3 min)")
  - [ ] Sync district selection via iCloud across devices
  - [ ] Notification times automatically adjusted for selected district
  - [ ] Notification messages include district name

### FR-4: Quran Page Tracker
- **Description:** Simple tracker for Quran reading progress (604 pages)
- **Priority:** Must-have
- **Acceptance Criteria:**
  - [ ] Input field to set current page (1-604)
  - [ ] Display current Juz and Surah based on page number
  - [ ] Show progress percentage and visual progress bar
  - [ ] Quick increment buttons (+1, +5, +10 pages)
  - [ ] Track pages read per day/week/month
  - [ ] Sync progress across devices via iCloud
  - [ ] Option to set daily page reading goal
  - [ ] Gentle reminder if no progress logged in 3 days (optional)

### FR-5: Qadha Prayer Tracker
- **Description:** Track and manage missed prayers debt
- **Priority:** Must-have
- **Acceptance Criteria:**
  - [ ] Add missed prayers by type (Fajr, Dhuhr, Asr, Maghrib, Isha)
  - [ ] Manual quantity entry for bulk adding
  - [ ] Decrement counter when Qadha prayer completed
  - [ ] Display total Qadha debt prominently
  - [ ] Optional: Estimate based on age/start of obligation
  - [ ] Sync Qadha count via iCloud
  - [ ] Show breakdown by prayer type
  - [ ] Mark completed Qadha prayers with date stamp
  - [ ] Weekly/monthly Qadha completion statistics

### FR-6: Daily Hadith
- **Description:** Display encouraging hadith related to prayer and consistency
- **Priority:** Should-have
- **Acceptance Criteria:**
  - [ ] Display one hadith per day
  - [ ] Rotate through curated collection of 30-50 hadith
  - [ ] Include hadith source (Bukhari, Muslim, etc.)
  - [ ] Simple, readable typography
  - [ ] Option to share hadith text
  - [ ] Hadith focused on encouragement, not fear
  - [ ] Support English and Arabic text
  - [ ] Store hadith locally (no internet required)

### FR-7: Qibla Compass
- **Description:** Show direction to Kaaba from user's location
- **Priority:** Should-have
- **Acceptance Criteria:**
  - [ ] Request location permission only when compass accessed
  - [ ] Display compass with Qibla direction indicator
  - [ ] Show degree bearing to Qibla
  - [ ] Calculate using Brunei's standard coordinates as default
  - [ ] Update direction as device orientation changes
  - [ ] Calibration instructions if compass inaccurate
  - [ ] Works offline after initial location acquisition

### FR-8: Home Screen Widget
- **Description:** iOS widget showing next prayer time and countdown
- **Priority:** Should-have
- **Acceptance Criteria:**
  - [ ] Small, medium, and large widget sizes
  - [ ] Display next prayer name and time
  - [ ] Countdown timer to next prayer
  - [ ] Update widget in background
  - [ ] Widget matches app's minimal design language
  - [ ] Support Light and Dark mode
  - [ ] Tap widget opens app to prayer times view

### FR-9: iCloud Synchronization
- **Description:** Sync user data across all Apple devices
- **Priority:** Must-have
- **Acceptance Criteria:**
  - [ ] Sync Tasbih history and counts
  - [ ] Sync Quran page progress
  - [ ] Sync Qadha prayer tracker
  - [ ] Sync user preferences and settings
  - [ ] Automatic background sync
  - [ ] Conflict resolution (latest write wins)
  - [ ] Work offline and sync when connected
  - [ ] Notify user if iCloud not available

### FR-10: Settings & Preferences
- **Description:** User customization options
- **Priority:** Must-have
- **Acceptance Criteria:**
  - [ ] **Select district (Brunei Muara/Temburong, Tutong, Belait) with time offset display**
  - [ ] Enable/disable start time notifications per prayer
  - [ ] Enable/disable end time reminder notifications per prayer
  - [ ] Choose adhan sound for start time notifications
  - [ ] Set start notification advance time (5, 10, 15 minutes)
  - [ ] Set end time reminder advance (10, 15, 20, 30 minutes before end)
  - [ ] Toggle dark mode (or follow system)
  - [ ] Backend API endpoint configuration
  - [ ] Reset all data option
  - [ ] About section with version info
  - [ ] Privacy policy and data handling info

## Non-Functional Requirements

### NFR-1: Performance
- App launches in under 2 seconds on iPhone 12 or newer
- Prayer times view renders in under 500ms
- API calls timeout after 10 seconds with graceful fallback to cache
- Widget updates complete within 5 seconds
- Smooth 60fps animations throughout
- Tasbih counter responds to taps within 50ms

### NFR-2: Security & Privacy
- No analytics or tracking whatsoever
- All personal data stored locally or in user's iCloud
- Backend API calls use HTTPS only
- No third-party SDKs or data sharing
- Location data used only for Qibla compass, never stored
- Prayer times data cached locally, not shared
- Clear privacy policy stating no data collection

### NFR-3: Usability
- No onboarding tutorial required - UI is self-explanatory
- All text uses system Dynamic Type for accessibility
- Support VoiceOver for visually impaired users
- High contrast mode support
- Large touch targets (minimum 44x44 points)
- Clear visual hierarchy with minimal cognitive load
- Haptic feedback for important actions
- Error messages are helpful and encouraging, never blaming

### NFR-4: Reliability
- 95%+ crash-free rate
- Graceful degradation if backend API unavailable
- Local cache prevents complete failure
- iCloud sync failures don't block app usage
- Automatic retry for failed API calls (3 attempts)
- Data validation prevents corruption

### NFR-5: Compatibility
- iOS 16.0+ and iPadOS 16.0+
- iPhone SE (3rd gen) to iPhone 15 Pro Max
- iPad (9th gen) and newer
- Support both portrait and landscape on iPad
- Optimized for all screen sizes

### NFR-6: Maintainability
- Clean SwiftUI architecture with MVVM pattern
- Comprehensive code comments for complex logic
- Unit tests for business logic (target 70%+ coverage)
- UI tests for critical user flows
- Modular design for easy feature additions
- No third-party dependencies where possible

## API Endpoints

| Method | Endpoint | Description | Auth Required | Response Format |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/v1/prayer-times/brunei/year/:year` | Get entire year's prayer times | No | JSON |
| GET | `/api/v1/prayer-times/brunei/today` | Get today's prayer times | No | JSON |
| GET | `/api/v1/prayer-times/brunei/:date` | Get prayer times for specific date | No | JSON |
| GET | `/api/health` | Backend health check | No | JSON |

### Prayer Times API Response Schema

**Single Day Response** (for `/today` and `/:date` endpoints):
```json
{
  "date": "2026-02-16",
  "hijriDate": "16 Sha'ban 1447",
  "location": "Brunei Darussalam",
  "prayerTimes": {
    "imsak": "05:15",
    "suboh": "05:25",
    "syuruk": "06:45",
    "doha": "07:00",
    "zohor": "12:40",
    "asar": "15:55",
    "maghrib": "18:50",
    "isyak": "20:00"
  },
  "timezone": "Asia/Brunei",
  "source": "MORA Brunei"
}
```

**Full Year Response** (for `/year/:year` endpoint):
```json
{
  "year": 2026,
  "location": "Brunei Darussalam",
  "timezone": "Asia/Brunei",
  "source": "MORA Brunei",
  "lastUpdated": "2026-01-01T00:00:00Z",
  "prayerTimes": [
    {
      "date": "2026-01-01",
      "hijriDate": "1 Rajab 1447",
      "prayerTimes": {
        "imsak": "05:10",
        "suboh": "05:20",
        "syuruk": "06:40",
        "doha": "06:55",
        "zohor": "12:35",
        "asar": "15:50",
        "maghrib": "18:45",
        "isyak": "19:55"
      }
    },
    // ... 365 entries for the full year
  ]
}
```

## Data Models

### PrayerTime
- date: Date
- hijriDate: String
- imsak: Date
- suboh: Date (Fajr)
- syuruk: Date (Sunrise)
- doha: Date
- zohor: Date (Dhuhr)
- asar: Date (Asr)
- maghrib: Date
- isyak: Date (Isha)
- lastUpdated: Date

### TasbihSession
- id: UUID
- dhikrType: String (e.g., "SubhanAllah", "Alhamdulillah")
- count: Int
- target: Int
- date: Date
- completedAt: Date?

### QuranProgress
- currentPage: Int (1-604)
- currentJuz: Int (calculated)
- currentSurah: String (calculated)
- lastUpdated: Date
- pagesReadToday: Int
- pagesReadThisWeek: Int
- dailyGoal: Int?

### QadhaPrayer
- id: UUID
- prayerType: String (Fajr, Dhuhr, Asr, Maghrib, Isha)
- quantity: Int
- addedDate: Date
- completedDate: Date?
- notes: String?

### UserSettings
- selectedDistrict: District (bruneiMuara, tutong, belait)
- notificationsEnabled: Bool
- notificationSound: String
- notificationAdvanceMinutes: Int
- endTimeRemindersEnabled: Bool
- endTimeReminderAdvanceMinutes: Int (10, 15, 20, or 30)
- perPrayerStartNotifications: [PrayerType: Bool] (enable/disable start per prayer)
- perPrayerEndReminders: [PrayerType: Bool] (enable/disable end reminder per prayer)
- darkModePreference: String (system/light/dark)
- backendAPIEndpoint: String
- selectedLanguage: String

### District (Enum)
- bruneiMuara: String = "Brunei Muara / Temburong"
- tutong: String = "Tutong"
- belait: String = "Belait"
- offsetMinutes: Int (computed property: 0, 1, or 3)
