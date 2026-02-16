"""
Unit tests for MORA scraper
"""
import pytest
from app.scrapers.mora_scraper import MORAScraper, MORAScraperError
from datetime import datetime


class TestMORAScraper:
    """Test suite for MORA scraper"""

    def test_parse_time_valid(self):
        """Test parsing valid time strings"""
        scraper = MORAScraper()

        assert scraper._parse_time("05:15") == "05:15"
        assert scraper._parse_time("5:15") == "05:15"
        assert scraper._parse_time("12:30") == "12:30"
        assert scraper._parse_time("05:15 AM") == "05:15"

    def test_parse_time_invalid(self):
        """Test parsing invalid time strings"""
        scraper = MORAScraper()

        with pytest.raises(ValueError):
            scraper._parse_time("invalid")

        with pytest.raises(ValueError):
            scraper._parse_time("")

    def test_parse_date_valid(self):
        """Test parsing valid date strings"""
        scraper = MORAScraper()
        year = 2026

        # Test "1 Jan" format
        date_obj = scraper._parse_date("1 Jan", year)
        assert date_obj.year == 2026
        assert date_obj.month == 1
        assert date_obj.day == 1

    def test_get_hijri_date(self):
        """Test Hijri date conversion"""
        scraper = MORAScraper()
        gregorian_date = datetime(2026, 2, 16)

        hijri_date = scraper._get_hijri_date(gregorian_date)
        assert isinstance(hijri_date, str)
        assert len(hijri_date) > 0

# Note: Full integration tests require actual MORA website access
# or mock HTML responses
