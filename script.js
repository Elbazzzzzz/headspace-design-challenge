const PARTS = {
  dendrites: {
    title: "Dendrites",
    text: "Dendrites receive incoming chemical and electrical messages from neighboring neurons.",
    pulsePath: [
      [200, 320],
      [255, 345],
      [318, 340],
    ],
  },
  soma: {
    title: "Cell Body (Soma)",
    text: "The soma integrates incoming signals and keeps the neuron alive by managing metabolism.",
    pulsePath: [
      [318, 340],
      [350, 342],
      [394, 341],
      [444, 340],
    ],
  },
  axon: {
    title: "Axon",
    text: "The axon carries the action potential away from the cell body over long distances.",
    pulsePath: [
      [444, 340],
      [560, 336],
      [700, 342],
      [860, 338],
    ],
  },
  myelin: {
    title: "Myelin Sheath",
    text: "Myelin insulates the axon and speeds up impulse transmission by reducing signal loss.",
    pulsePath: [
      [560, 336],
      [690, 342],
      [812, 338],
      [934, 343],
    ],
  },
  terminals: {
    title: "Axon Terminals",
    text: "Terminal branches release neurotransmitters into synapses to communicate with the next cell.",
    pulsePath: [
      [934, 343],
      [1034, 348],
      [1110, 368],
      [1168, 244],
    ],
  },
};

const partElements = {
  dendrites: document.getElementById("part-dendrites"),
  soma: document.getElementById("part-soma"),
  axon: document.getElementById("part-axon"),
  myelin: document.getElementById("part-myelin"),
  terminals: document.getElementById("part-terminals"),
};

const steps = [...document.querySelectorAll(".step")];
const titleEl = document.getElementById("partTitle");
const textEl = document.getElementById("partText");
const pulse = document.getElementById("pulse");

let currentPart = "dendrites";

function setActivePart(partKey) {
  if (!PARTS[partKey]) return;

  currentPart = partKey;
  for (const [key, element] of Object.entries(partElements)) {
    element.classList.toggle("is-active", key === partKey);
  }

  titleEl.textContent = PARTS[partKey].title;
  textEl.textContent = PARTS[partKey].text;
}

function animatePulseAlong(points, duration = 1700) {
  const start = performance.now();
  const segmentLengths = [];
  let totalLength = 0;

  for (let i = 0; i < points.length - 1; i += 1) {
    const dx = points[i + 1][0] - points[i][0];
    const dy = points[i + 1][1] - points[i][1];
    const length = Math.hypot(dx, dy);
    segmentLengths.push(length);
    totalLength += length;
  }

  function frame(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    let targetDistance = totalLength * t;
    let segmentIndex = 0;

    while (
      segmentIndex < segmentLengths.length - 1 &&
      targetDistance > segmentLengths[segmentIndex]
    ) {
      targetDistance -= segmentLengths[segmentIndex];
      segmentIndex += 1;
    }

    const from = points[segmentIndex];
    const to = points[segmentIndex + 1];
    const segmentLength = segmentLengths[segmentIndex] || 1;
    const localT = targetDistance / segmentLength;

    const x = from[0] + (to[0] - from[0]) * localT;
    const y = from[1] + (to[1] - from[1]) * localT;

    pulse.setAttribute("cx", x.toString());
    pulse.setAttribute("cy", y.toString());
    pulse.setAttribute("r", (10 + Math.sin(t * Math.PI * 8) * 2).toString());

    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function playIntroPulse() {
  const fullPath = [
    ...PARTS.dendrites.pulsePath,
    ...PARTS.soma.pulsePath.slice(1),
    ...PARTS.axon.pulsePath.slice(1),
    ...PARTS.myelin.pulsePath.slice(1),
    ...PARTS.terminals.pulsePath.slice(1),
  ];
  animatePulseAlong(fullPath, 2900);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const part = entry.target.getAttribute("data-part");
        if (part && part !== currentPart) {
          setActivePart(part);
          animatePulseAlong(PARTS[part].pulsePath, 1500);
        }
        steps.forEach((step) =>
          step.classList.toggle("is-active", step === entry.target)
        );
      }
    });
  },
  {
    threshold: 0.6,
  }
);

steps.forEach((step) => observer.observe(step));
setActivePart(currentPart);
window.addEventListener("load", () => {
  setTimeout(playIntroPulse, 280);
});
