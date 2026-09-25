/* ═══════════════════════════════════════════
   WOW GRIMOIRE — assets/data/characters.js
   Major/main character reference data.
   Loaded via a plain <script> tag (before main.js) rather than
   fetch()+JSON, so it works when the app is opened directly via
   file:// — browsers block local fetch() of other local files,
   but a same-folder <script src="..."> loads fine either way.
   Edit this file directly to add/update characters; each entry is a
   plain object literal, same shape as the JSON version it replaces.
═══════════════════════════════════════════ */
const WOW_CHARACTERS = [
  {
    "name": "Thrall",
    "title": "Go'el, former Warchief of the Horde",
    "faction": "Horde",
    "role": "Shaman / Former Warchief",
    "eras": ["vanilla", "wotlk", "cata"],
    "summary": "An orc raised by humans who escaped slavery to reunite and reform the Horde along more honorable lines. Led the Horde for most of the game's early history before stepping back into a spiritual, world-first role as the planet's elemental balance became threatened."
  },
  {
    "name": "Jaina Proudmoore",
    "title": "Lady Admiral of Kul Tiras",
    "faction": "Alliance",
    "role": "Archmage",
    "eras": ["vanilla", "wotlk", "bfa"],
    "summary": "A powerful human mage and one of the few major figures to maintain a genuine friendship across the faction divide for years. Her trust was shattered by later betrayals, hardening her into a far more militant defender of the Alliance."
  },
  {
    "name": "Sylvanas Windrunner",
    "title": "The Banshee Queen",
    "faction": "Horde",
    "role": "Former Ranger-General / Former Warchief / Former Val'kyr Queen",
    "eras": ["wotlk", "bfa", "shadowlands"],
    "summary": "Once the Alliance's Ranger-General, killed and raised as an undead Banshee by the Lich King. Later led the Forsaken and eventually the entire Horde, with methods that grew steadily more ruthless before her role in the Shadowlands afterlife storyline."
  },
  {
    "name": "Arthas Menethil",
    "title": "The Lich King",
    "faction": "Neutral / Scourge",
    "role": "Fallen Paladin Prince",
    "eras": ["wotlk"],
    "summary": "Once a noble paladin prince of Lordaeron, Arthas's obsession with stopping a plague led him to wield the cursed runeblade Frostmourne, which corrupted him into the Lich King and made him one of the game's most infamous antagonists."
  },
  {
    "name": "Illidan Stormrage",
    "title": "The Betrayer",
    "faction": "Neutral / Illidari",
    "role": "Demon Hunter",
    "eras": ["tbc", "legion"],
    "summary": "A night elf who sacrificed his own body and morality to gain demonic power in order to fight the Burning Legion on its own terms, at the cost of being branded a traitor by nearly everyone he once fought alongside."
  },
  {
    "name": "Anduin Wrynn",
    "title": "High King of the Alliance",
    "faction": "Alliance",
    "role": "Priest / King of Stormwind",
    "eras": ["cata", "bfa", "shadowlands"],
    "summary": "The idealistic son of Varian Wrynn who grew from a peace-seeking priest into the Alliance's High King, and was later corrupted and redeemed during the Shadowlands storyline."
  },
  {
    "name": "Varian Wrynn",
    "title": "King of Stormwind",
    "faction": "Alliance",
    "role": "Warrior King",
    "eras": ["cata", "mop", "wod"],
    "summary": "The battle-hardened King of Stormwind and Anduin's father, defined by a long personal struggle between his warrior instincts and his responsibilities as a ruler, before dying to protect the Alliance from the Burning Legion's opening assault on Azeroth."
  },
  {
    "name": "Tyrande Whisperwind",
    "title": "High Priestess of Elune",
    "faction": "Alliance / Night Elves",
    "role": "High Priestess / Night Warrior",
    "eras": ["legion", "bfa"],
    "summary": "The long-serving High Priestess and leader of the night elves, who took on the mantle of the vengeful \"Night Warrior\" after the burning of Teldrassil to lead a war of retribution against the Horde."
  },
  {
    "name": "Malfurion Stormrage",
    "title": "Archdruid",
    "faction": "Alliance / Night Elves",
    "role": "Archdruid",
    "eras": ["cata", "legion"],
    "summary": "The first mortal druid and Tyrande's husband, a founder of the night elves' modern society who has repeatedly been called out of peaceful isolation to defend Azeroth from existential threats."
  },
  {
    "name": "Uther the Lightbringer",
    "title": "First Paladin of the Silver Hand",
    "faction": "Alliance",
    "role": "Paladin",
    "eras": ["wotlk"],
    "summary": "The founder of the Order of the Silver Hand and mentor to Arthas, whose death at his former student's hands became one of the most pivotal tragedies in the lead-up to the Lich King storyline."
  },
  {
    "name": "Kael'thas Sunstrider",
    "title": "Prince of the Blood Elves",
    "faction": "Horde (formerly) / Burning Legion",
    "role": "Mage Prince",
    "eras": ["tbc"],
    "summary": "The blood elf prince whose people's addiction to arcane magic pushed him toward increasingly desperate and villainous choices, culminating in his fall to the Burning Legion during The Burning Crusade."
  },
  {
    "name": "Vol'jin",
    "title": "Warchief of the Horde",
    "faction": "Horde / Darkspear Trolls",
    "role": "Shadow Hunter / Former Warchief",
    "eras": ["mop", "wod", "legion"],
    "summary": "Leader of the Darkspear tribe and a Horde Warchief who prioritized honor and unity among the Horde's races, whose death set the stage for Sylvanas's controversial rise to power."
  },
  {
    "name": "Baine Bloodhoof",
    "title": "Chieftain of the Tauren",
    "faction": "Horde / Tauren",
    "role": "Chieftain",
    "eras": ["cata", "bfa"],
    "summary": "The measured, peace-favoring leader of the tauren, often serving as a moral counterweight within the Horde's leadership during its more aggressive periods."
  },
  {
    "name": "Genn Greymane",
    "title": "King of Gilneas",
    "faction": "Alliance / Worgen",
    "role": "King / Worgen Warrior",
    "eras": ["cata", "bfa"],
    "summary": "The isolationist King of Gilneas who was forced to lead his people into the wider world after a worgen curse and the wars that followed, becoming one of the Alliance's fiercest advocates for retaliation against the Horde."
  },
  {
    "name": "Velen",
    "title": "The Prophet",
    "faction": "Alliance / Draenei",
    "role": "Prophet / Priest",
    "eras": ["tbc", "legion"],
    "summary": "The ancient and wise leader of the draenei, whose visions of the future guided his people's flight from the Burning Legion for millennia before they settled in Azeroth."
  },
  {
    "name": "Khadgar",
    "title": "Archmage of the Kirin Tor",
    "faction": "Neutral / Kirin Tor",
    "role": "Archmage",
    "eras": ["tbc", "wod", "legion"],
    "summary": "A once-young apprentice to Medivh who grew into one of Azeroth's most powerful and consistently reliable neutral mages, frequently coordinating the response to major world-ending threats."
  },
  {
    "name": "Medivh",
    "title": "The Last Guardian",
    "faction": "Neutral",
    "role": "Guardian of Tirisfal",
    "eras": ["vanilla"],
    "summary": "The Guardian of Tirisfal whose corruption by the demon Sargeras directly caused the orcs' invasion of Azeroth in the original Warcraft story, making him one of the setting's foundational tragic figures."
  },
  {
    "name": "Deathwing",
    "title": "The Destroyer (formerly Neltharion)",
    "faction": "Neutral / Black Dragonflight",
    "role": "Aspect of Earth (fallen)",
    "eras": ["cata"],
    "summary": "Once the Dragon Aspect charged with protecting Azeroth's crust, driven mad by an artifact he created himself, and ultimately responsible for physically reshaping the world during the Cataclysm expansion."
  },
  {
    "name": "Ysera",
    "title": "Aspect of Dreams",
    "faction": "Neutral / Green Dragonflight",
    "role": "Dragon Aspect",
    "eras": ["legion"],
    "summary": "The Dragon Aspect who watched over the Emerald Dream, a realm connected to the natural world's growth and balance, until her death during the Legion expansion."
  },
  {
    "name": "Nozdormu",
    "title": "Aspect of Time",
    "faction": "Neutral / Bronze Dragonflight",
    "role": "Dragon Aspect",
    "eras": ["cata"],
    "summary": "The Dragon Aspect responsible for guarding the flow of time, whose dragonflight has repeatedly had to intervene to stop the timeline itself from being unraveled."
  },
  {
    "name": "Alexstrasza",
    "title": "Aspect of Life",
    "faction": "Neutral / Red Dragonflight",
    "role": "Dragon Aspect",
    "eras": ["vanilla", "cata"],
    "summary": "The Dragon Aspect of life and the informal leader of the five dragonflights, long a protector of mortal races even at great personal cost during Vanilla-era captivity in the original raid content."
  },
  {
    "name": "N'Zoth",
    "title": "The Corruptor",
    "faction": "Old Gods",
    "role": "Old God",
    "eras": ["bfa"],
    "summary": "One of the ancient, world-corrupting Old Gods imprisoned beneath Azeroth, whose whispers and corruption were a central undercurrent of the Battle for Azeroth expansion's story before his eventual defeat."
  },
  {
    "name": "Sargeras",
    "title": "The Dark Titan",
    "faction": "Burning Legion",
    "role": "Fallen Titan",
    "eras": ["legion"],
    "summary": "Once a Titan charged with defending order in the universe, corrupted into believing all life must be destroyed to prevent future chaos, making him the ultimate architect behind the Burning Legion's repeated invasions of Azeroth."
  },
  {
    "name": "Xal'atath",
    "title": "The Voice in the Void",
    "faction": "Void",
    "role": "Sentient Void-corrupted blade",
    "eras": ["warwithin", "midnight"],
    "summary": "A sentient, whispering blade tied to the Void that has manipulated events from the shadows for years, confirmed as the recurring antagonist driving the Worldsoul Saga across The War Within and Midnight."
  },
  {
    "name": "Bolvar Fordragon",
    "title": "The Lich King (successor)",
    "faction": "Neutral / Scourge (redeemed)",
    "role": "Lich King",
    "eras": ["wotlk", "shadowlands"],
    "summary": "A human paladin gravely injured defending Stormwind who was later transformed to succeed Arthas as the Lich King, using the role to hold the Scourge in check rather than unleash it."
  },
  {
    "name": "Chromie",
    "title": "Keeper of Time",
    "faction": "Neutral / Bronze Dragonflight",
    "role": "Bronze Dragon / Time-Keeper",
    "eras": ["cata", "dragonflight"],
    "summary": "A bronze dragon who takes a small gnome-like form and has served as a friendly, time-travel-focused questgiver and guide across many different points in the game's history."
  },
  {
    "name": "Magni Bronzebeard",
    "title": "The Speaker (formerly King of Ironforge)",
    "faction": "Alliance / Dwarves",
    "role": "King / Speaker for Azeroth",
    "eras": ["cata", "bfa"],
    "summary": "The former King of Ironforge who was transformed into living diamond during the Cataclysm and later gained the ability to hear the world-spirit of Azeroth itself, becoming a key mystical advisor in more recent expansions."
  },
  {
    "name": "Gul'dan",
    "title": "First Horde Warlock",
    "faction": "Horde (historical) / Burning Legion",
    "role": "Warlock",
    "eras": ["vanilla", "legion"],
    "summary": "The orc warlock whose pact with the Burning Legion corrupted the orc clans into the original Horde that invaded Azeroth, and who was resurrected in an alternate timeline to play the same corrupting role again during Warlords of Draenor and Legion."
  }
];
