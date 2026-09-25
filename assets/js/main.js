/* ═══════════════════════════════════════════
   WOW GRIMOIRE — assets/js/main.js
   ~/>  Warcraft Grimoire  ·  v1h
   Reskinned from the Book of Shadows engine (wiccan-main.js).
   Journal→Chronicle, Spell→System, Ritual→Item, Rede→Comparison,
   Tarot→Icon. Calendar/Sabbats/Tarot-deck mechanics fully removed.
   v1b: added Highlighter (color-coded text highlights + My Highlights
   panel) and Dictionary (WoW terms glossary + inline term-linking in
   the Reader), plus expanded seed content across System/Item/
   Comparison/Icon.
   v1c: added Characters — a major/main character reference modal
   backed by a flat JSON file (assets/data/characters.json), loaded
   via fetch on init. Requires http(s) hosting, not file://.
   v1d: fixed Characters to work when opened directly via file:// —
   character data moved from characters.json (fetch, blocked locally)
   to assets/data/characters.js (a plain global array, <script>-tag
   loaded, works everywhere).
   v1e: added 8 System entries filling the true day-one onboarding
   gap (Character Creation, Reading the Screen, Basic Controls &
   Combat Flow, Quest Log Mechanics, Death & Recovery, Bags/Vendors/
   Mail & Repairs, Social Basics, Your First Hour), under a new
   "Getting Started" category added to the System pill-grid.
   v1f: added a Restock Missing Content button — compares the current
   seed set against what's actually saved (matched by type+title) and
   offers to add only what's missing, fixing the fact that
   auto-seeding only ever runs once on a genuinely empty Grimoire.
   v1g: expanded seed content — Chronicle 14→16 (Warcraft III & The
   Third War, The Worldsoul Saga), Item 7→10 (Shields, Food & Drink,
   Enchants & Gems), Comparison 6→8 (Raid Access: Attunements vs Open
   Access, Character Customization Options), Icon 7→9 (Difficulty &
   Binding Icons, Achievement Icons). 63 seed entries total.
   v1h: added 8 veteran/endgame-facing System entries — Raid Loot
   Systems, Boss Mods & Raid Addons, Consumable & Raid-Prep Checklist,
   Warbands & Account-Wide Progress, Mythic+ Seasons/Affixes/Great
   Vault, Rated PvP (ratings/seasons/comps), Stat Priorities &
   Theorycrafting, Transmog & Cosmetic Collecting — filling the gap
   above the newbie-facing content added in v1e. System now 20→28.
   71 seed entries total.
═══════════════════════════════════════════ */

/* ══════════════════════════════
   STORAGE
   All entries auto-saved to localStorage under wow_grimoire_entries.
   Renamed from the Book of Shadows key so the two apps never share
   or collide over stored data (project isolation).
   Auto-initialised on load — zero user action required.
   On a genuinely first-ever load (nothing in storage yet) the app
   seeds itself with starter Grimoire content — see SEED_ENTRIES below.
   Base64 images stored inline on each entry as entry.images[].
   Large images compressed to max 800px / JPEG 0.75 before storage.
══════════════════════════════ */
const LS_KEY = 'wow_grimoire_entries';

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const p   = raw ? JSON.parse(raw) : [];
    return Array.isArray(p) ? p : [];
  } catch { return []; }
}

function lsSave(entries) {
  const ordered = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ordered));
  } catch (err) {
    console.error('localStorage write failed:', err);
    alert('Storage quota exceeded — consider removing images or older entries.');
  }
}

/* ══════════════════════════════
   ERA REFERENCE
   Shared label lookup for the era pill-grids (Chronicle era,
   Comparison Era A / Era B). Keys match each pill button's data-val.
══════════════════════════════ */
const ERA_LABEL = {
  vanilla:      'Vanilla',
  tbc:          'Burning Crusade',
  wotlk:        'Wrath of the Lich King',
  cata:         'Cataclysm',
  mop:          'Mists of Pandaria',
  wod:          'Warlords of Draenor',
  legion:       'Legion',
  bfa:          'Battle for Azeroth',
  shadowlands:  'Shadowlands',
  dragonflight: 'Dragonflight',
  warwithin:    'The War Within',
  midnight:     'Midnight',
  classic:      'Classic',
  forever:      'Forever'
};

/* ══════════════════════════════
   HIGHLIGHTER STORAGE
   Highlights are stored separately from entries, as pointers
   {id, entryId, field, start, end, color, timestamp} rather than
   embedded markup — the entry's own text never changes.
══════════════════════════════ */
const HL_LS_KEY = 'wow_grimoire_highlights';

function hlLoad() {
  try {
    const raw = localStorage.getItem(HL_LS_KEY);
    const p   = raw ? JSON.parse(raw) : [];
    return Array.isArray(p) ? p : [];
  } catch { return []; }
}

function hlSave(list) {
  try { localStorage.setItem(HL_LS_KEY, JSON.stringify(list)); }
  catch (err) { console.error('Highlight storage write failed:', err); }
}

const HL_COLORS = [
  { key: 'yellow', hex: '#e8d44d' },
  { key: 'green',  hex: '#7bc86c' },
  { key: 'blue',   hex: '#6cb4e8' },
  { key: 'red',    hex: '#e86c6c' },
  { key: 'purple', hex: '#b46ce8' }
];

/* ══════════════════════════════
   DICTIONARY
   A WoW-only glossary of common terms and acronyms. Definitions are
   written in plain original language, not sourced from any official
   or copyrighted text. Inline term-linking in the Reader reuses the
   highlighter's text-span rendering — a term that overlaps an
   existing highlight is skipped rather than nested, to avoid
   malformed markup (a documented tradeoff, not a bug).
══════════════════════════════ */
const DICTIONARY = [
  { term: 'Aggro',      definition: 'The attention or threat a hostile creature has toward a specific player. "Pulling aggro" means becoming that creature\'s current target.' },
  { term: 'Threat',     definition: 'The underlying value that determines who a hostile creature attacks. Tanks use abilities built to generate threat faster than anyone else in the group.' },
  { term: 'Taunt',      definition: 'An ability that forces a target to attack its caster, used by tanks to grab or regain aggro on demand.' },
  { term: 'Tank',       definition: 'The group role responsible for absorbing and mitigating enemy damage while holding aggro so the rest of the group stays safe.' },
  { term: 'Healer',     definition: 'The group role responsible for restoring the group\'s health during a fight.' },
  { term: 'DPS',        definition: 'Damage per second — both the metric used to measure damage output and the common name for the damage-dealer role.' },
  { term: 'MT',         definition: 'Main Tank — the primary tank in a fight that uses more than one tank.' },
  { term: 'OT',         definition: 'Off Tank — a secondary tank, often responsible for picking up extra enemies or covering a tank swap.' },
  { term: 'CC',         definition: 'Crowd control — abilities that stun, root, sleep, or otherwise disable an enemy temporarily so it can\'t act.' },
  { term: 'Kite',       definition: 'Moving away from an enemy while continuing to attack it at range, so it can never catch and hit you back.' },
  { term: 'Pull',       definition: 'The act of engaging an enemy or group of enemies to begin a fight.' },
  { term: 'Wipe',       definition: 'When the entire group dies during an attempt and has to restart the encounter.' },
  { term: 'Add',        definition: 'An extra enemy that joins an ongoing fight, often spawned partway through a boss encounter.' },
  { term: 'Interrupt',  definition: 'An ability that cancels an enemy\'s spell cast before it finishes.' },
  { term: 'Cooldown',   definition: 'The wait time before an ability can be used again after casting it.' },
  { term: 'GCD',        definition: 'Global cooldown — the brief shared delay between using most abilities, which caps how fast you can act overall.' },
  { term: 'Proc',       definition: 'A chance-based effect that triggers automatically as a side effect of another action, rather than being cast directly.' },
  { term: 'RNG',        definition: 'Random number generation — shorthand for anything left to chance, like whether an item drops.' },
  { term: 'Loot',       definition: 'Items dropped by defeated enemies or found in containers out in the world.' },
  { term: 'BiS',        definition: 'Best in Slot — the strongest currently available item for a given gear slot and build.' },
  { term: 'ilvl',       definition: 'Item level — a single number that summarizes a piece of gear\'s overall power.' },
  { term: 'Buff',       definition: 'A temporary positive effect applied to a character.' },
  { term: 'Debuff',     definition: 'A temporary negative effect applied to a character.' },
  { term: 'Rez',        definition: 'Short for "resurrect" — bringing a dead player back to life.' },
  { term: 'AoE',        definition: 'Area of effect — an ability or attack that hits every target within a zone at once, rather than a single target.' },
  { term: 'Mob',        definition: 'Any hostile non-player creature (from "mobile object"), as opposed to a player character.' },
  { term: 'Elite',      definition: 'A noticeably stronger-than-normal enemy, usually meant to be fought with a group rather than solo.' },
  { term: 'LFG',        definition: 'Looking For Group — both the phrase players use and the in-game tool for finding a group to play with.' },
  { term: 'LFR',        definition: 'Looking For Raid — the most accessible raid difficulty, using automated group formation instead of a set roster.' },
  { term: 'PUG',        definition: 'Pick-Up Group — a group formed from strangers via a group finder tool rather than friends or guildmates.' },
  { term: 'Guild',      definition: 'A persistent, player-created community within the game, with its own roster, chat, and often shared perks.' },
  { term: 'Transmog',   definition: 'Short for "transmogrification" — changing how an item looks without changing its actual stats.' },
  { term: 'Mythic+',    definition: 'A scaling difficulty system for dungeons: the same dungeon run at increasing difficulty levels, timed, and modified by weekly affixes.' },
  { term: 'Affix',      definition: 'A weekly modifier that changes how Mythic+ dungeons play that week, layering an extra mechanic on top of the normal fights.' },
  { term: 'Respec',     definition: 'Changing your character\'s talent build — historically costly and slow, now generally fast and flexible in modern Retail.' },
  { term: 'OOM',        definition: 'Out of mana — shorthand for running out of the resource needed to cast spells.' },
  { term: 'LOS',        definition: 'Line of sight — "breaking LOS" means moving somewhere an enemy or its ability physically can\'t reach you.' }
];

/* ══════════════════════════════
   STATE
   Display state tracked via DOM only.
   imageDataUrls: accumulates compressed data URIs for the current entry.
   _activePickForm: tracks which form the file picker was triggered from.
   editingId: null when composing new; set to entry.id when editing existing.
══════════════════════════════ */
const state = {
  entries:          lsLoad(),
  highlights:       hlLoad(),
  dictOn:           localStorage.getItem('wow_grimoire_dict_on') !== '0',
  characters:       [],
  charactersError:  false,
  charFilter:       'all',
  activeType:       'chronicle',
  chronicleEra:     'vanilla',
  systemCategory:   'leveling',
  systemAudience:   'newplayer',
  itemType:         'weapon',
  itemQuality:      'common',
  comparisonEraA:   'vanilla',
  comparisonEraB:   'forever',
  iconCategory:     'quality',
  readerSort:       'desc',
  recentFilter:     'all',
  grimoireQuery:    '',
  pendingDelete:    null,
  pendingRestock:   [],
  readerScrollTo:   null,
  imageDataUrls:    [],
  editingId:        null      // id of the entry being edited, or null for new entries
};

/* Tracks which form triggered the hidden file picker */
let _activePickForm = 'chronicle';

/* ══════════════════════════════
   TYPE EMOJI
══════════════════════════════ */
const TYPE_EMOJI = { chronicle:'📖', system:'⚔️', item:'🎒', comparison:'📊', icon:'🔣' };

/* ══════════════════════════════
   DOM REFS
══════════════════════════════ */
const btnReader          = document.getElementById('btn-reader');
const storageStatus      = document.getElementById('storage-status');
const clockTime          = document.getElementById('clock-time');
const clockDate          = document.getElementById('clock-date');
const stampDay           = document.getElementById('stamp-day');
const stampDate          = document.getElementById('stamp-date');
const stampTime          = document.getElementById('stamp-time');
const emojiStrip         = document.getElementById('emoji-strip');
const btnSave            = document.getElementById('btn-save');
const btnClear           = document.getElementById('btn-clear');
const saveStatus         = document.getElementById('save-status');
const recentList         = document.getElementById('recent-list');
const recentCount        = document.getElementById('recent-count');
const footerCount        = document.getElementById('footer-count');
const recentFilters      = document.getElementById('recent-filters');
const grimoireSearch     = document.getElementById('grimoire-search');
const grimoireSearchClear= document.getElementById('grimoire-search-clear');
const grimoireSuggest    = document.getElementById('grimoire-suggest');
const overlayReader      = document.getElementById('overlay-reader');
const readerBody         = document.getElementById('reader-body');
const readerSearch       = document.getElementById('reader-search');
const readerFilterType   = document.getElementById('reader-filter-type');
const readerFilterCat    = document.getElementById('reader-filter-cat');
const readerSort         = document.getElementById('reader-sort');
const readerSubtitle     = document.getElementById('reader-subtitle');
const readerClose        = document.getElementById('reader-close');
const overlayDelete      = document.getElementById('overlay-delete');
const deleteConfirm      = document.getElementById('delete-confirm');
const deleteCancel       = document.getElementById('delete-cancel');
const imgFileInput       = document.getElementById('img-file-input');
const btnHighlights      = document.getElementById('btn-highlights');
const overlayHighlights  = document.getElementById('overlay-highlights');
const highlightsList     = document.getElementById('highlights-list');
const highlightsClose    = document.getElementById('highlights-close');
const btnDictionary      = document.getElementById('btn-dictionary');
const overlayDictionary  = document.getElementById('overlay-dictionary');
const dictSearch         = document.getElementById('dict-search');
const dictList           = document.getElementById('dict-list');
const dictClose          = document.getElementById('dict-close');
const readerTermsToggle  = document.getElementById('reader-terms-toggle');
const btnCharacters      = document.getElementById('btn-characters');
const overlayCharacters  = document.getElementById('overlay-characters');
const charSearch         = document.getElementById('char-search');
const charFilterRow      = document.getElementById('char-filter-row');
const charList           = document.getElementById('char-list');
const charClose          = document.getElementById('char-close');
const btnRestock         = document.getElementById('btn-restock');
const overlayRestock     = document.getElementById('overlay-restock');
const restockMessage     = document.getElementById('restock-message');
const restockConfirm     = document.getElementById('restock-confirm');
const restockCancel      = document.getElementById('restock-cancel');

/* ══════════════════════════════
   LIVE CLOCK
══════════════════════════════ */
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

let _lastStampMinute = -1;

