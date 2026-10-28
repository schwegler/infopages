const $ = (s) => document.querySelector(s);
const pad = (n) => String(n).padStart(2, "0");
function tick() {
  const now = new Date(),
    end = new Date(now);
  end.setHours(17, 0, 0, 0);
  const weekday = now.getDay();
  const workday = weekday >= 1 && weekday <= 5;
  let remaining = Math.max(0, end - now),
    after = workday && remaining === 0;
  const weekend = !workday;
  $("#today").textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);
  $("#current-time").textContent = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
  $("#day-state").textContent = weekend
    ? "THE CATS ARE OFF DUTY"
    : after
      ? "YOU MADE IT"
      : "THE FINAL STRETCH";
  $("#hero-title").textContent = weekend
    ? "No clock watching today."
    : after
      ? "It’s 5 PM. Go be a person."
      : "The clock is clocking.";
  $("#clock-note").textContent = weekend
    ? "Next countdown: Monday"
    : after
      ? "The workday is done"
      : "Until 5:00 PM";
  if (weekend || after) remaining = 0;
  const seconds = Math.floor(remaining / 1000);
  $("#hours").textContent = pad(Math.floor(seconds / 3600));
  $("#minutes").textContent = pad(Math.floor((seconds % 3600) / 60));
  $("#seconds").textContent = pad(seconds % 60);
  let progress = weekend
    ? 0
    : after
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            ((now.getHours() * 60 + now.getMinutes() - 9 * 60) / (8 * 60)) *
              100,
          ),
        );
  $("#progress").setAttribute("aria-valuenow", String(Math.round(progress)));
  $("#progress-fill").style.width = progress + "%";
  document.title =
    (weekend || after
      ? "5 PM"
      : `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`) +
    " · 5 PM Cat Club";
}
tick();
const tickTimer = setInterval(tick, 1000);
if (tickTimer && typeof tickTimer.unref === "function") tickTimer.unref();
const tabs = [...document.querySelectorAll(".game-tab")],
  panels = {
    blocks: $("#blocks-panel"),
    snake: $("#snake-panel"),
    sudoku: $("#sudoku-panel"),
  };
let active = "blocks";
const names = {
  blocks: ["THE ARCADE SHELF · 01", "Falling Blocks"],
  snake: ["THE ARCADE SHELF · 02", "Snake"],
  sudoku: ["THE PUZZLE SHELF · 03", "Sudoku"],
};
function selectGame(game) {
  active = game;
  tabs.forEach((t) => {
    let on = t.dataset.game === game;
    t.classList.toggle("active", on);
    on
      ? t.setAttribute("aria-current", "true")
      : t.removeAttribute("aria-current");
  });
  Object.entries(panels).forEach(([k, v]) => (v.hidden = k !== game));
  $("#game-kicker").textContent = names[game][0];
  $("#game-title").textContent = names[game][1];
  if (game !== "blocks") pauseBlocks();
  if (game !== "snake") pauseSnake();
}
tabs.forEach((t) =>
  t.addEventListener("click", () => selectGame(t.dataset.game)),
);
$("#new-game").addEventListener("click", () =>
  ({ blocks: resetBlocks, snake: resetSnake, sudoku: newSudoku })[active](),
);
// Falling blocks
const bc = $("#blocks-board"),
  bctx = bc.getContext("2d"),
  nc = $("#next-piece"),
  nctx = nc.getContext("2d"),
  W = 10,
  H = 20,
  S = 24;
const shapes = [
    [[1, 1, 1, 1]],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 1],
    ],
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [0, 0, 1],
      [1, 1, 1],
    ],
  ],
  colors = [
    "#61d1d0",
    "#ffc66f",
    "#b69ff0",
    "#8fdb9f",
    "#f48f9a",
    "#87acf0",
    "#f8aa65",
  ];
let board,
  piece,
  next,
  blockScore = 0,
  lines = 0,
  blockRunning = false,
  blockOver = false,
  blockTimer = 0;
