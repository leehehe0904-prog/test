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
