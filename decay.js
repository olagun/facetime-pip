import { clamp } from "./utils.js";

function decay({ value = 0, decay = 0.95, velocity = 0 }) {
  function tick() {
    requestAnimationFrame(tick);

    value = value + velocity;
    velocity = velocity * decay;
  }

  requestAnimationFrame(tick);

  return {
    getValue() {
      return value;
    },
    setValue(newValue = value) {
      value = newValue;
    },
    set(newValue = value, newVelocity = velocity) {
      velocity = newVelocity;
      value = newValue;
    },
  };
}

export default decay;