const randomPiece = () => {
  let c = Math.floor(Math.random() * shapes.length);
  return { m: shapes[c].map((r) => r.slice()), c };
};
function spawn() {
  piece = next;
  next = randomPiece();
  piece.x = Math.floor((W - piece.m[0].length) / 2);
  piece.y = 0;
  if (collides(piece.m, piece.x, piece.y)) {
    blockOver = true;
    pauseBlocks();
    $("#blocks-toggle").textContent = "Play again";
  }
  drawNext();
}
function collides(m, x, y) {
  return m.some((row, dy) =>
    row.some(
      (v, dx) =>
        v &&
        (x + dx < 0 ||
          x + dx >= W ||
          y + dy >= H ||
          (y + dy >= 0 && board[y + dy][x + dx])),
    ),
  );
}
function drawCell(ctx, x, y, size, c) {
  ctx.fillStyle = colors[c - 1];
  ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  ctx.fillStyle = "#ffffff55";
  ctx.fillRect(x * size + 3, y * size + 3, size - 6, 3);
}
function drawBlocks() {
  bctx.fillStyle = "#112b40";
  bctx.fillRect(0, 0, bc.width, bc.height);
  bctx.strokeStyle = "#ffffff12";
  for (let x = 0; x <= W; x++) {
    bctx.beginPath();
    bctx.moveTo(x * S, 0);
    bctx.lineTo(x * S, H * S);
    bctx.stroke();
  }
  for (let y = 0; y <= H; y++) {
    bctx.beginPath();
    bctx.moveTo(0, y * S);
    bctx.lineTo(W * S, y * S);
    bctx.stroke();
  }
  board.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) drawCell(bctx, x, y, S, v);
    }),
  );
  if (piece)
    piece.m.forEach((row, y) =>
      row.forEach((v, x) => {
        if (v) drawCell(bctx, x + piece.x, y + piece.y, S, piece.c + 1);
      }),
    );
  if (blockOver) overlay(bctx, bc, "GAME OVER");
}
function drawNext() {
  nctx.clearRect(0, 0, 100, 100);
  next.m.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v)
        drawCell(
          nctx,
          x + Math.floor((5 - next.m[0].length) / 2),
          y + 1,
          20,
          next.c + 1,
        );
    }),
  );
}
function overlay(ctx, canvas, label) {
  ctx.fillStyle = "#08283fc9";
  ctx.fillRect(0, canvas.height / 2 - 32, canvas.width, 64);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px DM Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 6);
}
function resetBlocks() {
  pauseBlocks();
  board = Array.from({ length: H }, () => Array(W).fill(0));
  blockScore = lines = 0;
  blockOver = false;
  next = randomPiece();
  piece = null;
  spawn();
  $("#blocks-score").textContent = 0;
  $("#blocks-lines").textContent = 0;
  $("#blocks-toggle").textContent = "Start playing";
  drawBlocks();
}
function pauseBlocks() {
  blockRunning = false;
  clearInterval(blockTimer);
  if (!blockOver) $("#blocks-toggle").textContent = "Resume playing";
}
function startBlocks() {
  if (blockOver) resetBlocks();
  blockRunning = true;
  $("#blocks-toggle").textContent = "Pause";
  clearInterval(blockTimer);
  blockTimer = setInterval(() => {
    dropBlock();
    drawBlocks();
  }, 550);
}
function dropBlock() {
  if (!piece) return;
  if (!collides(piece.m, piece.x, piece.y + 1)) piece.y++;
  else {
    piece.m.forEach((row, dy) =>
      row.forEach((v, dx) => {
        if (v) board[piece.y + dy][piece.x + dx] = piece.c + 1;
      }),
    );
    let cleared = 0;
    for (let y = H - 1; y >= 0; y--)
      if (board[y].every(Boolean)) {
        board.splice(y, 1);
        board.unshift(Array(W).fill(0));
        cleared++;
        y++;
      }
    lines += cleared;
    blockScore += [0, 100, 300, 500, 800][cleared];
    $("#blocks-score").textContent = blockScore;
    $("#blocks-lines").textContent = lines;
    spawn();
  }
}
export function rotate(m) {
  const R = m.length;
  const C = m[0].length;
  const res = new Array(C);
  for (let i = 0; i < C; i++) {
    const row = new Array(R);
    for (let j = 0; j < R; j++) {
      row[j] = m[R - 1 - j][i];
    }
    res[i] = row;
  }
  return res;
}
function blocksKey(key) {
  if (!blockRunning) return;
  if (key === "ArrowLeft" && !collides(piece.m, piece.x - 1, piece.y))
    piece.x--;
  if (key === "ArrowRight" && !collides(piece.m, piece.x + 1, piece.y))
    piece.x++;
  if (key === "ArrowDown") {
    dropBlock();
    blockScore++;
    $("#blocks-score").textContent = blockScore;
  }
  if (key === "ArrowUp") {
    const r = rotate(piece.m);
    for (const dx of [0, -1, 1, -2, 2])
      if (!collides(r, piece.x + dx, piece.y)) {
        piece.m = r;
        piece.x += dx;
        break;
      }
  }
  if (key === "Space") {
    while (!collides(piece.m, piece.x, piece.y + 1)) piece.y++;
    dropBlock();
  }
  drawBlocks();
}
$("#blocks-toggle").addEventListener("click", () =>
  blockRunning ? pauseBlocks() : startBlocks(),
);
resetBlocks();
// Snake
const sc = $("#snake-board"),
  sctx = sc.getContext("2d"),
  N = 20,
  CS = 20;
