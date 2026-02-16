# Feature: District Selection

**Created:** 2026-02-16
**Status:** APPROVED
**Priority:** Must-have

## Overview
Allow users to select their district in Brunei and automatically adjust prayer times based on district-specific offsets. Notifications will include the district name for clarity.

## Districts & Time Offsets

Based on MORA Brunei's official guidelines:

| District | Time Adjustment | Notes |
|----------|----------------|-------|
| **Brunei Muara** | Base (0 min) | Capital district, base reference |
| **Temburong** | Base (0 min) | Same times as Brunei Muara |
| **Tutong** | +1 minute | Slightly west of Brunei Muara |
| **Belait** | +3 minutes | Westernmost district |

## Prayer Time Calculation

All 8 prayer times are adjusted:
- **Base times** from MORA website (Brunei Muara/Temburong)
- **Tutong**: Add 1 minute to all times
- **Belait**: Add 3 minutes to all times

Example:
```
MORA Base (Brunei Muara):
- Suboh: 05:15
- Zohor: 12:40

Tutong:
- Suboh: 05:16 (+1)
- Zohor: 12:41 (+1)

Belait:
- Suboh: 05:18 (+3)
- Zohor: 12:43 (+3)
```

## Notification Format

Notifications include district name for user awareness:

**Start Time Notification:**
```
🕌 Suboh starts at 5:15 AM in Brunei Muara
```

**End Time Reminder:**
```
⏰ Suboh ends in 15 minutes (Syuruk at 6:45 AM in Belait)
```

## User Interface

### District Selection
- **Location:** Settings → District
- **Default:** Brunei Muara/Temburong (grouped as one option)
- **Display:** Simple picker with 3 options:
  1. Brunei Muara / Temburong
  2. Tutong (+1 min)
  3. Belait (+3 min)

### Prayer Times Display
- Show selected district at top of prayer times screen
- Small indicator showing time offset (if applicable)
- Example: "Brunei Muara" or "Belait (+3 min)"

## Technical Implementation

### Data Model Changes

**UserSettings Model:**
```swift
enum District: String, Codable {
    case bruneiMuara = "Brunei Muara / Temburong"
    case tutong = "Tutong"
    case belait = "Belait"

    var offsetMinutes: Int {
        switch self {
        case .bruneiMuara: return 0
        case .tutong: return 1
        case .belait: return 3
        }
    }
}

// Add to UserSettings:
var selectedDistrict: District = .bruneiMuara
```

**Prayer Time Calculation:**
```swift
func adjustForDistrict(_ time: Date, district: District) -> Date {
    return time.addingTimeInterval(TimeInterval(district.offsetMinutes * 60))
}
```

### Backend Changes
- **No backend changes required**
- Backend continues to provide base times (Brunei Muara)
- iOS app applies offset locally based on selected district

### Notification Changes
- Update notification body to include district name
- Apply time offset before scheduling notifications
- Example: Schedule Suboh notification at 5:18 AM for Belait users

## Acceptance Criteria

- [ ] User can select district in Settings (3 options)
- [ ] Selected district persists across app launches
- [ ] Prayer times automatically adjust based on selected district
- [ ] All 8 prayer times (Imsak, Suboh, Syuruk, Doha, Zohor, Asar, Maghrib, Isyak) are offset
- [ ] Notifications include district name in message body
- [ ] Start time notifications show: "Prayer starts at TIME in DISTRICT"
- [ ] End time notifications show: "Prayer ends in X minutes (Next prayer at TIME in DISTRICT)"
- [ ] District selection syncs via iCloud to other devices
- [ ] UI shows current district selection on prayer times screen
- [ ] Time offset is clearly visible to user (e.g., "Belait (+3 min)")

## Tasks to Add

### Phase 3 Additions (after T-041):
- **T-041a:** Create `District` enum with offset calculation logic
- **T-041b:** Add district selection to `UserSettings` model with iCloud sync
- **T-041c:** Implement prayer time offset calculation in `PrayerTimesViewModel`
- **T-041d:** Display selected district on prayer times screen
- **T-041e:** Update notification text to include district name

### Phase 5 Additions (Settings):
- **T-100a:** Add district picker to `SettingsView`
- **T-100b:** Show time offset indicator for non-Brunei Muara districts

### Phase 6 Testing:
- **T-107a:** Test prayer time calculations for all 3 districts
- **T-107b:** Verify notification times are correct for each district
- **T-107c:** Test iCloud sync of district selection

## UI Mockup Text

**Settings → District Section:**
```
District
━━━━━━━━━━━━━━━━━━━━━
Prayer times are adjusted for your district

Selected District: Brunei Muara / Temburong

[Change District]
```

**District Picker:**
```
Select Your District
━━━━━━━━━━━━━━━━━━━━━
⚪ Brunei Muara / Temburong (Base times)
⚪ Tutong (+1 minute)
⚪ Belait (+3 minutes)

Prayer times from MORA Brunei are automatically
adjusted for your selected district.
```

## Notes
- This feature respects MORA Brunei's official district time differences
- Keeps backend simple (no need to scrape/store 3 versions of times)
- User-friendly with clear time offset indicators
- Maintains accuracy by applying MORA's documented offsets
