// ===== 1. 星空背景動畫 =====
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let stars = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = Array.from({ length: Math.floor((canvas.width * canvas.height) / 6000) }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.6 + 0.3,
    speed: Math.random() * 0.4 + 0.05,
    twinkle: Math.random() * Math.PI * 2,
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) {
    s.y += s.speed;
    s.twinkle += 0.03;
    if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
    ctx.globalAlpha = 0.5 + Math.sin(s.twinkle) * 0.5;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawStars);
}

window.addEventListener("resize", resize);
resize();
drawStars();

// ===== 2. 滑鼠光暈 =====
const glow = document.getElementById("cursorGlow");
window.addEventListener("mousemove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

// ===== 3. 打字機效果（可以自己改下面的句子）=====
const words = ["11 歲的小小工程師 💻", "遊戲高手 🎮", "好奇心爆棚的探險家 🚀", "未來會改變世界的人 🌍"];
const typed = document.getElementById("typed");
let wordIndex = 0, charIndex = 0, deleting = false;

function type() {
  const word = words[wordIndex];
  const chars = Array.from(word); // 讓 emoji 不會被切壞
  typed.textContent = chars.slice(0, charIndex).join("");

  if (!deleting && charIndex < chars.length) {
    charIndex++;
    setTimeout(type, 120);
  } else if (!deleting) {
    deleting = true;
    setTimeout(type, 1500);
  } else if (charIndex > 0) {
    charIndex--;
    setTimeout(type, 60);
  } else {
    deleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    setTimeout(type, 300);
  }
}
type();

// ===== 4. 捲動到時才出現 + 數字跳動 =====
function countUp(el) {
  const target = +el.dataset.target;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / 1500, 1);
    el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("show");
    entry.target.querySelectorAll(".num").forEach(countUp);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.1 + "s";
  observer.observe(el);
});

// ===== 5. 卡片 3D 傾斜效果 =====
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg) translateY(-6px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

// ===== 6. 頁尾年份 =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== 7. 迷你遊戲：太空接星星 =====
const game = document.getElementById("game");
const g = game.getContext("2d");
const W = game.width, H = game.height;
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("gameOverlay");
const startBtn = document.getElementById("startBtn");

let ship, items, particles, score, lives, running = false, paused = false, spawnTimer, lastTime;
const keys = {};

// 最高分存在瀏覽器裡（存不了也沒關係）
let best = 0;
try { best = Number(localStorage.getItem("starBest")) || 0; } catch (e) {}
bestEl.textContent = best;

function startGame() {
  ship = { x: W / 2, y: H - 40, r: 22 };
  items = [];
  particles = [];
  score = 0;
  lives = 3;
  spawnTimer = 0;
  updateHud();
  resumeGame();
}

// 把滑鼠鎖在遊戲畫面裡（按 Esc 可以放開滑鼠，遊戲會暫停）
function lockMouse() {
  if (!game.requestPointerLock) return; // 手機不支援，直接跳過
  const p = game.requestPointerLock();
  if (p && p.catch) p.catch(() => {});
}

function resumeGame() {
  running = true;
  paused = false;
  overlay.classList.add("hidden");
  lockMouse();
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function pauseGame() {
  running = false;
  paused = true;
  document.getElementById("overlayTitle").textContent = "⏸️ 暫停中";
  document.getElementById("overlayText").textContent = "滑鼠已放開，按下按鈕繼續";
  startBtn.textContent = "繼續遊戲 ▶️";
  overlay.classList.remove("hidden");
}

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement !== game && running) pauseGame();
});

function endGame() {
  running = false;
  paused = false;
  if (document.pointerLockElement === game) document.exitPointerLock();
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    try { localStorage.setItem("starBest", best); } catch (e) {}
    document.getElementById("overlayTitle").textContent = "🏆 新紀錄！";
  } else {
    document.getElementById("overlayTitle").textContent = "遊戲結束！";
  }
  document.getElementById("overlayText").textContent = `你得到了 ${score} 分`;
  startBtn.textContent = "再玩一次 🔁";
  overlay.classList.remove("hidden");
}

function updateHud() {
  scoreEl.textContent = score;
  livesEl.textContent = "❤️".repeat(lives) || "💀";
}

// 分數越高，東西掉越快、越多
function spawnItem() {
  const level = 1 + score / 15;
  items.push({
    x: 20 + Math.random() * (W - 40),
    y: -20,
    r: 16,
    speed: (90 + Math.random() * 80) * Math.min(level, 3),
    type: Math.random() < 0.3 + Math.min(score / 100, 0.25) ? "rock" : "star",
  });
}

function burst(x, y, color) {
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 60 + Math.random() * 140;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6, color });
  }
}

function loop(now) {
  if (!running) return;
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  // 鍵盤移動
  if (keys.ArrowLeft || keys.a) ship.x -= 380 * dt;
  if (keys.ArrowRight || keys.d) ship.x += 380 * dt;
  ship.x = Math.max(ship.r, Math.min(W - ship.r, ship.x));

  // 產生星星和隕石
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnItem();
    spawnTimer = Math.max(0.35, 0.9 - score * 0.01);
  }

  // 移動 + 碰撞判斷
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    it.y += it.speed * dt;
    const hit = Math.hypot(it.x - ship.x, it.y - ship.y) < it.r + ship.r;
    if (hit) {
      items.splice(i, 1);
      if (it.type === "star") {
        score++;
        burst(it.x, it.y, "#ffe066");
      } else {
        lives--;
        burst(it.x, it.y, "#ff4d4d");
        game.parentElement.animate(
          [{ transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }],
          { duration: 200 }
        );
      }
      updateHud();
      if (lives <= 0) return endGame();
    } else if (it.y > H + 20) {
      items.splice(i, 1);
    }
  }

  // 爆炸粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  draw();
  requestAnimationFrame(loop);
}

function draw() {
  g.clearRect(0, 0, W, H);
  g.textAlign = "center";
  g.textBaseline = "middle";

  g.font = "30px sans-serif";
  for (const it of items) g.fillText(it.type === "star" ? "⭐" : "☄️", it.x, it.y);

  for (const p of particles) {
    g.globalAlpha = p.life / 0.6;
    g.fillStyle = p.color;
    g.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  g.globalAlpha = 1;

  g.font = "42px sans-serif";
  g.fillText("🛸", ship.x, ship.y);
}

// 操作方式：滑鼠、手指、鍵盤
function moveTo(clientX) {
  if (!running) return;
  const rect = game.getBoundingClientRect();
  ship.x = ((clientX - rect.left) / rect.width) * W;
}
game.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement === game) {
    // 滑鼠被鎖住時，用「移動了多少」來移動飛碟
    const rect = game.getBoundingClientRect();
    ship.x += e.movementX * (W / rect.width);
  } else {
    moveTo(e.clientX);
  }
});
game.addEventListener("touchmove", (e) => { e.preventDefault(); moveTo(e.touches[0].clientX); }, { passive: false });
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (running && (e.key === "ArrowLeft" || e.key === "ArrowRight")) e.preventDefault();
});
window.addEventListener("keyup", (e) => { keys[e.key] = false; });
startBtn.addEventListener("click", () => (paused ? resumeGame() : startGame()));
