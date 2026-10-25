# ForgeHype design package (Tier 1, trimmed)

Build input for `forgehype-qa/index.html`. Every viewer-facing line below ships verbatim.

## 1. Brand premise

**Forged.** Things made in heat, on purpose, built to last. The whole site teaches one idea: attention in Doha is earned in a second and kept with intent. "Seen. Remembered." is the promise, "forged with intent" is the method. Every section either shows the heat (the work, the footage, the glow) or the intent (the process, the staying, the measuring).

## 2. Palette (direction now, final values sampled from approved footage)

```css
:root{
  --canvas:#0b0908;        /* warm near-black, tinted toward the footage's charcoal */
  --panel:#141110;         /* raised glass surfaces base */
  --panel-2:#1c1815;
  --accent:#fe5d02;        /* brand orange, CTA and rare emphasis */
  --accent-hover:#ff7a2a;
  --accent-muted:rgba(254,93,2,.16);
  --glow:#ffb23f;          /* amber edge light from the footage */
  --haze:#2a3340;          /* the blue-grey sea haze in the footage */
  --text-primary:#f4efe9;
  --text-secondary:#a89f96;
  --line:rgba(255,255,255,.08);
  --line-strong:rgba(255,255,255,.18);
}
```

## 3. Type trio

- Display: **Bricolage Grotesque** 500 and 700 (optical size axis on, tight tracking, the Apple-adjacent grotesk with real character).
- Body: **Manrope** 400, 500, 600.
- Labels: **Geist Mono** 400, 500 for kickers, counters, `[ bracket labels ]` from the brand kit.

## 4. Hero concept and band map

**Concept: The Glass Descent.** Camera high above Doha's West Bay at blue hour, above a thin sea haze. As the visitor scrolls, the camera descends slowly through the haze (lens softens, mist beads), while large frosted glass panes with orange edge light drift past in the foreground. The shot settles with the skyline across the lower third and one glass pane at rest center-right, a warm horizon glow underneath. Action lane: right half. Caption lane: left half.

Hero height 500vh (400vh scroll range). Ranges are starting points, validated by the flick test.

| Band | Range | Footage moment | Copy (verbatim) | Entrance |
|---|---|---|---|---|
| 1 | 0.00 to 0.28 | High above the haze, panes catching light | "Seen." then "Remembered." | Word-punch, "Remembered." lands late with overshoot (echoes a pane catching light) |
| 2 | 0.34 to 0.62 | Descending through the haze, lens softens | "Doha moves fast. Your brand should move first." | Blur-to-sharp (echoes the haze clearing) |
| 3 | 0.70 to 1.00 | Arrival: skyline settles, pane at rest | Headline "Digital presence, forged with intent." Subline "Websites, e-commerce, media production and AI agents for brands in Qatar and the GCC." CTA "Book a free audit" and "See the work" | Word-by-word rise into a staged settle (echoes the arrival) |

## 5. Static-hero copy block (phones, reduced motion)

Headline: "Seen. Remembered."
Subline: "Digital presence, forged with intent. Websites, e-commerce, media production and AI agents for brands in Qatar."
CTA: "Book a free audit"  Secondary: "See the work"

## 6. Below-fold outline (one CTA anchor: `#book`)

**Nav:** Services, Work, Process, FAQ. Button: "Book a free audit".

**Trust strip (marquee):** "Built for brands in Doha, Dubai and beyond". Client marks: Farmer's Garden, Tetrahost BD, Veggify, Bujhle Easy. Sectors: Luxury retail, Fine dining, Automotive, Exhibitions, Hospitality, E-commerce.

**Section: Sound familiar?** Kicker `[ the problem ]`. Heading "Sound familiar?" Lead "Six things we hear in the first call. Tap one." Horizontal card rail:
1. "We post every day. Nothing happens." / "Content made to stop the scroll, not fill a calendar."
2. "The site looks fine. Nobody books." / "Pages built to turn a visit into an order or a call."
3. "Our reels look like everyone else's." / "One visual standard, shot for your brand only."
4. "Nobody finds us on Google. Or in ChatGPT." / "Search and AI visibility, so the right people find you first."
5. "Everything still runs through me." / "AI agents that answer, book and follow up while you sleep."
6. "The last agency built it and left." / "We stay until your team owns it."

**Section: What we forge.** Kicker `[ services ]`. Heading "Six services. One team." Lead "Pick one or all six. We shape the scope around your business." Six 3D glass cards (the signature element):
1. "Website & e-commerce" / "Fast, custom, built to convert." / Custom design, Shopify & headless, Arabic ready
2. "Media production" / "Reels people actually watch." / Reels & UGC, Product films, Brand films
3. "AI agents & automation" / "Routines gone. Time back." / WhatsApp agents, Bookings & orders, Custom apps
4. "Search & AI visibility" / "Found on Google. Cited by AI." / Local SEO, AI search, Content
5. "Brand & media kit" / "One identity, everywhere." / Logo & system, Menus & catalogs, Packaging
6. "Monthly support" / "Your backend team, on call." / Updates, Training, Optimisation

**Section: Work rail (pinned horizontal scroll).** Kicker `[ media production ]`. Heading "Made for brands that can't look ordinary." Cards with generated stills:
1. "Luxury bags" / "Campaign films and reels for luxury handbag boutiques." / Luxury retail
2. "High-ticket watches" / "Websites and launch content for resellers moving six-figure pieces." / E-commerce
3. "Car detailing" / "Before and after reels that sell the finish." / Automotive
4. "Fine dining" / "Menus, apps and films for restaurants that live on atmosphere." / Hospitality
5. "Brand promotions" / "Campaign content for airline, marketplace and exhibition launches." / Campaigns
6. "Social & UGC" / "Monthly social, influencer and UGC content that keeps the feed alive." / Social

