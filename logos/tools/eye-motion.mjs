// The isotype's motion, "look and blink": the eye glances up-right, then down-left (the ring's gap axis), returns,
// and blinks along the same diagonal. One timeline feeds the GIF/MP4 renders (logos/anim/gen.mjs), the animated SVGs
// of the brand kit and the site's CSS (src/styles/brand-motion.css).

// [time in s, state, easing used to reach it]. dx/dy move the pupil, rot turns the ring, lid closes the eye (0 → 1).
export const LOOK = {
  dur: 4.0,
  keys: [
    [0, {}], [0.6, {}],
    [0.85, { dx: 22, dy: -22, rot: 6 }, "inOut"], [1.45, { dx: 22, dy: -22, rot: 6 }],
    [1.8, { dx: -22, dy: 22, rot: -6 }, "inOut"], [2.4, { dx: -22, dy: 22, rot: -6 }],
    [2.65, { dx: 0, dy: 0, rot: 0 }, "inOut"], [2.75, {}],
    [2.84, { lid: 1 }, "in"], [2.88, { lid: 1 }], [3.03, { lid: 0 }, "back"],
    [4.0, {}],
  ],
};
export const DIAG = 45;
// Closed eye: the pupil flattens to 17 % along the diagonal and widens 14 %; the ring squashes 8 % across it.
export const CLOSED = { pupil: [1.14, 0.17], ring: [1.03, 0.92] };

const BEZIER = {
  lin: "linear",
  in: "cubic-bezier(0.32, 0, 0.67, 0)",
  out: "cubic-bezier(0.33, 1, 0.68, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  back: "cubic-bezier(0.34, 1.7, 0.64, 1)",
};

const n = (v) => +v.toFixed(3);
const pupilT = ({ dx = 0, dy = 0, lid = 0 }) => {
  const sx = 1 + (CLOSED.pupil[0] - 1) * lid, sy = 1 + (CLOSED.pupil[1] - 1) * lid;
  return `translate(${n(dx)}px, ${n(dy)}px) rotate(${-DIAG}deg) scale(${n(sx)}, ${n(sy)}) rotate(${DIAG}deg)`;
};
const ringT = ({ rot = 0, lid = 0 }) => {
  const sx = 1 + (CLOSED.ring[0] - 1) * lid, sy = 1 + (CLOSED.ring[1] - 1) * lid;
  return `rotate(${n(rot)}deg) rotate(${-DIAG}deg) scale(${n(sx)}, ${n(sy)}) rotate(${DIAG}deg)`;
};

// CSS for an SVG whose ring group has class `ns-ring` and whose pupil has class `ns-pupil`.
// `period` stretches the rest time after the blink (the motion itself keeps its speed).
export function motionCss({ period = LOOK.dur, scope = "", name = "ns-look" } = {}) {
  const frames = (fn) => LOOK.keys.map(([t, s], i) => {
    const next = LOOK.keys[i + 1];
    const ease = next ? BEZIER[next[2] || "lin"] : "linear";
    return `  ${n((t / period) * 100)}% { transform: ${fn(s)}; animation-timing-function: ${ease}; }`;
  }).join("\n") + (period > LOOK.dur ? `\n  100% { transform: ${fn({})}; }` : "");
  return `@keyframes ${name}-pupil {\n${frames(pupilT)}\n}\n@keyframes ${name}-ring {\n${frames(ringT)}\n}\n` +
    `${scope} .ns-pupil, ${scope} .ns-ring { transform-box: fill-box; transform-origin: center; }\n` +
    `${scope} .ns-pupil { animation: ${name}-pupil ${period}s infinite; }\n` +
    `${scope} .ns-ring { animation: ${name}-ring ${period}s infinite; }\n` +
    `@media (prefers-reduced-motion: reduce) { ${scope} .ns-pupil, ${scope} .ns-ring { animation: none; } }\n`;
}
