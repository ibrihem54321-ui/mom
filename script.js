/* ====================================================================
   كل سنة وأنتِ طيبة يا أمي ❤️ — Interactive Story Experience
   --------------------------------------------------------------------
   محرك المشاهد (Scene Engine): يعرض 8 مشاهد بالترتيب، كل مشهد دالة
   مستقلة قابلة للتعديل بسهولة دون التأثير على باقي المشاهد.
   ==================================================================== */

'use strict';

/* ------------------------------------------------------------------ *
 * 0) أدوات مساعدة عامة (Utilities)
 * ------------------------------------------------------------------ */

const stageEl   = document.getElementById('stage');
const flashEl   = document.getElementById('flash-overlay');
const dotsEl    = document.getElementById('progress-dots');
const canvas    = document.getElementById('fx-canvas');
const ctx       = canvas.getContext('2d');
const musicEl   = document.getElementById('bg-music');
const musicBtn  = document.getElementById('music-fallback-btn');

/** تأخير بسيط قائم على Promise لتسلسل الخطوات داخل كل مشهد */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** إنشاء عنصر DOM بسرعة مع كلاس اختياري */
function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

/** رقم عشوائي بين قيمتين */
const rand = (min, max) => Math.random() * (max - min) + min;

/* ------------------------------------------------------------------ *
 * 1) إدارة المشاهد: الحقن، الانتقال الناعم، ومؤشر التقدم
 * ------------------------------------------------------------------ */

const TOTAL_SCENES = 8;
let currentSceneEl = null;

/** يبني نقاط التقدم أسفل الشاشة مرة واحدة عند البدء */
function buildProgressDots() {
  for (let i = 0; i < TOTAL_SCENES; i++) {
    dotsEl.appendChild(el('span'));
  }
}

