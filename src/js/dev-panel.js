/**
 * Live Parameter Editing — Dev Panel
 * Methode: J-THRUST / Klarsite
 * Angepasst für Doris (Rosa/Teal Farbsystem)
 * NUR für Entwicklungsphase — vor Deploy entfernen!
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'doris_dev_panel';
  const STATES_KEY = 'doris_dev_states';
  const UNDO_KEY = 'doris_dev_undo';
  const root = document.documentElement;
  const bod = document.body;

  // ─── Seite erkennen ─────────────────────────────────
  const pageId = window.location.pathname.replace(/\//g, '') || 'home';

  // ─── Parameter-Definitionen ───────────────────────────
  const sections = [
    {
      title: 'FARBEN',
      params: [
        { id: '--rosa-dunkel', label: 'Rosa Dunkel', type: 'color', def: '#C99389' },
        { id: '--rosa-hell', label: 'Rosa Hell', type: 'color', def: '#E3AEA6' },
        { id: '--weiss', label: 'Weiss', type: 'color', def: '#FFFFFF' },
        { id: '--dunkelgrau', label: 'Dunkelgrau', type: 'color', def: '#323335' },
        { id: '--teal', label: 'Teal', type: 'color', def: '#89BFC9' },
        { id: '--teal-hell', label: 'Teal Hell', type: 'color', def: '#A6DBE3' },
      ]
    },
    {
      title: 'TYPOGRAFIE',
      params: [
        { id: '--h1-size', label: 'H1', type: 'range', min: 24, max: 72, step: 1, def: 48, unit: 'px',
          apply: function(v) { document.querySelectorAll('h1').forEach(function(el) { el.style.fontSize = v + 'px'; }); } },
        { id: '--h2-size', label: 'H2', type: 'range', min: 20, max: 56, step: 1, def: 36, unit: 'px',
          apply: function(v) { document.querySelectorAll('h2').forEach(function(el) { el.style.fontSize = v + 'px'; }); } },
        { id: '--h3-size', label: 'H3', type: 'range', min: 16, max: 40, step: 1, def: 24, unit: 'px',
          apply: function(v) { document.querySelectorAll('h3').forEach(function(el) { el.style.fontSize = v + 'px'; }); } },
        { id: '--body-size', label: 'Body', type: 'range', min: 14, max: 24, step: 1, def: 18, unit: 'px',
          apply: function(v) { document.querySelectorAll('p, li, blockquote').forEach(function(el) { el.style.fontSize = v + 'px'; }); } },
        { id: '--body-lh', label: 'Zeilenhöhe', type: 'range', min: 1.2, max: 2.2, step: 0.05, def: 1.6, unit: '',
          apply: function(v) { document.querySelectorAll('p, li, blockquote').forEach(function(el) { el.style.lineHeight = v; }); } },
        { id: '--font-weight', label: 'Gewicht', type: 'range', min: 100, max: 500, step: 100, def: 300, unit: '',
          apply: function(v) { bod.style.fontWeight = v; } },
      ]
    },
    {
      title: 'NAVIGATION',
      params: [
        { id: '--nav-size', label: 'Schriftgröße', type: 'range', min: 0.7, max: 1.4, step: 0.05, def: 1, unit: 'rem',
          apply: function(v) { document.querySelectorAll('.main-nav a').forEach(function(el) { el.style.fontSize = v + 'rem'; }); } },
        { id: '--nav-padding', label: 'Padding', type: 'range', min: 0.5, max: 3, step: 0.25, def: 1, unit: 'rem',
          apply: function(v) { var nav = document.querySelector('.main-nav'); if (nav) nav.style.padding = v + 'rem 2rem'; } },
      ]
    },
    {
      title: 'LAYOUT',
      params: [
        { id: '--section-padding', label: 'Section Padding', type: 'range', min: 1, max: 8, step: 0.25, def: 4, unit: 'rem',
          apply: function(v) { document.querySelectorAll('.section').forEach(function(s) { s.style.padding = v + 'rem 2rem'; }); } },
        { id: '--content-narrow', label: 'Schmale Breite', type: 'range', min: 400, max: 900, step: 10, def: 700, unit: 'px',
          apply: function(v) { document.querySelectorAll('.content-narrow').forEach(function(el) { el.style.maxWidth = v + 'px'; }); } },
        { id: '--content-wide', label: 'Weite Breite', type: 'range', min: 600, max: 1400, step: 10, def: 1000, unit: 'px',
          apply: function(v) { document.querySelectorAll('.content-wide').forEach(function(el) { el.style.maxWidth = v + 'px'; }); } },
        { id: '--quote-width', label: 'Zitat-Breite', type: 'range', min: 300, max: 700, step: 10, def: 500, unit: 'px',
          apply: function(v) { document.querySelectorAll('.quote-box').forEach(function(el) { el.style.maxWidth = v + 'px'; }); } },
      ]
    },
    {
      title: 'GALERIE',
      params: [
        { id: '--galerie-tile-padding', label: 'Tile Padding', type: 'range', min: 1, max: 6, step: 0.25, def: 4, unit: 'rem',
          apply: function(v) { document.querySelectorAll('.galerie-split__tile').forEach(function(el) { el.style.padding = v + 'rem 3rem'; }); } },
        { id: '--galerie-gap', label: 'Grid Gap', type: 'range', min: 0, max: 20, step: 1, def: 0, unit: 'px',
          apply: function(v) { var g = document.querySelector('.galerie-split'); if (g) g.style.gap = v + 'px'; } },
      ]
    },
  ];

  // ─── Storage ────────────────────────────────────────
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { }

  // Farben auf :root anwenden
  Object.entries(saved).forEach(function(entry) {
    var k = entry[0], v = entry[1];
    if (k.startsWith('--rosa') || k.startsWith('--teal') || k.startsWith('--weiss') || k.startsWith('--dunkelgrau')) {
      root.style.setProperty(k, v);
    }
  });

  // Element-Styles anwenden
  function applyElementStyles() {
    sections.forEach(function(sec) {
      sec.params.forEach(function(p) {
        if (p.apply && saved[p.id] !== undefined) {
          p.apply(parseFloat(saved[p.id]));
        }
      });
    });
  }
  applyElementStyles();

  // ─── Panel HTML ─────────────────────────────────────
  var panel = document.createElement('div');
  panel.id = 'dev-panel';
  panel.innerHTML =
    '<div class="dp-header">' +
      '<span class="dp-title">DESIGN</span>' +
      '<span class="dp-page-id">' + pageId + '</span>' +
      '<div class="dp-actions">' +
        '<button class="dp-btn dp-undo" title="Undo (Cmd+Z)">&#8617;</button>' +
        '<button class="dp-btn dp-save-state" title="State speichern">Save</button>' +
        '<button class="dp-btn dp-copy" title="CSS kopieren">CSS</button>' +
        '<button class="dp-btn dp-reset" title="Zurücksetzen">Reset</button>' +
        '<button class="dp-btn dp-min" title="Minimieren">_</button>' +
      '</div>' +
    '</div>' +
    '<div class="dp-states-bar"></div>' +
    '<div class="dp-body"></div>';

  var panelBody = panel.querySelector('.dp-body');

  sections.forEach(function(sec) {
    var group = document.createElement('div');
    group.className = 'dp-section';
    var header = document.createElement('div');
    header.className = 'dp-sec-header';
    header.textContent = sec.title;
    header.onclick = function() { group.classList.toggle('dp-collapsed'); };
    group.appendChild(header);

    var content = document.createElement('div');
    content.className = 'dp-sec-content';

    sec.params.forEach(function(p) {
      var row = document.createElement('div');
      row.className = 'dp-row';

      var label = document.createElement('label');
      label.className = 'dp-label';
      label.textContent = p.label;

      var val = saved[p.id] !== undefined ? saved[p.id] : p.def;

      if (p.type === 'color') {
        var input = document.createElement('input');
        input.type = 'color';
        input.className = 'dp-color';
        input.setAttribute('data-dp-id', p.id);
        input.value = typeof val === 'string' ? val : p.def;
        input.oninput = function() { setParam(p, input.value); };
        row.appendChild(label);
        row.appendChild(input);
      } else if (p.type === 'range') {
        var numVal = typeof val === 'number' ? val : parseFloat(val);
        var inp = document.createElement('input');
        inp.type = 'range';
        inp.className = 'dp-range';
        inp.setAttribute('data-dp-id', p.id);
        inp.min = p.min;
        inp.max = p.max;
        inp.step = p.step;
        inp.value = numVal;
        var display = document.createElement('span');
        display.className = 'dp-val';
        display.textContent = numVal + (p.unit || '');
        inp.oninput = function() {
          display.textContent = inp.value + (p.unit || '');
          setParam(p, inp.value + (p.unit || ''));
        };
        row.appendChild(label);
        row.appendChild(inp);
        row.appendChild(display);
      }

      content.appendChild(row);
    });

    group.appendChild(content);
    panelBody.appendChild(group);
  });

  // ─── Styles ─────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent =
    '#dev-panel {' +
      'position: fixed; top: 20px; right: 20px; width: 300px; max-height: calc(100vh - 40px);' +
      'background: rgba(50, 51, 53, 0.95); color: #E3AEA6;' +
      'font: 11px/1.4 -apple-system, sans-serif; z-index: 99998;' +
      'display: flex; flex-direction: column;' +
      'border: 1px solid rgba(201,147,137,0.25);' +
      'border-radius: 10px;' +
      'backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);' +
      'box-shadow: 0 8px 40px rgba(0,0,0,0.5);' +
      'overflow: hidden;' +
    '}' +
    '#dev-panel.dp-minimized { display: none; }' +
    '.dp-header {' +
      'display: flex; align-items: center;' +
      'padding: 8px 10px; border-bottom: 1px solid rgba(201,147,137,0.15);' +
      'flex-shrink: 0; gap: 6px; cursor: grab; user-select: none;' +
    '}' +
    '.dp-header:active { cursor: grabbing; }' +
    '.dp-title { font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #C99389; }' +
    '.dp-page-id { font-size: 9px; color: #89BFC9; background: rgba(137,191,201,0.15); padding: 2px 6px; border-radius: 3px; letter-spacing: 1px; }' +
    '.dp-actions { display: flex; gap: 3px; margin-left: auto; }' +
    '.dp-btn {' +
      'background: rgba(255,255,255,0.06); border: 1px solid rgba(201,147,137,0.2);' +
      'color: #C99389; padding: 3px 6px; border-radius: 4px; font-size: 9px;' +
      'cursor: pointer; font-family: inherit; letter-spacing: 1px;' +
    '}' +
    '.dp-btn:hover { background: rgba(201,147,137,0.15); color: #fff; }' +
    '.dp-body { overflow-y: auto; overflow-x: hidden; flex: 1; padding-bottom: 1rem; }' +
    '.dp-section { border-bottom: 1px solid rgba(201,147,137,0.08); }' +
    '.dp-sec-header {' +
      'padding: 8px 12px; font-size: 9px; font-weight: 700; letter-spacing: 2px;' +
      'color: #89BFC9; cursor: pointer; user-select: none;' +
    '}' +
    '.dp-sec-header:hover { color: #A6DBE3; }' +
    '.dp-collapsed .dp-sec-content { display: none; }' +
    '.dp-sec-content { padding: 0 12px 8px; }' +
    '.dp-row {' +
      'display: flex; align-items: center; gap: 4px; margin-bottom: 5px;' +
      'min-height: 22px;' +
    '}' +
    '.dp-label { flex: 0 0 90px; font-size: 10px; color: #C99389; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
    '.dp-color { flex: 0 0 28px; height: 22px; border: 1px solid rgba(201,147,137,0.25); border-radius: 4px; padding: 0; cursor: pointer; background: none; }' +
    '.dp-range { flex: 1; min-width: 0; height: 3px; accent-color: #89BFC9; cursor: pointer; }' +
    '.dp-val { flex: 0 0 42px; text-align: right; font-size: 9px; color: #C99389; font-variant-numeric: tabular-nums; }' +
    '.dp-states-bar {' +
      'display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 12px;' +
      'border-bottom: 1px solid rgba(201,147,137,0.08);' +
    '}' +
    '.dp-states-bar:empty { display: none; padding: 0; }' +
    '.dp-state-chip {' +
      'display: flex; align-items: center; gap: 2px;' +
      'background: rgba(137,191,201,0.12); border: 1px solid rgba(137,191,201,0.25);' +
      'border-radius: 4px; padding: 2px 4px 2px 7px; cursor: pointer;' +
    '}' +
    '.dp-state-chip:hover { background: rgba(137,191,201,0.2); }' +
    '.dp-state-name { font-size: 9px; color: #89BFC9; letter-spacing: 1px; }' +
    '.dp-state-x { font-size: 12px; color: #666; padding: 0 3px; line-height: 1; }' +
    '.dp-state-x:hover { color: #C99389; }' +
    '.dp-toast {' +
      'position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);' +
      'background: #89BFC9; color: #323335; padding: 8px 20px; border-radius: 8px;' +
      'font-size: 11px; font-weight: 600; z-index: 99999; pointer-events: none;' +
    '}' +
    '.dp-resize {' +
      'position: absolute; bottom: 0; right: 0; width: 16px; height: 16px;' +
      'cursor: nwse-resize; opacity: 0.3;' +
    '}' +
    '.dp-resize:hover { opacity: 0.6; }' +
    '.dp-resize::after {' +
      'content: ""; position: absolute; bottom: 3px; right: 3px;' +
      'width: 8px; height: 8px; border-right: 2px solid #C99389; border-bottom: 2px solid #C99389;' +
    '}' +
    '#dp-restore {' +
      'display: none; position: fixed; top: 50%; right: 0; transform: translateY(-50%);' +
      'background: rgba(50,51,53,0.9); color: #89BFC9;' +
      'border: 1px solid rgba(201,147,137,0.2); border-right: none;' +
      'border-radius: 6px 0 0 6px; padding: 10px 7px;' +
      'font: 10px/1 -apple-system, sans-serif; font-weight: 700; letter-spacing: 2px;' +
      'cursor: pointer; writing-mode: vertical-lr; z-index: 99999;' +
    '}' +
    '#dp-restore:hover { color: #A6DBE3; background: rgba(50,51,53,1); }';

  document.head.appendChild(style);
  bod.appendChild(panel);

  // ─── Resize-Handle ─────────────────────────────────
  var resizeHandle = document.createElement('div');
  resizeHandle.className = 'dp-resize';
  panel.appendChild(resizeHandle);

  // ─── Restore-Button (DESIGN am Rand) ───────────────
  var restore = document.createElement('button');
  restore.id = 'dp-restore';
  restore.textContent = 'DESIGN';
  bod.appendChild(restore);

  // ─── Undo ───────────────────────────────────────────
  var undoStack = [];
  try { undoStack = JSON.parse(localStorage.getItem(UNDO_KEY)) || []; } catch (e) { }
  var MAX_UNDO = 50;

  function pushUndo() {
    undoStack.push(JSON.stringify(saved));
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    localStorage.setItem(UNDO_KEY, JSON.stringify(undoStack));
  }

  function undo() {
    if (!undoStack.length) return;
    var prev = JSON.parse(undoStack.pop());
    localStorage.setItem(UNDO_KEY, JSON.stringify(undoStack));
    saved = prev;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    applyAll();
    refreshUI();
    toast('Undo');
  }

  // ─── States ─────────────────────────────────────────
  var states = {};
  try { states = JSON.parse(localStorage.getItem(STATES_KEY)) || {}; } catch (e) { }

  function saveState(name) {
    states[name] = JSON.stringify(saved);
    localStorage.setItem(STATES_KEY, JSON.stringify(states));
    renderStates();
    toast('State "' + name + '" gespeichert');
  }

  function loadState(name) {
    if (!states[name]) return;
    pushUndo();
    saved = JSON.parse(states[name]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    applyAll();
    refreshUI();
    toast('State "' + name + '" geladen');
  }

  function deleteState(name) {
    delete states[name];
    localStorage.setItem(STATES_KEY, JSON.stringify(states));
    renderStates();
  }

  function renderStates() {
    var bar = panel.querySelector('.dp-states-bar');
    var names = Object.keys(states);
    if (!names.length) { bar.innerHTML = ''; return; }
    bar.innerHTML = names.map(function(n) {
      return '<div class="dp-state-chip">' +
        '<span class="dp-state-name" data-load="' + n + '">' + n + '</span>' +
        '<span class="dp-state-x" data-del="' + n + '">&times;</span>' +
      '</div>';
    }).join('');
    bar.querySelectorAll('[data-load]').forEach(function(el) { el.onclick = function() { loadState(el.dataset.load); }; });
    bar.querySelectorAll('[data-del]').forEach(function(el) { el.onclick = function(e) { e.stopPropagation(); deleteState(el.dataset.del); }; });
  }

  // ─── Core-Funktionen ───────────────────────────────
  function setParam(p, value) {
    pushUndo();
    if (p.type === 'color') {
      root.style.setProperty(p.id, value);
    } else if (p.apply) {
      p.apply(parseFloat(value));
    }
    saved[p.id] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  function applyAll() {
    // Farben zurücksetzen
    sections[0].params.forEach(function(p) { root.style.removeProperty(p.id); });
    // Gespeicherte Farben anwenden
    Object.entries(saved).forEach(function(entry) {
      var k = entry[0], v = entry[1];
      if (k.startsWith('--rosa') || k.startsWith('--teal') || k.startsWith('--weiss') || k.startsWith('--dunkelgrau')) {
        root.style.setProperty(k, v);
      }
    });
    // Element-Styles anwenden
    applyElementStyles();
  }

  function refreshUI() {
    sections.forEach(function(sec) {
      sec.params.forEach(function(p) {
        var input = panel.querySelector('[data-dp-id="' + p.id + '"]');
        if (!input) return;
        var val = saved[p.id] !== undefined ? saved[p.id] : p.def;
        if (p.type === 'color') {
          input.value = val;
        } else if (p.type === 'range') {
          var numVal = typeof val === 'number' ? val : parseFloat(val);
          input.value = numVal;
          var display = input.nextElementSibling;
          if (display) display.textContent = numVal + (p.unit || '');
        }
      });
    });
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'dp-toast';
    t.textContent = msg;
    bod.appendChild(t);
    setTimeout(function() { t.remove(); }, 1500);
  }

  // ─── Drag & Resize ────────────────────────────────
  var PANEL_POS_KEY = 'doris_dev_panel_pos';
  var panelPos = { top: 20, right: 20, width: 300, height: null };
  try {
    var sp = JSON.parse(localStorage.getItem(PANEL_POS_KEY));
    if (sp) panelPos = Object.assign(panelPos, sp);
  } catch (e) {}

  function applyPanelPos() {
    panel.style.top = panelPos.top + 'px';
    panel.style.right = panelPos.right + 'px';
    panel.style.left = 'auto';
    panel.style.width = panelPos.width + 'px';
    if (panelPos.height) panel.style.maxHeight = panelPos.height + 'px';
  }
  applyPanelPos();

  function savePanelPos() {
    localStorage.setItem(PANEL_POS_KEY, JSON.stringify(panelPos));
  }

  // Drag by header
  var dpHeader = panel.querySelector('.dp-header');
  var dragging = false, dragStartX, dragStartY, startRight, startTop;

  dpHeader.addEventListener('mousedown', function(e) {
    if (e.target.closest('.dp-btn, .dp-actions')) return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startRight = panelPos.right;
    startTop = panelPos.top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    var dx = e.clientX - dragStartX;
    var dy = e.clientY - dragStartY;
    panelPos.right = Math.max(0, startRight - dx);
    panelPos.top = Math.max(0, startTop + dy);
    applyPanelPos();
  });

  document.addEventListener('mouseup', function() {
    if (dragging) { dragging = false; savePanelPos(); }
  });

  // Resize by handle
  var resizing = false, resizeStartX, resizeStartY, startW, startH;

  resizeHandle.addEventListener('mousedown', function(e) {
    resizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    startW = panel.offsetWidth;
    startH = panel.offsetHeight;
    startRight = panelPos.right;
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', function(e) {
    if (!resizing) return;
    var dx = e.clientX - resizeStartX;
    var dy = e.clientY - resizeStartY;
    var newW = Math.max(240, startW + dx);
    panelPos.width = newW;
    panelPos.right = Math.max(0, startRight - (newW - startW));
    panelPos.height = Math.max(200, startH + dy);
    applyPanelPos();
  });

  document.addEventListener('mouseup', function() {
    if (resizing) { resizing = false; savePanelPos(); }
  });

  // ─── Button-Handler ────────────────────────────────
  panel.querySelector('.dp-min').onclick = function() {
    panel.classList.add('dp-minimized');
    restore.style.display = 'block';
  };
  restore.onclick = function() {
    panel.classList.remove('dp-minimized');
    restore.style.display = 'none';
  };

  panel.querySelector('.dp-undo').onclick = undo;
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.target.closest('[contenteditable], input, textarea')) {
      e.preventDefault();
      undo();
    }
  });

  panel.querySelector('.dp-save-state').onclick = function() {
    var name = prompt('Name für diesen State:');
    if (name && name.trim()) saveState(name.trim());
  };

  renderStates();

  panel.querySelector('.dp-reset').onclick = function() {
    pushUndo();
    localStorage.removeItem(STORAGE_KEY);
    saved = {};
    // Element-Styles zurücksetzen
    document.querySelectorAll('h1,h2,h3,p,li,blockquote').forEach(function(el) {
      el.style.fontSize = '';
      el.style.lineHeight = '';
    });
    bod.style.fontWeight = '';
    document.querySelectorAll('.section').forEach(function(s) { s.style.padding = ''; });
    document.querySelectorAll('.content-narrow,.content-wide,.quote-box').forEach(function(el) { el.style.maxWidth = ''; });
    document.querySelectorAll('.main-nav a').forEach(function(el) { el.style.fontSize = ''; });
    var nav = document.querySelector('.main-nav'); if (nav) nav.style.padding = '';
    document.querySelectorAll('.galerie-split__tile').forEach(function(el) { el.style.padding = ''; });
    var gal = document.querySelector('.galerie-split'); if (gal) gal.style.gap = '';
    // Farben zurücksetzen
    sections[0].params.forEach(function(p) { root.style.removeProperty(p.id); });
    refreshUI();
    toast('Reset auf Default');
  };

  panel.querySelector('.dp-copy').onclick = function() {
    var lines = [':root {'];
    sections.forEach(function(sec) {
      lines.push('  /* ' + sec.title + ' */');
      sec.params.forEach(function(p) {
        var val = saved[p.id] || (p.type === 'range' ? p.def + (p.unit || '') : p.def);
        lines.push('  ' + p.id + ': ' + val + ';');
      });
    });
    lines.push('}');
    var css = lines.join('\n');
    navigator.clipboard.writeText(css).then(function() { toast('CSS kopiert'); });
  };

  // ─── Start minimiert — Button sichtbar ─────────────
  panel.classList.add('dp-minimized');
  restore.style.display = 'block';

})();
