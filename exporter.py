#!/usr/bin/env python3
"""
Bookmarklet Exporter - Extract and organize bookmarklets from My OSINT Tools
Extracts bookmarklets from href attributes, organizes by data-folder, and creates
a browser-importable HTML file with proper folder hierarchy.
"""

import re
import requests
from html import unescape
from pathlib import Path
from typing import Dict, List, Tuple
from urllib.parse import urlparse
from datetime import datetime
import json
import zipfile


class BookmarkletExporter:
    def __init__(self, url: str):
        self.url = url
        self.bookmarklets: Dict[str, List[dict]] = {}

    def fetch_html(self) -> str:
        """Fetch HTML from the provided URL or file"""
        # Check if it's a local file path
        if self.url.startswith('/') or self.url.startswith('./') or Path(self.url).exists():
            #print(f"Reading HTML from {self.url}...")
            return Path(self.url).read_text(encoding='utf-8')

        # Otherwise try to fetch from URL
        print(f"Fetching HTML from {self.url}...")
        response = requests.get(self.url)
        response.raise_for_status()
        return response.text

    def extract_bookmarklets(self, html: str) -> List[dict]:
        """Extract bookmarklets from HTML with their folders and titles"""
        bookmarklets = []

        # Find all <a> tags that contain data-folder attribute
        # Use a more lenient pattern that doesn't require specific attribute order
        pattern = r'<a\s+[^>]*?data-folder="([^"]+)"[^>]*?href="([^"]+)"[^>]*?>([^<]+)</a>|<a\s+[^>]*?href="([^"]+)"[^>]*?data-folder="([^"]+)"[^>]*?>([^<]+)</a>'

        matches = re.finditer(pattern, html, re.IGNORECASE | re.DOTALL)

        for match in matches:
            groups = match.groups()
            # Handle both possible attribute orderings
            if groups[0]:  # data-folder before href
                folder_path = groups[0]
                href = groups[1]
                title = groups[2].strip()
            else:  # href before data-folder
                folder_path = groups[4]
                href = groups[3]
                title = groups[5].strip()

            # Decode HTML entities
            code = unescape(href)

            # Remove javascript: prefix if present
            if code.startswith('javascript:'):
                code = code[len('javascript:'):]

            bookmarklets.append({
                'title': title,
                'code': code,
                'folder': folder_path
            })

        print(f"Extracted {len(bookmarklets)} bookmarklets")
        return bookmarklets

    def organize_by_folder(self, bookmarklets: List[dict]) -> Dict[str, List[dict]]:
        """Organize bookmarklets into nested folder structure"""
        organized = {}

        for bookmark in bookmarklets:
            folder_path = bookmark['folder']
            if folder_path not in organized:
                organized[folder_path] = []
            organized[folder_path].append(bookmark)

        return organized

    def build_nested_structure(self, organized: Dict[str, List[dict]]) -> Dict:
        """Build nested folder/bookmarklet structure"""
        root = {'folders': {}, 'bookmarklets': []}

        for folder_path, bookmarks in organized.items():
            parts = folder_path.split('/')
            current = root['folders']

            # Navigate/create nested structure
            for part in parts[:-1]:
                if part not in current:
                    current[part] = {'folders': {}, 'bookmarklets': []}
                current = current[part]['folders']

            # Add the final folder
            final_folder = parts[-1]
            if final_folder not in current:
                current[final_folder] = {'folders': {}, 'bookmarklets': []}

            # Add bookmarklets to this folder
            current[final_folder]['bookmarklets'].extend(bookmarks)

        return root

    def wrap_with_parent_folder(self, structure: Dict, parent_name: str = 'My OSINT Bookmarklets') -> Dict:
        """Wrap entire structure under a parent folder"""
        return {
            'folders': {
                parent_name: structure
            },
            'bookmarklets': []
        }

    def generate_html(self, structure: Dict, iso_datetime: str = None) -> str:
        """Generate browser-importable HTML bookmark file"""
        if iso_datetime is None:
            now = datetime.now()
            rounded_now = now.replace(microsecond=0)
            iso_datetime = rounded_now.isoformat()

        html_parts = [
            '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
            '<html>',
            '<head>',
            f'<!--\n    This is an auto-generated bookmark file exported from\n    My OSINT Tools (https://tools.myosint.training)\n    Generated at: {iso_datetime}\n-->',
            '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
            '<TITLE>My OSINT Bookmarklets</TITLE>',
            '</head>',
            '<body>',
            '<H1>My OSINT Bookmarklets</H1>',
            '<DL><p>'
        ]

        def add_folder_recursively(folder_dict: Dict, indent: int = 1) -> None:
            """Recursively add folders and bookmarklets to HTML"""
            indent_str = '    ' * indent

            # Add subfolders first
            for folder_name, folder_content in folder_dict['folders'].items():
                html_parts.append(f'{indent_str}<DT><H3>{self._escape_html(folder_name)}</H3>')
                html_parts.append(f'{indent_str}<DL><p>')
                add_folder_recursively(folder_content, indent + 1)
                html_parts.append(f'{indent_str}</DL><p>')

            # Then add bookmarklets in this folder
            for bookmark in folder_dict['bookmarklets']:
                escaped_title = self._escape_html(bookmark['title'])
                escaped_code = self._escape_html(bookmark['code'])

                # Ensure javascript: prefix exists
                if not bookmark['code'].startswith('javascript:'):
                    href = f"javascript:{escaped_code}"
                else:
                    href = escaped_code

                html_parts.append(
                    f'{indent_str}<DT><A HREF="{href}">'
                    f'{escaped_title}</A>'
                    )

        add_folder_recursively(structure)

        html_parts.extend([
            '</DL><p>',
            '</body>',
            '</html>'
        ])

        return '\n'.join(html_parts)

    @staticmethod
    def _escape_html(text: str) -> str:
        """Escape HTML special characters"""
        return (text.replace('&', '&amp;')
                   .replace('<', '&lt;')
                   .replace('>', '&gt;')
                   .replace('"', '&quot;')
                   .replace("'", '&#39;'))

    def export(self, output_file: str = 'bookmarklets.html') -> str:
        """Main export method - orchestrates the entire process"""
        #print("\n=== My OSINT Bookmarklet Exporter ===\n")

        # Make the time and round to seconds not microseconds
        now = datetime.now()
        rounded_now = now.replace(microsecond=0)
        iso_datetime = rounded_now.isoformat()

        # Fetch and parse
        html = self.fetch_html()
        bookmarklets = self.extract_bookmarklets(html)

        if not bookmarklets:
            print("❌ No bookmarklets found!")
            return None

        # Organize
        organized = self.organize_by_folder(bookmarklets)
        print(f"Organized into {len(organized)} folders")

        # Build nested structure
        structure = self.build_nested_structure(organized)

        # Wrap under parent folder
        structure = self.wrap_with_parent_folder(structure)

        # Add version bookmark at root level (last item)
        version_bookmark = {
            'title': f'Version: {iso_datetime}',
            'code': 'https://tools.myosint.training',
        }
        structure['folders']['My OSINT Bookmarklets']['bookmarklets'].append(version_bookmark)

        # Generate HTML
        bookmark_html = self.generate_html(structure, iso_datetime)

        # Save to file
        output_path = Path(output_file)
        output_path.write_text(bookmark_html, encoding='utf-8')

        print(f"\n✅ Successfully exported {len(bookmarklets)} bookmarklets")
        #print(f"📁 Saved to: {output_path.absolute()}")

        # Create zip file
        zip_path = output_path.with_suffix('.zip')
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.write(output_path, arcname=output_path.name)
        #print(f"📦 Created zip: {zip_path.absolute()}")

        return str(output_path.absolute())


def main():
    """Main entry point"""
    import sys

    # Use local file by default, or accept URL/path as argument
    if len(sys.argv) > 1:
        input_source = sys.argv[1]
    else:
        # Default to the hardcoded URL, but could also use local file
        input_source = "index.html"

    exporter = BookmarkletExporter(input_source)
    output_file = exporter.export('myosint_bookmarklets.html')

    '''if output_file:
        # Print folder structure for reference
        print(f"\n📊 Folder Structure:")
        html = exporter.fetch_html()
        bookmarklets = exporter.extract_bookmarklets(html)
        organized = exporter.organize_by_folder(bookmarklets)

        for folder in sorted(organized.keys()):
            count = len(organized[folder])
            print(f"   📁 {folder} ({count} bookmarklet{'s' if count != 1 else ''})")
    '''

if __name__ == '__main__':
    main()