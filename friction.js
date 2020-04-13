import { clamp, lerp } from "./utils.js";

function friction({ value: initialValue = 0, friction = 0.15 }) {
  friction = clamp(0, 1, friction);

  let value = initialValue;
  let prevValue = initialValue;
  let target = initialValue;

  function tick() {
    requestAnimationFrame(tick);

    prevValue = value;
    value = lerp(value, target, friction);
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
    set(newTarget) {
      target = newTarget;
    },
    velocity() {
      return value - prevValue;
    },
  };
}

export default friction;
