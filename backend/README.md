# IstiqamahBN Backend API

Backend service for IstiqamahBN iOS app - provides prayer times for Brunei from MORA.

## Overview

This FastAPI-based backend:
- Scrapes prayer times from MORA Brunei website
- Stores full year's prayer times in SQLite database
- Provides REST API for iOS app to fetch prayer times
- Runs in Docker container for easy deployment

## Features

- ✅ Annual scraping of all 8 prayer times (Imsak, Suboh, Syuruk, Doha, Zohor, Asar, Maghrib, Isyak)
- ✅ SQLite database with indexed queries
- ✅ REST API with Pydantic validation
- ✅ Health check endpoint
- ✅ Automatic API documentation (Swagger/OpenAPI)
- ✅ In-memory caching (24-hour TTL)

## Tech Stack

- **Python 3.11**
- **FastAPI** - Modern web framework
- **SQLite** - Lightweight database
- **BeautifulSoup4** - HTML parsing
- **hijri-converter** - Gregorian to Hijri conversion
- **Docker** - Containerization

## API Endpoints

### Prayer Times

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/prayer-times/brunei/year/{year}` | Get full year's prayer times |
| GET | `/api/v1/prayer-times/brunei/today` | Get today's prayer times |
| GET | `/api/v1/prayer-times/brunei/{date}` | Get specific date's prayer times (YYYY-MM-DD) |
| GET | `/api/health` | Health check |

### API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Internet connection (for scraping MORA website)

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env if needed (optional)
nano .env
```

### 2. Build and Run

```bash
# Build Docker image
docker-compose build

# Start service
docker-compose up -d

# Check logs
docker-compose logs -f
```

The API will be available at: `http://localhost:8000`

### 3. Run Prayer Times Scraper

```bash
# Enter container
docker-compose exec api sh

# Run scraper for current year
python -m app.scrapers.scrape_year

# Or specify year
python -m app.scrapers.scrape_year --year 2026
```

## Development

### Local Development (without Docker)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Run Tests

```bash
# Install dev dependencies
pip install pytest pytest-cov

# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

## Project Structure

```
backend/
├── app/
│   ├── api/            # API routes and models
│   ├── core/           # Core utilities (logging, config)
│   ├── scrapers/       # MORA website scraper
│   ├── database/       # SQLite database
│   ├── utils/          # Utilities (caching)
│   └── main.py         # FastAPI app entry point
├── tests/              # Unit tests
├── Dockerfile          # Docker image definition
├── docker-compose.yml  # Docker Compose setup
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

## Deployment

### Production Deployment

1. **Set up server** (Ubuntu 22.04 recommended)

2. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Clone repository**:
   ```bash
   git clone <your-repo>
   cd istiqamah-bn/backend
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

5. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

6. **Set up SSL** (recommended - use Nginx as reverse proxy):
   ```bash
   # Install Nginx
   sudo apt install nginx certbot python3-certbot-nginx

   # Configure reverse proxy
   # (Add Nginx config for your domain)

   # Get SSL certificate
   sudo certbot --nginx -d api.yourdomain.com
   ```

7. **Run initial scrape**:
   ```bash
   docker-compose exec api python -m app.scrapers.scrape_year
   ```

### Yearly Update Schedule

Set up a cron job to scrape new year's data on January 1st:

```bash
# Edit crontab
crontab -e

# Add this line (runs at midnight on Jan 1st)
0 0 1 1 * cd /path/to/istiqamah-bn/backend && docker-compose exec -T api python -m app.scrapers.scrape_year
```

## Monitoring

### Health Check

```bash
curl http://localhost:8000/api/health
```

### Docker Logs

```bash
# View logs
docker-compose logs -f

# View specific service
docker-compose logs -f api
```

### Database Inspection

```bash
# Enter container
docker-compose exec api sh

# Open SQLite
sqlite3 /app/data/prayer_times.db

# Run queries
SELECT COUNT(*) FROM prayer_times;
SELECT * FROM prayer_times WHERE date = '2026-02-16';
```

## Troubleshooting

### Issue: Scraper fails to fetch MORA website

**Solution**:
- Check internet connection
- Verify MORA website is accessible: `curl https://www.mora.gov.bn/SitePages/WaktuSembahyang.aspx`
- Check if website structure has changed (may need scraper update)

### Issue: Database locked

**Solution**:
```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Restart
docker-compose up -d
```

### Issue: API returns 404 for prayer times

**Solution**:
- Ensure scraper has been run: `docker-compose exec api python -m app.scrapers.scrape_year`
- Check database has data: `docker-compose exec api sqlite3 /app/data/prayer_times.db "SELECT COUNT(*) FROM prayer_times;"`

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/istiqamah-bn/issues)
- Email: your@email.com

---

*Built with ❤️ for the Muslim community of Brunei Darussalam*
