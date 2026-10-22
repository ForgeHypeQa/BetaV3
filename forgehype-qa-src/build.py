"""ForgeHype.qa page generator.

The site itself is plain HTML/CSS/JS in ../forgehype-qa and can be edited and uploaded directly.
This script only exists so the shared header, footer, icons and service pages stay identical
across every page. Run it after editing anything in this folder:

    python build.py

Standard library only. It overwrites the .html files in ../forgehype-qa.
"""
import html
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "forgehype-qa"
SITE = "https://forgehype.qa"
WHATSAPP = "97455879325"
PHONE_DISPLAY = "+974 5587 9325"
PHONE_TEL = "+97455879325"
EMAIL = "info@forgehype.qa"
FONTS = "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Martian+Mono:wght@400&display=swap"
THREE = "https://cdn.jsdelivr.net/npm/three@0.169.0"

# ---------------------------------------------------------------- icons (24px, 1.75 stroke)
ICONS = {
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-up-right": '<path d="M7 17 17 7M8 7h9v9"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "x": '<path d="M18 6 6 18M6 6l12 12"/>',
    "chevron": '<path d="m6 9 6 6 6-6"/>',
    "chat": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    "mail": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    "pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    "loop": '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    "heart": '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    "send": '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    "play": '<path d="M6 3l14 9-14 9z"/>',
    "cart": '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    "zap": '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    "target": '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    "layers": '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    "search": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    "sparkle": '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>',
    "gauge": '<path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    "phone-device": '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    "file": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    "calendar": '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    "box": '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    "chart": '<path d="M3 3v18h18"/><path d="M7 16v-4M12 16V8M17 16v-7"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    "cpu": '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    "receipt": '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8H8M16 12H8M13 16H8"/>',
    "check-circle": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    "alert": '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    "pen": '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    "eye": '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    "image": '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    "compass": '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
    "rocket": '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    "grad": '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    "wrench": '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    "web": '<rect x="2" y="3" width="20" height="18" rx="3"/><path d="M2 8h20M6 5.5h.01M9 5.5h.01"/>',
    "headset": '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="14" width="5" height="7" rx="2"/><rect x="17" y="14" width="5" height="7" rx="2"/>',
    "palette": '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16a6 6 0 0 0 6-6c0-4.9-4.5-8.6-10-8.6z"/>',
    "type": '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    "film": '<rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>',
    "camera": '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    "carousel": '<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M2 7v10M22 7v10"/>',
    "split": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/>',
    "mic": '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
}


def icon(name, cls=""):
    c = f' class="{cls}"' if cls else ""
    return f'<svg{c} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'


def photo(pid, alt, w=800, h=1000, sizes="(min-width: 900px) 33vw, 50vw", eager=False):
    """Responsive Unsplash image (served by Unsplash's CDN, free licence)."""
    base = f"https://images.unsplash.com/photo-{pid}?auto=format&fit=crop&q=70"
    srcset = ", ".join(f"{base}&w={x}&h={round(x * h / w)} {x}w" for x in (480, 800, 1200))
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<img src="{base}&w={w}&h={h}" srcset="{srcset}" sizes="{sizes}" width="{w}" height="{h}" '
            f'alt="{html.escape(alt)}" {load} decoding="async">')


