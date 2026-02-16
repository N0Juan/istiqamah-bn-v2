# Project Structure: IstiqamahBN

**Status:** DRAFT — Awaiting Review

## Directory Layout

```
istiqamah-bn/
├── .plan/                           # Planning documents (this folder)
│   ├── PROJECT_PLAN.md
│   ├── REQUIREMENTS.md
│   ├── TECH_STACK.md
│   ├── STRUCTURE.md
│   └── TASKS.md
│
├── IstiqamahBN/                     # iOS App (Xcode project root)
│   ├── IstiqamahBN.xcodeproj        # Xcode project file
│   ├── IstiqamahBN/                 # Main app target
│   │   ├── App/
│   │   │   ├── IstiqamahBNApp.swift           # App entry point
│   │   │   ├── ContentView.swift              # Root navigation view
│   │   │   └── AppEnvironment.swift           # Global app state
│   │   │
│   │   ├── Features/                          # Feature modules (MVVM)
│   │   │   ├── PrayerTimes/
│   │   │   │   ├── Views/
│   │   │   │   │   ├── PrayerTimesView.swift
│   │   │   │   │   ├── PrayerRowView.swift
│   │   │   │   │   └── NextPrayerCountdownView.swift
│   │   │   │   ├── ViewModels/
│   │   │   │   │   └── PrayerTimesViewModel.swift
│   │   │   │   └── Models/
│   │   │   │       └── PrayerTime.swift
│   │   │   │
│   │   │   ├── Tasbih/
│   │   │   │   ├── Views/
│   │   │   │   │   ├── TasbihView.swift
│   │   │   │   │   └── TasbihHistoryView.swift
│   │   │   │   ├── ViewModels/
│   │   │   │   │   └── TasbihViewModel.swift
│   │   │   │   └── Models/
│   │   │   │       └── TasbihSession.swift
│   │   │   │
│   │   │   ├── QuranTracker/
│   │   │   │   ├── Views/
│   │   │   │   │   ├── QuranTrackerView.swift
│   │   │   │   │   └── ProgressChartView.swift
│   │   │   │   ├── ViewModels/
│   │   │   │   │   └── QuranTrackerViewModel.swift
│   │   │   │   └── Models/
│   │   │   │       └── QuranProgress.swift
│   │   │   │
│   │   │   ├── Qadha/
│   │   │   │   ├── Views/
│   │   │   │   │   ├── QadhaTrackerView.swift
│   │   │   │   │   ├── AddQadhaView.swift
│   │   │   │   │   └── QadhaHistoryView.swift
│   │   │   │   ├── ViewModels/
│   │   │   │   │   └── QadhaViewModel.swift
│   │   │   │   └── Models/
│   │   │   │       └── QadhaPrayer.swift
│   │   │   │
│   │   │   ├── Hadith/
│   │   │   │   ├── Views/
│   │   │   │   │   └── DailyHadithView.swift
│   │   │   │   ├── ViewModels/
│   │   │   │   │   └── HadithViewModel.swift
│   │   │   │   └── Models/
│   │   │   │       └── Hadith.swift
│   │   │   │
│   │   │   ├── Qibla/
│   │   │   │   ├── Views/
│   │   │   │   │   └── QiblaCompassView.swift
│   │   │   │   ├── ViewModels/
│   │   │   │   │   └── QiblaViewModel.swift
│   │   │   │   └── Services/
│   │   │   │       └── QiblaCalculator.swift
│   │   │   │
│   │   │   └── Settings/
│   │   │       ├── Views/
│   │   │       │   ├── SettingsView.swift
│   │   │       │   ├── NotificationSettingsView.swift
│   │   │       │   └── AboutView.swift
│   │   │       ├── ViewModels/
│   │   │       │   └── SettingsViewModel.swift
│   │   │       └── Models/
│   │   │           └── UserSettings.swift
│   │   │
│   │   ├── Core/                              # Core infrastructure
│   │   │   ├── Networking/
│   │   │   │   ├── NetworkManager.swift       # API client
│   │   │   │   ├── APIEndpoint.swift          # Endpoint definitions
│   │   │   │   └── NetworkError.swift         # Error types
│   │   │   │
│   │   │   ├── Persistence/
│   │   │   │   ├── PersistenceController.swift  # SwiftData/Core Data setup
│   │   │   │   ├── CloudKitManager.swift        # iCloud sync
│   │   │   │   └── CacheManager.swift           # Local cache
│   │   │   │
│   │   │   ├── Notifications/
│   │   │   │   ├── NotificationManager.swift    # UNUserNotificationCenter wrapper
│   │   │   │   └── NotificationScheduler.swift  # Prayer time scheduling logic
│   │   │   │
│   │   │   └── Location/
│   │   │       └── LocationManager.swift        # CLLocationManager wrapper
│   │   │
│   │   ├── Shared/                            # Shared utilities
│   │   │   ├── Extensions/
│   │   │   │   ├── Date+Extensions.swift
│   │   │   │   ├── String+Extensions.swift
│   │   │   │   └── Color+Theme.swift
│   │   │   │
│   │   │   ├── Components/                    # Reusable UI components
│   │   │   │   ├── PrimaryButton.swift
│   │   │   │   ├── LoadingView.swift
│   │   │   │   └── EmptyStateView.swift
│   │   │   │
│   │   │   ├── Utilities/
│   │   │   │   ├── Constants.swift            # App-wide constants
│   │   │   │   ├── HijriCalendar.swift        # Hijri date conversion
│   │   │   │   └── Logger.swift               # OSLog wrapper
│   │   │   │
│   │   │   └── Modifiers/
│   │   │       └── HapticModifier.swift       # Custom view modifiers
│   │   │
│   │   └── Resources/
│   │       ├── Assets.xcassets/               # Images, colors, icons
│   │       ├── Sounds/                        # Adhan audio files
│   │       │   ├── adhan1.mp3
│   │       │   ├── adhan2.mp3
│   │       │   └── adhan3.mp3
│   │       ├── Data/
│   │       │   └── hadith_collection.json     # Bundled hadith data
│   │       ├── Localizable.strings            # English localization
│   │       └── Info.plist                     # App configuration
│   │
│   ├── IstiqamahBNWidget/                     # Widget extension target
│   │   ├── IstiqamahBNWidget.swift            # Widget entry point
│   │   ├── PrayerTimeWidget.swift             # Widget view
│   │   ├── PrayerTimeEntry.swift              # Timeline entry
│   │   └── Assets.xcassets/
│   │
│   ├── IstiqamahBNTests/                      # Unit tests
│   │   ├── ViewModelTests/
│   │   │   ├── PrayerTimesViewModelTests.swift
│   │   │   ├── TasbihViewModelTests.swift
│   │   │   └── QuranTrackerViewModelTests.swift
│   │   ├── NetworkingTests/
│   │   │   └── NetworkManagerTests.swift
│   │   ├── UtilityTests/
│   │   │   ├── HijriCalendarTests.swift
│   │   │   └── QiblaCalculatorTests.swift
│   │   └── MockData/
│   │       └── MockPrayerTimes.json
│   │
│   └── IstiqamahBNUITests/                    # UI tests
│       ├── PrayerTimesUITests.swift
│       ├── TasbihUITests.swift
│       └── SettingsUITests.swift
│
├── backend/                                   # Prayer Times API Backend
│   ├── app/
│   │   ├── main.py                            # FastAPI app entry point
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py                      # API endpoint definitions
│   │   │   └── models.py                      # Pydantic response models
│   │   ├── core/
│   │   │   ├── config.py                      # Configuration management
│   │   │   └── logging.py                     # Logging setup
│   │   ├── scrapers/
│   │   │   ├── __init__.py
│   │   │   ├── mora_scraper.py                # MORA website scraper
│   │   │   └── hijri_converter.py             # Hijri date conversion
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── db.py                          # Database connection
│   │   │   └── models.py                      # SQLAlchemy models (optional)
│   │   └── utils/
│   │       ├── cache.py                       # In-memory caching
│   │       └── scheduler.py                   # Cron job scheduler
│   │
│   ├── tests/
│   │   ├── test_api.py                        # API endpoint tests
│   │   ├── test_scraper.py                    # Scraper tests
│   │   └── test_models.py                     # Model validation tests
│   │
│   ├── Dockerfile                             # Docker image definition
│   ├── docker-compose.yml                     # Docker Compose setup
│   ├── requirements.txt                       # Python dependencies
│   ├── .env.example                           # Environment variables template
│   └── README.md                              # Backend setup instructions
│
├── docs/                                      # Documentation
│   ├── API.md                                 # API documentation
│   ├── SETUP.md                               # Setup instructions
│   ├── DEPLOYMENT.md                          # Deployment guide
│   └── PRIVACY.md                             # Privacy policy
│
├── .gitignore                                 # Git ignore rules
├── .swiftlint.yml                             # SwiftLint configuration
├── README.md                                  # Project overview
└── LICENSE                                    # License file (MIT suggested)
```

