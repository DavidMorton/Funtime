/* Pay Zone — map generation and the descent screen. */
window.PZ = window.PZ || {};

(function (PZ) {
  const U = PZ.U;
  const ROWS = 11, COLS = 5, PATHS = 5;
  const W = 760, TOP = 150, GAP = 96;

  PZ.genMap = () => {
    const nodes = {};
    const key = (r, c) => r + '-' + c;
    const starts = U.shuffle([0, 1, 2, 3, 4]).slice(0, 3);
    for (let p = 0; p < PATHS; p++) {
      let col = p < starts.length ? starts[p] : U.rand(0, COLS - 1);
      let prev = null;
      for (let r = 0; r < ROWS; r++) {
        const k = key(r, col);
        if (!nodes[k]) nodes[k] = { id: k, row: r, col, next: [], type: null, x: 0, y: 0 };
        if (prev && !nodes[prev].next.includes(k)) nodes[prev].next.push(k);
        prev = k;
        // step to next column without crossing an existing edge
        const opts = [col - 1, col, col + 1].filter(c => c >= 0 && c < COLS);
        const safe = opts.filter(c => {
          if (c === col) return true;
          const side = key(r, c); const diag = key(r + 1, col);
          return !(nodes[side] && nodes[side].next.includes(diag));
        });
        col = U.pick(safe.length ? safe : [col]);
      }
    }
    // assign types
    const list = Object.values(nodes);
    list.forEach(n => {
      n.x = 110 + n.col * ((W - 220) / (COLS - 1)) + U.rand(-16, 16);
      n.y = TOP + n.row * GAP + U.rand(-10, 10);
      if (n.row === 0) n.type = 'battle';
      else if (n.row === 6) n.type = 'treasure';
      else if (n.row === ROWS - 1) n.type = 'rest';
      else {
        const w = [['battle', 44], ['event', 24], ['elite', n.row >= 3 ? 10 : 0], ['rest', n.row >= 3 && n.row !== ROWS - 2 ? 10 : 0], ['shop', n.row >= 2 ? 11 : 0]];
        let t = Math.random() * w.reduce((a, b) => a + b[1], 0);
        for (const [type, wt] of w) { if ((t -= wt) < 0) { n.type = type; break; } }
        if (!n.type) n.type = 'battle';
      }
    });
    if (!list.some(n => n.type === 'shop')) { const c = list.filter(n => n.row >= 3 && n.row <= 8); if (c.length) U.pick(c).type = 'shop'; }
    if (!list.some(n => n.type === 'elite')) { const c = list.filter(n => n.row >= 4 && n.row <= 8 && n.type === 'battle'); if (c.length) U.pick(c).type = 'elite'; }
    const boss = { id: 'boss', row: ROWS, col: 2, next: [], type: 'boss', x: W / 2, y: TOP + ROWS * GAP + 50 };
    list.filter(n => n.row === ROWS - 1).forEach(n => n.next.push('boss'));
    nodes.boss = boss;
    return { nodes, visited: [], rows: ROWS };
  };

  PZ.availableNodes = () => {
    const run = PZ.G.run, map = run.map;
    if (!run.pos) return Object.values(map.nodes).filter(n => n.row === 0).map(n => n.id);
    return map.nodes[run.pos].next;
  };

  function strata(act, height) {
    const cols = PZ.ACTS[act].colors;
    let out = '';
    let y = 90; let i = 0;
    while (y < height) {
      const h = 60 + ((i * 37) % 70);
      const c = cols[i % cols.length];
      const amp = 6 + (i % 3) * 5;
      let d = `M0 ${y}`;
      for (let x = 0; x <= W; x += 40) d += ` Q ${x + 20} ${y + (i % 2 ? amp : -amp)} ${x + 40} ${y}`;
      d += ` L ${W} ${height} L 0 ${height} Z`;
      out += `<path d="${d}" fill="${c}" opacity="0.92"/>`;
      // speckles for texture
      for (let s = 0; s < 14; s++) {
        const sx = (s * 97 + i * 53) % W, sy = y + 12 + ((s * 29 + i * 17) % Math.max(10, h - 16));
        out += `<circle cx="${sx}" cy="${sy}" r="${1 + (s % 3)}" fill="rgba(0,0,0,.12)"/>`;
      }
      y += h; i++;
    }
    return out;
  }

  function derrick() {
    return `<g class="derrick" transform="translate(${W / 2 - 40} 6)">
      <rect x="0" y="80" width="80" height="6" fill="#2a2320"/>
      <path d="M10 80 L36 4 L44 4 L70 80" stroke="#3a302a" stroke-width="3" fill="none"/>
      <path d="M17 60 L63 60 M22 44 L58 44 M27 28 L53 28 M17 60 L58 44 L22 44 L53 28" stroke="#3a302a" stroke-width="1.6" fill="none"/>
      <rect x="34" y="0" width="12" height="6" fill="#c0392b"/>
    </g>`;
  }

  PZ.showMap = () => {
    const run = PZ.G.run;
    PZ.G.screen = 'map'; PZ.G.combat = null;
    PZ.audio.mood('calm');
    PZ.saveRun();
    const map = run.map, nodes = map.nodes;
    const H = TOP + ROWS * GAP + 150;
    const avail = PZ.availableNodes();
    const visited = map.visited;
    let edges = '';
    Object.values(nodes).forEach(n => n.next.forEach(k => {
      const m = nodes[k];
      const walked = visited.includes(n.id) && visited.includes(k) && visited.indexOf(k) === visited.indexOf(n.id) + 1;
      const open = run.pos === n.id && avail.includes(k);
      edges += `<line x1="${n.x}" y1="${n.y}" x2="${m.x}" y2="${m.y}" class="edge ${walked ? 'walked' : ''} ${open ? 'open' : ''}"/>`;
    }));
    // wellbore from surface through visited nodes
    let bore = `M ${W / 2} 92`;
    visited.forEach(id => { const n = nodes[id]; bore += ` L ${n.x} ${n.y}`; });
    const cur = run.pos ? nodes[run.pos] : null;
    let nodeSvg = '';
    Object.values(nodes).forEach(n => {
      const t = PZ.NODE_TYPES[n.type];
      const isAvail = avail.includes(n.id), isVisited = visited.includes(n.id), isCur = run.pos === n.id;
      const r = n.type === 'boss' ? 42 : 22;
      const icon = n.type === 'boss' ? PZ.ENEMIES[PZ.ACTS[run.act].boss].art : t.icon;
      const label = n.type === 'boss' ? PZ.ENEMIES[PZ.ACTS[run.act].boss].name : t.name;
      nodeSvg += `<g class="node t-${n.type} ${isAvail ? 'avail' : ''} ${isVisited ? 'visited' : ''} ${isCur ? 'current' : ''}" data-node="${n.id}" ${isAvail ? `onclick="PZ.enterNode('${n.id}')"` : ''} data-tip="${U.esc(label)}">
        <circle cx="${n.x}" cy="${n.y}" r="${r + 6}" class="halo"/>
        <circle cx="${n.x}" cy="${n.y}" r="${r}" class="disc"/>
        <text x="${n.x}" y="${n.y + (n.type === 'boss' ? 14 : 7)}" text-anchor="middle" font-size="${n.type === 'boss' ? 40 : 21}">${icon}</text>
      </g>`;
    });
    let depthLabels = '';
    for (let r = 0; r < ROWS; r += 2) depthLabels += `<text x="12" y="${TOP + r * GAP + 4}" class="depth-label">${U.fmt(PZ.depthFt(run.act, r))} ft</text>`;
    const bit = cur ? `<text x="${cur.x}" y="${cur.y - 30}" text-anchor="middle" font-size="22" class="bit">🔩</text>` : '';

    U.$('#screen').innerHTML = `<div class="screen-map">
      <div class="map-head">
        <div>
          <div class="eyebrow">Act ${run.act + 1} of 3</div>
          <h1>${PZ.ACTS[run.act].name}</h1>
        </div>
        <div class="legend">${['battle', 'elite', 'event', 'shop', 'rest', 'treasure'].map(k => `<span>${PZ.NODE_TYPES[k].icon} ${PZ.NODE_TYPES[k].name}</span>`).join('')}</div>
      </div>
      <div class="map-scroll" id="mapScroll">
        <svg viewBox="0 0 ${W} ${H}" class="map-svg" style="max-width:${W}px">
          <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c98b"/><stop offset="1" stop-color="#e8a86a"/></linearGradient></defs>
          <rect x="0" y="0" width="${W}" height="100" fill="url(#sky)"/>
          ${strata(run.act, H)}
          ${derrick()}
          ${depthLabels}
          <g class="edges">${edges}</g>
          <path d="${bore}" class="wellbore"/>
          <g class="nodes">${nodeSvg}</g>
          ${bit}
        </svg>
      </div>
      <p class="map-hint">Choose where to drill next. Glowing nodes are reachable.</p>
    </div>`;
    PZ.renderTopBar();
    // scroll to current
    const sc = U.$('#mapScroll');
    const target = cur ? cur.y : 0;
    requestAnimationFrame(() => { const svg = sc.querySelector('svg'); const scale = svg.getBoundingClientRect().width / W; sc.scrollTop = Math.max(0, target * scale - sc.clientHeight / 3); });
  };

  PZ.enterNode = id => {
    const run = PZ.G.run;
    if (!PZ.availableNodes().includes(id)) return;
    PZ.audio.sfx('click');
    const node = run.map.nodes[id];
    run.pos = id; run.map.visited.push(id); run.floor++;
    const act = PZ.ACTS[run.act];
    switch (node.type) {
      case 'battle': {
        const pool = run.fightsThisAct < 2 ? act.easy : act.hard;
        run.fightsThisAct++;
        let enc = U.pick(pool);
        if (run.lastEnc && pool.length > 1 && enc.join() === run.lastEnc) enc = U.pick(pool);
        run.lastEnc = enc.join();
        PZ.startCombat(enc, 'battle'); break;
      }
      case 'elite': PZ.startCombat(U.pick(act.elites), 'elite'); break;
      case 'boss': PZ.startCombat([act.boss], 'boss'); break;
      case 'rest': PZ.showRest(); break;
      case 'shop': PZ.showShop(); break;
      case 'treasure': PZ.showTreasure(); break;
      case 'event': PZ.showEvent(); break;
    }
  };
})(window.PZ);
