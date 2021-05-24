import { dist, applyGutter, projectTrackerPosition } from "./utils.js";
import spring from "./spring.js";
import tracker from "./tracker.js";

let cards = [];

const corners = applyGutter(
  [200 / 2 + 50, 300 / 2 + 50],
  [
    [0, 0],
    [window.innerWidth, 0],
    [window.innerWidth, window.innerHeight],
    [0, window.innerHeight],
  ]
);

const cardsAtCorners = [new Set(), new Set(), new Set(), new Set()];

function createCard(video) {
  const card = document.createElement("div");
  card.classList.add("card");
  // card.appendChild(video);
  document.body.appendChild(card);

  const position = [
    tracker({ value: corners[0][0] }),
    tracker({ value: corners[0][1] }),
  ];

  const obj = {
    initial: [0, 0],
    remove() {
      cards = cards.filter((c) => c !== card);
      card.remove();
    },
    node: card,
    dimensions: card.getBoundingClientRect(),
    position,
    pipSpring: [
      spring({ tracker: position[0] }),
      spring({ tracker: position[1] }),
    ],
  };

  function nearestCorner(position) {
    const { index } = corners.reduce(
      (nearest, currCorner, currIndex) => {
        const currDist = dist(currCorner, position);

        return currDist < nearest.dist
          ? { index: currIndex, dist: currDist }
          : { index: nearest.index, dist: nearest.dist };
      },
      { index: -1, dist: Infinity }
    );

    return index;
  }

  const mouse = { down: false, sx: 0, sy: 0, dx: 0, dy: 0 };

  const cardPosition = obj.position;
  const pipSpring = obj.pipSpring;
  const cardInitial = obj.initial;

  let currCorner = 0;

  cardsAtCorners[currCorner].add(obj);

  for (let i = 0; i < cardsAtCorners.length; i++) {
    let j = 0;
    for (const card of cardsAtCorners[i]) {
      const pipSpring = card.pipSpring;

      pipSpring[0].play();
      pipSpring[1].play();

      const direction = i == 0 || i == 3 ? 1 : -1;
      const position = [corners[i][0] + j * 340 * direction, corners[i][1]];

      pipSpring[0].set(position[0]);
      pipSpring[1].set(position[1]);

      j++;
    }
  }

  window.addEventListener("mousedown", (e) => {
    if (e.target !== card) return;

    pipSpring[0].pause();
    pipSpring[1].pause();

    mouse.down = true;
    mouse.sx = e.pageX;
    mouse.sy = e.pageY;

    cardInitial[0] = cardPosition[0].getValue();
    cardInitial[1] = cardPosition[1].getValue();

    card.classList.add("hover");
  });

  window.addEventListener("mousemove", (e) => {
    if (mouse.down) {
      mouse.dx = e.pageX - mouse.sx;
      mouse.dy = e.pageY - mouse.sy;

      cardPosition[0].setValue(cardInitial[0] + mouse.dx);
      cardPosition[1].setValue(cardInitial[1] + mouse.dy);
    }
  });

  window.addEventListener("mouseup", () => {
    mouse.down = false;
    card.classList.remove("hover");

    cardsAtCorners[currCorner].delete(obj);

    const projectedPos = [
      projectTrackerPosition(cardPosition[0]),
      projectTrackerPosition(cardPosition[1]),
    ];

    const cornerIndex = nearestCorner(projectedPos);
    currCorner = cornerIndex;

    cardsAtCorners[cornerIndex].add(obj);

    for (let i = 0; i < cardsAtCorners.length; i++) {
      let j = 0;
      for (const card of cardsAtCorners[i]) {
        const pipSpring = card.pipSpring;

        pipSpring[0].play();
        pipSpring[1].play();

        const direction = i == 0 || i == 3 ? 1 : -1;
        const position = [corners[i][0] + j * 340 * direction, corners[i][1]];

        pipSpring[0].set(position[0]);
        pipSpring[1].set(position[1]);

        j++;
      }
    }
  });

  cards.push(obj);

  return obj;
}

function animateCards() {
  function tick() {
    requestAnimationFrame(tick);

    for (const card of cards) {
      const cardPosition = card.position;
      const { width, height } = card.dimensions;

      card.node.style.transform = `translate(
        ${cardPosition[0].getValue() - width / 2}px,
        ${cardPosition[1].getValue() - height / 2}px
      )`;
    }
  }

  requestAnimationFrame(tick);
}

animateCards();

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then(function (stream) {
    const video = document.createElement("video");

    addVideoStream(video, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);

      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  })
  .catch(function (err) {
    console.log(err.name + ": " + err.message);
  });

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });
}

function addVideoStream(video, videoStream) {
  video.srcObject = videoStream;

  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  createCard(video);
}

const ROOM_ID = location.pathname.substring(1);

const socket = io("/");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});
