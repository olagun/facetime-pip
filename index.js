import { clamp, getIndex, mapNRange, array } from "./utils.js";
import friction from "./friction.js";

// refacator into function that takes
// a parent with a set of children
// width, heihht

function page(cards, size, transform, gutter = 24) {
  const positions = array(cards.length, (_, i) => i * (size.width + gutter));
  const animations = positions.map((position) => friction({ value: position }));
  const maxOffset = positions[positions.length - 1];

  const animateValues = (animations, values) => {
    animations.map((animation, i) => {
      animation.set(values[i]);
    });
  };

  animateValues(animations, positions);

  const mouse = { x: 0, y: 0, dx: 0, dy: 0, sx: 0, sy: 0, down: false };

  const onMouseMove = () => {
    const diff = clamp(-maxOffset, 0, positions[0] - mouse.dy) - positions[0];

    const offsetPositions = positions.map((position) => position + diff);
    animateValues(animations, offsetPositions);
  };

  const onMouseUp = () => {
    const diff = clamp(-maxOffset, 0, positions[0] - mouse.dy) - positions[0];
    const closestIndex = getIndex(diff + positions[0], size.width + gutter);

    positions.forEach((_, i) => {
      positions[i] = (i + closestIndex) * (size.width + gutter);
    });

    animateValues(animations, positions);
  };

  window.addEventListener("keydown", (e) => {
    const index = -getIndex(positions[0], size.width);
    let diff = 0;

    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      diff = -1;
    }

    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      diff = 1;
    }

    const newIndex = clamp(0, positions.length - 1, index + diff);

    positions.forEach((_, i) => {
      positions[i] = (i - newIndex) * (size.width + gutter);
    });

    animateValues(animations, positions);
  });

  window.addEventListener("mousedown", (e) => {
    mouse.down = true;
    document.body.style.cursor = "grabbing";
    mouse.sx = mouse.x = e.clientX;
    mouse.sy = mouse.y = e.clientY;
  });

  window.addEventListener("mousemove", (e) => {
    if (mouse.down) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.dx = mouse.x - mouse.sx;
      mouse.dy = mouse.y - mouse.sy;
      onMouseMove();
    }
  });

  window.addEventListener("mouseup", () => {
    mouse.down = false;
    document.body.style.cursor = "grab";
    onMouseUp();
  });

  const tick = () => {
    requestAnimationFrame(tick);

    cards.map((card, i) => {
      const defaultPosition = i * (size.width + gutter);

      transform({
        index: i,
        card,
        position: animations[i].get(),
        offset: animations[i].get() - defaultPosition,
        normalized: animations[i].get() / (size.width + gutter),
      });
    });
  };

  requestAnimationFrame(tick);
}

const headers = document.querySelectorAll(".header__item");

page(
  Array.from(document.querySelectorAll(".cards__card")),
  {
    width: 400,
    height: 700,
  },
  ({ index, card, normalized, position }) => {
    headers[index].style.transform = `translateX(${position / 10}px)`;
    headers[index].style.opacity = mapNRange(
      [-1, 0, 1],
      [0.2, 1, 0.2],
      normalized
    );
    headers[index].innerHTML = index + 1;

    // rotateY(${normalized * 10}deg)
    // card.style.transform = `
    //   translateX(${position}px)
    //   translateY(${(normalized > 0 ? normalized : 0) * -700}px)
    // `;
    card.style.zIndex = -index;
    card.style.transform = `
      translateY(${mapNRange([-1, 0, 1], [1000, 0, -50], normalized)}px)
      scale(${1 - normalized * 0.05})
    `;

    card.style.opacity = mapNRange([-1, 0, 1], [1, 1, 0.6], normalized);
    card.innerHTML = normalized.toFixed(2);
    // card.style.opacity = normalized;
  }
);