# ---------------------------------------------------------------- shared content
SERVICES = [
    {
        "slug": "website-ecommerce", "name": "Website & e-commerce", "tagline": "Fast. Custom. Built to convert.",
        "short": "Custom sites and online stores, quick on mobile and built to turn visits into orders.",
        "problem": "Your website isn’t working", "fix": "A fast, custom site that turns visits into sales.",
        "icon": "web", "viz": "browser",
        "symptoms": ["It’s slow on mobile, so people leave before it loads.",
                     "It looks fine, but nobody orders, books or calls.",
                     "Every small change means waiting on someone else."],
        "included": [
            ("pen", "Custom design", "Designed around your brand and your customers. No templates."),
            ("gauge", "Quick on mobile", "Built to load fast on the phones your customers actually use."),
            ("cart", "Online store", "Products, cart, checkout and payment links, set up to take orders."),
            ("target", "Built to convert", "Clear offers, short paths and a next step on every page."),
            ("search", "Ready for search", "Clean structure and speed, so Google can find and rank you."),
            ("grad", "Yours to run", "We train your team to update pages and products without us."),
        ],
        "photo": ("1563013544-824ae1b704d3", "Paying online with a card on a laptop"),
    },
    {
        "slug": "media-production", "name": "Media production", "tagline": "Videos people watch.",
        "short": "Reels, UGC, demos and brand films, produced at the volume you need. Our speciality.",
        "problem": "Your content gets scrolled past", "fix": "Reels, UGC and demos people watch. As many as you need, every month.",
        "icon": "film", "viz": "reel", "badge": "Our speciality",
        "symptoms": ["You post, but nobody stops to watch.",
                     "Content happens when someone finds the time, so it rarely happens.",
                     "Quality drops as soon as you need more of it."],
        "included": [
            ("play", "Reels", "Made to stop the scroll."),
            ("mic", "UGC", "Real voices. Real trust."),
            ("carousel", "Carousels", "Stories worth a swipe."),
            ("box", "Product demos", "Show it. Sell it."),
            ("split", "Before & after", "Proof in seconds."),
            ("film", "Brand films", "Your story, cinematic."),
        ],
        "photo": ("1552900651-9df588459a9e", "Camera operator filming under warm studio light"),
    },
    {
        "slug": "search-ai-visibility", "name": "Search & AI visibility", "tagline": "Be found when customers search.",
        "short": "Get found on Google and in AI assistants, so the right customers reach you first.",
        "problem": "Nobody finds you", "fix": "Be found when customers search.",
        "icon": "search", "viz": "search",
        "symptoms": ["Customers search for what you sell and find your competitors.",
                     "Your Google listing is incomplete or out of date.",
                     "AI assistants don’t mention you when people ask for recommendations."],
        "included": [
            ("pin", "Local search", "A complete, active Google Business Profile for Qatar and beyond."),
            ("search", "On-page SEO", "Pages structured around what your customers actually type."),
            ("file", "Answer-first content", "Clear answers to the questions buyers ask before they buy."),
            ("sparkle", "AI assistant visibility", "Facts and structure that help AI assistants recommend you."),
            ("gauge", "Technical health", "Speed, indexing and structured data, fixed and monitored."),
            ("chart", "Before vs after", "We measure where you started and show what changed."),
        ],
        "photo": ("1724614766527-6f5a86ef4c5c", "City skyline at night across the water"),
    },
    {
        "slug": "brand-media-kit", "name": "Brand media kit", "tagline": "Logo, menus, catalogs, packaging.",
        "short": "One consistent identity across everything customers see and hold.",
        "problem": "Nobody remembers you", "fix": "Logo, menus, catalogs and packaging that stick.",
        "icon": "palette", "viz": "stack",
        "symptoms": ["Your logo, menu and social posts all look like different companies.",
                     "Every new flyer or post starts from scratch.",
                     "Customers like you but can’t recall your name."],
        "included": [
            ("pen", "Logo & lockups", "Primary, stacked and single-colour versions that work everywhere."),
            ("palette", "Colour & type", "A small, strict system that makes you recognisable."),
            ("file", "Menus & catalogs", "Print and digital, designed to be read and ordered from."),
            ("box", "Packaging", "Boxes, labels and bags customers remember you by."),
            ("image", "Social templates", "Ready-made layouts so every post looks like you."),
            ("layers", "Brand guide", "One reference your team and suppliers can follow."),
        ],
        "photo": ("1633174524827-db00a6b7bc74", "Branded shipping boxes on a dark surface"),
    },
    {
        "slug": "ai-automation-apps", "name": "AI, automation & apps", "tagline": "Routines gone. Time back.",
        "short": "Automate HR, invoices, bookings, inventory and reports, with custom apps where needed.",
        "problem": "Everything depends on you", "fix": "AI, automation and apps. Your routines, handled.",
        "icon": "cpu", "viz": "flow",
        "symptoms": ["You answer the same questions and approve the same things every day.",
                     "Invoices, bookings and stock live in different places.",
                     "Nothing moves when you’re not there."],
        "included": [
            ("users", "HR", "Leave, attendance and onboarding without the paperwork."),
            ("receipt", "Invoices", "Created, sent and chased automatically."),
            ("calendar", "Bookings", "Requests, confirmations and reminders, handled."),
            ("box", "Inventory", "Stock levels and reorders you can see at a glance."),
            ("chart", "Reports", "The numbers you need, delivered on schedule."),
            ("phone-device", "Custom apps", "Customer, staff and admin apps when off-the-shelf won’t do."),
        ],
        "proof": "We’ve built connected customer, driver and admin apps for a delivery business: photo proof at the door, automatic notifications, missed-stop handling and payment links.",
        "photo": ("1681137063068-081072cf04b4", "A small crew working at night"),
    },
    {
        "slug": "monthly-support", "name": "Monthly support", "tagline": "Backend experts, always on call.",
        "short": "Updates, training, optimisation and expert guidance, shaped around your business.",
        "problem": "You’re falling behind", "fix": "Backend experts beside your team. Always.",
        "icon": "headset", "viz": "thread",
        "symptoms": ["Your site, tools and channels drift out of date.",
                     "Your team learned the system once and forgot half of it.",
                     "Nobody owns improving things month to month."],
        "included": [
            ("wrench", "Updates", "Your site, store and tools kept current and secure."),
            ("grad", "Training", "Your team learns to run what we built, at their pace."),
            ("gauge", "Optimisation", "Small improvements every month, based on real numbers."),
            ("compass", "Expert guidance", "A partner to ask before you spend."),
            ("chart", "Monthly view", "Before vs after, in plain business language."),
            ("zap", "Fast fixes", "When something breaks, it’s our problem."),
        ],
        "photo": ("1612544409025-e1f6a56c1152", "A production team on a large soundstage"),
    },
]

FAQ = {
    "what": ("What does ForgeHype do?", "Websites, media, search and AI. Then we stay beside your team."),
    "media": ("What media can you make?", "Reels, UGC, carousels, product demos, before and afters, brand films. Whatever volume you need."),
    "audit": ("What does the free audit cover?", "We review your website, search presence and brand, then show you what to fix first."),
    "cost": ("How much does it cost?", "Every solution is built around your business, so we quote after the free audit."),
    "support": ("What is monthly support?", "Your backend team: updates, training, optimisation and expert guidance, shaped around your business."),
    "automate": ("Can you automate my processes?", "Yes: HR, invoices, bookings, inventory and reports."),
    "where": ("Do you only work in Qatar?", "We’re based in Doha and work with businesses across Qatar, the UAE and further afield. Calls run on Microsoft Teams."),
}

