const translations = {
  ru: {
    pageTitle: "skypills",
    description:
      "Карточка навыков skypills: HTML/CSS, JavaScript, C# .NET, Django, Linux, Telegram API.",
    eyebrow: "привет, я",
    role: "Фронтенд-разработчик",
    skillsTitle: "Мои скилы",
    skillsAria: "Навыки",
    github: "Мой GitHub",
    status: "открыт к проектам",
  },
  en: {
    pageTitle: "skypills",
    description:
      "skypills skills card: HTML/CSS, JavaScript, C# .NET, Django, Linux, Telegram API.",
    eyebrow: "hi, I'm",
    role: "Front-end Developer",
    skillsTitle: "My skills",
    skillsAria: "Skills",
    github: "My GitHub",
    status: "open to projects",
  },
};

const langButtons = document.querySelectorAll("[data-lang]");
const descriptionMeta = document.querySelector('meta[name="description"]');

function applyLanguage(lang) {
  const dictionary = translations[lang] || translations.ru;

  document.documentElement.lang = lang;
  document.title = dictionary.pageTitle;

  if (descriptionMeta) {
    descriptionMeta.setAttribute("content", dictionary.description);
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = dictionary[element.dataset.i18n];
    if (value) element.textContent = value;
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const value = dictionary[element.dataset.i18nAria];
    if (value) element.setAttribute("aria-label", value);
  });

  langButtons.forEach((button) => {
    const isActive = button.dataset.lang === lang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  try {
    localStorage.setItem("skypills-lang", lang);
  } catch (error) {}
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

applyLanguage(document.documentElement.lang === "en" ? "en" : "ru");

const card = document.getElementById("card");
const cardGlowActive = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

card?.addEventListener("animationend", () => {
  card.style.animation = "none";
  card.style.opacity = "1";
});

if (card && cardGlowActive) {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
}

const canvas = document.getElementById("field");
const ctx = canvas?.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && ctx) {
  const palette = [
    { r: 139, g: 92, b: 246 },
    { r: 56, g: 189, b: 248 },
    { r: 34, g: 211, b: 238 },
    { r: 167, g: 139, b: 250 },
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let rings = [];
  let raf = 0;
  let visible = true;

  const pointer = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    tx: window.innerWidth / 2,
    ty: window.innerHeight / 2,
    active: false,
  };

  const parallax = { x: 0, y: 0, tx: 0, ty: 0 };

  function createParticles() {
    const count = Math.min(120, Math.max(34, Math.round((width * height) / 15000)));
    particles = Array.from({ length: count }, () => {
      const color = palette[Math.floor(Math.random() * palette.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        r: Math.random() * 1.3 + 0.7,
        color,
        alpha: Math.random() * 0.35 + 0.25,
      };
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
    if (reduceMotion) paintStatic();
  }

  function drawRings() {
    for (let i = rings.length - 1; i >= 0; i -= 1) {
      const ring = rings[i];
      ring.radius += (ring.max - ring.radius) * 0.045 + 0.5;
      ring.alpha *= 0.975;

      if (ring.alpha < 0.01) {
        rings.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(125, 211, 252, ${ring.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  function step() {
    raf = 0;
    ctx.clearRect(0, 0, width, height);

    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;
    parallax.x += (parallax.tx - parallax.x) * 0.05;
    parallax.y += (parallax.ty - parallax.y) * 0.05;

    const aurora = document.querySelector(".aurora");
    if (aurora) {
      aurora.style.transform = `translate3d(${parallax.x.toFixed(2)}px, ${parallax.y.toFixed(2)}px, 0)`;
    }

    const mouseRadius = Math.min(190, Math.max(130, width * 0.16));
    const linkDist = 125;

    if (pointer.active) {
      const glow = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        mouseRadius * 1.15
      );
      glow.addColorStop(0, "rgba(124, 58, 237, 0.16)");
      glow.addColorStop(0.45, "rgba(56, 189, 248, 0.06)");
      glow.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy) || 1;

        if (dist < mouseRadius) {
          const force = (1 - dist / mouseRadius) * 0.55;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = `rgba(125, 211, 252, ${(1 - dist / mouseRadius) * 0.18})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist < linkDist) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(148, 163, 255, ${(1 - dist / linkDist) * 0.09})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    drawRings();

    if (visible) {
      raf = requestAnimationFrame(step);
    }
  }

  function paintStatic() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
      ctx.fill();
    }
  }

  function start() {
    if (!reduceMotion && !raf && visible) {
      raf = requestAnimationFrame(step);
    }
  }

  if (!reduceMotion) {
    window.addEventListener("pointermove", (event) => {
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      pointer.active = true;

      parallax.tx = (event.clientX / window.innerWidth - 0.5) * -34;
      parallax.ty = (event.clientY / window.innerHeight - 0.5) * -34;

      start();
    });

    window.addEventListener("pointerdown", (event) => {
      rings.push({ x: event.clientX, y: event.clientY, radius: 0, max: 240, alpha: 0.35 });
      start();
    });

    window.addEventListener("pointerleave", () => {
      pointer.active = false;
      parallax.tx = 0;
      parallax.ty = 0;
    });
  }

  window.addEventListener("resize", resize);

  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    if (visible) start();
    else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });

  resize();

  if (!reduceMotion) start();
}