function tickClock() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2,'0');
  const mm  = String(now.getMinutes()).padStart(2,'0');
  const ss  = String(now.getSeconds()).padStart(2,'0');
  clockTime.textContent = `${hh}:${mm}:${ss}`;
  clockDate.textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  const cur = now.getHours() * 60 + now.getMinutes();
  if (cur !== _lastStampMinute) {
    _lastStampMinute = cur;
    stampDay.textContent  = DAYS[now.getDay()];
    stampDate.textContent = `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    stampTime.textContent = `${hh}:${mm}`;
  }
}
setInterval(tickClock, 1000);
tickClock();

/* ══════════════════════════════
   STORAGE STATUS
══════════════════════════════ */
function updateStorageStatus() {
  const n  = state.entries.length;
  const kb = (new Blob([localStorage.getItem(LS_KEY)||'']).size / 1024).toFixed(1);
  storageStatus.textContent = `${n} entr${n !== 1 ? 'ies' : 'y'} · ${kb} KB`;
  storageStatus.classList.add('loaded');
}

/* ══════════════════════════════
   TYPE SWITCHING
══════════════════════════════ */
function switchType(type) {
  state.activeType = type;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  document.querySelectorAll('.entry-form').forEach(f => f.classList.add('hidden'));
  document.getElementById(`form-${type}`).classList.remove('hidden');
  checkSaveEnabled();
}

/* ══════════════════════════════
   PILL GRID HELPERS
══════════════════════════════ */
function activatePill(gridId, stateKey, val) {
  document.querySelectorAll(`#${gridId} .pill-btn`).forEach(b => {
    b.classList.toggle('active', b.dataset.val === val);
  });
  state[stateKey] = val;
}

