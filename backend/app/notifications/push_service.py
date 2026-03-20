"""Web Push notification service and scheduler."""
import asyncio
import json
import logging
import os
from datetime import datetime, timezone, timedelta

from pywebpush import webpush, WebPushException

from app.database.db import get_db

logger = logging.getLogger(__name__)

BRUNEI_TZ = timezone(timedelta(hours=8))

DISTRICT_OFFSETS = {
    'bruneiMuara': 0,
    'tutong': 1,
    'belait': 3,
}

MAIN_PRAYERS = ['suboh', 'zohor', 'asar', 'maghrib', 'isyak']

PRAYER_NAMES = {
    'suboh': 'Suboh (Fajr)',
    'zohor': 'Zohor (Dhuhr)',
    'asar': 'Asar (Asr)',
    'maghrib': 'Maghrib',
    'isyak': 'Isyak (Isha)',
}

# Each prayer ends when the next time begins
PRAYER_END_MAP = {
    'suboh': 'syuruk',
    'zohor': 'asar',
    'asar': 'maghrib',
    'maghrib': 'isyak',
    'isyak': None,  # ends at midnight
}

DISTRICT_NAMES = {
    'bruneiMuara': 'Brunei Muara',
    'tutong': 'Tutong',
    'belait': 'Belait',
}


class PushService:
    def __init__(self):
        self.vapid_private_key = os.getenv('VAPID_PRIVATE_KEY', '')
        self.vapid_claims = {
            "sub": os.getenv('VAPID_CONTACT', 'mailto:admin@istiqamahbn.com')
        }
        self.sent_today = {}  # {endpoint: set(notification_keys)}
        self.last_reset_date = None
        self._running = False

    def _parse_minutes(self, time_str):
        """Convert 'HH:MM' to minutes since midnight."""
        h, m = map(int, time_str.split(':'))
        return h * 60 + m

    def _format_12h(self, time_str, offset_minutes=0):
        """Convert 'HH:MM' to 12-hour format with optional minute offset."""
        h, m = map(int, time_str.split(':'))
        total = h * 60 + m + offset_minutes
        h = (total // 60) % 24
        m = total % 60
        period = 'AM' if h < 12 else 'PM'
        display_h = h % 12 or 12
        return f"{display_h}:{m:02d} {period}"

    def send_push(self, subscription_info, title, body, tag=''):
        """Send a push notification to a single subscriber."""
        try:
            payload = json.dumps({
                'title': title,
                'body': body,
                'icon': '/icons/icon-192.png',
                'badge': '/icons/icon-96.png',
                'tag': tag,
                'data': {'url': '/'},
            })

            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=self.vapid_private_key,
                vapid_claims=self.vapid_claims,
            )
            logger.info(f"Push sent: {title} -> {subscription_info['endpoint'][:60]}...")
            return True

        except WebPushException as e:
            logger.error(f"Push failed: {e}")
            if e.response and e.response.status_code in (404, 410):
                logger.info(f"Removing expired subscription: {subscription_info['endpoint'][:60]}...")
                try:
                    db = get_db()
                    db.remove_push_subscription(subscription_info['endpoint'])
                except Exception:
                    pass
            return False
        except Exception as e:
            logger.error(f"Push error: {e}")
            return False

    async def check_and_send(self):
        """Check current time against prayer times and send due notifications."""
        try:
            now = datetime.now(BRUNEI_TZ)
            today = now.date()

            # Reset tracking at midnight
            if self.last_reset_date != today:
                self.sent_today.clear()
                self.last_reset_date = today
                logger.info("Reset daily notification tracking")

            db = get_db()
            prayer_times = db.get_prayer_times_by_date(today.isoformat())
            if not prayer_times:
                return

            subscribers = db.get_all_push_subscriptions()
            if not subscribers:
                return

            current_minutes = now.hour * 60 + now.minute

            for sub in subscribers:
                endpoint = sub['endpoint']
                if endpoint not in self.sent_today:
                    self.sent_today[endpoint] = set()

                district = sub.get('district', 'bruneiMuara')
                offset = DISTRICT_OFFSETS.get(district, 0)
                reminder_advance = sub.get('reminder_advance', 5)
                end_reminders = sub.get('end_reminders_enabled', False)
                end_advance = sub.get('end_reminder_advance', 15)
                district_name = DISTRICT_NAMES.get(district, 'Brunei Muara')

                subscription_info = {
                    'endpoint': endpoint,
                    'keys': {
                        'p256dh': sub['p256dh'],
                        'auth': sub['auth'],
                    },
                }

                for prayer in MAIN_PRAYERS:
                    prayer_minutes = self._parse_minutes(prayer_times[prayer]) + offset
                    prayer_name = PRAYER_NAMES[prayer]
                    formatted_time = self._format_12h(prayer_times[prayer], offset)

                    # --- Start time notification ---
                    notify_at = prayer_minutes - reminder_advance
                    start_key = f"{prayer}-start"

                    if (start_key not in self.sent_today[endpoint]
                            and notify_at <= current_minutes <= notify_at + 2):
                        self.send_push(
                            subscription_info,
                            title=f"{prayer_name} - {reminder_advance} min",
                            body=f"{prayer_name} time is in {reminder_advance} minutes at {formatted_time} in {district_name}",
                            tag=f"prayer-{prayer}",
                        )
                        self.sent_today[endpoint].add(start_key)

                    # --- End time notification ---
                    if not end_reminders:
                        continue

                    end_prayer_key = PRAYER_END_MAP.get(prayer)
                    if end_prayer_key and end_prayer_key in prayer_times:
                        end_minutes = self._parse_minutes(prayer_times[end_prayer_key]) + offset
                        end_time_formatted = self._format_12h(prayer_times[end_prayer_key], offset)
                    elif end_prayer_key is None:
                        end_minutes = 24 * 60
                        end_time_formatted = "12:00 AM"
                    else:
                        continue

                    end_notify_at = end_minutes - end_advance
                    end_key = f"{prayer}-end"

                    if (end_key not in self.sent_today[endpoint]
                            and end_notify_at <= current_minutes <= end_notify_at + 2
                            and current_minutes >= prayer_minutes):
                        self.send_push(
                            subscription_info,
                            title=f"⏰ {prayer_name} Ending Soon",
                            body=f"{prayer_name} prayer time ends at {end_time_formatted} in {district_name}. Please pray if you haven't yet.",
                            tag=f"prayer-end-{prayer}",
                        )
                        self.sent_today[endpoint].add(end_key)

        except Exception as e:
            logger.error(f"Scheduler error: {e}", exc_info=True)

    async def run_scheduler(self):
        """Background loop — checks every 30 seconds."""
        self._running = True
        logger.info("Push notification scheduler started")
        while self._running:
            await self.check_and_send()
            await asyncio.sleep(30)

    def stop(self):
        self._running = False
        logger.info("Push notification scheduler stopped")


# Global instance
_push_service = None


def get_push_service() -> PushService:
    global _push_service
    if _push_service is None:
        _push_service = PushService()
    return _push_service