STEPS = [
    ("Discover", "Your goals, your customers."),
    ("Build", "Site, brand and channels."),
    ("Launch", "Live where they look."),
    ("Guide", "We stay until your team owns it."),
    ("Measure", "Before vs after."),
]

CLIENTS = [("farmers-garden", "Farmer’s Garden"), ("tetrahost-bd", "Tetrahost BD"), ("veggify", "Veggify"), ("bujhle-easy", "Bujhle Easy")]

COMPARE = [
    ("Builds it, then leaves", "Stays and guides your team till adapted"),
    ("Standard packages", "A solution built around you"),
    ("Trial and error", "Proven playbooks"),
    ("Several vendors", "One team, every service"),
    ("Reports activity", "Measures before vs after"),
    ("Tech talk", "Plain business language"),
]


# ---------------------------------------------------------------- partials
def p_faq(keys):
    items = []
    for k in keys:
        q, a = FAQ[k]
        items.append(f'<details class="faq-item"><summary>{q}<i aria-hidden="true"></i></summary><div class="ans"><p>{a}</p></div></details>')
    return '<div class="faq-list">' + "".join(items) + "</div>"


def p_clients():
    lis = "".join(f'<li><img src="{{{{root}}}}assets/img/clients/{s}.jpg" alt="{html.escape(n)}" width="200" height="200" loading="lazy"></li>' for s, n in CLIENTS)
    return f'<div class="clients" data-reveal><p class="muted">Brands we’ve built for</p><ul class="clients-row">{lis}</ul></div>'


def p_compare():
    rows = "".join(
        f'<li><span class="ico" aria-hidden="true"><span class="no">{icon("x")}</span><span class="yes">{icon("check")}</span></span>'
        f'<span class="txt"><span class="typical">{a}</span><span class="forge">{b}</span></span></li>' for a, b in COMPARE)
    return f'''<div class="compare" data-compare data-side="typical" data-reveal>
  <div class="compare-switch" role="group" aria-label="Compare">
    <span class="thumb" aria-hidden="true"></span>
    <button type="button" data-side="typical" aria-pressed="true">Typical agency</button>
    <button type="button" data-side="forge" aria-pressed="false">ForgeHype</button>
  </div>
  <p class="sr-only" aria-live="polite" data-compare-live></p>
  <ul class="compare-rows">{rows}</ul>
</div>'''


def p_process(compact=False):
    pts = [(260, 60), (450.2, 198.2), (377.6, 421.8), (142.4, 421.8), (69.8, 198.2)]
    nodes = "".join(f'<g class="loop-node"><circle cx="{x}" cy="{y}" r="22"/><text x="{x}" y="{y}">0{i + 1}</text></g>' for i, (x, y) in enumerate(pts))
    steps = "".join(f'<li class="step"><span class="n">0{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>' for i, (t, d) in enumerate(STEPS))
    return f'''<div class="process" data-process>
  <div class="process-visual">
    <div class="loop" aria-hidden="true">
      <svg viewBox="0 0 520 520">
        <defs><linearGradient id="loopGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb23f"/><stop offset="1" stop-color="#fe5d02"/></linearGradient></defs>
        <path class="loop-track" d="M260 60 A200 200 0 1 1 259.99 60"/>
        <path class="loop-progress" d="M260 60 A200 200 0 1 1 259.99 60"/>
        {nodes}
        <circle class="loop-spark" r="5" cx="260" cy="60" style="opacity:0"/>
      </svg>
      <div class="loop-center"><div><strong>We stay.</strong><span>Until your team owns it.</span></div></div>
    </div>
  </div>
  <div>
    <ol class="steps">{steps}</ol>
    <p class="loop-note">{icon("loop")}Improve, then go round again</p>
  </div>
</div>'''


def p_form(heading_id="book-title"):
    opts = "".join(f"<option>{s['name']}</option>" for s in SERVICES)
    err = icon("alert")
    return f'''<form class="form glass" id="bookForm" novalidate aria-labelledby="{heading_id}">
  <div class="err-summary" id="errSummary" tabindex="-1" role="alert"><h3>Check these before sending</h3><ul></ul></div>
  <div class="form-row">
    <div class="field"><label for="f-name">Your name<span class="req" aria-hidden="true">*</span></label>
      <input class="input" id="f-name" name="name" autocomplete="name" required aria-describedby="f-name-err">
      <p class="err" id="f-name-err">{err}<span></span></p></div>
    <div class="field"><label for="f-company">Company</label>
      <input class="input" id="f-company" name="company" autocomplete="organization"></div>
  </div>
  <div class="form-row">
    <div class="field"><label for="f-email">Work email<span class="req" aria-hidden="true">*</span></label>
      <input class="input" id="f-email" name="email" type="email" inputmode="email" autocomplete="email" required aria-describedby="f-email-hint f-email-err">
      <p class="hint" id="f-email-hint">For the Teams invite.</p>
      <p class="err" id="f-email-err">{err}<span></span></p></div>
    <div class="field"><label for="f-phone">WhatsApp or phone</label>
      <input class="input" id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+974" aria-describedby="f-phone-err">
      <p class="err" id="f-phone-err">{err}<span></span></p></div>
  </div>
  <fieldset class="field"><legend>I’d like</legend>
    <div class="seg"><input type="radio" name="kind" id="k-audit" value="A free audit" checked><label for="k-audit">A free audit</label>
    <input type="radio" name="kind" id="k-consult" value="A free consultation"><label for="k-consult">A free consultation</label></div>
  </fieldset>
  <div class="field"><label for="f-plan">What do you need?</label>
    <select class="input" id="f-plan" name="plan"><option>Not sure yet</option>{opts}</select></div>
  <div class="form-foot">
    <button class="btn btn-primary" type="submit"><span class="lbl">Book a free audit</span>{icon("arrow", "arrow")}</button>
    <p class="form-note">Opens WhatsApp with your details filled in. We reply with a Microsoft Teams invite.</p>
    <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
  </div>
</form>'''