/* ══════════════════════════════
   IMAGE UPLOAD
   compressImage: reads File → canvas → dataURI (max 800px, JPEG 0.75)
   addImageUrl:   validates and adds a URL string directly (no compression)
   renderImagePreview: re-renders the thumbnail strip for the active form
══════════════════════════════ */
const IMG_MAX_PX  = 800;
const IMG_QUALITY = 0.75;

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.onload  = evt => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image decode failed'));
      img.onload  = () => {
        let { width, height } = img;
        if (width > IMG_MAX_PX || height > IMG_MAX_PX) {
          if (width >= height) { height = Math.round((height / width) * IMG_MAX_PX); width = IMG_MAX_PX; }
          else                 { width  = Math.round((width / height) * IMG_MAX_PX); height = IMG_MAX_PX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', IMG_QUALITY));
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function addImageUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return;
  if (!/^(https?:|data:)/.test(trimmed)) {
    alert('Please enter a valid image URL starting with http:// or https://');
    return;
  }
  state.imageDataUrls.push(trimmed);
  renderImagePreview();
}

function renderImagePreview() {
  const strip = document.getElementById(`img-preview-strip-${state.activeType}`);
  if (!strip) return;
  strip.innerHTML = '';
  state.imageDataUrls.forEach((src, i) => {
    const wrap      = document.createElement('div');
    wrap.className  = 'img-thumb-wrap';
    const img       = document.createElement('img');
    img.className   = 'img-thumb';
    img.src         = src;
    img.alt         = `Attached image ${i + 1}`;
    img.loading     = 'lazy';
    const removeBtn = document.createElement('button');
    removeBtn.className   = 'img-thumb-remove';
    removeBtn.type        = 'button';
    removeBtn.textContent = '×';
    removeBtn.title       = 'Remove image';
    removeBtn.addEventListener('click', () => { state.imageDataUrls.splice(i, 1); renderImagePreview(); });
    wrap.appendChild(img);
    wrap.appendChild(removeBtn);
    strip.appendChild(wrap);
  });
}

/* ══════════════════════════════
   BUILD ENTRY OBJECT
   images: always included — empty array if none attached.
══════════════════════════════ */
function buildEntry() {
  const now     = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const base    = { id: String(now.getTime()), date: dateStr, time: timeStr, timestamp: now.getTime(), type: state.activeType };
  const tags    = el => el.value.trim() ? el.value.split(',').map(t => t.trim()).filter(Boolean) : [];
  const images  = [...state.imageDataUrls];

  switch (state.activeType) {
    case 'chronicle': return { ...base,
      title:   document.getElementById('chronicle-title').value.trim(),
      era:     state.chronicleEra,
      body:    document.getElementById('chronicle-body').value.trim(),
      figures: document.getElementById('chronicle-figures').value.trim(),
      notes:   document.getElementById('chronicle-notes').value.trim(),
      tags:    tags(document.getElementById('chronicle-tags')),
      pinned:  document.getElementById('chronicle-pinned').checked,
      images
    };
    case 'system': return { ...base,
      title:    document.getElementById('system-title').value.trim(),
      category: state.systemCategory,
      audience: state.systemAudience,
      terms:    document.getElementById('system-terms').value.trim(),
      body:     document.getElementById('system-body').value.trim(),
      tips:     document.getElementById('system-tips').value.trim(),
      tags:     tags(document.getElementById('system-tags')),
      images
    };
    case 'item': return { ...base,
      title:    document.getElementById('item-title').value.trim(),
      itemType: state.itemType,
      quality:  state.itemQuality,
      examples: document.getElementById('item-examples').value.trim(),
      purpose:  document.getElementById('item-purpose').value.trim(),
      notes:    document.getElementById('item-notes').value.trim(),
      tags:     tags(document.getElementById('item-tags')),
      images
    };
    case 'comparison': return { ...base,
      title:        document.getElementById('comparison-title').value.trim(),
      eraA:         state.comparisonEraA,
      eraB:         state.comparisonEraB,
      bodyA:        document.getElementById('comparison-a-body').value.trim(),
      bodyB:        document.getElementById('comparison-b-body').value.trim(),
      similarities: document.getElementById('comparison-similarities').value.trim(),
      differences:  document.getElementById('comparison-differences').value.trim(),
      tags:         tags(document.getElementById('comparison-tags')),
      images
    };
    case 'icon': return { ...base,
      title:    document.getElementById('icon-title').value.trim(),
      symbol:   document.getElementById('icon-symbol').value.trim(),
      category: state.iconCategory,
      meaning:  document.getElementById('icon-meaning').value.trim(),
      context:  document.getElementById('icon-context').value.trim(),
      tags:     tags(document.getElementById('icon-tags')),
      images
    };
  }
}

/* ══════════════════════════════
   SAVE ENTRY
   When state.editingId is set the existing entry is updated in-place,
   preserving its original id, date, time, and timestamp.
   When null a new entry is created as normal.
══════════════════════════════ */
function saveEntry() {
  const entry = buildEntry();
  if (!entry) return;

  if (state.editingId) {
    // ── UPDATE existing entry — preserve original identity fields ──
    const original = state.entries.find(e => e.id === state.editingId);
    const updated  = {
      ...entry,
      id:        original ? original.id        : entry.id,
      date:      original ? original.date      : entry.date,
      time:      original ? original.time      : entry.time,
      timestamp: original ? original.timestamp : entry.timestamp
    };
    state.entries  = state.entries.map(e => e.id === state.editingId ? updated : e);
    state.editingId = null;
    btnSave.innerHTML = '&#x1F4BE; Save to Grimoire';
    updateEditBanner(false);
  } else {
    // ── CREATE new entry ──
    state.entries.push(entry);
  }

  lsSave(state.entries);
  saveStatus.textContent = '✓ Saved to Grimoire';
  saveStatus.classList.add('visible');
  setTimeout(() => saveStatus.classList.remove('visible'), 2200);

  clearComposer();
  renderRecentPanel();
  updateFooter();
  updateStorageStatus();
  populateCategoryFilter();
}

/* ══════════════════════════════
   CLEAR COMPOSER
   Clears all fields and image state across all entry types.
   Also cancels any active edit session.
══════════════════════════════ */
function clearComposer() {
  ['chronicle-title','chronicle-body','chronicle-figures','chronicle-notes','chronicle-tags'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  const cp = document.getElementById('chronicle-pinned'); if(cp) cp.checked = false;
  activatePill('chronicle-era-grid','chronicleEra','vanilla');

  ['system-title','system-terms','system-body','system-tips','system-tags'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  activatePill('system-category-grid','systemCategory','leveling');
  activatePill('system-audience-grid','systemAudience','newplayer');

  ['item-title','item-examples','item-purpose','item-notes','item-tags'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  activatePill('item-type-grid','itemType','weapon');
  activatePill('item-quality-grid','itemQuality','common');

  ['comparison-title','comparison-a-body','comparison-b-body','comparison-similarities','comparison-differences','comparison-tags'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  activatePill('comparison-eraa-grid','comparisonEraA','vanilla');
  activatePill('comparison-erab-grid','comparisonEraB','forever');

  ['icon-title','icon-symbol','icon-meaning','icon-context','icon-tags'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  activatePill('icon-category-grid','iconCategory','quality');

  document.querySelectorAll('.img-url-input').forEach(el => { el.value = ''; });

  state.imageDataUrls = [];
  ['chronicle','system','item','comparison','icon'].forEach(type => {
    const strip = document.getElementById(`img-preview-strip-${type}`);
    if (strip) strip.innerHTML = '';
  });

  // Cancel edit state if active
  if (state.editingId) {
    state.editingId = null;
    btnSave.innerHTML = '&#x1F4BE; Save to Grimoire';
    updateEditBanner(false);
  }

  checkSaveEnabled();
}

/* ══════════════════════════════
   EDIT BANNER
   Amber contextual strip above the composer action bar.
   Shown when the composer is in edit mode; hidden when idle.
   The Cancel button inside calls cancelEdit().
══════════════════════════════ */
function updateEditBanner(visible, title) {
  let banner = document.getElementById('composer-edit-banner');

  if (!visible) {
    if (banner) banner.style.display = 'none';
    return;
  }

  // Inject banner above .composer-actions on first use
  if (!banner) {
    banner = document.createElement('div');
    banner.id        = 'composer-edit-banner';
    banner.className = 'composer-edit-banner';
    const actionsBar = document.querySelector('.composer-actions');
    actionsBar.parentNode.insertBefore(banner, actionsBar);
  }

  banner.style.display = 'flex';
  banner.innerHTML = `
    <span class="edit-banner-label">&#x270F;&#xFE0F; Editing: <em>${escapeHtml(title || 'Entry')}</em></span>
    <button class="edit-banner-cancel" id="edit-banner-cancel-btn" type="button">&#x2715; Cancel Edit</button>
  `;
  document.getElementById('edit-banner-cancel-btn').addEventListener('click', cancelEdit);
}

/* ══════════════════════════════
   CANCEL EDIT
   Discards all pending changes and returns the composer to new-entry mode.
══════════════════════════════ */
function cancelEdit() {
  // clearComposer handles the editingId reset, button label, and banner hide
  clearComposer();
}

/* ══════════════════════════════
   EDIT ENTRY
   Loads an existing entry into the composer and activates edit mode.
   All fields across all types are fully populated from the stored entry.
   The reader modal is closed so the composer is visible.
══════════════════════════════ */
function editEntry(id) {
  const entry = state.entries.find(e => e.id === id);
  if (!entry) return;

  // Close the reader modal and reset scroll target
  overlayReader.style.display = 'none';
  state.readerScrollTo = null;

  // Switch the composer to the correct type form
  switchType(entry.type);

  // Clear first — this resets editingId; we reassign it below after population
  clearComposer();

  // ── Populate fields by entry type ──────────────────────────────────────────

  switch (entry.type) {

    case 'chronicle': {
      const titleEl = document.getElementById('chronicle-title');
      const bodyEl  = document.getElementById('chronicle-body');
      const figEl   = document.getElementById('chronicle-figures');
      const noteEl  = document.getElementById('chronicle-notes');
      const tagsEl  = document.getElementById('chronicle-tags');
      const pinEl   = document.getElementById('chronicle-pinned');
      if (titleEl) titleEl.value = entry.title   || '';
      if (bodyEl)  bodyEl.value  = entry.body    || '';
      if (figEl)   figEl.value   = entry.figures || '';
      if (noteEl)  noteEl.value  = entry.notes   || '';
      if (tagsEl)  tagsEl.value  = (entry.tags   || []).join(', ');
      if (pinEl)   pinEl.checked = !!entry.pinned;
      if (entry.era) activatePill('chronicle-era-grid', 'chronicleEra', entry.era);
      break;
    }

    case 'system': {
      const t = document.getElementById('system-title');
      const r = document.getElementById('system-terms');
      const b = document.getElementById('system-body');
      const p = document.getElementById('system-tips');
      const a = document.getElementById('system-tags');
      if (t) t.value = entry.title || '';
      if (r) r.value = entry.terms || '';
      if (b) b.value = entry.body  || '';
      if (p) p.value = entry.tips  || '';
      if (a) a.value = (entry.tags || []).join(', ');
      if (entry.category) activatePill('system-category-grid', 'systemCategory', entry.category);
      if (entry.audience) activatePill('system-audience-grid', 'systemAudience', entry.audience);
      break;
    }

    case 'item': {
      const t = document.getElementById('item-title');
      const e = document.getElementById('item-examples');
      const p = document.getElementById('item-purpose');
      const n = document.getElementById('item-notes');
      const a = document.getElementById('item-tags');
      if (t) t.value = entry.title    || '';
      if (e) e.value = entry.examples || '';
      if (p) p.value = entry.purpose  || '';
      if (n) n.value = entry.notes    || '';
      if (a) a.value = (entry.tags    || []).join(', ');
      if (entry.itemType) activatePill('item-type-grid',    'itemType',    entry.itemType);
      if (entry.quality)  activatePill('item-quality-grid', 'itemQuality', entry.quality);
      break;
    }

    case 'comparison': {
      const t  = document.getElementById('comparison-title');
      const ba = document.getElementById('comparison-a-body');
      const bb = document.getElementById('comparison-b-body');
      const s  = document.getElementById('comparison-similarities');
      const d  = document.getElementById('comparison-differences');
      const a  = document.getElementById('comparison-tags');
      if (t)  t.value  = entry.title        || '';
      if (ba) ba.value = entry.bodyA        || '';
      if (bb) bb.value = entry.bodyB        || '';
      if (s)  s.value  = entry.similarities || '';
      if (d)  d.value  = entry.differences  || '';
      if (a)  a.value  = (entry.tags        || []).join(', ');
      if (entry.eraA) activatePill('comparison-eraa-grid', 'comparisonEraA', entry.eraA);
      if (entry.eraB) activatePill('comparison-erab-grid', 'comparisonEraB', entry.eraB);
      break;
    }

    case 'icon': {
      const t = document.getElementById('icon-title');
      const s = document.getElementById('icon-symbol');
      const m = document.getElementById('icon-meaning');
      const c = document.getElementById('icon-context');
      const a = document.getElementById('icon-tags');
      if (t) t.value = entry.title   || '';
      if (s) s.value = entry.symbol  || '';
      if (m) m.value = entry.meaning || '';
      if (c) c.value = entry.context || '';
      if (a) a.value = (entry.tags   || []).join(', ');
      if (entry.category) activatePill('icon-category-grid', 'iconCategory', entry.category);
      break;
    }
  }

  // ── Restore attached images ──────────────────────────────────────────────
  if (entry.images && entry.images.length) {
    state.imageDataUrls = [...entry.images];
    renderImagePreview();
  }

  // ── Activate edit mode ───────────────────────────────────────────────────
  state.editingId = id;
  const entryTitle = entry.title || getDefaultTitle(entry);
  btnSave.innerHTML = '&#x270F;&#xFE0F; Update Entry';
  updateEditBanner(true, entryTitle);
  checkSaveEnabled();

  // Scroll composer to top so populated fields are immediately visible
  const composer = document.getElementById('composer');
  if (composer) composer.scrollTop = 0;
}

/* ══════════════════════════════
   SAVE BUTTON GATE
══════════════════════════════ */
function checkSaveEnabled() {
  let ok = false;
  switch (state.activeType) {
    case 'chronicle':  ok = !!(document.getElementById('chronicle-title')?.value.trim()  || document.getElementById('chronicle-body')?.value.trim()); break;
    case 'system':     ok = !!(document.getElementById('system-title')?.value.trim()     || document.getElementById('system-body')?.value.trim());    break;
    case 'item':       ok = !!(document.getElementById('item-title')?.value.trim()       || document.getElementById('item-examples')?.value.trim());  break;
    case 'comparison': ok = !!(document.getElementById('comparison-title')?.value.trim() || document.getElementById('comparison-a-body')?.value.trim() || document.getElementById('comparison-b-body')?.value.trim()); break;
    case 'icon':       ok = !!(document.getElementById('icon-title')?.value.trim()       || document.getElementById('icon-meaning')?.value.trim());    break;
  }
  btnSave.disabled = !ok;
}

/* ══════════════════════════════
   EMOJI INSERT (chronicle body)
══════════════════════════════ */
function insertEmoji(emoji) {
  const ta = document.getElementById('chronicle-body');
  if (!ta) return;
  const s = ta.selectionStart, e = ta.selectionEnd;
  ta.value = ta.value.slice(0,s) + emoji + ta.value.slice(e);
  ta.selectionStart = ta.selectionEnd = s + emoji.length;
  ta.focus();
}

/* ══════════════════════════════
   RECENT PANEL
══════════════════════════════ */
function renderRecentPanel() {
  recentList.innerHTML = '';
  let entries = [...state.entries];
  if (state.recentFilter !== 'all') entries = entries.filter(e => e.type === state.recentFilter);
  if (state.grimoireQuery) {
    const q = state.grimoireQuery.toLowerCase();
    entries = entries.filter(e => getSearchHay(e).includes(q));
  }

  if (!entries.length) {
    const emptyMsg = state.grimoireQuery
      ? 'No entries match your search.'
      : 'Nothing here yet.<br/>Begin your first entry above.';
    recentList.innerHTML = `<div class="recent-empty">${emptyMsg}</div>`;
    recentCount.textContent = state.grimoireQuery ? '0 results' : '0 entries';
    return;
  }

  const sorted = entries
    .sort((a,b) => { if(a.pinned&&!b.pinned) return -1; if(!a.pinned&&b.pinned) return 1; return b.timestamp-a.timestamp; })
    .slice(0, 30);

  recentCount.textContent = `${entries.length} entr${entries.length!==1?'ies':'y'}`;

  sorted.forEach(entry => {
    const card = document.createElement('div');
    card.className    = `recent-card${entry.pinned?' pinned':''}`;
    card.dataset.id   = entry.id;
    card.dataset.type = entry.type;
    const typeEmoji = TYPE_EMOJI[entry.type] || '📝';
    const badge     = getBadge(entry);
    const blurb     = getBlurb(entry);
    const tagsHtml  = (entry.tags||[]).map(t=>`<span class="tag-pill">${escapeHtml(t)}</span>`).join('');
    card.innerHTML = `
      <div class="recent-card-meta">
        <span class="recent-card-type">${typeEmoji}</span>
        <span class="recent-card-date">${entry.date}</span>
        <span class="recent-card-time">${entry.time}</span>
        ${badge?`<span class="recent-card-badge">${escapeHtml(badge)}</span>`:''}
      </div>
      <div class="recent-card-title">${escapeHtml(entry.title||getDefaultTitle(entry))}</div>
      <div class="recent-card-blurb">${escapeHtml(blurb)}</div>
      ${tagsHtml?`<div class="recent-card-tags">${tagsHtml}</div>`:''}
    `;
    card.addEventListener('click', () => openReader(entry.id));
    recentList.appendChild(card);
  });
}

function getBadge(e) {
  if (e.type==='chronicle')  return ERA_LABEL[e.era] || e.era || '';
  if (e.type==='system')     return e.category || '';
  if (e.type==='item')       return e.itemType || '';
  if (e.type==='comparison') return (e.eraA && e.eraB) ? `${ERA_LABEL[e.eraA]||e.eraA} vs ${ERA_LABEL[e.eraB]||e.eraB}` : '';
  if (e.type==='icon')       return e.category || '';
  return '';
}

function getBlurb(e) {
  if (e.type==='chronicle')  return e.body || '';
  if (e.type==='system')     return e.body || e.tips || '';
  if (e.type==='item')       return e.purpose || e.examples || '';
  if (e.type==='comparison') return e.similarities || e.differences || e.bodyA || '';
  if (e.type==='icon')       return e.meaning || '';
  return '';
}

function getDefaultTitle(e) {
  if (e.type==='chronicle')  return `${ERA_LABEL[e.era]||e.era||'Untitled'} Chronicle`;
  if (e.type==='system')     return `${e.category||'Untitled'} System`;
  if (e.type==='item')       return `${e.itemType||'Untitled'} Item`;
  if (e.type==='comparison') return `${ERA_LABEL[e.eraA]||e.eraA||'?'} vs ${ERA_LABEL[e.eraB]||e.eraB||'?'}`;
  if (e.type==='icon')       return `${e.category||'Untitled'} Icon`;
  return 'Untitled';
}

function updateFooter() {
  const n = state.entries.length;
  footerCount.textContent = `${n} entr${n!==1?'ies':'y'}`;
}

/* ══════════════════════════════
   GRIMOIRE SEARCH + AUTOSUGGEST
   Searches: title, body, notes, terms, tips, examples, purpose,
   bodyA/bodyB, similarities, differences, meaning, context, symbol,
   era/category/itemType/quality/eraA/eraB/audience, and tags.
   Dropdown shows up to 8 best matches with highlighted matched text.
   Keyboard navigable.
══════════════════════════════ */
function getSearchHay(e) {
  return [
    e.title, e.body, e.notes, e.figures, e.terms, e.tips,
    e.examples, e.purpose, e.bodyA, e.bodyB, e.similarities, e.differences,
    e.meaning, e.context, e.symbol,
    e.era, e.category, e.itemType, e.quality, e.eraA, e.eraB, e.audience,
    ...(e.tags||[])
  ].filter(Boolean).join(' ').toLowerCase();
}

function highlightMatch(text, query) {
  if (!query || !text) return escapeHtml(text||'');
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escapeHtml(text);
  return escapeHtml(text.slice(0, idx))
    + '<mark>' + escapeHtml(text.slice(idx, idx + query.length)) + '</mark>'
    + escapeHtml(text.slice(idx + query.length));
}

function matchingTags(entry, query) {
  if (!query) return [];
  return (entry.tags||[]).filter(t => t.toLowerCase().includes(query.toLowerCase()));
}

let _suggestIndex = -1;

function openGrimoireSearch(query) {
  state.grimoireQuery = query;
  grimoireSearchClear.style.display = query ? 'block' : 'none';
  grimoireSearch.classList.toggle('has-value', !!query);
  renderRecentPanel();
  renderSuggestions(query);
}

function clearGrimoireSearch() {
  state.grimoireQuery = '';
  grimoireSearch.value = '';
  grimoireSearchClear.style.display = 'none';
  grimoireSearch.classList.remove('has-value');
  grimoireSuggest.style.display = 'none';
  _suggestIndex = -1;
  renderRecentPanel();
}

function renderSuggestions(query) {
  grimoireSuggest.innerHTML = '';
  _suggestIndex = -1;

  if (!query || query.length < 1) { grimoireSuggest.style.display = 'none'; return; }

  const q = query.toLowerCase();
  const matches = state.entries
    .filter(e => getSearchHay(e).includes(q))
    .sort((a, b) => {
      const aTitle = (a.title||getDefaultTitle(a)).toLowerCase().includes(q);
      const bTitle = (b.title||getDefaultTitle(b)).toLowerCase().includes(q);
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return  1;
      return b.timestamp - a.timestamp;
    })
    .slice(0, 8);

  if (!matches.length) {
    grimoireSuggest.innerHTML = '<div class="suggest-empty">Nothing found in the Grimoire.</div>';
    grimoireSuggest.style.display = 'block';
    return;
  }

  matches.forEach(entry => {
    const item    = document.createElement('div');
    item.className = 'suggest-item';
    const title   = entry.title || getDefaultTitle(entry);
    const mTags   = matchingTags(entry, query);
    item.innerHTML = `
      <span class="suggest-icon">${TYPE_EMOJI[entry.type] || '📝'}</span>
      <span class="suggest-text">
        <span class="suggest-title">${highlightMatch(title, query)}</span>
        <span class="suggest-meta">${entry.date} ${entry.time}${getBadge(entry) ? ' · ' + escapeHtml(getBadge(entry)) : ''}</span>
        ${mTags.length ? `<span class="suggest-tags">${mTags.map(t=>`<span class="suggest-tag">${highlightMatch(t,query)}</span>`).join('')}</span>` : ''}
      </span>
    `;
    item.addEventListener('mousedown', e => {
      e.preventDefault();
      closeSuggestions();
      openReader(entry.id);
    });
    grimoireSuggest.appendChild(item);
  });

  grimoireSuggest.style.display = 'block';
}

function closeSuggestions() {
  grimoireSuggest.style.display = 'none';
  _suggestIndex = -1;
}

function moveSuggestCursor(dir) {
  const items = grimoireSuggest.querySelectorAll('.suggest-item');
  if (!items.length) return;
  items[_suggestIndex]?.classList.remove('active');
  _suggestIndex = (_suggestIndex + dir + items.length) % items.length;
  const active = items[_suggestIndex];
  active.classList.add('active');
  active.scrollIntoView({ block: 'nearest' });
}

function selectSuggestCursor() {
  const active = grimoireSuggest.querySelector('.suggest-item.active');
  if (active) active.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
}

/* ══════════════════════════════
   READER
   Category filter chains with type filter.
   Images rendered as a gallery strip above the entry body.
══════════════════════════════ */
function openReader(scrollToId = null) {
  state.readerScrollTo = scrollToId;
  overlayReader.style.display = 'flex';
  renderReader();
}

function readerCategoryOf(e) {
  if (e.type==='comparison') return (e.eraA && e.eraB) ? `${ERA_LABEL[e.eraA]||e.eraA} vs ${ERA_LABEL[e.eraB]||e.eraB}` : '';
  return e.era || e.category || e.itemType || '';
}

function renderReader() {
  const search     = readerSearch.value.toLowerCase().trim();
  const typeFilter = readerFilterType.value;
  const catFilter  = readerFilterCat.value;

  let entries = [...state.entries];
  if (typeFilter) entries = entries.filter(e => e.type === typeFilter);
  if (catFilter)  entries = entries.filter(e => readerCategoryOf(e) === catFilter);
  if (search) entries = entries.filter(e => getSearchHay(e).includes(search));

  entries.sort((a,b) => state.readerSort==='desc' ? b.timestamp-a.timestamp : a.timestamp-b.timestamp);

  readerSubtitle.textContent = (search||typeFilter||catFilter)
    ? `${entries.length} result${entries.length!==1?'s':''}`
    : `${state.entries.length} entr${state.entries.length!==1?'ies':'y'}`;

  readerBody.innerHTML = '';
  if (!entries.length) { readerBody.innerHTML = '<div class="reader-empty">Nothing found in the Grimoire.</div>'; return; }

  const groupMap = new Map();
  entries.forEach(e => { if(!groupMap.has(e.date)) groupMap.set(e.date,[]); groupMap.get(e.date).push(e); });

  [...groupMap.keys()]
    .sort((a,b) => state.readerSort==='desc' ? b.localeCompare(a) : a.localeCompare(b))
    .forEach(date => {
      const d   = new Date(date+'T00:00:00');
      const grp = document.createElement('div');
      grp.className = 'reader-date-group';
      grp.innerHTML = `<span class="reader-date-group-label">${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}</span><div class="reader-date-group-line"></div>`;
      readerBody.appendChild(grp);
      groupMap.get(date).forEach(entry => readerBody.appendChild(buildReaderEntry(entry)));
    });

  if (state.readerScrollTo) {
    const target = readerBody.querySelector(`[data-entry-id="${state.readerScrollTo}"]`);
    if (target) setTimeout(() => target.scrollIntoView({behavior:'smooth',block:'start'}), 80);
  }
}

/* ══════════════════════════════
   BUILD READER ENTRY
   Each entry card in the reader modal.
   Actions row contains Edit and Delete buttons.
   Edit triggers editEntry(); Delete triggers the confirm modal.
══════════════════════════════ */
function buildReaderEntry(entry) {
  const el = document.createElement('div');
  el.className       = `reader-entry${entry.pinned?' pinned':''}`;
  el.dataset.entryId = entry.id;
  el.dataset.type    = entry.type;

  const typeLabel = {chronicle:'📖 Chronicle', system:'⚔️ System', item:'🎒 Item', comparison:'📊 Comparison', icon:'🔣 Icon'}[entry.type]||entry.type;
  const badge     = getBadge(entry);
  const tagsHtml  = (entry.tags||[]).map(t=>`<span class="tag-pill">${escapeHtml(t)}</span>`).join('');
  const title     = entry.title||getDefaultTitle(entry);

  const imagesHtml = (entry.images && entry.images.length)
    ? `<div class="reader-entry-images">${entry.images.map((src,i) =>
        `<img class="reader-entry-img" src="${escapeHtml(src)}" alt="Attached image ${i+1}" loading="lazy"/>`
      ).join('')}</div>`
    : '';

  let bodyHtml = '';
  switch (entry.type) {
    case 'chronicle': {
      bodyHtml = `
        ${entry.body ? `<div class="reader-entry-body" data-hl-entry="${entry.id}" data-hl-field="body">${renderMarkedField(entry.id,'body',entry.body)}</div>` : ''}
        <div class="reader-fields">
          ${entry.figures ? `<div class="reader-field-block"><div class="reader-field-label">Key Figures & Factions</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="figures">${renderMarkedField(entry.id,'figures',entry.figures)}</div></div>` : ''}
          ${entry.notes   ? `<div class="reader-field-block"><div class="reader-field-label">Notes & Trivia</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="notes">${renderMarkedField(entry.id,'notes',entry.notes)}</div></div>` : ''}
        </div>
      `;
      break;
    }
    case 'system': {
      bodyHtml = `<div class="reader-fields">
        ${entry.terms ? `<div class="reader-field-block"><div class="reader-field-label">Key Terms & Prerequisites</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="terms">${renderMarkedField(entry.id,'terms',entry.terms)}</div></div>` : ''}
        ${entry.body  ? `<div class="reader-field-block"><div class="reader-field-label">How It Works</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="body">${renderMarkedField(entry.id,'body',entry.body)}</div></div>` : ''}
        ${entry.tips  ? `<div class="reader-field-block"><div class="reader-field-label">Tips & Reminders</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="tips">${renderMarkedField(entry.id,'tips',entry.tips)}</div></div>` : ''}
      </div>`;
      break;
    }
    case 'item': {
      bodyHtml = `<div class="reader-fields">
        ${entry.examples ? `<div class="reader-field-block"><div class="reader-field-label">Representative Examples</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="examples">${renderMarkedField(entry.id,'examples',entry.examples)}</div></div>` : ''}
        ${entry.purpose  ? `<div class="reader-field-block"><div class="reader-field-label">What It's For & Why It Exists</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="purpose">${renderMarkedField(entry.id,'purpose',entry.purpose)}</div></div>` : ''}
        ${entry.notes    ? `<div class="reader-field-block"><div class="reader-field-label">Notes</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="notes">${renderMarkedField(entry.id,'notes',entry.notes)}</div></div>` : ''}
      </div>`;
      break;
    }
    case 'comparison': {
      bodyHtml = `
        <div class="reader-compare-grid">
          ${entry.bodyA ? `<div class="reader-field-block"><div class="reader-field-label">${escapeHtml(ERA_LABEL[entry.eraA]||entry.eraA||'Era A')}</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="bodyA">${renderMarkedField(entry.id,'bodyA',entry.bodyA)}</div></div>` : '<div></div>'}
          ${entry.bodyB ? `<div class="reader-field-block"><div class="reader-field-label">${escapeHtml(ERA_LABEL[entry.eraB]||entry.eraB||'Era B')}</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="bodyB">${renderMarkedField(entry.id,'bodyB',entry.bodyB)}</div></div>` : '<div></div>'}
        </div>
        <div class="reader-fields" style="margin-top:12px">
          ${entry.similarities ? `<div class="reader-field-block"><div class="reader-field-label">Similarities</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="similarities">${renderMarkedField(entry.id,'similarities',entry.similarities)}</div></div>` : ''}
          ${entry.differences  ? `<div class="reader-field-block"><div class="reader-field-label">Differences</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="differences">${renderMarkedField(entry.id,'differences',entry.differences)}</div></div>` : ''}
        </div>
      `;
      break;
    }
    case 'icon': {
      bodyHtml = `
        ${entry.symbol ? `<div class="reader-icon-symbol">${escapeHtml(entry.symbol)}</div>` : ''}
        <div class="reader-fields">
          ${entry.meaning ? `<div class="reader-field-block"><div class="reader-field-label">Meaning</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="meaning">${renderMarkedField(entry.id,'meaning',entry.meaning)}</div></div>` : ''}
          ${entry.context ? `<div class="reader-field-block"><div class="reader-field-label">Where You'll See It</div><div class="reader-field-value" data-hl-entry="${entry.id}" data-hl-field="context">${renderMarkedField(entry.id,'context',entry.context)}</div></div>` : ''}
        </div>
      `;
      break;
    }
  }

  el.innerHTML = `
    <div class="reader-entry-meta">
      <span class="reader-entry-type-badge">${typeLabel}</span>
      <span class="reader-entry-time">${entry.time}</span>
      ${badge?`<span class="reader-entry-badge">${escapeHtml(badge)}</span>`:''}
      <div class="reader-entry-tags">${tagsHtml}</div>
      <div class="reader-entry-actions">
        <button class="entry-action-btn entry-action-btn--edit"   data-action="edit"   data-id="${entry.id}">&#x270F;&#xFE0F; Edit</button>
        <button class="entry-action-btn entry-action-btn--delete" data-action="delete" data-id="${entry.id}">&#x1F5D1; Delete</button>
      </div>
    </div>
    <div class="reader-entry-title">${escapeHtml(title)}</div>
    ${imagesHtml}
    ${bodyHtml}
  `;

  // ── Edit button ──
  el.querySelector('[data-action="edit"]').addEventListener('click', ev => {
    ev.stopPropagation();
    editEntry(entry.id);
  });

  // ── Delete button ──
  el.querySelector('[data-action="delete"]').addEventListener('click', ev => {
    ev.stopPropagation();
    state.pendingDelete = entry.id;
    overlayDelete.style.display = 'flex';
  });

  return el;
}

/* ══════════════════════════════
   CATEGORY FILTER
   Scoped to the current type selection.
   Called whenever type filter changes.
══════════════════════════════ */
function populateCategoryFilter() {
  const typeFilter = readerFilterType.value;
  const cats = [...new Set(
    state.entries
      .filter(e => !typeFilter || e.type === typeFilter)
      .map(readerCategoryOf)
      .filter(Boolean)
  )].sort();
  readerFilterCat.innerHTML = '<option value="">All categories</option>';
  cats.forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; readerFilterCat.appendChild(o); });
}

/* ══════════════════════════════
   DELETE
   If the entry being deleted is currently in edit mode,
   the edit session is cancelled before deletion.
══════════════════════════════ */
function deleteEntry(id) {
  if (state.editingId === id) {
    state.editingId = null;
    btnSave.innerHTML = '&#x1F4BE; Save to Grimoire';
    updateEditBanner(false);
    clearComposer();
  }
  state.entries = state.entries.filter(e=>e.id!==id);
  lsSave(state.entries);
  renderRecentPanel(); updateFooter(); updateStorageStatus(); populateCategoryFilter();
  if (overlayReader.style.display!=='none') renderReader();
}

/* ══════════════════════════════
   UTILITIES
══════════════════════════════ */
function escapeHtml(text) {
  const d=document.createElement('div'); d.textContent=String(text||''); return d.innerHTML;
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ══════════════════════════════
   TEXT OFFSET HELPER
   Converts a DOM Range boundary (node + offset) into a plain-text
   character offset relative to a container element. Used to convert
   a browser text selection into {start, end} for a highlight.
══════════════════════════════ */
function getTextOffset(root, node, offset) {
  let charCount = 0;
  let found = false;
  function walk(n) {
    if (found) return;
    if (n === node) { charCount += offset; found = true; return; }
    if (n.nodeType === Node.TEXT_NODE) { charCount += n.textContent.length; return; }
    for (const child of n.childNodes) { walk(child); if (found) return; }
  }
  walk(root);
  return charCount;
}

/* ══════════════════════════════
   MARKED FIELD RENDERING
   Merges highlight spans and dictionary term-links into one pass over
   plain text, producing safe escaped HTML. Highlights always take
   priority — any dictionary term overlapping a highlight is skipped.
   Overlapping dictionary terms with each other are also skipped
   (first match by position wins).
══════════════════════════════ */
function renderMarkedField(entryId, field, text) {
  if (!text) return '';

  const hlSpans = state.highlights
    .filter(h => h.entryId === entryId && h.field === field)
    .map(h => ({ start: h.start, end: h.end, kind: 'hl', color: h.color, id: h.id }))
    .sort((a, b) => a.start - b.start);

  let termSpans = [];
  if (state.dictOn) {
    DICTIONARY.forEach(d => {
      const re = new RegExp('\\b' + escapeRegex(d.term) + '\\b', 'gi');
      let m;
      while ((m = re.exec(text))) {
        termSpans.push({ start: m.index, end: m.index + m[0].length, kind: 'term', term: d.term });
      }
    });
  }
  // Drop any term span overlapping a highlight span
  termSpans = termSpans.filter(t => !hlSpans.some(h => t.start < h.end && t.end > h.start));
  // Drop overlapping term spans against each other, keep earliest
  termSpans.sort((a, b) => a.start - b.start);
  const dedupedTerms = [];
  let lastEnd = -1;
  termSpans.forEach(t => { if (t.start >= lastEnd) { dedupedTerms.push(t); lastEnd = t.end; } });

  const spans = [...hlSpans, ...dedupedTerms].sort((a, b) => a.start - b.start);

  let out = '', pos = 0;
  spans.forEach(s => {
    if (s.start < pos) return; // guard against any residual overlap
    out += escapeHtml(text.slice(pos, s.start));
    const chunk = escapeHtml(text.slice(s.start, s.end));
    if (s.kind === 'hl') {
      out += `<mark class="hl-mark hl-${s.color}" data-hl-id="${s.id}">${chunk}</mark>`;
    } else {
      out += `<span class="dict-term" data-term="${escapeHtml(s.term)}">${chunk}</span>`;
    }
    pos = s.end;
  });
  out += escapeHtml(text.slice(pos));
  return out;
}

/* ══════════════════════════════
   HIGHLIGHT COLOR POPUP
   Floating swatch palette shown near a text selection inside the
   Reader. Injected once into <body> and repositioned/reused after.
══════════════════════════════ */
function showHlColorPopup(rect, entryId, field, start, end) {
  let popup = document.getElementById('hl-color-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'hl-color-popup';
    popup.className = 'hl-color-popup';
    document.body.appendChild(popup);
  }
  popup.innerHTML = HL_COLORS.map(c => `<button class="hl-color-swatch ${c.key}" data-color="${c.key}" title="${c.key}"></button>`).join('')
    + `<button class="hl-color-popup-clear" title="Clear highlight here">&#x2715;</button>`;

  const popW = 8 * HL_COLORS.length + 40;
  let left = rect.left + rect.width / 2 - popW / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - popW - 8));
  popup.style.left = `${left}px`;
  popup.style.top  = `${Math.max(8, rect.top - 42)}px`;
  popup.style.display = 'flex';

  popup.querySelectorAll('.hl-color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      applyHighlight(entryId, field, start, end, btn.dataset.color);
      hideHlColorPopup();
      window.getSelection()?.removeAllRanges();
    });
  });
  popup.querySelector('.hl-color-popup-clear').addEventListener('click', () => {
    clearHighlightsInRange(entryId, field, start, end);
    hideHlColorPopup();
    window.getSelection()?.removeAllRanges();
  });
}

function hideHlColorPopup() {
  const popup = document.getElementById('hl-color-popup');
  if (popup) popup.style.display = 'none';
}

function applyHighlight(entryId, field, start, end, color) {
  state.highlights = state.highlights.filter(h => !(h.entryId === entryId && h.field === field && start < h.end && end > h.start));
  state.highlights.push({ id: String(Date.now()), entryId, field, start, end, color, timestamp: Date.now() });
  hlSave(state.highlights);
  renderReader();
}

function clearHighlightsInRange(entryId, field, start, end) {
  state.highlights = state.highlights.filter(h => !(h.entryId === entryId && h.field === field && start < h.end && end > h.start));
  hlSave(state.highlights);
  renderReader();
}

function removeHighlight(id) {
  state.highlights = state.highlights.filter(h => h.id !== id);
  hlSave(state.highlights);
  renderReader();
  if (overlayHighlights.style.display !== 'none') renderHighlightsList();
}

/* ══════════════════════════════
   DICTIONARY POPOVER
══════════════════════════════ */
function showDictPopover(term, rect) {
  const def = DICTIONARY.find(d => d.term.toLowerCase() === term.toLowerCase());
  if (!def) return;
  let pop = document.getElementById('dict-popover');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'dict-popover';
    pop.className = 'dict-popover';
    document.body.appendChild(pop);
  }
  pop.innerHTML = `<div class="dict-popover-term">${escapeHtml(def.term)}</div><div class="dict-popover-def">${escapeHtml(def.definition)}</div>`;
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 300));
  pop.style.left = `${left}px`;
  pop.style.top  = `${rect.bottom + 6}px`;
  pop.style.display = 'block';
}

function hideDictPopover() {
  const pop = document.getElementById('dict-popover');
  if (pop) pop.style.display = 'none';
}

/* ══════════════════════════════
   MY HIGHLIGHTS PANEL
══════════════════════════════ */
function renderHighlightsList() {
  highlightsList.innerHTML = '';
  const sorted = [...state.highlights].sort((a, b) => b.timestamp - a.timestamp);

  if (!sorted.length) {
    highlightsList.innerHTML = '<div class="hl-empty">No highlights yet.<br/>Select any text in the Reader and choose a color to save one.</div>';
    return;
  }

  const colorHex = { yellow: '#e8d44d', green: '#7bc86c', blue: '#6cb4e8', red: '#e86c6c', purple: '#b46ce8' };

  sorted.forEach(h => {
    const entry = state.entries.find(e => e.id === h.entryId);
    if (!entry) return; // orphaned highlight (source entry was deleted) — skip silently
    const text    = entry[h.field] || '';
    const snippet = text.slice(h.start, h.end);
    const before  = text.slice(Math.max(0, h.start - 30), h.start);
    const after   = text.slice(h.end, h.end + 30);

    const card = document.createElement('div');
    card.className = 'hl-card';
    card.style.borderLeftColor = colorHex[h.color] || 'var(--border-mid)';
    card.innerHTML = `
      <div class="hl-card-meta">
        <span class="hl-card-title">${escapeHtml(entry.title || getDefaultTitle(entry))}</span>
        <span class="hl-card-date">${entry.date}</span>
      </div>
      <div class="hl-card-snippet">${escapeHtml(before)}<mark class="hl-mark hl-${h.color}">${escapeHtml(snippet)}</mark>${escapeHtml(after)}</div>
      <div class="hl-card-actions">
        <button class="entry-action-btn entry-action-btn--edit" data-action="jump">&#x1F517; Jump to Entry</button>
        <button class="entry-action-btn entry-action-btn--delete" data-action="remove">&#x1F5D1; Remove</button>
      </div>
    `;
    card.querySelector('[data-action="jump"]').addEventListener('click', () => {
      overlayHighlights.style.display = 'none';
      jumpToHighlight(h);
    });
    card.querySelector('[data-action="remove"]').addEventListener('click', () => removeHighlight(h.id));
    highlightsList.appendChild(card);
  });
}

function jumpToHighlight(h) {
  openReader(h.entryId);
  setTimeout(() => {
    const container = readerBody.querySelector(`[data-hl-entry="${h.entryId}"][data-hl-field="${h.field}"]`);
    const mark   = container ? container.querySelector(`[data-hl-id="${h.id}"]`) : null;
    const target = mark || container;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (mark) { mark.classList.add('hl-flash'); setTimeout(() => mark.classList.remove('hl-flash'), 1500); }
    }
  }, 200);
}

