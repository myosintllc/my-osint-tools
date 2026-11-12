#!/usr/bin/env python3
"""
Daily Update Digest - Email subscribers when bookmarklets were updated yesterday.

Scans index.html for <tr id="bm-..."> rows whose "Last updated" date equals
yesterday (UTC). If any are found, sends a Mailchimp campaign summarizing
them. If none are found, does nothing (no empty "no updates" email).

Required environment variables:
  MAILCHIMP_API_KEY    - Mailchimp API key (format: xxxxxxxx-usNN)
  MAILCHIMP_AUDIENCE_ID - Mailchimp Audience/List ID

Optional environment variables:
  FROM_NAME   - defaults to "My OSINT Tools"
  REPLY_TO    - defaults to micah@myosint.training
  SITE_URL    - defaults to https://tools.myosint.training
  DRY_RUN     - if set to "1", builds and prints the digest but does not call Mailchimp

Scheduling note: the workflow fires at both possible UTC times for 7am US
Eastern (11:00 and 12:00 UTC), since GitHub Actions cron is fixed-UTC and
doesn't shift for daylight saving. This script checks the real America/New_York
hour and only proceeds on the firing that's actually 7am ET, so the schedule
self-corrects across the DST switch without needing a manual cron edit twice a
year. workflow_dispatch (manual) runs always bypass this check.
"""

import os
import re
import sys
from datetime import datetime, timedelta, timezone
from html import unescape
from zoneinfo import ZoneInfo

import requests

TARGET_ET_HOUR = 7

SITE_URL = os.environ.get("SITE_URL", "https://tools.myosint.training").rstrip("/")
FROM_NAME = os.environ.get("FROM_NAME", "My OSINT Tools")
REPLY_TO = os.environ.get("REPLY_TO", "micah@myosint.training")
DRY_RUN = os.environ.get("DRY_RUN") == "1"

TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")
DATE_RE = re.compile(r"(\d{4}-\d{2}-\d{2})")
ROW_RE = re.compile(r'<tr id="(bm-[^"]+)">(.*?)</tr>', re.DOTALL)
LINK_TEXT_RE = re.compile(r'<a\b[^>]*>(.*?)</a>', re.DOTALL)
TD_RE = re.compile(r'<td[^>]*>(.*?)</td>', re.DOTALL)


def strip_tags(html: str) -> str:
    """Strip HTML tags and collapse whitespace into a single plain-text line."""
    text = TAG_RE.sub(" ", html)
    text = unescape(text)
    return WS_RE.sub(" ", text).strip()


def truncate(text: str, limit: int = 220) -> str:
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0] + "…"


def find_updated_rows(html: str, target_date: str) -> list[dict]:
    """Return [{id, name, description}] for every row whose last <td> contains target_date."""
    updated = []
    for row_id, row_html in ROW_RE.findall(html):
        tds = TD_RE.findall(row_html)
        if not tds:
            continue
        last_td_dates = DATE_RE.findall(tds[-1])
        if not last_td_dates or last_td_dates[-1] != target_date:
            continue

        link_match = LINK_TEXT_RE.search(row_html)
        name = strip_tags(link_match.group(1)) if link_match else row_id

        # Description is always the second <td> in the row.
        description = strip_tags(tds[1]) if len(tds) > 1 else ""

        updated.append({
            "id": row_id,
            "name": name,
            "description": truncate(description),
        })
    return updated


