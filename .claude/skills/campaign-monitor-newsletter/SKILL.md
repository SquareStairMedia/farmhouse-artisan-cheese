---
name: campaign-monitor-newsletter
description: Build and format luxury HTML email newsletters for Farmhouse Artisan Cheese (The Farmhouse Gazette), deployed via Campaign Monitor. Use whenever creating, editing, or updating a newsletter issue, including drafting content, building new sections, updating imagery, writing copy, or assembling a new monthly issue from a client copy file. Covers the editorial structure, inline CSS conventions, Campaign Monitor tags, responsive behaviour, typography, layout patterns, asset and link conventions, and pre-send checks. Always use before writing any newsletter HTML or content.
---

# Farmhouse Gazette newsletter

The Farmhouse Gazette is a monthly editorial email for Farmhouse Artisan Cheese in Oakville, Ontario. It is hand-coded HTML deployed through Campaign Monitor. The look is luxury and editorial: black and white, careful typography, generous whitespace, a restrained tone. It should never read like a promotional flyer or a template-builder export.

## Workflow for a new issue

1. **Do the blog post and recipe first** when the issue features them (see the blog and recipe skills). The newsletter links to both, so their final URLs and anchors must exist before you write the buttons.
2. **Read the client copy file** (usually markdown in `assets/newsletter/<month-year>/`). It typically contains the subject line, preheader, section copy, and bracketed directives for images and buttons. Treat the directives as instructions, not as copy.
3. **Start from the most recent issue's HTML** (`assets/newsletter/<previous-month-year>/<Month><Year>Newsletter.html`), not from memory. It carries the current head, hero, spacing, and footer. Reference templates also live in `assets/newsletter/campaign-monitor/`.
4. **Reconcile the copy before building.** Look for places where the intro, preheader, or section blurbs promise something a later section does not deliver, where names or spellings differ between sections, where links or images are mentioned but not provided, or where facts and figures disagree. Fix what is unambiguous, ask about what is not, and list every change in your report.
5. **Build, then run the checks** at the end of this document.
6. **Report back:** file path, image paths used, button destinations, every wording change you made to the client copy, and anything that needs confirming.

## Campaign Monitor requirements

```html
<!-- Subject line (top of body, before the layout table) -->
<singleline label="Email Subject">Subject line from client copy</singleline>

<!-- Web version link -->
<webversion><p class="caption" style="...">View in browser</p></webversion>

<!-- Footer -->
<preferences style="color: #666666; text-decoration: underline;">Update preferences</preferences>
<unsubscribe style="color: #666666; text-decoration: underline;">unsubscribe</unsubscribe>
```