/* ══════════════════════════════
   DICTIONARY MODAL LIST
══════════════════════════════ */
function renderDictionaryList(query) {
  const q = (query || '').toLowerCase();
  const filtered = DICTIONARY
    .filter(d => !q || d.term.toLowerCase().includes(q) || d.definition.toLowerCase().includes(q))
    .sort((a, b) => a.term.localeCompare(b.term));

  dictList.innerHTML = '';
  if (!filtered.length) { dictList.innerHTML = '<div class="dict-empty">No matching terms.</div>'; return; }

  filtered.forEach(d => {
    const item = document.createElement('div');
    item.className = 'dict-item';
    item.innerHTML = `<div class="dict-term-name">${escapeHtml(d.term)}</div><div class="dict-term-def">${escapeHtml(d.definition)}</div>`;
    dictList.appendChild(item);
  });
}

/* ══════════════════════════════
   CHARACTERS
   Major/main character reference. Data lives in
   assets/data/characters.js as a plain global array (WOW_CHARACTERS),
   loaded via a <script> tag before this file — not fetch()+JSON —
   specifically so it works when the app is opened directly via
   file://, where browsers block local fetch() of other local files.
══════════════════════════════ */
function loadCharacters() {
  if (typeof WOW_CHARACTERS !== 'undefined' && Array.isArray(WOW_CHARACTERS) && WOW_CHARACTERS.length) {
    state.characters = WOW_CHARACTERS;
    state.charactersError = false;
  } else {
    state.characters = [];
    state.charactersError = true;
  }
}

