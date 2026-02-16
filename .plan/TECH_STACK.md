# Tech Stack: IstiqamahBN

**Status:** DRAFT — Awaiting Review

## Overview
IstiqamahBN is built as a native iOS application using Swift and SwiftUI to deliver the most natural, performant user experience possible. The architecture emphasizes Apple's native frameworks to minimize dependencies, maximize performance, and ensure long-term maintainability. Data synchronization leverages iCloud/CloudKit for seamless cross-device experiences, while a custom Docker-based backend provides prayer times data.

## Frontend (iOS App)

### Language & Framework
- **Language:** Swift 5.9+
- **UI Framework:** SwiftUI (iOS 16.0+)
- **Architecture Pattern:** MVVM (Model-View-ViewModel)
- **Rationale:** SwiftUI provides declarative UI with excellent performance, native feel, and automatic Dark Mode support. MVVM pattern separates business logic from UI for better testability and maintainability.

### State Management
- **Primary:** SwiftUI's `@State`, `@StateObject`, `@ObservableObject`, `@Published`
- **Global State:** `@EnvironmentObject` for app-wide settings
- **Persistence:** SwiftData (new in iOS 17) or Core Data fallback
- **Rationale:** Native SwiftUI state management eliminates third-party dependencies. SwiftData offers modern, type-safe persistence with minimal boilerplate.

### Data Persistence
- **Local Database:** SwiftData (primary) / Core Data (fallback for iOS 16)
- **User Preferences:** UserDefaults for simple settings
- **Cloud Sync:** CloudKit for iCloud synchronization
- **Cache Management:** NSCache for in-memory prayer times cache
- **Rationale:** SwiftData provides seamless SwiftUI integration with automatic iCloud sync. CloudKit ensures Apple-native cross-device synchronization without custom backend sync logic.

### Networking
- **HTTP Client:** URLSession (native)
- **JSON Parsing:** Codable protocol (native)
- **API Layer:** Custom NetworkManager with async/await
- **Rationale:** URLSession is robust, well-tested, and requires no dependencies. Modern async/await syntax eliminates callback hell and improves code readability.

### Location & Sensors
- **Location Services:** CoreLocation (for Qibla compass)
- **Compass/Heading:** CLLocationManager heading updates
- **Permissions:** Native permission system with graceful degradation
- **Rationale:** CoreLocation provides accurate heading data essential for Qibla direction. Permission requests only when compass feature is accessed.

### Notifications
- **Framework:** UserNotifications (UNUserNotificationCenter)
- **Scheduling:** UNCalendarNotificationTrigger for prayer time alerts
- **Sounds:** Custom audio files bundled in app
- **Background Delivery:** Silent push for widget updates (optional)
- **Rationale:** UserNotifications supports rich notifications with custom sounds and precise scheduling. Background scheduling ensures prayers alerts fire even when app is closed.

### Widgets
- **Framework:** WidgetKit
- **Timeline:** TimelineProvider for automatic updates
- **Sizes:** Small, Medium, Large widgets
- **Rationale:** Native WidgetKit provides system-level integration with minimal battery impact through intelligent timeline management.

### UI Components & Styling
- **Components:** Native SwiftUI views (List, VStack, HStack, etc.)
- **Typography:** System fonts with Dynamic Type support
- **Colors:** Semantic color system (supports Light/Dark mode automatically)
- **Icons:** SF Symbols 4+
- **Haptics:** UIFeedbackGenerator for tactile feedback
- **Rationale:** Using native components ensures accessibility, consistency with iOS design language, and minimal maintenance overhead.

## Backend (Prayer Times API)

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Hosting:** User's self-hosted server
- **Deployment:** Manual deployment via Docker commands
- **Rationale:** Docker ensures consistent deployment environment and easy portability. Self-hosting gives user full control over infrastructure and data.

### Backend Language & Framework
- **Language:** Python 3.11+
- **Framework:** FastAPI
- **Web Server:** Uvicorn (ASGI server)
- **Rationale:** FastAPI offers automatic API documentation, type safety with Pydantic, and excellent async performance. Python simplifies web scraping of MORA website if needed.