## Directory Descriptions

### `IstiqamahBN/` - iOS Application
The main iOS app organized by feature modules following MVVM architecture. Each feature (PrayerTimes, Tasbih, QuranTracker, Qadha, Hadith, Qibla, Settings) contains its own Views, ViewModels, and Models for clear separation of concerns.

**Organization Strategy:** Feature-based structure where each feature is self-contained with its presentation layer (Views), business logic (ViewModels), and data models (Models). This makes features easy to find, modify, and test independently.

### `Core/` - Infrastructure Layer
Contains cross-cutting concerns like networking, persistence, notifications, and location services. These are singleton services used across multiple features.

### `Shared/` - Shared Resources
Reusable components, extensions, utilities, and custom view modifiers used throughout the app. Promotes DRY principle and consistent UI patterns.

### `IstiqamahBNWidget/` - Widget Extension
Separate target for home screen widgets. Shares data models with main app via shared app group container.

### `backend/` - Backend API
Python FastAPI application structured by layers: API routes, scraping logic, database access, and utilities. Follows standard FastAPI project structure for maintainability.

### `tests/` - Test Suites
Organized to mirror the main app structure. Unit tests for ViewModels and utilities, UI tests for user flows. Backend tests for API endpoints and scraper reliability.

## Key Files

| File | Purpose | Critical |
|------|---------|----------|
| `IstiqamahBNApp.swift` | App entry point, dependency injection, app lifecycle | Yes |
| `NetworkManager.swift` | Centralized API communication layer | Yes |
| `PersistenceController.swift` | SwiftData/Core Data stack initialization | Yes |
| `NotificationManager.swift` | Prayer time notification scheduling | Yes |
| `CloudKitManager.swift` | iCloud sync orchestration | Yes |
| `mora_scraper.py` | MORA website scraping logic | Yes |
| `routes.py` | Backend API endpoint definitions | Yes |
| `hadith_collection.json` | Bundled hadith data (30-50 entries) | No |
| `Constants.swift` | App-wide constants (colors, sizes, etc.) | No |