**Section: Why now.** Kicker `[ qatar ]`. Heading "Doha moves fast." Copy "Qatar is putting billions into digital. Government runs on apps, payments are contactless, and your customers expect the same from every brand they touch. Standing still is falling behind." Stats (counters): "$5.7bn" digital investment expected in 2026; "Top 10" worldwide for everyday AI use; "14" years in the GCC market; "60" videos a month at full volume. Source line: "Sources: Invest Qatar, Microsoft Q1 2026." Ending frame reused as the section image.

**Section: Process.** Kicker `[ how it works ]`. Heading "We build. We guide. We stay." Self-drawing line through five steps:
01 "Discover" / "Your goals, your customers, your numbers."
02 "Build" / "Site, brand, content, agents."
03 "Launch" / "Live where your customers look."
04 "Guide" / "We stay until your team owns it."
05 "Measure" / "Before and after. Then again."

**The interactive moment: Hold to forge.** Kicker `[ the forgehype way ]`. Heading "Hold to forge." Lead "Press and hold the card." While held, the glass card heats from charcoal to molten orange; on completion it reveals "Heat. Shape. Hold." and lights four lines in sequence:
- "Aligned before we shoot. Fewer revisions."
- "One standard. Quality holds at volume."
- "Lean team, AI-powered, fast."
- "Measured before and after."
Release early eases back. Reduced motion shows the final state.

**Section: Not a typical agency.** Heading "Operators, not consultants." Lead "We have run startups, online stores and operations ourselves. So we talk in orders, bookings and hours saved." Compare rows (Typical agency / ForgeHype):
- "Builds it, then leaves" / "Stays until your team owns it"
- "Standard packages" / "A scope built around you"
- "Trial and error" / "Proven playbooks"
- "Several vendors" / "One team, every service"
- "Reports activity" / "Measures before and after"
- "Tech talk" / "Plain business language"

**FAQ.** Heading "Quick answers."
- "What does ForgeHype do?" / "Websites, e-commerce, media production, search and AI visibility, AI agents and monthly support. One team, and we stay beside yours."
- "How much does it cost?" / "Every scope is built around your business, so we quote after the free audit. No standard packages."
- "How fast can you deliver content?" / "Days from brief to delivery, not weeks. From 10 to 60 videos a month."
- "What does the free audit cover?" / "Your website, search presence, content and brand. You get a clear list of what to fix first."
- "Do you work outside Qatar?" / "Yes. Based in Doha, working across the UAE and with clients worldwide on Teams and WhatsApp."
- "Can you automate bookings and replies?" / "Yes. AI agents on WhatsApp and your site that answer, book, take orders and follow up."
- "Do you work in Arabic?" / "Yes. Bilingual sites, menus and content, built right to left where it matters."

**CTA and form (`#book`).** Kicker `[ free audit ]`. Heading "Forge your business hype." Lead "A free audit or consultation, on Microsoft Teams." Fields: "Your name", "Work email", "WhatsApp or phone", "What do you need?" (Not sure yet, Website & e-commerce, Media production, AI agents & automation, Search & AI visibility, Brand & media kit, Monthly support), "Anything else?". Button "Book a free audit". Note "Opens WhatsApp with your details filled in. We reply with a Teams invite." Success "Sent. We reply within one working day with a Teams invite."
Form handling: opens WhatsApp (wa.me/97470069544) with the message prefilled; a mailto fallback link to ForgeHypeqatar@gmail.com sits beside it. Static site, no backend, stated plainly.

**Footer.** Logo. "Doha, Qatar. Working across the UAE and worldwide." Links: Services, Work, Process, FAQ, Book a free audit. Contact: +974 7006 9544, ForgeHypeqatar@gmail.com, WhatsApp. "© 2026 ForgeHype." Imagery note is not shown on the site (decision: generated visuals are placeholders to be swapped with real client footage; no AI label).

## 7. Vector and living layer

- One fixed background environment: slow-drifting warm glow and whisper-level ember particles (canvas, 60s+ cycle), paused off-screen and on hidden tabs.
- Self-drawing orange hairline through the process steps (SVG `stroke-dashoffset` on scroll).
- Glass cards: pointer-tracked heat edge (radial orange glow at the cursor) and a glare sweep. 3D tilt on hover, max 8 degrees, eased back on leave.
- Pinned horizontal work rail driven by scroll (Framer-style).
- Marquee duplicated past 2560px.
- Reduced motion: every element in its final state, drives stopped.

## 8. Engineering list

Blob fetch behind a loading ring, dt-normalized lerp, gated seeks with the error escape, delta-gated DOM writes, band pacing in vh with the flick test, the four-layer legibility system (base scrim, per-band scrim, text-shadow token, chip scrim), the five static-hero gates in CSS and JS with change listeners, complete-without-video, `overflow-x: clip`, skip link, landmarks, focus-visible, 44px touch targets, inline SVG favicon, `<!-- DEPLOY STEP -->` og tags.

## 9. Copy gate

Every line above ships verbatim. The built page must pass the grep gate: zero em dashes, zero stock words (leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions), and the body-copy sweep for AI tells. The designed devices here ("Seen. Remembered.", "We build. We guide. We stay.", "Heat. Shape. Hold.", "Routines gone. Time back.") are craft and stay.
