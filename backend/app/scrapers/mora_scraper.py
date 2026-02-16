"""
MORA Brunei Prayer Times Scraper
Scrapes prayer times from https://www.mora.gov.bn/SitePages/WaktuSembahyang.aspx
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from hijri_converter import Gregorian

logger = logging.getLogger(__name__)


class MORAScraperError(Exception):
    """Custom exception for MORA scraper errors"""
    pass


class MORAScraper:
    """Scraper for MORA Brunei prayer times website"""

    def __init__(self, url: str = "https://www.mora.gov.bn/SitePages/WaktuSembahyang.aspx"):
        self.url = url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'IstiqamahBN/1.0 (Prayer Times App for Brunei)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })

    def fetch_page(self) -> str:
        """
        Fetch the MORA prayer times page HTML

        Returns:
            str: HTML content of the page

        Raises:
            MORAScraperError: If the page cannot be fetched
        """
        try:
            logger.info(f"Fetching MORA prayer times from {self.url}")
            response = self.session.get(self.url, timeout=30)
            response.raise_for_status()
            logger.info("Successfully fetched MORA page")
            return response.text
        except requests.RequestException as e:
            logger.error(f"Failed to fetch MORA page: {e}")
            raise MORAScraperError(f"Failed to fetch MORA page: {e}")

    def parse_prayer_times(self, html: str, year: int) -> List[Dict[str, any]]:
        """
        Parse prayer times from HTML content

        Args:
            html: HTML content from MORA website
            year: Year to parse prayer times for

        Returns:
            List of dictionaries containing prayer times for each day

        Raises:
            MORAScraperError: If parsing fails
        """
        try:
            logger.info(f"Parsing prayer times for year {year}")
            soup = BeautifulSoup(html, 'lxml')

            # Find the prayer times table
            # Note: The actual table structure needs to be verified from the real MORA website
            # This is a placeholder implementation that will need adjustment
            table = soup.find('table', {'class': 'waktu-solat'}) or soup.find('table')

            if not table:
                raise MORAScraperError("Could not find prayer times table in HTML")

            prayer_times = []
            rows = table.find_all('tr')[1:]  # Skip header row

            for row in rows:
                cols = row.find_all('td')
                if len(cols) < 9:  # Expecting at least: Date + 8 prayer times
                    continue

                try:
                    # Parse the date (adjust index based on actual table structure)
                    date_str = cols[0].get_text(strip=True)
                    date_obj = self._parse_date(date_str, year)

                    # Parse prayer times
                    # Indices need to be adjusted based on actual MORA table structure
                    prayer_data = {
                        'date': date_obj.strftime('%Y-%m-%d'),
                        'hijri_date': self._get_hijri_date(date_obj),
                        'imsak': self._parse_time(cols[1].get_text(strip=True)),
                        'suboh': self._parse_time(cols[2].get_text(strip=True)),
                        'syuruk': self._parse_time(cols[3].get_text(strip=True)),
                        'doha': self._parse_time(cols[4].get_text(strip=True)),
                        'zohor': self._parse_time(cols[5].get_text(strip=True)),
                        'asar': self._parse_time(cols[6].get_text(strip=True)),
                        'maghrib': self._parse_time(cols[7].get_text(strip=True)),
                        'isyak': self._parse_time(cols[8].get_text(strip=True)),
                    }

                    prayer_times.append(prayer_data)

                except (ValueError, IndexError) as e:
                    logger.warning(f"Failed to parse row: {e}")
                    continue

            logger.info(f"Successfully parsed {len(prayer_times)} days of prayer times")
            return prayer_times

        except Exception as e:
            logger.error(f"Failed to parse prayer times: {e}")
            raise MORAScraperError(f"Failed to parse prayer times: {e}")

    def _parse_date(self, date_str: str, year: int) -> datetime:
        """
        Parse date string to datetime object

        Args:
            date_str: Date string (e.g., "1 Jan" or "15/01")
            year: Year to use

        Returns:
            datetime object
        """
        # Try different date formats
        formats = [
            '%d %b',      # "1 Jan"
            '%d/%m',      # "01/01"
            '%d-%m',      # "01-01"
        ]

        for fmt in formats:
            try:
                date_obj = datetime.strptime(date_str, fmt)
                return date_obj.replace(year=year)
            except ValueError:
                continue

        raise ValueError(f"Could not parse date: {date_str}")

    def _parse_time(self, time_str: str) -> str:
        """
        Parse and validate time string

        Args:
            time_str: Time string (e.g., "05:15" or "5:15 AM")

        Returns:
            Normalized time string in HH:MM format
        """
        # Remove AM/PM and extra spaces
        time_str = time_str.strip().upper().replace('AM', '').replace('PM', '').strip()

        # Ensure HH:MM format
        if ':' in time_str:
            parts = time_str.split(':')
            hour = int(parts[0])
            minute = int(parts[1])
            return f"{hour:02d}:{minute:02d}"

        raise ValueError(f"Invalid time format: {time_str}")

    def _get_hijri_date(self, gregorian_date: datetime) -> str:
        """
        Convert Gregorian date to Hijri date

        Args:
            gregorian_date: Gregorian datetime object

        Returns:
            Hijri date string (e.g., "1 Rajab 1447")
        """
        try:
            g = Gregorian(gregorian_date.year, gregorian_date.month, gregorian_date.day)
            hijri = g.to_hijri()

            # Month names in English
            hijri_months = [
                'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
                'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
                'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
            ]

            month_name = hijri_months[hijri.month - 1]
            return f"{hijri.day} {month_name} {hijri.year}"

        except Exception as e:
            logger.warning(f"Failed to convert to Hijri date: {e}")
            return "Unknown"

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

        logger.info(f"Starting scrape for year {year}")

        html = self.fetch_page()
        prayer_times = self.parse_prayer_times(html, year)

        # Validate we got a full year (or close to it)
        if len(prayer_times) < 360:
            logger.warning(f"Only got {len(prayer_times)} days, expected ~365")

        logger.info(f"Successfully scraped {len(prayer_times)} days for year {year}")
        return prayer_times


# Convenience function
def scrape_mora_prayer_times(year: Optional[int] = None) -> List[Dict[str, any]]:
    """
    Scrape MORA prayer times for a year

    Args:
        year: Year to scrape (defaults to current year)

    Returns:
        List of prayer times
    """
    scraper = MORAScraper()
    return scraper.scrape_year(year)