function factionBucket(faction) {
  const f = (faction || '').toLowerCase();
  if (f.includes('alliance')) return 'alliance';
  if (f.includes('horde'))    return 'horde';
  return 'neutral';
}

function renderCharactersList(query) {
  const q = (query || '').toLowerCase();
  charList.innerHTML = '';

  if (state.charactersError) {
    charList.innerHTML = `<div class="char-error">Couldn't load character data.<br/>Check that assets/data/characters.js exists and is loaded via a &lt;script&gt; tag before assets/js/main.js in wow-grimoire.html.</div>`;
    return;
  }

  let filtered = state.characters.filter(c => {
    if (state.charFilter !== 'all' && factionBucket(c.faction) !== state.charFilter) return false;
    if (!q) return true;
    const hay = [c.name, c.title, c.faction, c.role, c.summary, ...(c.eras||[]).map(e=>ERA_LABEL[e]||e)].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  });

  if (!filtered.length) {
    charList.innerHTML = '<div class="char-empty">No characters match your search.</div>';
    return;
  }

  filtered.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
    const bucket = factionBucket(c.faction);
    const erasStr = (c.eras||[]).map(e => ERA_LABEL[e]||e).join(', ');
    const card = document.createElement('div');
    card.className = 'char-card';
    card.innerHTML = `
      <div class="char-card-head">
        <span class="char-name">${escapeHtml(c.name)}</span>
        ${c.title ? `<span class="char-title">${escapeHtml(c.title)}</span>` : ''}
      </div>
      <div class="char-meta-row">
        <span class="char-badge faction-${bucket}">${escapeHtml(c.faction||'Unknown')}</span>
        ${c.role ? `<span class="char-badge">${escapeHtml(c.role)}</span>` : ''}
        ${erasStr ? `<span class="char-badge">${escapeHtml(erasStr)}</span>` : ''}
      </div>
      <div class="char-summary">${escapeHtml(c.summary||'')}</div>
    `;
    charList.appendChild(card);
  });
}

/* ══════════════════════════════
   SEED CONTENT
   Runs once, only when the Grimoire has never held any entries
   (a genuine first-ever load — checked via a separate localStorage
   flag so a user who deletes down to zero entries never gets
   re-seeded). Content is written in plain educational language,
   not reproduced from any copyrighted in-game or official text.
   Timestamps are staggered so Forever-focused entries surface
   first in the Recent panel and default (newest-first) Reader sort.
══════════════════════════════ */
const SEED_FLAG_KEY = 'wow_grimoire_seeded';

function seedEntry(index, type, date, fields) {
  const timestamp = Date.parse(date + 'T00:00:00') + index * 60000;
  return {
    id: String(timestamp), date, time: '12:00', timestamp, type,
    tags: [], images: [],
    ...fields
  };
}