def p_book(title_html="Forge your business <span class=\"t-hype\">hype.</span>", lead="A free audit or consultation, on Microsoft Teams."):
    return f'''<section class="section book" id="book" aria-labelledby="book-title">
  <div class="wrap book-grid">
    <div class="book-side" data-reveal>
      <h2 class="t-h1 t-forge" id="book-title">{title_html}</h2>
      <p class="lead">{lead}</p>
      {p_channels()}
    </div>
    <div data-reveal>{p_form()}</div>
  </div>
</section>'''


def p_channels():
    return f'''<ul class="channels">
        <li><a href="https://wa.me/{WHATSAPP}" target="_blank" rel="noopener"><span>{icon("chat")}</span>WhatsApp us</a></li>
        <li><a href="tel:{PHONE_TEL}"><span>{icon("phone")}</span>{PHONE_DISPLAY}</a></li>
        <li><a href="mailto:{EMAIL}"><span>{icon("mail")}</span>{EMAIL}</a></li>
        <li><a href="https://maps.google.com/?q=Doha,Qatar" target="_blank" rel="noopener"><span>{icon("pin")}</span>Doha, Qatar</a></li>
      </ul>'''


def p_cta(title="Forge your business <span class=\"t-hype\">hype.</span>", lead="Start with a free audit. We review your website, search presence and brand, then show you what to fix first.", plan=""):
    q = f"?need={plan.replace('&', '%26').replace(' ', '+')}" if plan else ""
    return f'''<section class="cta-band" aria-labelledby="cta-title">
  <div class="wrap" data-reveal>
    <h2 class="t-h1 t-forge" id="cta-title">{title}</h2>
    <p class="lead">{lead}</p>
    <div class="btn-row"><a class="btn btn-primary" href="{{{{root}}}}contact.html{q}">Book a free audit{icon("arrow", "arrow")}</a>
    <a class="btn btn-ghost" href="https://wa.me/{WHATSAPP}" target="_blank" rel="noopener">{icon("chat", "arrow")}WhatsApp us</a></div>
  </div>
</section>'''


def p_services_list():
    rows = []
    for s in SERVICES:
        badge = f'<span class="svc-badge">{s["badge"]}</span>' if s.get("badge") else ""
        rows.append(f'''<li class="svc-row" data-reveal><a class="svc-link" href="{{{{root}}}}services/{s["slug"]}.html">
      <span class="svc-name"><strong>{s["name"]}{badge}</strong><span>{s["tagline"]}</span></span>
      <span class="svc-desc">{s["short"].replace(" Our speciality.", "")}</span>
      <span class="svc-go" aria-hidden="true">{icon("arrow")}</span></a></li>''')
    return '<ul class="svc-list" data-stagger>' + "".join(rows) + "</ul>"


def p_service_cards(exclude=None):
    cards = []
    for s in SERVICES:
        if s["slug"] == exclude:
            continue
        cards.append(f'''<a class="svc-card" href="{{{{root}}}}services/{s["slug"]}.html" data-reveal>
    <span class="ico">{icon(s["icon"])}</span>
    <div><h3>{s["name"]}</h3><p class="tagline">{s["tagline"]}</p><p class="desc">{s["short"]}</p></div>
    <span class="more">See the service{icon("arrow")}</span></a>''')
    return '<div class="svc-cards" data-stagger>' + "".join(cards) + "</div>"


def p_included():
    items = [("Done by professionals", "Your whole process, handled end to end."),
             ("Stronger brand identity", "Every touchpoint reinforces who you are."),
             ("Stay ahead", "Keep pace in a fast-moving market."),
             ("No trial and error", "Skip the learning curve. Use what already works.")]
    lis = "".join(f'<li data-reveal><strong>{a}</strong><p>{b}</p></li>' for a, b in items)
    return f'''<div class="included">
  <h3 class="t-h3" data-reveal>What you get with every service.</h3>
  <ul class="included-grid" data-stagger>{lis}</ul>
</div>'''


