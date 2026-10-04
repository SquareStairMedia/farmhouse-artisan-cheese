---
name: farmhouse-blog-post
description: Turn a client-supplied blog draft (markdown or text) into a published Farmhouse Artisan Cheese blog post page, including SEO/AEO markup, internal linking, and site wiring (notes page, navigation, sitemap, llms.txt). Use whenever a new or updated blog post is requested for the Farmhouse Artisan Cheese site, even if the request only says "blog post" or "blog time".
---

# Farmhouse blog post

Builds one blog post page for the Farmhouse Artisan Cheese static site and connects it to the rest of the site. The client copy is the source of truth for the message; this skill handles structure, markup, linking, and quality checks.

## Inputs to look for
- The client's draft file (usually markdown, in an `assets/newsletter/<month-year>/` or `BlogPages/` folder).
- Meta title, meta description, suggested slug, and hero image reference (often listed at the top of the draft).
- Image files the client added to the repo.

If something is missing (slug, description, hero), derive a sensible value and say so in your report.

## 1. Learn the current pattern first
Do not build from memory. Before writing:
- Open the newest post in `BlogPages/` and use it as the template (head, schema, breadcrumb, header, byline, featured image, article, FAQ, footer navigation, footer).
- Open `notes.html` (blog card list), `sitemap.xml`, and `llms.txt` to see how posts are listed.
- Check the site stylesheets (`assets/css/styles.css`, `assets/css/blog-styles.css`) before adding any new styling; prefer existing classes and match existing inline-style patterns.

## 2. Build the page
- File: `BlogPages/<slug>.html` (slug from the draft or derived from the title; lowercase, hyphenated).
- Image: web-optimised (WebP preferred), lowercase hyphenated filename, stored with the other blog images. Write meaningful alt text. Do not leave the hero pointing at a path outside the site's image folders.
- Head: title (`<title> - Farmhouse Artisan Cheese`), meta description, canonical, Open Graph and Twitter tags, all using the absolute site URL.
- Schema (JSON-LD `@graph`): BlogPosting, BreadcrumbList, and FAQPage when the post has an FAQ. Dates in ISO format. Schema text must match the visible text exactly.
- Body: breadcrumb, h1, excerpt, byline with date, featured image, a short quick-answer box when the post leads with a direct answer or list, the article, a visible FAQ section if the draft has one, and previous/next navigation.
- Convert markdown faithfully: headings, lists, tables (wrap wide tables so they scroll on mobile), bold/italics. Keep the client's wording; only make light edits for the style rules below and flag every wording change in your report.

## 3. Style rules
- Canadian spelling (flavour, colour, centre, neighbours).
- Special characters as HTML entities in email; plain UTF-8 or entities are both fine on site pages, but be consistent with the surrounding file.
- No exclamation marks in headings. Warm, restrained, editorial tone.
- Check formatting end to end: heading hierarchy (one h1), list and table structure, balanced tags, consistent punctuation and spacing.

## 4. Internal linking (required, not optional)
Client copy usually arrives with no internal links. Adding them is part of this job.

Outbound links from the new post (aim for 3 to 6):
- Link to genuinely relevant existing posts, product/category pages (cheeses, boards, groceries, gift boxes, housemade), recipes (use the recipe's anchor on `recipes.html`), FAQ, or contact.
- Find candidates by reading `sitemap.xml`, `notes.html`, the nav menu, and the topics of recent posts. Prefer the most specific relevant page over a generic one.

Inbound links to the new post (aim for 2 to 4):
- Edit older, topically related posts (and a relevant recipe or category page) to link to the new post.
- Add a link only where the surrounding paragraph is genuinely related.

Rules for every link:
- Descriptive anchor text that says what the reader will find. Never "click here" or "read more".
- Put links in body prose, not in headings, buttons, or the quick-answer box.
- Link each destination at most once per page. Do not stuff links; if a paragraph needs three, split it or drop two.
- Prefer linking existing words; if a short bridging sentence is needed, keep it plain and factual and do not make claims the draft does not support.
- Match the existing inline link style used in other posts and use relative paths.
- Confirm every target file exists (scripted check, not by eye).
- Tell the user which links you added and where, since the client did not write them.

## 5. Wire the post into the site
- Add the post card to the top of the blog list in `notes.html` (image, alt text, title, one-sentence summary).
- Update the previous/next navigation: the new post's "Previous" points at the former newest post, and the former newest post gains a "Next Post" link to the new one.
- Add the post to `sitemap.xml` and to the blog section of `llms.txt` using the existing entry format.
- If you notice older posts missing from the sitemap or `llms.txt`, mention it rather than silently changing unrelated entries.

## 6. Quality checks before finishing
- Verify facts, figures, arithmetic, and units in the draft are internally consistent and plausible. If something does not add up, correct it only when the right value is unambiguous, and always flag it so the client can be told.
- JSON-LD blocks parse; tags balance; no broken relative links or missing images.
- Image weight and resolution are suitable for how it is displayed; flag anything heavy or low-resolution.
- If you can render the page, check desktop and a narrow width.

## 7. Report back
Summarise: files created or changed, internal links added (with anchors and targets), any edits to the client's wording, any invented or derived values (slug, description, dates), and anything the user should confirm with the client.
