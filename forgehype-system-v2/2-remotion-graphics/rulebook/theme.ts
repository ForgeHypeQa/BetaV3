// theme.ts: generated from the Brand Identity Kit (04-visual-identity.md). Never hardcode values in components.
// Values marked TBC are approximations pending owner confirmation.

export const THEME_VERSION = "2.0";

export const palettes = {
  dark: {
    background: "#0A0A0A",
    backgroundGlow: "rgba(255,90,0,0.12)", // soft glow at the top
    surface: "#161412",
    border: "rgba(255,255,255,0.10)",
    text: "#FFFFFF",
    mutedText: "#8F8A85",
    accent: "#FE5D02", // sampled from the lockup sheet, TBC exact value
    accentEnd: "#FFB23F", // TBC
  },
  light: {
    background: "#FFF7F0",
    backgroundGlow: "rgba(255,178,63,0.18)",
    surface: "#FFFFFF",
    border: "#E8DFD6",
    text: "#111111",
    mutedText: "#7A726B",
    accent: "#FE5D02", // same accent in both modes
    accentEnd: "#FFB23F", // TBC
  },
} as const;

export const logos = {
  dark: "primary", // orange Forge + white Hype
  light: "mono", // all black
  onOrange: "reversed", // all white
} as const;

export const fonts = {
  headline: "Anton", // TBC exact condensed heavy sans
  body: "Inter",
  bengali: "Hind Siliguri",
} as const;

export const formats = {
  vertical: { width: 1080, height: 1920, fps: 30, safe: { top: 250, bottom: 420, left: 80, right: 140 } },
  horizontal: { width: 1920, height: 1080, fps: 30, safe: { top: 60, bottom: 140, left: 100, right: 100 } },
} as const;

export const type = {
  headlineMax: 150,
  headlineMin: 90,
  bengaliMin: 100,
  bodyMin: 40,
} as const;

export const timing = {
  sceneMin: 150,
  sceneMax: 180,
  entrance: 18,
  swap: 12,
  exit: 12,
  modeDissolve: 15,
  minHold: 60,
  stagger: 6,
  preRoll: 6,
} as const;

export const motion = {
  easing: [0.22, 1, 0.36, 1], // single curve for everything
  rise: 24, // px
  allowed: ["fadeRise", "crossfadeSwap", "fadeOut", "barFill", "countUp"],
} as const;

export const audio = {
  voiceover: 1.0,
  sfx: 0.15,
  maxSfxPerSceneChange: 1,
  maxSfxFiles: 3,
  music: 0.0, // off by default
} as const;

export const modeRules = {
  maxConsecutiveSameMode: 3,
  openAndCloseSameMode: true,
} as const;
