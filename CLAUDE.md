## IndexNow
- File 8bbdf94de01a9cb7a6bb7069f02d4871.txt in the repo root is the IndexNow ownership key for farmhouseartisancheese.com.
- Its content must be exactly the key and nothing else. Never add comments, whitespace or text to it.
- Do not delete or rename it. Removing it breaks IndexNow URL submissions to Bing.
- The key is public by design, so it is safe to commit.
- URLs are submitted to Bing through IndexNow after deploys. Results show in Bing Webmaster Tools > IndexNow.

## IndexNow status and how to resubmit
- First submission done 2026-10-16: 26 URLs from sitemap.xml, response HTTP 202 (accepted, key validation pending, which is normal on a first submission).
- Second submission done 2026-11-04 (after the November blog post, recipe and newsletter went live): 27 URLs from sitemap.xml, response HTTP 200 (accepted).
- To resubmit, run tools/indexnow.py from this repo (see tools/README.md for the exact commands). It is a dry run by default and --submit sends for real. Only 200 or 202 count as success.

## Note for Claude: raise this with Stephen at the start of the session
Stephen works on many projects at once and may not remember this one. At the start of any session in this repo, before doing other work, briefly tell him in plain words:
- This repo was the first practice site for adding Bing and the Microsoft search ecosystem (Bing Webmaster Tools, IndexNow) to SquareStair Media and client sites.
- His real goal was using Bing Webmaster Tools data to extend his client analysis. IndexNow was a side detour that is finished. The Bing data and reporting work has NOT been started.
- Still open: the soft 404 issue (see below), checking Bing Site Explorer for leftover WordPress URLs, redirect planning, automating IndexNow after deploys, and rolling this out to other sites.
Then ask whether he wants to pick one of those up or do something else. Keep it short and avoid jargon. Do not start any of these without his go-ahead.

## Internal linking and recipes
- All recipes live on one page, recipes.html, and each has an anchor (for example recipes.html#raclette). Link to the anchor, never to a made-up page. The recipe ID must stay stable once it has been shared (newsletters, blog posts).
- Link only where the two pieces are genuinely related. Do not force a blog post to link to a recipe just to add a link.
- Good recipe links: a recipe to the blog post about its cheese or technique, and a blog post that mentions a cheese or dish back to the recipe that uses it. Use descriptive anchor text, in body text, once per target per page, in the existing inline link style.
- Every new blog post or recipe also needs: a card on notes.html (blog only), an entry in sitemap.xml with today's lastmod, a line in llms.txt, and updated lastmod for every existing page that gets a new link.
- Do not edit visible FAQ text without also updating its FAQPage schema; they must match.
- November 2026 links added: gift box blog (choose-the-perfect-gift-box.html) is linked from notes.html, how-much-cheese-per-person (Next Post), blog-gift-worth-savouring and gift-boxes.html, and links out to gift-boxes, contact, blog-gift-worth-savouring and how-much-cheese-per-person. The Raclette recipe (recipes.html#raclette) is linked from back-to-busy and lactose, and links out to lactose and back-to-busy.
- Still to consider: cheeses.html does not mention Raclette or Laguiole. Add them there when stocked so newsletter and recipe links to the cheeses page land on something relevant.

## Newsletter opt-in (CASL)
- Contact forms (contact.html, and the Contact Us modals in faq.html and boards.html) and the gift box order form (gift-boxes.html) have an optional, unchecked "send me The Farmhouse Gazette" checkbox. Only a ticked box subscribes someone; contact and orders never do on their own.
- The newsletter popup (28 pages) has no checkbox. Its consent line sits above the Subscribe button.
- Backend (server/index.js): `handleNewsletterOptIn` adds opt-ins to Campaign Monitor and the owner email carries a consent record (date, form, page, wording). If Campaign Monitor fails, the message or order still goes through and the owner email says to add the address by hand. Opt-ins also get the same "Welcome to Farmhouse Artisan Cheese" email as direct signups (`sendWelcomeEmail`), sent separately from the contact or order confirmation, and only once they are on the list. The confirmation email keeps its own newsletter line.
- Wording: checkbox label "Please email me the monthly Farmhouse Gazette: recipes, seasonal selections and your "Cheese of the Month"." plus the italic express-consent note under it (`.newsletter-optin-note`). Both are in the 4 forms above and in `NEWSLETTER_CONSENT_TEXT` in server/index.js, which must match. Change them together. The popup consent line is separate.
- The popup intro text (27 pages) and the welcome email text (`sendWelcomeEmail`) use the same topics. Keep all of them in step with the checkbox wording.
- After a deploy that touches these forms, send one test contact message with the box ticked. Expect 3 emails (owner copy with consent record, confirmation, welcome) and the address in Campaign Monitor, then unsubscribe the test address. The server on Render must be redeployed too, or opt-ins are not added to Campaign Monitor.
- scripts.js defines a no-op `window.gtag` until analytics loads. Without it, visitors who decline cookies or block analytics could not open the contact/order modals.

## Known issues and upkeep
- Unknown URLs return HTTP 200 with the "Page Not Found" page instead of a real 404 (soft 404). The site is behind Cloudflare and this repo has no rewrite rules, so check Cloudflare settings, not the code.
- The lastmod dates in sitemap.xml are edited by hand. Update them when a page changes.
- The domain used to run WordPress (Rank Math). Old WordPress URLs may still be known to Bing.
- contact.html: the second inline script adds a click listener to #successModal before that element exists, so clicking outside the success popup does not close it (the Close button works).
- .github/copilot-instructions.md still has stale details outside the forms (file structure, line counts, page count). The forms and email sections are current.
