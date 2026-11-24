// A small perspective projection lets the map run without a 3D engine.
const scene = document.querySelector("[data-orbit]");
const canvas = scene?.querySelector("canvas");
const ctx = canvas?.getContext("2d");
if (ctx) activate();


function createLetterLights() {
  if (!window.CSS?.highlights || !window.Intl?.Segmenter) return () => {};
  const copy = scene.parentElement.querySelector(".hero-copy");
  const segmenter = new Intl.Segmenter(document.documentElement.lang, {granularity: "grapheme"});
  const letters = [];
  // Highlight text ranges in place so Persian letters keep their joined shaping.
  for (const element of copy.querySelectorAll(".eyebrow, h1, .hero-intro")) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      for (const {index, segment} of segmenter.segment(node.textContent)) {
        if (!segment.trim()) continue;
        const range = new Range();
        range.setStart(node, index);
        range.setEnd(node, index + segment.length);
        letters.push(range);
      }
    }
  }
  const dim = new Highlight();
  const halo = new Highlight();
  const glow = new Highlight();
  halo.priority = 1;
  glow.priority = 2;
  CSS.highlights.set("orbit-dim", dim);
  CSS.highlights.set("orbit-halo", halo);
  CSS.highlights.set("orbit-glow", glow);
  const states = new Int8Array(letters.length).fill(-1);
  const layers = [null, dim, halo, glow];
  return (seconds, moving) => {
    letters.forEach((range, index) => {
      const age = seconds - index * 0.031;
      const period = 5.4 + (index * 0.379) % 4.1;
      const phase = (age + (index * 2.718) % period) % period;
      let state = 0;
      if (moving) {
        if (age < 0) state = 1;
        else if (age < 0.52 || (age > 2 && phase < 0.58)) {
          const pulse = age < 0.52 ? age : phase;
          state = pulse > 0.13 && pulse < 0.34 ? 3 : 2;
        }
      }
      if (states[index] === state) return;
      layers[states[index]]?.delete(range);
      layers[state]?.add(range);
      states[index] = state;
    });
  };
}