/** يحدّث النقطة النشطة في مؤشر التقدم */
function setActiveDot(index) {
  [...dotsEl.children].forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

/**
 * ينتقل من المشهد الحالي إلى مشهد جديد بانتقال ناعم (fade+scale).
 * يُعيد عنصر المشهد الجديد بعد إدراجه في الصفحة.
 */
async function goToScene(sceneIndex, buildInner) {
  setActiveDot(sceneIndex);

  if (currentSceneEl) {
    currentSceneEl.classList.add('scene-out');
    await wait(250); // مدة var(--dur-fast)
    currentSceneEl.remove();
  }

  const sceneNode = el('section', 'scene');
  sceneNode.setAttribute('data-scene', String(sceneIndex + 1));
  buildInner(sceneNode);
  stageEl.appendChild(sceneNode);
  currentSceneEl = sceneNode;

  // نمنح المتصفح فريمًا واحدًا لتفعيل أنيميشن الدخول scene-in بسلاسة
  await wait(30);
  return sceneNode;
}

/** يضبط "مزاج" الخلفية اللونية (تقني بارد → دافئ → احتفالي) */
function setMood(mood) {
  document.body.setAttribute('data-mood', mood);
}

/* ------------------------------------------------------------------ *
 * 2) عنصر بطاقة الحالة (HUD) — التوقيع البصري المشترك للمشاهد
 *    1 / 3 / 4 / 5
 * ------------------------------------------------------------------ */

function buildHudCard(iconEmoji) {
  const card = el('div', 'hud-card');
  card.innerHTML = `
    <div class="hud-icon">${iconEmoji}</div>
    <div class="hud-label" data-role="label"></div>
    <div class="hud-sublabel" data-role="sublabel"></div>
  `;
  return card;
}

/** يبني/يحدّث شريط تقدم مع نسبة مئوية نصية */
function buildProgressTrack() {
  const wrap = el('div', 'progress-track');
  const fill = el('div', 'progress-fill');
  wrap.appendChild(fill);
  return { wrap, fill };
}

function setProgress(fillEl, percentEl, value) {
  fillEl.style.width = value + '%';
  if (percentEl) percentEl.textContent = value + '%';
}

/** أيقونة صح تترسم بنفسها (SVG) — تُستخدم بعد "تم التحقق/التأكيد" */
function buildCheckBadge() {
  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  wrapper.setAttribute('viewBox', '0 0 60 60');
  wrapper.setAttribute('class', 'check-badge');
  wrapper.innerHTML = `
    <circle cx="30" cy="30" r="25"></circle>
    <path d="M18 31 L26 39 L42 21"></path>
  `;
  return wrapper;
}

/* ------------------------------------------------------------------ *
 * 3) المشهد الأول — التحقق من المستخدم (≈8 ثوانٍ)
 * ------------------------------------------------------------------ */

async function sceneOne() {
  setMood('cool');
  const node = await goToScene(0, (root) => {
    root.appendChild(buildHudCard('🔒'));
  });

  const label    = node.querySelector('[data-role="label"]');
  const sublabel = node.querySelector('[data-role="sublabel"]');
  const card     = node.querySelector('.hud-card');

  label.textContent = 'جارٍ التحقق من هوية المستخدم...';

  const { wrap, fill } = buildProgressTrack();
  const percent = el('div', 'progress-percent', '0%');
  card.appendChild(wrap);
  card.appendChild(percent);

  // خطوات الشريط كما هي في السيناريو: 0 → 25 → 53 → 78 → 100
  const steps = [0, 25, 53, 78, 100];
  for (const step of steps) {
    setProgress(fill, percent, step);
    await wait(420);
  }

  wrap.remove();
  percent.remove();

  sublabel.textContent = '✅ تم العثور على مستخدم واحد.';
  await wait(750);

  sublabel.textContent = 'جارٍ التحقق...';
  await wait(750);

  sublabel.textContent = '';
  const checkLine = el('div', 'status-line');
  checkLine.appendChild(buildCheckBadge());
  const checkText = el('span', null, 'تم التحقق بنجاح.');
  checkLine.appendChild(checkText);
  card.appendChild(checkLine);
  await wait(950);

  checkLine.remove();
  label.textContent = '';

  // العد التنازلي: ٣ ٢ ١ ٠
  const countdownEl = el('div', 'countdown-number');
  card.appendChild(countdownEl);
  const arabicDigits = ['٣', '٢', '١', '٠'];
  for (const digit of arabicDigits) {
    countdownEl.textContent = '';
    // إعادة تشغيل الأنيميشن مع كل رقم جديد
    void countdownEl.offsetWidth;
    countdownEl.style.animation = 'none';
    countdownEl.textContent = digit;
    void countdownEl.offsetWidth;
    countdownEl.style.animation = '';
    await wait(480);
  }

  // فلاش أبيض خفيف قبل الانتقال للمشهد التالي
  flashEl.classList.add('flash-active');
  await wait(500);
  flashEl.classList.remove('flash-active');
}

/* ------------------------------------------------------------------ *
 * 4) المشهد الثاني — أوعي تدوسي 😂 (تفاعلي، بلا مؤقّت ثابت)
 * ------------------------------------------------------------------ */

function sceneTwo() {
  return new Promise(async (resolve) => {
    const node = await goToScene(1, (root) => {
      const btn = el('button', 'big-button', '🚫 أوعي تدوسي عليا');
      btn.type = 'button';
      root.appendChild(btn);
    });

    const firstBtn = node.querySelector('.big-button');

    firstBtn.addEventListener('click', async function onFirstClick() {
      firstBtn.removeEventListener('click', onFirstClick);
      firstBtn.classList.add('shake');
      await wait(500);

      firstBtn.remove();

      const face = el('div', 'reaction-face', '😂');
      const text = el('div', 'reaction-text', 'هو أنا مش قولت أوعي تدوسي؟');
      node.appendChild(face);
      node.appendChild(text);

      await wait(1000);

      const secondBtn = el('button', 'big-button secondary', 'طيب خلاص...<br>دوسي هنا 😄');
      secondBtn.type = 'button';
      node.appendChild(secondBtn);

      secondBtn.addEventListener('click', () => resolve(), { once: true });
    }, { once: true });
  });
}

/* ------------------------------------------------------------------ *
 * 5) المشهد الثالث — البحث عن أفضل أم 🔍 (≈6 ثوانٍ)
 * ------------------------------------------------------------------ */

async function sceneThree() {
  const node = await goToScene(2, (root) => {
    root.appendChild(buildHudCard('🔎'));
  });

  const label    = node.querySelector('[data-role="label"]');
  const sublabel = node.querySelector('[data-role="sublabel"]');
  const card     = node.querySelector('.hud-card');

  label.textContent = 'جارٍ البحث...';
  const queryLine = el('div', 'hud-sublabel', '👑 أفضل أم...');
  card.appendChild(queryLine);

  const { wrap, fill } = buildProgressTrack();
  card.appendChild(wrap);
  await wait(150);
  fill.style.transition = 'width 1.8s cubic-bezier(0.22,1,0.36,1)';
  setProgress(fill, null, 100);
  await wait(1900);

  wrap.remove();
  queryLine.remove();
  label.textContent = '';

  sublabel.textContent = 'تم العثور على شخص واحد فقط ❤️';
  await wait(900);

  sublabel.textContent = 'جاري مطابقة البيانات...';
  await wait(800);

  sublabel.textContent = '';
  const confirmLine = el('div', 'status-line');
  confirmLine.appendChild(buildCheckBadge());
  confirmLine.appendChild(el('span', null, 'تم التأكيد بنجاح ✅'));
  card.appendChild(confirmLine);
  await wait(1000);
}

/* ------------------------------------------------------------------ *
 * 6) المشهد الرابع — تحليل النتائج 😄 (≈8 ثوانٍ)
 * ------------------------------------------------------------------ */

/** يشغّل معيار تحليل واحد: عنوان + شريط يتصاعد + نتيجة نهائية */
async function runMetric(card, { title, steps, stepDelay, resultText, overload }) {
  const block = el('div', 'metric-block');
  const titleEl = el('div', 'metric-title', title);
  const { wrap, fill } = buildProgressTrack();
  const percent = el('div', 'progress-percent', steps[0] + '%');
  if (overload) wrap.classList.add('overload');

  block.appendChild(titleEl);
  block.appendChild(wrap);
  block.appendChild(percent);
  card.appendChild(block);

  for (const step of steps) {
    setProgress(fill, percent, step);
    await wait(stepDelay);
  }

  await wait(250);

  if (overload) {
    const warn = el('div', 'warning-line', '⚠️ القيمة تجاوزت الحد المسموح به 😂');
    block.appendChild(warn);
  } else {
    const result = el('div', 'metric-result', resultText);
    block.appendChild(result);
  }

  await wait(700);
  return block;
}

async function sceneFour() {
  const node = await goToScene(3, (root) => {
    root.appendChild(buildHudCard('📊'));
  });

  const label = node.querySelector('[data-role="label"]');
  const card  = node.querySelector('.hud-card');
  label.remove();
  node.querySelector('.hud-sublabel').remove();

  await runMetric(card, {
    title: 'جارٍ حساب مستوى الطيبة...',
    steps: [20, 45, 82, 99, 100],
    stepDelay: 260,
    resultText: 'مرتفعة جدًا ❤️',
  });

  const b1 = card.querySelector('.metric-block');
  await wait(200);
  b1.remove();

  await runMetric(card, {
    title: 'جارٍ حساب مستوى الحنان...',
    steps: [30, 65, 100],
    stepDelay: 260,
    resultText: 'غير قابل للقياس 🤍',
  });
  card.querySelector('.metric-block').remove();

  await runMetric(card, {
    title: 'جارٍ حساب مستوى الصبر...',
    steps: [40, 70, 100],
    stepDelay: 260,
    resultText: 'أسطوري ✨',
  });
  card.querySelector('.metric-block').remove();

  await runMetric(card, {
    title: 'جارٍ حساب مستوى الحب...',
    steps: [500, 2500, 6000, 9999],
    stepDelay: 260,
    overload: true,
  });
  await wait(600);
}

/* ------------------------------------------------------------------ *
 * 7) المشهد الخامس — تجهيز الحفلة 🎈 (≈6 ثوانٍ)
 * ------------------------------------------------------------------ */

async function sceneFive() {
  setMood('warm');
  const node = await goToScene(4, () => {});
  const card = el('div', 'hud-card');
  node.appendChild(card);

  const items = [
    { emoji: '🎈', label: 'جاري نفخ البلالين...', target: 80 },
    { emoji: '🎂', label: 'جاري تجهيز التورتة...', target: 95 },
    { emoji: '🕯️', label: 'جاري إشعال الشموع...', target: 100 },
  ];

  const bars = items.map((item) => {
    const wrapItem = el('div', 'prep-item');
    const labelEl = el('div', 'prep-label', `<span class="prep-emoji">${item.emoji}</span><span>${item.label}</span>`);
    const { wrap, fill } = buildProgressTrack();
    wrapItem.appendChild(labelEl);
    wrapItem.appendChild(wrap);
    card.appendChild(wrapItem);
    fill.style.transition = 'width 1.6s cubic-bezier(0.22,1,0.36,1)';
    return { fill, target: item.target };
  });

  await wait(150);
  bars.forEach(({ fill, target }) => setProgress(fill, null, target));
  await wait(1700);

  const doneLine = el('div', 'status-line', '✨ اكتمل التحضير...');
  card.appendChild(doneLine);
  await wait(700);

  card.innerHTML = '';
  const countdownEl = el('div', 'countdown-number');
  card.appendChild(countdownEl);
  for (const digit of ['٣', '٢', '١']) {
    countdownEl.style.animation = 'none';
    countdownEl.textContent = digit;
    void countdownEl.offsetWidth;
    countdownEl.style.animation = '';
    await wait(450);
  }
}

/* ------------------------------------------------------------------ *
 * 8) المشهد السادس — الاحتفال 🎉
 *    (كونفيتي + بالونات + تورتة + لمعات + قلوب + موسيقى)
 * ------------------------------------------------------------------ */

let confettiRunning = false;
let confettiParticles = [];
let spawnIntervals = [];

/** يهيّئ الكانفاس بحجم الشاشة الفعلي (يدعم إعادة تغيير الحجم/الدوران) */
function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = ['#ef5f8a', '#ecc25f', '#f6dc9c', '#f592ac', '#ffffff'];

function spawnConfettiBurst(count = 60) {
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: rand(0, window.innerWidth),
      y: rand(-60, -10),
      w: rand(6, 11),
      h: rand(9, 15),
      color: CONFETTI_COLORS[Math.floor(rand(0, CONFETTI_COLORS.length))],
      speedY: rand(1.4, 3.2),
      speedX: rand(-1, 1),
      rotation: rand(0, 360),
      rotationSpeed: rand(-6, 6),
    });
  }
}

