"use strict";

import { solveTriangle } from "./solver.js";

const PAGE_SIZE = 12;

const state = {
  currentSolutions: [],
  currentPage: 1,
  currentN: null
};

let summaryEl;
let solutionsEl;
let errorEl;
let pagerEl;
let prevBtn;
let nextBtn;
let pageInfo;
let targetEl;
let excludeEl;

/**
 * Colour for an edge based on whether it meets the target sum.
 * @param {boolean} ok
 * @returns {string}
 */
function sideColor(ok) {
  return ok ? "#22c55e" : "#f97373"; // green when OK, reddish if not
}

/**
 * Generate SVG markup representing a triangle solution.
 *
 * Positions:
 *   v1 = top vertex
 *   v2 = bottom-left vertex
 *   v3 = bottom-right vertex
 *   e12 = midpoint of side v1–v2
 *   e23 = midpoint of side v2–v3
 *   e31 = midpoint of side v3–v1
 */
function triangleSVG(v1, v2, v3, e12, e23, e31, N) {
  const A = v1;
  const B = v2;
  const C = v3;
  const D = e12;
  const E = e23;
  const F = e31;

  const sums = {
    left: A + D + B,
    bottom: B + E + C,
    right: C + F + A
  };

  const ok = {
    left: sums.left === N,
    bottom: sums.bottom === N,
    right: sums.right === N
  };

  // Coordinates
  const pts = {
    A: { x: 150, y: 40 },
    B: { x: 60, y: 200 },
    C: { x: 240, y: 200 },
    D: { x: (150 + 60) / 2, y: (40 + 200) / 2 },
    F: { x: (150 + 240) / 2, y: (40 + 200) / 2 },
    E: { x: 150, y: 200 }
  };

  return `
<svg viewBox="0 0 300 230" role="img" aria-label="Triangle solution">
  <!-- Sides -->
  <line x1="${pts.A.x}" y1="${pts.A.y}" x2="${pts.B.x}" y2="${pts.B.y}" stroke="${sideColor(
    ok.left
  )}" stroke-width="3" />
  <line x1="${pts.B.x}" y1="${pts.B.y}" x2="${pts.C.x}" y2="${pts.C.y}" stroke="${sideColor(
    ok.bottom
  )}" stroke-width="3" />
  <line x1="${pts.C.x}" y1="${pts.C.y}" x2="${pts.A.x}" y2="${pts.A.y}" stroke="${sideColor(
    ok.right
  )}" stroke-width="3" />

  <!-- Nodes (pale yellow fill, green border) -->
  ${["A", "B", "C", "D", "E", "F"]
    .map((id) => {
      const p = pts[id];
      return `<circle cx="${p.x}" cy="${p.y}" r="12" fill="#fef9c3" stroke="#22c55e" stroke-width="2" />`;
    })
    .join("")}

  <!-- Numbers at positions -->
  <text x="${pts.A.x}" y="${pts.A.y + 4}" text-anchor="middle" class="node-label">${A}</text>
  <text x="${pts.B.x}" y="${pts.B.y + 4}" text-anchor="middle" class="node-label">${B}</text>
  <text x="${pts.C.x}" y="${pts.C.y + 4}" text-anchor="middle" class="node-label">${C}</text>
  <text x="${pts.D.x}" y="${pts.D.y + 4}" text-anchor="middle" class="node-label">${D}</text>
  <text x="${pts.E.x}" y="${pts.E.y + 4}" text-anchor="middle" class="node-label">${E}</text>
  <text x="${pts.F.x}" y="${pts.F.y + 4}" text-anchor="middle" class="node-label">${F}</text>

  <!-- Side sums -->
  <text x="${(pts.A.x + pts.B.x) / 2 - 45}" y="${
    (pts.A.y + pts.B.y) / 2 - 5
  }" class="side-label">
    ${sums.left} ✓
  </text>
  <text x="${(pts.B.x + pts.C.x) / 2}" y="${
    pts.B.y + 30
  }" text-anchor="middle" class="side-label">
    ${sums.bottom} ✓
  </text>
  <text x="${(pts.C.x + pts.A.x) / 2 + 45}" y="${
    (pts.C.y + pts.A.y) / 2 - 5
  }" class="side-label">
    ${sums.right} ✓
  </text>
</svg>`;
}

/**
 * Render a specific page of solutions.
 */
