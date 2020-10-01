import {
  clamp,
  getIndex,
  mapNRange,
  array,
  mapRange,
  lerp,
  dist,
} from "./utils.js";
import friction from "./friction.js";
import spring from "./spring.js";
import tracker from "./tracker.js";
import decay from "./decay.js";

const card = document.querySelector(".card");

const cardPositionX = tracker({ value: 0 });
const cardPositionY = tracker({ value: 0 });

const mouse = { down: false, sx: 0, sy: 0, dx: 0, dy: 0 };

function project(initialVelocity = 0, decelerationRate = 0.998) {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

// TODO: Refactor to pass around moton value vs. manually
// transitionaling velocity and momenume etc.

const corners = applyGutter(100, [
  [0, 0],
  [0, window.innerWidth],
  [window.innerWidth, window.innerHeight],
  [0, window.innerHeight],
]);

// offset  assumng top left clockwise.
function applyGutter(gutter = 100, corners) {
  return [
    [corners[0][0] + gutter, corners[0][1] + gutter],
    [corners[1][0] - gutter, corners[1][1] + gutter],
    [corners[2][0] - gutter, corners[2][1] - gutter],
    [corners[3][0] + gutter, corners[3][1] - gutter],
  ];
}

const cardPosition = corners[0];

function nearestCorner(position) {
  const { index } = corners.reduce(
    (nearest, currCorner, currIndex) => {
      const currDist = dist(currCorner, position);

      return currDist < nearest.dist
        ? { index: currIndex, dist: currDist }
        : { index: nearest.index, dist: nearest.dist };
    },
    { index: 0, dist: Infinity }
  );

  return index;
}

window.addEventListener("mousedown", (e) => {
  if (e.target !== card) return;

  if (pipSpring !== null) {
    cardPosition[0] = pipSpring[0].get();
    cardPosition[1] = pipSpring[1].get();

    pipSpring = null;
  }

  mouse.down = true;
  mouse.sx = e.pageX;
  mouse.sy = e.pageY;
});

window.addEventListener("mousemove", (e) => {
  if (mouse.down) {
    mouse.dx = e.pageX - mouse.sx;
    mouse.dy = e.pageY - mouse.sy;

    mouseTrackX.setValue(mouse.dx);
    mouseTrackY.setValue(mouse.dy);
  }
});

let pipSpring = null;
window.addEventListener("mouseup", () => {
  mouse.down = false;
  cardPosition[0] += mouseTrackX.getValue();
  cardPosition[1] += mouseTrackY.getValue();

  const projectedPos = [
    cardPosition[0] + project(mouseTrackX.getVelocity()),
    cardPosition[1] + project(mouseTrackY.getVelocity()),
  ];

  const cornerIndex = nearestCorner(projectedPos);
  const projectedCorner = corners[cornerIndex];

  pipSpring = [
    spring({ velocity: mouseTrackX.getVelocity(), value: cardPosition[0] }),
    spring({ velocity: mouseTrackY.getVelocity(), value: cardPosition[1] }),
  ];

  pipSpring[0].set(projectedCorner[0]);
  pipSpring[1].set(projectedCorner[1]);

  mouseTrackX.setValue(0);
  mouseTrackY.setValue(0);
});

function tick() {
  requestAnimationFrame(tick);

  card.style.transform = `translate(
    ${cardPositionX.getValue()}px,
    ${cardPositionY.getValue()}px
  )`;
}

requestAnimationFrame(tick);
