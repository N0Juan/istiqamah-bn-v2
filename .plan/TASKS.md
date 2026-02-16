# Tasks: IstiqamahBN

**Status:** APPROVED

## Task Overview
Total tasks: 126 tasks across 6 phases

## Phase 1: Project Setup & Infrastructure (12 tasks)

### Backend Setup
- [ ] **T-001:** Initialize backend project directory structure
- [ ] **T-002:** Create `requirements.txt` with FastAPI, uvicorn, beautifulsoup4, requests, hijri-converter dependencies
- [ ] **T-003:** Write Dockerfile with Python 3.11-slim base image
- [ ] **T-004:** Create docker-compose.yml with service definition, port mapping (8000), and volume mounts
- [ ] **T-005:** Implement basic FastAPI app in `main.py` with health check endpoint (`/api/health`)
- [ ] **T-006:** Create `.env.example` template with environment variables (API_URL, TIMEZONE, etc.)

### iOS Project Setup
- [ ] **T-007:** Create new Xcode project with SwiftUI + Swift, minimum iOS 16.0 deployment target
- [ ] **T-008:** Configure app Bundle ID (`com.n0juan.istiqamahbn`) and signing team
- [ ] **T-009:** Set up project folder structure (Features/, Core/, Shared/, Resources/)
- [ ] **T-010:** Configure SwiftLint with `.swiftlint.yml` file
- [ ] **T-011:** Create `.gitignore` for Xcode (exclude xcuserdata, DerivedData, .DS_Store)
- [ ] **T-012:** Set up app capabilities: iCloud (CloudKit), Push Notifications, Background Modes, App Groups

## Phase 2: Backend Development (15 tasks)

### MORA Scraper Implementation
- [ ] **T-013:** Implement MORA website scraper in `scrapers/mora_scraper.py` for https://www.mora.gov.bn/SitePages/WaktuSembahyang.aspx
- [ ] **T-014:** Parse entire year's prayer times table from HTML (Imsak, Suboh, Syuruk, Doha, Zohor, Asar, Maghrib, Isyak)
- [ ] **T-015:** Implement Hijri date converter using `hijri-converter` library
- [ ] **T-016:** Store all 365+ prayer times entries in SQLite database with date indexing
- [ ] **T-017:** Add error handling for network failures and parsing errors
- [ ] **T-018:** Write unit tests for scraper (`tests/test_scraper.py`)