function renderPage(page) {
  const total = state.currentSolutions.length;
  if (total === 0) {
    solutionsEl.innerHTML = "";
    pagerEl.hidden = true;
    pageInfo.textContent = "";
    return;
  }

  state.currentPage = page;
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);

  solutionsEl.innerHTML = "";
  for (let i = start; i < end; i++) {
    const s = state.currentSolutions[i];
    const svg = triangleSVG(
      s.v1,
      s.v2,
      s.v3,
      s.e12,
      s.e23,
      s.e31,
      state.currentN
    );
    const wrapper = document.createElement("article");
    wrapper.className = "sol";
    wrapper.innerHTML = `
      <h3>Solution ${i + 1}</h3>
      ${svg}
      <p class="small muted">
        (v1, v2, v3, e12, e23, e31) =
        [${s.v1}, ${s.v2}, ${s.v3}, ${s.e12}, ${s.e23}, ${s.e31}]
      </p>
    `;
    solutionsEl.appendChild(wrapper);
  }

  pageInfo.textContent = `Showing ${start + 1}–${end} of ${total}`;
  pagerEl.hidden = total <= PAGE_SIZE;
  prevBtn.disabled = page === 1;
  nextBtn.disabled = end >= total;
}

/**
 * Run the solver and update the UI.
 * Supports excluding multiple numbers via space-separated input.
 */
function solveAndRender() {
  const raw = targetEl.value.trim();
  const rawExclude = excludeEl.value.trim();

  if (raw === "") {
    errorEl.textContent = "Please enter a target sum N.";
    errorEl.hidden = false;
    solutionsEl.innerHTML = "";
    pagerEl.hidden = true;
    summaryEl.textContent = "—";
    return;
  }

  const N = Number(raw);
  if (!Number.isFinite(N)) {
    errorEl.textContent = "Target N is not a valid number.";
    errorEl.hidden = false;
    return;
  }

  // Parse space-separated excluded numbers
  let excludeList = [];
  if (rawExclude !== "") {
    const tokens = rawExclude.split(/\s+/).filter(Boolean);
    const parsed = [];

    for (const t of tokens) {
      const ex = Number(t);
      if (
        !Number.isFinite(ex) ||
        !Number.isInteger(ex) ||
        ex < 1 ||
        ex > 10
      ) {
        errorEl.textContent =
          `Each excluded value must be an integer between 1 and 10. Problem value: "${t}".`;
        errorEl.hidden = false;
        return;
      }
      if (!parsed.includes(ex)) {
        parsed.push(ex);
      }
    }

    excludeList = parsed;
  }

  errorEl.hidden = true;

  const excludeMsg =
    excludeList.length === 0
      ? ""
      : ` excluding ${excludeList.join(", ")}`;

  summaryEl.textContent =
    excludeList.length === 0
      ? "Searching all permutations of length 6 from 1..10…"
      : `Searching permutations of length 6 from 1..10${excludeMsg}…`;

  const t0 = performance.now();
  const solutions = solveTriangle(N, excludeList);
  const elapsedMs = Math.max(1, Math.round(performance.now() - t0));

  state.currentSolutions = solutions;
  state.currentN = N;

  if (solutions.length === 0) {
    solutionsEl.innerHTML = `<p class="muted">No solutions found for N = <strong>${N}</strong>${excludeMsg}.</p>`;
    summaryEl.innerHTML = `0 solutions • N = <strong>${N}</strong>${excludeMsg} • ${elapsedMs} ms`;
    pagerEl.hidden = true;
    pageInfo.textContent = "";
    return;
  }

  summaryEl.innerHTML = `<strong>${solutions.length}</strong> solutions • N = <strong>${N}</strong>${excludeMsg} • ${elapsedMs} ms`;
  renderPage(1);
}

/**
 * Initialise event handlers and DOM references.
 */
function init() {
  summaryEl = document.getElementById("summary");
  solutionsEl = document.getElementById("solutions");
  errorEl = document.getElementById("error");
  pagerEl = document.getElementById("pager");
  prevBtn = document.getElementById("prevBtn");
  nextBtn = document.getElementById("nextBtn");
  pageInfo = document.getElementById("pageInfo");
  targetEl = document.getElementById("target");
  excludeEl = document.getElementById("exclude");

  const solveBtn = document.getElementById("solveBtn");
  const randomBtn = document.getElementById("randomBtn");

  solveBtn.addEventListener("click", solveAndRender);

  randomBtn.addEventListener("click", () => {
    const guess = 15 + Math.floor(Math.random() * 7); // 15..21
    targetEl.value = String(guess);
    solveAndRender();
  });

  prevBtn.addEventListener("click", () => {
    if (state.currentPage > 1) {
      renderPage(state.currentPage - 1);
    }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(state.currentSolutions.length / PAGE_SIZE);
    if (state.currentPage < totalPages) {
      renderPage(state.currentPage + 1);
    }
  });

  // Allow Enter key to trigger solve from both inputs
  targetEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      solveAndRender();
    }
  });

  excludeEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      solveAndRender();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
