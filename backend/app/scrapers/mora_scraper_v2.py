"""
MORA Brunei Prayer Times Scraper (Updated for SharePoint API)
Uses SharePoint REST API to fetch prayer times
"""
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from calendar import monthrange

logger = logging.getLogger(__name__)


class MORAScraperError(Exception):
    """Custom exception for MORA scraper errors"""
    pass


class MORAScraperV2:
    """Scraper for MORA Brunei SharePoint API"""

    API_URL = "https://www.mora.gov.bn/_api/web/lists/getbytitle('Waktu Sembahyang')/items"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'IstiqamahBN/1.0 (Prayer Times App for Brunei)',
            'Accept': 'application/json;odata=verbose',
        })

    def fetch_month(self, year: int, month: int) -> List[Dict[str, any]]:
        """
        Fetch prayer times for a specific month

        Args:
            year: Year (e.g., 2026)
            month: Month (1-12)

        Returns:
            List of prayer time dictionaries

        Raises:
            MORAScraperError: If the API call fails
        """
        try:
            # Calculate date range for the month
            start_date = datetime(year, month, 1)

            # Get last day of month
            last_day = monthrange(year, month)[1]
            end_date = datetime(year, month, last_day) + timedelta(days=1)

            # Format dates for SharePoint filter
            start_str = start_date.strftime('%Y-%m-%dT00:00:00')
            end_str = end_date.strftime('%Y-%m-%dT00:00:00')

            # Build API request
            params = {
                '$filter': f"Date ge datetime'{start_str}' and Date lt datetime'{end_str}'",
                '$orderby': 'Date asc',
                '$top': 50  # Max entries per month
            }

            logger.info(f"Fetching prayer times for {year}-{month:02d}")
            response = self.session.get(self.API_URL, params=params, timeout=30)
            response.raise_for_status()

            data = response.json()
            results = data.get('d', {}).get('results', [])

            logger.info(f"Fetched {len(results)} days for {year}-{month:02d}")

            # Parse results
            prayer_times = []
            for item in results:
                try:
                    prayer_data = self._parse_item(item)
                    prayer_times.append(prayer_data)
                except Exception as e:
                    logger.warning(f"Failed to parse item: {e}")
                    continue

            return prayer_times

        except requests.RequestException as e:
            logger.error(f"Failed to fetch month {year}-{month}: {e}")
            raise MORAScraperError(f"API request failed: {e}")

    def _parse_item(self, item: Dict) -> Dict[str, any]:
        """
        Parse a single SharePoint item into prayer time format

        Args:
            item: SharePoint item dictionary

        Returns:
            Parsed prayer time dictionary
        """
        # Extract date from ISO format (e.g., "2026-01-31T16:00:00Z")
        date_str = item['Date']
        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))

        # Adjust for Brunei timezone (UTC+8)
        # SharePoint stores at 16:00 UTC which is midnight+8 Brunei time, so we need the next day
        date_obj = date_obj + timedelta(hours=8)

        return {
            'date': date_obj.strftime('%Y-%m-%d'),
            'hijri_date': item.get('Tarikh', 'Unknown'),
            'imsak': self._normalize_time(item.get('Imsak', '')),
            'suboh': self._normalize_time(item.get('Suboh', '')),
            'syuruk': self._normalize_time(item.get('Syuruk', '')),
            'doha': self._normalize_time(item.get('Doha', '')),
            'zohor': self._normalize_time(item.get('Zohor', '')),
            'asar': self._normalize_time(item.get('Asar', '')),
            'maghrib': self._normalize_time(item.get('Maghrib', '')),
            'isyak': self._normalize_time(item.get('Isyak', '')),
        }

    def _normalize_time(self, time_str: str) -> str:
        """
        Normalize time from MORA format (H.MM) to standard format (HH:MM)

        Args:
            time_str: Time string (e.g., "5.06" or "12.35")

        Returns:
            Normalized time string (e.g., "05:06" or "12:35")
        """
        if not time_str:
            return "00:00"

        # Replace period with colon
        time_str = time_str.replace('.', ':').strip()

        # Ensure HH:MM format
        if ':' in time_str:
            parts = time_str.split(':')
            hour = int(parts[0])
            minute = int(parts[1])
            return f"{hour:02d}:{minute:02d}"

        logger.warning(f"Invalid time format: {time_str}")
        return "00:00"

    def scrape_year(self, year: Optional[int] = None) -> List[Dict[str, any]]:
        """
        Scrape prayer times for an entire year

        Args:
            year: Year to scrape (defaults to current year)

        Returns:
            List of prayer times for all days in the year

        Raises:
            MORAScraperError: If scraping fails
        """
        if year is None:
            year = datetime.now().year

        logger.info(f"=" * 60)
        logger.info(f"Starting scrape for year {year} from SharePoint API")
        logger.info(f"=" * 60)

        all_prayer_times = []

        # Scrape each month
        for month in range(1, 13):
            try:
                month_data = self.fetch_month(year, month)
                all_prayer_times.extend(month_data)
                logger.info(f"Month {month}/12 complete: {len(month_data)} days")

            except MORAScraperError as e:
                logger.error(f"Failed to fetch month {month}: {e}")
                # Continue with next month
                continue

        logger.info(f"=" * 60)
        logger.info(f"Successfully scraped {len(all_prayer_times)} days for year {year}")
        logger.info(f"=" * 60)

        # Validate we got a reasonable amount of data
        if len(all_prayer_times) < 350:
            logger.warning(
                f"Only got {len(all_prayer_times)} days, expected ~365. "
                f"Some months may have failed to scrape."
            )

        return all_prayer_times


# Convenience function
def scrape_mora_prayer_times(year: Optional[int] = None) -> List[Dict[str, any]]:
    """
    Scrape MORA prayer times for a year using SharePoint API

    Args:
        year: Year to scrape (defaults to current year)

    Returns:
        List of prayer times
    """
    scraper = MORAScraperV2()
    return scraper.scrape_year(year)
