---
name: farmhouse-recipe-page
description: Add or update a recipe on the Farmhouse Artisan Cheese recipes page from a client-supplied recipe draft, including Recipe schema, overview card, article block, numbering, image, internal links, and site wiring. Use whenever a recipe of the month or any new recipe is requested for the Farmhouse Artisan Cheese site.
---

# Farmhouse recipe page

All recipes live on a single page, `recipes.html`: an overview list of cards followed by one article per recipe, with Recipe schema for each. This skill adds a recipe to that page cleanly and keeps the rest of the page consistent.

## Inputs to look for
- The client's recipe draft (usually markdown in `assets/recipes/` or a newsletter folder).
- The recipe image(s), usually added to the repo by the client.

## 1. Learn the current pattern first
Do not build from memory. Open `recipes.html` and study:
- The JSON-LD `@graph` (page node plus one Recipe node per recipe).
- The overview (table of contents) card list.
- One complete recipe article (meta row, intro, ingredients, method, tip, print/share actions, back-to-top).
- The page's inline script (print and share functions) so IDs you add actually work.
- How the other recipes are numbered and how their image sides alternate.

## 2. Add the recipe
- New recipes go at the top as Recipe 01 unless the user says otherwise. Renumber the existing recipes in all three places (overview card number, article label, HTML comment) and re-alternate image sides so the left/right rhythm continues without two neighbours on the same side.
- Give the recipe a short, lowercase, hyphenated ID; use it for the article `id`, the overview card link, the schema `@id`, and the print/share calls.
- Image: web-optimised (WebP preferred), stored in the recipes image folder with a lowercase hyphenated name. Alt text describes the finished dish. Use the same image path in the card, article, schema, and Pinterest share call.
- Article block: "Best for", "Serves", "Time" row; intro; ingredients list; numbered method; the "Farmhouse tip" box built from the client's "why this cheese" or notes text; print and share actions; back-to-top link.
- Recipe schema: name, description, absolute image URL, author and publisher references, `datePublished`, `recipeYield`, ISO 8601 `prepTime`/`cookTime`/`totalTime`, category, cuisine, keywords, `recipeIngredient` (one string each), and `recipeInstructions` as HowToStep items. Schema text must match the visible text.

## 3. Missing information
Drafts often omit servings, times, or exact quantities.
- Use client-provided values whenever they exist.
- If you must estimate (servings, prep/total time), keep the estimate conservative, derive it from the method's stated times where possible, and flag it clearly in your report so it can be confirmed with the client.
- Never invent ingredient quantities or steps. If an ingredient has no quantity in the draft, keep it as written.

## 4. Style rules
- Canadian spelling. Temperatures in both °F and °C. Consistent ingredient formatting (quantity, unit, item, prep note).
- Keep the client's voice in the intro and tip; make light edits only for clarity and consistency and flag any wording changes.
- Check formatting end to end: list structure, numbering, balanced tags, consistent punctuation.

## 5. Internal linking and wiring
- Link relevant ingredients or cheese types to the matching collection page where it reads naturally (use descriptive anchor text, once per target, in body text only, existing inline link style).
- Link to a related blog post where one fits, and edit that blog post to link back to the recipe using the recipe's anchor (`recipes.html#<id>`).
- Confirm every link target exists with a scripted check.
- Update `llms.txt` so the recipes line reflects the new recipe, and review the sitemap entry for the recipes page.
- Check that the page title, hero text, and collection schema name still suit the seasons now on the page; flag mismatches rather than silently rewriting them.
- Newsletter and blog links to a recipe should use the recipe anchor, so confirm the ID is stable before sharing it.

## 6. Quality checks before finishing
- All JSON-LD blocks parse.
- Number of overview cards equals number of recipe articles; every card anchor resolves to an article; every print/share call uses an ID that exists.
- No unbalanced tags; image paths exist; image weight and resolution suit how it is displayed.
- If you can render the page, check desktop and a narrow width, and that the image alternation still looks right.

## 7. Report back
Summarise: files changed, renumbering done, estimated or derived values, wording edits, links added (anchors and targets), and anything to confirm with the client.