function confettiLoop() {
  if (!confettiRunning) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  confettiParticles.forEach((p) => {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotationSpeed;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });

  // إزالة القطع التي خرجت من الشاشة
  confettiParticles = confettiParticles.filter((p) => p.y < window.innerHeight + 40);

  requestAnimationFrame(confettiLoop);
}

/** ينشئ بالونة واحدة تطفو من أسفل الشاشة */
function spawnBalloon() {
  const emojis = ['🎈', '🎈', '🎈', '💗'];
  const balloon = el('div', 'balloon', emojis[Math.floor(rand(0, emojis.length))]);
  const leftPos = rand(5, 90);
  balloon.style.left = leftPos + 'vw';
  balloon.style.setProperty('--drift', rand(-40, 40) + 'px');
  balloon.style.setProperty('--tilt', rand(-12, 12) + 'deg');
  balloon.style.animationDuration = rand(5, 8) + 's';
  document.body.appendChild(balloon);
  balloon.addEventListener('animationend', () => balloon.remove());
}

/** ينشئ قلبًا طافيًا صغيرًا */
function spawnHeart() {
  const heart = el('div', 'floating-heart', ['💖', '💕', '🤍'][Math.floor(rand(0, 3))]);
  heart.style.left = rand(10, 90) + 'vw';
  heart.style.animationDuration = rand(3.5, 5.5) + 's';
  document.body.appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
}

