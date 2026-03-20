"""
Pydantic models for API request/response validation
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import date


class PrayerTimesData(BaseModel):
    """Prayer times for a single day"""
    imsak: str = Field(..., description="Imsak time (HH:MM)", example="05:15")
    suboh: str = Field(..., description="Suboh/Fajr time (HH:MM)", example="05:25")
    syuruk: str = Field(..., description="Syuruk/Sunrise time (HH:MM)", example="06:45")
    doha: str = Field(..., description="Doha time (HH:MM)", example="07:00")
    zohor: str = Field(..., description="Zohor/Dhuhr time (HH:MM)", example="12:40")
    asar: str = Field(..., description="Asar/Asr time (HH:MM)", example="15:55")
    maghrib: str = Field(..., description="Maghrib time (HH:MM)", example="18:50")
    isyak: str = Field(..., description="Isyak/Isha time (HH:MM)", example="20:00")

    class Config:
        json_schema_extra = {
            "example": {
                "imsak": "05:15",
                "suboh": "05:25",
                "syuruk": "06:45",
                "doha": "07:00",
                "zohor": "12:40",
                "asar": "15:55",
                "maghrib": "18:50",
                "isyak": "20:00"
            }
        }


class SingleDayResponse(BaseModel):
    """Response model for single day prayer times"""
    date: str = Field(..., description="Date in YYYY-MM-DD format", example="2026-02-16")
    hijri_date: str = Field(..., description="Hijri date", example="16 Sha'ban 1447")
    location: str = Field(default="Brunei Darussalam", description="Location")
    prayer_times: PrayerTimesData = Field(..., description="Prayer times for the day")
    timezone: str = Field(default="Asia/Brunei", description="Timezone")
    source: str = Field(default="MORA Brunei", description="Data source")

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2026-02-16",
                "hijri_date": "16 Sha'ban 1447",
                "location": "Brunei Darussalam",
                "prayer_times": {
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
        }


class DayPrayerTimes(BaseModel):
    """Prayer times for a single day in yearly response"""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    hijri_date: str = Field(..., description="Hijri date")
    prayer_times: PrayerTimesData


class YearlyPrayerTimesResponse(BaseModel):
    """Response model for full year prayer times"""
    year: int = Field(..., description="Year", example=2026)
    location: str = Field(default="Brunei Darussalam", description="Location")
    timezone: str = Field(default="Asia/Brunei", description="Timezone")
    source: str = Field(default="MORA Brunei", description="Data source")
    last_updated: Optional[str] = Field(None, description="Last update timestamp")
    prayer_times: List[DayPrayerTimes] = Field(..., description="Prayer times for all days in the year")

    class Config:
        json_schema_extra = {
            "example": {
                "year": 2026,
                "location": "Brunei Darussalam",
                "timezone": "Asia/Brunei",
                "source": "MORA Brunei",
                "last_updated": "2026-01-01T00:00:00Z",
                "prayer_times": [
                    {
                        "date": "2026-01-01",
                        "hijri_date": "1 Rajab 1447",
                        "prayer_times": {
                            "imsak": "05:10",
                            "suboh": "05:20",
                            "syuruk": "06:40",
                            "doha": "06:55",
                            "zohor": "12:35",
                            "asar": "15:50",
                            "maghrib": "18:45",
                            "isyak": "19:55"
                        }
                    }
                ]
            }
        }


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Health status", example="healthy")
    timestamp: str = Field(..., description="Current timestamp")
    service: str = Field(..., description="Service name")
    database: bool = Field(..., description="Database connection status")


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")


# --- Push Notification Models ---

class PushSubscriptionKeys(BaseModel):
    """Browser push subscription keys"""
    p256dh: str
    auth: str


class PushSubscriptionInfo(BaseModel):
    """Browser push subscription object"""
    endpoint: str
    keys: PushSubscriptionKeys


class PushNotificationSettings(BaseModel):
    """User notification preferences sent with subscription"""
    district: str = "bruneiMuara"
    reminder_advance: int = 5
    end_reminders_enabled: bool = False
    end_reminder_advance: int = 15


class PushSubscriptionRequest(BaseModel):
    """Request body for subscribing to push notifications"""
    subscription: PushSubscriptionInfo
    settings: PushNotificationSettings


class PushUnsubscribeRequest(BaseModel):
    """Request body for unsubscribing"""
    endpoint: str


class PushSettingsUpdateRequest(BaseModel):
    """Request body for updating notification settings"""
    endpoint: str
    settings: PushNotificationSettings


class PushSendRequest(BaseModel):
    """Request body for sending a push notification to all subscribers (admin)"""
    title: str = Field(..., max_length=200, description="Notification title")
    body: str = Field(..., max_length=1000, description="Notification body text")
    url: Optional[str] = Field(None, max_length=2048, description="URL to open on click")

    @field_validator("url")
    @classmethod
    def url_must_be_relative(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.startswith("/"):
            raise ValueError("URL must be a relative path starting with /")
        return v
