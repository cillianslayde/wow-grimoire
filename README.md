# Warcraft Grimoire

A text-first, dark, icon-driven reference and reminder tool for World of Warcraft — built for two audiences at once: newcomers who need the basics explained, and veterans who just need a fast lookup. Covers the whole franchise (Vanilla through Retail's Midnight, Classic, and the new permanent Forever/Classic+ world) with an emphasis on Forever and on comparing systems across eras.

No build step, no backend, no account — a single HTML file plus a small set of asset files, storing everything locally in your browser.

---

## Sections

The Grimoire holds five kinds of entry, switchable from the header:

| Type | Purpose |
|---|---|
| 📖 **Chronicle** | History & lore — one entry per era (Vanilla → Forever), plus cross-era story arcs like the Worldsoul Saga |
| ⚔️ **System** | How to actually play — from true day-one basics (Getting Started) through general mechanics up to veteran/endgame systems (raid loot, Mythic+, rated PvP, theorycrafting) |
| 🎒 **Item** | Representative gear categories — weapons, potions, armor, enchants, and more — what they're for and why, not an exhaustive item database |
| 📊 **Comparison** | The same system explained side-by-side across two eras, with explicit similarities and differences |
| 🔣 **Icon** | A glossary of in-game symbols (quality colors, role icons, map markers, etc.) described in plain text/emoji swatches, not reproduced game art |

Every entry supports tags, pinning (Chronicle), and attached images (upload or paste a URL). The Grimoire ships pre-seeded with content across all five types — see **Restock**, below, for keeping that content current.

## Highlighter & My Highlights

Select any text inside a Reader entry to pop a five-color highlight palette. Highlights are stored separately from the entries themselves (as pointers, not embedded markup), so they never alter your content. The **🖍 Highlights** button opens **My Highlights** — every highlight you've made, newest first, each with a snippet, a one-click jump back to its source entry, and a remove button.

## Dictionary

A glossary of common WoW terms and acronyms (aggro, wipe, ilvl, Mythic+, and dozens more), written in plain original language. Matching terms get a dotted underline anywhere they appear in the Grimoire's text — click one for a definition popover. Toggle inline linking on/off from the Reader toolbar, or browse the full glossary via the **📖 Dictionary** button.

## Characters

The **🎭 Characters** button opens a searchable, filterable reference of the story's major and main figures — faction, role, the eras they're tied to, and a short explanation of who they are. This data lives in its own file (`assets/data/characters.js`) rather than inside the app's main script, specifically so it works whether the app is opened directly as a file or hosted on the web.

## Restock Missing Content

Because the Grimoire only auto-fills itself with starter content the very first time it's ever opened, a browser that already has saved entries won't automatically pick up new content added in a later version of this file. The **🔄 Restock** button compares the app's full current seed content against what's actually saved (matched by entry type + title) and offers to add only what's missing — never touching or duplicating anything you've already added or edited.

---

## File Structure

```
wow-grimoire.html
assets/
  css/
    main.css
  js/
    main.js
  data/
    characters.js
```

All four files are required — `wow-grimoire.html` loads the other three via relative paths. Keep the folder structure intact wherever you place it.

## Storage & Data

Everything you create or edit is saved automatically to this browser's `localStorage` — there is no account, no server, and no sync between devices or browsers. Specifically:

- `wow_grimoire_entries` — every Chronicle/System/Item/Comparison/Icon entry
- `wow_grimoire_highlights` — saved highlights
- `wow_grimoire_dict_on` — your Dictionary inline-linking preference
- `wow_grimoire_seeded` — a flag marking that starter content has already been added once, so it isn't re-added after you delete it

Clearing your browser's site data (or using a private/incognito window, which typically discards storage on close) will erase everything. There is currently no export/import or backup feature — treat this as a personal, single-browser reference tool rather than a system of record.

## Deployment

This is a static site — no build step. To host it (e.g. via GitHub Pages under the cillianslayde account, matching the rest of the GRIDLI/Grimoire family):

1. Push this folder structure to a public repository.
2. Enable GitHub Pages for the repo (Settings → Pages → deploy from the main branch).
3. The app will be reachable at `https://cillianslayde.github.io/<repo-name>/wow-grimoire.html`. If you'd rather it load at the clean root URL (`.../<repo-name>/` with no filename), rename `wow-grimoire.html` to `index.html` — just note every reference to the filename in this README would then be out of date.

It also works opened directly from disk (double-click `wow-grimoire.html`) with no server at all — every feature, including Characters, was specifically built to avoid browser restrictions on local file access.

## License

All rights reserved — see [LICENSE](./LICENSE).