/** ينشئ لمعة صغيرة في موضع عشوائي */
function spawnSparkle() {
  const sparkle = el('div', 'sparkle', '✨');
  sparkle.style.left = rand(5, 95) + 'vw';
  sparkle.style.top = rand(5, 70) + 'vh';
  document.body.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 1700);
}

/** يوقف كل مولّدات التأثيرات (يُستخدم عند الانتقال للمشهد الأخير) */
function stopFxSpawners() {
  spawnIntervals.forEach(clearInterval);
  spawnIntervals = [];
}

/**
 * تشغيل الموسيقى الخلفية.
 * إن مُنع التشغيل التلقائي من المتصفح (سياسة شائعة على الموبايل)،
 * يظهر زر احتياطي صغير أعلى الشاشة يشغّلها عند الضغط عليه.
 */
function startBackgroundMusic() {
  if (!musicEl.querySelector('source')) return; // لا يوجد مصدر صوت مضاف بعد
  musicEl.volume = 0.6;
  const playPromise = musicEl.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      musicBtn.classList.remove('hidden');
    });
  }
}
musicBtn.addEventListener('click', () => {
  musicEl.play().catch(() => {});
  musicBtn.classList.add('hidden');
});

async function sceneSix() {
  setMood('celebrate');
  const node = await goToScene(5, (root) => {
    const hero = el('div', 'celebrate-hero');
    hero.innerHTML = `
      <div class="celebrate-emoji-row">
        <span>🎉</span><span>🎈</span><span>🎆</span><span>💥</span>
      </div>
      <div class="cake-wrap">🎂<span class="candle-flame">🕯️</span></div>
      <div class="celebrate-title">يلا نحتفل!</div>
    `;
    root.appendChild(hero);
  });

  // بدء الموسيقى الخلفية مع دخول مشهد الاحتفال
  startBackgroundMusic();

  // بدء الكونفيتي على الكانفاس
  confettiRunning = true;
  spawnConfettiBurst(90);
  requestAnimationFrame(confettiLoop);
  spawnIntervals.push(setInterval(() => spawnConfettiBurst(20), 900));

  // بدء البالونات والقلوب واللمعات بشكل متكرر
  spawnIntervals.push(setInterval(spawnBalloon, 550));
  spawnIntervals.push(setInterval(spawnHeart, 700));
  spawnIntervals.push(setInterval(spawnSparkle, 400));

  await wait(2600);
  void node; // المشهد يبقى ظاهرًا بينما تستمر التأثيرات في الخلفية
}

