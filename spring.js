import { clamp, lerp } from "./utils.js";

function spring({
  value: initialValue = 0,
  velocity: initialVelocity = 0,
  strength: k = 0.05,
  damping: b = 0.4,
}) {
  k = clamp(0, 1, k);
  b = clamp(0, 1, b);

  let ticking = false;

  let value = initialValue;
  let prevValue = initialValue;

  let velocity = initialVelocity;

  let target = initialValue;

  function tick() {
    requestAnimationFrame(tick);

    const f_spring = k * (target - value);
    const f_damp = velocity * b;

    // mass is 1 so force is acceleration
    velocity += f_spring - f_damp;

    prevValue = value;
    value += velocity;
  }

  requestAnimationFrame(tick);

  return {
    getTarget() {
      return target;
    },
    setValue(newValue) {
      value = newValue;
    },
    get() {
      return value;
    },
    set(newTarget, newVelocity = velocity) {
      velocity = newVelocity;
      target = newTarget;
    },
    velocity() {
      return velocity;
    },
  };
}

export default spring;
