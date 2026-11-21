// The differences between the two panels. Each one names a spot in panel-local
// coordinates (the panel is 560x460), a click radius, and a short label shown
// when it is found. A round uses the first N entries, so round 1 hides six
// changes, round 2 eight, and round 3 all ten.
export const DIFFERENCES = [
  { id: 'bird', x: 285, y: 96, r: 20, label: 'A bird flew away' },
  { id: 'bowtie', x: 118, y: 366, r: 16, label: "The cat lost its bow tie" },
  { id: 'steam', x: 252, y: 322, r: 18, label: 'The teapot stopped steaming' },
  { id: 'bloom', x: 282, y: 310, r: 16, label: 'A flower changed colour' },
  { id: 'beam', x: 455, y: 158, r: 24, label: 'The lighthouse beam went dark' },
  { id: 'bulb', x: 280, y: 45, r: 14, label: 'A fairy light went out' },
  { id: 'cup', x: 332, y: 366, r: 16, label: 'A teacup vanished' },
  { id: 'rays', x: 468, y: 68, r: 34, label: 'The sun lost its rays' },
  { id: 'cushion', x: 116, y: 393, r: 18, label: 'The cushion changed colour' },
  { id: 'sprout', x: 488, y: 390, r: 16, label: 'A sprout went missing' },
];

/** The differences hidden in round `index` (0-based). */
export function diffsForRound(index) {
  const count = [6, 8, 10][index] ?? 6;
  return DIFFERENCES.slice(0, count);
}

/** Hit-test a panel-local point against the round's unfound differences. */
export function pickDifference(diffs, found, x, y) {
  for (const diff of diffs) {
    if (found.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) return diff;
  }
  return null;
}
