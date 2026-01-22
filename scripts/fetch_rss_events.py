#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch book club events from all RSS feeds and generate a consolidated JSON file.

This script:
1. Reads RSS URLs from bookclub_gateway_rss_verified.csv
2. Fetches and parses each RSS feed
3. Extracts event details (title, date, location, image, etc.)
4. Consolidates all events into a single JSON file
5. Outputs to public/events.json

Run: python scripts/fetch_rss_events.py
"""

import csv
import json
import re
import sys
import time
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from xml.etree import ElementTree as ET
from typing import List, Dict, Optional

USER_AGENT = "Mozilla/5.0 (compatible; BookClubEventBot/1.0)"
TIMEOUT = 25
SLEEP_SEC = 0.3

# BiblioCommons namespace
NS = {
    'bc': 'http://bibliocommons.com/rss/1.0/modules/event/',
    'content': 'http://purl.org/rss/1.0/modules/content/'
}

# US state and Canadian province mapping from abbreviation to full name
STATE_NAMES = {
    # US States
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    # Canadian Provinces
    'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba', 'NB': 'New Brunswick',
    'NL': 'Newfoundland and Labrador', 'NS': 'Nova Scotia', 'NT': 'Northwest Territories',
    'NU': 'Nunavut', 'ON': 'Ontario', 'PE': 'Prince Edward Island', 'QC': 'Quebec',
    'SK': 'Saskatchewan', 'YT': 'Yukon',
    # New Zealand (if applicable)
    'NZ': 'New Zealand'
}

def fetch_url(url: str) -> Optional[str]:
    """Fetch URL content with error handling."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  ⚠️  Error fetching {url}: {e}", file=sys.stderr)
        return None

def extract_text(element, tag: str, namespace: Optional[str] = None) -> str:
    """Extract text from XML element."""
    if element is None:
        return ""

    if namespace:
        child = element.find(f"{{{NS[namespace]}}}{tag}")
    else:
        child = element.find(tag)

    if child is not None and child.text:
        return child.text.strip()
    return ""

def parse_date(date_str: str) -> Optional[str]:
    """Parse ISO date string to readable format."""
    if not date_str:
        return None
    try:
        # BiblioCommons uses ISO format like "2026-01-08T03:00:00Z"
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return dt.isoformat()
    except Exception:
        return date_str

def clean_html(html_text: str) -> str:
    """Remove HTML tags and clean text."""
    if not html_text:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', html_text)
    # Decode common HTML entities
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    text = text.replace('&quot;', '"').replace('&#39;', "'").replace('&nbsp;', ' ')
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_categories(item) -> List[str]:
    """Extract all category tags from item."""
    categories = []
    for cat in item.findall('category'):
        if cat.text:
            categories.append(cat.text.strip())
    return categories

def extract_book_info(description: str) -> Optional[Dict[str, str]]:
    """Try to extract book title and author from description."""
    if not description:
        return None

    # Look for book links or titles in description
    book_link = re.search(r'<a[^>]+href="[^"]*?/record/[^"]*"[^>]*>([^<]+)</a>', description)
    if book_link:
        return {"title": clean_html(book_link.group(1))}

    # Look for common patterns like "Book: Title by Author"
    book_pattern = re.search(r'(?:discussing|reading|book:?)\s*["\']?([^"\'<>\n]+?)["\']?\s+by\s+([^<>\n]+)', description, re.IGNORECASE)
    if book_pattern:
        return {
            "title": clean_html(book_pattern.group(1)),
            "author": clean_html(book_pattern.group(2))
        }

    return None