## Naming Conventions

### Swift/iOS Code
- **Files:** PascalCase (e.g., `PrayerTimesView.swift`, `NetworkManager.swift`)
- **Views:** PascalCase, suffix with `View` (e.g., `TasbihView`, `SettingsView`)
- **ViewModels:** PascalCase, suffix with `ViewModel` (e.g., `PrayerTimesViewModel`)
- **Models:** PascalCase, noun form (e.g., `PrayerTime`, `TasbihSession`)
- **Functions:** camelCase, verb form (e.g., `fetchPrayerTimes()`, `scheduleNotification()`)
- **Variables:** camelCase (e.g., `currentPage`, `isLoading`)
- **Constants:** camelCase for instances, PascalCase for types (e.g., `maxRetryCount`, `APIEndpoint`)
- **Protocols:** PascalCase, often adjective (e.g., `Cacheable`, `Syncable`)
- **Enums:** PascalCase, cases camelCase (e.g., `enum PrayerType { case fajr, dhuhr }`)

### Python/Backend Code
- **Files:** snake_case (e.g., `mora_scraper.py`, `prayer_routes.py`)
- **Classes:** PascalCase (e.g., `PrayerTimeResponse`, `MORAScaper`)
- **Functions:** snake_case, verb form (e.g., `fetch_prayer_times()`, `parse_html()`)
- **Variables:** snake_case (e.g., `prayer_time`, `api_endpoint`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`, `CACHE_TTL`)
- **Private methods:** Leading underscore (e.g., `_parse_date()`)

### Folders & Directories
- **iOS Folders:** PascalCase (e.g., `Features/`, `ViewModels/`)
- **Backend Folders:** snake_case (e.g., `scrapers/`, `database/`)
- **General:** kebab-case for project root and documentation (e.g., `istiqamah-bn/`, `docs/`)

## App Group & iCloud Container

### Shared App Group
**Identifier:** `group.com.n0juan.istiqamahbn`
- Shares data between main app and widget extension
- Stores UserDefaults for widget access
- Shared Core Data / SwiftData container

### iCloud Container
**Identifier:** `iCloud.com.n0juan.istiqamahbn`
- CloudKit container for cross-device sync
- Stores PrayerTime cache, TasbihSession, QuranProgress, QadhaPrayer models

## Build Targets

1. **IstiqamahBN** (Main App)
   - Bundle ID: `com.n0juan.istiqamahbn`
   - Deployment Target: iOS 16.0+
   - Capabilities: iCloud, Push Notifications, Background Modes, App Groups

2. **IstiqamahBNWidget** (Widget Extension)
   - Bundle ID: `com.n0juan.istiqamahbn.widget`
   - Deployment Target: iOS 16.0+
   - Capabilities: App Groups (shared with main app)

3. **IstiqamahBNTests** (Unit Tests)
   - Test host: IstiqamahBN

4. **IstiqamahBNUITests** (UI Tests)
   - Test host: IstiqamahBN

## Configuration Files

- **`.swiftlint.yml`**: SwiftLint rules for consistent Swift code style
- **`Info.plist`**: App metadata, permissions descriptions, URL schemes
- **`.gitignore`**: Excludes build artifacts, user-specific Xcode settings, `.env` files
- **`docker-compose.yml`**: Backend service definition, port mapping, volume mounts
- **`requirements.txt`**: Python dependencies with pinned versions
- **`.env.example`**: Template for backend environment variables
