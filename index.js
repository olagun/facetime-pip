import { clamp, getIndex, mapNRange, array, mapRange, lerp } from "./utils.js";
import friction from "./friction.js";
import spring from "./spring.js";
import tracker from "./tracker.js";
import decay from "./decay.js";

const positionX = friction({ value: 0 });
const positionY = friction({ value: 0 });
const scale = friction({ value: 1 });

const image = document.querySelector(".image");
const tint = document.querySelector(".tint");

const mouseTrack = tracker({ value: 0 });
const mouseDecay = decay({ value: 0 });

const mouse = { down: false, sx: 0, sy: 0, dx: 0, dy: 0 };

let startValue;
window.addEventListener("mousedown", (e) => {
  mouse.down = true;
  mouse.sx = e.pageX;
  mouse.sy = e.pageY;

  startValue = mouseDecay.getValue();
  mouseTrack.setValue(startValue);
});

window.addEventListener("mousemove", (e) => {
  if (mouse.down) {
    mouse.dx = e.pageX - mouse.sx;
    mouse.dy = e.pageY - mouse.sy;

    mouseTrack.setValue(startValue + mouse.dx);
  }
});

window.addEventListener("mouseup", () => {
  mouse.down = false;
  mouseDecay.set(mouseTrack.getValue(), mouseTrack.getVelocity() * 2);
});

function tick() {
  requestAnimationFrame(tick);

  if (mouse.down) {
    image.style.transform = `translateX(${mouseTrack.getValue()}px)`;
  } else {
    image.style.transform = `translateX(${mouseDecay.getValue()}px)`;
  }
}

requestAnimationFrame(tick);
