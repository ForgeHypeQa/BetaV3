# Design Rulebook

## 1. One standard layout per scene
Each scene of 5-6 seconds uses one fixed layout. Only these may change during the scene: the keyword, one icon, one image, or one UI state. Everything else stays still so the viewer can focus on the keyword.

Zones inside the content box (9:16), the same in every scene:
| Zone | Share of height | Content |
|---|---|---|
| Label (optional) | 5% | One short label |
| Headline | 25% | Max 2 lines, one orange keyword |
| Visual | 55% | Phone, card, bar, icon or image |
| Caption | 15% | One short line |

## 2. Text
- Headline: condensed heavy, uppercase for English; max 2 lines; 110-150px, auto-fit down to 90px.
- Body and caption: clean sans, 40px or larger.
- Bengali: Hind Siliguri bold, 100px or larger, auto-fit, letterSpacing 0, split at spaces only.
- Text must never leave the content box. If it does not fit, shorten the text. Never shrink below the minimum.
- Show key phrases, not the whole narration. Never invent numbers or facts.

## 3. Color and mode
- Colors only from `theme.ts`. Accent orange is the only color shared by both modes.
- Product screenshots are shown unaltered.
- Mode by meaning: dark for pain, emotion and demo; light for numbers, proof and "how it works". Max 3 scenes in a row in one mode; open and close in the same mode.

## 4. Separation of UI from the background
- Dark background: dark UI surfaces (slightly lighter than the background) with a 1px light hairline and a soft shadow.
- Light background: white surface with a visible shadow, and a darker device outline.
- Check each still: the UI must be clearly visible against the background at phone size.

## 5. Logo
Official files only, from the kit's `/logos`. Never stretch, recolor, retype or add lines such as "Qatar" unless the kit has that lockup.
- Dark scene: Primary (orange Forge, white Hype).
- Light scene: Mono (all black).
- Orange background: Reversed (all white).
- Opening reveal and end card use the same lockup for the scene's mode.

## 5a. Product screens
- Customer panel in dark scenes, driver and admin panels in light scenes. The 3-device reveal may show all three on dark.
- Crop to the phone only and show it unaltered. See the kit's `product-screens.md`.
- Names and numbers in screens are demo data. Never quote them as real results.

## 6. Icons and imagery
One stroke weight, neutral color, orange only for emphasis. No stock photos unless supplied.
