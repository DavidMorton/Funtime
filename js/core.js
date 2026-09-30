/* Pay Zone — core helpers: state, cards, storage, binder, UI utilities. */
window.PZ = window.PZ || {};

(function (PZ) {
  PZ.G = { run: null, combat: null, screen: 'title', busy: false };

  // ---------- Utilities ----------
  const U = PZ.U = {
    rand: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
    pick: arr => arr[Math.floor(Math.random() * arr.length)],
    shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; },
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    uid: (() => { let n = 0; return () => 'u' + Date.now().toString(36) + (n++).toString(36); })(),
    sleep: ms => new Promise(r => setTimeout(r, PZ.fast ? Math.min(ms, 5) : ms)),
    esc: s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    $: sel => document.querySelector(sel),
    $$: sel => Array.from(document.querySelectorAll(sel)),
    fmt: n => n.toLocaleString('en-US'),
  };

  // ---------- Storage (always wrapped) ----------
  const store = PZ.store = {
    get(key, fallback) { try { const v = localStorage.getItem('payzone.' + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(key, val) { try { localStorage.setItem('payzone.' + key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } },
    del(key) { try { localStorage.removeItem('payzone.' + key); } catch (e) { /* ignore */ } },
  };

  PZ.profile = store.get('profile', { runs: 0, wins: 0, bestGrace: 0, reconciledTotal: 0, pluggedTotal: 0, infiniteEndings: 0 });
  PZ.saveProfile = () => store.set('profile', PZ.profile);
  PZ.binder = store.get('binder', {});
  PZ.binderRegister = (id, foil) => {
    const d = PZ.CARDS[id]; if (!d || d.fam === 'junk') return false;
    const e = PZ.binder[id] || { n: 0, foil: 0 };
    const isNew = e.n === 0;
    e.n++; if (foil) e.foil++;
    PZ.binder[id] = e; store.set('binder', PZ.binder);
    return isNew;
  };

  // ---------- Card instances ----------
  PZ.inst = (id, up, foil) => ({ uid: U.uid(), id, up: !!up, foil: !!foil });
  PZ.def = inst => PZ.CARDS[inst.id];
  PZ.isUp = inst => !!(inst.up || inst.tmpUp);
  PZ.canUpgrade = inst => { const d = PZ.def(inst); return !inst.up && d.fam !== 'junk'; };
  PZ.fxOf = inst => {
    const d = PZ.def(inst);
    let fx = d.fx;
    if (PZ.isUp(inst)) {
      if (d.up) {
        fx = Object.assign({}, d.fx);
        for (const k in d.up) if (k !== 'exhaust') fx[k] = d.up[k];
      } else if (d.upCost == null) {
        fx = Object.assign({}, d.fx);
        ['dmg', 'dmgAll', 'dmgRandom', 'harm', 'harmAll', 'block'].forEach(k => { if (fx[k]) fx[k] += 3; });
      }
    }
    return fx;
  };
  PZ.exhaustOf = inst => { const d = PZ.def(inst); if (PZ.isUp(inst) && d.up && 'exhaust' in d.up) return d.up.exhaust; return !!d.exhaust; };
  PZ.baseCost = inst => { const d = PZ.def(inst); return PZ.isUp(inst) && d.upCost != null ? d.upCost : d.cost; };
  PZ.costOf = inst => (inst.tmpCost != null ? inst.tmpCost : PZ.baseCost(inst));
  PZ.cardText = (inst, fx) => {
    const d = PZ.def(inst);
    const txt = d.text(fx || PZ.fxOf(inst), { exhaust: PZ.exhaustOf(inst) });
    return U.esc(txt).replace(/\b(Block|Harmony|Exposed|Weak|Calm|Torque|Stitches|Flow|Exhaust|Reconcile|Energy|Unplayable|ALL)\b/g, '<b class="kw">$1</b>');
  };

  // ---------- Card rendering ----------
  PZ.renderCard = (inst, o = {}) => {
    const d = PZ.def(inst);
    const up = PZ.isUp(inst);
    const cost = o.cost != null ? o.cost : PZ.costOf(inst);
    const holo = inst.foil || d.rarity === 'rare';
    const cls = ['card', 'fam-' + d.fam, 'r-' + d.rarity, 't-' + d.type.toLowerCase()];
    if (holo) cls.push('holo'); if (inst.foil) cls.push('foil'); if (up) cls.push('up');
    if (o.cls) cls.push(o.cls);
    const costBase = PZ.baseCost(inst);
    const costCls = cost < costBase ? 'cheaper' : '';
    const costHtml = d.cost < 0 || d.unplayable ? '' : `<div class="c-cost ${costCls}">${cost}</div>`;
    const fam = PZ.FAMILIES[d.fam].name;
    const attrs = o.attrs || '';
    return `<div class="${cls.join(' ')}" data-uid="${inst.uid}" data-id="${d.id}" ${attrs}>
      <div class="c-frame">
        ${costHtml}
        <div class="c-name">${U.esc(d.name)}${up ? '<span class="plus">+</span>' : ''}</div>
        <div class="c-art"><span>${d.art}</span></div>
        <div class="c-type">${d.type} · ${fam}</div>
        <div class="c-text">${PZ.cardText(inst, o.fx)}</div>
        ${o.flavor !== false && d.flavor ? `<div class="c-flavor">${U.esc(d.flavor)}</div>` : ''}
        <div class="c-gem" title="${d.rarity}"></div>
      </div>
      <div class="c-shine"></div>
    </div>`;
  };

  // Pools for random cards
  PZ.cardPool = (fam, rarity) => Object.values(PZ.CARDS).filter(c =>
    c.rarity !== 'starter' && c.rarity !== 'special' && c.fam !== 'ally' && c.fam !== 'junk' &&
    (!fam || c.fam === fam) && (!rarity || c.rarity === rarity));
  PZ.rollRarity = (elite) => { const r = Math.random(); if (elite) return r < 0.16 ? 'rare' : r < 0.58 ? 'uncommon' : 'common'; return r < 0.07 ? 'rare' : r < 0.38 ? 'uncommon' : 'common'; };
  PZ.randomCardId = (fam, rarity, exclude = []) => {
    let pool = PZ.cardPool(fam, rarity).filter(c => !exclude.includes(c.id));
    if (!pool.length) pool = PZ.cardPool(fam).filter(c => !exclude.includes(c.id));
    if (!pool.length) pool = PZ.cardPool();
    return U.pick(pool).id;
  };
  PZ.cardChoices = (n, elite) => {
    const out = [];
    for (let i = 0; i < n; i++) out.push(PZ.randomCardId(null, PZ.rollRarity(elite), out));
    return out;
  };

  // ---------- Relic helpers ----------
  PZ.hasRelic = id => !!(PZ.G.run && PZ.G.run.relics.includes(id));
  PZ.renderRelic = (id, extra = '') => {
    const r = PZ.RELICS[id];
    return `<div class="relic ${extra}" data-tip="<b>${U.esc(r.name)}</b><br>${U.esc(r.text)}">${r.art}</div>`;
  };

  // ---------- Run persistence ----------
  PZ.saveRun = () => { if (PZ.G.run) store.set('run', PZ.G.run); };
  PZ.loadRun = () => store.get('run', null);
  PZ.clearRun = () => store.del('run');

  // ---------- UI utilities ----------
  PZ.toast = (msg, cls = '') => {
    const t = document.createElement('div'); t.className = 'toast ' + cls; t.innerHTML = msg;
    U.$('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 2200);
    setTimeout(() => t.remove(), 2800);
  };

  PZ.floatAt = (el, text, cls) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const f = document.createElement('div'); f.className = 'floater ' + (cls || '');
    f.textContent = text;
    f.style.left = (r.left + r.width / 2 + (Math.random() * 40 - 20)) + 'px';
    f.style.top = (r.top + r.height * 0.35) + 'px';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1300);
  };

  PZ.shake = (el, cls = 'shake') => { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  PZ.modal = (html, opts = {}) => {
    const m = U.$('#modal');
    m.innerHTML = `<div class="modal-back"></div><div class="modal-box ${opts.cls || ''}">${opts.closable === false ? '' : '<button class="modal-x" onclick="PZ.closeModal()" aria-label="Close">✕</button>'}${html}</div>`;
    m.classList.add('open');
    PZ._modalClose = opts.onClose || null;
    if (opts.closable !== false) m.querySelector('.modal-back').onclick = () => PZ.closeModal();
  };
  PZ.closeModal = () => {
    const m = U.$('#modal'); m.classList.remove('open'); m.innerHTML = '';
    const cb = PZ._modalClose; PZ._modalClose = null; if (cb) cb();
  };

  // Pick a card from a list (deck view, remove, upgrade, transform)
  PZ.pickCard = (cards, title, onPick, opts = {}) => {
    if (!cards.length) { PZ.toast('No cards to choose.'); if (opts.onCancel) opts.onCancel(); return; }
    const show = opts.preview === 'upgrade';
    const html = `<h2 class="modal-title">${title}</h2>
      ${opts.sub ? `<p class="modal-sub">${opts.sub}</p>` : ''}
      <div class="card-grid">${cards.map(c => {
        const shown = show ? Object.assign({}, c, { up: true }) : c;
        return `<div class="pick-wrap" data-pick="${c.uid}">${PZ.renderCard(shown)}</div>`;
      }).join('')}</div>
      ${opts.cancel !== false ? '<div class="modal-actions"><button class="btn ghost" data-cancel>Never mind</button></div>' : ''}`;
    PZ.modal(html, { cls: 'wide', closable: opts.cancel !== false, onClose: opts.onCancel });
    const m = U.$('#modal');
    m.querySelectorAll('[data-pick]').forEach(el => el.onclick = () => {
      const c = cards.find(x => x.uid === el.dataset.pick);
      PZ._modalClose = null; PZ.closeModal(); PZ.audio.sfx('click'); onPick(c);
    });
    const cancel = m.querySelector('[data-cancel]'); if (cancel) cancel.onclick = () => PZ.closeModal();
  };

  PZ.viewCards = (cards, title, sub) => {
    const sorted = cards.slice().sort((a, b) => {
      const da = PZ.def(a), db = PZ.def(b);
      return da.fam.localeCompare(db.fam) || da.name.localeCompare(db.name);
    });
    PZ.modal(`<h2 class="modal-title">${title}</h2>${sub ? `<p class="modal-sub">${sub}</p>` : ''}
      <div class="card-grid">${sorted.length ? sorted.map(c => PZ.renderCard(c)).join('') : '<p class="empty">Nothing here.</p>'}</div>`, { cls: 'wide' });
  };

  // ---------- Tooltips ----------
  PZ.initTooltips = () => {
    const tip = U.$('#tip');
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-tip]');
      if (!t) { tip.classList.remove('show'); return; }
      tip.innerHTML = t.dataset.tip; tip.classList.add('show');
      const r = t.getBoundingClientRect();
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let x = r.left + r.width / 2 - tw / 2, y = r.bottom + 8;
      if (y + th > window.innerHeight - 8) y = r.top - th - 8;
      tip.style.left = U.clamp(x, 8, window.innerWidth - tw - 8) + 'px';
      tip.style.top = Math.max(8, y) + 'px';
    });
    document.addEventListener('scroll', () => tip.classList.remove('show'), true);
  };

  // ---------- Holo tilt effect ----------
  PZ.initHolo = () => {
    document.addEventListener('pointermove', e => {
      const c = e.target.closest && e.target.closest('.card.holo');
      if (!c) return;
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      c.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      c.style.setProperty('--rx', ((0.5 - py) * 14).toFixed(2) + 'deg');
      c.style.setProperty('--ry', ((px - 0.5) * 18).toFixed(2) + 'deg');
    });
    document.addEventListener('pointerout', e => {
      const c = e.target.closest && e.target.closest('.card.holo');
      if (c && !c.contains(e.relatedTarget)) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); }
    });
  };

  PZ.depthFt = (act, row) => PZ.ACTS[act].depth0 + 400 + row * 380;
})(window.PZ);
