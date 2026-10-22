# Output and QA

## Output
- Render directly from Remotion. No CapCut export, no watermark, no letterbox bars.
- Canvas: 1080x1920 at 30fps for vertical; 1920x1080 for YouTube long form.
- MP4 (H.264) with the voiceover embedded.
- Naming: `<company>_<project>_<platform>_v1.mp4`.
- Previews at half size.

## QA checks (any failure blocks the render)
1. No text, logo or key UI outside the content box
2. Only colors, fonts and logo files from the assets folder
3. Layout, scene length (5-6s) and holds follow the design and motion rulebooks
4. Only allowed motion presets are used
5. Mode pattern follows design-rulebook.md
6. Text matches the script, including Bengali
7. Entrances sync to the SRT within 6 frames
8. Audio follows audio-rulebook.md
9. No UI blends into its background at phone size
10. Output size, frame rate and file name are correct

Claude shows the QA table with the preview.
