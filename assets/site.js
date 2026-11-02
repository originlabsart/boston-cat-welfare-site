/* Boston and District Cat Welfare · Big sky, small paws
   One Fen day in photographs: the sky photos crossfade with the clock as you scroll,
   and black cut-out cats walk the horizon line that every photo shares. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (RM) root.classList.add("rm");
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- AI photographs: one switch on <html data-ai-images="on"> swaps every slot ----------
     Each slot carries its final path in data-ai; until then the current photograph is used. */
  if (root.getAttribute("data-ai-images") === "on") {
    root.classList.add("ai-on");
    document.querySelectorAll("img[data-ai]").forEach(function (img) {
      var ai = img.getAttribute("data-ai");
      if (img.hasAttribute("data-src")) img.setAttribute("data-src", ai);
      else img.setAttribute("src", ai);
    });
  }

  /* ---------- the menu: a timetable of the day, works by keyboard ---------- */
  var menu = document.querySelector("[data-menu]"), menuBtn = document.querySelector("[data-menu-open]");
  if (menu && menuBtn) {
    var menuClose = menu.querySelector("[data-menu-close]");
    var focusables = function () { return Array.prototype.slice.call(menu.querySelectorAll("a[href],button")); };
    var openMenu = function () {
      menu.hidden = false;
      menuBtn.setAttribute("aria-expanded", "true");
      root.classList.add("menu-open");
      requestAnimationFrame(function () { menu.classList.add("is-open"); });
      var f = focusables(); if (f[0]) f[0].focus();
    };
    var closeMenu = function (back) {
      menu.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      root.classList.remove("menu-open");
      menu.hidden = true;
      if (back) menuBtn.focus();
    };
    menuBtn.addEventListener("click", function () { if (menu.hidden) openMenu(); else closeMenu(true); });
    if (menuClose) menuClose.addEventListener("click", function () { closeMenu(true); });
    menu.addEventListener("click", function (ev) {
      if (ev.target === menu) { closeMenu(true); return; }
      var a = ev.target.closest && ev.target.closest("a[href]");
      if (a) closeMenu(false);
    });
    document.addEventListener("keydown", function (ev) {
      if (menu.hidden) return;
      if (ev.key === "Escape") { ev.preventDefault(); closeMenu(true); return; }
      if (ev.key === "Tab") {
        var f = focusables(), first = f[0], last = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
        else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- small helpers ---------- */
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function el(tag, attrs, parent) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function f1(n) { return Math.round(n * 10) / 10; }

  /* ---------- generated cut-outs: grass, eyes, reeds, water sheen ---------- */
  document.querySelectorAll("[data-grass]").forEach(function (p) {
    var a = p.getAttribute("data-grass").split(",").map(Number);
    var x0 = a[0], x1 = a[1], y = a[2], hmin = a[3], hmax = a[4], n = a[5], r = rng(a[6] * 977);
    var d = "";
    for (var i = 0; i < n; i++) {
      var x = x0 + (x1 - x0) * (i + r()) / n, h = hmin + (hmax - hmin) * Math.pow(r(), 1.6), w = Math.max(h * 0.09, hmin * 0.12), l = (r() - 0.5) * h * 0.7;
      d += "M" + f1(x - w) + " " + f1(y + 2) + "Q" + f1(x + l * 0.3) + " " + f1(y - h * 0.55) + " " + f1(x + l) + " " + f1(y - h) + "Q" + f1(x + l * 0.2 + w) + " " + f1(y - h * 0.5) + " " + f1(x + w) + " " + f1(y + 2) + "Z";
    }
    p.setAttribute("d", d);
  });

  /* a far tree line or hedge: low humps with the odd tree crown, drawn bottom-up
     data-ridge="seed,width,height,hedgeMin,hedgeMax,trees,treeMin,treeMax" */
  document.querySelectorAll("[data-ridge]").forEach(function (p) {
    var a = p.getAttribute("data-ridge").split(",").map(Number);
    var r = rng(a[0] * 613), W = a[1], H = a[2], hmin = a[3], hmax = a[4], nt = a[5], tmin = a[6], tmax = a[7];
    var N = Math.round(W / 6), hs = [], i, k;
    for (i = 0; i <= N; i++) hs.push(0);
    /* hedges: overlapping soft humps with gaps between field boundaries */
    for (var x = 0; x < W;) {
      var len = 120 + r() * 520, gap = r() < 0.45 ? 30 + r() * 220 : 0, hh = hmin + r() * (hmax - hmin);
      for (i = Math.floor(x / 6); i <= Math.min(N, Math.ceil((x + len) / 6)); i++) {
        var u = (i * 6 - x) / len, bump = Math.sin(Math.PI * Math.min(1, Math.max(0, u))) * 0.35 + 0.65;
        hs[i] = Math.max(hs[i], hh * (u < 0.04 || u > 0.96 ? 0.4 : bump) * (0.85 + r() * 0.3));
      }
      x += len + gap;
    }
    /* tree crowns */
    for (k = 0; k < nt; k++) {
      var cx = r() * W, cw = 14 + r() * 34, th = tmin + r() * (tmax - tmin);
      for (i = Math.floor((cx - cw) / 6); i <= Math.ceil((cx + cw) / 6); i++) {
        if (i < 0 || i > N) continue;
        var d0 = (i * 6 - cx) / cw; if (Math.abs(d0) > 1) continue;
        hs[i] = Math.max(hs[i], th * Math.sqrt(1 - d0 * d0) * (0.9 + r() * 0.12));
      }
    }
    var d = "M0 " + H;
    for (i = 0; i <= N; i++) d += "L" + (i * 6) + " " + f1(H - Math.min(H, hs[i]));
    p.setAttribute("d", d + "L" + W + " " + H + "Z");
  });

  var eyesG = document.querySelector("[data-eyes]"), pupils = [];
  if (eyesG) {
    [[190, 176, 2.2], [450, 186, 1.8], [690, 170, 2.4], [860, 188, 2], [1010, 174, 2.2], [1250, 180, 1.9], [1460, 184, 2.2]].forEach(function (e, i) {
      var g0 = el("g", { transform: "translate(" + e[0] + " " + e[1] + ") scale(" + e[2] + ")" }, eyesG);
      var g = el("g", { class: "eye-pair" }, g0);
      g.style.animationDelay = (-i * 1.3) + "s";
      [-9, 9].forEach(function (dx) {
        el("ellipse", { class: "eye", cx: dx, cy: 0, rx: 6.2, ry: 4.6 }, g);
        var p = el("ellipse", { cx: dx, cy: 0, rx: 1.5, ry: 3.8, fill: "#100c18" }, g);
        pupils.push({ el: p, g: g, dx: dx });
      });
    });
    if (!RM) window.addEventListener("pointermove", function (ev) {
      pupils.forEach(function (p) {
        var r = p.g.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var ang = Math.atan2(ev.clientY - cy, ev.clientX - cx), dist = Math.min(1, Math.hypot(ev.clientX - cx, ev.clientY - cy) / 300);
        p.el.setAttribute("cx", f1(p.dx + Math.cos(ang) * 3 * dist));
        p.el.setAttribute("cy", f1(Math.sin(ang) * 1.4 * dist));
      });
    }, { passive: true });
  }

  document.querySelectorAll("[data-reeds]").forEach(function (g) {
    var r = rng(+g.getAttribute("data-reeds") * 131), d = "";
    for (var i = 0; i < 30; i++) {
      var x = Math.pow(r(), 1.5) * 250 + 6, h = 50 + r() * 110 * (1 - x / 340), lean = (r() - 0.35) * 46, w = 2.4 + r() * 2.6;
      d += "M" + f1(x - w) + " 172Q" + f1(x + lean * 0.2) + " " + f1(170 - h * 0.6) + " " + f1(x + lean) + " " + f1(170 - h) + "Q" + f1(x + lean * 0.3 + w * 0.6) + " " + f1(170 - h * 0.55) + " " + f1(x + w) + " 172Z";
    }
    el("path", { d: d }, g);
    for (var k = 0; k < 4; k++) {
      var bx = 30 + r() * 150, bh = 90 + r() * 60, bl = (r() - 0.5) * 16;
      el("path", { d: "M" + f1(bx) + " 172Q" + f1(bx + bl * 0.4) + " " + f1(170 - bh * 0.5) + " " + f1(bx + bl) + " " + f1(170 - bh) + "l1.6 0Q" + f1(bx + bl * 0.4 + 1.6) + " " + f1(170 - bh * 0.5) + " " + f1(bx + 1.6) + " 172Z" }, g);
      el("rect", { x: f1(bx + bl - 3.2), y: f1(170 - bh - 4), width: 6.4, height: 22, rx: 3.2 }, g);
    }
  });

  var sheen = document.querySelector("[data-sheen]");
  if (sheen) {
    var rh = rng(23);
    for (var sl = 0; sl < 40; sl++) {
      var sy = Math.pow(rh(), 1.7) * 280 + 6, sx = rh() * 1600, len = 30 + rh() * 170 * (1 - sy / 400);
      var line = el("path", { d: "M" + f1(sx) + " " + f1(sy) + "h" + f1(len), "stroke-width": f1(1 + rh() * 1.2), opacity: f1(0.12 + rh() * 0.3 * (1 - sy / 320)) }, sheen);
      line.setAttribute("vector-effect", "non-scaling-stroke");
      if (rh() < 0.6) { line.setAttribute("class", "drift"); line.style.animationDelay = f1(-rh() * 9) + "s"; line.style.animationDuration = f1(7 + rh() * 6) + "s"; }
    }
  }

  /* ---------- the day: one photograph per hour ----------
     v = veil colour, va = veil over the whole frame, vl = extra veil on the text side */
  var KF = [
    { n: "Dawn", p: 0, ink: "dark", h: 5, v: [255, 244, 230], va: 0.06, vl: 0.42, theme: "#c99a78" },
    { n: "First light", p: 0, ink: "dark", h: 6.5, v: [255, 244, 230], va: 0.12, vl: 0.5, theme: "#c99a78" },
    { n: "Morning", p: 1, ink: "dark", h: 8, v: [250, 250, 247], va: 0.04, vl: 0.42, theme: "#9fc0d8" },
    { n: "Mid-morning", p: 1, ink: "dark", h: 10, v: [250, 250, 247], va: 0.1, vl: 0.5, theme: "#9fc0d8" },
    { n: "Midday", p: 2, ink: "light", h: 12, v: [6, 18, 46], va: 0.18, vl: 0.3, theme: "#3d72c4" },
    { n: "Early afternoon", p: 2, ink: "light", h: 13.5, v: [6, 18, 46], va: 0.3, vl: 0.42, theme: "#3d72c4" },
    { n: "Afternoon", p: 3, ink: "dark", h: 15, v: [250, 250, 247], va: 0.06, vl: 0.42, theme: "#a9c8d8" },
    { n: "Late afternoon", p: 4, ink: "light", h: 16.5, v: [8, 14, 30], va: 0.36, vl: 0.38, theme: "#4f6b8c" },
    { n: "Long shadows", p: 4, ink: "light", h: 17, v: [8, 14, 30], va: 0.42, vl: 0.42, theme: "#4f6b8c" },
    { n: "Golden hour", p: 5, ink: "dark", h: 18, v: [255, 248, 232], va: 0.08, vl: 0.48, theme: "#d9b45c" },
    { n: "Evening", p: 5, ink: "dark", h: 19, v: [255, 248, 232], va: 0.16, vl: 0.55, theme: "#d9b45c" },
    { n: "Last light", p: 5, ink: "dark", h: 19.5, v: [255, 248, 232], va: 0.1, vl: 0.5, theme: "#d9b45c" },
    { n: "Dusk", p: 6, ink: "light", h: 20, v: [6, 6, 18], va: 0.06, vl: 0.2, theme: "#2a2236" },
    { n: "Night", p: 7, ink: "light", h: 22, v: [0, 0, 6], va: 0.06, vl: 0.2, theme: "#0d0c12" }
  ];

  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-sky]"));
  var photos = Array.prototype.slice.call(document.querySelectorAll(".sky .ph"));
  /* the land layer: a clone of every photo, clipped below the horizon and laid over the text */
  var land = document.querySelector("[data-land]"), lands = [];
  if (land) {
    photos.forEach(function (ph) { var c = ph.cloneNode(false); c.alt = ""; c.removeAttribute("fetchpriority"); land.appendChild(c); lands.push(c); });
    var lv = document.createElement("div"); lv.className = "veil"; land.appendChild(lv); /* same veil, so the horizon shows no seam */
  }
  var autoInk = Array.prototype.slice.call(document.querySelectorAll('[data-ink="auto"]'));
  var cue = document.querySelector("[data-cue]");
  var veil = document.querySelector("[data-veil]");
  var clock = document.querySelector("[data-clock]"), clockName = document.querySelector("[data-clockname]");
  var bar = document.querySelector("[data-bar]"), dayline = document.querySelector("[data-dayline]");
  var railLinks = document.querySelectorAll("[data-rail]");
  var meta = document.querySelector('meta[name="theme-color"]');
  var farBand = document.querySelector("[data-far]");
  var lastK = -1;

  /* photos after the first load on demand, then quietly in the background */
  function want(i) {
    var img = photos[i];
    if (img && !img.getAttribute("src") && img.getAttribute("data-src")) {
      img.setAttribute("src", img.getAttribute("data-src"));
      if (lands[i]) lands[i].setAttribute("src", img.getAttribute("data-src"));
    }
  }
  window.addEventListener("load", function () {
    var i = 1;
    (function next() { if (i >= photos.length) return; want(i++); setTimeout(next, 350); })();
  });

  function paintSky(k) {
    if (Math.abs(k - lastK) < 0.002) return;
    lastK = k;
    var i = Math.min(Math.floor(k), KF.length - 2), t = k - i, a = KF[i], b = KF[i + 1];
    if (RM) { i = Math.round(k); t = 0; a = b = KF[i]; } /* no motion: one still photo per section */
    if (farBand) farBand.style.opacity = a.p === 0 ? (b.p === 0 ? 1 : f1((1 - smooth(t)) * 1000) / 1000) : 0;
    want(a.p); want(b.p); want(b.p + 1);
    for (var p = 0; p < photos.length; p++) {
      /* the earlier photo holds underneath while the later one (higher in the stack) fades in */
      var o = p === a.p ? 1 : p === b.p ? f1(smooth(t) * 1000) / 1000 : 0;
      if (photos[p]._o !== o) { photos[p].style.opacity = o; photos[p]._o = o; if (lands[p]) lands[p].style.opacity = o; }
    }
    if (veil) {
      var st = root.style;
      st.setProperty("--vc", Math.round(lerp(a.v[0], b.v[0], t)) + "," + Math.round(lerp(a.v[1], b.v[1], t)) + "," + Math.round(lerp(a.v[2], b.v[2], t)));
      st.setProperty("--va", lerp(a.va, b.va, t).toFixed(3));
      st.setProperty("--vl", lerp(a.vl, b.vl, t).toFixed(3));
    }
    var hrs = lerp(a.h, b.h, t), hh = Math.floor(hrs), mm = Math.floor((hrs - hh) * 60 / 5) * 5;
    if (clock) clock.textContent = (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
    var ki = Math.round(k);
    if (clockName) clockName.textContent = KF[ki].n;
    /* text follows the photo behind it: dark words on bright skies, light words on deep ones */
    var light = KF[ki].ink === "light";
    autoInk.forEach(function (s) { s.classList.toggle("ink-light", light); s.classList.toggle("ink-dark", !light); });
    if (bar) bar.classList.toggle("is-night", light);
    document.body.classList.toggle("is-night", light);
    railLinks.forEach(function (l) { l.classList.toggle("on", l.getAttribute("data-rail").split(",").indexOf(String(ki)) >= 0); });
    if (dayline) dayline.style.transform = "scaleX(" + (k / (KF.length - 1)).toFixed(3) + ")";
    if (meta) meta.setAttribute("content", KF[ki].theme);
  }

  function dayPosition() {
    /* each hour holds while its section fills the screen, and hands over to the next
       while the section's bottom edge travels from 90% to 30% of the way up the view */
    var vh = window.innerHeight, k = 0;
    for (var i = 0; i < sections.length - 1; i++) {
      var bottom = sections[i].getBoundingClientRect().bottom;
      k += smooth(clamp((vh * 0.9 - bottom) / (vh * 0.6), 0, 1));
    }
    if (Math.abs(k - Math.round(k)) < 0.01) k = Math.round(k);
    return clamp(k, 0, sections.length - 1);
  }

  /* ---------- the cats on the horizon: they walk while you scroll and sit when you stop ---------- */
  var hzCat = document.querySelector("[data-hzcat]"), hzKit = document.querySelector("[data-hzkit]");
  var lastY = window.scrollY, dir = 1, sitTimer;
  var BLOCK = "p,h1,h2,h3,li,dl,figure,blockquote,a,button,address,details,summary,.note,.pin,.stage,.dyke,.night-field,.night-base,.fp,.cost,.ledger,.filing,.give-note,.near-cat";
  function covered(c) {
    var r = c.getBoundingClientRect();
    if (r.right < 0 || r.left > window.innerWidth) return false;
    var pts = [[r.left + 2, r.top + 2], [r.left + r.width / 2, r.top + r.height / 2], [r.right - 2, r.top + 2], [r.left + r.width / 2, r.top - 14]];
    for (var i = 0; i < pts.length; i++) {
      var e = document.elementFromPoint(clamp(pts[i][0], 0, window.innerWidth - 1), clamp(pts[i][1], 0, window.innerHeight - 1));
      if (e && e.closest && e.closest(BLOCK)) return true;
    }
    return false;
  }
  function wrapX(x) { x = (x + 0.06) % 1.12; if (x < 0) x += 1.12; return x - 0.06; }
  function horizonCats(vw) {
    if (!hzCat) return;
    var max = Math.max(1, root.scrollHeight - window.innerHeight), p = clamp(window.scrollY / max, 0, 1);
    var x = RM ? 0.56 : wrapX(0.56 + p * 2.24), xk = RM ? 0.5 : wrapX(0.56 + p * 2.24 - 0.055 * dir - 0.01);
    hzCat.style.transform = "translate3d(" + f1(x * vw) + "px,0,0)";
    if (hzKit) hzKit.style.transform = "translate3d(" + f1(xk * vw) + "px,0,0)";
    /* a cat steps out of sight whenever words or a set piece pass over its bit of horizon */
    [hzCat, hzKit].forEach(function (c) { if (c) c.classList.toggle("is-hidden", covered(c)); });
    if (RM) return;
    var y = window.scrollY;
    if (Math.abs(y - lastY) > 0.5) {
      dir = y > lastY ? 1 : -1;
      [hzCat, hzKit].forEach(function (c) { if (!c) return; c.classList.add("is-walking"); c.classList.toggle("face-left", dir < 0); });
      clearTimeout(sitTimer);
      sitTimer = setTimeout(function () { [hzCat, hzKit].forEach(function (c) { if (c) c.classList.remove("is-walking"); }); }, 320);
    }
    lastY = y;
  }

  /* ---------- 12:00 rack focus: the field softens while the cat comes forward ---------- */
  var zoomSec = document.querySelector("#promise"), zImg = document.querySelector("[data-zoomimg]"), zCat = document.querySelector("[data-zcat]"), zsteps = document.querySelectorAll("[data-zstep]");
  function setZoom(e, vh, vw) {
    if (zImg) {
      zImg.style.transform = "scale(" + (1 + 0.32 * e).toFixed(4) + ")";
      zImg.style.filter = e > 0.01 ? "blur(" + f1(e * 7) + "px)" : "none";
    }
    if (zCat) {
      var small = vw < 641, h0 = Math.max(14, vh * 0.02), h1 = vh * (small ? 0.4 : 0.6);
      var h = h0 * Math.pow(h1 / h0, e);
      var base = vh * 0.78 + (h - h0) * (small ? 0.62 : 0.5);
      zCat.style.height = f1(h) + "px";
      zCat.style.transform = "translate(-50%," + f1(base - h * 0.96) + "px)";
    }
  }
  function zoom(vh, vw) {
    if (!zoomSec) return;
    var r = zoomSec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    var p = clamp(-r.top / (r.height - vh), 0, 1);
    var e = smooth(clamp((p - 0.06) / 0.72, 0, 1));
    setZoom(e, vh, vw);
    var step = p < 0.2 ? 0 : p < 0.42 ? 1 : p < 0.68 ? 2 : 3;
    zsteps.forEach(function (s) { s.classList.toggle("on", +s.getAttribute("data-zstep") === step); });
  }

  /* ---------- 15:00 the walk along the bank ---------- */
  var walk = document.querySelector("[data-walk]"), track = document.querySelector("[data-track]");
  var xLayers = Array.prototype.slice.call(document.querySelectorAll(".px-x")).map(function (e) { return { el: e, k: +e.getAttribute("data-x") }; });
  var walker = document.querySelector("[data-walker]"), walkbar = document.querySelector("[data-walkbar]");
  var lastWalk = -1, walkTimer;
  function walkUpdate(vh, vw) {
    if (!walk || !track) return;
    var r = walk.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    var p = clamp(-r.top / (r.height - vh), 0, 1);
    var dist = p * (track.children.length - 1) * vw;
    track.style.transform = "translate3d(" + f1(-dist) + "px,0,0)";
    for (var i = 0; i < xLayers.length; i++) xLayers[i].el.style.transform = "translate3d(" + f1(-dist * xLayers[i].k) + "px,0,0)";
    if (walkbar) walkbar.style.transform = "scaleX(" + p.toFixed(3) + ")";
    if (walker && Math.abs(p - lastWalk) > 0.0005 && p > 0 && p < 1) {
      walker.classList.add("is-walking");
      clearTimeout(walkTimer);
      walkTimer = setTimeout(function () { walker.classList.remove("is-walking"); }, 160);
    }
    lastWalk = p;
  }

  /* ---------- parallax: depth layers over the photo sky ----------
     The day "lifts" as you scroll: the horizon stays put, and the nearer a layer is, the faster
     it sinks away below it. Transforms only; nothing moves with reduced motion. */
  var dawn = document.querySelector("[data-depth-dawn]");
  var dawnLayers = dawn ? Array.prototype.slice.call(dawn.querySelectorAll("[data-s]")).map(function (e) { return { el: e, s: +e.getAttribute("data-s") }; }) : [];
  var dawnOn = true;
  function dawnDepth(vh) {
    if (!dawn) return;
    var y = Math.max(0, window.scrollY), on = y < vh * 1.1;
    if (on !== dawnOn) { dawn.style.visibility = on ? "" : "hidden"; dawnOn = on; }
    if (farBand) farBand.style.transform = "translate3d(0," + f1(Math.min(y * 0.045, vh * 0.06)) + "px,0)";
    if (!on) return;
    for (var i = 0; i < dawnLayers.length; i++) dawnLayers[i].el.style.transform = "translate3d(0," + f1(y * dawnLayers[i].s) + "px,0)";
  }
  var dyke0 = document.querySelector("[data-dyke]"), stars = document.querySelector("[data-stars]");
  var duskLayers = Array.prototype.slice.call(document.querySelectorAll("[data-dusk-s]")).map(function (e) { return { el: e, s: +e.getAttribute("data-dusk-s") }; });
  function duskDepth(vh) {
    if (!dyke0) return;
    var r = dyke0.getBoundingClientRect();
    if (r.bottom < -40 || r.top > vh + 40) return;
    /* o: how far the scene's centre sits below the middle of the screen */
    var o = clamp((r.top + r.height / 2) - vh / 2, -vh * 0.5, vh * 0.6);
    for (var i = 0; i < duskLayers.length; i++) duskLayers[i].el.style.transform = "translate3d(0," + f1(clamp(o * duskLayers[i].s, -24, 220)) + "px,0)";
    if (stars) stars.style.transform = "translate3d(0," + f1(-o * 0.12) + "px,0)";
  }

  /* ---------- the frame ---------- */
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight, vw = window.innerWidth;
    if (sections.length > 1) paintSky(dayPosition());
    if (cue) cue.classList.toggle("gone", window.scrollY > 24);
    horizonCats(vw);
    if (RM) return;
    dawnDepth(vh);
    duskDepth(vh);
    zoom(vh, vw);
    walkUpdate(vh, vw);
    if (walk) { var wr = walk.getBoundingClientRect(); document.body.classList.toggle("in-walk", wr.top < vh * 0.5 && wr.bottom > vh * 0.5); }
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", function () { lastK = -1; request(); }, { passive: true });
  frame();

  /* ---------- 08:00 the register entry ---------- */
  var register = document.querySelector("[data-register]");
  if (register) {
    if ("IntersectionObserver" in window && !RM) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { register.classList.add("is-in"); io.disconnect(); } }); }, { threshold: 0.45 });
      io.observe(register);
    } else register.classList.add("is-in");
  }

  /* ---------- 16:30 where the money goes ---------- */
  var costs = document.querySelectorAll("[data-cost]");
  costs.forEach(function (b) {
    b.addEventListener("click", function () {
      var on = !b.classList.contains("is-on");
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  });
  var grid = document.querySelector(".costs-grid");
  if (grid && "IntersectionObserver" in window) {
    var io3 = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        costs.forEach(function (b, i) { setTimeout(function () { b.classList.add("is-on"); b.setAttribute("aria-pressed", "true"); }, RM ? 0 : 300 + i * 450); });
        io3.disconnect();
      });
    }, { threshold: 0.5 });
    io3.observe(grid);
  }

  /* ---------- 18:00 the fingerpost: dark arms copy the address, the amber arm rings ---------- */
  var fp = document.querySelector(".fp[data-address]"), copied = document.querySelector("[data-copied]"), copyTimer;
  if (fp && copied) {
    var addressText = fp.getAttribute("data-address");
    var say = function (msg, long) {
      copied.textContent = msg;
      copied.classList.add("on");
      copied.classList.toggle("long", !!long);
      clearTimeout(copyTimer);
      copyTimer = setTimeout(function () { copied.classList.remove("on"); setTimeout(function () { copied.textContent = ""; }, 320); }, long ? 9000 : 2600);
    };
    fp.querySelectorAll("[data-copy]").forEach(function (arm) {
      arm.addEventListener("click", function () {
        if (!RM) { arm.classList.remove("swing"); void arm.offsetWidth; arm.classList.add("swing"); }
        var fail = function () { say(addressText, true); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addressText).then(function () { say("Address copied"); }, fail);
        else fail();
      });
      arm.addEventListener("animationend", function () { arm.classList.remove("swing"); });
    });
  }

  /* the black cat walks in to the foot of the post, then sits and looks down the drove */
  var fpCat = document.querySelector("[data-fpcat]");
  if (fpCat && !RM && "IntersectionObserver" in window) {
    fpCat.classList.add("is-away");
    var io4 = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        io4.disconnect();
        var walkSvg = fpCat.querySelector(".fp-cat-walk");
        fpCat.style.setProperty("--from", -Math.round(Math.min(fpCat.getBoundingClientRect().right + 40, 170)) + "px");
        void fpCat.offsetWidth;
        setTimeout(function () {
          fpCat.classList.add("go");
          var sit = function () { fpCat.classList.remove("is-away", "go"); };
          walkSvg.addEventListener("transitionend", function te(ev) { if (ev.propertyName !== "transform") return; walkSvg.removeEventListener("transitionend", te); sit(); });
          setTimeout(sit, 6500);
        }, 250);
      });
    }, { threshold: 0.55 });
    io4.observe(fpCat.closest(".drove") || fpCat);
  }

  /* ---------- 20:00 the sluice gate, its reflection and the first stars ---------- */
  var dyke = document.querySelector("[data-dyke]"), partnersSec = document.querySelector("#partners");
  if (dyke && partnersSec) {
    var ripN = document.querySelector("[data-ripn]"), ripD = document.querySelector("[data-ripd]");
    var water = dyke.querySelector("[data-water]"), gate = dyke.querySelector("[data-gate]");
    var excite = 0.15, rt = Math.random() * 10, seen = false, rafId = 0, lastTs = 0, lastSY = window.scrollY, nextDrop = 0;
    var kick = function (v) { excite = Math.min(1, Math.max(excite, v)); wake(); };
    var lift = function (on) { dyke.classList.toggle("is-lift", on); if (on) kick(0.55); };
    var drop = function (x, y, big) {
      if (RM || !water) return;
      var r = document.createElement("i");
      r.className = "ring";
      r.style.left = f1(x) + "px"; r.style.top = f1(y) + "px";
      if (!big) r.style.animationDuration = "2.6s";
      water.appendChild(r);
      r.addEventListener("animationend", function () { r.remove(); });
    };
    var ripple = function (ts) {
      rafId = 0;
      if (!seen) return;
      if (ts - lastTs > 40) {
        var dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0.04;
        lastTs = ts;
        rt += dt * (0.6 + excite * 2.2);
        excite *= Math.pow(0.35, dt);
        if (ripN) ripN.setAttribute("baseFrequency", (0.006 + 0.0012 * Math.sin(rt * 0.37)).toFixed(5) + " " + (0.07 + 0.009 * Math.sin(rt * 0.9) + 0.004 * Math.sin(rt * 2.3)).toFixed(5));
        if (ripD) ripD.setAttribute("scale", f1(6 + excite * 26));
        if (ts > nextDrop && water) {
          var wr = water.getBoundingClientRect();
          if (nextDrop) drop(wr.width * (0.08 + Math.random() * 0.84), wr.height * (0.25 + Math.random() * 0.55), false);
          nextDrop = ts + 3500 + Math.random() * 4500;
        }
      }
      rafId = requestAnimationFrame(ripple);
    };
    var wake = function () { if (!RM && seen && !rafId) rafId = requestAnimationFrame(ripple); };
    if ("IntersectionObserver" in window) {
      var io5 = new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          seen = x.isIntersecting;
          if (seen) { partnersSec.classList.add("is-lit"); wake(); }
        });
      }, { threshold: 0.2 });
      io5.observe(dyke);
    } else partnersSec.classList.add("is-lit");
    if (RM) partnersSec.classList.add("is-lit");
    if (!RM) {
      window.addEventListener("scroll", function () {
        var y = window.scrollY, dy = Math.abs(y - lastSY);
        lastSY = y;
        if (seen && dy) kick(Math.min(1, excite + dy * 0.004));
      }, { passive: true });
      if (water) water.addEventListener("pointerdown", function (ev) {
        var wr = water.getBoundingClientRect();
        drop(ev.clientX - wr.left, ev.clientY - wr.top, true);
        kick(1);
      });
      dyke.addEventListener("pointermove", function () { kick(0.3); }, { passive: true });
    }
    if (gate) {
      gate.addEventListener("pointerenter", function () { lift(true); });
      gate.addEventListener("pointerleave", function () { lift(false); });
      gate.addEventListener("focus", function () { lift(true); });
      gate.addEventListener("blur", function () { lift(false); });
    }
  }
})();
