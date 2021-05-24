import { clamp } from "./utils.js";

function spring({ tracker, strength: k = 0.05, damping: b = 0.2 }) {
  k = clamp(0, 1, k);
  b = clamp(0, 1, b);

  let target = tracker.getValue();
  let paused = false;

  function tick() {
    requestAnimationFrame(tick);

    if (!paused) {
      const f_spring = k * (target - tracker.getValue());
      const f_damp = tracker.getVelocity() * b;
      const acc = f_spring - f_damp;
      const dx = tracker.getVelocity() + acc;
      tracker.setValue(tracker.getValue() + dx);
    }
  }

  requestAnimationFrame(tick);

  return {
    pause() {
      paused = true;
    },
    play() {
      paused = false;
    },
    set(newTarget = target) {
      target = newTarget;
      // tracker.setVelocity(newVelocity);
      return target;
    },
  };
}

export default spring;
