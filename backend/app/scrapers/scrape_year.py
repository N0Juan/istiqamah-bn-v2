"""
Scraper runner script
Run this to scrape MORA prayer times for a year
"""
import argparse
import sys
from datetime import datetime
import logging

from app.scrapers.mora_scraper_v2 import scrape_mora_prayer_times, MORAScraperError
from app.database.db import get_db
from app.core.logging import setup_logging


def main():
    """Main scraper execution"""
    # Setup logging
    setup_logging()
    logger = logging.getLogger(__name__)

    # Parse arguments
    parser = argparse.ArgumentParser(description='Scrape MORA Brunei prayer times')
    parser.add_argument(
        '--year',
        type=int,
        default=datetime.now().year,
        help='Year to scrape (default: current year)'
    )
    args = parser.parse_args()

    year = args.year

    logger.info(f"=" * 60)
    logger.info(f"Starting MORA Prayer Times Scraper for year {year}")
    logger.info(f"=" * 60)

    try:
        # Run scraper
        logger.info("Step 1: Scraping MORA website...")
        prayer_times = scrape_mora_prayer_times(year)

        logger.info(f"Successfully scraped {len(prayer_times)} days")

        # Save to database
        logger.info("Step 2: Saving to database...")
        db = get_db()

        inserted = db.insert_prayer_times(prayer_times)
        logger.info(f"Inserted {inserted} records into database")

        # Update metadata
        db.update_scrape_metadata(
            year=year,
            record_count=inserted,
            source_url="https://www.mora.gov.bn/SitePages/WaktuSembahyang.aspx"
        )

        logger.info("=" * 60)
        logger.info(f"✅ SUCCESS! Prayer times for {year} have been scraped and saved")
        logger.info(f"Total records: {inserted}")
        logger.info("=" * 60)

        return 0

    except MORAScraperError as e:
        logger.error(f"❌ Scraper error: {e}")
        return 1

    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
