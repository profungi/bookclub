#!/usr/bin/env python3
"""
Generate static HTML pages for filtered event views.
Creates today.html, tomorrow.html, this-month.html, next-month.html, online.html
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone
from jinja2 import Environment, FileSystemLoader

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def load_events():
    """Load events from events.json"""
    events_file = Path(__file__).parent.parent / 'public' / 'events.json'

    if not events_file.exists():
        print(f"Error: {events_file} not found")
        return []

    with open(events_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        return data.get('events', [])

def parse_date(date_str):
    """Parse ISO date string to datetime object"""
    try:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except:
        return None

def format_date_for_display(date_str):
    """Format date for display in table"""
    dt = parse_date(date_str)
    if not dt:
        return ''

    # Convert to local time for display
    weekday = dt.strftime('%a')
    month = dt.strftime('%b')
    day = dt.day
    time = dt.strftime('%-I:%M %p' if sys.platform != 'win32' else '%I:%M %p')

    return f"{weekday} · {month} {day} · {time}"

def generate_week_slots(date_str):
    """Generate week day slots HTML"""
    dt = parse_date(date_str)
    if not dt:
        return '<span style="color: #9ca3af;">—</span>'

    day_of_week = dt.weekday()  # 0=Monday, 6=Sunday
    days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

    slots = []
    for i, label in enumerate(days):
        active_class = ' active' if i == day_of_week else ''
        slots.append(f'<div class="week-slot{active_class}">{label}</div>')

    return '<div class="week-slots">' + ''.join(slots) + '</div>'

def is_today(event_date_str):
    """Check if event is today (generous range for timezone coverage)"""
    event_dt = parse_date(event_date_str)
    if not event_dt:
        return False

    now_utc = datetime.now(timezone.utc)
    # Include events from UTC-12 to UTC+14 (covers all timezones)
    today_start = datetime(now_utc.year, now_utc.month, now_utc.day, tzinfo=timezone.utc) - timedelta(hours=12)
    today_end = today_start + timedelta(hours=38)  # 24 + 14 hours

    return today_start <= event_dt < today_end

def is_tomorrow(event_date_str):
    """Check if event is tomorrow"""
    event_dt = parse_date(event_date_str)
    if not event_dt:
        return False

    now_utc = datetime.now(timezone.utc)
    tomorrow_start = datetime(now_utc.year, now_utc.month, now_utc.day, tzinfo=timezone.utc) + timedelta(days=1, hours=-12)
    tomorrow_end = tomorrow_start + timedelta(hours=38)

    return tomorrow_start <= event_dt < tomorrow_end

def is_this_month(event_date_str):
    """Check if event is this month (from today to end of month)"""
    event_dt = parse_date(event_date_str)
    if not event_dt:
        return False

    now_utc = datetime.now(timezone.utc)
    month_start = datetime(now_utc.year, now_utc.month, now_utc.day, tzinfo=timezone.utc)

    # End of current month
    if now_utc.month == 12:
        month_end = datetime(now_utc.year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        month_end = datetime(now_utc.year, now_utc.month + 1, 1, tzinfo=timezone.utc)

    return month_start <= event_dt < month_end

def is_next_month(event_date_str):
    """Check if event is next month"""
    event_dt = parse_date(event_date_str)
    if not event_dt:
        return False

    now_utc = datetime.now(timezone.utc)

    # Start of next month
    if now_utc.month == 12:
        next_month_start = datetime(now_utc.year + 1, 1, 1, tzinfo=timezone.utc)
        next_month_end = datetime(now_utc.year + 1, 2, 1, tzinfo=timezone.utc)
    else:
        next_month_start = datetime(now_utc.year, now_utc.month + 1, 1, tzinfo=timezone.utc)
        if now_utc.month == 11:
            next_month_end = datetime(now_utc.year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            next_month_end = datetime(now_utc.year, now_utc.month + 2, 1, tzinfo=timezone.utc)

    return next_month_start <= event_dt < next_month_end

def is_online(event):
    """Check if event is online"""
    return event.get('is_virtual', False) == True

def filter_expired_events(events):
    """Remove events that have already ended"""
    now_utc = datetime.now(timezone.utc)
    filtered = []

    for event in events:
        # Check end date first
        if event.get('end_date'):
            end_dt = parse_date(event['end_date'])
            if end_dt and end_dt < now_utc:
                continue
        elif event.get('start_date'):
            # If no end date, assume 3 hour duration
            start_dt = parse_date(event['start_date'])
            if start_dt:
                approx_end = start_dt + timedelta(hours=3)
                if approx_end < now_utc:
                    continue

        filtered.append(event)

    return filtered

# Page configurations
PAGE_CONFIGS = [
    {
        'filename': 'today.html',
        'filter_type': 'today',
        'filter_fn': is_today,
        'title': 'Book Club Events Today | Find Events Happening Now',
        'description': 'Find book club events happening today across North America. Join in-person or online discussions. Updated daily with events from 66 libraries.',
        'keywords': 'book club today, book club events today, library events today, book discussion today',
        'heading': 'Book Club Events <span class="highlight">Today</span>',
        'subtitle': 'Join a book discussion happening today',
        'badge_text': 'Events Today',
        'empty_message': 'No events scheduled for today. Check back tomorrow or view all events!'
    },
    {
        'filename': 'tomorrow.html',
        'filter_type': 'tomorrow',
        'filter_fn': is_tomorrow,
        'title': 'Book Club Events Tomorrow | Plan Your Next Discussion',
        'description': 'Browse book club events happening tomorrow. Plan ahead and join your local reading community. Updated daily.',
        'keywords': 'book club tomorrow, tomorrow book clubs, library events tomorrow',
        'heading': 'Book Club Events <span class="highlight">Tomorrow</span>',
        'subtitle': 'Plan ahead with tomorrow\'s book discussions',
        'badge_text': 'Events Tomorrow',
        'empty_message': 'No events scheduled for tomorrow. Check out this week\'s events!'
    },
    {
        'filename': 'this-month.html',
        'filter_type': 'this-month',
        'filter_fn': is_this_month,
        'title': 'Book Club Events This Month | Monthly Reading Schedule',
        'description': 'Browse all book club events happening this month. Find your perfect reading group from 1400+ events across North America.',
        'keywords': 'book club this month, monthly book clubs, library events this month',
        'heading': 'Book Club Events <span class="highlight">This Month</span>',
        'subtitle': 'Explore all book club events happening this month',
        'badge_text': 'Events This Month',
        'empty_message': 'Check next month for upcoming events!'
    },
    {
        'filename': 'next-month.html',
        'filter_type': 'next-month',
        'filter_fn': is_next_month,
        'title': 'Book Club Events Next Month | Plan Ahead',
        'description': 'Plan ahead with book club events next month. Browse upcoming discussions and reserve your spot early.',
        'keywords': 'book club next month, upcoming book clubs, future library events',
        'heading': 'Book Club Events <span class="highlight">Next Month</span>',
        'subtitle': 'Plan ahead with next month\'s schedule',
        'badge_text': 'Events Next Month',
        'empty_message': 'Events for next month will be available soon!'
    },
    {
        'filename': 'online.html',
        'filter_type': 'online',
        'filter_fn': is_online,
        'title': 'Online Book Club Events | Join from Anywhere',
        'description': 'Join virtual book club discussions from anywhere. Browse 100+ online book club events from libraries across North America.',
        'keywords': 'online book clubs, virtual book clubs, zoom book clubs, remote book discussions',
        'heading': 'Online Book Club <span class="highlight">Events</span>',
        'subtitle': 'Join virtual book discussions from anywhere',
        'badge_text': 'Online Events',
        'empty_message': 'Check back soon for more online events!'
    }
]

def generate_static_pages():
    """Generate all static filter pages"""
    print("Loading events...")
    all_events = load_events()

    if not all_events:
        print("No events found. Exiting.")
        return

    print(f"Loaded {len(all_events)} events")

    # Filter out expired events
    all_events = filter_expired_events(all_events)
    print(f"After filtering expired: {len(all_events)} events")

    # Setup Jinja2
    template_dir = Path(__file__).parent.parent / 'templates'
    env = Environment(loader=FileSystemLoader(str(template_dir)))
    template = env.get_template('filtered_page.html')

    output_dir = Path(__file__).parent.parent / 'public'
    generation_time = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')

    # Generate each page
    for config in PAGE_CONFIGS:
        print(f"\nGenerating {config['filename']}...")

        # Filter events
        if config['filter_type'] == 'online':
            # Online filter works differently
            filtered_events = [e for e in all_events if config['filter_fn'](e)]
        else:
            # Date-based filters
            filtered_events = [e for e in all_events if config['filter_fn'](e.get('start_date', ''))]

        print(f"  Found {len(filtered_events)} matching events")

        # Prepare events for template (add formatted fields)
        prepared_events = []
        for event in filtered_events:
            event_copy = event.copy()
            event_copy['formatted_date'] = format_date_for_display(event.get('start_date', ''))
            event_copy['week_slots'] = generate_week_slots(event.get('start_date', ''))
            prepared_events.append(event_copy)

        # Sort by date
        prepared_events.sort(key=lambda e: e.get('start_date', ''))

        # Render template
        html = template.render(
            page_config=config,
            events=prepared_events,
            events_json=json.dumps(prepared_events),
            generation_time=generation_time
        )

        # Write file
        output_file = output_dir / config['filename']
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html)

        print(f"  ✓ Generated {output_file}")

    print(f"\n✅ Successfully generated {len(PAGE_CONFIGS)} static pages")

if __name__ == '__main__':
    generate_static_pages()