def build_campaign_html(rows: list[dict], digest_date: str) -> str:
    items_html = "\n".join(
        f'''<tr>
  <td style="padding:14px 0;border-bottom:1px solid #1a5276;">
    <a href="{SITE_URL}/#{r['id']}" style="color:#00E6F0;font-size:16px;font-weight:700;text-decoration:none;">{r['name']}</a>
    <div style="color:#CCC;font-size:13px;margin-top:4px;line-height:1.5;">{r['description']}</div>
  </td>
</tr>'''
        for r in rows
    )
    # `bgcolor` (not just CSS `style="background:..."`) on the <body> and the
    # outer full-width wrapper table — several email clients (Gmail among
    # them) strip <body> style attributes and won't reliably paint anything
    # outside the inner 600px table, leaving a dark content box floating on a
    # white background. `bgcolor` survives that sanitizing.
    return f"""<!DOCTYPE html>
<html>
<body bgcolor="#022447" style="margin:0;background:#022447;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#022447" style="background:#022447;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#022447" style="max-width:600px;margin:0 auto;background:#022447;color:#FFF;">
          <tr>
            <td style="background:#008BC4;padding:20px 24px;text-align:center;">
              <div style="font-size:18px;font-weight:700;">My OSINT Tools &mdash; Daily Update</div>
              <div style="color:#00E6F0;font-size:12px;margin-top:4px;">{digest_date}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <p style="color:#CCC;font-size:13px;margin:0 0 10px;">{len(rows)} bookmarklet{'s' if len(rows) != 1 else ''} updated today:</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                {items_html}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;text-align:center;">
              <a href="{SITE_URL}" style="color:#022447;background:#00E6F0;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:700;font-size:13px;">View All Bookmarklets</a>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 20px;text-align:center;color:#888;font-size:11px;">
              You're receiving this because you subscribed for updates at {SITE_URL}.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


class MailchimpClient:
    def __init__(self, api_key: str, audience_id: str):
        if "-" not in api_key:
            raise ValueError("MAILCHIMP_API_KEY doesn't look valid (expected a '-usNN' suffix)")
        self.datacenter = api_key.rsplit("-", 1)[-1]
        self.base_url = f"https://{self.datacenter}.api.mailchimp.com/3.0"
        self.audience_id = audience_id
        self.auth = ("anystring", api_key)

    def create_campaign(self, subject: str) -> str:
        resp = requests.post(
            f"{self.base_url}/campaigns",
            auth=self.auth,
            json={
                "type": "regular",
                "recipients": {"list_id": self.audience_id},
                "settings": {
                    "subject_line": subject,
                    "title": subject,
                    "from_name": FROM_NAME,
                    "reply_to": REPLY_TO,
                },
            },
        )
        resp.raise_for_status()
        return resp.json()["id"]

    def set_content(self, campaign_id: str, html: str) -> None:
        resp = requests.put(
            f"{self.base_url}/campaigns/{campaign_id}/content",
            auth=self.auth,
            json={"html": html},
        )
        resp.raise_for_status()

    def send(self, campaign_id: str) -> None:
        resp = requests.post(
            f"{self.base_url}/campaigns/{campaign_id}/actions/send",
            auth=self.auth,
        )
        resp.raise_for_status()


def is_manual_run() -> bool:
    return os.environ.get("GITHUB_EVENT_NAME") == "workflow_dispatch"


def main() -> int:
    if not is_manual_run() and not DRY_RUN:
        et_hour = datetime.now(ZoneInfo("America/New_York")).hour
        if et_hour != TARGET_ET_HOUR:
            print(f"Current hour in America/New_York is {et_hour}, not {TARGET_ET_HOUR}. Skipping this firing.")
            return 0

    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")

    html = (os.environ.get("INDEX_HTML_PATH") or "index.html")
    with open(html, encoding="utf-8") as f:
        content = f.read()

    rows = find_updated_rows(content, yesterday)
    if not rows:
        print(f"No bookmarklets updated on {yesterday}. Nothing to send.")
        return 0

    print(f"Found {len(rows)} bookmarklet(s) updated on {yesterday}:")
    for r in rows:
        print(f"  - {r['name']} ({r['id']})")

    subject = f"{len(rows)} bookmarklet{'s' if len(rows) != 1 else ''} updated — {yesterday}"
    campaign_html = build_campaign_html(rows, yesterday)

    if DRY_RUN:
        print("\n--- DRY RUN: would send this campaign ---")
        print(f"Subject: {subject}")
        print(campaign_html)
        return 0

    api_key = os.environ["MAILCHIMP_API_KEY"]
    audience_id = os.environ["MAILCHIMP_AUDIENCE_ID"]
    client = MailchimpClient(api_key, audience_id)

    campaign_id = client.create_campaign(subject)
    client.set_content(campaign_id, campaign_html)
    client.send(campaign_id)
    print(f"Sent campaign {campaign_id}: {subject}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
