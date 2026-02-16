# IstiqamahBN - Progressive Web App

A minimal, natural-feeling Islamic prayer times and spiritual companion app for Brunei Muslims.

## Features

### ✅ Completed Features

1. **Prayer Times Display**
   - All 8 prayer times (Imsak, Suboh, Syuruk, Doha, Zohor, Asar, Maghrib, Isyak)
   - Live countdown to next prayer
   - Hijri date display
   - District selector with automatic time adjustments:
     - Brunei Muara/Temburong: +0 minutes
     - Tutong: +1 minute
     - Belait: +3 minutes

2. **Tasbih Counter**
   - Large tap area with haptic feedback
   - Circular progress visualization
   - Target counts: 33, 99, 100, custom
   - History tracking via localStorage
   - Visual and haptic feedback on completion

3. **Quran Page Tracker**
   - Track reading progress (pages 1-604)
   - Progress percentage and Juz display
   - Quick increment/decrement buttons (-10, -5, -1, +1, +5, +10)
   - Circular progress visualization
   - Completion celebration

4. **Qadha Tracker**
   - Track missed prayers by type (Suboh, Zohor, Asar, Maghrib, Isyak)
   - Add/subtract functionality
   - Total count display
   - localStorage persistence

5. **Daily Hadith**
   - 30 encouraging hadiths that rotate daily
   - Clean typography with proper citations
   - Encouraging, not enforcing tone

6. **Settings**
   - Dark mode toggle
   - Notification preferences
   - End time reminders
   - Reminder advance time (5/10/15/20 minutes)

7. **PWA Features**
   - Installable on home screen
   - Offline-first with service worker
   - Cached prayer times and static assets
   - Web Push Notifications support
   - Responsive mobile-first design

## Tech Stack

- **Frontend**: Vanilla JavaScript (no framework for maximum performance)
- **CSS**: Custom CSS with CSS Variables for theming
- **Fonts**:
  - Crimson Pro (display)
  - Manrope (body)
  - Amiri (Arabic)
- **Storage**: localStorage for all data persistence
- **Backend API**: FastAPI at `http://localhost:8000`

## File Structure

```
webapp/
├── index.html              # Main HTML structure
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker for offline functionality
├── css/
│   └── styles.css         # Complete app styling (1109 lines)
├── js/
│   ├── api.js             # Backend API client
│   ├── prayer-times.js    # Prayer times display & countdown
│   ├── tasbih.js          # Tasbih counter logic
│   ├── quran-tracker.js   # Quran progress tracker
│   ├── qadha.js           # Qadha prayer tracker
│   ├── hadith.js          # Daily hadith rotation
│   └── app.js             # Main app controller & navigation
└── icons/                  # PWA icons (need to be created)
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    └── icon-512.png
```

## Setup Instructions

### 1. Start the Backend

Make sure the FastAPI backend is running:

```bash
cd ~/projects/istiqamah-bn/backend
source venv/bin/activate  # If using virtualenv
python -m uvicorn app.main:app --reload
```

Backend should be running at `http://localhost:8000`

### 2. Serve the Webapp

You can use any static file server. For example:

**Using Python:**
```bash
cd ~/projects/istiqamah-bn/webapp
python -m http.server 8080
```

**Using Node.js:**
```bash
cd ~/projects/istiqamah-bn/webapp
npx serve -p 8080
```

### 3. Access the App

Open your browser to `http://localhost:8080`

### 4. Install as PWA

On mobile or desktop:
1. Visit the app in a browser
2. Look for "Install" or "Add to Home Screen" prompt
3. Click Install to add to your device

## Required Assets

### PWA Icons

You need to create app icons in the following sizes and place them in `webapp/icons/`:

- icon-72.png (72x72px)
- icon-96.png (96x96px)
- icon-128.png (128x128px)
- icon-144.png (144x144px)
- icon-152.png (152x152px)
- icon-192.png (192x192px)
- icon-384.png (384x384px)
- icon-512.png (512x512px)

**Design Guidelines:**
- Use the app's color palette (teal deep: #0F4C5C, gold: #D4AF37)
- Consider Islamic geometric patterns or crescent moon motif
- Ensure icons work on both light and dark backgrounds
- Use maskable icon format for Android adaptive icons

### Optional Screenshots

For app store listings, create screenshots:
- prayer-times.png (540x720px, mobile portrait)
- tasbih.png (540x720px, mobile portrait)

## Design Aesthetic

**Modern Islamic Serenity**

- **Colors**:
  - Teal deep (#0F4C5C), Teal (#5C8D89)
  - Gold (#D4AF37), Gold muted (#C9A961)
  - Cream (#FAF9F6), Dawn (#F4EAE0)

- **Typography**:
  - Display: Crimson Pro (elegant serif)
  - Body: Manrope (modern sans-serif)
  - Arabic: Amiri (traditional Arabic font)

- **Patterns**:
  - Subtle Islamic geometric patterns in background
  - Circular progress visualizations
  - Smooth animations and transitions
  - Generous use of gradients and shadows

## Browser Compatibility

- Chrome/Edge: Full support
- Safari: Full support (iOS 11.3+)
- Firefox: Full support
- Service Worker requires HTTPS in production

## Deployment

### Production Checklist

1. **Update API URL** in `js/api.js`:
   ```javascript
   baseURL: 'https://your-backend-domain.com'
   ```

2. **Generate Icons**: Create all required icon sizes

3. **HTTPS Required**: PWA features require HTTPS in production

4. **Update manifest.json**: Set correct start_url and scope for your domain

5. **Service Worker Cache**: Update CACHE_NAME version when deploying updates

### Deployment Options

- **Vercel/Netlify**: Simple deployment for static frontend
- **GitHub Pages**: Free hosting for PWA
- **Self-hosted**: Use nginx or Apache to serve static files

## Testing

### Local Testing

1. Start backend on port 8000
2. Serve webapp on port 8080
3. Open http://localhost:8080 in browser
4. Check console for any errors
5. Test all features:
   - Prayer times load correctly
   - Tasbih counter increments
   - Quran tracker updates
   - Qadha tracker persists data
   - Dark mode toggle works
   - Offline mode (stop backend and refresh)

### PWA Testing

1. Open Chrome DevTools
2. Go to Application tab
3. Check:
   - Service Worker is registered
   - Manifest is valid
   - Cache Storage contains assets
   - Install prompt appears

## Future Enhancements

Potential features to add:
- Push notifications for prayer times
- Qibla direction finder
- Prayer time reminder sounds
- Export/import data
- Sync across devices
- Multiple languages (Malay, Jawi)

## License

Built with ❤️ for the Muslim community of Brunei Darussalam

## Support

For issues or questions, contact the developer or file an issue in the project repository.
