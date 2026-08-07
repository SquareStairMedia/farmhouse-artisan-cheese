# Internal Link Audit — Farmhouse Artisan Cheese

**Date:** 2026-08-07
**Scope:** Every `href`, `src`, `action`, and URL-bearing `content` attribute in all `.html`, `.md`, `.xml`, `.txt`, and `.js` files in the repo.
**Method:** Static extraction + path resolution against the actual file tree (site is a Render `static_site`, served from repo root, so repo path == URL path).
**Totals:** 1,564 URL-bearing attributes scanned · 71 resolved to targets that do not exist.

**Nothing has been fixed. This is report-only.**

---

## How to read this against Semrush

Semrush's default crawl does **not** execute JavaScript. Three things follow, and they explain most of the discrepancies you'll see:

1. `archives.html` injects all its newsletter links via JS (`issue.href`), so a non-rendering Semrush crawl sees **zero outbound links** on that page and will report every newsletter issue as uncrawled/orphaned. See §5.
2. Semrush resolves `../` the way browsers do (clamped at root), so the 16 `../assets/css/styles.css` references in §3 will **not** appear in a Semrush broken-link report even though they are wrong.
3. Semrush only reports what it can reach. Pages behind `robots.txt` disallows (`BACKUP*`, `SANDBOX`, `faqBACKUP`) will be absent from its list but are included here — flagged as **Not crawled** so you can set them aside.

Severity key: **P1** = live 404 on an indexable page · **P2** = live broken asset · **P3** = hygiene/consistency, no user-facing break · **INFO** = context for the comparison.

---

## 1. P1 — Broken internal links (real 404s on indexable pages)

### 1.1 Blog footer logo links to a page that does not exist — 9 pages

Every blog post's footer logo links to a bare `index.html`. Because these pages live in `/BlogPages/`, the browser resolves this to `/BlogPages/index.html`, which does not exist. The site nav on these same pages correctly uses `../index.html` — only the footer logo is wrong.

| File | Line | Current | Resolves to | Should be |
|---|---|---|---|---|
| `BlogPages/blog-gift-worth-savouring.html` | 137 | `index.html` | `/BlogPages/index.html` ❌ | `../index.html` |
| `BlogPages/cheese-caves.html` | 174 | `index.html` | `/BlogPages/index.html` ❌ | `../index.html` |
| `BlogPages/cheese-prep.html` | 181 | `index.html` | `/BlogPages/index.html` ❌ | `../index.html` |
| `BlogPages/cheese-storage-secrets.html` | 186 | `index.html` | `/BlogPages/index.html` ❌ | `../index.html` |
| `BlogPages/heat-proof-cheeses.html` | 192 | `index.html` | `/BlogPages/index.html` ❌ | `../index.html` |
| `BlogPages/lactose.html` | 148 | `index.html` | `/BlogPages/index.html` ❌ | `../index.html` |
| `BlogPages/ontario-food-cheese-pairings.html` | 216 | `index.html` | `/BlogPages/index.html` ❌ | `../index.html` |
| `BlogPages/quebec-cheeses.html` | 195 | `index.html` | `/BlogPages/index.html` ❌ | `../index.html` |
| `BlogPages/rinds.html` | 159 | `index.html` | `/BlogPages/index.html` ❌ | `../index.html` |

This is the inverse of the `BlogPages/notes.html` pattern you described: not a root page reaching *into* the folder, but a folder page assuming it *is* root. **Semrush should report this as 9 broken internal links to `/BlogPages/index.html`.** If it doesn't, its crawl didn't reach the blog footers.

### 1.2 March 2026 newsletter links to a root-level blog post that lives in /BlogPages/

| File | Line | Current | Should be |
|---|---|---|---|
| `assets/newsletter/march-2026/March2026Newsletter.html` | 460 | `https://farmhouseartisancheese.com/cheese-prep.html` ❌ | `https://farmhouseartisancheese.com/BlogPages/cheese-prep.html` |

This **is** exactly the pattern you described — a link that assumes a blog post sits at root when it actually lives in `/BlogPages/`. Note the same file at another point links correctly to `/BlogPages/cheese-prep.html`, so the file contradicts itself. This directory is *not* robots-disallowed, so it is crawlable and live.

### 1.3 Cloudflare email-obfuscation stubs — 3 files

`/cdn-cgi/l/email-protection` is an artifact injected by Cloudflare's email obfuscation into HTML that was saved from a Cloudflare-fronted page. This site is hosted on Render (`render.yaml`, `type: static_site`), so there is no `/cdn-cgi/` handler — these are hard 404s and the visible email address is rendered as `[email protected]`.