### API Endpoints
- [ ] **T-019:** Implement `/api/v1/prayer-times/brunei/year/:year` GET endpoint (returns full year's data)
- [ ] **T-020:** Implement `/api/v1/prayer-times/brunei/today` GET endpoint (returns today's prayer times)
- [ ] **T-021:** Implement `/api/v1/prayer-times/brunei/:date` GET endpoint (returns specific date)
- [ ] **T-022:** Create Pydantic response models (`PrayerTimeResponse`, `YearlyPrayerTimesResponse`) with validation
- [ ] **T-023:** Add in-memory caching with 24-hour TTL for single-day responses
- [ ] **T-024:** Write API endpoint tests (`tests/test_api.py`)

### Backend Deployment
- [ ] **T-025:** Build Docker image and test locally
- [ ] **T-026:** Create deployment README with setup instructions
- [ ] **T-027:** Implement yearly cron job for automatic full year scrape (January 1st) + manual trigger endpoint

## Phase 3: Core iOS Features (28 tasks)

### Core Infrastructure
- [ ] **T-028:** Implement `NetworkManager.swift` with URLSession, async/await, error handling
- [ ] **T-029:** Create `APIEndpoint.swift` enum with backend URL configuration (including `/year/:year` endpoint)
- [ ] **T-030:** Implement `PersistenceController.swift` with SwiftData/Core Data setup
- [ ] **T-031:** Configure CloudKit container (`iCloud.com.n0juan.istiqamahbn`)
- [ ] **T-032:** Implement `CloudKitManager.swift` for iCloud sync orchestration
- [ ] **T-033:** Create `CacheManager.swift` for local prayer times caching (full year data)
- [ ] **T-034:** Implement `Logger.swift` wrapper around OSLog

### Prayer Times Feature
- [ ] **T-035:** Create `PrayerTime.swift` model with all fields (Imsak, Suboh, Syuruk, Doha, Zohor, Asar, Maghrib, Isyak)
- [ ] **T-036:** Implement `PrayerTimesViewModel.swift` with fetch full year, cache, and state management
- [ ] **T-037:** Build `PrayerTimesView.swift` UI with prayer list and Hijri date
- [ ] **T-038:** Create `NextPrayerCountdownView.swift` with live countdown timer
- [ ] **T-039:** Implement automatic yearly data refresh (January 1st) or manual pull-to-refresh
- [ ] **T-040:** Add pull-to-refresh gesture to fetch latest year's data
- [ ] **T-041:** Handle offline mode with cached full year data and empty state

### Notification System
- [ ] **T-042:** Implement `NotificationManager.swift` wrapper for UNUserNotificationCenter
- [ ] **T-043:** Request notification permissions on first launch
- [ ] **T-044:** Implement `NotificationScheduler.swift` to schedule prayer start time notifications for 5 main prayers
- [ ] **T-045:** Implement end time reminder notifications (before prayer window closes)
- [ ] **T-046:** Calculate prayer end times (Suboh→Syuruk, Zohor→Asar, Asar→Maghrib, Maghrib→Isyak, Isyak→Midnight)
- [ ] **T-047:** Add custom adhan sound files to `Resources/Sounds/` (3-5 options)
- [ ] **T-048:** Add gentle reminder sound for end time notifications (distinct from adhan)
- [ ] **T-049:** Create notification settings UI (enable/disable start/end per prayer, sound selection)
- [ ] **T-050:** Implement advance notification for start times (5, 10, 15 minutes before)
- [ ] **T-051:** Implement customizable end time reminder advance (10, 15, 20, 30 minutes before end)
- [ ] **T-052:** Test notification delivery when app is closed/backgrounded for both start and end notifications

### App Navigation
- [ ] **T-053:** Implement `ContentView.swift` with TabView navigation (Prayer Times, Tasbih, Quran, Qadha, Settings)
- [ ] **T-054:** Add SF Symbols icons for each tab

## Phase 4: Tracking Features (16 tasks)

### Tasbih Counter
- [ ] **T-055:** Create `TasbihSession.swift` model with CloudKit sync
- [ ] **T-056:** Implement `TasbihViewModel.swift` with increment, reset, history logic
- [ ] **T-057:** Build `TasbihView.swift` with large tap area and haptic feedback
- [ ] **T-058:** Add target count selection (33, 99, 100, custom)
- [ ] **T-059:** Implement visual/audio completion indicator when target reached
- [ ] **T-060:** Create `TasbihHistoryView.swift` showing daily/weekly totals
- [ ] **T-061:** Test iCloud sync of tasbih sessions across devices

### Quran Page Tracker
- [ ] **T-062:** Create `QuranProgress.swift` model with CloudKit sync
- [ ] **T-063:** Implement `QuranTrackerViewModel.swift` with page updates and statistics
- [ ] **T-064:** Build `QuranTrackerView.swift` with current page input (1-604)
- [ ] **T-065:** Add Juz and Surah lookup based on page number (create mapping data)
- [ ] **T-066:** Implement quick increment buttons (+1, +5, +10 pages)
- [ ] **T-067:** Create `ProgressChartView.swift` showing visual progress bar and percentage
- [ ] **T-068:** Add daily/weekly reading statistics
- [ ] **T-069:** Test iCloud sync of Quran progress

### Qadha Tracker
- [ ] **T-070:** Create `QadhaPrayer.swift` model with CloudKit sync
- [ ] **T-071:** Implement `QadhaViewModel.swift` with add, complete, delete logic
- [ ] **T-072:** Build `QadhaTrackerView.swift` showing total debt by prayer type
- [ ] **T-073:** Create `AddQadhaView.swift` sheet for adding missed prayers (bulk entry)
- [ ] **T-074:** Implement decrement functionality when Qadha prayer completed
- [ ] **T-075:** Add `QadhaHistoryView.swift` showing completed prayers with dates
- [ ] **T-076:** Display weekly/monthly completion statistics
- [ ] **T-077:** Test iCloud sync of Qadha data

## Phase 5: Additional Features & Polish (15 tasks)

### Hadith Feature
- [ ] **T-078:** Curate 30-50 encouraging hadith about prayer and consistency
- [ ] **T-079:** Create `hadith_collection.json` with hadith text, source, and translation
- [ ] **T-080:** Create `Hadith.swift` model
- [ ] **T-081:** Implement `HadithViewModel.swift` with daily rotation logic
- [ ] **T-082:** Build `DailyHadithView.swift` with clean typography
- [ ] **T-083:** Add share functionality for hadith text

### Qibla Compass
- [ ] **T-084:** Implement `LocationManager.swift` wrapper for CLLocationManager
- [ ] **T-085:** Create `QiblaCalculator.swift` to calculate bearing to Kaaba from coordinates
- [ ] **T-086:** Implement `QiblaViewModel.swift` with heading updates
- [ ] **T-087:** Build `QiblaCompassView.swift` with compass UI and direction indicator
- [ ] **T-088:** Request location permission only when compass view accessed
- [ ] **T-089:** Add calibration instructions for inaccurate compass

### Widget Extension
- [ ] **T-090:** Create Widget Extension target (`IstiqamahBNWidget`)
- [ ] **T-091:** Configure App Group (`group.com.n0juan.istiqamahbn`) for data sharing
- [ ] **T-092:** Implement `PrayerTimeWidget.swift` with small, medium, large sizes
- [ ] **T-093:** Create timeline provider for automatic widget updates
- [ ] **T-094:** Design widget UI matching app's minimal aesthetic
- [ ] **T-095:** Test widget updates and deep linking to app

### Settings & Preferences
- [ ] **T-096:** Create `UserSettings.swift` model with UserDefaults persistence (including end reminder settings)
- [ ] **T-097:** Implement `SettingsViewModel.swift`
- [ ] **T-098:** Build `SettingsView.swift` with notification toggles, sound selection, dark mode preference
- [ ] **T-099:** Create `NotificationSettingsView.swift` for per-prayer start/end notification control
- [ ] **T-100:** Add end time reminder advance time selector (10, 15, 20, 30 minutes)
- [ ] **T-101:** Add backend API endpoint configuration option
- [ ] **T-102:** Create `AboutView.swift` with app version, privacy policy, acknowledgments

## Phase 6: Testing, Documentation & Release (14 tasks)

### Testing
- [ ] **T-103:** Write unit tests for `PrayerTimesViewModel` (`IstiqamahBNTests/ViewModelTests/`)
- [ ] **T-104:** Write unit tests for `TasbihViewModel`, `QuranTrackerViewModel`, `QadhaViewModel`
- [ ] **T-105:** Write unit tests for `NetworkManager` with mock responses
- [ ] **T-106:** Write unit tests for `HijriCalendar`, `QiblaCalculator` utilities
- [ ] **T-107:** Write unit tests for prayer end time calculation logic
- [ ] **T-108:** Create UI tests for critical flows: view prayer times, add Qadha, increment Tasbih
- [ ] **T-109:** Test iCloud sync across multiple devices (iPhone + iPad)
- [ ] **T-110:** Test start and end time notifications on physical device
- [ ] **T-111:** Test offline mode functionality with cached full year data

### Accessibility & Polish
- [ ] **T-112:** Audit all views for VoiceOver labels and hints
- [ ] **T-113:** Test with Dynamic Type (largest accessibility sizes)
- [ ] **T-114:** Verify high contrast mode support
- [ ] **T-115:** Add haptic feedback to all interactive elements
- [ ] **T-116:** Final UI polish: spacing, colors, typography consistency

### Documentation
- [ ] **T-117:** Write main `README.md` with project overview and features (including end time reminders)
- [ ] **T-118:** Create `docs/SETUP.md` with development setup instructions
- [ ] **T-119:** Write `docs/DEPLOYMENT.md` for backend Docker deployment
- [ ] **T-120:** Create `docs/API.md` documenting backend API endpoints with all prayer time fields
- [ ] **T-121:** Write `docs/PRIVACY.md` privacy policy (no data collection statement)

### Release Preparation
- [ ] **T-122:** Generate app screenshots for App Store (if publishing)
- [ ] **T-123:** Create app icon in all required sizes (Assets.xcassets)
- [ ] **T-124:** Set up TestFlight for beta testing
- [ ] **T-125:** Conduct final QA pass on physical devices
- [ ] **T-126:** Archive and submit to TestFlight / App Store

## Task Dependencies

### Critical Path Dependencies:
- **T-007** (Create Xcode project) must complete before any iOS tasks
- **T-001-006** (Backend setup) must complete before **T-013** (scraper implementation)
- **T-013-018** (MORA scraper and database) must complete before **T-019-024** (API endpoints)
- **T-028-034** (Core infrastructure) must complete before feature implementations (T-035+)
- **T-035-041** (Prayer Times feature) should complete before **T-042-052** (notifications with end time reminders)
- **T-012** (App capabilities) must complete before **T-031** (CloudKit configuration)
- **T-086-087** (Widget target setup) must complete before **T-088-091** (widget implementation)

### Recommended Order:
1. Complete all Phase 1 (Setup) tasks first
2. Complete Phase 2 (Backend) in parallel with Phase 3 Core Infrastructure (T-026 to T-032)
3. Implement Prayer Times feature (T-033 to T-039) as it's the core functionality
4. Implement Notification System (T-040 to T-046) to enable prayer reminders
5. Implement tracking features (Phase 4) in any order - they're independent
6. Add polish features (Phase 5) once core features stable
7. Testing and documentation (Phase 6) continuously throughout, finalize at end

### Parallel Work Opportunities:
- Backend development (Phase 2) can proceed independently from iOS UI work
- Hadith curation (T-072) can happen anytime before T-073
- Documentation can be written as features complete
- UI/UX design for different features can happen in parallel

## Estimated Effort (Rough)
- **Phase 1 (Setup):** 2-3 hours
- **Phase 2 (Backend):** 8-10 hours (increased due to full year scraping complexity)
- **Phase 3 (Core iOS):** 14-18 hours (increased due to end time reminder notifications)
- **Phase 4 (Tracking):** 10-12 hours
- **Phase 5 (Additional):** 8-10 hours
- **Phase 6 (Testing/Docs):** 6-8 hours

**Total:** ~48-61 hours of focused development time

## Notes
- Tasks marked "Test iCloud sync" require Apple Developer account and physical devices
- Backend deployment (T-023, T-024) requires access to user's server
- Some tasks may be split into smaller subtasks during implementation
- Priority should be given to Must-have features (FR-1, FR-2, FR-3, FR-4, FR-5, FR-9, FR-10)
- Should-have features (FR-6, FR-7, FR-8) can be deferred to v1.1 if time constrained
