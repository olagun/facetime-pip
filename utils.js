const clamp = (a, b, t) => Math.max(a, Math.min(b, t));
const lerp = (a, b, t) => (1 - t) * a + b * t;
const mapRange = ([a, b], [c, d], t) => ((d - c) / (b - a)) * (t - a) + c;

const mapNRange = (a, b, t) => {
  let index = 0;

  for (let i = 0; i < a.length - 1; i++) {
    if (
      (t >= a[i] && t <= a[i + 1]) ||
      t < a[i] ||
      (t > a[i + 1] && i == a.length - 2)
    ) {
      index = i;
      break;
    }
  }
  return mapRange([a[index], a[index + 1]], [b[index], b[index + 1]], t);
};

function array(length, transform = (a) => a) {
  return Array.from({ length }).map(transform);
}
function round(value, toNearest = 1) {
  return Math.round(value / toNearest) * toNearest;
}

function getIndex(value, indexWidth) {
  return Math.round(Math.round(value / indexWidth));
}

function dist([x1, y1], [x2, y2]) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export { clamp, mapNRange, mapRange, lerp, round, getIndex, array, dist };
