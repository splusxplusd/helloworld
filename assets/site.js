/* Done & Done site behaviour: header, About menu, hero tiles, pixel edges, isometric scenes, order flow, copy button. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVGNS = 'http://www.w3.org/2000/svg';

  // ---------- Feature flags ----------
  var flags = Object.assign({ factory: false }, window.DD_FLAGS || {});
  try {
    var params = new URLSearchParams(location.search);
    if (params.get('factory') === 'on') flags.factory = true;
    if (params.get('factory') === 'off') flags.factory = false;
  } catch (e) { /* ignore */ }
  if (location.hash === '#factory-on') flags.factory = true;

  // Small seeded random generator so decorative patterns are stable between visits.
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; };
  }

  // ---------- Header ----------
  var header = document.getElementById('site-header');
  function onScroll() { if (header) header.classList.toggle('is-floating', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- About menu ----------
  var menu = document.getElementById('about-menu-wrap');
  if (menu) {
    var btn = menu.querySelector('.menu-btn');
    var hoverable = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var closeTimer = null;
    var openedAt = 0;
    var setOpen = function (open) {
      if (open && !menu.classList.contains('is-open')) openedAt = Date.now();
      menu.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    btn.addEventListener('click', function () {
      // a click right after hover opened the menu should keep it open, not close it
      var isOpen = menu.classList.contains('is-open');
      setOpen(!isOpen || Date.now() - openedAt < 600);
    });
    if (hoverable) {
      menu.addEventListener('mouseenter', function () { clearTimeout(closeTimer); setOpen(true); });
      menu.addEventListener('mouseleave', function () { closeTimer = setTimeout(function () { setOpen(false); }, 180); });
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setOpen(false); } });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) setOpen(false); });
    menu.querySelectorAll('.menu-list a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  }

  // ---------- Hero tiles ----------
  var hero = document.getElementById('hero');
  var tilesEl = document.getElementById('tiles');
  var tileTimer = null;
  function buildTiles() {
    if (!hero || !tilesEl) return;
    clearInterval(tileTimer);
    tilesEl.innerHTML = '';
    var w = hero.clientWidth, h = hero.clientHeight;
    var size = w < 700 ? 40 : 64;
    var cols = Math.ceil(w / size), rows = Math.ceil(h / size);
    tilesEl.style.gridTemplateColumns = 'repeat(' + cols + ', ' + size + 'px)';
    tilesEl.style.gridAutoRows = size + 'px';
    var band = w < 700 ? w * 3 : Math.min(w * 0.62, 900);
    var rand = rng(42);
    var cells = [], eligible = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cell = document.createElement('span');
        cell.className = 'tile';
        var cx = c * size + size / 2;
        var edge = Math.abs(cx - w / 2) - band / 2;
        var clearTop = (r * size) < 100; // keep the navigation area plain blue
        var ok = !clearTop && (edge > 0 || r >= rows - 2);
        if (r > rows * 0.55) cell.classList.add('lo');
        if (ok) {
          var p = 0.28 + Math.min(0.4, Math.max(0, edge) / (w * 0.5));
          if (r >= rows - 2 && edge <= 0) p = 0.22;
          if (rand() < p) cell.classList.add('on');
          eligible.push(cells.length);
        }
        cell.dataset.ok = ok ? '1' : '';
        tilesEl.appendChild(cell);
        cells.push(cell);
      }
    }
    if (!reduceMotion && eligible.length) {
      var flip = true;
      tileTimer = setInterval(function () {
        // alternate: switch one off and another on, so density stays even
        for (var k = 0; k < 2; k++) {
          var tries = 0, idx;
          do { idx = eligible[Math.floor(Math.random() * eligible.length)]; tries++; }
          while (tries < 12 && cells[idx].classList.contains('on') !== flip);
          cells[idx].classList.toggle('on');
          flip = !flip;
        }
      }, 650);
    }
    var last = -1;
    hero.onpointermove = function (e) {
      var rect = tilesEl.getBoundingClientRect();
      var c = Math.floor((e.clientX - rect.left) / size), r = Math.floor((e.clientY - rect.top) / size);
      var i = r * cols + c;
      if (i === last || i < 0 || i >= cells.length) return;
      last = i;
      if (cells[i].dataset.ok) cells[i].classList.toggle('on');
    };
  }
  var lastW = 0;
  function maybeRebuildTiles() { if (hero && hero.clientWidth !== lastW) { lastW = hero.clientWidth; buildTiles(); } }

  // ---------- Pixel edges and blog thumbnails ----------
  function buildPixels() {
    document.querySelectorAll('[data-pixels]').forEach(function (el) {
      el.querySelectorAll('span.px').forEach(function (s) { s.remove(); });
      var kind = el.dataset.pixels;
      var rand = rng(Number(el.dataset.seed || (kind === 'up' ? 11 : 31)));
      var cols, rows, probs;
      if (kind === 'thumb') {
        cols = 16; rows = 9;
        el.style.gridTemplateColumns = 'repeat(16, 1fr)';
        el.style.gridTemplateRows = 'repeat(9, 1fr)';
      } else {
        var px = el.clientWidth < 700 ? 20 : 32;
        el.style.setProperty('--px', px + 'px');
        cols = Math.ceil(el.clientWidth / px); rows = 4;
        el.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
        el.style.gridTemplateRows = 'repeat(4, ' + px + 'px)';
        probs = [0.12, 0.3, 0.58, 0.88];
      }
      var frag = document.createDocumentFragment();
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var s = document.createElement('span');
          s.className = 'px';
          var on;
          if (kind === 'thumb') {
            var d = Math.hypot((c - 11) / 8, (r - 3) / 5);
            on = rand() < Math.max(0.05, 0.8 - d * 0.7);
          } else if (kind === 'up') {
            on = rand() < probs[r];
          } else {
            on = rand() < probs[r];
          }
          if (on) s.classList.add('on');
          frag.appendChild(s);
        }
      }
      el.insertBefore(frag, el.firstChild);
    });
  }

  // ---------- Isometric drawing helpers ----------
  function Scene(svg, scale) {
    this.svg = svg; this.S = scale; this.minX = Infinity; this.minY = Infinity; this.maxX = -Infinity; this.maxY = -Infinity;
  }
  Scene.prototype.p = function (x, y, z) {
    var X = (x - y) * this.S * 0.8660254, Y = (x + y) * this.S * 0.5 - z * this.S;
    if (X < this.minX) this.minX = X; if (X > this.maxX) this.maxX = X;
    if (Y < this.minY) this.minY = Y; if (Y > this.maxY) this.maxY = Y;
    return [X, Y];
  };
  Scene.prototype.el = function (tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    (parent || this.svg).appendChild(n);
    return n;
  };
  Scene.prototype.g = function (cls, parent) { return this.el('g', cls ? { 'class': cls } : {}, parent); };
  Scene.prototype.poly = function (pts, cls, parent) {
    var self = this;
    var d = pts.map(function (q) { var s = self.p(q[0], q[1], q[2]); return s[0].toFixed(1) + ',' + s[1].toFixed(1); }).join(' ');
    return this.el('polygon', { points: d, 'class': cls || '' }, parent);
  };
  Scene.prototype.box = function (x, y, z, w, d, h, cls, parent) {
    var g = this.g(cls || '', parent);
    this.poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], 'r', g);
    this.poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], 'l', g);
    this.poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], 't', g);
    return g;
  };
  // Text painted on a face that faces the viewer's left (the plane y = const), running along +x.
  Scene.prototype.signY = function (x, y, z, text, size, cls, parent) {
    var o = this.p(x, y, z);
    var t = this.el('text', {
      transform: 'matrix(0.8660254,0.5,0,1,' + o[0].toFixed(1) + ',' + o[1].toFixed(1) + ')',
      'class': cls || 'sign', 'font-size': size
    }, parent);
    t.textContent = text;
    return t;
  };
  Scene.prototype.person = function (x, y, cls, parent) {
    var g = this.g('person ' + (cls || ''), parent);
    this.box(x, y, 0, 0.22, 0.22, 0.8, 'ink', g);
    this.box(x + 0.3, y, 0, 0.22, 0.22, 0.8, 'ink', g);
    this.box(x - 0.04, y - 0.06, 0.8, 0.6, 0.36, 0.85, 'shirt', g);
    var hpt = this.p(x + 0.26, y + 0.12, 1.98);
    this.el('circle', { cx: hpt[0].toFixed(1), cy: hpt[1].toFixed(1), r: (this.S * 0.27).toFixed(1), 'class': 'head' }, g);
    return g;
  };
  Scene.prototype.fit = function (pad) {
    var p = pad || 16;
    this.svg.setAttribute('viewBox', [this.minX - p, this.minY - p, this.maxX - this.minX + 2 * p, this.maxY - this.minY + 2 * p].map(function (v) { return v.toFixed(1); }).join(' '));
  };

  // ---------- Problem: scattered tools ----------
  function drawScatter() {
    var svg = document.getElementById('scatter-svg');
    if (!svg) return;
    svg.innerHTML = '';
    var sc = new Scene(svg, 26);
    sc.box(-1.5, -1.5, -0.3, 13, 11, 0.3, 'floorbox');
    svg.lastChild.querySelectorAll('polygon').forEach(function (n) { n.setAttribute('class', 'floor'); });
    var tools = [
      { n: 'QuickBooks', x: 0, y: 0, h: 1.6 },
      { n: 'Spreadsheets', x: 5.5, y: -0.5, h: 1.0 },
      { n: 'Shopify', x: 9, y: 2.5, h: 1.3 },
      { n: 'CRM', x: 1, y: 4.5, h: 1.2 },
      { n: 'Inventory app', x: 5.5, y: 4.2, h: 1.8 },
      { n: 'Payroll', x: 8.6, y: 7, h: 0.9 }
    ];
    var links = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 2], [4, 5]];
    var lg = sc.g('links');
    links.forEach(function (l) {
      var a = tools[l[0]], b = tools[l[1]];
      var pa = sc.p(a.x + 0.8, a.y + 0.8, 0.02), pb = sc.p(b.x + 0.8, b.y + 0.8, 0.02);
      var mx = (pa[0] + pb[0]) / 2, my = (pa[1] + pb[1]) / 2;
      var dx = pb[0] - pa[0], dy = pb[1] - pa[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      sc.el('line', { x1: pa[0], y1: pa[1], x2: mx - ux * 9, y2: my - uy * 9, 'class': 'gap' }, lg);
      sc.el('line', { x1: mx + ux * 9, y1: my + uy * 9, x2: pb[0], y2: pb[1], 'class': 'gap' }, lg);
      sc.el('path', { d: 'M' + (mx - 4) + ' ' + (my - 4) + 'l8 8M' + (mx + 4) + ' ' + (my - 4) + 'l-8 8', 'class': 'x' }, lg);
    });
    tools.slice().sort(function (a, b) { return (a.x + a.y) - (b.x + b.y); }).forEach(function (t) {
      sc.box(t.x, t.y, 0, 1.6, 1.6, t.h, '');
      var top = sc.p(t.x + 0.8, t.y + 0.8, t.h + 0.55);
      var txt = sc.el('text', { x: top[0].toFixed(1), y: top[1].toFixed(1), 'text-anchor': 'middle' });
      txt.textContent = t.n;
    });
    sc.fit(20);
  }

  // ---------- Factory scene ----------
  var factory = null;
  function drawFactory() {
    var svg = document.getElementById('factory-svg');
    if (!svg) return null;
    svg.innerHTML = '';
    var sc = new Scene(svg, 20);
    var groups = [];
    function st(i) { var g = sc.g('st'); g.dataset.st = i; groups.push(g); return g; }

    // floor
    var slab = sc.box(-1.6, -5.7, -0.5, 22.4, 14.6, 0.5, 'slab');
    slab.querySelectorAll('polygon').forEach(function (n) { n.setAttribute('class', n.getAttribute('class') === 't' ? 'floor' : n.getAttribute('class')); });

    // zones (dashed areas on the floor), one per station
    var zones = [[-1, -5.2, 5, 4.6], [4.6, -5.2, 5, 4.6], [7.6, 2.2, 3.6, 3.4], [10.9, 2.4, 4.4, 4.0], [15.4, 1.8, 5.2, 4.6]];
    zones.forEach(function (z, i) {
      var g = st(i);
      sc.poly([[z[0], z[1], 0], [z[0] + z[2], z[1], 0], [z[0] + z[2], z[1] + z[3], 0], [z[0], z[1] + z[3], 0]], 'zone', g);
    });

    // 0 · Sales: sign board, desk, monitor, person
    var g0 = st(0);
    sc.box(-0.4, -4.9, 0, 4.2, 0.15, 2.8, '', g0);
    sc.signY(-0.1, -4.74, 1.75, 'SALES', 13, 'sign', g0);
    sc.box(0.2, -3.9, 0, 3.0, 1.3, 1.05, 'desk', g0);
    sc.box(0.6, -3.75, 1.05, 1.5, 0.12, 0.95, 'ink', g0);
    sc.poly([[0.7, -3.62, 1.15], [2.0, -3.62, 1.15], [2.0, -3.62, 1.9], [0.7, -3.62, 1.9]], 'glow', g0);
    sc.poly([[2.3, -3.4, 1.06], [2.95, -3.4, 1.06], [2.95, -2.75, 1.06], [2.3, -2.75, 1.06]], 'paper', g0);
    sc.person(1.2, -1.9, '', g0);
    var b0 = sc.p(3.4, -2.6, 2.6);
    var bub = sc.g('bubble', g0);
    sc.el('rect', { x: (b0[0] - 16).toFixed(1), y: (b0[1] - 14).toFixed(1), width: 32, height: 24, rx: 7, 'class': 'bubble-bg' }, bub);
    sc.el('path', { d: 'M' + (b0[0] - 6).toFixed(1) + ' ' + (b0[1] - 2).toFixed(1) + 'l4 4 8-9', 'class': 'bubble-tick' }, bub);

    // 1 · Inventory: shelving with cartons, pallet, reorder light
    var g1 = st(1);
    sc.box(5.0, -4.9, 0, 4.0, 0.15, 3.3, '', g1);
    sc.signY(5.3, -4.74, 2.85, 'STOCK', 11, 'sign', g1);
    sc.box(5.0, -4.9, 0, 0.12, 1.1, 2.6, 'post', g1);
    [0, 0.9, 1.8, 2.55].forEach(function (zz, k) {
      sc.box(5.0, -4.9, zz, 4.0, 1.1, 0.1, 'shelf', g1);
      if (k < 3) {
        var count = k === 2 ? 1 : 3;
        for (var j = 0; j < count; j++) sc.box(5.3 + j * 1.2, -4.7, zz + 0.1, 0.9, 0.75, 0.62, 'carton', g1);
      }
    });
    sc.box(8.88, -4.9, 0, 0.12, 1.1, 2.6, 'post', g1);
    sc.box(5.6, -2.9, 0, 1.6, 1.2, 0.18, 'pallet', g1);
    sc.box(5.75, -2.8, 0.18, 0.65, 0.5, 0.55, 'carton', g1);
    sc.box(6.45, -2.8, 0.18, 0.65, 0.5, 0.55, 'carton', g1);
    sc.box(5.75, -2.3, 0.18, 0.65, 0.5, 0.55, 'carton', g1);
    var lamp = sc.p(9.2, -3.6, 2.9);
    sc.el('circle', { cx: lamp[0].toFixed(1), cy: lamp[1].toFixed(1), r: 5, 'class': 'amber blink' }, g1);
    sc.person(7.6, -1.9, '', g1);

    // 2 · Invoicing: rear pillar (drawn before the belt), stack of invoices
    var g2a = st(2);
    sc.box(8.15, 3.1, 0, 0.45, 0.9, 2.7, '', g2a);
    sc.box(10.9, 4.3, 0, 1.0, 1.3, 0.12, 'paperbox', g2a);
    sc.box(10.9, 4.3, 0.12, 1.0, 1.3, 0.12, 'paperbox', g2a);
    sc.box(10.9, 4.3, 0.24, 1.0, 1.3, 0.12, 'paperbox', g2a);

    // 3 · Accounting: board with T-account, desk, ledger, person
    var g3 = st(3);
    sc.box(11.3, 2.8, 0, 3.8, 0.15, 2.8, '', g3);
    sc.signY(11.6, 2.96, 2.25, 'BOOKS', 12, 'sign', g3);
    var tl = function (a, b) { var p1 = sc.p(a[0], a[1], a[2]), p2 = sc.p(b[0], b[1], b[2]); sc.el('line', { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], 'class': 'tline' }, g3); };
    tl([11.7, 2.96, 1.6], [14.7, 2.96, 1.6]);
    tl([13.2, 2.96, 1.6], [13.2, 2.96, 0.5]);
    sc.signY(12.1, 2.96, 1.15, 'Dr', 9, 'sign small', g3);
    sc.signY(13.6, 2.96, 1.15, 'Cr', 9, 'sign small', g3);
    sc.box(11.6, 3.5, 0, 3.0, 1.3, 1.05, 'desk', g3);
    sc.box(12.0, 3.7, 1.05, 1.3, 0.9, 0.22, 'ledger', g3);
    sc.box(13.6, 3.8, 1.05, 0.55, 0.7, 0.12, 'ink', g3);
    sc.person(12.6, 5.3, '', g3);

    // 4 · Reports: screen with bars, person
    var g4 = st(4);
    sc.box(16.0, 2.6, 0, 0.2, 0.2, 1.0, 'ink', g4);
    sc.box(19.6, 2.6, 0, 0.2, 0.2, 1.0, 'ink', g4);
    sc.box(15.6, 2.4, 1.0, 4.6, 0.3, 3.1, 'screenbox', g4);
    sc.signY(15.9, 2.71, 3.55, 'CASH · MARGIN', 10, 'sign', g4);
    [[16.2, 0.9], [17.0, 1.4], [17.8, 1.1], [18.6, 1.9], [19.4, 2.2]].forEach(function (b) {
      sc.poly([[b[0], 2.71, 1.3], [b[0] + 0.55, 2.71, 1.3], [b[0] + 0.55, 2.71, 1.3 + b[1] * 0.75], [b[0], 2.71, 1.3 + b[1] * 0.75]], 'bar', g4);
    });
    sc.person(17.6, 5.0, '', g4);

    // Conveyor belt (neutral, always full colour)
    var belt = sc.g('belt');
    var legs = [[-0.6, 0, 10.6, 1.2], [8.8, 1.2, 1.2, 6.8], [10, 6.8, 9.2, 1.2]];
    legs.forEach(function (l, i) {
      sc.box(l[0], l[1], 0, l[2], l[3], 0.75, '', belt);
      if (i !== 1) { for (var x = l[0] + 0.4; x < l[0] + l[2] - 0.2; x += 0.9) { var q = sc.p(x, l[1] + l[3], 0.38); sc.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2.6, 'class': 'roller' }, belt); } }
      else { for (var y = l[1] + 0.3; y < l[1] + l[3] - 0.2; y += 0.9) { var q2 = sc.p(l[0] + l[2], y, 0.38); sc.el('circle', { cx: q2[0].toFixed(1), cy: q2[1].toFixed(1), r: 2.6, 'class': 'roller' }, belt); } }
    });
    var path = [[-0.2, 0.6], [9.4, 0.6], [9.4, 7.4], [19, 7.4]];
    var pathPts = path.map(function (q) { return sc.p(q[0], q[1], 0.751); });
    sc.el('polyline', { points: pathPts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '), 'class': 'belt-run' }, belt);

    // Parcel (the order)
    var parcel = sc.g('parcel');
    var pg = sc.box(-0.42, -0.42, 0, 0.84, 0.84, 0.7, '', parcel);
    var lbl = sc.p(-0.42, 0.42, 0.25);
    sc.el('rect', { x: (lbl[0] + 2).toFixed(1), y: (lbl[1] - 8).toFixed(1), width: 7, height: 5, 'class': 'parcel-label', transform: 'skewY(30)' }, pg);
    var origin = sc.p(0, 0, 0);

    // 2 · Invoicing: front pillar, printer head, beam (drawn over the belt and parcel)
    var g2b = st(2);
    sc.box(10.25, 3.1, 0, 0.45, 0.9, 2.7, '', g2b);
    sc.box(9.05, 3.25, 2.05, 0.75, 0.6, 0.65, 'ink', g2b);
    sc.box(8.15, 3.1, 2.7, 2.55, 0.9, 0.55, '', g2b);
    sc.signY(8.35, 4.01, 2.82, 'INVOICE', 9, 'sign', g2b);
    sc.poly([[9.15, 3.85, 2.05], [9.7, 3.85, 2.05], [9.7, 4.4, 1.55], [9.15, 4.4, 1.55]], 'paper', g2b);

    sc.fit(14);

    // stops along the belt for each station (in floor units along the path)
    var stopsXY = [[2.0, 0.6], [6.8, 0.6], [9.4, 3.6], [13.2, 7.4], [17.8, 7.4]];
    var segs = [], total = 0;
    for (var i = 1; i < path.length; i++) {
      var len = Math.abs(path[i][0] - path[i - 1][0]) + Math.abs(path[i][1] - path[i - 1][1]);
      segs.push({ a: path[i - 1], b: path[i], len: len, start: total }); total += len;
    }
    function distOf(pt) {
      for (var k = 0; k < segs.length; k++) {
        var s = segs[k];
        var onX = s.a[1] === s.b[1] && pt[1] === s.a[1] && pt[0] >= Math.min(s.a[0], s.b[0]) && pt[0] <= Math.max(s.a[0], s.b[0]);
        var onY = s.a[0] === s.b[0] && pt[0] === s.a[0] && pt[1] >= Math.min(s.a[1], s.b[1]) && pt[1] <= Math.max(s.a[1], s.b[1]);
        if (onX || onY) return s.start + Math.abs(pt[0] - s.a[0]) + Math.abs(pt[1] - s.a[1]);
      }
      return 0;
    }
    function pointAt(d) {
      for (var k = 0; k < segs.length; k++) {
        var s = segs[k];
        if (d <= s.start + s.len || k === segs.length - 1) {
          var t = Math.max(0, Math.min(1, (d - s.start) / s.len));
          return [s.a[0] + (s.b[0] - s.a[0]) * t, s.a[1] + (s.b[1] - s.a[1]) * t];
        }
      }
      return path[0];
    }
    var stops = stopsXY.map(distOf);
    function place(d) {
      var q = pointAt(d), s = sc.p(q[0], q[1], 0.75);
      parcel.setAttribute('transform', 'translate(' + (s[0] - origin[0]).toFixed(1) + ',' + (s[1] - origin[1]).toFixed(1) + ')');
    }
    return { svg: svg, groups: groups, stops: stops, place: place, current: stops[0] };
  }

  function initFactory() {
    var section = document.getElementById('factory');
    var flow = document.getElementById('flow');
    if (!section) return;
    section.hidden = false;
    if (flow) flow.hidden = true;
    factory = drawFactory();
    if (!factory) return;
    var steps = Array.prototype.slice.call(document.querySelectorAll('.fstep'));
    var anim = null;

    function setActive(i) {
      if (factory.active === i) return;
      factory.active = i;
      factory.svg.setAttribute('data-active', String(i));
      factory.groups.forEach(function (g) { g.classList.toggle('on', Number(g.dataset.st) === i); });
      steps.forEach(function (s) { s.classList.toggle('is-active', Number(s.dataset.station) === i); });
      var from = factory.current, to = factory.stops[i];
      cancelAnimationFrame(anim);
      if (reduceMotion) { factory.current = to; factory.place(to); return; }
      var t0 = performance.now(), dur = Math.min(1400, 350 + Math.abs(to - from) * 90);
      (function frame(now) {
        var t = Math.min(1, (now - t0) / dur);
        var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        factory.current = from + (to - from) * e;
        factory.place(factory.current);
        if (t < 1) anim = requestAnimationFrame(frame);
      })(t0);
    }
    factory.place(factory.current);
    setActive(0);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setActive(Number(en.target.dataset.station)); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      steps.forEach(function (s) { io.observe(s); });
    }
  }

  // ---------- Order flow (shown when the factory flag is off) ----------
  function initFlow() {
    var machine = document.getElementById('machine');
    if (!machine) return;
    var stations = Array.prototype.slice.call(machine.querySelectorAll('.station'));
    var slipItems = Array.prototype.slice.call(document.querySelectorAll('#slip li'));
    var parcel = document.getElementById('flow-parcel');
    var rail = document.getElementById('rail');
    var fill = document.getElementById('rail-fill');
    var toggle = document.getElementById('flow-toggle');
    var restart = document.getElementById('flow-restart');
    var step = 0, timer = null, playing = !reduceMotion, DWELL = 2200;

    function anchor(el) {
      var m = machine.getBoundingClientRect();
      var ico = el.querySelector('.ico').getBoundingClientRect();
      if (window.innerWidth <= 860) return { x: 22, y: ico.top - m.top + ico.height / 2, v: true };
      return { x: ico.left - m.left + ico.width / 2, y: 20, v: false };
    }
    function layout(upTo) {
      var a = anchor(stations[0]), b = anchor(stations[stations.length - 1]), c = anchor(stations[upTo]);
      if (a.v) {
        rail.style.cssText = 'left:' + (a.x - 2) + 'px;top:' + a.y + 'px;width:4px;height:' + (b.y - a.y) + 'px';
        fill.style.cssText = 'left:' + (a.x - 2) + 'px;top:' + a.y + 'px;width:4px;height:' + (c.y - a.y) + 'px';
      } else {
        rail.style.cssText = 'left:' + a.x + 'px;top:' + (a.y - 2) + 'px;height:4px;width:' + (b.x - a.x) + 'px';
        fill.style.cssText = 'left:' + a.x + 'px;top:' + (a.y - 2) + 'px;height:4px;width:' + (c.x - a.x) + 'px';
      }
      parcel.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px)';
    }
    function show(i) {
      step = i;
      stations.forEach(function (s, k) { s.classList.toggle('is-on', k === i); s.classList.toggle('is-done', k < i); });
      slipItems.forEach(function (li, k) { li.classList.toggle('is-done', k <= i); });
      layout(i);
    }
    function schedule() {
      clearTimeout(timer);
      if (!playing) return;
      timer = setTimeout(function () {
        if (step + 1 >= stations.length) show(0); else show(step + 1);
        schedule();
      }, step === stations.length - 1 ? DWELL * 1.4 : DWELL);
    }
    function setPlaying(p) {
      playing = p; toggle.textContent = p ? 'Pause' : 'Play'; toggle.setAttribute('aria-pressed', p ? 'false' : 'true');
      if (p) schedule(); else clearTimeout(timer);
    }
    toggle.addEventListener('click', function () { setPlaying(!playing); });
    restart.addEventListener('click', function () { show(0); setPlaying(true); });
    window.addEventListener('resize', function () { layout(step); });
    if (reduceMotion) { show(stations.length - 1); stations.forEach(function (s) { s.classList.add('is-done'); }); setPlaying(false); }
    else { show(0); schedule(); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(step); });
  }


  // ---------- Problem / fix: connected tools ----------
  function drawSolution() {
    var svg = document.getElementById('solution-svg');
    if (!svg) return;
    svg.innerHTML = '';
    var sc = new Scene(svg, 26);
    sc.box(-1.5, -1.5, -0.3, 13, 11, 0.3, 'floorbox');
    svg.lastChild.querySelectorAll('polygon').forEach(function (n) { n.setAttribute('class', 'floor'); });
    var hub = { x: 4.2, y: 3.0, w: 2.6, h: 1.6 };
    var apps = [
      { n: 'Sales', x: 0.4, y: -0.2 }, { n: 'Accounting', x: 5.0, y: -1.0 }, { n: 'Inventory', x: 9.0, y: 2.6 },
      { n: 'Projects', x: 0.0, y: 4.6 }, { n: 'Purchasing', x: 4.6, y: 7.4 }, { n: 'Expenses', x: 8.6, y: 7.0 }
    ];
    var hc = [hub.x + hub.w / 2, hub.y + hub.w / 2];
    var lg = sc.g('links');
    var checks = [];
    apps.forEach(function (a) {
      var pa = sc.p(a.x + 0.6, a.y + 0.6, 0.02), pb = sc.p(hc[0], hc[1], 0.02);
      sc.el('line', { x1: pa[0], y1: pa[1], x2: pb[0], y2: pb[1], 'class': 'link' }, lg);
    });
    var items = apps.map(function (a) { return { n: a.n, x: a.x, y: a.y, w: 1.2, h: 0.7, cls: '' }; });
    items.push({ n: 'Done & Done', x: hub.x, y: hub.y, w: hub.w, h: hub.h, cls: 'hub' });
    items.sort(function (a, b) { return (a.x + a.y) - (b.x + b.y); }).forEach(function (t) {
      sc.box(t.x, t.y, 0, t.w, t.w, t.h, t.cls);
      if (!t.cls) checks.push(sc.p(t.x + t.w / 2, t.y + t.w / 2, t.h));
      var top = sc.p(t.x + t.w / 2, t.y + t.w / 2, t.h + (t.cls ? 1.05 : 0.95));
      var txt = sc.el('text', { x: top[0].toFixed(1), y: top[1].toFixed(1), 'text-anchor': 'middle', 'class': t.cls ? 'hub-label' : '' });
      txt.textContent = t.n;
    });
    var cg = sc.g('checks');
    checks.forEach(function (c) {
      sc.el('circle', { cx: c[0], cy: c[1], r: 8, 'class': 'ok-bg' }, cg);
      sc.el('path', { d: 'M' + (c[0] - 3.6) + ' ' + (c[1] + 0.2) + 'l2.6 2.6 5-5.4', 'class': 'ok' }, cg);
    });
    sc.fit(20);
  }

  function initProblemTabs() {
    var card = document.getElementById('ps');
    if (!card) return;
    var tabs = [document.getElementById('tab-problem'), document.getElementById('tab-fix')];
    var panels = [document.getElementById('ps-problem'), document.getElementById('ps-fix')];
    var DUR = [6000, 9000];
    var current = 0, auto = true, timer = null, visible = false;
    function select(i, fromUser) {
      current = i;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var bar = t.querySelector('.ps-bar');
        bar.classList.remove('run');
        if (on && auto) { t.style.setProperty('--ps-dur', DUR[i] + 'ms'); void bar.offsetWidth; bar.classList.add('run'); }
      });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
      // the flipdots on the panel that just appeared flip through "working" into their state
      panels[i].querySelectorAll('tiny-tell').forEach(function (t, n) {
        var target = t.closest('.no') ? 'error' : 'done';
        if (reduceMotion || !t.matches(':defined')) return;
        t.state = 'working';
        setTimeout(function () { t.state = target; }, 700 + n * 220);
      });
      if (fromUser) { auto = false; clearTimeout(timer); tabs.forEach(function (t) { t.querySelector('.ps-bar').classList.remove('run'); }); }
      else schedule();
    }
    function schedule() {
      clearTimeout(timer);
      if (!auto || !visible) return;
      timer = setTimeout(function () { select(1 - current); }, DUR[current]);
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { select(k, true); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(1 - k, true); tabs[1 - k].focus(); }
      });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && auto) select(current); else clearTimeout(timer);
      }, { threshold: 0.35 }).observe(card);
    } else { visible = true; select(0); }
  }

  // ---------- Maple leaves around "Set up for Canada." ----------
  var LEAF_PATH = 'm-90 2030 45-863a95 95 0 0 0-111-98l-859 151 116-320a65 65 0 0 0-20-73l-941-762 212-99a65 65 0 0 0 34-79l-186-572 542 115a65 65 0 0 0 73-38l105-247 423 454a65 65 0 0 0 111-57l-204-1052 327 189a65 65 0 0 0 91-27l332-652 332 652a65 65 0 0 0 91 27l327-189-204 1052a65 65 0 0 0 111 57l423-454 105 247a65 65 0 0 0 73 38l542-115-186 572a65 65 0 0 0 34 79l212 99-941 762a65 65 0 0 0-20 73l116 320-859-151a95 95 0 0 0-111 98l45 863z';
  var LEAF_COLORS = ['#D9541E', '#E8892B', '#B8321F', '#F0A830', '#C2471B'];
  var leafTweens = [];
  function initLeaves() {
    var wrap = document.getElementById('leaf-wrap');
    if (!wrap) return;
    wrap.querySelectorAll('.leaf').forEach(function (n) { n.remove(); });
    leafTweens.forEach(function (t) { t.kill(); }); leafTweens = [];
    var w = wrap.offsetWidth, h = wrap.offsetHeight;
    var small = window.innerWidth < 700;
    var count = small ? 4 : 6;
    var hasGsap = window.gsap && window.MotionPathPlugin;
    // resting spots used when motion is off or GSAP could not load
    var rest = [[-0.06, 0.05, -20], [0.97, -0.1, 25], [0.25, 0.92, 140], [0.7, 0.95, -60], [0.48, -0.2, 70], [1.02, 0.6, -110]];
    for (var i = 0; i < count; i++) {
      var leaf = document.createElement('span');
      leaf.className = 'leaf';
      var size = (small ? 14 : 18) + (i % 3) * (small ? 3 : 5);
      leaf.style.width = leaf.style.height = size + 'px';
      leaf.innerHTML = '<svg viewBox="-2015 -2015 4030 4030" aria-hidden="true"><path fill="' + LEAF_COLORS[i % LEAF_COLORS.length] + '" d="' + LEAF_PATH + '"/></svg>';
      wrap.appendChild(leaf);
      var r = rest[i % rest.length];
      if (!hasGsap || reduceMotion) {
        leaf.style.transform = 'translate(' + (r[0] * w - size / 2) + 'px,' + (r[1] * h - size / 2) + 'px) rotate(' + r[2] + 'deg)';
        continue;
      }
      if (i === 0) window.gsap.registerPlugin(window.MotionPathPlugin);
      var y0 = (Math.random() * 1.2 - 0.25) * h;
      var amp = h * (0.35 + Math.random() * 0.3);
      var path = [
        { x: -0.12 * w, y: y0 },
        { x: 0.15 * w, y: y0 - amp },
        { x: 0.32 * w, y: y0 + amp * 0.6 },
        { x: 0.42 * w, y: y0 - amp * 0.2 },
        { x: 0.36 * w, y: y0 - amp * 0.9 },   // a little loop, like a gust
        { x: 0.55 * w, y: y0 - amp * 0.5 },
        { x: 0.78 * w, y: y0 + amp * 0.7 },
        { x: 1.08 * w, y: y0 - amp * 0.3 }
      ];
      var dur = 7 + Math.random() * 4;
      var tl = window.gsap.timeline({ repeat: -1, repeatDelay: Math.random() * 1.5 });
      tl.set(leaf, { opacity: 0, xPercent: -50, yPercent: -50 })
        .to(leaf, { opacity: 0.95, duration: 0.6 }, 0)
        .to(leaf, { duration: dur, ease: 'sine.inOut', rotation: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 360),
          motionPath: { path: path, curviness: 1.4 } }, 0)
        .to(leaf, { opacity: 0, duration: 0.8 }, dur - 0.8);
      // start each leaf at a different point on its path so they're spread out from the first frame
      tl.progress((i + 0.3 + Math.random() * 0.4) / count);
      leafTweens.push(tl);
      // flutter: the leaf flips edge-on now and then, as if turning in the wind
      leafTweens.push(window.gsap.to(leaf.firstChild, { scaleX: 0.25, duration: 0.45 + Math.random() * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: Math.random() }));
    }
  }

  // ---------- Copy email ----------
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    var status = document.getElementById('copy-status');
    copyBtn.addEventListener('click', function () {
      var text = 'hello@doneanddone.co';
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(document.getElementById('email'));
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        status.textContent = 'Address selected. Copy it with your keyboard.';
      }
      try { navigator.clipboard.writeText(text).then(function () { status.textContent = 'Copied hello@doneanddone.co'; }, fallback); }
      catch (e) { fallback(); }
    });
  }

  // ---------- Boot ----------
  maybeRebuildTiles();
  buildPixels();
  drawScatter();
  drawSolution();
  initProblemTabs();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initLeaves); else initLeaves();
  if (flags.factory) initFactory(); else initFlow();
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var widthChanged = hero && hero.clientWidth !== lastW;
      maybeRebuildTiles(); buildPixels();
      if (widthChanged) initLeaves();
    }, 150);
  });
})();
