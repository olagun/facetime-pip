import { clamp } from "./utils.js";

function tracker({ value = 0 }) {
  let velocity = 0;

  return {
    setValue(newValue) {
      velocity = newValue - value;
      value = newValue;
    },
    getValue() {
      return value;
    },
    setVelocity(newVelocity = velocity) {
      velocity = newVelocity;
    },
    getVelocity() {
      return velocity;
    },
  };
}

export default tracker;
