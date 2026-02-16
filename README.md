# IstiqamahBN - استقامة

> **Prayer times and spiritual companion for Brunei Muslims**

A minimal, natural-feeling Progressive Web App that provides accurate prayer times from MORA Brunei, along with spiritual tracking tools (Tasbih, Quran progress, Qadha, daily Hadith).

---

## 🚀 Quick Start with Docker

The entire application runs as two Docker containers: a FastAPI backend and an Nginx-served frontend.

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- 2GB free disk space
- Ports 80 and 8000 available

### Start the Application

```bash
cd ~/projects/istiqamah-bn
docker compose up --build
```

This will:
1. Build the backend API container (Python FastAPI)
2. Build the frontend webapp container (Nginx static server)
3. Start both services

**Access the app:**
- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Stop the Application

```bash
docker compose down
```

To remove all data (database, logs):
```bash
docker compose down -v
```

---

## 📁 Project Structure

```
istiqamah-bn/
├── docker-compose.yml          # Orchestrates both services
├── README.md                   # This file
│
├── backend/                    # FastAPI Backend
│   ├── Dockerfile
│   ├── docker-compose.yml      # Legacy, use root compose now
│   ├── requirements.txt
│   ├── data/                   # SQLite database (persisted)
│   ├── logs/                   # Application logs (persisted)
│   └── app/
│       ├── main.py             # FastAPI entry point
│       ├── api/                # API routes and models
│       ├── database/           # SQLite database handler
│       ├── scrapers/           # MORA SharePoint scraper
│       └── ...
│
└── webapp/                     # Progressive Web App
    ├── Dockerfile              # Nginx container
    ├── nginx.conf              # Nginx configuration
    ├── index.html              # Main HTML
    ├── manifest.json           # PWA manifest
    ├── sw.js                   # Service Worker
    ├── css/
    │   └── styles.css          # Complete styling
    ├── js/
    │   ├── api.js              # Backend client
    │   ├── prayer-times.js     # Prayer times logic
    │   ├── tasbih.js           # Tasbih counter
    │   ├── quran-tracker.js    # Quran progress
    │   ├── qadha.js            # Qadha tracker
    │   ├── hadith.js           # Daily hadith
    │   └── app.js              # Main controller
    └── icons/                  # PWA icons (need to create)
```

---

## ✨ Features

### Core Features
- ✅ **Prayer Times** - Real-time prayer times from MORA Brunei (via SharePoint API)
- ✅ **District Selection** - Automatic time adjustments for Brunei Muara, Tutong, Belait
- ✅ **Live Countdown** - Real-time countdown to next prayer
- ✅ **Hijri Calendar** - Islamic date display
- ✅ **Tasbih Counter** - Digital dhikr counter with haptic feedback
- ✅ **Quran Tracker** - Track reading progress (604 pages, 30 Juz)
- ✅ **Qadha Tracker** - Track and manage missed prayers
- ✅ **Daily Hadith** - Rotating collection of 30 encouraging hadiths
- ✅ **Dark Mode** - Eye-friendly dark theme
- ✅ **Progressive Web App** - Install on any device
- ✅ **Offline Support** - Works without internet connection

### Technical Features
- ✅ **API Caching** - Smart caching with offline fallback
- ✅ **Service Worker** - Offline-first architecture
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Accessibility** - ARIA labels, semantic HTML, keyboard navigation
- ✅ **Performance** - Vanilla JS, minimal dependencies, optimized assets

---

## 🛠️ Development Setup

### Option 1: Docker (Recommended)

```bash
# Build and start
docker compose up --build

# Rebuild after code changes
docker compose up --build --force-recreate

# View logs
docker compose logs -f

# Access containers
docker exec -it istiqamah-backend sh
docker exec -it istiqamah-webapp sh
```

### Option 2: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd webapp
python -m http.server 8080
# Or: npx serve -p 8080
```

Then update `webapp/js/api.js` to use `http://localhost:8000`:
```javascript
baseURL: 'http://localhost:8000'
```

---

## 🎨 Design Philosophy

**"Modern Islamic Serenity"**

- **Minimal UI** - Clean, distraction-free interface
- **Natural Feel** - Smooth animations, organic transitions
- **Encouraging Tone** - Supportive, not forceful
- **Islamic Aesthetic** - Teal & gold palette, geometric patterns
- **Typography** - Crimson Pro (display), Manrope (body), Amiri (Arabic)

---

## 📊 Backend Architecture

### Data Source
Prayer times are scraped from MORA Brunei's official SharePoint API:
```
https://www.mora.gov.bn/_api/web/lists/getbytitle('Waktu Sembahyang')/items
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/v1/prayer-times/brunei/today` | Today's prayer times |
| GET | `/api/v1/prayer-times/brunei/{date}` | Specific date (YYYY-MM-DD) |
| GET | `/api/v1/prayer-times/brunei/year/{year}` | Full year data |

### Database
- **Type:** SQLite
- **Location:** `backend/data/prayer_times.db`
- **Schema:** Prayer times table with 8 times per day + Hijri date
- **Persistence:** Mounted as Docker volume

---

## 🔧 Configuration

### Environment Variables

**Backend** (set in `docker-compose.yml` or `.env`):
```bash
DATABASE_PATH=/app/data/prayer_times.db
LOG_DIR=/app/logs
```