| File | Line |
|---|---|
| `assets/newsletter/april-2026/April2026Newsletter.html` | 537 |
| `assets/newsletter/february-2026/February2026Newsletter.html` | 600 |
| `assets/images/newsletter/2025/December/Drafts/Farmhouse-Master-v3.html` | 332 (robots-disallowed) |

---

## 2. P2 — Broken image references (live pages)

Four image files are referenced but absent from the repo entirely.

| File | Line | Missing asset | Notes |
|---|---|---|---|
| `index.html` | 150 | `./assets/options/brie-1.jpg` | `assets/options/` contains only `videos/cheese-hero.mp4` — no images at all |
| `index.html` | 256 | `./assets/images/visite.jpg` | |
| `index.html` | 269 | `./assets/images/histoire.jpg` | |
| `about.html` | 109 | `./assets/images/visite.jpg` | |

Same missing assets also referenced from **not-crawled** pages (`robots.txt` disallowed, listed for completeness): `SANDBOX.html:612,693,706`, `BACKUPindex.html:473,554,567`.

Also missing, on not-crawled pages only: `./assets/images/Farmhouse-Artisan-Cheese-Logo.png` — referenced at `BACKUPboards.html:271`, `BACKUPcontact.html:123`, `faqBACKUP.html:352`. The live pages correctly use the `-Black`/`-White` suffixed variants that do exist.

Also missing, in robots-disallowed December 2025 newsletter drafts (4 files): `assets/images/newsletter/website-promo-portrait.png` and `assets/images/newsletter/elf-on-the-shelf.png` — both live one directory deeper, in `.../2025/December/`.

---

## 3. P3 — Incorrect relative paths that happen to still work

### 3.1 `../assets/css/styles.css` from root-level pages — 16 files

Every root-level page loads its stylesheet with a `../` prefix. From `/index.html` this means "go above the web root," which browsers and crawlers silently clamp back to `/assets/css/styles.css`. It works today, but it is wrong, it is inconsistent with the four pages that get it right, and it will break the moment any of these pages is moved into a subdirectory or the site is served from a subpath.

Affected (line numbers): `index.html:29`, `about.html:22`, `boards.html:22`, `cheeses.html:22`, `contact.html:22`, `faq.html:23`, `gift-boxes.html:22`, `gifts.html:26`, `groceries.html:26`, `housemade.html:26`, `newsletter.html:23`, `notes.html:26`, `privacy-policy.html:22` — plus not-crawled `BACKUPboards.html:19`, `BACKUPcontact.html:19`, `faqBACKUP.html:23`.

Correct already (use `./`): `404.html:15`, `archives.html`, `recipes.html`.

**Expect Semrush to be silent on this.** It resolves the same way a browser does. This is a repo-hygiene finding that a crawler cannot surface.

### 3.2 Empty `href="#"` placeholder links

| File | Lines | Notes |
|---|---|---|
| `notes.html` | 538–542 | Blog pagination controls (`«`, `1`, `2`, `3`, `»`) — all five are dead `#` links. The blog index advertises 3 pages of posts that cannot be reached. |
| `SANDBOX.html` | 594 | Not crawled |
| `BACKUPboards.html` | 181 | Not crawled |
| `BACKUPindex.html` | 455 | Not crawled |

The `notes.html` pagination is the one that matters: Semrush typically reports these as "Links with no anchor destination" or under empty/self-referencing links, and it means any post beyond page 1 has no crawlable path from the blog index.

---

## 4. Duplicate & inconsistent URL versions

### 4.1 Homepage is referenced five different ways

| Form | Count | Where |
|---|---|---|
| `index.html` | 64 | Root-page nav + footer logos |
| `index.html#collection` | 19 | Root-page footers |
| `https://farmhouseartisancheese.com` *(no trailing slash)* | 19 | All 8 crawlable newsletter issues + templates |
| `../index.html` | 18 | BlogPages nav + footer |
| `../index.html#collection` | 9 | BlogPages footers |
| `https://farmhouseartisancheese.com/` *(trailing slash)* | 4 | `index.html` canonical + `og:url`, `llms.txt`, `sitemap.xml` |

The canonical for the homepage is `https://farmhouseartisancheese.com/`, but **every single internal link on the site points at `/index.html`** instead. That's ~100 internal links pointing to a non-canonical URL, and it is the classic Semrush finding here. It's also why `/index.html` and `/` may both appear in the crawl as separate URLs with identical content.

Secondary: newsletters link to the bare domain with **no trailing slash**, a third variant.

### 4.2 www vs non-www

Site standard is non-www everywhere (canonicals, sitemap, llms.txt). Three newsletter **templates** use `https://www.farmhouseartisancheese.com`:

- `assets/newsletter/campaign-monitor/new-farmhouse-master-newsletter-template.html:555` (robots-disallowed)
- `assets/images/newsletter/2026/DRAFT1-master-newsletter-template.html:562` (robots-disallowed)
- `assets/images/newsletter/2026/DRAFT2-master-newsletter-template.html:543` (robots-disallowed)

Low impact for the crawl (all disallowed), but it means any newsletter built from these templates ships a www link that will take a redirect hop.

### 4.3 Protocol and case

- **No `http://` internal links** anywhere. Clean.
- **No case mismatches** — every internal link's casing matches the file on disk. Safe for case-sensitive hosting.

---

## 5. Crawlability gaps — likely source of Semrush discrepancies

### 5.1 The newsletter archive is JavaScript-only

`archives.html` builds all seven of its issue links inside a JS template string (`archives.html:457, 462` — `' + issue.image + '`, `' + issue.href + '`). The href data lives at lines 396–446 and all seven targets exist on disk.

**Consequence:** to a non-rendering crawler, `archives.html` is a page with no outbound links, and all 13 newsletter issue files are orphans with zero inbound links. If your Semrush report shows the newsletter issues as unreachable — or shows `archives.html` as a dead end — this is why, and the pages are not actually broken.

### 5.2 `newsletter.html` is an orphan in the sitemap

`newsletter.html` is listed in `sitemap.xml` and carries a self-canonical, but **no live page links to it**. The only inbound link is from `faqBACKUP.html:89`, which is robots-disallowed. Semrush flags this as "Orphaned page (sitemap)."

### 5.3 August 2026 issue is published but not in the archive

`assets/newsletter/august-2026/August2026Newsletter.html` exists and its assets are in place, but `archives.html` (lines 396–446) stops at July 2026. The current month's issue has no path from anywhere on the site.

### 5.4 Two blog posts are missing from `sitemap.xml` and `llms.txt`

Both are linked from `notes.html` and both exist:

| Page | In `notes.html` | In `sitemap.xml` | In `llms.txt` |
|---|---|---|---|
| `BlogPages/ontario-food-cheese-pairings.html` | yes | **no** | **no** |
| `BlogPages/cheese-storage-secrets.html` | yes | **no** | **no** |

Sitemap lists 7 of the 9 blog posts; llms.txt lists the same 7. `ontario-food-cheese-pairings.html` is also the target of the August 2026 newsletter's main CTA.

`llms.txt` additionally omits `notes.html` (the blog index), `newsletter.html`, and `privacy-policy.html`, all of which are in the sitemap.

### 5.5 `404.html` has no canonical

Every other page in the site has a `rel="canonical"`. `404.html` has none. Minor, and arguably correct for an error page, but it will show up in a "missing canonical" bucket.

---

## 6. Verified clean

So you can positively rule these out when reconciling:

- **All 22 sitemap URLs resolve to real files.** No 404s in the sitemap.
- **All 7 newsletter archive `href` targets exist** (the issue is crawlability, §5.1, not breakage).
- **All 9 `notes.html` → `/BlogPages/*.html` links are correct** (`./BlogPages/...`, all resolve).
- **All BlogPages nav links are correct** (`../about.html`, `../notes.html`, etc. — 19 distinct targets, all resolve). The `BlogPages/notes.html`-style error does **not** exist in the nav; only in the footer logo (§1.1).
- **All 9 blog-post canonicals** point at the correct absolute `/BlogPages/` URL.
- **All root-page canonicals + `og:url`** present and self-consistent (15/15 live pages).
- **All newsletter-issue links to shop pages** (`/cheeses.html`, `/gift-boxes.html`, `/contact.html`, `/groceries.html`) resolve — except §1.2.
- No `http://`, no case mismatches, no broken favicon/manifest references.

---

## Summary counts for reconciliation

| Category | Live/indexable | Not crawled (robots-disallowed) | Total |
|---|---|---|---|
| P1 broken links (404) | 11 | 1 | 12 |
| P2 broken images | 4 | 15 | 19 |
| P3 wrong-but-working relative paths | 13 | 3 | 16 |
| P3 empty `href="#"` | 5 | 3 | 8 |
| Non-canonical homepage links | ~110 | — | ~110 |
| Orphan / crawl-gap pages | 15 | — | 15 |

**Bottom line:** 12 genuine broken links and 4 genuine broken images on live pages. Everything else is consistency and crawlability. If Semrush reports substantially more than ~15 broken internal items, the extra volume is almost certainly the non-canonical `/index.html` links (§4.1) or the JS-only archive (§5.1) rather than new defects.