def parse_rss_feed(rss_content: str, library_name: str, library_slug: str) -> List[Dict]:
    """Parse RSS feed and extract event information."""
    events = []

    try:
        root = ET.fromstring(rss_content)
        channel = root.find('channel')
        if channel is None:
            return events

        for item in channel.findall('item'):
            # Extract basic info
            title = extract_text(item, 'title')
            link = extract_text(item, 'link')
            description = item.find('description')
            desc_text = description.text if description is not None else ""

            # Extract image
            enclosure = item.find('enclosure')
            image_url = enclosure.get('url', '') if enclosure is not None else ''

            # Extract BiblioCommons specific fields
            start_date = extract_text(item, 'start_date', 'bc')
            end_date = extract_text(item, 'end_date', 'bc')
            is_virtual = extract_text(item, 'is_virtual', 'bc') == 'true'
            is_cancelled = extract_text(item, 'is_cancelled', 'bc') == 'true'

            # Extract location info
            location = item.find(f"{{{NS['bc']}}}location")
            location_info = {}
            if location is not None:
                location_info = {
                    'name': extract_text(location, 'name', 'bc'),
                    'street': extract_text(location, 'street', 'bc'),
                    'number': extract_text(location, 'number', 'bc'),
                    'city': extract_text(location, 'city', 'bc'),
                    'state': extract_text(location, 'state', 'bc'),
                    'zip': extract_text(location, 'zip', 'bc'),
                    'details': extract_text(location, 'location_details', 'bc')
                }

            # Extract registration info
            reg_info = item.find(f"{{{NS['bc']}}}registration_info")
            registration = {}
            if reg_info is not None:
                registration = {
                    'required': extract_text(reg_info, 'is_required', 'bc') == 'true',
                    'full': extract_text(reg_info, 'is_full', 'bc') == 'true',
                    'capacity': extract_text(reg_info, 'capacity', 'bc'),
                    'registered': extract_text(reg_info, 'number_registered', 'bc')
                }

            # Extract categories and tags
            categories = extract_categories(item)

            # Try to extract book information
            book_info = extract_book_info(desc_text)

            # Generate unique ID from link
            event_id = link.split('/')[-1] if link else f"{library_slug}_{len(events)}"

            # Skip cancelled events
            if is_cancelled:
                continue

            # Build event object
            state_abbr = location_info.get('state', '').strip()
            event = {
                'id': event_id,
                'title': title,
                'library': library_name,
                'library_slug': library_slug,
                'description': clean_html(desc_text),
                'link': link,
                'image': image_url,
                'start_date': parse_date(start_date),
                'end_date': parse_date(end_date),
                'is_virtual': is_virtual,
                'location': location_info,
                'registration': registration,
                'categories': categories,
                'book': book_info,
                'state': state_abbr,
                'state_full': STATE_NAMES.get(state_abbr, state_abbr) if state_abbr else '',
                'city': location_info.get('city', '')
            }

            events.append(event)

    except Exception as e:
        print(f"  ⚠️  Error parsing RSS for {library_name}: {e}", file=sys.stderr)

    return events

def main():
    """Main function to fetch all RSS feeds and generate JSON."""
    print("🚀 Starting RSS feed fetch...")

    # Read library RSS URLs
    csv_path = 'bookclub_gateway_rss_verified.csv'
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            libraries = list(reader)
    except FileNotFoundError:
        print(f"❌ Error: {csv_path} not found!", file=sys.stderr)
        sys.exit(1)

    print(f"📚 Found {len(libraries)} libraries to fetch")

    all_events = []
    success_count = 0

    for idx, lib in enumerate(libraries, 1):
        library_name = lib.get('library_name', '').strip()
        library_slug = lib.get('slug', '').strip()
        rss_url = lib.get('bookclub_rss_url', '').strip()

        if not rss_url:
            continue

        print(f"[{idx}/{len(libraries)}] Fetching {library_name}...")

        # Fetch RSS content
        rss_content = fetch_url(rss_url)
        if not rss_content:
            continue

        # Parse events
        events = parse_rss_feed(rss_content, library_name, library_slug)
        all_events.extend(events)

        if events:
            print(f"  ✓ Found {len(events)} events")
            success_count += 1
        else:
            print(f"  ℹ️  No events found")

        # Be polite to servers
        time.sleep(SLEEP_SEC)

    # Sort events by start date
    all_events.sort(key=lambda x: x['start_date'] or '9999-12-31')

    # Write to JSON file
    output_path = 'public/events.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            'generated_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            'total_events': len(all_events),
            'total_libraries': success_count,
            'events': all_events
        }, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Done! Generated {len(all_events)} events from {success_count} libraries")
    print(f"📝 Output: {output_path}")

if __name__ == '__main__':
    main()
