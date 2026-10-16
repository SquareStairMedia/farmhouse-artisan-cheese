#!/usr/bin/env python3
"""Submit a site's sitemap URLs to Bing (and other search engines) through IndexNow.

Dry run (default, sends nothing):
    python3 indexnow.py --site https://example.com --key YOUR_KEY

Real submission (add --submit):
    python3 indexnow.py --site https://example.com --key YOUR_KEY --submit

What it does, in order:
  1. Reads the live sitemap at <site>/sitemap.xml
  2. Checks the live key file at <site>/<key>.txt contains exactly the key
  3. Prints the URLs it found
  4. With --submit only: POSTs them to the IndexNow endpoint and reports the result

Only Python's standard library is used, so there is nothing to install.
One key file per site. To reuse on another site, change --site and --key.
"""
import argparse
import json
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

# The IndexNow endpoint. It answers directly, with no redirect.
# (The bare root https://api.indexnow.org/ redirects to a web page, which is not the API.)
ENDPOINT = "https://api.indexnow.org/indexnow"
MAX_URLS_PER_POST = 10000  # IndexNow's limit per request
USER_AGENT = "squarestair-indexnow/1.0"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """Refuse to follow redirects, so a redirected POST can never be turned into a GET."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


OPENER = urllib.request.build_opener(NoRedirect)


def http(url, data=None, headers=None):
    """Return (status_code, body_text). Redirects and HTTP errors are returned, not raised."""
    req = urllib.request.Request(url, data=data, headers={"User-Agent": USER_AGENT, **(headers or {})})
    try:
        with OPENER.open(req, timeout=30) as resp:
            return resp.status, resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as err:
        return err.code, err.read().decode("utf-8", "replace")


def fail(message):
    print(f"ERROR: {message}")
    sys.exit(1)


def read_sitemap(url, depth=0):
    """Return the list of page URLs in a sitemap (follows a sitemap index one level down)."""
    status, body = http(url)
    if status != 200:
        fail(f"could not read sitemap {url} (HTTP {status})")
    root = ET.fromstring(body)
    locs = [el.text.strip() for el in root.iter() if el.tag.endswith("}loc") or el.tag == "loc"]
    if root.tag.endswith("sitemapindex"):
        if depth > 0:
            fail("sitemap index nested too deeply")
        urls = []
        for child in locs:
            urls += read_sitemap(child, depth + 1)
        return urls
    return locs


def main():
    parser = argparse.ArgumentParser(description="Submit sitemap URLs to IndexNow (dry run unless --submit).")
    parser.add_argument("--site", required=True, help="site address, e.g. https://farmhouseartisancheese.com")
    parser.add_argument("--key", required=True, help="the IndexNow key (same as the key file name without .txt)")
    parser.add_argument("--sitemap", help="sitemap address if it is not <site>/sitemap.xml")
    parser.add_argument("--submit", action="store_true", help="really send to IndexNow (default is a dry run)")
    args = parser.parse_args()

    site = args.site.rstrip("/")
    parsed = urlparse(site)
    if parsed.scheme != "https" or not parsed.netloc:
        fail("--site must look like https://example.com")
    host = parsed.netloc
    key_location = f"{site}/{args.key}.txt"
    sitemap_url = args.sitemap or f"{site}/sitemap.xml"

    print(f"Mode:      {'REAL SUBMISSION' if args.submit else 'DRY RUN (nothing will be sent)'}")
    print(f"Site:      {site}")
    print(f"Sitemap:   {sitemap_url}")

    # 1. Key file must be live and contain exactly the key.
    status, body = http(key_location)
    if status != 200:
        fail(f"key file {key_location} returned HTTP {status}, expected 200")
    if body != args.key:
        fail(f"key file {key_location} does not contain exactly the key (extra text or whitespace?)")
    print(f"Key file:  OK ({key_location} matches the key)")

    # 2. Read the sitemap, keep only URLs on this site, remove duplicates (order kept).
    all_urls = read_sitemap(sitemap_url)
    urls = list(dict.fromkeys(u for u in all_urls if urlparse(u).netloc == host))
    skipped = len(all_urls) - len(urls)
    print(f"URLs:      {len(urls)} to submit" + (f" ({skipped} skipped: other host or duplicate)" if skipped else ""))
    if not urls:
        fail("no URLs found to submit")
    if len(urls) > MAX_URLS_PER_POST:
        fail(f"{len(urls)} URLs is over the IndexNow limit of {MAX_URLS_PER_POST} per request")
    for u in urls:
        print(f"  {u}")

    payload = {"host": host, "key": args.key, "keyLocation": key_location, "urlList": urls}

    if not args.submit:
        print(f"\nDRY RUN: would POST {len(urls)} URLs to {ENDPOINT}. Nothing was sent.")
        print("Add --submit to send for real.")
        return

    # 3. Submit. Only 200 and 202 count as success.
    status, body = http(ENDPOINT, json.dumps(payload).encode(), {"Content-Type": "application/json; charset=utf-8"})
    print(f"\nResponse:  HTTP {status}")
    if status == 200:
        print("SUCCESS: accepted.")
    elif status == 202:
        print("SUCCESS: accepted, key validation pending (normal on a first submission).")
    else:
        meaning = {
            301: "redirected, so the body was NOT delivered (wrong endpoint)",
            302: "redirected, so the body was NOT delivered (wrong endpoint)",
            400: "bad request (check the payload)",
            403: "key not valid (key file missing or does not match)",
            422: "URLs do not belong to the host, or the key does not match the schema",
            429: "too many requests, wait and try later",
        }.get(status, "unexpected response")
        print(f"FAILED: {meaning}")
        if body.strip():
            print(f"Message:   {body.strip()[:500]}")
        sys.exit(1)


if __name__ == "__main__":
    main()