function buildSeedEntries() {
  let i = 0;
  const entries = [];

  /* ── CHRONICLE: one entry per era, oldest first ─────────────────────── */
  const chronicles = [
    ['vanilla', '2004-11-23', 'Vanilla: The Founding of Azeroth\'s MMO',
      'World of Warcraft launched in November 2004, built on the lore of Blizzard\'s Warcraft real-time strategy trilogy. The level cap was 60, leveling was slow and deliberate, and endgame revolved around 40-player raids like Molten Core and Blackwing Lair. Tight-knit servers, scarce resources, and long travel times defined the experience.',
      'Alliance vs Horde faction war; early raid bosses like Ragnaros and Onyxia; Thrall and Jaina as major faction leaders.',
      'Vanilla is still played today via Classic progression realms, and is the direct inspiration for the new Forever track.'],
    ['tbc', '2007-01-16', 'The Burning Crusade: Through the Dark Portal',
      'WoW\'s first expansion (January 2007) raised the level cap to 70 and opened Outland, the shattered remains of the orc homeworld Draenor. It introduced flying mounts, the Arena PvP ladder, and two new races.',
      'Blood Elves joined the Horde, Draenei joined the Alliance; Illidan Stormrage as the endgame villain in Black Temple.',
      'Introduced Jewelcrafting as a profession and the Dungeon Finder groundwork.'],
    ['wotlk', '2008-11-13', 'Wrath of the Lich King: The Frozen North',
      'The second expansion (November 2008) raised the cap to 80 and sent players to Northrend to confront the Lich King. It\'s widely regarded as a high point for the game\'s pacing and story delivery.',
      'Arthas Menethil as the Lich King; introduced the Death Knight hero class starting at a higher level than normal classes.',
      'Added the Achievements system and cross-realm Dungeon Finder, both of which reshaped how players grouped up.'],
    ['cata', '2010-12-07', 'Cataclysm: The World Reshaped',
      'Cataclysm (December 2010) raised the cap to 85 and had the dragon aspect Deathwing tear open the world, physically reshaping almost every original zone rather than adding a new continent.',
      'Deathwing as the central antagonist; Worgen joined the Alliance and Goblins joined the Horde as new playable races.',
      'Flying was enabled in the original Eastern Kingdoms and Kalimdor zones for the first time.'],
    ['mop', '2012-09-25', 'Mists of Pandaria: A Hidden Continent',
      'Mists of Pandaria (September 2012) raised the cap to 90 and introduced the Pandaren continent, a tonal shift toward a more introspective story about the cost of the Horde/Alliance conflict.',
      'Pandaren became a playable race for both factions; introduced the Monk class.',
      'Added Pet Battles as a side minigame and the "scenario" format for small, story-driven group content.'],
    ['wod', '2014-11-13', 'Warlords of Draenor: An Alternate Timeline',
      'Warlords of Draenor (November 2014) raised the cap to 100 and sent players to a past, unshattered version of Draenor via time travel, focused on orc clan warlords like Grommash Hellscream.',
      'Introduced Garrisons, a personal base-building system that let players recruit followers and run missions.',
      'Received a mixed reception for a comparatively thin content drought in its second year.'],
    ['legion', '2016-08-30', 'Legion: The Burning Legion Invades',
      'Legion (August 2016) raised the cap to 110 and centered on repelling a full invasion of the Burning Legion across the Broken Isles.',
      'Introduced the Demon Hunter class and per-class "Artifact" weapons with their own progression trees; added Class Order Halls as class-specific hubs.',
      'Introduced Mythic+ dungeons, a scaling difficulty system that became a long-term endgame pillar.'],
    ['bfa', '2018-08-14', 'Battle for Azeroth: Faction War Reignited',
      'Battle for Azeroth (August 2018) raised the cap to 120 and pushed the Horde/Alliance conflict back to the forefront, with new continents Kul Tiras (Alliance) and Zandalar (Horde).',
      'Sylvanas Windrunner\'s escalating actions as Horde Warchief drove much of the story.',
      'Introduced Island Expeditions, Warfronts, and the much-debated Azerite gear progression system.'],
    ['shadowlands', '2020-11-23', 'Shadowlands: The Realm of the Dead',
      'Shadowlands (November 2020) took players into WoW\'s afterlife for the first time and included a level squish, dropping the cap from 120 down to 60 to make future scaling easier.',
      'Four Covenants (Kyrian, Necrolord, Night Fae, Venthyr) as endgame factions; Torghast as a roguelike-style solo tower.',
      'Well-regarded for its zone and cinematic design, more divisive for how tightly early Covenant choices locked players in.'],
    ['dragonflight', '2022-11-28', 'Dragonflight: A Return to Form',
      'Dragonflight (November 2022) raised the cap to 70 and returned to the Dragon Isles with a lighter, more optimistic tone after Shadowlands, alongside a full profession and talent-tree rework.',
      'Introduced the Dracthyr Evoker class and Dragonriding, a new momentum-based flying mount system.',
      'Widely seen as a quality-of-life reset that most of the game\'s modern systems still build on.'],
    ['warwithin', '2024-08-26', 'The War Within: The Worldsoul Saga Begins',
      'The War Within (August 2024) raised the cap to 80 and opened the first chapter of the three-part Worldsoul Saga, sending players underground into Khaz Algar.',
      'Introduced the Earthen playable race and Delves, a solo/small-group scaling content type; Warbands made most progress account-wide across all characters.',
      'Set up Xal\'atath, a sentient Void-corrupted blade, as the saga\'s recurring antagonist.'],
    ['midnight', '2026-03-03', 'Midnight: Quel\'Thalas Under Siege',
      'Midnight (launched March 2026) is the second Worldsoul Saga chapter, raising the cap to 90 and returning to a reworked Quel\'Thalas as Xal\'atath moves to corrupt the Sunwell.',
      'Introduced the Haranir allied race and a new Devourer specialization for Demon Hunters; added a persistent player Housing system.',
      'The Last Titan, the saga\'s third and concluding chapter, had not yet released as of this writing.'],
    ['classic', '2019-08-27', 'Classic: Preserving the Original',
      'WoW Classic launched in August 2019 as a faithful re-release of the Vanilla-era game, later progressing its own realms forward through Burning Crusade, Wrath, Cataclysm, and Mists of Pandaria Classic.',
      'Runs as a separate, parallel product line to Retail — its own servers, its own pace, no crossover.',
      'Proved there was a large, ongoing audience for the original game\'s slower, more social structure — directly paving the way for Forever.'],
    ['forever', '2026-11-04', 'Forever: A Permanent Classic+ World',
      'World of Warcraft: Forever is a new, permanent pillar of WoW alongside Retail and Classic — a level-60 "time bubble" set in the original Azeroth just after the events of Warcraft III: Reforged and before Molten Core, with beta testing underway ahead of a planned November 4, 2026 launch.',
      'Adds new zones (including Mount Hyjal, Riverglades, Shen\'dralas, and Zephras Isle), a new Skyborne elf race, and roughly a thousand new quests alongside new dungeons and raids.',
      'The defining idea: the level cap of 60 never rises. New raids, dungeons, and story are added horizontally forever instead of resetting player power with each new expansion — see the Comparison entries for how this differs from the traditional expansion model.'],
    ['vanilla', '2002-07-03', 'Warcraft III & The Third War',
      'Before World of Warcraft existed as an MMO, the Warcraft III real-time strategy games (2002, plus The Frozen Throne expansion) told the story of the Third War — the Burning Legion\'s invasion, the fall of Lordaeron to the undead Scourge, and the founding of the modern orc Horde under Thrall. Nearly every major MMO storyline builds directly on characters and events introduced here.',
      'Arthas Menethil\'s fall to the Lich King, Thrall leading the orcs to Kalimdor, Jaina Proudmoore founding Theramore, and the night elves\' first contact with the wider world.',
      'Warcraft III was remastered as Warcraft III: Reforged in 2020, and World of Warcraft: Forever\'s timeline picks up in the period immediately following its story, before Molten Core.'],
    ['warwithin', '2024-08-26', 'The Worldsoul Saga: A Three-Part Story',
      'The Worldsoul Saga is the umbrella storyline connecting three consecutive expansions — The War Within, Midnight, and the upcoming The Last Titan — built around the discovery that Azeroth itself is a living, imprisoned Titan-in-progress (a "Worldsoul"), and the escalating threat of Xal\'atath, a sentient Void-corrupted blade.',
      'Xal\'atath as the connecting antagonist across all three chapters; the Titans and the Void as the two opposing cosmic forces driving the story.',
      'This is the first time the modern game has explicitly planned a story arc across three expansions from the outset, rather than revealing connections after the fact.']
  ];
  chronicles.forEach(([era, date, title, body, figures, notes]) => {
    entries.push(seedEntry(i++, 'chronicle', date, {
      title, era, body, figures, notes,
      pinned: (era === 'forever' || era === 'vanilla'),
      tags: [ERA_LABEL[era]]
    }));
  });

  /* ── SYSTEM: how to actually play ───────────────────────────────────── */
  const systems = [
    ['Character Creation', 'gettingstarted', 'newplayer',
      'Race, class, and faction are all chosen together at creation, and generally can\'t be changed afterward without a separate paid service (or, on some servers, not at all).',
      'Your faction (Alliance or Horde) determines which other players you can group with by default and which starting zones and cities you\'ll see first. Race is mostly cosmetic and social at this point — old racial stat differences have been minimized over the years — while class determines your actual toolkit and playstyle far more than race does.',
      'Don\'t agonize over race or faction for a first character — pick whichever looks and sounds most appealing to you. The choice that actually shapes how a class *feels* to play is its specialization, which you pick separately in-game and can freely change later.'],
    ['Reading the Screen', 'gettingstarted', 'newplayer',
      'The default interface has a handful of core pieces: your action bar (abilities), unit frames (health/resource bars), bags, minimap, and chat box.',
      'Your action bar sits along the bottom-center of the screen and holds the abilities you can use — matching number keys 1-0 by default. Your own health and resource bar (mana, rage, energy, or similar depending on class) sit near the top-left; a target\'s health bar appears above your action bar once you click on something. Bags are bottom-right, the minimap top-right, and the chat window bottom-left.',
      'It\'s completely fine to leave everything at its default layout for your first many hours — addons and custom UI setups (see the Addons & UI entry) are a later refinement, not a requirement to start playing effectively.'],
    ['Leveling', 'leveling', 'newplayer',
      'Every character starts at level 1 with an empty ability bar.',
      'You gain experience (XP) from killing enemies, completing quests, and finishing dungeons. Each level unlocks new abilities and raises your stats. The level cap has changed with almost every expansion — it has been squished twice (most recently down to 60 in Shadowlands) to keep the curve manageable for new players.',
      'Quests are the fastest and most reliable XP source for a new character — follow the quest-giver exclamation marks on your map rather than grinding kills. Forever keeps the cap fixed at 60 permanently, so there is no "starting over" pressure the way there is when Retail raises its cap.'],
    ['Classes & Roles', 'classesroles', 'newplayer',
      'Every class can fill at least one of three roles in group content.',
      'Tank: stands at the front, holds enemy attention ("aggro"), and mitigates incoming damage. Healer: keeps the group alive by restoring health over time. DPS (damage dealer): focuses on dealing damage, either melee or ranged. Most classes offer multiple specializations, and each specialization usually leans toward one specific role.',
      'If you\'re unsure what to play, DPS specs are the most forgiving to learn on since a mistake usually just means a slower fight rather than a wipe. Tanks and healers are in much higher demand for group finder queues.'],
    ['Professions', 'professions', 'newplayer',
      'Professions are optional but valuable long-term systems for making gold and gear.',
      'Gathering professions (Mining, Herbalism, Skinning) collect raw materials out in the world. Crafting professions (Blacksmithing, Alchemy, Enchanting, Tailoring, Leatherworking, Jewelcrafting, Engineering, Inscription) turn those materials into usable gear, potions, and enchantments. Most characters can learn two professions at a time, plus a few universal secondary skills like Cooking and Fishing.',
      'Pairing a gathering profession with a matching crafting profession (e.g. Mining + Blacksmithing) is the most self-sufficient combination for a new character.'],
    ['Gear & Itemization', 'gear', 'intermediate',
      'Gear is the core long-term power progression system outside of leveling.',
      'Every piece of equipment has an item level (often shortened to "ilvl") that summarizes its overall power, plus a quality tier shown by its border color (see the Icon glossary for the full color meanings). Higher-end gear can also carry gem sockets and can be enhanced with enchantments from the Enchanting profession. Full sets of gear from the same source sometimes grant extra "set bonuses" for wearing several pieces together.',
      'When comparing two items, check the item level first as a rough power gauge, then read the actual stats — a lower-ilvl item with better stats for your spec can still outperform a higher-ilvl item with the wrong stats.'],
    ['Dungeons & Raids', 'dungeonsraids', 'intermediate',
      'Group content is where most late-game progression and best gear comes from.',
      'Dungeons are small instanced areas for (usually) 5 players and can typically be run at multiple difficulty tiers. Raids are larger instances built for coordinated groups (historically ranging from 10 up to 40 players depending on the era) and are the primary source of the best available gear. Difficulty tiers generally scale from an easy Normal mode up through Heroic and Mythic.',
      'Use the in-game group finder tools for your first runs of a dungeon — most groups expect new players and will explain fight mechanics if you ask before pulling.'],
    ['PvP', 'pvp', 'intermediate',
      'Player-vs-player combat runs on its own gear and matchmaking systems, separate from PvE.',
      'Battlegrounds are objective-based matches (capture the flag, control points, escort a cart, etc.) for two competing teams. Arenas are smaller, highly competitive matches (commonly 2v2 or 3v3) on a rated ladder. World PvP happens organically out in the open world on PvP-enabled servers or zones. PvP has its own currencies (historically Honor and Conquest) used to buy PvP-specific gear.',
      'Battlegrounds are the easiest entry point — losing has a much smaller impact on your own progression than in a rated Arena match.'],
    ['Currency & Economy', 'currency', 'newplayer',
      'Gold is the base currency, but most content also has its own specialized currency.',
      'Gold (in copper/silver/gold denominations) is earned from quests, loot, and selling to vendors or on the Auction House, and is used for repairs, mounts, and player-to-player trading. Beyond gold, most current content awards a specific token currency (reputation tokens, seasonal currencies, honor/conquest for PvP) that\'s spent with a matching vendor rather than on the open market.',
      'The Auction House is usually the fastest way for a new character to afford their first mount — selling gathered materials there tends to beat selling to a vendor directly.'],
    ['Mounts & Travel', 'mounts', 'newplayer',
      'Getting around Azeroth gets faster and more flexible the longer you play.',
      'Ground mounts are available at a fairly low level and dramatically speed up travel. Flying mounts, introduced in The Burning Crusade, unlock later and let you bypass ground obstacles and enemies entirely in most zones. The hearthstone item and in-world portals/flight paths round out the main travel toolkit.',
      'Forever leans back toward the original game\'s slower, more deliberate travel pace as part of its overall design philosophy — don\'t expect the same early access to fast flying that Retail now offers new characters.'],
    ['Reputation', 'reputation', 'intermediate',
      'Reputation is a long-term trust meter with a specific in-game faction, separate from your character level.',
      'Completing quests, turning in specific items, or defeating certain enemies for a faction raises your standing with them through a series of named tiers (historically Hated up through Exalted). Higher standing unlocks that faction\'s vendors, recipes, mounts, and sometimes questlines.',
      'Check a faction\'s reputation rewards before grinding it blind — some tiers gate content you actually want (recipes, mounts), while others are mostly cosmetic titles.'],
    ['Talents', 'talents', 'intermediate',
      'Talents let you customize how your class and specialization actually plays.',
      'Each specialization has its own talent structure that you fill in as you level and beyond, choosing between different passive and active ability upgrades. The exact structure has changed significantly over time — see the Comparison entry on Talent Trees for how Classic-style trees differ from modern loadouts.',
      'Don\'t treat your first build as permanent — respeccing is a completely normal and expected part of adjusting to new content, not something only "hardcore" players do.'],
    ['Addons & UI', 'addonsui', 'intermediate',
      'The interface you see by default is only a starting point — most long-term players customize it heavily.',
      'Addons are player-made modifications that add or change interface features — things like better raid frames, damage/threat meters, quest helpers, and auction house tools. They\'re installed through a separate addon manager application rather than through the game itself, and are entirely optional.',
      'Start small — a unit-frame addon and a quest-tracking addon cover most of what new players feel is "missing" from the default interface, without overwhelming you with configuration.'],
    ['Group Finder & Etiquette', 'other', 'newplayer',
      'Grouping with strangers is a normal, everyday part of playing WoW, not just an endgame thing.',
      'The built-in group finder tools let you queue for dungeons, raids, and some PvP without needing a pre-made group of friends. Basic etiquette matters more than skill for a first impression: read the group\'s stated expectations, don\'t leave mid-run without saying anything, and ask before pulling if you\'re unsure of a fight.',
      'It\'s completely normal to say "first time in this dungeon" when you join a group — most players would rather know upfront than have someone quietly struggle through a fight they don\'t understand.'],
    ['Basic Controls & Combat Flow', 'gettingstarted', 'newplayer',
      'Movement is WASD (or click-to-move), and combat starts by targeting an enemy — left-click on it, or right-click to target and auto-attack a nearby enemy in one step.',
      'Once something is targeted, autoattack (melee or ranged, depending on class) starts automatically and keeps swinging on its own — your job is to layer abilities from your action bar on top of that using their number keys. Every ability costs a small shared delay to use (the global cooldown), and most classes spend a resource shown on your own health/resource bar (mana, rage, energy, etc.) to cast their bigger abilities, so keep an eye on it.',
      'Use the number keys (1-0) to fire abilities instead of clicking their icons — it\'s dramatically faster once it becomes muscle memory, and almost everyone ends up doing it this way eventually.'],
    ['Quest Log Mechanics', 'gettingstarted', 'newplayer',
      'A yellow exclamation mark over an NPC means they have a quest to offer; a yellow question mark means you\'re ready to turn one in (see the Icon glossary for the full set of map symbols).',
      'Accepting a quest adds it to your quest log (opened with a dedicated key, L by default) and puts its objectives on your on-screen tracker and map. Complete the listed objectives, then return to the turn-in NPC to hand it in for XP, gold, and sometimes gear or reputation. Many quests automatically chain into a follow-up once you turn them in.',
      'Track multiple quests that happen to be in the same area together rather than one at a time — it saves a lot of backtracking, and the default tracker has room for several at once.'],
    ['Death & Recovery', 'gettingstarted', 'newplayer',
      'Dying is a normal, expected part of playing, not a failure state that ends anything permanently.',
      'When you die you become a ghost at the nearest graveyard. Running back to your corpse and reviving there costs nothing extra. Alternatively, talking to the Spirit Healer revives you on the spot, but leaves you with resurrection sickness — a temporary stat reduction — and adds wear to your gear\'s durability. Gear that runs out of durability stops providing its stats until repaired.',
      'Walk back to your corpse instead of using the Spirit Healer whenever it\'s reasonably close — it completely avoids the resurrection-sickness penalty that the instant option carries.'],
    ['Bags, Vendors, Mail & Repairs', 'gettingstarted', 'newplayer',
      'Everything you pick up goes into your bag slots, which you can expand by buying and equipping bigger bags.',
      'Any vendor will buy unwanted items from you for gold — grey "Poor" quality items (see the Icon glossary) are vendor junk with no other use, so sell those first. Mailboxes let you send items and gold to your own other characters or receive them from other players and the Auction House. Vendors with a hammer icon (or certain class abilities) repair your gear\'s durability for a small gold cost.',
      'Keep at least one bag slot free while questing so a quest reward or drop doesn\'t go to waste, and repair before a dungeon or raid rather than after — broken gear provides none of its stats.'],
    ['Social Basics: Guilds, Friends & Chat Channels', 'gettingstarted', 'newplayer',
      'A guild is a persistent, player-run community with its own chat channel; a friends list tracks specific people across play sessions regardless of guild.',
      'Different chat channels reach different audiences: Say is only heard by players standing near you, Party/Raid reaches just your current group, Guild is guild-members-only, Whisper is a private one-on-one message, and General/Trade are public channels covering an entire zone. Joining a starting guild early gives you people to ask questions and a much less isolated leveling experience.',
      'Don\'t be shy about asking questions in General chat or a starting guild — most WoW communities are more welcoming to an obvious newcomer than people expect, and "dumb questions" are extremely normal there.'],
    ['Your First Hour: Where You Actually Start', 'gettingstarted', 'newplayer',
      'Where your very first few minutes take place depends heavily on which version of the game you\'re playing.',
      'Forever drops you straight into the original 2004-era starting zones for your race, with no modern streamlined tutorial — you\'re expected to read quest text and find your own way, which is a deliberate part of its slower pacing. Modern Retail, by contrast, generally funnels brand-new characters through a short guided introductory zone (designed to teach the basics quickly) before releasing them into the open world.',
      'If Forever\'s opening zone feels slower or less hand-held than a modern game, that\'s intentional, not a sign you\'re missing something — read the quest text, and don\'t feel behind if it takes longer to get going than you might expect.'],
    ['Raid Loot Systems', 'dungeonsraids', 'veteran',
      'Personal Loot, Master Loot, and DKP/loot council are the three broad ways raid groups distribute gear.',
      'Personal Loot is the modern default in Retail — the game rolls for you automatically and hands out a small number of items per boss directly to eligible players, with no group decision involved. Master Loot lets a designated player manually assign every drop, common in organized guild raiding and in Classic-style content. DKP (Dragon/Dungeon Kill Points) and loot council are guild-level systems layered on top of Master Loot — DKP has players bid earned points for items, while a loot council manually decides who needs what most, usually based on upgrade value and attendance.',
      'Ask a raid leader which loot system a group uses before you pull the first boss — it changes how you should react when something drops for a class other than yours.'],
    ['Boss Mods & Raid Addons', 'addonsui', 'veteran',
      'Boss mods (DBM- or BigWigs-style addons) and WeakAuras are the two addon categories most organized groups consider mandatory.',
      'A boss mod tracks encounter timers and shouts warnings before dangerous mechanics happen, well beyond what the default UI shows. WeakAuras (or a similar addon) let you build fully custom on-screen alerts and trackers for your own class\'s cooldowns and procs. Damage and threat meters round out the standard veteran toolkit, letting a group see performance and catch problems mid-fight.',
      'If a group says a boss mod is required, that\'s not optional gatekeeping — most current encounters have mechanics that are extremely difficult to react to correctly without one.'],
    ['Consumable & Raid-Prep Checklist', 'other', 'veteran',
      'Flasks, raid food, runes, and full repairs are the standard pre-pull checklist for organized raiding.',
      'Before an organized raid or a serious Mythic+ push, veterans typically flask (a long-duration stat buff), eat raid-quality food, apply any relevant runes or temporary weapon enchants, and make sure gear is fully repaired — all layered on top of permanent enchants and gems, which should already be applied to every open slot.',
      'Buy or craft consumables in bulk between sessions rather than scrambling right before a pull — running out mid-raid costs the whole group time, not just you.'],
    ['Warbands & Account-Wide Progress', 'other', 'veteran',
      'Warbands, introduced in The War Within, share certain progress across every character on your account rather than per-character.',
      'Warbands make things like most mounts, toys, achievements, and a shared bank accessible to every character on your account, instead of requiring you to re-earn them on each new character. Some currencies and reputation progress are also shared or partially shared, depending on the specific system.',
      'Check whether something is account-wide before grinding it out again on an alt — a lot of what used to be per-character busywork no longer needs to be repeated.'],
    ['Mythic+ Seasons, Affixes & the Great Vault', 'dungeonsraids', 'endgame',
      'A Mythic+ season is a fixed period with its own rotating dungeon pool and affixes; the Great Vault is the weekly reward system tied to your best activity that week.',
      'Each Mythic+ season runs for months with a set pool of dungeons and a rotating weekly affix — an extra modifier layered onto every key that week. The Great Vault opens weekly and offers a small number of gear choices based on your best raid, Mythic+, and PvP performance that week — the more and higher you complete, the better the average options offered.',
      'Even a single completed Mythic+ key or raid clear each week guarantees at least one Great Vault option — it\'s worth doing the minimum even in a busy week rather than skipping it entirely.'],
    ['Rated PvP: Ratings, Seasons & Arena Comps', 'pvp', 'endgame',
      'Arena and rated Battleground ratings track competitive skill separately from your gear, and reset partially at the start of each PvP season.',
      'Beyond casual PvP, rated Arenas (commonly 2v2/3v3) and rated Battlegrounds track a personal rating that rises and falls with wins and losses, gating access to higher-tier rewards and titles. Certain class/spec combinations ("comps") are considered stronger than others in a given season based on how their abilities interact, which shifts as balance changes land.',
      'Rating resets (partial, not full) happen every PvP season — don\'t be discouraged by a lower rating right after a reset, since the whole competitive pool resets with you.'],
    ['Stat Priorities & Theorycrafting', 'gear', 'endgame',
      'A stat priority ranks which secondary stats (like haste, critical strike, mastery, or versatility) matter most for a specific class and spec.',
      'Beyond simply picking the higher item level, veterans optimize gear using a stat priority — usually derived from community theorycrafting and simulation tools that model a spec\'s exact rotation and gear to calculate which stats produce the most performance. These priorities shift with talent and gear changes, so they\'re refreshed each season rather than fixed forever.',
      'A simple, current stat priority list from a reputable class guide gets you most of the benefit — you don\'t need to run simulations yourself to gear sensibly.'],
    ['Transmog & Cosmetic Collecting', 'other', 'veteran',
      'Transmogrification (transmog) changes how a piece of gear looks without changing its stats, using appearances you\'ve unlocked.',
      'Once you\'ve collected an item\'s appearance — usually just by looting or equipping it once — that look is unlocked permanently in your account-wide wardrobe and can be applied to any compatible gear slot afterward, regardless of the stats you\'re actually wearing. This has turned outfit and appearance collecting into one of the longest-running veteran hobbies in the game, often continuing long after a character is otherwise "finished" gearing.',
      'Check an item\'s appearance before disenchanting or vendoring gear you\'ve outgrown — if you like the look, loot or equip it once first so it\'s saved to your wardrobe forever.']
  ];
  systems.forEach(([title, category, audience, terms, body, tips]) => {
    entries.push(seedEntry(i++, 'system', '2026-09-10', { title, category, audience, terms, body, tips, tags: [category] }));
  });

  /* ── ITEM: representative gear categories, not an exhaustive list ──── */
  const items = [
    ['Weapons', 'weapon', 'common',
      'One-handed and two-handed swords, axes, and maces; daggers; fist weapons; polearms; staves; and ranged weapons like bows, guns, and crossbows.',
      'Different classes and specializations get more value out of certain weapon types — casters generally prefer staves or a wand, rogues rely on daggers for certain abilities, and some specs are built entirely around wielding two weapons at once. Weapon choice is one of the first meaningful gearing decisions a new character makes.',
      'A weapon\'s item level matters more than its visual type for raw power — but the weapon type it is still has to match what your class/spec can actually use.'],
    ['Potions & Elixirs', 'potion', 'uncommon',
      'Healing potions, mana potions, combat elixirs that boost a stat for a set time, raid-strength "flasks" with longer durations, and utility potions like invisibility or speed draughts.',
      'Consumables give a temporary edge on top of your gear, and preparing them ahead of tough content is a core part of "seasoned player" habits. They\'re crafted primarily through the Alchemy profession, which makes Alchemy one of the more consistently useful crafting professions to level.',
      'Keep a small rotating stock of your class\'s main combat potion and a stack of healing potions — running out mid-fight is one of the most common avoidable player mistakes.'],
    ['Armor', 'armor', 'common',
      'Cloth, Leather, Mail, and Plate are the four armor types, tied to which classes can wear them; gear slots cover head, shoulders, chest, wrists, hands, waist, legs, feet, plus rings, trinkets, neck, and back.',
      'Armor type restricts which classes benefit from a given piece — a Warrior in cloth gear gets almost no armor value from it, for example. Full matching sets from the same raid or vendor source often carry extra "set bonuses" for wearing multiple pieces together.',
      'A common newer-player mistake is picking up armor of the wrong type just because its stats look good — check that it matches your class\'s armor type first.'],
    ['Reagents & Quest Items', 'reagent', 'common',
      'Crafting materials gathered from professions (ore, herbs, leather, cloth), plus unique quest items that only exist to progress a specific questline and usually can\'t be sold or traded.',
      'Reagents feed the crafting-profession economy and are one of the most reliable early gold sources for a new character. Quest items are typically automatically removed from your bags once their questline is finished, so you don\'t need to worry about managing bag space around them.',
      'If your bags are full, quest items are almost never the ones worth deleting — they\'re usually needed and can\'t be reacquired without repeating the quest.'],
    ['Trinkets & Accessories', 'other', 'rare',
      'Rings, necks, cloaks, and trinkets — the accessory slots that sit outside the main armor-type system and can be worn by any class.',
      'Because they aren\'t restricted by armor type the way a chestpiece or helm is, accessories are judged purely by their stats and any special effect they carry — trinkets in particular often have a unique on-use or passive ability rather than just raw stats, which can matter more than their item level.',
      'Read a trinket\'s actual effect before assuming a higher item level automatically makes it better — a lower-ilvl trinket with an effect that fits your spec can outperform a generic stat-stick.'],
    ['Mounts', 'mount', 'rare',
      'Ground and flying mounts earned from vendors, drops, achievements, professions, and reputation rewards.',
      'Beyond basic travel, mounts are one of the game\'s biggest collection and status hobbies — many are tied to rare drops, difficult achievements, or long-since-retired content, which is part of why "mount farming" is a whole separate hobby some veteran players pursue for years.',
      'Your very first mount doesn\'t need to be exciting — grab whatever you can afford or earn quickest, since the speed boost matters far more early on than how it looks.'],
    ['Legendary & Artifact Items', 'other', 'legendary',
      'Rare, build-defining items — Legion\'s per-class Artifact weapons and Shadowlands-style Legendary items are the two best-known examples.',
      'Unlike ordinary gear upgrades, these items are usually designed around a unique effect that meaningfully changes how a spec plays, not just bigger numbers. They tend to be tied to a specific expansion\'s systems and are usually retired or reworked into ordinary gear once the next expansion raises the level cap.',
      'Don\'t expect every expansion to include one of these — they\'re a recurring but not permanent feature, used when a design team wants a build-defining item to anchor a specific expansion\'s systems.'],
    ['Shields', 'armor', 'common',
      'Off-hand shields ranging from simple wooden bucklers to ornate raid-quality tower shields.',
      'Shields are an off-hand item usable only by a small subset of classes and specs — mainly tanking specs and a few melee builds — trading away a second weapon or damage stats for a large boost to block chance and armor.',
      'A shield\'s stats matter less than whether your spec can equip one at all — most damage-focused specs simply can\'t use them, regardless of how good a shield looks on paper.'],
    ['Food & Drink', 'consumable', 'common',
      'Cooked meals that restore health or mana over time while seated, plus stat-boosting "well fed" feasts and buffet-style raid food.',
      'Food and drink are the most basic consumables: eating and drinking passively restore health and mana between fights, while certain cooked meals grant a temporary "Well Fed" stat buff. Most are crafted through the Cooking profession from ingredients gathered or bought.',
      'Keep a stack of cheap food and water in your bags at all times — it\'s the simplest way to avoid unnecessary downtime while questing.'],
    ['Enchants & Gems', 'other', 'rare',
      'Weapon and armor enchantments applied by an Enchanter, plus colored gems socketed into gear that has open sockets.',
      'Enchants and gems let you add extra stats directly onto a piece of gear you already own, on top of whatever it rolled naturally — a meaningful, often-overlooked source of extra power for comparatively little additional gearing effort.',
      'Re-apply enchants whenever you replace a piece of gear — it\'s easy to forget, and forgetting effectively means leaving free stats on the table.']
  ];
  items.forEach(([title, itemType, quality, examples, purpose, notes]) => {
    entries.push(seedEntry(i++, 'item', '2026-09-12', { title, itemType, quality, examples, purpose, notes, tags: [itemType] }));
  });

  /* ── COMPARISON: era vs era, with Forever featured throughout ──────── */
  const comparisons = [
    ['Level Cap: Rising vs Permanent', 'vanilla', 'forever',
      'From Vanilla through Midnight, nearly every expansion raised the level cap (60 → 70 → 80 → 85 → 90 → 100 → 110 → 120 → squished to 60 → 70 → 80 → 90), resetting the top of the power curve and requiring a fresh gear grind each time.',
      'Forever locks the level cap at 60 permanently. New raids, dungeons, and story are added horizontally within that same level-60 world instead of ever raising the ceiling again.',
      'Both models keep delivering new raids, dungeons, and story content over time, and both still use gear and consumables (potions, enchants) to grow character power between content releases.',
      'The traditional model resets progression with every expansion, which can feel like starting over; Forever\'s horizontal model means gear and levels you earn now never become obsolete the way a new expansion\'s level cap makes old gear obsolete.'],
    ['New Player Entry Point: Retail vs Forever', 'midnight', 'forever',
      'Retail (currently Midnight) carries over a decade of accumulated systems, legacy zones, and account-wide Warband unlocks, and generally boosts or streamlines new characters through most of that older content quickly so they can reach current content sooner.',
      'Forever has none of that legacy backlog — it\'s a single, self-contained level 1-60 world with its own new zones and roughly a thousand new quests, meant to be experienced at a slower, more traditional pace from the start.',
      'Both are valid, currently-supported ways to start playing WoW in 2026, and both use the same class/role/profession fundamentals covered in the System entries.',
      'Retail compresses and speeds a new character toward "endgame"; Forever asks you to level slowly through original-feeling Azeroth content as much of the actual experience, not just a ramp-up to something else.'],
    ['Talent Trees: Classic-Style vs Modern Retail', 'classic', 'warwithin',
      'Classic-era talent trees (Vanilla/Classic realms) are three linear per-class trees where points are spent one at a time as you level, and respeccing was historically slow and costly, making your build a bigger commitment.',
      'Modern Retail (from Dragonflight onward, including The War Within\'s addition of Hero Talents) uses a more flexible loadout system that\'s easy to respec between different loadouts, even between pulls in some cases.',
      'Both systems exist to let you specialize a class toward a specific playstyle within its available specs.',
      'Classic-style trees reward long-term commitment to a single build; modern Retail trees favor flexibility and let you adjust for different content on the fly.'],
    ['Group Content Scale: 40-Player Raids vs Modern Sizes', 'vanilla', 'dragonflight',
      'Vanilla raids like Molten Core and Blackwing Lair required coordinating a full 40-player roster, which came with heavy logistics — recruiting, scheduling, and managing that many players at once.',
      'Modern Retail raids run at smaller, fixed sizes (commonly a flexible range topping out well below 40), and modern tools like the Mythic+ dungeon system and Delves (introduced in The War Within) offer scaling small-group and solo-friendly alternatives.',
      'Both eras use raids as the primary source of the best available gear, and both use difficulty tiers to let different skill levels engage with the same content.',
      'Vanilla-style raiding demands much larger, harder-to-organize groups; modern content gives far more options for players who can\'t reliably field a large, fixed roster.'],
    ['Professions: Then vs Now', 'vanilla', 'dragonflight',
      'In Vanilla, professions were comparatively simple — a flat set of recipes learned from trainers, with success mostly about grinding materials and skill points.',
      'Dragonflight\'s profession rework (which modern Retail still builds on) added specialization trees within each profession, item-quality tiers on crafted goods, and a stronger player-to-player crafting economy including commissioned "work orders."',
      'Both eras pair a gathering profession with a matching crafting profession as the standard self-sufficient combination, and both use professions as a steady, non-combat gold source.',
      'Vanilla professions are straightforward and low-maintenance; the modern system is deeper and more rewarding to specialize in, but asks for noticeably more attention to get the most out of it.'],
    ['Flying & Mount Travel', 'tbc', 'forever',
      'Flying mounts were introduced in The Burning Crusade and have been a standard, early-unlocked convenience in Retail ever since — letting players bypass most ground obstacles and enemies.',
      'Forever\'s original level-60 world predates flying mounts entirely, and its design philosophy deliberately keeps travel grounded and more deliberate rather than fast-tracking players to flight.',
      'Both eras still use ground mounts, hearthstones, and flight-path/portal networks as the baseline travel toolkit.',
      'Modern Retail treats flight as an early, expected convenience; Forever intentionally withholds it to preserve the slower, more geography-driven pacing the original game was built around.'],
    ['Raid Access: Attunements vs Open Access', 'tbc', 'dragonflight',
      'During The Burning Crusade (and to a lesser extent Vanilla), accessing a raid often required completing a lengthy attunement questline first — sometimes spanning multiple earlier dungeons and raids just to unlock the door.',
      'Modern Retail raids (from around Dragonflight onward) are openly accessible the moment a new tier releases, with no prerequisite questline gatekeeping entry.',
      'Both eras still gate raid difficulty behind gear checks and mechanical skill once you\'re actually inside.',
      'Attunements added a substantial time investment and sense of earned access before TBC-era raiding; open access trades that gatekeeping for faster onboarding into current content.'],
    ['Character Customization Options', 'vanilla', 'midnight',
      'Vanilla character creation offered a small, fixed set of face, hair, and skin-tone options per race, set permanently at creation (later loosened slightly by the in-game Barbershop feature).',
      'Modern Retail, including Midnight, offers extensive customization sliders — body size, detailed face and hair options, scars, and more — freely re-editable at any time via the in-game Character Customization service.',
      'Both eras tie available options to your chosen race, and neither lets appearance customization affect gameplay stats.',
      'Vanilla\'s options were sparse and largely locked in at creation; modern Retail treats appearance as an ongoing, highly flexible personalization system rather than a one-time choice.']
  ];
  comparisons.forEach(([title, eraA, eraB, bodyA, bodyB, similarities, differences]) => {
    entries.push(seedEntry(i++, 'comparison', '2026-09-15', { title, eraA, eraB, bodyA, bodyB, similarities, differences, tags: [ERA_LABEL[eraA], ERA_LABEL[eraB]] }));
  });

  /* ── ICON: symbol glossary (text/emoji swatches, not in-game art) ──── */
  const icons = [
    ['Item Quality Colors', '⬜ ⬛ 🟩 🟦 🟪 🟧', 'quality',
      'From lowest to highest: Poor (grey) is vendor trash worth only a small amount of gold. Common (white) is basic starter-level gear. Uncommon (green) offers a solid early upgrade. Rare (blue) is the workhorse tier most players spend a lot of time in. Epic (purple) comes from raids and high-end content. Legendary (orange) items are rare, build-defining, and unique.',
      'Shown as the color of an item\'s name and border in tooltips, loot windows, your bags, and your character panel.'],
    ['Role Icons', '🛡️ 🩹 ⚔️', 'role',
      'A shield-shaped icon marks the Tank role. A cross/plus-shaped icon marks the Healer role. Crossed swords mark the Damage (DPS) role.',
      'Shown next to player names in party and raid frames, and in the group finder queue tool so you can see what roles a group still needs.'],
    ['Currency Icons', '🪙', 'currency',
      'Gold, silver, and copper coin icons represent the base money currency. Beyond that, most current content awards its own specific token icon (reputation tokens, seasonal currencies, PvP\'s Honor and Conquest) that only that content\'s vendors accept.',
      'Shown in your bags, at vendor windows, and in the dedicated currency tab of your character panel.'],
    ['Class & Specialization Icons', '🔥 🌙 🛡️', 'classspec',
      'Every class has its own unique icon shown on character portraits and the talent panel, and each specialization within a class has its own icon representing that spec\'s playstyle identity (for example, a fire-themed icon for a damage-focused spec versus a shield icon for a tanking spec).',
      'Shown on the character select screen, the talent/specialization panel, and next to player names in group and raid frames.'],
    ['Map & Minimap Icons', '📍 ❗ ❓', 'map',
      'A yellow exclamation mark marks a quest you can pick up. A yellow question mark marks a quest you\'re ready to turn in (grey versions mean you don\'t yet meet the requirements). A skull icon typically flags a dangerous elite enemy. Other small dot icons mark vendors, trainers, and flight points.',
      'Shown on both the minimap and the full world map.'],
    ['Chat & Social Icons', '💬 🟢 ⚪', 'chatsocial',
      'Different chat channels (Say, Party, Guild, Raid, Whisper, general channels) are color-coded so you can tell them apart at a glance. A small colored dot next to a player\'s name in your friends or guild list shows whether they\'re online, away, or offline.',
      'Shown in the chat window and its channel tabs, and in the friends/guild roster panels.'],
    ['UI & Action Bar Icons', '⏱️ 🔵 ⬜', 'uihud',
      'Each ability on your action bar shows its own icon, with a dark sweeping overlay while it\'s on cooldown and a small number counting down the remaining time. A glowing border usually indicates an ability is ready to use as part of a proc or combo.',
      'Shown on your action bars and in the buff/debuff icon rows near your character portrait.'],
    ['Difficulty & Binding Icons', 'N · H · M   BoP · BoE', 'uihud',
      'Difficulty tags (such as Normal, Heroic, and Mythic) mark which version of a dungeon or raid you\'re looking at. Binding tags on an item\'s tooltip — Bind on Pickup (BoP) or Bind on Equip (BoE) — show whether it locks to your character the moment you loot or equip it, which determines whether you can still trade or sell it afterward.',
      'Shown in the dungeon/raid finder\'s difficulty selector, and on item tooltips wherever binding applies.'],
    ['Achievement Icons', '🏆', 'other',
      'A trophy-style icon marks achievements — permanent, account-visible milestones for completing specific feats like a boss kill, a collection goal, or an exploration challenge. Achievements don\'t add character power, but some unlock titles, mounts, or other cosmetic rewards.',
      'Shown in the dedicated Achievements panel, and as a brief pop-up banner in the corner of the screen the moment you earn one.']
  ];
  icons.forEach(([title, symbol, category, meaning, context]) => {
    entries.push(seedEntry(i++, 'icon', '2026-09-18', { title, symbol, category, meaning, context, tags: [category] }));
  });

  return entries;
}

