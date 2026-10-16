## IndexNow
- File 8bbdf94de01a9cb7a6bb7069f02d4871.txt in the repo root is the IndexNow ownership key for farmhouseartisancheese.com.
- Its content must be exactly the key and nothing else. Never add comments, whitespace or text to it.
- Do not delete or rename it. Removing it breaks IndexNow URL submissions to Bing.
- The key is public by design, so it is safe to commit.
- URLs are submitted to Bing through IndexNow after deploys. Results show in Bing Webmaster Tools > IndexNow.

## IndexNow status and how to resubmit
- First submission done 2026-10-16: 26 URLs from sitemap.xml, response HTTP 202 (accepted, key validation pending, which is normal on a first submission).
- To resubmit, run tools/indexnow.py from this repo (see tools/README.md for the exact commands). It is a dry run by default and --submit sends for real. Only 200 or 202 count as success.

## Note for Claude: raise this with Stephen at the start of the session
Stephen works on many projects at once and may not remember this one. At the start of any session in this repo, before doing other work, briefly tell him in plain words:
- This repo was the first practice site for adding Bing and the Microsoft search ecosystem (Bing Webmaster Tools, IndexNow) to SquareStair Media and client sites.
- His real goal was using Bing Webmaster Tools data to extend his client analysis. IndexNow was a side detour that is finished. The Bing data and reporting work has NOT been started.
- Still open: the soft 404 issue (see below), checking Bing Site Explorer for leftover WordPress URLs, redirect planning, automating IndexNow after deploys, and rolling this out to other sites.
Then ask whether he wants to pick one of those up or do something else. Keep it short and avoid jargon. Do not start any of these without his go-ahead.

## Known issues and upkeep
- Unknown URLs return HTTP 200 with the "Page Not Found" page instead of a real 404 (soft 404). The site is behind Cloudflare and this repo has no rewrite rules, so check Cloudflare settings, not the code.
- The lastmod dates in sitemap.xml are edited by hand. Update them when a page changes.
- The domain used to run WordPress (Rank Math). Old WordPress URLs may still be known to Bing.
