# 📚 Book Club Event Finder

A mobile-friendly web application for discovering book club events from libraries across North America. Search and filter through 1400+ events from 66+ libraries.

## Features

- 🔍 **Search**: Find events by title, library, book name, or topic
- 📅 **Date Filters**: Quick filters for today, tomorrow, this week, this month, next month
- 🌐 **Location Filters**: Filter by online/in-person events and by state/province
- 📱 **Mobile-First Design**: Optimized for smartphones, tablets, and desktops
- 🎨 **Card Layout**: Beautiful event cards with images, badges, and book information
- 📖 **Detailed View**: Click any event to see full details and registration links
- 🔄 **Auto-Updated**: Events data refreshes daily via GitHub Actions

## Live Demo

[Deploy to Vercel, Netlify, or GitHub Pages]

## Project Structure

```
bookclub-finder/
├── public/                      # Web app files
│   ├── index.html              # Main page with event cards
│   ├── event.html              # Event detail page
│   ├── events.json             # Generated events data
│   ├── css/
│   │   └── styles.css          # Responsive styles
│   └── js/
│       ├── utils.js            # Utility functions
│       └── search.js           # Search & filter logic
├── scripts/
│   └── fetch_rss_events.py     # RSS fetching script
├── .github/
│   └── workflows/
│       └── fetch-events.yml    # Daily update automation
└── bookclub_gateway_rss_verified.csv  # Library RSS URLs
```

## How It Works

1. **Data Collection**: Python script fetches RSS feeds from 66 libraries
2. **Parsing**: Extracts event details (title, date, location, images, books, etc.)
3. **Storage**: Consolidates all events into a single JSON file
4. **Display**: JavaScript loads and filters events on the client side
5. **Automation**: GitHub Actions runs the script daily to keep data fresh

## Local Development

### Run the website locally

You can use any static file server. Here are a few options:

**Option 1: Python**
```bash
cd public
python3 -m http.server 8000
# Visit http://localhost:8000
```

**Option 2: Node.js**
```bash
cd public
npx serve
```

**Option 3: VS Code**
Install "Live Server" extension and open `public/index.html`

### Update events data

```bash
# Make sure you're in the project root
python3 scripts/fetch_rss_events.py

# This will:
# - Fetch all 66 RSS feeds
# - Parse events
# - Generate public/events.json
# - Takes about 2-3 minutes
```

## Deployment

### Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set build settings:
   - **Framework Preset**: Other
   - **Root Directory**: `public`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Deploy!

GitHub Actions will automatically update `events.json` daily, and Vercel will redeploy.

### Deploy to Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. New site from Git
4. Build settings:
   - **Base directory**: `public`
   - **Build command**: (leave empty)
   - **Publish directory**: `.` (current directory)
5. Deploy!

### Deploy to GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main`, Folder: `/public`
4. Save

Visit `https://yourusername.github.io/bookclub-finder/`

## Data Sources

Events are collected from BiblioCommons library systems across:
- 🇺🇸 United States (multiple states)
- 🇨🇦 Canada (Alberta, Ontario, Nova Scotia, etc.)
- 🇳🇿 New Zealand (Christchurch)

All data is publicly available via library RSS feeds.

## Customization

### Add more libraries

Edit `bookclub_gateway_rss_verified.csv`:
```csv
library_name,slug,bookclub_rss_url
Your Library,yourlib,https://gateway.bibliocommons.com/v2/libraries/yourlib/rss/events?q=book%20club
```

### Change update frequency

Edit `.github/workflows/fetch-events.yml`:
```yaml
schedule:
  - cron: '0 3 * * *'  # Change time/frequency
```

### Customize colors

Edit `public/css/styles.css` `:root` variables:
```css
:root {
  --primary-color: #1e3a5f;  /* Change to your color */
  --online-color: #2563eb;
  --in-person-color: #16a34a;
}
```

## Technologies Used

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Data**: Python 3, RSS/XML parsing
- **Automation**: GitHub Actions
- **Deployment**: Vercel/Netlify/GitHub Pages

## License

MIT License - Feel free to use and modify!

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

If you find this useful, please star the repository! ⭐

For issues or questions, please open a GitHub issue.

---

Built with ❤️ for book lovers everywhere
