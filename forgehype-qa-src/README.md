# ForgeHype.qa website

Two folders:

- `forgehype-qa/` is the website. Plain HTML, CSS and JavaScript. Upload the whole folder to any host (Netlify, Vercel, Cloudflare Pages or cPanel). No build step and no server code.
- `forgehype-qa-src/` holds the page sources and `build.py`. Don't upload it.

## Editing

- **Shared parts** (header, footer, services list, FAQ answers, the six service pages, contact details): edit `build.py`, then run `python build.py`. This rewrites the `.html` files in `forgehype-qa/`.
- **Page content** for Home, Services overview, Work, About, Contact and 404: edit `pages/*.html`, then run `python build.py`.
- **Styles**: `forgehype-qa/assets/css/main.css`. Colours, type and motion are tokens at the top.
- **Interactions**: `forgehype-qa/assets/js/main.js`. The hero's 3D ribbon is `ribbon.js`.

You can also edit the generated `.html` files directly, but those edits are overwritten the next time `build.py` runs.

## Booking form

The form checks the fields, then opens WhatsApp (+974 5587 9325) with the visitor's details filled in, the same as v9. To send people to a Microsoft Bookings or Teams scheduling page instead, paste that link into `TEAMS_URL` at the top of `assets/js/main.js`.

## Before going live

1. **Replace the stock photos.** All photos except the camera operator are free Unsplash images, loaded from Unsplash's CDN as mood imagery. Swap them for real ForgeHype shoots by searching `build.py` and `pages/*.html` for `photo:` / `photo(`.
2. **Confirm the copy.** Text from v9 is kept as written. These are new and need your check:
   - each service page's "Sounds familiar?" points and "What's included" items
   - the About page's "We've sat in your chair" paragraph and the market notes
   - the Work page pipeline
   - the FAQ answer "Do you only work in Qatar?"
   - the AI and automation page note about the delivery-business apps, which comes from the brand kit
3. **Logo files.** The logos in `assets/img/brand/` were cut out of the brand kit PNGs. Transparent SVG originals would be sharper.
4. **Domain.** Canonical URLs, the sitemap and social preview tags all point to `https://forgehype.qa`.

## Arabic later

The layout uses direction-neutral CSS throughout. An Arabic version needs `lang="ar" dir="rtl"` on `<html>`, translated copy, and an Arabic font such as IBM Plex Sans Arabic, which `main.css` already swaps in for `:lang(ar)`.