let snake,
  food,
  dir,
  want,
  snakeScore = 0,
  snakeBest = 0,
  snakeRunning = false,
  snakeOver = false,
  snakeTimer = 0;
function placeFood() {
  let empty = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      if (!snake.some((p) => p.x === x && p.y === y)) empty.push({ x, y });
  food = empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
}
function drawSnake() {
  sctx.fillStyle = "#112b40";
  sctx.fillRect(0, 0, 400, 400);
  sctx.fillStyle = "#1c3d50";
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      if ((x + y) % 2 === 0) sctx.fillRect(x * CS, y * CS, CS, CS);
  if (food) {
    sctx.fillStyle = "#ffcb67";
    sctx.beginPath();
    sctx.arc(food.x * CS + 10, food.y * CS + 10, 7, 0, Math.PI * 2);
    sctx.fill();
  }
  snake.forEach((p, i) => {
    sctx.fillStyle = i ? "#67c8a9" : "#afe9bc";
    sctx.fillRect(p.x * CS + 1, p.y * CS + 1, 18, 18);
  });
  if (snakeOver) overlay(sctx, sc, "THE CAT CAUGHT YOU");
}
function resetSnake() {
  pauseSnake();
  snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
  ];
  dir = { x: 1, y: 0 };
  want = dir;
  snakeScore = 0;
  snakeOver = false;
  placeFood();
  $("#snake-score").textContent = 0;
  $("#snake-toggle").textContent = "Start playing";
  drawSnake();
}
function pauseSnake() {
  snakeRunning = false;
  clearInterval(snakeTimer);
  if (!snakeOver) $("#snake-toggle").textContent = "Resume playing";
}
function startSnake() {
  if (snakeOver) resetSnake();
  snakeRunning = true;
  $("#snake-toggle").textContent = "Pause";
  clearInterval(snakeTimer);
  snakeTimer = setInterval(stepSnake, 130);
}
function stepSnake() {
  dir = want;
  let h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y },
    eats = food && h.x === food.x && h.y === food.y,
    body = eats ? snake : snake.slice(0, -1);
  if (
    h.x < 0 ||
    h.y < 0 ||
    h.x >= N ||
    h.y >= N ||
    body.some((p) => p.x === h.x && p.y === h.y)
  ) {
    snakeOver = true;
    pauseSnake();
    $("#snake-toggle").textContent = "Play again";
    drawSnake();
    return;
  }
  snake.unshift(h);
  if (eats) {
    snakeScore += 10;
    snakeBest = Math.max(snakeScore, snakeBest);
    $("#snake-score").textContent = snakeScore;
    $("#snake-best").textContent = snakeBest;
    placeFood();
    if (!food) {
      snakeOver = true;
      pauseSnake();
      $("#snake-toggle").textContent = "Play again";
    }
  } else snake.pop();
  drawSnake();
}
function snakeKey(key) {
  const moves = {
    ArrowLeft: [-1, 0],
    a: [-1, 0],
    ArrowRight: [1, 0],
    d: [1, 0],
    ArrowUp: [0, -1],
    w: [0, -1],
    ArrowDown: [0, 1],
    s: [0, 1],
  };
  let m = moves[key];
  if (m && !(m[0] === -dir.x && m[1] === -dir.y)) want = { x: m[0], y: m[1] };
}
$("#snake-toggle").addEventListener("click", () =>
  snakeRunning ? pauseSnake() : startSnake(),
);
resetSnake();
document.addEventListener("keydown", (e) => {
  if (!document.querySelector(".cat-club").contains(e.target)) return;
  if (
    active === "blocks" &&
    [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Space",
      " ",
      "p",
      "P",
    ].includes(e.key)
  ) {
    e.preventDefault();
    if (e.key.toLowerCase() === "p") {
      blockRunning ? pauseBlocks() : startBlocks();
    } else blocksKey(e.key === " " ? "Space" : e.key);
  } else if (
    active === "snake" &&
    /^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|w|a|s|d)$/.test(e.key)
  ) {
    e.preventDefault();
    snakeKey(e.key);
  } else if (active === "sudoku" && selected >= 0) {
    if (/^[1-9]$/.test(e.key)) setSudoku(Number(e.key));
    if (["Backspace", "Delete", "0"].includes(e.key)) {
      e.preventDefault();
      setSudoku(0);
    }
  }
});
document.querySelectorAll(".touch-controls button").forEach((b) =>
  b.addEventListener("click", () => {
    const k = b.dataset.key;
    if (active === "blocks") blocksKey(k);
    else snakeKey(k);
  }),
);
// Sudoku: rotate and reflect a valid solved grid, then remove cells from a hand-picked puzzle.
const base = [
  5, 3, 4, 6, 7, 8, 9, 1, 2, 6, 7, 2, 1, 9, 5, 3, 4, 8, 1, 9, 8, 3, 4, 2, 5, 6,
  7, 8, 5, 9, 7, 6, 1, 4, 2, 3, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3, 9, 2, 4, 8,
  5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7, 4, 1, 9, 6, 3, 5, 3, 4, 5, 2, 8, 6,
  1, 7, 9,
];
const mask =
  "110010000100111000011000010100010001100101001100010001010000110000111001000010011";
