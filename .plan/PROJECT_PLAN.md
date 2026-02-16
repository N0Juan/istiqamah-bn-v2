# Project Plan: IstiqamahBN

**Created:** 2026-02-16
**Status:** APPROVED

## 1. Executive Summary
IstiqamahBN is a minimal, native iOS application designed to help Muslims in Brunei maintain consistency (istiqamah) in their prayer practice. The app provides accurate prayer times from MORA Brunei, combined with gentle tracking tools for Tasbih, Quran progress, and missed prayers (Qadha), all synchronized across devices via iCloud. The design philosophy emphasizes encouragement over enforcement, with a clean, natural iOS interface that respects users' spiritual journey.

## 2. Goals & Objectives
- Provide accurate, timely prayer notifications for Brunei Muslims sourced from official MORA data
- Create a non-judgmental, encouraging environment for spiritual practice tracking
- Enable seamless cross-device synchronization of personal progress
- Deliver a minimal, distraction-free user experience that feels native to iOS
- Support users in building consistent prayer habits through gentle reminders and positive reinforcement

## 3. Scope
### In Scope
- Prayer times display and notifications (data from MORA Brunei via backend API)
- District selection (Brunei Muara/Temburong, Tutong, Belait) with automatic time adjustments
- End time reminder notifications before prayer windows close
- Tasbih (dhikr) counter with customizable counts
- Quran page tracker (1-604 pages)
- Qadha (missed prayer) tracker with debt management
- Daily encouragement hadith display
- iCloud sync for all tracker data and progress
- Home screen widget for next prayer time
- Qibla direction compass
- Prayer statistics and gentle streak tracking
- Hijri calendar integration
- Customizable notification sounds (adhan options)
- Dark mode support
- Offline mode with cached prayer times

### Out of Scope
- Multiple location support beyond Brunei (v1)
- Social features or community sharing
- Quran full text reading (only page tracking)
- Complex gamification or rewards systems
- Payment/donation integration
- Multiple user profiles on same device
- Android version (future consideration)

## 4. Target Users
Primary users are practicing Muslims in Brunei who:
- Own iPhone/iPad devices running iOS 16+
- Want to improve prayer consistency without feeling pressured
- Appreciate clean, minimal interfaces over feature-heavy apps
- Value official, accurate prayer times from MORA
- Use multiple Apple devices and want synchronized progress
- May be working on building or rebuilding prayer habits

## 5. Success Criteria
- Users receive prayer notifications within 1 minute of prayer time accuracy
- App launches and displays prayer times in <2 seconds
- Zero data loss during iCloud synchronization
- Prayer times data updates successfully from backend API daily
- Users can track Qadha prayers without manual date calculations
- UI feels native and intuitive, requiring no onboarding tutorial
- App maintains <50MB storage footprint
- 95%+ crash-free rate

## 6. Constraints & Assumptions
- **Technical Constraints:**
  - Requires iOS 16.0+ for SwiftUI features and SwiftData
  - Backend API hosted on user's server infrastructure
  - iCloud sync requires users to be signed into iCloud
  - Location permissions needed for Qibla compass only

- **Assumptions:**
  - MORA Brunei prayer times API structure remains stable
  - Users have reliable internet connection at least once daily for prayer times updates
  - Brunei's prayer time calculation method remains consistent
  - Users are comfortable with English and/or Malay interfaces
  - Backend Docker container has >99% uptime

- **Design Constraints:**
  - Must feel encouraging, never guilt-inducing
  - Minimal UI - no unnecessary animations or distractions
  - Natural iOS patterns preferred over custom UI components