**Frontend:**
No environment variables needed. API URL is handled by nginx proxy.

### Nginx Configuration

The webapp uses nginx to:
- Serve static files (HTML, CSS, JS)
- Proxy `/api/*` requests to backend container
- Set correct MIME types for PWA files
- Enable gzip compression
- Add security headers

Edit `webapp/nginx.conf` to customize.

---

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Visit http://localhost
2. Click the install icon (➕) in address bar
3. Click "Install"

### Mobile (iOS Safari)
1. Visit http://localhost (use your computer's IP address)
2. Tap Share button
3. Tap "Add to Home Screen"

### Mobile (Android Chrome)
1. Visit the app
2. Tap the "Install" banner or menu → "Install app"

### Required: App Icons

Before deploying, create app icons:
```bash
cd webapp/icons
# Create these PNG files:
# icon-72.png, icon-96.png, icon-128.png, icon-144.png
# icon-152.png, icon-192.png, icon-384.png, icon-512.png
```

**Design tips:**
- Use teal (#0F4C5C) and gold (#D4AF37) colors
- Islamic geometric patterns or crescent moon
- Ensure legibility at small sizes
- Use maskable icon format for Android

---

## 🚢 Production Deployment

### Docker Production

1. **Update API URL** (if using separate domains):
   - Edit `webapp/nginx.conf` to point to production backend

2. **Set up HTTPS** (required for PWA):
   ```bash
   # Add SSL certificates to nginx
   # Update nginx.conf with SSL config
   ```

3. **Update manifest.json**:
   ```json
   {
     "start_url": "https://yourdomain.com/",
     "scope": "https://yourdomain.com/"
   }
   ```

4. **Build and deploy**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

### Hosting Options

**Backend:**
- DigitalOcean App Platform
- AWS ECS / Fargate
- Google Cloud Run
- Heroku
- Railway
- Self-hosted VPS with Docker

**Frontend:**
- Vercel (with backend proxy)
- Netlify (with backend proxy)
- Cloudflare Pages
- GitHub Pages (static only)
- Self-hosted with Nginx

---

## 🧪 Testing

### Local Testing Checklist

```bash
# 1. Start services
docker compose up

# 2. Check backend health
curl http://localhost:8000/api/health

# 3. Check prayer times API
curl http://localhost:8000/api/v1/prayer-times/brunei/today

# 4. Visit frontend
open http://localhost

# 5. Test features:
# ☐ Prayer times display
# ☐ District selector changes times
# ☐ Countdown updates
# ☐ Tasbih counter increments
# ☐ Quran tracker updates
# ☐ Qadha tracker persists
# ☐ Dark mode toggle
# ☐ Offline mode (stop backend)
# ☐ PWA install prompt
```

### Browser DevTools

Check in Chrome DevTools → Application:
- Service Worker is registered and active
- Manifest is valid
- Cache Storage contains assets
- Local Storage has app data

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
docker compose logs backend

# Common issues:
# - Port 8000 already in use
# - Database file permissions
# - Missing environment variables
```

### Frontend won't load
```bash
# Check logs
docker compose logs webapp

# Common issues:
# - Port 80 already in use (use sudo or change port)
# - Backend not running (webapp depends on it)
# - Nginx configuration error
```

### API requests fail
```bash
# Check if containers can communicate
docker exec istiqamah-webapp ping backend

# Check nginx proxy config
docker exec istiqamah-webapp cat /etc/nginx/conf.d/nginx.conf

# Test API directly
curl http://localhost:8000/api/v1/prayer-times/brunei/today
```

### Service Worker not registering
- Must use HTTPS in production (or localhost)
- Check Console for errors
- Clear browser cache and re-register

---

## 📝 Maintenance

### Update Prayer Times Data

The backend automatically scrapes MORA data on first run. To refresh:

```bash
# Delete database
rm backend/data/prayer_times.db

# Restart backend
docker compose restart backend

# Backend will re-scrape on startup
```

### Update Dependencies

**Backend:**
```bash
cd backend
pip install --upgrade -r requirements.txt
pip freeze > requirements.txt
docker compose build backend
```

**Frontend:**
No dependencies - vanilla JavaScript!

### View Logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Webapp only
docker compose logs -f webapp

# Last 100 lines
docker compose logs --tail=100
```

---

## 🤝 Contributing

### Adding New Features

1. Create feature branch
2. Develop and test locally
3. Update documentation
4. Test in Docker
5. Submit PR

### Code Style

- **Backend:** PEP 8 (Python)
- **Frontend:** Standard JS conventions
- **CSS:** BEM-like naming
- **Comments:** Clear, concise, explain why not what

---

## 📜 License

Built with ❤️ for the Muslim community of Brunei Darussalam

---

## 🙏 Acknowledgments

- **MORA Brunei** for providing prayer time data
- **Islamic Fonts** from Google Fonts (Amiri)
- **Muslim community** for feedback and support

---

## 📞 Support

For issues, questions, or feature requests:
1. Check this README
2. Check `webapp/README.md` for frontend details
3. Check backend logs: `docker compose logs backend`
4. File an issue on the project repository

---

**May Allah accept our efforts. Ameen.**

**استقامة - Istiqamah: Firmness and steadfastness in faith**