let solution = [],
  givens = [],
  entries = [],
  selected = -1,
  puzzleCount = 0;
function shuffled(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function newSudoku() {
  let nums = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    bands = shuffled([0, 1, 2]),
    stacks = shuffled([0, 1, 2]);
  const rowOrder = bands.flatMap((b) =>
      shuffled([0, 1, 2]).map((i) => b * 3 + i),
    ),
    colOrder = stacks.flatMap((b) => shuffled([0, 1, 2]).map((i) => b * 3 + i));
  solution = Array.from(
    { length: 81 },
    (_, i) => nums[base[rowOrder[Math.floor(i / 9)] * 9 + colOrder[i % 9]] - 1],
  );
  let m = mask.split("");
  puzzleCount++;
  givens = solution.map((v, i) => (m[i] === "1" ? v : 0));
  entries = [...givens];
  selected = -1;
  $("#sudoku-message").textContent = "";
  drawSudoku();
}
function conflict(i) {
  let v = entries[i];
  if (!v) return false;
  let r = Math.floor(i / 9),
    c = i % 9;
  return entries.some(
    (x, j) =>
      j !== i &&
      x === v &&
      (Math.floor(j / 9) === r ||
        j % 9 === c ||
        (Math.floor(j / 27) === Math.floor(i / 27) &&
          Math.floor((j % 9) / 3) === Math.floor(c / 3))),
  );
}
function drawSudoku() {
  const restoreFocus = document.activeElement?.closest("#sudoku-board");
  let board = $("#sudoku-board");
  board.replaceChildren(
    ...entries.map((v, i) => {
      let b = document.createElement("button");
      b.type = "button";
      b.textContent = v || "";
      b.setAttribute("role", "gridcell");
      b.setAttribute(
        "aria-label",
        `Row ${Math.floor(i / 9) + 1}, column ${(i % 9) + 1}: ${v || "empty"}${givens[i] ? ", given" : ""}`,
      );
      if (givens[i]) b.classList.add("given");
      if (i === selected) b.classList.add("selected");
      if (conflict(i)) b.classList.add("conflict");
      b.addEventListener("click", () => {
        selected = i;
        drawSudoku();
      });
      return b;
    }),
  );
  if (restoreFocus && selected >= 0) board.children[selected].focus();
  $("#sudoku-filled").textContent = entries.filter(Boolean).length + " / 81";
}
function setSudoku(n) {
  if (selected < 0 || givens[selected]) return;
  entries[selected] = n;
  $("#sudoku-message").textContent = "";
  drawSudoku();
  if (entries.every((v, i) => v === solution[i]))
    $("#sudoku-message").textContent = "Solved! The cats are impressed.";
}
$("#number-pad").replaceChildren(
  ...Array.from({ length: 9 }, (_, i) => {
    let b = document.createElement("button");
    b.type = "button";
    b.textContent = i + 1;
    b.setAttribute("aria-label", "Enter " + (i + 1));
    b.addEventListener("click", () => setSudoku(i + 1));
    return b;
  }),
);
$("#sudoku-erase").addEventListener("click", () => setSudoku(0));
$("#sudoku-check").addEventListener("click", () => {
  $("#sudoku-message").textContent = entries.every((v, i) => v === solution[i])
    ? "Solved! The cats are impressed."
    : entries.some(conflict)
      ? "A few numbers are in conflict."
      : "No conflicts so far. Keep going.";
});
newSudoku();