/* ------------------------------------------------------------------ *
 * 9) المشهد السابع — الرسالة الرئيسية ❤️ (كتابة حرف بحرف)
 * ------------------------------------------------------------------ */

/** يكتب نصًا داخل عنصر حرفًا بحرف مع مؤشر وامض */
async function typeText(container, text, speed = 55) {
  container.textContent = '';
  const cursor = el('span', 'cursor');
  for (const char of text) {
    container.textContent += char;
    await wait(speed);
  }
  container.appendChild(cursor);
  await wait(400);
  cursor.remove();
}

async function sceneSeven() {
  const node = await goToScene(6, (root) => {
    const block = el('div', 'message-block');
    block.innerHTML = `
      <div class="message-emoji">🎂</div>
      <div class="typewriter-line" data-role="main"></div>
      <div class="typewriter-line sub" data-role="sub1"></div>
      <div class="typewriter-line sub" data-role="sub2"></div>
    `;
    root.appendChild(block);
  });

  const main = node.querySelector('[data-role="main"]');
  const sub1 = node.querySelector('[data-role="sub1"]');
  const sub2 = node.querySelector('[data-role="sub2"]');

  await typeText(main, 'كل سنة وأنتِ طيبة يا أمي ❤️', 60);
  await wait(500);
  await typeText(sub1, 'ربنا يديم ضحكتك.', 45);
  await wait(400);
  await typeText(sub2, 'ويحققلك كل اللي نفسك فيه.', 45);
  await wait(1400);
}

/* ------------------------------------------------------------------ *
 * 10) المشهد الثامن — النهاية 🌹 (تهدئة الحركة + رسائل ختامية)
 * ------------------------------------------------------------------ */

async function sceneEight() {
  // تهدئة تدريجية: نوقف مولّدات البالونات/القلوب/اللمعات الجديدة،
  // ونخفّف الكونفيتي، لكن نترك ما تبقى يكمل مساره بهدوء
  stopFxSpawners();
  spawnIntervals.push(setInterval(() => spawnSparkle(), 1300)); // لمعات خفيفة متبقية

  const node = await goToScene(7, (root) => {
    root.appendChild(el('div', 'ending-block'));
  });
  const block = node.querySelector('.ending-block');

  const lines = [
    'ربنا يخليكي يا أمي ❤️',
    'ويارب تفضلي معايا دايمًا.',
    'بحبك جدًا.',
  ];

  for (const line of lines) {
    const p = el('p', 'ending-line', line);
    block.appendChild(p);
    await wait(2000);
  }

  const signature = el('p', 'ending-signature', 'صُنع بكل الحب... من ابنك إبراهيم ❤️');
  block.appendChild(signature);
  const closeBtn = el('button', 'close-btn', 'خلاص بقي دوس هنا ✕');
  closeBtn.type = 'button';
  block.appendChild(closeBtn);
  closeBtn.addEventListener('click', () => {
    window.close();
    closeBtn.textContent = 'ممكن تقفلي التاب دلوقتي 🌸';
    closeBtn.disabled = true;
  });

  // تقليل شدة الكونفيتي تدريجيًا حتى التوقف التام
  const fadeOut = setInterval(() => {
    confettiParticles = confettiParticles.slice(0, Math.floor(confettiParticles.length * 0.7));
    if (confettiParticles.length < 4) {
      confettiRunning = false;
      clearInterval(fadeOut);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }, 700);
}

/* ------------------------------------------------------------------ *
 * 11) تسلسل التجربة الكامل
 * ------------------------------------------------------------------ */

async function runExperience() {
  buildProgressDots();

  await sceneOne();
  await sceneTwo();
  await sceneThree();
  await sceneFour();
  await sceneFive();
  await sceneSix();
  await sceneSeven();
  await sceneEight();
  // التجربة تستقر هنا على المشهد الأخير بدون انتقال آخر
}

// تشغيل التجربة عند اكتمال تحميل الصفحة

document.addEventListener('DOMContentLoaded', runExperience);
