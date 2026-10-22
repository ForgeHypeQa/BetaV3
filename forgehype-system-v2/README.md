# Brand and Video System v2.0

Two shared systems. Every department reads the same files.

```
/Shared
  /1-brand-identity-kit            <- one folder per brand, read-only for everyone except the owner
    /<brand>
      00-overview.md
      01-audience-and-pain-points.md
      02-brand-guidelines.md
      03-voice-and-messaging.md
      04-visual-identity.md
      05-seo-and-keywords.md
      06-website-and-app-guidelines.md
      07-lead-generation.md
      theme.ts
      /logos  (light-theme logo, dark-theme logo)
      changelog.md
  /2-remotion-graphics
    /<company>
      /<project>
        /assets
          logo-light.*  logo-dark.*  brand.md  theme.ts
          design-rulebook.md  motion-rulebook.md  audio-rulebook.md
          safe-areas.md  scene-library.md  output-and-qa.md  approved-style.md
        /script  (SRT, voiceover)
        /director-sheet
        /scene-images
        /preview
        /final
```

## Who uses what
| Team | Reads |
|---|---|
| Media / video | Kit 02, 03, 04 + Remotion rulebooks |
| Website / app | Kit 02, 04, 06 |
| SEO / content | Kit 01, 03, 05 |
| Leads / sales | Kit 01, 03, 07 |
| Research | Owns the brand engine run (see brand-engine-prompt.md) |

Rule: the kit is the single source. Project `assets` are copies from the kit and are never edited inside a project. Changes go to the kit owner, then the kit version is bumped.

## Video build process (6 gates)
0. **Intake form:** one numbered document. Claude fills proposals, you mark changes in one pass.
1. **Director sheet (short):** per scene, the message and a text description of the image only, plus which pain point it connects to. Approve.
2. **Scene images:** 3-4 stills that express the scene, rendered from the real components. Approve.
3. **Audio:** Claude finalises voiceover and SFX plan and asks for confirmation.
4. **Motion:** Claude finalises timing and motion and asks for confirmation.
5. **Output choice:** Claude asks whether to render one short segment first or the full video.

**Interrupt rule:** any message from you stops auto mode. Claude applies it, restates the plan in one line and re-confirms before continuing.