function seedIfEmpty() {
  if (state.entries.length > 0) return;
  if (localStorage.getItem(SEED_FLAG_KEY)) return; // already seeded once, user cleared it — respect that
  state.entries = buildSeedEntries();
  lsSave(state.entries);
  try { localStorage.setItem(SEED_FLAG_KEY, '1'); } catch {}
}

/* ══════════════════════════════
   RESTOCK MISSING CONTENT
   Compares the full current seed set against what's actually in this
   Grimoire and returns any seed entries not already present, matched
   by (type, title) — case-insensitive. This lets a Grimoire whose
   localStorage predates a later content update (seedIfEmpty only
   ever runs once, on a genuinely empty Grimoire) catch up without
   touching or duplicating anything the person already has, added, or
   edited. Known limitation: if a person has renamed a seeded entry's
   title, this can't recognize it as "already present" and will offer
   to add the seed version alongside it — matching is by title only,
   there's no hidden seed-origin id to key off of.
══════════════════════════════ */
function computeMissingSeedEntries() {
  const seed = buildSeedEntries();
  const existingKeys = new Set(
    state.entries.map(e => `${e.type}::${(e.title || '').trim().toLowerCase()}`)
  );
  return seed.filter(e => !existingKeys.has(`${e.type}::${(e.title || '').trim().toLowerCase()}`));
}

