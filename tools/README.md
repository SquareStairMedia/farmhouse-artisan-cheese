# tools

Helper scripts for this site. Nothing here is part of the website itself, but this folder is publicly served like everything in the repo root, so never put secrets here.

## indexnow.py

Sends the sitemap URLs to Bing (and other IndexNow search engines) so new or edited pages are noticed sooner.

    # dry run, sends nothing
    python3 tools/indexnow.py --site https://farmhouseartisancheese.com --key 8bbdf94de01a9cb7a6bb7069f02d4871

    # real submission
    python3 tools/indexnow.py --site https://farmhouseartisancheese.com --key 8bbdf94de01a9cb7a6bb7069f02d4871 --submit

Only HTTP 200 and 202 count as success. Anything else, including a redirect, is reported as a failure.
It needs Python 3 and nothing else to install. To reuse it on another site, copy the file and change --site and --key.