def p_reel(images):
    slides = "".join(
        f'<div class="reel-slide" data-caption="<strong>{html.escape(c)}</strong><span>{html.escape(sub)}</span>">{photo(pid, alt, 600, 1280, "300px")}</div>'
        for pid, alt, c, sub in images)
    bars = "".join("<span><i></i></span>" for _ in images)
    ui = "".join(f"<i>{icon(n)}</i>" for n in ("heart", "chat", "send"))
    return f'''<div class="phone-stage">
  <div class="phone"><div class="phone-screen" data-reel aria-roledescription="carousel" aria-label="Sample reel">
    {slides}<div class="reel-bars" aria-hidden="true">{bars}</div>
    <div class="reel-ui" aria-hidden="true">{ui}</div>
    <div class="reel-caption" data-reel-caption aria-live="off"></div>
  </div></div>
  <div class="float-chip c1" aria-hidden="true"><span class="dot"></span><span>Delivered in <b>days</b></span></div>
  <div class="float-chip c2" aria-hidden="true">{icon("play")}<span><b class="num">10 → 60</b> videos a month</span></div>
  <button class="btn btn-ghost btn-sm reel-pause" type="button" data-reel-toggle aria-pressed="false">Pause reel</button>
</div>'''


REEL = [
    ("1552900651-9df588459a9e", "Camera operator under warm light", "One light. Deep blacks.", "Brand film"),
    ("1697649272441-be6e4a563e9b", "Phone on a tripod ready to record", "Made to stop the scroll.", "Reel"),
    ("1761701390353-923bf77e075f", "Vintage camera lit by warm light", "Show it. Sell it.", "Product demo"),
    ("1759393852314-59dc00faeed3", "Creator recording on a phone", "Real voices. Real trust.", "UGC"),
]


# ---------------------------------------------------------------- service page visuals
def viz(kind):
    if kind == "browser":
        return f'''<div class="viz" data-viz aria-hidden="true">
  <div class="viz-card v-browser v-anim"><div class="bar"><i></i><i></i><i></i><span>yourbrand.qa</span></div>
    <div class="page"><div class="v-blk h"></div><div class="v-blk" style="width:55%"></div><div class="v-blk o"></div><div class="v-blk img"></div>
    <div class="v-row"><div class="v-blk"></div><div class="v-blk"></div><div class="v-blk"></div></div></div></div>
  <div class="viz-card v-cart v-anim" style="--d:300">{icon("cart")}<span><b>New order</b>2 items, paid</span></div>
  <div class="viz-card v-meter v-anim" style="--d:500"><small>Mobile speed</small><b class="num" data-count="96">96</b><div class="track"><i></i></div></div>
</div>'''
    if kind == "reel":
        return p_reel(REEL)
    if kind == "search":
        return f'''<div class="viz" data-viz aria-hidden="true">
  <div class="viz-card v-search v-anim">{icon("search")}<span class="q"><span data-type="best catering company in Doha"></span><span class="caret"></span></span></div>
  <div class="viz-card v-results v-anim" style="--d:300">
    <div class="v-ai"><i></i><span>For events in Doha, people often recommend <b style="color:var(--text)">your business</b> for…</span></div>
    <div class="v-res is-you"><span class="u">yourbusiness.qa</span><span class="t">Your business, Doha</span><span class="l"></span></div>
    <div class="v-res"><span class="u">competitor.com</span><span class="t" style="color:var(--text-3)">Another result</span><span class="l" style="width:70%"></span></div>
    <div class="v-res"><span class="u">directory.qa</span><span class="t" style="color:var(--text-3)">Another result</span><span class="l" style="width:60%"></span></div>
  </div>
</div>'''
    if kind == "stack":
        return '''<div class="viz" data-viz aria-hidden="true"><div class="v-stack">
  <div class="v-layer l5">Brand guide</div>
  <div class="v-layer l4"><i style="background:#fe5d02"></i><i style="background:#fff7f0"></i><i style="background:#8d857e"></i><i style="background:#050505;box-shadow:inset 0 0 0 1px #444"></i></div>
  <div class="v-layer l3">Aa</div>
  <div class="v-layer l2">Packaging</div>
  <div class="v-layer l1"><img src="{{root}}assets/img/brand/logo.png" alt="" width="720" height="134"></div>
</div></div>'''
    if kind == "flow":
        return f'''<div class="viz" data-viz aria-hidden="true"><div class="v-flow">
  <svg viewBox="0 0 600 552" preserveAspectRatio="none">
    <path class="wire" d="M150 110 C 300 110, 300 276, 300 276"/><path class="wire" d="M150 442 C 300 442, 300 276, 300 276"/><path class="wire" d="M300 276 C 300 276, 450 276, 470 150"/><path class="wire" d="M300 276 C 300 276, 450 276, 470 410"/>
    <path class="pulse" d="M150 110 C 300 110, 300 276, 300 276 C 300 276, 450 276, 470 150"/>
    <path class="pulse d2" d="M150 442 C 300 442, 300 276, 300 276 C 300 276, 450 276, 470 410"/>
  </svg>
  <div class="viz-card v-node v-anim" style="top:14%;left:2%">{icon("receipt")}Invoice received</div>
  <div class="viz-card v-node v-anim" style="top:74%;left:2%;--d:150">{icon("calendar")}Booking request</div>
  <div class="viz-card v-node ai v-anim" style="top:45%;left:36%;--d:300">{icon("cpu")}AI checks &amp; routes</div>
  <div class="viz-card v-node ok v-anim" style="top:20%;right:2%;--d:450">{icon("check-circle")}Approved &amp; filed</div>
  <div class="viz-card v-node ok v-anim" style="top:68%;right:2%;--d:600">{icon("check-circle")}Confirmed to customer</div>
</div></div>'''
    if kind == "thread":
        return '''<div class="viz" data-viz aria-hidden="true"><div class="viz-card v-thread">
  <span class="v-status v-anim">ForgeHype support · online</span>
  <div class="v-msg me v-anim" style="--d:200">Can we add the new menu to the site before Friday?</div>
  <div class="v-msg v-anim" style="--d:500"><i></i><span>Done. It’s live, and the team has a 10-minute walkthrough for next time.</span></div>
  <div class="v-msg me v-anim" style="--d:800">How did last month compare?</div>
  <div class="v-msg v-anim" style="--d:1100"><i></i><span>Before vs after report is in your inbox. Two quick wins inside.</span></div>
</div></div>'''
    return ""


