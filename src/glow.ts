import glowSource from "./GLOW/build/GLOW.js?raw";

export const GLOW = new Function(`${glowSource}\nreturn GLOW;`)();
