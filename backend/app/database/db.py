"""
Database module for IstiqamahBN
SQLite database for storing prayer times
"""
import sqlite3
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime, date
import logging
import os

logger = logging.getLogger(__name__)


class PrayerTimesDB:
    """SQLite database for prayer times"""

    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize database connection

        Args:
            db_path: Path to SQLite database file (defaults to env var or local data dir)
        """
        if db_path is None:
            # Use environment variable if set, otherwise use local data directory
            if 'DATABASE_PATH' in os.environ:
                db_path = os.getenv('DATABASE_PATH')
            elif os.path.exists('/app'):
                db_path = '/app/data/prayer_times.db'
            else:
                # Local development
                project_root = Path(__file__).parent.parent.parent
                db_path = str(project_root / "data" / "prayer_times.db")

        self.db_path = db_path
        self._ensure_directory()
        self.conn = None
        self._connect()
        self._create_tables()

    def _ensure_directory(self):
        """Ensure the database directory exists"""
        db_dir = Path(self.db_path).parent
        db_dir.mkdir(parents=True, exist_ok=True)

    def _connect(self):
        """Establish database connection"""
        try:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row
            logger.info(f"Connected to database: {self.db_path}")
        except sqlite3.Error as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    def _create_tables(self):
        """Create database tables if they don't exist"""
        try:
            cursor = self.conn.cursor()

            # Prayer times table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS prayer_times (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL UNIQUE,
                    hijri_date TEXT,
                    imsak TEXT NOT NULL,
                    suboh TEXT NOT NULL,
                    syuruk TEXT NOT NULL,
                    doha TEXT NOT NULL,
                    zohor TEXT NOT NULL,
                    asar TEXT NOT NULL,
                    maghrib TEXT NOT NULL,
                    isyak TEXT NOT NULL,
                    year INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Create index on date for fast lookups
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_prayer_times_date
                ON prayer_times(date)
            """)

            # Create index on year for fast year queries
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_prayer_times_year
                ON prayer_times(year)
            """)

            # Metadata table for tracking scraping info
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scrape_metadata (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    year INTEGER NOT NULL UNIQUE,
                    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    record_count INTEGER NOT NULL,
                    source_url TEXT
                )
            """)

            # Push notification subscriptions
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS push_subscriptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    endpoint TEXT NOT NULL UNIQUE,
                    p256dh TEXT NOT NULL,
                    auth TEXT NOT NULL,
                    district TEXT DEFAULT 'bruneiMuara',
                    reminder_advance INTEGER DEFAULT 5,
                    end_reminders_enabled BOOLEAN DEFAULT 0,
                    end_reminder_advance INTEGER DEFAULT 15,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            self.conn.commit()
            logger.info("Database tables created/verified")

        except sqlite3.Error as e:
            logger.error(f"Failed to create tables: {e}")
            raise

    def insert_prayer_times(self, prayer_times: List[Dict[str, any]]) -> int:
        """
        Insert prayer times into database (batch insert)

        Args:
            prayer_times: List of prayer time dictionaries

        Returns:
            Number of records inserted
        """
        try:
            cursor = self.conn.cursor()
            inserted = 0

            for pt in prayer_times:
                # Extract year from date
                date_obj = datetime.strptime(pt['date'], '%Y-%m-%d')
                year = date_obj.year

                cursor.execute("""
                    INSERT OR REPLACE INTO prayer_times
                    (date, hijri_date, imsak, suboh, syuruk, doha, zohor, asar, maghrib, isyak, year, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    pt['date'],
                    pt['hijri_date'],
                    pt['imsak'],
                    pt['suboh'],
                    pt['syuruk'],
                    pt['doha'],
                    pt['zohor'],
                    pt['asar'],
                    pt['maghrib'],
                    pt['isyak'],
                    year
                ))
                inserted += 1

            self.conn.commit()
            logger.info(f"Inserted {inserted} prayer time records")
            return inserted

        except sqlite3.Error as e:
            logger.error(f"Failed to insert prayer times: {e}")
            self.conn.rollback()
            raise

    def update_scrape_metadata(self, year: int, record_count: int, source_url: str):
        """
        Update metadata about the scraping operation

        Args:
            year: Year that was scraped
            record_count: Number of records scraped
            source_url: URL that was scraped
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO scrape_metadata (year, scraped_at, record_count, source_url)
                VALUES (?, CURRENT_TIMESTAMP, ?, ?)
            """, (year, record_count, source_url))
            self.conn.commit()
            logger.info(f"Updated scrape metadata for year {year}")

        except sqlite3.Error as e:
            logger.error(f"Failed to update metadata: {e}")
            raise

    def get_prayer_times_by_date(self, date_str: str) -> Optional[Dict]:
        """
        Get prayer times for a specific date

        Args:
            date_str: Date in YYYY-MM-DD format

        Returns:
            Dictionary of prayer times or None if not found
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT date, hijri_date, imsak, suboh, syuruk, doha, zohor, asar, maghrib, isyak
                FROM prayer_times
                WHERE date = ?
            """, (date_str,))

            row = cursor.fetchone()
            if row:
                return dict(row)
            return None

        except sqlite3.Error as e:
            logger.error(f"Failed to fetch prayer times for {date_str}: {e}")
            raise

    def get_prayer_times_by_year(self, year: int) -> List[Dict]:
        """
        Get all prayer times for a specific year

        Args:
            year: Year to fetch

        Returns:
            List of prayer time dictionaries
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT date, hijri_date, imsak, suboh, syuruk, doha, zohor, asar, maghrib, isyak
                FROM prayer_times
                WHERE year = ?
                ORDER BY date ASC
            """, (year,))

            rows = cursor.fetchall()
            return [dict(row) for row in rows]

        except sqlite3.Error as e:
            logger.error(f"Failed to fetch prayer times for year {year}: {e}")
            raise

    def get_today_prayer_times(self) -> Optional[Dict]:
        """
        Get prayer times for today

        Returns:
            Dictionary of prayer times or None if not found
        """
        today = date.today().strftime('%Y-%m-%d')
        return self.get_prayer_times_by_date(today)

    def year_exists(self, year: int) -> bool:
        """
        Check if prayer times for a year exist in database

        Args:
            year: Year to check

        Returns:
            True if year data exists
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT COUNT(*) as count FROM prayer_times WHERE year = ?
            """, (year,))

            row = cursor.fetchone()
            return row['count'] > 0

        except sqlite3.Error as e:
            logger.error(f"Failed to check year existence: {e}")
            return False

    # --- Push subscription methods ---

    def add_push_subscription(self, endpoint, p256dh, auth, district='bruneiMuara',
                              reminder_advance=5, end_reminders_enabled=False,
                              end_reminder_advance=15):
        """Insert or update a push subscription."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO push_subscriptions
                (endpoint, p256dh, auth, district, reminder_advance,
                 end_reminders_enabled, end_reminder_advance, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (endpoint, p256dh, auth, district, reminder_advance,
                  end_reminders_enabled, end_reminder_advance))
            self.conn.commit()
            logger.info(f"Push subscription saved: {endpoint[:60]}...")
        except sqlite3.Error as e:
            logger.error(f"Failed to save push subscription: {e}")
            raise

    def remove_push_subscription(self, endpoint):
        """Remove a push subscription by endpoint."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("DELETE FROM push_subscriptions WHERE endpoint = ?", (endpoint,))
            self.conn.commit()
            logger.info(f"Push subscription removed: {endpoint[:60]}...")
        except sqlite3.Error as e:
            logger.error(f"Failed to remove push subscription: {e}")
            raise

    def update_push_settings(self, endpoint, district='bruneiMuara',
                             reminder_advance=5, end_reminders_enabled=False,
                             end_reminder_advance=15):
        """Update notification settings for an existing subscription."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                UPDATE push_subscriptions
                SET district = ?, reminder_advance = ?, end_reminders_enabled = ?,
                    end_reminder_advance = ?, updated_at = CURRENT_TIMESTAMP
                WHERE endpoint = ?
            """, (district, reminder_advance, end_reminders_enabled,
                  end_reminder_advance, endpoint))
            self.conn.commit()
        except sqlite3.Error as e:
            logger.error(f"Failed to update push settings: {e}")
            raise

    def get_all_push_subscriptions(self):
        """Return all active push subscriptions."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM push_subscriptions")
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            logger.error(f"Failed to fetch push subscriptions: {e}")
            return []

    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


# Global database instance
_db_instance = None


def get_db() -> PrayerTimesDB:
    """Get global database instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = PrayerTimesDB()
    return _db_instance
