/* Pay Zone — non-combat screens: title, rewards, shop, packs, rest, events, binder, endings. */
window.PZ = window.PZ || {};

(function (PZ) {
  const U = PZ.U;
  const $screen = () => U.$('#screen');
  const R = () => PZ.G.run;

  // ---------- Top bar ----------
  PZ.renderTopBar = () => {
    const bar = U.$('#topbar'); const run = R();
    if (PZ.G.screen !== 'combat') { const co = U.$('.coach'); if (co) co.remove(); U.$$('.coach-focus').forEach(el => el.classList.remove('coach-focus')); }
    if (!run || PZ.G.screen === 'title') { bar.classList.remove('show'); bar.innerHTML = ''; return; }
    bar.classList.add('show');
    const hpPct = run.hp / run.maxHp;
    const node = run.pos && run.map.nodes[run.pos];
    const depth = node ? PZ.depthFt(run.act, Math.min(node.row, 10)) : PZ.ACTS[run.act].depth0;
    bar.innerHTML = `
      <div class="tb-left">
        <span class="tb-name">👷 ${U.esc(run.name)}</span>
        <span class="tb-stat ${hpPct < 0.3 ? 'danger' : ''}" data-tip="Health">❤️ ${Math.max(0, run.hp)}/${run.maxHp}</span>
        <span class="tb-stat" data-tip="Gold">💰 ${run.gold}</span>
        <span class="tb-stat" data-tip="Measured depth · ${U.esc(PZ.ACTS[run.act].name)}">⛏️ ${U.fmt(depth)} ft</span>
      </div>
      <div class="relic-bar">${run.relics.map(id => PZ.renderRelic(id)).join('')}</div>
      <div class="snack-bar">${[0, 1, 2].map(i => { const id = (run.snacks || [])[i]; const sn = id && PZ.SNACKS[id];
        return sn ? `<button class="snack" onclick="PZ.snackMenu(${i})" data-tip="<b>${sn.name}</b><br>${U.esc(sn.text)}">${sn.art}</button>` : '<span class="snack empty" data-tip="Empty snack slot. Snacks drop after fights and sell at the store."></span>'; }).join('')}</div>
      <div class="tb-right">
        <button class="tb-btn" onclick="PZ.viewCards(PZ.G.run.deck, 'Your Deck', PZ.G.run.deck.length + ' cards')" data-tip="View your deck">🃏 <b>${run.deck.length}</b></button>
        <button class="tb-btn" onclick="PZ.toggleMusic()" data-tip="Ambient jazz on/off">${PZ.audio.musicOn ? '🎵' : '🔇'}</button>
        <button class="tb-btn" onclick="PZ.toggleSfx()" data-tip="Sound effects on/off">${PZ.audio.sfxOn ? '🔊' : '🔈'}</button>
        <button class="tb-btn" onclick="PZ.showMenu()" data-tip="Menu">☰</button>
      </div>`;
  };
  PZ.toggleMusic = () => { PZ.audio.init(); PZ.audio.toggleMusic(); savePrefs(); PZ.renderTopBar(); refreshTitleAudio(); };
  PZ.toggleSfx = () => { PZ.audio.init(); PZ.audio.toggleSfx(); savePrefs(); PZ.renderTopBar(); refreshTitleAudio(); };
  function savePrefs() { PZ.store.set('prefs', { music: PZ.audio.musicOn, sfx: PZ.audio.sfxOn }); }
  function refreshTitleAudio() { const b = U.$('#titleMusic'); if (b) b.textContent = PZ.audio.musicOn ? '🎵 Music on' : '🔇 Music off'; }

  PZ.showMenu = () => {
    PZ.modal(`<h2 class="modal-title">Paused</h2>
      <div class="menu-list">
        <button class="btn" onclick="PZ.closeModal()">Resume</button>
        <button class="btn ghost" onclick="PZ.closeModal(); PZ.showHowTo()">How to play</button>
        <button class="btn ghost" onclick="PZ.closeModal(); PZ.showTitle()">Save and return to title</button>
        <button class="btn danger" onclick="PZ.abandonRun()">Abandon this descent</button>
      </div>
      <p class="modal-sub">Progress saves each time you return to the map.</p>`);
  };
  PZ.abandonRun = () => {
    PZ.closeModal();
    if (!confirmInline('Abandon this descent? The run ends.')) return;
    PZ.gameOver(false, true);
  };
  function confirmInline(msg) { return window.confirm(msg); }

  // ---------- Title ----------
  PZ.showTitle = () => {
    PZ.G.screen = 'title'; PZ.G.combat = null;
    PZ.audio.mood('calm');
    PZ.renderTopBar();
    const saved = PZ.loadRun();
    const p = PZ.profile;
    const collectible = Object.values(PZ.CARDS).filter(c => c.fam !== 'junk').length;
    const owned = Object.keys(PZ.binder).length;
    $screen().innerHTML = `<div class="screen-title">
      <div class="title-strata">${[0, 1, 2, 3, 4, 5, 6].map(i => `<div class="ts ts${i}"></div>`).join('')}</div>
      <div class="title-card">
        <div class="eyebrow">A Peacemaker's Descent</div>
        <h1 class="logo">PAY <span>ZONE</span></h1>
        <p class="tagline">Drill to total depth. Reconcile what you find.</p>
        <div class="title-buttons">
          ${saved ? `<button class="btn big" onclick="PZ.continueRun()">Continue Descent <small>Act ${saved.act + 1} · ${saved.hp}/${saved.maxHp} HP</small></button>` : ''}
          <button class="btn big ${saved ? 'ghost' : ''}" onclick="PZ.newRunPrompt()">New Descent</button>
          <div class="title-row">
            <button class="btn ghost" onclick="PZ.showBinder()">📒 Binder <small>${owned}/${collectible}</small></button>
            <button class="btn ghost" onclick="PZ.showHowTo()">❔ How to Play</button>
            <button class="btn ghost" id="titleMusic" onclick="PZ.toggleMusic()">${PZ.audio.musicOn ? '🎵 Music on' : '🔇 Music off'}</button>
          </div>
        </div>
        <div class="title-stats">
          <span>Descents <b>${p.runs}</b></span><span>Reached the Pay Zone <b>${p.wins}</b></span>
          <span>Foes reconciled <b>${p.reconciledTotal}</b></span><span>Best Grace <b>${p.bestGrace}</b></span><span>Stickers <b>${Object.keys(p.stickers).length}/${Object.keys(PZ.STICKERS).length}</b></span>
        </div>
      </div>
      <div class="title-foot">Made for David · Pearland, Texas · ${new Date().getFullYear()}</div>
    </div>`;
  };

  PZ.showHowTo = () => {
    PZ.modal(`<h2 class="modal-title">How to Play</h2>
    <div class="howto">
      <section><h3>🎯 The goal</h3><p>Drill down through three acts. Beat the boss at the bottom of each one. Reach the Pay Zone.</p></section>
      <section><h3>🃏 Your turn</h3><p>You get 3 Energy and 5 cards. Each card costs Energy. Click a card to play it. If it needs a target, click an enemy next. Press <kbd>E</kbd> or click End Turn when you're done.</p></section>
      <section><h3>❤️ Two ways to win a fight</h3>
        <p><b>Plug it:</b> bring an enemy's Health (red bar) to 0 with damage. You get more gold.</p>
        <p><b>Reconcile it:</b> bring its Unrest (purple bar) to 0 with Harmony. You heal a little, earn Grace, and the enemy may offer to join your deck as an Ally card. Block does not stop Harmony.</p></section>
      <section><h3>🔮 Read the room</h3><p>The icon above each enemy shows what it will do next. ⚔️ means an attack. 🛡️ means it will block. ⬆️ is a buff. ⬇️ weakens you. 🗑️ adds junk cards to your deck.</p></section>
      <section><h3>🛡️ Block</h3><p>Block absorbs attack damage. It resets at the start of your next turn.</p></section>
      <section><h3>🎴 Card families</h3>
        <p><span class="chip fam-drill">Drill</span> damage. <span class="chip fam-lake">Lakehouse</span> draw and Energy. <span class="chip fam-craft">Craft</span> Block. <span class="chip fam-hymn">Hymn</span> Harmony. <span class="chip fam-ally">Ally</span> reconciled friends.</p></section>
      <section><h3>🗺️ The map</h3><p>⚒️ fights. ⚠️ tougher fights with keepsakes. ❓ stories. 🃏 the game store sells cards and booster packs. 🏊 the pool lets you rest or practice. 🪨 core samples hold keepsakes.</p></section>
      <section><h3>📒 The binder</h3><p>Every card you find is saved in your binder across runs. Foils shimmer. Try to fill it.</p></section>
      <section><h3>⌨️ Shortcuts</h3><p><kbd>1</kbd>–<kbd>0</kbd> play cards. <kbd>E</kbd> ends your turn. <kbd>Esc</kbd> cancels targeting.</p></section>
    </div>`, { cls: 'wide' });
  };

  // ---------- New run ----------
  PZ.newRunPrompt = () => {
    if (PZ.loadRun() && !window.confirm('Start a new descent? Your saved run will be replaced.')) return;
    PZ.showCompanionSelect();
  };

  PZ.showCompanionSelect = () => {
    PZ.G.screen = 'title';
    PZ.renderTopBar();
    $screen().innerHTML = `<div class="screen-choose">
      <div class="eyebrow">Before you go down</div>
      <h1>Who's riding along?</h1>
      <p class="sub">Pick a companion. They stay with you the whole descent.</p>
      ${PZ.profile.maxPressure > 0 ? `<div class="pressure-pick"><span>Well pressure:</span>${PZ.PRESSURE.slice(0, PZ.profile.maxPressure + 1).map((p, i) =>
        `<button class="chip-btn ${(PZ.G.pressure || 0) === i ? 'on' : ''}" onclick="PZ.G.pressure=${i}; PZ.showCompanionSelect()" data-tip="${U.esc(p.desc)}">${p.name}</button>`).join('')}</div>` : ''}
      <div class="companions">${PZ.COMPANIONS.map(id => {
        const r = PZ.RELICS[id];
        return `<button class="companion" onclick="PZ.startRun('${id}')">${PZ.profile.petWins[id] ? '<span class="pet-win" data-tip="Won a descent together">🏆</span>' : ''}
          <div class="comp-art">${r.art}</div>
          <h2>${r.name}</h2><p>${U.esc(r.text)}</p>
        </button>`;
      }).join('')}</div>
      <button class="btn ghost" onclick="PZ.showTitle()">← Back</button>
    </div>`;
  };

  PZ.startRun = companion => {
    PZ.audio.init();
    const starter = ['drill_bit', 'drill_bit', 'drill_bit', 'chain_stitch', 'chain_stitch', 'chain_stitch', 'gentle_word', 'gentle_word', 'photon', 'folk_song'];
    const pressure = Math.min(PZ.G.pressure || 0, PZ.profile.maxPressure);
    const hp = pressure >= 3 ? 60 : 70;
    PZ.G.run = {
      name: 'David', hp, maxHp: hp, gold: 99, act: 0, floor: 0, pos: null, companion, pressure, snacks: ['kolache'],
      deck: starter.map(id => PZ.inst(id)), relics: [companion], map: PZ.genMap(), fightsThisAct: 0, lastEnc: null,
      seenEvents: [], removeCost: 75, startedAt: Date.now(),
      stats: { plugged: 0, reconciled: 0, damage: 0, harmony: 0, cardsPlayed: 0, damageTaken: 0, elites: 0, bosses: 0, bossReconciled: 0 },
    };
    starter.forEach(id => PZ.binderRegister(id));
    PZ.profile.runs++; PZ.saveProfile();
    if (PZ.profile.runs === 1 && !PZ.fast) return showIntro(companion);
    PZ.showMap();
    PZ.toast(`${PZ.RELICS[companion].art} ${PZ.RELICS[companion].name} hops in the truck.`);
  };

  function showIntro(companion) {
    PZ.G.screen = 'intro';
    const pet = PZ.RELICS[companion];
    $screen().innerHTML = `<div class="screen-act intro">
      <div class="eyebrow">Spud date</div>
      <h1>Pearland, Texas. 5:40 A.M.</h1>
      <div class="intro-text">
        <p>You have written code your whole career. A lot of it was for the oil business. You have never once set foot on a rig.</p>
        <p>Today that changes. A rig is waiting on the edge of town. Under it lie three layers of trouble: soft sediments, a salt dome, and the pay zone. Every layer has hazards. Some of them are just scared.</p>
        <p>You can drill through them. Or you can make peace with them. The deck of cards in your laptop bag can do either.</p>
        <p>${pet.art} ${U.esc(pet.name)} is already in the passenger seat.</p>
      </div>
      <button class="btn big" onclick="PZ.showMap()">Spud in ↓</button>
    </div>`;
    PZ.renderTopBar();
  }

  PZ.continueRun = () => {
    PZ.audio.init();
    const run = PZ.loadRun(); if (!run) return PZ.showTitle();
    PZ.G.run = run; PZ.showMap();
  };

  // ---------- Deck helpers ----------
  PZ.addToDeck = (id, up, foil, silent) => {
    const inst = PZ.inst(id, up, foil);
    R().deck.push(inst);
    const isNew = PZ.binderRegister(id, foil);
    if (!silent) PZ.toast(`Added <b>${PZ.CARDS[id].name}${up ? '+' : ''}</b> to your deck${isNew ? ' · <span class="new">New in binder!</span>' : ''}`);
    PZ.renderTopBar();
    return inst;
  };
  PZ.addRelic = id => {
    const run = R(); if (run.relics.includes(id)) return;
    run.relics.push(id);
    if (id === 'brisket') { run.maxHp += 10; run.hp += 10; }
    PZ.toast(`Keepsake: ${PZ.RELICS[id].art} <b>${PZ.RELICS[id].name}</b>`);
    PZ.audio.sfx('rare'); PZ.renderTopBar();
  };
  PZ.randomRelicId = () => {
    const pool = PZ.COMMON_RELICS.filter(id => !R().relics.includes(id));
    return pool.length ? U.pick(pool) : null;
  };
  function gainGold(n) { R().gold += n; if (n > 0) PZ.audio.sfx('coin'); if (R().gold >= 300) PZ.award('hoarder'); PZ.renderTopBar(); }
  PZ.addSnack = id => { const run = R(); run.snacks = run.snacks || []; if (run.snacks.length >= 3) { PZ.toast('Your snack slots are full.'); return false; } run.snacks.push(id); PZ.renderTopBar(); return true; };
  PZ.randomSnackId = () => U.pick(Object.keys(PZ.SNACKS));
  function heal(n) { const run = R(); const before = run.hp; run.hp = Math.min(run.maxHp, run.hp + n); if (run.hp > before) PZ.audio.sfx('heal'); PZ.renderTopBar(); return run.hp - before; }

  // ---------- Rewards ----------
  PZ.combatWon = () => {
    const run = R(), c = PZ.G.combat;
    const plugged = c.enemies.filter(e => e.state === 'plugged');
    const recon = c.enemies.filter(e => e.state === 'reconciled');
    let gold = c.kind === 'boss' ? 75 : c.kind === 'elite' ? U.rand(28, 36) : U.rand(9, 14);
    gold += plugged.reduce(a => a + U.rand(6, 10), 0);
    gold += recon.length * 3;
    const healed = heal(recon.length * 3 + (PZ.hasRelic('skimmer') ? 5 : 0));
    gainGold(gold);
    if (c.kind === 'elite') run.stats.elites++;
    if (c.kind === 'boss') { PZ.award(run.act === 0 ? 'act1' : run.act === 1 ? 'act2' : 'win'); run.stats.bosses++; if (recon.length) { run.stats.bossReconciled++; if (run.act === 2) run.stats.finalReconciled = true; } }
    const nChoices = 3 + (PZ.hasRelic('buffet') ? 1 : 0);
    const reward = {
      kind: c.kind, gold, healed, plugged: plugged.length, recon: recon.length,
      cards: PZ.cardChoices(nChoices, c.kind !== 'battle').map(id => PZ.inst(id, false, Math.random() < 0.06)),
      allies: recon.filter(e => e.elite || e.boss || Math.random() < 0.5).map(e => ({ from: e.name, art: e.art, inst: PZ.inst(PZ.ENEMIES[e.id].ally) })),
      relic: c.kind === 'elite' ? PZ.randomRelicId() : null,
      snack: c.kind !== 'battle' || Math.random() < 0.4 ? PZ.randomSnackId() : null,
      cardTaken: false, relicTaken: false, snackTaken: false,
    };
    PZ.G.combat = null;
    PZ.G.reward = reward;
    PZ.audio.mood('victory');
    renderRewards();
  };

  function renderRewards() {
    const rw = PZ.G.reward, run = R();
    PZ.G.screen = 'reward';
    const title = rw.recon && !rw.plugged ? 'Peace Made' : rw.recon ? 'Hazard Resolved' : 'Hazard Plugged';
    const lines = [];
    lines.push(`<span class="chip gold">💰 +${rw.gold} gold</span>`);
    if (rw.plugged) lines.push(`<span class="chip">🔩 Plugged ${rw.plugged}</span>`);
    if (rw.recon) lines.push(`<span class="chip harm">🕊️ Reconciled ${rw.recon}</span>`);
    if (rw.healed) lines.push(`<span class="chip heal">❤️ +${rw.healed} HP</span>`);
    $screen().innerHTML = `<div class="screen-reward">
      <div class="eyebrow">${rw.kind === 'boss' ? 'Boss defeated' : rw.kind === 'elite' ? 'Major hazard cleared' : 'Hazard cleared'}</div>
      <h1>${title}</h1>
      <div class="chips">${lines.join('')}</div>
      ${rw.allies.length ? `<section class="reward-block ally-block"><h2>🕊️ They want to join you</h2>
        <div class="card-row">${rw.allies.map((a, i) => `<div class="ally-offer ${a.taken ? 'taken' : ''}">
          <p><b>${a.art} ${U.esc(a.from)}</b> is ready to help.</p>
          ${PZ.renderCard(a.inst)}
          ${a.taken ? '<div class="taken-label">Joined!</div>' : `<button class="btn" onclick="PZ.takeAlly(${i})">Welcome them</button>`}
        </div>`).join('')}</div></section>` : ''}
      ${rw.snack ? `<section class="reward-block"><h2>🍴 Snack</h2>
        <div class="relic-offer ${rw.snackTaken ? 'taken' : ''}"><div class="relic big">${PZ.SNACKS[rw.snack].art}</div><div><b>${PZ.SNACKS[rw.snack].name}</b><p>${U.esc(PZ.SNACKS[rw.snack].text)}</p></div>
        ${rw.snackTaken ? '<span class="taken-label">Packed</span>' : '<button class="btn" onclick="PZ.takeRewardSnack()">Pack it</button>'}</div></section>` : ''}
      ${rw.relic ? `<section class="reward-block"><h2>🎁 Keepsake</h2>
        <div class="relic-offer ${rw.relicTaken ? 'taken' : ''}">${PZ.renderRelic(rw.relic, 'big')}<div><b>${PZ.RELICS[rw.relic].name}</b><p>${U.esc(PZ.RELICS[rw.relic].text)}</p></div>
        ${rw.relicTaken ? '<span class="taken-label">Taken</span>' : '<button class="btn" onclick="PZ.takeRewardRelic()">Take</button>'}</div></section>` : ''}
      <section class="reward-block"><h2>🃏 Choose a card ${rw.cardTaken ? '<small>(done)</small>' : ''}</h2>
        ${rw.cardTaken ? '' : `<div class="card-row">${rw.cards.map((ci, i) => `<div class="pick-wrap" onclick="PZ.takeRewardCard(${i})">${PZ.renderCard(ci)}</div>`).join('')}</div>`}
      </section>
      <div class="reward-actions">
        <button class="btn big" onclick="PZ.leaveRewards()">${rw.cardTaken ? 'Continue' : 'Skip card & continue'} →</button>
      </div>
    </div>`;
    PZ.renderTopBar();
  }
  PZ.takeRewardCard = i => {
    const rw = PZ.G.reward; if (rw.cardTaken) return;
    const c = rw.cards[i]; rw.cardTaken = true;
    PZ.addToDeck(c.id, c.up, c.foil);
    PZ.audio.sfx(PZ.def(c).rarity === 'rare' ? 'rare' : 'click');
    renderRewards();
  };
  PZ.takeAlly = i => {
    const a = PZ.G.reward.allies[i]; if (a.taken) return;
    a.taken = true; PZ.addToDeck(a.inst.id); PZ.audio.sfx('reconcile'); PZ.award('ally'); renderRewards();
  };
  PZ.takeRewardSnack = () => { const rw = PZ.G.reward; if (rw.snackTaken) return; if (PZ.addSnack(rw.snack)) { rw.snackTaken = true; PZ.audio.sfx('click'); renderRewards(); } };
  PZ.takeRewardRelic = () => { const rw = PZ.G.reward; if (rw.relicTaken) return; rw.relicTaken = true; PZ.addRelic(rw.relic); renderRewards(); };
  PZ.leaveRewards = () => {
    const rw = PZ.G.reward; PZ.G.reward = null;
    if (rw.kind === 'boss') return showBossReward();
    PZ.showMap();
  };

  // ---------- Boss reward & act change ----------
  function showBossReward() {
    const run = R();
    const pool = PZ.BOSS_RELICS.filter(id => !run.relics.includes(id));
    if (run.act >= 2) return PZ.gameOver(true);
    PZ.G.screen = 'bossreward';
    $screen().innerHTML = `<div class="screen-reward">
      <div class="eyebrow">Act ${run.act + 1} complete</div>
      <h1>Choose a Boss Keepsake</h1>
      <p class="sub">Each one gives you +1 Energy every turn. Pick the one that fits.</p>
      <div class="boss-relics">${pool.map(id => `<button class="companion" onclick="PZ.takeBossRelic('${id}')"><div class="comp-art">${PZ.RELICS[id].art}</div><h2>${PZ.RELICS[id].name}</h2><p>${U.esc(PZ.RELICS[id].text)}</p></button>`).join('')}</div>
      <button class="btn ghost" onclick="PZ.takeBossRelic(null)">Skip</button>
    </div>`;
    PZ.renderTopBar();
  }
  PZ.takeBossRelic = id => {
    const run = R();
    if (id) PZ.addRelic(id);
    const missing = run.maxHp - run.hp; const healed = Math.ceil(missing * 0.6);
    run.hp += healed;
    run.act++; run.map = PZ.genMap(); run.pos = null; run.fightsThisAct = 0; run.lastEnc = null;
    PZ.G.screen = 'actintro';
    const act = PZ.ACTS[run.act];
    $screen().innerHTML = `<div class="screen-act act${run.act}">
      <div class="eyebrow">Act ${run.act + 1}</div>
      <h1>${act.name}</h1>
      <p class="sub">${run.act === 1 ? 'The bit hits salt. The pressure changes. So do the problems.' : 'Below the salt, the reservoir waits. So do the hardest questions.'}</p>
      <p class="sub">You rest in the rig's "doghouse." It turns out that is the crew's shack on the rig floor. Nobody warned you. <b>+${healed} HP</b>.</p>
      <button class="btn big" onclick="PZ.showMap()">Keep drilling ↓</button>
    </div>`;
    PZ.renderTopBar();
  };

  // ---------- Rest site ----------
  PZ.showRest = () => {
    const run = R(); PZ.G.screen = 'rest';
    const healAmt = Math.floor(run.maxHp * 0.3) + (PZ.hasRelic('lei') ? 15 : 0);
    const canUp = !PZ.hasRelic('porch') && run.deck.some(PZ.canUpgrade);
    $screen().innerHTML = `<div class="screen-rest">
      <div class="pool-scene"><div class="water"></div><div class="float">🛟</div><div class="sun">☀️</div></div>
      <div class="eyebrow">Home, for a moment</div>
      <h1>The Backyard Pool</h1>
      <p class="sub">The water is warm. ${{ mutt: 'The dog is asleep on the patio.', tabby: 'The cat is judging you from the window.', guinea: 'The guinea pigs are wheeking for lettuce.' }[run.companion] || ''} Choose one thing to do.</p>
      <div class="rest-options">
        <button class="rest-opt" onclick="PZ.restHeal(${healAmt})"><span>🏊</span><h2>Float</h2><p>Heal ${healAmt} HP.</p></button>
        <button class="rest-opt" ${canUp ? '' : 'disabled'} onclick="PZ.restUpgrade()"><span>🎸</span><h2>Practice</h2><p>${PZ.hasRelic('porch') ? 'Your porch chair is too comfortable.' : 'Upgrade a card.'}</p></button>
        <button class="rest-opt" ${run.deck.length > 5 ? '' : 'disabled'} onclick="PZ.restRemove()"><span>🧶</span><h2>Frog It</h2><p>Remove a card from your deck.</p></button>
      </div>
    </div>`;
    PZ.renderTopBar();
  };
  PZ.restHeal = n => { const h = heal(n); PZ.toast(`You float for a while. +${h} HP.`); PZ.showMap(); };
  PZ.restUpgrade = () => PZ.pickCard(R().deck.filter(PZ.canUpgrade), 'Practice: upgrade a card', c => { c.up = true; PZ.audio.sfx('buff'); PZ.toast(`<b>${PZ.def(c).name}+</b> upgraded.`); PZ.showMap(); }, { preview: 'upgrade', sub: 'Showing upgraded versions.' });
  PZ.restRemove = () => PZ.pickCard(R().deck, 'Frog it: remove a card', c => { R().deck = R().deck.filter(x => x.uid !== c.uid); PZ.toast(`Removed <b>${PZ.def(c).name}</b>.`); PZ.showMap(); });

  // ---------- Treasure ----------
  PZ.showTreasure = () => {
    PZ.G.screen = 'treasure';
    $screen().innerHTML = `<div class="screen-treasure">
      <div class="eyebrow">Core Sample</div>
      <h1>The core barrel comes up</h1>
      <p class="sub">Something is wedged in the rock.</p>
      <button class="core-box" id="coreBox" onclick="PZ.openCore()">🪨<small>Click to split the core</small></button>
      <div id="coreResult"></div>
    </div>`;
    PZ.renderTopBar();
  };
  PZ.openCore = () => {
    const box = U.$('#coreBox'); if (box.disabled) return; box.disabled = true;
    box.classList.add('open');
    const id = PZ.randomRelicId(); const gold = U.rand(20, 40);
    gainGold(gold);
    if (id) PZ.addRelic(id);
    U.$('#coreResult').innerHTML = `<div class="relic-offer taken">${id ? PZ.renderRelic(id, 'big') + `<div><b>${PZ.RELICS[id].name}</b><p>${U.esc(PZ.RELICS[id].text)}</p></div>` : '<div><b>Just rock.</b><p>Pretty rock, though.</p></div>'}</div>
      <p class="sub">+${gold} gold</p><button class="btn big" onclick="PZ.showMap()">Continue →</button>`;
  };

  // ---------- Shop ----------
  const PRICES = { common: [45, 55], uncommon: [70, 85], rare: [135, 160], special: [60, 70] };
  PZ.showShop = () => {
    const run = R();
    const sale = U.rand(0, 4);
    const rarities = ['common', 'common', 'uncommon', 'uncommon', 'rare'];
    const singles = rarities.map((r, i) => {
      const id = PZ.randomCardId(null, r);
      let price = U.rand(...PRICES[r]); if (i === sale) price = Math.floor(price / 2);
      return { inst: PZ.inst(id, false, Math.random() < 0.15), price, sold: false, sale: i === sale };
    });
    // de-dupe singles
    const seen = new Set(); singles.forEach(s => { while (seen.has(s.inst.id)) s.inst = PZ.inst(PZ.randomCardId(null, PZ.def(s.inst).rarity), false, s.inst.foil); seen.add(s.inst.id); });
    const relics = [PZ.randomRelicId()].filter(Boolean).map(id => ({ id, price: U.rand(140, 170), sold: false }));
    const packs = [
      { name: 'Wellsite Booster', fams: ['drill', 'craft'], art: '🛠️', price: 85, sold: false, cls: 'pack-a' },
      { name: 'Lakehouse & Hymn Booster', fams: ['lake', 'hymn'], art: '🎼', price: 85, sold: false, cls: 'pack-b' },
    ];
    const snacks = U.shuffle(Object.keys(PZ.SNACKS)).slice(0, 2).map(id => ({ id, price: U.rand(35, 55), sold: false }));
    PZ.G.shop = { singles, relics, packs, snacks, removed: false };
    PZ.G.screen = 'shop';
    renderShop('Welcome in. Friday night is Commander. Sleeves are in the back.');
  };
  function renderShop(line) {
    const s = PZ.G.shop, run = R();
    const can = p => run.gold >= p;
    $screen().innerHTML = `<div class="screen-shop">
      <div class="shop-head">
        <div class="shopkeep">🧔‍♂️</div>
        <div><div class="eyebrow">Local Game Store</div><h1>The Card Shop</h1><p class="bubble">"${U.esc(line)}"</p></div>
      </div>
      <section><h2>Singles</h2><div class="card-row shop-row">${s.singles.map((it, i) => `
        <div class="shop-item ${it.sold ? 'sold' : ''}">
          ${PZ.renderCard(it.inst)}
          ${it.sold ? '<div class="price sold">Sold</div>' : `<button class="price ${can(it.price) ? '' : 'cant'}" onclick="PZ.buySingle(${i})">💰 ${it.price}${it.sale ? ' <em>SALE</em>' : ''}</button>`}
        </div>`).join('')}</div></section>
      <div class="shop-lower">
        <section><h2>Booster Packs</h2><p class="hint">5 cards. Keep ${PZ.hasRelic('binder') ? 2 : 1}. All go in your binder.</p>
          <div class="pack-row">${s.packs.map((p, i) => `
          <div class="shop-item ${p.sold ? 'sold' : ''}">
            <div class="pack ${p.cls}"><div class="pack-crimp"></div><div class="pack-art">${p.art}</div><div class="pack-name">${p.name}</div><div class="pack-logo">PAY ZONE TCG</div><div class="pack-crimp bottom"></div></div>
            ${p.sold ? '<div class="price sold">Opened</div>' : `<button class="price ${can(p.price) ? '' : 'cant'}" onclick="PZ.buyPack(${i})">💰 ${p.price}</button>`}
          </div>`).join('')}</div></section>
        <section><h2>Display Case</h2><div class="relic-shelf">${s.relics.map((r, i) => `
          <div class="shop-item relic-item ${r.sold ? 'sold' : ''}">${PZ.renderRelic(r.id, 'big')}<div class="relic-name">${PZ.RELICS[r.id].name}</div>
          ${r.sold ? '<div class="price sold">Sold</div>' : `<button class="price ${can(r.price) ? '' : 'cant'}" onclick="PZ.buyRelic(${i})">💰 ${r.price}</button>`}</div>`).join('') || '<p class="hint">Sold out.</p>'}
          ${!PZ.hasRelic('binder') ? `<div class="shop-item relic-item ${s.binderSold ? 'sold' : ''}">${PZ.renderRelic('binder', 'big')}<div class="relic-name">Nine-Pocket Binder</div>${s.binderSold ? '<div class="price sold">Sold</div>' : `<button class="price ${can(90) ? '' : 'cant'}" onclick="PZ.buyBinder()">💰 90</button>`}</div>` : ''}
          </div></section>
        <section><h2>Snack Counter</h2><div class="relic-shelf">${s.snacks.map((it, i) => `
          <div class="shop-item relic-item ${it.sold ? 'sold' : ''}"><div class="relic big" data-tip="${U.esc(PZ.SNACKS[it.id].text)}">${PZ.SNACKS[it.id].art}</div><div class="relic-name">${PZ.SNACKS[it.id].name}</div>
          ${it.sold ? '<div class="price sold">Sold</div>' : `<button class="price ${can(it.price) ? '' : 'cant'}" onclick="PZ.buySnack(${i})">💰 ${it.price}</button>`}</div>`).join('')}</div></section>
        <section><h2>Trade-In Counter</h2><div class="service">
          <p>Trade a card away for good.</p>
          ${s.removed ? '<div class="price sold">Done</div>' : `<button class="price ${can(run.removeCost) ? '' : 'cant'}" onclick="PZ.buyRemove()">💰 ${run.removeCost}</button>`}
        </div></section>
      </div>
      <div class="reward-actions"><button class="btn big" onclick="PZ.showMap()">Leave the store →</button></div>
    </div>`;
    PZ.renderTopBar();
  }
  function pay(n) { const run = R(); if (run.gold < n) { PZ.toast('Not enough gold.'); PZ.audio.sfx('click'); return false; } run.gold -= n; PZ.audio.sfx('coin'); return true; }
  PZ.buySingle = i => { const it = PZ.G.shop.singles[i]; if (it.sold || !pay(it.price)) return; it.sold = true; PZ.addToDeck(it.inst.id, false, it.inst.foil); renderShop(U.pick(['Good pull.', 'That one sees a lot of play.', 'Nice. Want a top-loader for it?'])); };
  PZ.buySnack = i => { const it = PZ.G.shop.snacks[i]; if (it.sold) return; if ((R().snacks || []).length >= 3) { PZ.toast('Your snack slots are full.'); return; } if (!pay(it.price)) return; it.sold = true; PZ.addSnack(it.id); renderShop('Fresh this morning.'); };
  PZ.buyRelic = i => { const it = PZ.G.shop.relics[i]; if (it.sold || !pay(it.price)) return; it.sold = true; PZ.addRelic(it.id); renderShop('That one has a story. Enjoy it.'); };
  PZ.buyBinder = () => { const s = PZ.G.shop; if (s.binderSold || !pay(90)) return; s.binderSold = true; PZ.addRelic('binder'); renderShop('Nine pockets. Side-loading. You have taste.'); };
  PZ.buyRemove = () => {
    const s = PZ.G.shop, run = R(); if (s.removed || run.gold < run.removeCost) { if (!s.removed) PZ.toast('Not enough gold.'); return; }
    PZ.pickCard(run.deck, 'Trade in a card', c => {
      if (!pay(run.removeCost)) return;
      run.deck = run.deck.filter(x => x.uid !== c.uid); s.removed = true; run.removeCost += 25;
      PZ.toast(`Traded in <b>${PZ.def(c).name}</b>.`); renderShop('I\'ll put it in the bulk box.');
    });
  };
  PZ.buyPack = i => {
    const p = PZ.G.shop.packs[i]; if (p.sold || !pay(p.price)) return; p.sold = true;
    PZ.openPack(p, () => { PZ.G.screen = 'shop'; renderShop('Anything good?'); });
  };

  // ---------- Booster pack opening ----------
  PZ.openPack = (pack, done) => {
    const fams = pack.fams || null;
    const slot = r => PZ.randomCardId(fams ? U.pick(fams) : null, r);
    const ids = [];
    ['common', 'common', 'common', 'uncommon'].forEach(r => { let id = slot(r); let g = 0; while (ids.includes(id) && g++ < 10) id = slot(r); ids.push(id); });
    let last = slot(Math.random() < 0.35 ? 'rare' : 'uncommon'); let g = 0; while (ids.includes(last) && g++ < 10) last = slot('rare'); ids.push(last);
    const cards = ids.map(id => PZ.inst(id, false, Math.random() < 0.14));
    const keep = PZ.hasRelic('binder') ? 2 : 1;
    PZ.G.pack = { cards, flipped: [], keep, chosen: [], done, torn: false, name: pack.name, cls: pack.cls || 'pack-a', art: pack.art || '🎴' };
    PZ.G.screen = 'pack';
    renderPack();
  };
  function renderPack() {
    const p = PZ.G.pack;
    const allFlipped = p.flipped.length === p.cards.length;
    $screen().innerHTML = `<div class="screen-pack">
      <div class="eyebrow">Booster Pack</div>
      <h1>${U.esc(p.name)}</h1>
      ${!p.torn ? `<div class="pack big ${p.cls}" onclick="PZ.tearPack()"><div class="pack-crimp"></div><div class="pack-art">${p.art}</div><div class="pack-name">${U.esc(p.name)}</div><div class="pack-logo">PAY ZONE TCG</div><div class="pack-crimp bottom"></div></div>
        <p class="sub">Click the pack to tear it open.</p>` : `
        <p class="sub">${allFlipped ? `Choose ${p.keep === 1 ? 'one card' : 'two cards'} to add to your deck. The rest go in your binder.` : 'Click each card to flip it. Rare is last.'}</p>
        <div class="pack-cards">${p.cards.map((c, i) => {
          const f = p.flipped.includes(i);
          const chosen = p.chosen.includes(i);
          return `<div class="flip ${f ? 'flipped' : ''} ${chosen ? 'chosen' : ''} ${f && (PZ.def(c).rarity === 'rare' || c.foil) ? 'shiny' : ''}" style="--d:${i * 0.08}s" onclick="PZ.flipPackCard(${i})">
            <div class="flip-inner"><div class="flip-back"><div class="card-back"><span>PZ</span></div></div><div class="flip-front">${PZ.renderCard(c)}${f && p.newIds && p.newIds.includes(c.id) ? '<div class="new-badge">NEW</div>' : ''}</div></div></div>`;
        }).join('')}</div>
        <div class="reward-actions">
          ${allFlipped ? `<button class="btn big" ${p.chosen.length ? '' : 'disabled'} onclick="PZ.finishPack()">Keep ${p.chosen.length ? p.chosen.map(i => PZ.def(p.cards[i]).name).join(' & ') : '…'} →</button><button class="btn ghost" onclick="PZ.finishPack(true)">Keep none</button>` : `<button class="btn ghost" onclick="PZ.flipAll()">Flip all</button>`}
        </div>`}
    </div>`;
    PZ.renderTopBar();
  }
  PZ.tearPack = () => {
    const p = PZ.G.pack; if (p.torn) return;
    PZ.audio.sfx('pack');
    const el = document.querySelector('.pack.big'); if (el) el.classList.add('tearing');
    setTimeout(() => {
      p.torn = true;
      p.newIds = p.cards.filter(c => !PZ.binder[c.id]).map(c => c.id);
      p.cards.forEach(c => PZ.binderRegister(c.id, c.foil));
      if (p.cards.some(c => c.foil)) PZ.award('foil');
      if (p.cards.some(c => PZ.def(c).rarity === 'rare')) PZ.award('rare_pull');
      renderPack();
    }, PZ.fast ? 0 : 550);
  };
  PZ.flipPackCard = i => {
    const p = PZ.G.pack;
    if (!p.flipped.includes(i)) {
      p.flipped.push(i);
      const c = p.cards[i];
      PZ.audio.sfx(PZ.def(c).rarity === 'rare' || c.foil ? 'rare' : 'card');
      renderPack(); return;
    }
    if (p.flipped.length < p.cards.length) return;
    const at = p.chosen.indexOf(i);
    if (at >= 0) p.chosen.splice(at, 1);
    else { if (p.chosen.length >= p.keep) p.chosen.shift(); p.chosen.push(i); }
    PZ.audio.sfx('click'); renderPack();
  };
  PZ.flipAll = () => { const p = PZ.G.pack; p.cards.forEach((_, i) => { if (!p.flipped.includes(i)) p.flipped.push(i); }); PZ.audio.sfx('rare'); renderPack(); };
  PZ.finishPack = none => {
    const p = PZ.G.pack;
    if (!none) p.chosen.forEach(i => { const c = p.cards[i]; R().deck.push(PZ.inst(c.id, false, c.foil)); PZ.toast(`Added <b>${PZ.def(c).name}</b> to your deck.`); });
    PZ.G.pack = null;
    p.done();
  };

  // ---------- Events ----------
  PZ.showEvent = () => {
    const run = R();
    let pool = PZ.EVENTS.filter(e => !run.seenEvents.includes(e.id));
    if (!pool.length) { run.seenEvents = []; pool = PZ.EVENTS; }
    const ev = U.pick(pool);
    run.seenEvents.push(ev.id);
    PZ.G.screen = 'event'; PZ.G.event = ev;
    const api = eventApi([]);
    $screen().innerHTML = `<div class="screen-event">
      <div class="event-card">
        <div class="event-art">${ev.art}</div>
        <div class="event-body">
          <div class="eyebrow">A story</div>
          <h1>${U.esc(ev.title)}</h1>
          <p class="event-text">${U.esc(ev.text)}</p>
          <div class="event-choices">${ev.choices.map((ch, i) => {
            const ok = !ch.cond || ch.cond(api);
            return `<button class="choice" ${ok ? '' : 'disabled'} onclick="PZ.chooseEvent(${i})"><b>${U.esc(ch.label)}</b><span>${U.esc(ch.desc)}</span></button>`;
          }).join('')}</div>
        </div>
      </div>
    </div>`;
    PZ.renderTopBar();
  };
  function eventApi(deferred) {
    const run = R();
    return {
      loseHp: n => { run.hp = Math.max(1, run.hp - n); PZ.audio.sfx('hurt'); },
      heal: n => heal(n),
      gold: n => gainGold(n),
      hasGold: n => run.gold >= n,
      hasRelic: id => PZ.hasRelic(id),
      maxHp: n => { run.maxHp += n; run.hp += n; },
      addCard: (id, up) => PZ.addToDeck(id, up),
      addRandomCard: (fam, rarity) => PZ.addToDeck(PZ.randomCardId(fam, rarity || PZ.rollRarity(false))),
      addRelic: id => PZ.addRelic(id),
      addRandomRelic: () => { const id = PZ.randomRelicId(); if (id) PZ.addRelic(id); else gainGold(50); },
      upgradeRandom: (n, fam) => {
        for (let i = 0; i < n; i++) {
          const pool = run.deck.filter(c => PZ.canUpgrade(c) && (!fam || PZ.def(c).fam === fam));
          if (!pool.length) break;
          const c = U.pick(pool); c.up = true; PZ.toast(`<b>${PZ.def(c).name}+</b> upgraded.`);
        }
      },
      transformRandom: () => {
        const pool = run.deck.filter(c => PZ.def(c).rarity !== 'special');
        if (!pool.length) return;
        const c = U.pick(pool); const old = PZ.def(c).name;
        const nid = PZ.randomCardId(null, PZ.rollRarity(false), [c.id]);
        run.deck = run.deck.filter(x => x.uid !== c.uid);
        PZ.addToDeck(nid, false, false, true);
        PZ.toast(`<b>${old}</b> became <b>${PZ.CARDS[nid].name}</b>.`);
      },
      removeCard: () => deferred.push('remove'),
      freePack: () => deferred.push('pack'),
    };
  }
  PZ.chooseEvent = i => {
    const ev = PZ.G.event; const deferred = [];
    const api = eventApi(deferred);
    const ch = ev.choices[i];
    if (ch.cond && !ch.cond(api)) return;
    PZ.audio.sfx('click');
    const text = ch.run(api);
    const showResult = () => {
      PZ.G.screen = 'event';
      $screen().innerHTML = `<div class="screen-event"><div class="event-card">
        <div class="event-art">${ev.art}</div>
        <div class="event-body">
          <div class="eyebrow">${U.esc(ev.title)}</div>
          <h1>${U.esc(ch.label)}</h1>
          <p class="event-text">${U.esc(text)}</p>
          <button class="btn big" onclick="PZ.showMap()">Continue →</button>
        </div></div></div>`;
      PZ.renderTopBar();
    };
    const runDeferred = () => {
      const next = deferred.shift();
      if (!next) return showResult();
      if (next === 'remove') PZ.pickCard(R().deck, 'Frog it: remove a card', c => { R().deck = R().deck.filter(x => x.uid !== c.uid); PZ.toast(`Removed <b>${PZ.def(c).name}</b>.`); runDeferred(); }, { onCancel: runDeferred });
      else if (next === 'pack') PZ.openPack({ name: 'Battle Academy Booster', art: '⚡', cls: 'pack-c' }, runDeferred);
    };
    runDeferred();
  };

  // ---------- Binder ----------
  PZ.showBinder = () => {
    PZ.G.screen = 'title';
    const fams = ['drill', 'lake', 'craft', 'hymn', 'ally'];
    const all = Object.values(PZ.CARDS).filter(c => c.fam !== 'junk');
    const owned = all.filter(c => PZ.binder[c.id]).length;
    const foils = all.filter(c => PZ.binder[c.id] && PZ.binder[c.id].foil).length;
    const pct = Math.round(owned / all.length * 100);
    $screen().innerHTML = `<div class="screen-binder">
      <div class="binder-head">
        <button class="btn ghost" onclick="PZ.showTitle()">← Back</button>
        <div><div class="eyebrow">Collection</div><h1>Your Binder</h1></div>
        <div class="binder-stats"><div class="meter"><div style="width:${pct}%"></div></div><b>${owned}/${all.length}</b> collected · <b>${foils}</b> foil</div>
      </div>
      <section class="binder-page stickers-page"><h2>⛑️ Hard Hat Stickers <small>${Object.keys(PZ.profile.stickers).length}/${Object.keys(PZ.STICKERS).length}</small></h2>
        <div class="sticker-grid">${Object.entries(PZ.STICKERS).map(([id, st]) => {
          const got = PZ.profile.stickers[id];
          return `<div class="sticker ${got ? 'got' : ''}" data-tip="<b>${U.esc(st.name)}</b><br>${U.esc(st.desc)}${got ? '<br><i>Earned ' + got + '</i>' : ''}"><span>${got ? st.art : '?'}</span><small>${got ? U.esc(st.name) : '???'}</small></div>`;
        }).join('')}</div></section>
      ${fams.map(f => {
        const cards = all.filter(c => c.fam === f);
        return `<section class="binder-page"><h2><span class="chip fam-${f}">${PZ.FAMILIES[f].name}</span> <small>${cards.filter(c => PZ.binder[c.id]).length}/${cards.length} · ${PZ.FAMILIES[f].desc}${f === 'ally' ? ' Earn them by reconciling.' : ''}</small></h2>
          <div class="card-grid">${cards.map(c => {
            const e = PZ.binder[c.id];
            if (!e) return `<div class="card missing"><div class="card-back"><span>?</span></div></div>`;
            return `<div class="binder-slot">${PZ.renderCard(PZ.inst(c.id, false, e.foil > 0))}<div class="count">×${e.n}${e.foil ? ` · ✨${e.foil}` : ''}</div></div>`;
          }).join('')}</div></section>`;
      }).join('')}
    </div>`;
    PZ.renderTopBar();
  };

  // ---------- Endings ----------
  PZ.gameOver = (won, abandoned) => {
    const run = R(); if (!run) return PZ.showTitle();
    PZ.G.combat = null; PZ.G.screen = 'end';
    const s = run.stats;
    const grace = s.reconciled * 10 + s.bossReconciled * 50 + (won ? 100 : 0) + run.floor * 2;
    const p = PZ.profile;
    if (won) p.wins++;
    p.reconciledTotal += s.reconciled; p.pluggedTotal += s.plugged;
    p.bestGrace = Math.max(p.bestGrace, grace);
    const infinite = won && !!s.finalReconciled;
    if (infinite) p.infiniteEndings = (p.infiniteEndings || 0) + 1;
    let unlocked = false;
    if (won) {
      if (infinite) PZ.award('infinite');
      if (s.plugged === 0) PZ.award('pacifist');
      if (s.reconciled === 0) PZ.award('finite');
      if ((run.pressure || 0) >= 1) PZ.award('pressure');
      p.petWins[run.companion] = (p.petWins[run.companion] || 0) + 1;
      if (PZ.COMPANIONS.every(id => p.petWins[id])) PZ.award('pets');
      if ((run.pressure || 0) >= p.maxPressure && p.maxPressure < PZ.PRESSURE.length - 1) { p.maxPressure++; unlocked = true; }
    }
    PZ.saveProfile(); PZ.clearRun();
    PZ.audio.mood(won ? 'victory' : 'calm');
    if (!won) PZ.audio.sfx('lose');
    const depth = run.pos && run.map.nodes[run.pos] ? PZ.depthFt(run.act, Math.min(run.map.nodes[run.pos].row, 10)) : PZ.ACTS[run.act].depth0;
    let title, text, cls;
    if (infinite) { title = 'The Infinite Game'; cls = 'infinite'; text = 'The Finite Game sets down its scorecard. It asks what you are playing for. You say, "To keep playing. Together." The well comes in steady. Nobody had to lose.'; }
    else if (won) { title = 'Pay Zone Reached'; cls = 'won'; text = 'The Finite Game falls. You won. The well comes in. Somewhere, a new game begins. Maybe next time, you invite it to play along.'; }
    else if (abandoned) { title = 'Pulled Out of the Hole'; cls = 'lost'; text = 'You trip out and lay the pipe down. Every well teaches something. This one is no different.'; }
    else { title = 'Shut In'; cls = 'lost'; text = 'The well is shut in. You pull out of the hole, grab a kolache, and plan the next spud date.'; }
    $screen().innerHTML = `<div class="screen-end ${cls}">
      <div class="eyebrow">${won ? 'Descent complete' : 'Descent ended'}</div>
      <h1>${title}</h1>
      <p class="sub end-text">${text}</p>
      <div class="end-stats">
        <div><b>${U.fmt(depth)} ft</b><span>Depth reached</span></div>
        <div><b>${s.plugged}</b><span>Plugged</span></div>
        <div><b>${s.reconciled}</b><span>Reconciled</span></div>
        <div><b>${U.fmt(s.damage)}</b><span>Damage dealt</span></div>
        <div><b>${U.fmt(s.harmony)}</b><span>Harmony given</span></div>
        <div><b>${s.cardsPlayed}</b><span>Cards played</span></div>
        <div class="grace"><b>${grace}</b><span>Grace</span></div>
      </div>
      ${unlocked ? `<p class="unlock">🌡️ New difficulty unlocked: <b>${PZ.PRESSURE[p.maxPressure].name}</b>. ${U.esc(PZ.PRESSURE[p.maxPressure].desc)}</p>` : ''}
      <p class="hint">Grace = 10 per reconciled foe, 50 per reconciled boss, 100 for reaching the Pay Zone, and 2 per floor.</p>
      <div class="title-buttons"><button class="btn big" onclick="PZ.showCompanionSelect()">Drill again</button>
        <div class="title-row"><button class="btn ghost" onclick="PZ.viewCards(PZ.G.lastDeck || [], 'Your Final Deck')">🃏 Final deck</button><button class="btn ghost" onclick="PZ.showTitle()">Title</button></div></div>
    </div>`;
    PZ.G.lastDeck = run.deck;
    PZ.G.run = null;
    PZ.renderTopBar();
  };
})(window.PZ);
