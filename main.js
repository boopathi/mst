import init, { compute_mst } from "./pkg/mst.js";
const canvas = document.getElementById("board");
const statusContainer = document.getElementById("status-container");
const statusBox = document.getElementById("status");
const ctx = canvas.getContext("2d");

const width = window.innerWidth;
const height = window.innerHeight;
const backgroundColor = "#263238";
const pointColor = "#d4bff9";
const lineColor = "#c6f68d";
const fadingTimeout = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue(
    "--fadingTimeout"
  ),
  10
);
const shouldWaitForUserClick = false;

canvas.setAttribute("width", String(width));
canvas.setAttribute("height", String(height));

start();

async function start() {
  await init("pkg/mst_bg.wasm");
  clear();

  const n = 100;
  const points = randomPoints(width, height, n);
  await status("Computed random points");

  await drawPoints(points);
  await status("Rendering points complete");

  const edgesStartTime = performance.now();
  const edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      edges.push({
        source: i,
        target: j,
        weight: Math.sqrt(
          Math.pow(points[i][0] - points[j][0], 2) +
            Math.pow(points[i][1] - points[j][1], 2)
        )
      });
    }
  }
  const edgesEndTime = performance.now();

  await status(
    `[~${Math.floor(
      edgesEndTime - edgesStartTime
    )}ms] Computing all weighted edges complete`
  );
  const startTime = performance.now();
  const minimumRustEdges = compute_mst({
    nodes: points,
    edges
  });
  const endTime = performance.now();
  await status(
    `[RUST] Took ~${Math.floor(
      endTime - startTime
    )}ms to compute MST for ${n} nodes with ${edges.length} edges`
  );

  const startJsTime = performance.now();
  const minimumJsEdges = mst({
    nodes: points,
    edges
  });
  const endJsTime = performance.now();
  await status(
    `[JS] Took ~${Math.floor(
      endJsTime - startJsTime
    )}ms to compute MST for ${n} nodes with ${edges.length} edges`
  );

  await drawLines(minimumRustEdges, points);
  await status("All done", true);
}

async function status(message, done = false) {
  if (!shouldWaitForUserClick) {
    console.log(message);
    return;
  }
  let userEventResolve;
  function waitForUserEvent() {
    return new Promise(resolve => {
      userEventResolve = resolve;
      statusContainer.addEventListener("click", handler);
    });
  }
  function handler() {
    statusContainer.removeEventListener("click", handler);
    userEventResolve();
  }

  statusBox.innerText = message + (!done ? ". Click to proceed." : "");
  statusBox.classList.add("active");
  await waitForUserEvent();
  statusBox.classList.remove("active");
  await nextTick(fadingTimeout);
  statusBox.innerText = "";
}

function nextTick(timeout = 0) {
  return new Promise(resolve => {
    if (timeout > 0) {
      setTimeout(() => resolve(), timeout);
    } else {
      requestAnimationFrame(() => {
        resolve();
      });
    }
  });
}

function mst(graph) {
  const { nodes, edges } = graph;
  // ascending order
  const sortedEdges = edges.sort((a, b) => a.weight - b.weight);

  const resultEdges = [];
  const subsets = [];
  for (let i = 0; i < nodes.length; i++) {
    subsets.push({
      parent: i,
      rank: 0
    });
  }

  let i = 0;
  let e = 0;
  while (e < nodes.length - 1) {
    const nextEdge = sortedEdges[i++];

    const x = find(subsets, nextEdge.source);
    const y = find(subsets, nextEdge.target);
    if (x != y) {
      resultEdges.push(nextEdge);
      e++;
      union(subsets, x, y);
    }
  }

  return resultEdges;
}

function find(subsets, i) {
  while (subsets[i].parent !== i) {
    i = subsets[i].parent;
  }
  return i;
}

function union(subsets, x, y) {
  const xRoot = find(subsets, x);
  const yRoot = find(subsets, y);

  if (xRoot === yRoot) {
    return;
  }

  if (subsets[xRoot].rank < subsets[yRoot].rank) {
    subsets[xRoot].parent = yRoot;
  } else if (subsets[xRoot.rank] > subsets[yRoot].rank) {
    subsets[yRoot].parent = xRoot;
  } else {
    subsets[yRoot].parent = xRoot;
    subsets[xRoot].rank++;
  }
}

async function drawLines(edges, nodes, currentEdge = edges[0]) {
  if (currentEdge == null) return;
  if (currentEdge.rendered) return;

  drawLine(
    nodes[currentEdge.source][0],
    nodes[currentEdge.source][1],
    nodes[currentEdge.target][0],
    nodes[currentEdge.target][1]
  );
  currentEdge.rendered = true;
  await nextTick(70);

  const nextEdges = edges.filter(
    edge =>
      edge.source === currentEdge.target ||
      edge.target === currentEdge.source ||
      edge.source === currentEdge.source ||
      edge.target === currentEdge.target
  );

  await Promise.all(nextEdges.map(edge => drawLines(edges, nodes, edge)));
}

function drawLine(x1, y1, x2, y2, size = 2) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = size;
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

async function drawPoints(
  points,
  size = 3,
  batchSize = Math.floor(points.length / 20)
) {
  for (let i = 0; i < points.length; i++) {
    if (i % batchSize === 0) await nextTick();
    const point = points[i];
    ctx.save();
    ctx.beginPath();
    ctx.arc(point[0], point[1], size, 0, 2 * Math.PI);
    ctx.fillStyle = pointColor;
    ctx.shadowColor = "#ffffff";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

function clear() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
}

// create random points between 0, 0 and width, height
function randomPoints(width, height, n, padding = 50) {
  const points = [];
  for (let i = 0; i < n; i++) {
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    if (x < padding) x += padding;
    if (x > width - padding) x -= padding;
    if (y < padding) y += padding;
    if (y > height - padding) y -= padding;
    points.push([x, y]);
  }
  return points;
}