- **Preheader:** include the hidden preheader block directly after the subject tag (a visually hidden `div` with the client's preheader text, followed by the zero-width filler `div` so inbox clients do not pull body text into the preview). Take the text from the client copy.
- All `<table>` elements use `role="presentation"`. Never use `<div>` for layout; only `<table>` and `<td>`. The only `div`s are the preheader blocks and the fixed-height spacers inside `<td>`.

## Document structure

```
<head>
  email-safe CSS reset, typography and button classes, responsive @media (max-width: 680px)
<body>
  subject tag, preheader
  outer wrapper table (full width, black)
    inner .email-container table (max-width 680px, centred)
      top spacer, header lockup, spacer, web version link, spacer
      hero (image with overlaid title) + Outlook fallback
      white content sections
      dark visit section (#1a1a1a)
      footer (black)
```

## Typography system

Define classes in `<style>` in the `<head>` AND repeat every value as inline `style=""` on each element (email clients drop head styles).

| Class | Size | Weight | Tracking | Transform | Color | Use |
|---|---|---|---|---|---|---|
| `.headline-massive` | 68px | 100 | 16px | uppercase | #ffffff | Hero only |
| `.headline-large` | 42px | 100 | 10px | none | #000000 | Section headings |
| `.headline-medium` | 28px | 200 | 6px | none | #000000 | Sub-sections |
| `.headline-small` | 20px | 300 | 4px | none | #000000 | Item titles under a section heading |
| `.subhead` | 13px | 300 | 5px | lowercase | #999999 | Editorial pull quotes |
| `.body-text` | 16px (17px for the opening intro) | 300 | 0.5px | none | #333333 | All body copy |
| `.caption` | 11px | 300 | 3px | uppercase | #999999 | Labels, footer, credits |

Line height 1.9 for body, 1.05 to 1.1 for large headings, 1.6 for captions. Font stack `'Helvetica Neue', Helvetica, Arial, sans-serif`. Body paragraphs use `max-width: 540px` for readability.

Long headings: add `<br>` at natural phrase breaks so they wrap well at 42px (for example three short lines rather than one orphaned word). A heading plus a descriptive title can be split into an h2 (`headline-large`) and an h3 (`headline-small`).

## Colour palette

| Use | Hex |
|---|---|
| Primary black, outer wrap | `#000000` |
| Dark visit section | `#1a1a1a` |
| White content area | `#ffffff` |
| Light grey subhead band | `#fafafa` |
| Body text | `#333333` |
| Light text on dark | `#cccccc` |
| Subhead and caption text | `#999999` |
| Footer text | `#666666` and `#888888` |

## Section order

Sections can be added or removed to suit the month, but the issue follows this rhythm. Use the previous issue as the guide for which optional sections are in play.

1. Header lockup and web version link.
2. Hero with issue number, title, and month/year (plus the Outlook fallback).
3. Intro paragraphs (warm, tied to the season or theme) and a CTA button.
4. Section divider (50px rule).
5. **Cheese feature** (monthly cheese highlight): h2, h3 with the cheese name, image beside or above the copy, a CTA to the cheeses page.
6. Subhead band (grey, lowercase pull quote).
7. **Themed editorial sections** (hosting tips, seasonal ideas, shop features): h2, optional h3, full-width landscape image or image-left split, body copy, optional CTA.
8. **Recipe of the Month**: h2, h3 with the recipe name, image-left split with a short blurb, a button to the recipe's anchor on the recipes page.
9. **From the Farmhouse Blog**: h2, h3 with the post title, image-left split with a teaser, a button to the post.
10. Optional closing tip or note.
11. **Looking ahead**: image, copy, CTA to the relevant page (for example gift boxes or contact).
12. Dark "Visit Us" section: address, hours, contact CTA.
13. Footer.

Optional sections used in earlier issues (staff pick, "Did you know" / Cheese 101) can return when the client supplies copy for them; use the same split and heading patterns.

## Layout patterns

- **Standard padding:** `padding: 0 50px` on content `<td>`, class `mobile-padding` (25px on mobile).
- **Spacers:** empty `<div style="height: Npx;">` inside a `<td>` with a white background. Common heights 30, 35, 40, 50, 70. Use 70 between major sections, 40 above buttons, 30 to 35 between a split and the copy below it.
- **Section divider:** `<div style="width: 50px; height: 1px; background-color: #000000;"></div>`.
- **Image-left split:** a 100%-wide table with two `stack-column` cells, image cell 40 to 42% with `padding-right: 35px`, text cell the remainder with class `mobile-top-pad`. Use this for portrait or square images. For a tall portrait image beside short copy, put the lead paragraphs in the text cell and the remaining paragraphs full-width below.
- **Cropped split image:** for landscape or square recipe photos, set a fixed height with `object-fit: cover` so the split stays balanced.
- **Full-width landscape image:** a centred `<td>` with the same 50px padding, `width: 100%`, then a 35px spacer before the copy.
- **Subhead band:** `#fafafa` background, 50px padding, centred lowercase pull quote with `max-width: 480px`. Quotes are poetic and reflective, in the client's words where supplied.

## Buttons

Wrap in a `<table>` and put the border on the `<td>`, not the `<a>`.

On white:
```html
<table role="presentation" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="left" bgcolor="transparent" style="border: 1px solid #000000;">
      <a href="URL" target="_blank" class="button-minimal"
         style="font-size: 10px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; color: #000000; text-decoration: none; display: inline-block; padding: 16px 45px;">Label</a>
    </td>
  </tr>
</table>
```
On dark: `border: 1px solid #ffffff` on the `<td>`, `color: #ffffff` on the `<a>`, `align="center"`, and `style="margin: 25px auto 0 auto;"` on the wrapping table.

**Button copy:** invitational, not imperative. Prefer "Read the full guide", "Explore our cheeses", "Get the recipe" over commands like "Buy now". If a label from the client reads pushy, suggest a softer alternative.

**Button destinations:** always absolute `https://farmhouseartisancheese.com/...` URLs. Recipes use the recipe's anchor on the recipes page. Blog teasers link to the published post. Category CTAs link to the matching collection page. Before finalising, confirm each destination exists in the repo (or will exist once the related branch is merged) and say so if it does not yet.

## Images

```html
<img src="URL" alt="Description" style="display: block; width: 100%; height: auto;">
```
- Use the client's alt text when supplied; otherwise write plain, descriptive alt text.
- **Asset location:** newsletter-specific images live in `assets/newsletter/<month-year>/` and are referenced as `https://farmhouseartisancheese.com/assets/newsletter/<month-year>/<file>`. If the client uploaded images elsewhere in the repo (for example an image library folder), copy them into the issue's folder with **lowercase, hyphenated filenames**. The host is case-sensitive, so never copy a path from the client copy without checking its case against the real folder.
- Images that already live on the site (recipe photos, blog hero images, shared logos) can be referenced at their existing site paths.
- Hero uses a darkened image (`filter: brightness(0.5)`) with overlaid text. Reuse the previous issue's hero image unless the client specifies a new one.
- Footer logo is the white logo asset; social icons use `filter: invert(1); opacity: 0.5`.
- Prefer WebP. Flag images that are very heavy or too small for the width they display at.
- Portrait images need the split layout (or a `max-width` constraint) so they do not dominate the email.

## Hero section

Overlay table with the issue number (lowercase, `n&#186;`), the title, and the month/year, followed by an `<!-- [if mso] -->` block with a simplified dark-background version for Outlook. Copy the structure from the previous issue and change only the issue number and month. The issue number is the previous issue's number plus one; confirm it against the previous file and the client copy.

## Header and footer

Header: FH icon (inverted) beside the letter-spaced wordmark, centred. Footer, on black with 50px padding, in this order: white logo (190px), Instagram and Facebook icons, mailto-linked email address (a plain-text address triggers Campaign Monitor obfuscation), phone number, "Warmly" signature, subscription line with the preferences and unsubscribe tags, copyright line, SquareStair Media credit link. Copy both from the previous issue.

Dark Visit section: heading, a one-sentence welcome from the client copy, street address, hours (en-dash ranges), and a white-bordered Contact button.

## Responsive rules (`@media only screen and (max-width: 680px)`)

```css
.email-container { width: 100% !important; }
.hero-headline { font-size: 40px !important; letter-spacing: 7px !important; max-width: 100% !important; width: 100% !important; }
.stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
.stack-pr { padding-right: 0 !important; }
.stack-pl { padding-left: 0 !important; }
.stack-border-left { border-left: 0 !important; padding-left: 0 !important; }
.stack-border-right { border-right: 0 !important; padding-right: 0 !important; }
.headline-massive { font-size: 38px !important; letter-spacing: 6px !important; }
.headline-large { font-size: 28px !important; letter-spacing: 5px !important; }
.headline-medium { font-size: 22px !important; letter-spacing: 3px !important; }
.mobile-padding { padding-left: 25px !important; padding-right: 25px !important; }
.mobile-hide { display: none !important; }
.mobile-top-pad { padding-top: 20px !important; }
```
Stacked split columns need the image cell's right padding removed on mobile (the existing rules handle this through the stack classes and the cell's inline padding; verify visually).

