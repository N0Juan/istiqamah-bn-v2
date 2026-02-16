"""
API routes for IstiqamahBN Prayer Times
"""
from fastapi import APIRouter, HTTPException, status
from datetime import date, datetime
from typing import Optional
import logging

from app.api.models import (
    SingleDayResponse,
    YearlyPrayerTimesResponse,
    DayPrayerTimes,
    PrayerTimesData,
    ErrorResponse
)
from app.database.db import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/prayer-times/brunei", tags=["Prayer Times"])


@router.get("/year/{year}", response_model=YearlyPrayerTimesResponse)
async def get_year_prayer_times(year: int):
    """
    Get prayer times for an entire year

    Returns all prayer times for the specified year from the database.
    Data is sourced from MORA Brunei and stored locally.

    - **year**: Year to retrieve (e.g., 2026)
    """
    try:
        # Validate year
        current_year = datetime.now().year
        if year < 2020 or year > current_year + 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Year must be between 2020 and {current_year + 5}"
            )

        db = get_db()

        # Check if year data exists
        if not db.year_exists(year):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Prayer times for year {year} not found in database. Please run scraper first."
            )

        # Fetch prayer times
        prayer_times_data = db.get_prayer_times_by_year(year)

        if not prayer_times_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No prayer times found for year {year}"
            )

        # Format response
        formatted_times = []
        for pt in prayer_times_data:
            formatted_times.append(DayPrayerTimes(
                date=pt['date'],
                hijri_date=pt['hijri_date'],
                prayer_times=PrayerTimesData(
                    imsak=pt['imsak'],
                    suboh=pt['suboh'],
                    syuruk=pt['syuruk'],
                    doha=pt['doha'],
                    zohor=pt['zohor'],
                    asar=pt['asar'],
                    maghrib=pt['maghrib'],
                    isyak=pt['isyak']
                )
            ))

        logger.info(f"Returning {len(formatted_times)} days for year {year}")

        return YearlyPrayerTimesResponse(
            year=year,
            location="Brunei Darussalam",
            timezone="Asia/Brunei",
            source="MORA Brunei",
            last_updated=datetime.utcnow().isoformat() + "Z",
            prayer_times=formatted_times
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching year {year}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch prayer times: {str(e)}"
        )


@router.get("/today", response_model=SingleDayResponse)
async def get_today_prayer_times():
    """
    Get prayer times for today

    Returns prayer times for the current date in Brunei timezone.
    """
    try:
        db = get_db()
        today_str = date.today().strftime('%Y-%m-%d')

        prayer_times = db.get_prayer_times_by_date(today_str)

        if not prayer_times:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Prayer times for today ({today_str}) not found in database"
            )

        logger.info(f"Returning prayer times for today: {today_str}")

        return SingleDayResponse(
            date=prayer_times['date'],
            hijri_date=prayer_times['hijri_date'],
            location="Brunei Darussalam",
            prayer_times=PrayerTimesData(
                imsak=prayer_times['imsak'],
                suboh=prayer_times['suboh'],
                syuruk=prayer_times['syuruk'],
                doha=prayer_times['doha'],
                zohor=prayer_times['zohor'],
                asar=prayer_times['asar'],
                maghrib=prayer_times['maghrib'],
                isyak=prayer_times['isyak']
            ),
            timezone="Asia/Brunei",
            source="MORA Brunei"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching today's prayer times: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch prayer times: {str(e)}"
        )


@router.get("/{date_str}", response_model=SingleDayResponse)
async def get_prayer_times_by_date(date_str: str):
    """
    Get prayer times for a specific date

    - **date_str**: Date in YYYY-MM-DD format (e.g., "2026-02-16")
    """
    try:
        # Validate date format
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD (e.g., 2026-02-16)"
            )

        db = get_db()
        prayer_times = db.get_prayer_times_by_date(date_str)

        if not prayer_times:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Prayer times for {date_str} not found in database"
            )

        logger.info(f"Returning prayer times for date: {date_str}")

        return SingleDayResponse(
            date=prayer_times['date'],
            hijri_date=prayer_times['hijri_date'],
            location="Brunei Darussalam",
            prayer_times=PrayerTimesData(
                imsak=prayer_times['imsak'],
                suboh=prayer_times['suboh'],
                syuruk=prayer_times['syuruk'],
                doha=prayer_times['doha'],
                zohor=prayer_times['zohor'],
                asar=prayer_times['asar'],
                maghrib=prayer_times['maghrib'],
                isyak=prayer_times['isyak']
            ),
            timezone="Asia/Brunei",
            source="MORA Brunei"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching prayer times for {date_str}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch prayer times: {str(e)}"
        )