function activate() {
  const nodes = [...scene.querySelectorAll("[data-node]")];
  const cards = [...scene.querySelectorAll(".orbit-card")];
  const controls = scene.parentElement.querySelector(".orbit-controls");
  const motionButton = controls.querySelector('[data-orbit-action="motion"]');
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const palette = ["86,216,204", "249,164,92", "124,191,232"];
  const anchors = [
    [-0.78, -0.56, 0.11],
    [0.74, -0.39, 0.2],
    [0.52, 0.23, 0.03],
  ];
  let seed = 8473;
  const random = () =>
    (seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const stars = Array.from({ length: 130 }, () => [
    random(),
    random(),
    0.25 + random(),
    random() * 0.5 + 0.12,
  ]);
  const bundles = [];
  function add(end, group, featured = false) {
    const phi = random() * Math.PI * 2,
      curvature = 0.18 + 0.2 * random(),
      wobble = 0.04 + 0.07 * random();
    const strands = [];
    for (let j = 0; j < (featured ? 10 : 4); j++) {
      const fan = (j - (featured ? 4.5 : 1.5)) * 0.017,
        line = [];
      for (let i = 0; i <= 29; i++) {
        const t = i / 29,
          s = Math.sin(Math.PI * t),
          a = phi + t * (3.4 + group * 0.35);
        const curl = s * (curvature + fan),
          ripple = s * Math.sin(t * 8 + phi) * wobble;
        line.push([
          end[0] * t + Math.cos(a) * curl + ripple,
          end[1] * t + Math.sin(a) * curl * 0.87 + fan * s * Math.cos(t * 5),
          end[2] * t + Math.sin(a + 0.8) * curl * 0.72 + fan * s,
        ]);
      }
      strands.push(line);
    }
    bundles.push({
      strands,
      group,
      featured,
      offset: random(),
      bright: 0.55 + random() * 0.45,
    });
  }
  for (let i = 0; i < 55; i++) {
    const azimuth = random() * Math.PI * 2,
      depth = random() * 1.75 - 0.87,
      radius = 0.3 + Math.pow(random(), 0.6) * 0.76;
    const spread = Math.sqrt(1 - depth * depth);
    add(
      [
        Math.cos(azimuth) * spread * radius,
        Math.sin(azimuth) * spread * radius * 0.92,
        depth * radius,
      ],
      Math.cos(azimuth) > 0.3 ? (i % 4 ? 1 : 0) : i % 3 ? 0 : 2,
    );
  }
  anchors.forEach((point, index) => add(point, index, true));
  const dust = Array.from({ length: 225 }, () => {
    let a = random() * Math.PI * 2,
      r = Math.pow(random(), 1.7) * 0.24,
      z = (random() - 0.5) * 0.24;
    return [Math.cos(a) * r, Math.sin(a) * r * 0.8, z, random()];
  });
  const copy = scene.parentElement.querySelector(".hero-copy");
  const updateLights = createLetterLights();
  let copyTop = 0;
  // All three inclined orbits use the same projection as their stars.
  const tracks = [0.16, -0.32, 0.45].map((tilt, i) =>
    Array.from({length: 181}, (_, step) => {
      const t = step * Math.PI / 90;
      const x = Math.cos(t) * (1.28 - i * 0.09);
      const y = Math.sin(t) * (0.64 + i * 0.08);
      return [x * Math.cos(tilt) - y * Math.sin(tilt),
        x * Math.sin(tilt) + y * Math.cos(tilt), Math.sin(t) * 0.36];
    })
  );
  const sky = document.createElement("canvas");
  // A static spiral of stardust is drawn once per layout, behind the moving orbit.
  const galaxy = Array.from({length: 5600}, () => {
    const r = 0.05 + Math.pow(random(), 0.72) * 1.13;
    const a = (Math.floor(random() * 3) * Math.PI * 2 / 3) + r * 4.8
      + (random() - 0.5) * (0.35 + r * 0.9);
    const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.40 + (random() - 0.5) * 0.10;
    return [x * 0.94 + y * 0.34, -x * 0.34 + y * 0.94,
      0.35 + random() ** 3 * 1.1, 0.08 + random() ** 2 * 0.55, Math.cos(a) > 0.25];
  });
  let centerX = 0, centerY = 0;
  let width = 1,
    height = 1,
    scale = 1,
    yaw = 0,
    pitch = 0,
    zoom = 1,
    moving = !reduced.matches;
  let visible = true,
    frame = 0,
    last = 0,
    time = 0,
    selected = -1,
    drag = false,
    hover = null,
    pinch = 0;
  const pointers = new Map();
  function motionLabel() {
    motionButton.textContent = moving
      ? motionButton.dataset.pause
      : motionButton.dataset.play;
  }
  function resize() {
    const rect = scene.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (width < 1 || height < 1) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    copyTop = copy.getBoundingClientRect().top - rect.top;
    centerX = width * 0.5;
    const skyHeight = Math.max(1, copyTop - 80);
    centerY = 80 + skyHeight / 2;
    // A single pixel scale preserves the geometry in portrait and landscape.
    scale = Math.min(width * 0.365, height * 0.5, skyHeight * 0.64);
    sky.width = canvas.width;
    sky.height = canvas.height;
    const bg = sky.getContext("2d");
    bg.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const [x, y, r, opacity] of stars) {
      bg.fillStyle = `rgba(198,220,237,${opacity})`;
      bg.fillRect(x * width, y * height, r, r);
    }
    const radius = scale * 1.30;
    for (const [x, y, size, opacity, warm] of galaxy) {
      bg.fillStyle = `rgba(${warm ? "254,189,144" : "155,214,231"},${opacity})`;
      bg.fillRect(centerX + x * radius, centerY + y * radius, size, size);
    }
    queue();
  }
  // Rotation is shared by the field, the central nucleus and the three HTML links.
  function projection() {
    const cy = Math.cos(yaw),
      sy = Math.sin(yaw),
      cp = Math.cos(pitch),
      sp = Math.sin(pitch);
    return ([x, y, z], bend = true) => {
      const a = x * cy - z * sy,
        b = z * cy + x * sy,
        c = y * cp - b * sp,
        d = y * sp + b * cp;
      const k = (3.8 / (3.8 - d)) * scale * zoom;
      let px = centerX + a * k,
        py = centerY + c * k;
      if (hover && bend && !drag && !reduced.matches) {
        const dx = px - hover.x,
          dy = py - hover.y,
          dist = Math.hypot(dx, dy);
        if (dist > 1 && dist < 68) {
          const push = (1 - dist / 68) ** 2 * 9;
          px += (dx * push) / dist;
          py += (dy * push) / dist;
        }
      }
      return [px, py, d];
    };
  }
  function dot(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  function aura(x, y, r, inner, outer) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(sky, 0, 0, width, height);
    const project = projection(),
      [cx, cy] = project([0, 0, 0], false);
    aura(cx, cy, scale * 0.91, "rgba(37,120,136,.105)", "rgba(7,17,28,0)");
    ctx.globalCompositeOperation = "lighter";
    tracks.forEach((track, i) => {
      ctx.beginPath();
      track.forEach((point, j) => {
        const [x, y] = project(point, false);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "rgba(" + palette[i] + ",.32)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      const pos = (time * 0.011 + i * 0.31) % 1 * 180;
      const step = Math.floor(pos);
      const point = track[step].map((v, n) => v + (track[step + 1][n] - v) * (pos - step));
      const [x, y] = project(point, false);
      aura(x, y, 10, "rgba(" + palette[i] + ",.65)", "transparent");
      dot(x, y, 1.8, "#fff6df");
    });
    for (const bundle of bundles) {
      const color = palette[bundle.group];
      const z = project(bundle.strands[0][29], false)[2];
      const opacity =
        (bundle.featured ? 0.64 : 0.33) * bundle.bright * (0.78 + z * 0.22);
      for (let j = 0; j < bundle.strands.length; j++) {
        const line = bundle.strands[j];
        ctx.strokeStyle =
          "rgba(" + color + "," + opacity * (j === 0 ? 1 : 0.62) + ")";
        ctx.lineWidth = bundle.featured && j === 0 ? 1.45 : 0.75;
        ctx.beginPath();
        for (let i = 0; i < line.length; i++) {
          const [x, y] = project(line[i]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      const line = bundle.strands[0],
        t = (time * 0.044 + bundle.offset) % 1;
      const i = Math.min(28, Math.floor(t * 29)),
        f = t * 29 - i;
      const p = line[i].map((v, j) => v + (line[i + 1][j] - v) * f),
        [x, y] = project(p);
      dot(x, y, bundle.featured ? 1.65 : 1.0, "rgba(" + color + ",.95)");
      const [ex, ey] = project(line[29], false);
      dot(ex, ey, bundle.featured ? 1.9 : 1.15, "rgba(" + color + ",.9)");
    }
    for (const [x, y, z, v] of dust) {
      const [dx, dy] = project([x, y, z], false);
      dot(
        dx,
        dy,
        0.45 + v * 0.65,
        "rgba(255,197,130," + (0.27 + v * 0.53) + ")",
      );
    }
    aura(cx, cy, scale * 0.19, "rgba(255,144,64,.62)", "rgba(255,136,51,0)");
    aura(
      cx,
      cy,
      Math.max(12, scale * 0.075),
      "rgba(255,222,151,.96)",
      "rgba(255,140,47,0)",
    );
    dot(cx, cy, 2, "#fff3d2");
    ctx.globalCompositeOperation = "source-over";
    const occupied = [];
    nodes.forEach((node, i) => {
      const [x, y] = project(anchors[i], false);
      const left = clamp(x - 11, 2, Math.max(2, width - node.offsetWidth - 2)),
        h = node.offsetHeight;
      let top = clamp(y - h * 0.5, 85, Math.max(90, copyTop - h - 6));
      for (const prev of occupied)
        if (
          Math.abs(top - prev.top) < h + 3 &&
          left < prev.right &&
          left + node.offsetWidth > prev.left
        )
          top = clamp(prev.top + h + 4, 5, Math.max(90, copyTop - h - 4));
      occupied.push({ left, top, right: left + node.offsetWidth });
      node.style.left = left + "px";
      node.style.top = top + "px";
    });
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden) return;
    if (last && now - last < 32) {
      queue();
      return;
    }
    const dt = last ? Math.min((now - last) / 1000, 0.06) : 0;
    last = now;
    if (moving && !drag && selected < 0 && !scene.matches(":focus-within")) {
      yaw += dt * 0.029;
      time += dt;
    }
    updateLights(time, moving && !reduced.matches);
    draw();
    if (moving && !drag && selected < 0 && !scene.matches(":focus-within"))
      queue();
  }
  function queue() {
    if (!frame && visible && !document.hidden)
      frame = requestAnimationFrame(tick);
  }
  function changeZoom(f) {
    zoom = clamp(zoom * f, 0.65, 1.7);
    queue();
  }
  function reset() {
    yaw = 0;
    pitch = 0;
    zoom = 1;
    time = 0;
    hover = null;
    queue();
  }
  function select(index, restore = false) {
    const previous = selected;
    selected = index;
    cards.forEach((c, i) => {
      c.hidden = i !== index;
      nodes[i].setAttribute("aria-expanded", String(i === index));
    });
    if (index >= 0) {
      cards[index].querySelector("button").focus({ preventScroll: true });
    } else if (restore && previous >= 0)
      nodes[previous].focus({ preventScroll: true });
    queue();
  }
  nodes.forEach((node, i) => {
    node.setAttribute("aria-expanded", "false");
    node.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      select(selected === i ? -1 : i);
    });
  });
  cards.forEach((card) =>
    card
      .querySelector("button")
      .addEventListener("click", () => select(-1, true)),
  );
  scene.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && selected >= 0) {
      e.preventDefault();
      select(-1, true);
      return;
    }
    if (e.target !== canvas) return;
    if (e.key === "ArrowLeft") yaw -= 0.14;
    else if (e.key === "ArrowRight") yaw += 0.14;
    else if (e.key === "ArrowUp") pitch = clamp(pitch - 0.12, -1, 1);
    else if (e.key === "ArrowDown") pitch = clamp(pitch + 0.12, -1, 1);
    else if (["+", "="].includes(e.key)) changeZoom(1.12);
    else if (e.key === "-") changeZoom(1 / 1.12);
    else if (e.key === "Home") reset();
    else return;
    e.preventDefault();
    queue();
  });
  controls.addEventListener("click", (e) => {
    const action = e.target.closest("button")?.dataset.orbitAction;
    if (action === "in") changeZoom(1.16);
    if (action === "out") changeZoom(1 / 1.16);
    if (action === "reset") {
      select(-1);
      reset();
    }
    if (action === "motion") {
      moving = !moving;
      last = 0;
      motionLabel();
      queue();
    }
  });
  const distance = () => {
    const [a, b] = pointers.values();
    return b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    select(-1);
    drag = true;
    hover = null;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.setPointerCapture(e.pointerId);
    pinch = distance();
  });
  canvas.addEventListener("pointermove", (e) => {
    const prev = pointers.get(e.pointerId);
    if (prev) {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const now = distance();
        if (pinch > 0) changeZoom(now / pinch);
        pinch = now;
      } else {
        yaw += (e.clientX - prev.x) * 0.006;
        pitch = clamp(pitch + (e.clientY - prev.y) * 0.005, -1, 1);
      }
    } else if (e.pointerType === "mouse") {
      const r = canvas.getBoundingClientRect();
      hover = { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    queue();
  });
  function release(e) {
    pointers.delete(e.pointerId);
    pinch = distance();
    drag = pointers.size > 0;
    queue();
  }
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("pointerleave", () => {
    hover = null;
    queue();
  });
  canvas.addEventListener(
    "wheel",
    (e) => {
      if (!e.ctrlKey && document.activeElement !== canvas) return;
      e.preventDefault();
      changeZoom(Math.exp(-clamp(e.deltaY, -120, 120) * 0.002));
    },
    { passive: false },
  );
  scene.addEventListener("focusout", () => queue());
  reduced.addEventListener("change", () => {
    moving = !reduced.matches;
    motionLabel();
    queue();
  });
  document.addEventListener("visibilitychange", () => {
    last = 0;
    queue();
  });
  const sizes = new ResizeObserver(resize);
  sizes.observe(scene);
  sizes.observe(copy);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (!visible && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    last = 0;
    queue();
  }).observe(scene);
  scene.classList.add("ready");
  controls.hidden = false;
  motionLabel();
  resize();
}