## Email-safe reset (always in `<head>`)

```css
body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
```
plus `<meta name="x-apple-disable-message-reformatting">`.

## Tone and voice

- Warm and inviting, never salesy. Editorial letter, not promotion.
- Canadian spelling (flavour, colour, centre, neighbours, aging).
- Seasonal and sensory. Personal but professional; staff may be named by first name; reference the Kerr Village location.
- Understated urgency ("Quantities are limited"), no exclamation marks in headings.
- Keep the client's wording. Edit only for spelling, punctuation, clarity, consistency between sections, and these style rules, and report each change.

## Special characters

Use HTML entities in email: em dash `&#8212;`, en dash `&#8211;`, curly quotes `&#8216; &#8217; &#8220; &#8221;`, ellipsis `&#8230;`, ordinal `&#186;`, and entities for accented letters (for example `&#232;`, `&#233;`).

## File naming

- Newsletter HTML: `<Month><Year>Newsletter.html` (for example `October2026Newsletter.html`) inside `assets/newsletter/<month-year>/`.
- Images: `assets/newsletter/<month-year>/` (see Images).
- Shared assets (logos, icons): `https://farmhouseartisancheese.com/assets/images/`.

## Checks before delivery

- [ ] Subject tag, preheader blocks, `<webversion>`, `<preferences>` and `<unsubscribe>` are present
- [ ] Every style from the head classes is repeated inline
- [ ] All `<table>` elements have `role="presentation"`; row, cell, and table tags balance (scripted count)
- [ ] Outlook `[if mso]` fallback present for the hero
- [ ] Images have `display: block` and `height: auto`; every image path exists with the exact case
- [ ] Every button destination resolves (or is flagged as pending)
- [ ] Intro, preheader, and section summaries agree with each other and with the pages they link to
- [ ] Canadian spelling, entities for special characters, no exclamation marks in headings
- [ ] SquareStair Media credit link and mailto email link present
- [ ] Issue number is previous plus one
- [ ] If you can render the file, check desktop and a narrow width. Note that a headless browser may not render below about 500px wide, so say so if mobile could not be confirmed. For local previews, point asset URLs at the local files or serve the repo locally.