# ---------------------------------------------------------------- page chrome
def nav_items(active):
    items = [("services", "services/index.html", "Services"), ("work", "work.html", "Work"), ("about", "about.html", "About"), ("contact", "contact.html", "Contact")]
    mega = "".join(f'<a href="{{{{root}}}}services/{s["slug"]}.html"><strong>{s["name"]}</strong><span>{s["tagline"]}</span></a>' for s in SERVICES)
    out = []
    for key, href, label in items:
        cur = ' aria-current="page"' if key == active else ""
        if key == "services":
            out.append(f'''<li class="has-mega"><a href="{{{{root}}}}{href}"{cur}>{label}</a>
          <button class="mega-toggle" type="button" aria-expanded="false" aria-controls="mega" aria-label="Show all services">{icon("chevron")}</button>
          <div class="mega" id="mega">{mega}</div></li>''')
        else:
            out.append(f'<li><a href="{{{{root}}}}{href}"{cur}>{label}</a></li>')
    return "".join(out)


def header(active):
    menu_links = [("index.html", "Home"), ("services/index.html", "Services"), ("work.html", "Work"), ("about.html", "About"), ("contact.html", "Contact")]
    mlis = "".join(f'<li><a href="{{{{root}}}}{h}">{t}</a></li>' for h, t in menu_links)
    msvc = "".join(f'<a href="{{{{root}}}}services/{s["slug"]}.html">{s["name"]}</a>' for s in SERVICES)
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="wrap header-inner">
    <a class="brand" href="{{{{root}}}}index.html" aria-label="ForgeHype home"><img src="{{{{root}}}}assets/img/brand/logo.png" width="720" height="134" alt="ForgeHype"></a>
    <nav class="nav" aria-label="Main"><ul>{nav_items(active)}</ul></nav>
    <a class="btn btn-primary btn-sm header-cta" href="{{{{root}}}}contact.html">Book a free audit</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span class="bars" aria-hidden="true"></span>Menu</button>
  </div>
</header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="menu-top"><img src="{{{{root}}}}assets/img/brand/logo.png" width="130" height="24" alt="ForgeHype" style="width:130px;height:auto"><button class="menu-close" type="button">Close</button></div>
  <nav aria-label="Mobile"><ul class="t-forge">{mlis}</ul>
    <div class="menu-sub">{msvc}</div></nav>
  <a class="btn btn-primary" href="{{{{root}}}}contact.html">Book a free audit</a>
</div>'''


def footer():
    svc = "".join(f'<li><a href="{{{{root}}}}services/{s["slug"]}.html">{s["name"]}</a></li>' for s in SERVICES)
    return f'''<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand"><img src="{{{{root}}}}assets/img/brand/logo.png" width="720" height="134" alt="ForgeHype" loading="lazy"><p>Forge your business hype. Digital presence and media production from Doha, for Qatar, the UAE and beyond.</p></div>
      <div class="footer-col"><h2>Services</h2><ul>{svc}</ul></div>
      <div class="footer-col"><h2>Company</h2><ul><li><a href="{{{{root}}}}work.html">Work</a></li><li><a href="{{{{root}}}}about.html">About</a></li><li><a href="{{{{root}}}}index.html#faq">FAQ</a></li><li><a href="{{{{root}}}}contact.html">Book a free audit</a></li></ul></div>
      <div class="footer-col"><h2>Contact</h2><ul><li><a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></li><li><a href="mailto:{EMAIL}">{EMAIL}</a></li><li><a href="https://wa.me/{WHATSAPP}" target="_blank" rel="noopener">WhatsApp us</a></li><li><a href="https://maps.google.com/?q=Doha,Qatar" target="_blank" rel="noopener">Doha, Qatar</a></li></ul></div>
    </div>
    <div class="footer-mark" aria-hidden="true"><img src="{{{{root}}}}assets/img/brand/logo-large.png" width="1600" height="298" alt="" loading="lazy"></div>
    <div class="footer-base"><span>© <span data-year>2026</span> ForgeHype. Doha, Qatar.</span><a href="#main">Back to top</a></div>
  </div>
