#!/usr/bin/env python3
"""
Update library placeholder links in libraries.html with actual book club URLs
"""

# Library book club URLs mapping
LIBRARY_URLS = {
    # California
    "Alameda County Library": "https://aclibrary.bibliocommons.com/v2/events?q=book%20club",
    "Contra Costa County Library": "https://ccclib.bibliocommons.com/v2/events?q=book%20club",
    "Marin County Free Library": "https://marinlibrary.bibliocommons.com/v2/events?q=book%20club",
    "Oakland Public Library": "https://oaklandlibrary.bibliocommons.com/v2/events?q=book%20club",
    "Palo Alto City Library": "https://library.cityofpaloalto.org/book-clubs/",
    "Pleasanton Public Library": "https://pleasantonlibrary.bibliocommons.com/v2/events?q=book%20club",
    "San Diego County Library": "https://sdcl.bibliocommons.com/v2/events?q=book%20club",
    "San José Public Library": "https://sjpl.bibliocommons.com/v2/events?q=book%20club",
    "San Mateo County Libraries": "https://smcl.bibliocommons.com/v2/events?q=book%20clubs",
    "Santa Clara County Library": "https://sccl.bibliocommons.com/v2/events?q=book%20club",

    # Other US States
    "Arapahoe Libraries": "https://arapahoelibraries.bibliocommons.com/v2/events?q=Book%20Club",
    "Aurora Public Library": "https://aurora.bibliocommons.com/v2/events?q=book%20club",
    "Burlington County Library System": "https://bclsnj.bibliocommons.com/v2/events?q=book%20club",
    "Canton Public Library": "https://cantonpl.bibliocommons.com/v2/events?q=book%20club",
    "Central Rappahannock Regional Library": "https://librarypoint.bibliocommons.com/v2/events?q=book%20club",
    "Chandler Public Library": "https://chandler.bibliocommons.com/v2/events?q=book%20club",
    "Charlotte Mecklenburg Library": "https://cmlibrary.org/bookclubs",
    "Chicago Public Library": "https://chipublib.bibliocommons.com/v2/events?q=book%20club",
    "Cincinnati & Hamilton County Public Library": "https://chpl.org/book-club/",
    "Clark County Public Library": "https://www.ccplohio.org/book-clubs/",
    "Dayton Metro Library": "https://dayton.bibliocommons.com/v2/events?q=book%20club",
    "Denton Public Library": "https://denton.bibliocommons.com/v2/events?q=book%20club",
    "East Lansing Public Library": "https://elpl.bibliocommons.com/v2/events?q=book%20clubs",
    "Evanston Public Library": "https://epl.org/clubs-gatherings/",
    "Fort Vancouver Regional Libraries": "https://fvrl.librarymarket.com/adult-book-group-489",
    "Frisco Public Library": "https://friscolibrary.com/bookclubs/",
    "Fulton County Library System": "https://fulcolibrary.bibliocommons.com/v2/events?q=book%20club",
    "Glenview Public Library": "https://glenviewpl.bibliocommons.com/v2/events?q=book%20club",
    "Grand Rapids Public Library": "https://www.grpl.org/adults/",
    "Greene County Public Library": "https://greenelibrary.info/online-book-club/",
    "Harris County Public Library": "https://hcpl.net/adults/",
    "Hennepin County Library": "https://www.hclib.org/en/programs/books-reading/book-clubs",
    "Herrick District Library": "https://herrickdl.org/blogs/post/hdl-book-clubs/",
    "Jefferson County Public Library": "https://jeffcolibrary.bibliocommons.com/v2/events?q=book%20club",
    "Johnson County Library": "https://www.jocolibrary.org/book-groups/",
    "Kenosha Public Library": "https://mykpl.bibliocommons.com/v2/events?q=book%20club",
    "Kent District Library": "https://kdl.bibliocommons.com/v2/events?q=book%20club",
    "Kenton County Public Library": "https://www.kentonlibrary.org/adults/",
    "King County Library System": "https://kcls.org/book-groups/",
    "Kitsap Regional Library": "https://www.krl.org/books/",
    "Laurel County Public Library": "https://www.laurellibrary.org/about/book-groups/",
    "Lawrence Public Library": "https://lplks.org/book-club-hub/",
    "Muskegon Area District Library": "https://muskegonadl.bibliocommons.com/v2/events?q=Book%20Club",
    "Ocean City Free Public Library": "https://www.oceancitylibrary.org/oc-reads/",
    "Omaha Public Library": "https://omahalibrary.org/book-clubs/",
    "Palm Beach County Library System": "https://pbclibrary.bibliocommons.com/v2/events?q=book%20club",
    "Pima County Public Library": "https://www.library.pima.gov/bookclubs/",
    "Public Library of Youngstown and Mahoning County": "https://www.libraryvisit.org/books/",
    "Ramsey County Library": "https://www.rclreads.org/books/",
    "Saint Paul Public Library": "https://sppl.bibliocommons.com/v2/events?q=book%20club",
    "Sno-Isle Libraries": "https://www.sno-isle.org/book-groups/",
    "St. Louis Public Library - City": "https://www.slpl.org/bookclubbag/",
    "St. Tammany Parish Library": "https://www.sttammanylibrary.org/book-clubs/",
    "Stark Library": "https://www.starklibrary.org/book-clubs/",
    "Tacoma Public Library": "https://www.tacomalibrary.org/book-clubs/",

    # Canada
    "Edmonton Public Library": "https://www.epl.ca/book-clubs/",
    "Guelph Public Library": "https://www.guelphpl.ca/bookclubs/",
    "Halifax Public Libraries": "https://halifax.bibliocommons.com/v2/events?q=book%20club",
    "Innisfil Public Library": "https://www.innisfilidealab.ca/book-club/",
    "Markham Public Library": "https://markhampubliclibrary.ca/bookclubs/",
    "Oshawa Public Libraries": "https://oshawalibrary.ca/book-clubs/",
    "Red Deer Public Library": "https://rdpl.org/books/",
    "Richmond Hill Public Library": "https://www.rhpl.ca/library-book-clubs",
    "SDG Library": "https://sdglibrary.bibliocommons.com/v2/events?types=644176e411597f2505a3ff5b",
    "Strathcona County Library": "https://sclibrary.ca/book-clubs/",

    # International
    "Christchurch City Libraries": "https://my.christchurchcitylibraries.com/book-clubs-and-reading-groups/",
}

def update_libraries_html():
    """Update libraries.html with actual book club URLs"""

    with open('public/libraries.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace each placeholder link
    for library_name, url in LIBRARY_URLS.items():
        # Handle URL-encoded library name for current placeholder format
        import urllib.parse
        encoded_name = urllib.parse.quote(library_name)

        # Old placeholder pattern: href="?library=..."
        old_pattern = f'href="?library={encoded_name}"'

        # New pattern: direct link to library's book club page, opens in new tab
        new_pattern = f'href="{url}" target="_blank" rel="noopener noreferrer"'

        content = content.replace(old_pattern, new_pattern)

        # Also update link text from "View Events →" to "Book Club Page →"

    # Replace all "View Events →" with "Book Club Page →"
    content = content.replace('View Events →', 'Book Club Page →')

    with open('public/libraries.html', 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ Updated libraries.html with actual book club URLs")
    print(f"✅ Replaced {len(LIBRARY_URLS)} library links")

if __name__ == '__main__':
    update_libraries_html()