/* ══════════════════════════════
   EVENT LISTENERS
══════════════════════════════ */

/* ── Type buttons ── */
document.querySelectorAll('.type-btn').forEach(btn =>
  btn.addEventListener('click', () => switchType(btn.dataset.type)));

/* ── Header buttons ── */
btnReader.addEventListener('click', () => openReader());

/* ── Save / Clear ── */
btnSave.addEventListener('click', saveEntry);

btnClear.addEventListener('click', () => {
  const hasContent =
    document.getElementById('chronicle-title')?.value.trim() ||
    document.getElementById('chronicle-body')?.value.trim() ||
    document.getElementById('system-title')?.value.trim() ||
    document.getElementById('system-body')?.value.trim() ||
    document.getElementById('item-title')?.value.trim() ||
    document.getElementById('item-examples')?.value.trim() ||
    document.getElementById('comparison-title')?.value.trim() ||
    document.getElementById('comparison-a-body')?.value.trim() ||
    document.getElementById('icon-title')?.value.trim() ||
    document.getElementById('icon-meaning')?.value.trim() ||
    state.imageDataUrls.length > 0;
  // In edit mode the confirmation wording acknowledges the cancel action
  const msg = state.editingId
    ? 'Cancel this edit and discard all changes?'
    : 'Clear the current entry?';
  if ((hasContent || state.editingId) && !confirm(msg)) return;
  clearComposer();
});

/* ── Text field input → save gate ── */
['chronicle-title','chronicle-body'].forEach(id => {
  const el=document.getElementById(id); if(el) el.addEventListener('input',checkSaveEnabled);
});
['system-title','system-body'].forEach(id => {
  const el=document.getElementById(id); if(el) el.addEventListener('input',checkSaveEnabled);
});
['item-title','item-examples'].forEach(id => {
  const el=document.getElementById(id); if(el) el.addEventListener('input',checkSaveEnabled);
});
['comparison-title','comparison-a-body','comparison-b-body'].forEach(id => {
  const el=document.getElementById(id); if(el) el.addEventListener('input',checkSaveEnabled);
});
['icon-title','icon-meaning'].forEach(id => {
  const el=document.getElementById(id); if(el) el.addEventListener('input',checkSaveEnabled);
});

/* ── Pill grids ── */
document.getElementById('chronicle-era-grid').addEventListener('click', e => {
  const btn=e.target.closest('.pill-btn'); if(!btn) return;
  activatePill('chronicle-era-grid','chronicleEra',btn.dataset.val);
});
document.getElementById('system-category-grid').addEventListener('click', e => {
  const btn=e.target.closest('.pill-btn'); if(!btn) return;
  activatePill('system-category-grid','systemCategory',btn.dataset.val);
});
document.getElementById('system-audience-grid').addEventListener('click', e => {
  const btn=e.target.closest('.pill-btn'); if(!btn) return;
  activatePill('system-audience-grid','systemAudience',btn.dataset.val);
});
document.getElementById('item-type-grid').addEventListener('click', e => {
  const btn=e.target.closest('.pill-btn'); if(!btn) return;
  activatePill('item-type-grid','itemType',btn.dataset.val);
});
document.getElementById('item-quality-grid').addEventListener('click', e => {
  const btn=e.target.closest('.pill-btn'); if(!btn) return;
  activatePill('item-quality-grid','itemQuality',btn.dataset.val);
});
document.getElementById('comparison-eraa-grid').addEventListener('click', e => {
  const btn=e.target.closest('.pill-btn'); if(!btn) return;
  activatePill('comparison-eraa-grid','comparisonEraA',btn.dataset.val);
});
document.getElementById('comparison-erab-grid').addEventListener('click', e => {
  const btn=e.target.closest('.pill-btn'); if(!btn) return;
  activatePill('comparison-erab-grid','comparisonEraB',btn.dataset.val);
});
document.getElementById('icon-category-grid').addEventListener('click', e => {
  const btn=e.target.closest('.pill-btn'); if(!btn) return;
  activatePill('icon-category-grid','iconCategory',btn.dataset.val);
});

/* ── Emoji strip (Chronicle body) ── */
emojiStrip.addEventListener('click', e => {
  const btn=e.target.closest('.emoji-btn'); if(btn) insertEmoji(btn.dataset.emoji);
});

/* ── IMAGE UPLOAD WIRING ──────────────────────────────────────────────────
   Each form has a .img-pick-btn and a .img-url-btn identified by data-form.
   The shared hidden file input #img-file-input is clicked programmatically.
   On file change all selected files are compressed and added to state.
   URL button validates and adds the adjacent input's value directly.
────────────────────────────────────────────────────────────────────────── */
document.querySelectorAll('.img-pick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    _activePickForm = btn.dataset.form;
    imgFileInput.value = '';
    imgFileInput.click();
  });
});

imgFileInput.addEventListener('change', async () => {
  const files = Array.from(imgFileInput.files);
  if (!files.length) return;
  for (const file of files) {
    try {
      const dataUri = await compressImage(file);
      state.imageDataUrls.push(dataUri);
    } catch (err) {
      console.warn('Image compress failed:', err);
      alert(`Could not process image "${file.name}". Please try another file.`);
    }
  }
  renderImagePreview();
});

document.querySelectorAll('.img-url-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.img-url-row')?.querySelector('.img-url-input');
    if (!input) return;
    addImageUrl(input.value);
    input.value = '';
  });
});

document.querySelectorAll('.img-url-input').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addImageUrl(input.value); input.value = ''; }
  });
});

/* ── Grimoire search ── */
grimoireSearch.addEventListener('input', e => { openGrimoireSearch(e.target.value); });
grimoireSearch.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown')  { e.preventDefault(); moveSuggestCursor(1); }
  if (e.key === 'ArrowUp')    { e.preventDefault(); moveSuggestCursor(-1); }
  if (e.key === 'Enter')      { e.preventDefault(); selectSuggestCursor(); }
  if (e.key === 'Escape')     { closeSuggestions(); grimoireSearch.blur(); }
});
grimoireSearch.addEventListener('focus', () => { if (state.grimoireQuery) renderSuggestions(state.grimoireQuery); });
grimoireSearch.addEventListener('blur',  () => { setTimeout(closeSuggestions, 150); });
grimoireSearchClear.addEventListener('click', clearGrimoireSearch);

/* ── Recent panel filters ── */
recentFilters.addEventListener('click', e => {
  const btn=e.target.closest('.filter-btn'); if(!btn) return;
  state.recentFilter=btn.dataset.filter;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.filter===state.recentFilter));
  renderRecentPanel();
});

/* ── Reader ── */
readerClose.addEventListener('click', () => { overlayReader.style.display='none'; state.readerScrollTo=null; hideHlColorPopup(); hideDictPopover(); });
readerSearch.addEventListener('input', () => renderReader());
readerFilterType.addEventListener('change', () => { populateCategoryFilter(); renderReader(); });
readerFilterCat.addEventListener('change', () => renderReader());
readerSort.addEventListener('click', () => {
  state.readerSort=state.readerSort==='desc'?'asc':'desc';
  readerSort.textContent=state.readerSort==='desc'?'↓ Newest':'↑ Oldest';
  renderReader();
});

/* ── Terms toggle (Dictionary inline linking on/off) ── */
readerTermsToggle.classList.toggle('active', state.dictOn);
readerTermsToggle.textContent = state.dictOn ? '\uD83D\uDD24 Terms: On' : '\uD83D\uDD24 Terms: Off';
readerTermsToggle.addEventListener('click', () => {
  state.dictOn = !state.dictOn;
  readerTermsToggle.classList.toggle('active', state.dictOn);
  readerTermsToggle.textContent = state.dictOn ? '\uD83D\uDD24 Terms: On' : '\uD83D\uDD24 Terms: Off';
  try { localStorage.setItem('wow_grimoire_dict_on', state.dictOn ? '1' : '0'); } catch {}
  renderReader();
});

/* ── Highlighter: text selection inside the Reader ── */
readerBody.addEventListener('mouseup', e => {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  const container = e.target.closest('[data-hl-entry][data-hl-field]');
  if (!container) return;
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return;
  const start = getTextOffset(container, range.startContainer, range.startOffset);
  const end   = getTextOffset(container, range.endContainer, range.endOffset);
  if (end <= start) return;
  showHlColorPopup(range.getBoundingClientRect(), container.dataset.hlEntry, container.dataset.hlField, start, end);
});

/* ── Clicking an existing highlight removes it; clicking a dictionary term shows its definition ── */
readerBody.addEventListener('click', e => {
  const mark = e.target.closest('.hl-mark');
  if (mark) { removeHighlight(mark.dataset.hlId); return; }
  const term = e.target.closest('.dict-term');
  if (term) { showDictPopover(term.dataset.term, term.getBoundingClientRect()); return; }
});

/* ── Click-away: hide floating popups when clicking outside them ── */
document.addEventListener('mousedown', e => {
  if (!e.target.closest('#hl-color-popup')) hideHlColorPopup();
  if (!e.target.closest('#dict-popover') && !e.target.closest('.dict-term')) hideDictPopover();
});

/* ── My Highlights panel ── */
btnHighlights.addEventListener('click', () => { overlayHighlights.style.display='flex'; renderHighlightsList(); });
highlightsClose.addEventListener('click', () => { overlayHighlights.style.display='none'; });

/* ── Dictionary modal ── */
btnDictionary.addEventListener('click', () => { overlayDictionary.style.display='flex'; dictSearch.value=''; renderDictionaryList(''); });
dictClose.addEventListener('click', () => { overlayDictionary.style.display='none'; });
dictSearch.addEventListener('input', e => renderDictionaryList(e.target.value));

/* ── Characters modal ── */
btnCharacters.addEventListener('click', () => {
  overlayCharacters.style.display='flex';
  charSearch.value='';
  renderCharactersList('');
});
charClose.addEventListener('click', () => { overlayCharacters.style.display='none'; });
charSearch.addEventListener('input', e => renderCharactersList(e.target.value));
charFilterRow.addEventListener('click', e => {
  const btn = e.target.closest('.char-filter-btn'); if (!btn) return;
  state.charFilter = btn.dataset.filter;
  document.querySelectorAll('.char-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter===state.charFilter));
  renderCharactersList(charSearch.value);
});

/* ── Restock missing content ── */
btnRestock.addEventListener('click', () => {
  const missing = computeMissingSeedEntries();
  if (!missing.length) {
    alert('Your Grimoire already has all current seed content — nothing to restock.');
    return;
  }
  state.pendingRestock = missing;
  const byType = {};
  missing.forEach(e => { byType[e.type] = (byType[e.type] || 0) + 1; });
  const breakdown = Object.entries(byType)
    .map(([t, n]) => `${n} ${TYPE_EMOJI[t] || ''} ${t}`.trim())
    .join(', ');
  restockMessage.textContent = `This will add ${missing.length} entr${missing.length !== 1 ? 'ies' : 'y'} you're currently missing (${breakdown}), without touching anything you've already added or edited.`;
  overlayRestock.style.display = 'flex';
});
restockConfirm.addEventListener('click', () => {
  if (state.pendingRestock.length) {
    state.entries.push(...state.pendingRestock);
    lsSave(state.entries);
    renderRecentPanel();
    updateFooter();
    updateStorageStatus();
    populateCategoryFilter();
    if (overlayReader.style.display !== 'none') renderReader();
  }
  state.pendingRestock = [];
  overlayRestock.style.display = 'none';
});
restockCancel.addEventListener('click', () => {
  state.pendingRestock = [];
  overlayRestock.style.display = 'none';
});

/* ── Delete ── */
deleteConfirm.addEventListener('click', () => {
  if(state.pendingDelete) deleteEntry(state.pendingDelete);
  state.pendingDelete=null; overlayDelete.style.display='none';
});
deleteCancel.addEventListener('click', () => { state.pendingDelete=null; overlayDelete.style.display='none'; });

/* ── Keyboard global ── */
document.addEventListener('keydown', e => {
  if(e.key==='Escape'){
    overlayReader.style.display='none'; overlayDelete.style.display='none';
    overlayHighlights.style.display='none'; overlayDictionary.style.display='none';
    overlayCharacters.style.display='none'; overlayRestock.style.display='none';
    hideHlColorPopup(); hideDictPopover();
    state.readerScrollTo=null;
  }
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();if(!btnSave.disabled)saveEntry();}
});

/* ── Overlay backdrop click to close ── */
[overlayReader,overlayDelete,overlayHighlights,overlayDictionary,overlayCharacters,overlayRestock].forEach(o=>{
  o.addEventListener('click',e=>{
    if(e.target!==o) return;
    o.style.display='none';
    if(o===overlayReader) { state.readerScrollTo=null; hideHlColorPopup(); hideDictPopover(); }
    if(o===overlayDelete) state.pendingDelete=null;
    if(o===overlayRestock) state.pendingRestock=[];
  });
});

/* ══════════════════════════════
   INITIALISATION
   Auto-loads from localStorage. Seeds starter content on first-ever
   load. No user action required.
══════════════════════════════ */
function init() {
  seedIfEmpty();
  loadCharacters();
  updateStorageStatus();
  checkSaveEnabled();
  renderRecentPanel();
  updateFooter();
  populateCategoryFilter();
}

init();