</footer>
<a class="wa-float" href="https://wa.me/{WHATSAPP}" target="_blank" rel="noopener" aria-label="WhatsApp us">{icon("chat")}<span class="lbl">WhatsApp us</span></a>'''


ORG_LD = {
    "@context": "https://schema.org", "@type": "ProfessionalService", "name": "ForgeHype", "url": SITE + "/",
    "logo": SITE + "/assets/img/brand/logo.png", "image": SITE + "/assets/img/og.jpg",
    "description": "Digital presence and media production agency in Doha: websites and e-commerce, media production, search and AI visibility, brand media kits, AI automation and monthly support.",
    "telephone": PHONE_TEL, "email": EMAIL,
    "address": {"@type": "PostalAddress", "addressLocality": "Doha", "addressCountry": "QA"},
    "areaServed": [{"@type": "Country", "name": "Qatar"}, {"@type": "Country", "name": "United Arab Emirates"}, "Worldwide"],
    "sameAs": [],
}


def page(meta, body):
    depth = meta["path"].count("/")
    # The 404 page can be served at any URL depth, so it uses root-absolute paths.
    root = "/" if meta["path"] == "404.html" else "../" * depth
    canonical = SITE + "/" + ("" if meta["path"] == "index.html" else meta["path"])
    title = meta["title"]
    desc = meta["description"]
    ld = [ORG_LD] if meta["path"] == "index.html" else []
    if meta.get("ld"):
        ld.append(meta["ld"])
    ld_html = "".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    importmap = ""
    ribbon = ""
    if meta.get("ribbon"):
        importmap = f'<script type="importmap">{{"imports":{{"three":"{THREE}/build/three.module.min.js","three/addons/":"{THREE}/examples/jsm/"}}}}</script>'
        ribbon = f'<script type="module" src="{root}assets/js/ribbon.js"></script>'
    robots = '<meta name="robots" content="noindex">' if meta.get("noindex") else ""
    doc = f'''<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
{robots}<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#050505">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ForgeHype">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE}/assets/img/og.jpg">
<meta property="og:locale" content="en_QA">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{root}assets/img/brand/icon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{root}assets/img/brand/icon-180.png">
<link rel="manifest" href="{root}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="{root}assets/css/main.css">
<script>(function(d){{d.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){{d.classList.add('motion');setTimeout(function(){{if(!window.__fh)d.classList.remove('motion')}},3000)}}}})(document.documentElement)</script>
{importmap}{ld_html}
</head>
<body>
{header(meta.get("nav", ""))}
<main id="main">
{body}
</main>
{footer()}
<script src="{root}assets/js/main.js" defer></script>
{ribbon}
</body>
</html>
'''
    return doc.replace("{{root}}", root)


# ---------------------------------------------------------------- templating for page fragments
def expand(text):
    def sub(m):
        kind, _, arg = m.group(1).partition(":")
        if kind == "icon":
            name, _, cls = arg.partition("|")
            return icon(name, cls)
        if kind == "photo":
            parts = arg.split("|")
            pid, alt = parts[0], parts[1]
            w, h = (int(x) for x in (parts[2] if len(parts) > 2 and parts[2] else "800x1000").split("x"))
            sizes = parts[3] if len(parts) > 3 and parts[3] else "(min-width: 900px) 33vw, 50vw"
            return photo(pid, alt, w, h, sizes, eager=len(parts) > 4 and parts[4] == "eager")
        if kind == "faq":
            return p_faq(arg.split(",") if arg else list(FAQ))
        if kind == "process":
            return p_process()
        if kind == "compare":
            return p_compare()
        if kind == "clients":
            return p_clients()
        if kind == "form":
            return p_form()
        if kind == "book":
            return p_book()
        if kind == "channels":
            return p_channels()
        if kind == "cta":
            return p_cta()
        if kind == "services-list":
            return p_services_list()
        if kind == "service-cards":
            return p_service_cards()
        if kind == "included":
            return p_included()
        if kind == "reel":
            return p_reel(REEL)
        if kind == "whatsapp":
            return WHATSAPP
        if kind == "root":
            return "{{root}}"
        raise KeyError(f"Unknown placeholder {m.group(0)}")
    return re.sub(r"\{\{([a-z-]+(?::[^}]*)?)\}\}", sub, text)


def service_page(s):
    inc = "".join(f'<li class="feature" data-reveal><span class="ico">{icon(i)}</span><h3>{t}</h3><p>{d}</p></li>' for i, t, d in s["included"])
    symptoms = "".join(f'<li>{icon("x")}<span>{x}</span></li>' for x in s["symptoms"])
    proof = ""
    if s.get("proof"):
        proof = f'<div class="panel glass" data-reveal style="margin-block-start:var(--s-7)"><p class="kicker" style="margin-block-end:var(--s-3)">Built by ForgeHype</p><p style="font-size:var(--fs-lead);line-height:1.5;max-width:52ch">{s["proof"]}</p></div>'
    media_extra = ""
    if s["slug"] == "media-production":
        media_extra = f'''<section class="section" aria-labelledby="vol-title" style="padding-block-start:0">
  <div class="wrap split">
    <div class="stack-sm" data-reveal><h2 class="t-h2 t-forge" id="vol-title">Content on <span class="t-hype">autopilot.</span></h2>
      <p class="lead">Your volume, your price. From 10 to 60 videos a month. Scale as you grow.</p>
      <ul class="checks" style="margin-block-start:var(--s-6)"><li>{icon("check")}Aligned before we shoot. Fewer revisions.</li><li>{icon("check")}One standard. Quality holds at volume.</li><li>{icon("check")}Lean team. AI-powered. Fast.</li></ul></div>
    <div class="panel volume" data-volume data-reveal>
      <div class="volume-readout"><b class="num" data-volume-out>30</b><span class="muted">videos a month</span></div>
      <div class="volume-scale" aria-hidden="true"></div>
      <label class="sr-only" for="vol">Videos a month</label>
      <input id="vol" type="range" min="10" max="60" step="5" value="30">
      <p class="muted" style="font-size:var(--fs-sm)">Drag to see the range. We shape the mix of formats with you.</p>
    </div>
  </div>