### Data Source
- **Primary Source:** MORA Brunei website scraping (https://www.mora.gov.bn/SitePages/WaktuSembahyang.aspx)
- **Scraping Library:** BeautifulSoup4 + requests (or Playwright for JavaScript-rendered content)
- **Data Fields:** Imsak, Suboh (Fajr), Syuruk (Sunrise), Doha, Zohor (Dhuhr), Asar (Asr), Maghrib, Isyak (Isha)
- **Update Frequency:** Full year scrape at start of each year (January 1st), or on-demand via API trigger
- **Data Storage:** SQLite database for caching entire year's prayer times (365+ entries)
- **Rationale:** MORA website is authoritative source. Yearly scraping reduces server load and ensures full-year offline access. SQLite provides simple, reliable storage without complex database setup.

### API Layer
- **API Documentation:** Auto-generated OpenAPI (Swagger) docs via FastAPI
- **Validation:** Pydantic models for request/response validation
- **CORS:** Enabled for iOS app origin
- **Rate Limiting:** Optional rate limiting to prevent abuse
- **Rationale:** FastAPI's automatic documentation aids development and debugging. Pydantic ensures type-safe API contracts.

### Caching & Performance
- **Response Caching:** In-memory cache with 24-hour TTL
- **Database Query Optimization:** Indexed date columns
- **Rationale:** Caching reduces database load and improves response times. Prayer times rarely change mid-day, making 24-hour cache safe.

## Development Tools

### Package Management
- **iOS:** Swift Package Manager (SPM)
- **Backend:** pip with requirements.txt / Poetry for dependency management
- **Rationale:** SPM is Apple's official package manager with excellent Xcode integration. Poetry provides deterministic Python dependency resolution.

### Linting & Formatting
- **Swift:** SwiftLint for code style enforcement
- **SwiftFormat:** Automatic code formatting
- **Python:** Ruff (fast linter + formatter)
- **Rationale:** Consistent code style improves readability and collaboration. SwiftLint catches common Swift mistakes. Ruff is significantly faster than pylint/flake8.

### Testing
- **iOS Unit Tests:** XCTest framework
- **iOS UI Tests:** XCTest UI testing
- **Test Coverage:** Xcode's built-in coverage reporting
- **Backend Tests:** pytest for API endpoint testing
- **Mocking:** Built-in XCTest mocking / Python unittest.mock
- **Rationale:** Native testing frameworks integrate seamlessly with Xcode. Pytest offers clean, readable Python tests with excellent fixtures support.

### Version Control
- **VCS:** Git
- **Branching Strategy:** Git Flow (main, develop, feature branches)
- **Commit Convention:** Conventional Commits (feat:, fix:, docs:, etc.)
- **Rationale:** Git Flow provides structured release management. Conventional Commits enable automatic changelog generation.

### CI/CD
- **iOS:** Xcode Cloud (optional) or GitHub Actions
- **Backend:** Docker build on commit to main branch
- **Rationale:** Xcode Cloud provides native iOS build automation. GitHub Actions offers flexibility for custom workflows.

### Monitoring & Logging
- **iOS Logging:** OSLog (unified logging system)
- **Backend Logging:** Python logging module with structured JSON logs
- **Crash Reporting:** Xcode Organizer (manual crash log analysis)
- **Rationale:** OSLog integrates with Console.app for debugging. Structured backend logs aid troubleshooting. No third-party analytics maintains privacy commitment.

## Dependencies

### iOS App Dependencies (Swift Package Manager)

| Package | Purpose | Version | Notes |
|---------|---------|---------|-------|
| None initially | Prefer native frameworks | - | Add only if absolutely necessary |

**Note:** Initial version uses zero third-party dependencies to minimize app size, improve security, and reduce maintenance burden.

### Backend Dependencies (Python)

| Package | Purpose | Version | Required |
|---------|---------|---------|----------|
| fastapi | Web framework | ^0.109.0 | Yes |
| uvicorn | ASGI server | ^0.27.0 | Yes |
| pydantic | Data validation | ^2.5.0 | Yes |
| beautifulsoup4 | HTML parsing | ^4.12.0 | Yes |
| requests | HTTP client | ^2.31.0 | Yes |
| sqlalchemy | ORM (optional) | ^2.0.0 | Optional |
| playwright | JS rendering (if needed) | ^1.40.0 | Optional |
| python-dateutil | Date manipulation | ^2.8.2 | Yes |
| hijri-converter | Hijri calendar | ^2.3.0 | Yes |

## Infrastructure & Deployment

### Docker Configuration
- **Base Image:** python:3.11-slim
- **Port Exposure:** 8000 (configurable)
- **Volume Mounts:** Database file for persistence
- **Environment Variables:** API keys, timezone, update schedule
- **Restart Policy:** always (auto-restart on failure)

### Server Requirements
- **Minimum Specs:** 1 vCPU, 512MB RAM, 5GB storage
- **OS:** Linux (Ubuntu 22.04 recommended)
- **Network:** HTTPS with Let's Encrypt SSL certificate
- **Backup:** Daily automated database backups

### iOS App Distribution
- **Development:** Xcode direct install via USB
- **TestFlight:** Beta testing distribution
- **App Store:** Production release (pending)
- **Provisioning:** Developer account required for TestFlight/App Store

## Security Considerations

- **API Communication:** HTTPS only, no plaintext HTTP
- **API Authentication:** Optional API key for backend (if exposed publicly)
- **Data Encryption:** CloudKit encrypts data in transit and at rest
- **Code Signing:** iOS app signing with Developer certificate
- **No Hardcoded Secrets:** Environment variables for sensitive config
- **Input Validation:** All API inputs validated with Pydantic
- **SQL Injection Prevention:** Parameterized queries / ORM usage

## Accessibility

- **Dynamic Type:** All text respects user font size preferences
- **VoiceOver:** All UI elements properly labeled
- **High Contrast:** Supports Increased Contrast mode
- **Reduce Motion:** Respects reduced motion accessibility setting
- **Haptics:** Tactile feedback for important interactions
- **Color Blind Friendly:** Not relying solely on color for information

## Localization (Future)

- **Languages Planned:** English, Malay
- **Framework:** SwiftUI's built-in localization (Localizable.strings)
- **RTL Support:** Consideration for Arabic text (future enhancement)
- **Date Formatting:** Locale-aware date/time formatting
