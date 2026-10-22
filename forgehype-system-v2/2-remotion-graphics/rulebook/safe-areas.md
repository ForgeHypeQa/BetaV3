# Safe Areas (proposed, verify with one real upload per platform)

Primary platforms: Instagram and Meta (Facebook) Reels, vertical 9:16. YouTube Shorts and long form are secondary and use the same values unless the owner asks otherwise.

Build to the stricter value. All text, logos and key UI sit inside the content box. Backgrounds may bleed to the edges.

## Vertical 9:16, 1080x1920 (Instagram Reels, Facebook Reels, YouTube Shorts)
| Zone | Size |
|---|---|
| Top | 250px |
| Bottom | 420px (captions, channel name, buttons) |
| Left | 80px |
| Right | 140px (like, comment, share) |

Content box: x 80-940, y 250-1500.

## Horizontal 16:9, 1920x1080 (YouTube long form)
| Zone | Size |
|---|---|
| Top | 60px |
| Bottom | 140px (progress bar, subtitles) |
| Left and right | 100px |
| Last 20 seconds | keep the bottom-right clear for end screens |

Content box: x 100-1820, y 60-940.

QA rejects any text, logo or key UI element whose bounding box leaves the content box.