</section>'''
    others = "".join(
        f'<a class="link" href="{x["slug"]}.html">{x["name"]}{icon("arrow-up-right")}</a>' for x in SERVICES if x["slug"] != s["slug"])
    plan_q = s["name"].replace("&", "%26").replace(" ", "+")
    ld = {"@context": "https://schema.org", "@type": "Service", "name": s["name"], "description": s["short"],
          "provider": {"@type": "ProfessionalService", "name": "ForgeHype", "url": SITE + "/"},
          "areaServed": ["Qatar", "United Arab Emirates"], "url": f"{SITE}/services/{s['slug']}.html"}
    body = f'''<section class="page-hero" aria-labelledby="h1">
  <div class="wrap page-hero-grid">
    <div>
      <ol class="crumbs"><li><a href="index.html">Services</a></li><li aria-current="page">{s["name"]}</li></ol>
      <p class="tag" style="margin-block-end:var(--s-5)">{s["name"]}</p>
      <h1 class="t-h1 t-forge is-sentence" id="h1">{s["fix"]}</h1>
      <p class="lead">{s["short"]}</p>
      <div class="btn-row"><a class="btn btn-primary" href="../contact.html?need={plan_q}">Book a free audit{icon("arrow", "arrow")}</a>
      <a class="btn btn-ghost" href="https://wa.me/{WHATSAPP}?text={("Hi ForgeHype, I need help with: " + s["name"]).replace(" ", "%20").replace("&", "%26")}" target="_blank" rel="noopener">Ask on WhatsApp</a></div>
    </div>
    <div>{viz(s["viz"])}</div>
  </div>
</section>

<section class="section" aria-labelledby="problem-title" style="padding-block-start:0">
  <div class="wrap split">
    <figure class="media-frame wide" data-reveal style="margin:0"><div class="grade">{photo(s["photo"][0], s["photo"][1], 1200, 750, "(min-width: 960px) 50vw, 100vw")}</div></figure>
    <div class="stack-sm" data-reveal>
      <p class="kicker">Sounds familiar?</p>
      <h2 class="t-h2 t-forge" id="problem-title">{s["problem"]}.</h2>
      <ul class="checks muted" style="margin-block-start:var(--s-5)">{symptoms.replace(icon("x"), icon("x"))}</ul>
      <p style="margin-block-start:var(--s-5);font-weight:560">{s["fix"]}</p>
    </div>
  </div>
</section>

<section class="section is-light" aria-labelledby="inc-title">
  <div class="wrap">
    <div class="section-head" data-reveal><h2 class="t-h2 t-forge" id="inc-title">What’s <span class="t-hype">included.</span></h2>
      <p class="lead">We shape the scope with you after the free audit. These are the building blocks.</p></div>
    <ul class="grid-3" data-stagger style="list-style:none">{inc}</ul>
    {proof}
  </div>
</section>
{media_extra}
<section class="section" aria-labelledby="how-title">
  <div class="wrap">
    <div class="section-head" data-reveal><h2 class="t-h2 t-forge" id="how-title">We build. We guide. <span class="t-hype">We stay.</span></h2></div>
    {p_process()}
  </div>
</section>

<section class="section" aria-labelledby="faq-title" style="padding-block-start:0">
  <div class="wrap faq">
    <div data-reveal><h2 class="t-h2 t-forge" id="faq-title">Quick <span class="t-hype">answers.</span></h2></div>
    <div data-reveal>{p_faq(["audit", "cost", "support", "what"])}</div>
  </div>
</section>

<section class="section" aria-labelledby="more-title" style="padding-block-start:0">
  <div class="wrap">
    <h2 class="t-h3" id="more-title" data-reveal>Pick one service or all six.</h2>
    <div class="btn-row" style="margin-block-start:var(--s-4);gap:var(--s-2) var(--s-5)" data-reveal>{others}</div>
  </div>
</section>
{p_cta(plan=s["name"])}'''
    meta = {"path": f"services/{s['slug']}.html", "nav": "services",
            "title": f"{s['name']} in Qatar | ForgeHype",
            "description": f"{s['short']} {s['tagline']} ForgeHype, Doha.".replace(" Our speciality.", ""), "ld": ld}
    return meta, body


def main():
    pages = []
    for f in sorted((HERE / "pages").glob("*.html")):
        raw = f.read_text(encoding="utf-8")
        m = re.match(r"<!--meta\s*(\{.*?\})\s*-->\s*", raw, re.S)
        meta = json.loads(m.group(1))
        pages.append((meta, expand(raw[m.end():])))
    for s in SERVICES:
        pages.append(service_page(s))
    for meta, body in pages:
        out = OUT / meta["path"]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page(meta, body), encoding="utf-8")
        print("wrote", meta["path"])
    urls = [m["path"] for m, _ in pages if not m.get("noindex")]
    sm = "".join(f"<url><loc>{SITE}/{'' if u == 'index.html' else u}</loc></url>" for u in urls)
    (OUT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{sm}</urlset>\n', encoding="utf-8")
    print("wrote sitemap.xml")


if __name__ == "__main__":
    main()
