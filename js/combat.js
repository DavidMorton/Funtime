/* Pay Zone — combat engine and combat screen. */
window.PZ = window.PZ || {};

(function (PZ) {
  const U = PZ.U;
  const DUR = ['Weak', 'Exposed', 'Calm'];
  let fxQueue = [];

  const C = () => PZ.G.combat;
  const R = () => PZ.G.run;

  PZ.maxEnergy = () => 3 + ['switch2', 'monovision', 'porch'].filter(PZ.hasRelic).length;

  // ---------- Setup ----------
  PZ.startCombat = (enemyIds, kind) => {
    const run = R();
    const enemies = enemyIds.map((id, i) => {
      const d = PZ.ENEMIES[id];
      const pmul = (run.pressure || 0) >= 1 ? 1.12 : 1;
      const hp = Math.round(U.rand(d.hp[0], d.hp[1]) * pmul);
      const unrest = Math.round(d.unrest * (1.04 + Math.random() * 0.14) * pmul);
      const start = d.ai === 'cycle' && !d.elite && !d.boss ? U.rand(0, d.moves.length - 1) : 0;
      const e = { uid: U.uid(), id, name: d.name, art: d.art, hp, maxHp: hp, unrest, maxUnrest: unrest, block: 0, st: {}, state: 'alive', queue: [start], elite: !!d.elite, boss: !!d.boss };
      e.queue.push(nextMove(e, start));
      return e;
    });
    const draw = U.shuffle(run.deck.map(c => Object.assign({}, c, { tmpCost: null, tmpUp: false })));
    PZ.G.combat = { kind, enemies, draw, hand: [], discard: [], exhaust: [], powers: [], energy: 0, block: 0, st: {}, turn: 0,
      played: [], cardsThisTurn: 0, selected: null, over: false, log: [] };
    PZ.G.screen = 'combat';
    PZ.audio.mood(kind === 'boss' ? 'boss' : 'combat');
    layout();
    startTurn();
    PZ.maybeCoach();
  };

  function nextMove(e, cur) {
    const d = PZ.ENEMIES[e.id];
    if (d.ai === 'cycle') return (cur + 1) % d.moves.length;
    // random: avoid the same move three times in a row
    let n = U.rand(0, d.moves.length - 1);
    if (n === cur && Math.random() < 0.6) n = (n + 1) % d.moves.length;
    return n;
  }
  const intentOf = e => PZ.ENEMIES[e.id].moves[e.queue[0]];
  const nextIntentOf = e => PZ.ENEMIES[e.id].moves[e.queue[1]];
  function advanceIntent(e) { const cur = e.queue[1]; e.queue = [cur, nextMove(e, cur)]; }

  // ---------- Math ----------
  function atkValue(base, atkSt, defSt) {
    let v = base + (atkSt.Torque || 0);
    if (atkSt.Weak) v = Math.floor(v * 0.75);
    if (defSt && defSt.Exposed) v = Math.floor(v * 1.5);
    return Math.max(0, v);
  }
  function enemyAtk(base, e) {
    let v = atkValue(base, e.st, C().st);
    if ((R().pressure || 0) >= 2) v = Math.floor(v * 1.15);
    return v;
  }
  function harmValue(base, target) {
    let v = base + (C().st.Flow || 0);
    if (target && target.st.Calm) v = Math.floor(v * 1.5);
    return Math.max(0, v);
  }
  const alive = () => C().enemies.filter(e => e.state === 'alive');
  const enemyEl = e => document.querySelector(`.enemy[data-euid="${e.uid}"]`);
  const playerEl = () => document.querySelector('#player');

  function addStatus(st, obj) { for (const k in obj) st[k] = (st[k] || 0) + obj[k]; }

  // ---------- Player effects ----------
  function gainBlock(n, fromCard) {
    const c = C();
    const v = n + (fromCard ? (c.st.Stitches || 0) : 0);
    if (v <= 0) return;
    c.block += v;
    PZ.floatAt(playerEl(), '+' + v + ' 🛡', 'block');
    PZ.audio.sfx('block');
  }
  function heal(n) {
    const run = R(); const before = run.hp;
    run.hp = Math.min(run.maxHp, run.hp + n);
    if (run.hp > before) { PZ.floatAt(playerEl() || document.body, '+' + (run.hp - before), 'heal'); PZ.audio.sfx('heal'); }
  }
  PZ.combatHeal = heal;
  function loseHp(n) {
    const run = R(); run.hp -= n;
    PZ.floatAt(playerEl(), '-' + n, 'dmg'); PZ.audio.sfx('hurt'); fxQueue.push({ el: '#player', cls: 'shake' });
  }
  function takeDamage(n) {
    const c = C(), run = R();
    const blocked = Math.min(c.block, n); c.block -= blocked;
    const dmg = n - blocked;
    if (dmg > 0) { run.hp -= dmg; PZ.floatAt(playerEl(), '-' + dmg, 'dmg'); PZ.audio.sfx(dmg >= 15 ? 'bighit' : 'hurt'); fxQueue.push({ el: '#player', cls: 'shake' }); }
    else { PZ.floatAt(playerEl(), 'Blocked', 'blocked'); PZ.audio.sfx('block'); }
    run.stats.damageTaken += dmg;
  }

  function shuffleDiscardIntoDraw() {
    const c = C();
    if (!c.discard.length) return;
    c.draw = U.shuffle(c.draw.concat(c.discard)); c.discard = [];
    if (PZ.hasRelic('core')) gainBlock(5, false);
  }
  function drawCards(n) {
    const c = C();
    for (let i = 0; i < n; i++) {
      if (!c.draw.length) shuffleDiscardIntoDraw();
      if (!c.draw.length) break;
      const card = c.draw.pop();
      if (c.hand.length >= 10) { c.discard.push(card); PZ.toast('Hand is full.'); continue; }
      c.hand.push(card);
    }
  }
  function addJunk(id, n, to) {
    const c = C();
    for (let i = 0; i < n; i++) {
      const inst = PZ.inst(id);
      if (to === 'draw') c.draw.splice(U.rand(0, c.draw.length), 0, inst);
      else if (to === 'hand' && c.hand.length < 10) c.hand.push(inst);
      else c.discard.push(inst);
    }
  }

  // ---------- Enemy effects ----------
  function dealDamage(e, base) {
    if (!e || e.state !== 'alive') return;
    const c = C();
    const v = atkValue(base, c.st, e.st);
    const blocked = Math.min(e.block, v); e.block -= blocked;
    const dmg = v - blocked;
    e.hp -= dmg;
    R().stats.damage += dmg;
    const el = enemyEl(e);
    if (dmg >= 30) PZ.award('big_hit');
    if (dmg > 0) { PZ.floatAt(el, '-' + dmg, 'dmg'); PZ.audio.sfx(dmg >= 15 ? 'bighit' : 'hit'); fxQueue.push({ euid: e.uid, cls: 'hurt' }); }
    else { PZ.floatAt(el, 'Blocked', 'blocked'); PZ.audio.sfx('block'); }
    if (e.hp <= 0) plug(e);
  }
  function applyHarm(e, base) {
    if (!e || e.state !== 'alive') return;
    const c = C();
    const v = harmValue(base, e);
    e.unrest -= v;
    R().stats.harmony += v;
    PZ.floatAt(enemyEl(e), '☮ ' + v, 'harm');
    PZ.audio.sfx('harm');
    fxQueue.push({ euid: e.uid, cls: 'soothe' });
    if (c.st.Peacemaker) gainBlock(c.st.Peacemaker, false);
    if (e.unrest <= 0) reconcile(e);
  }
  function plug(e) {
    e.hp = 0; e.state = 'plugged'; e.block = 0;
    R().stats.plugged++;
    PZ.audio.sfx('plug');
    PZ.award('first_plug');
  }
  function reconcile(e) {
    e.unrest = 0; e.state = 'reconciled'; e.block = 0;
    R().stats.reconciled++;
    PZ.audio.sfx('reconcile');
    PZ.award('first_recon');
    if (e.boss) PZ.award('boss_recon');
    if (C().enemies.filter(x => x.state === 'reconciled').length >= 3) PZ.award('triple');
    if (PZ.hasRelic('guinea')) { heal(5); bumpPet(); }
  }
  function bumpPet() { fxQueue.push({ el: '.pet', cls: 'bounce' }); }

  // ---------- Turn flow ----------
  function startTurn() {
    const c = C(), run = R();
    c.turn++; c.cardsThisTurn = 0; c.played = [];
    if (!c.st.Barricade && !c.st.Buttress) c.block = 0;
    if (c.st.Buttress) c.st.Buttress--;
    c.energy = PZ.maxEnergy();
    if (c.st.Drained) { c.energy = Math.max(0, c.energy - c.st.Drained); PZ.toast(`🕳️ Drained: −${c.st.Drained} Energy`); c.st.Drained = 0; }
    let draw = 5 + (c.st.Catalog || 0);
    if (c.turn === 1) {
      if (PZ.hasRelic('mutt')) { gainBlock(8, false); bumpPet(); }
      if (PZ.hasRelic('tabby')) { c.energy += 1; draw += 1; bumpPet(); }
      if (PZ.hasRelic('hymnal')) addStatus(c.st, { Flow: 1 });
      if (PZ.hasRelic('hook')) addStatus(c.st, { Stitches: 1 });
      if (PZ.hasRelic('collar')) addStatus(c.st, { Torque: 1 });
      if (PZ.hasRelic('radio')) c.enemies.forEach(e => addStatus(e.st, { Weak: 1 }));
      if (PZ.hasRelic('deckbox')) {
        const inst = PZ.inst(PZ.randomCardId(null, 'rare')); inst.tmpCost = 0; c.hand.push(inst);
      }
    }
    if (c.st.Medallion) gainBlock(c.st.Medallion, false);
    if (c.st.Infinite) alive().forEach(e => applyHarm(e, c.st.Infinite));
    drawCards(draw);
    PZ.audio.sfx('turn');
    render();
    if (c.turn > 1) showBanner('Your Turn');
    checkEnd();
  }

  function showBanner(text) {
    const b = document.createElement('div'); b.className = 'turn-banner'; b.textContent = text;
    const host = U.$('#combat'); if (!host) return;
    host.appendChild(b); setTimeout(() => b.remove(), 1100);
  }

  PZ.endTurn = async () => {
    const c = C(); if (!c || PZ.G.busy || c.over) return;
    PZ.G.busy = true; c.selected = null;
    // End-of-turn hand effects
    let pain = 0;
    c.hand.forEach(card => { if (card.id === 'invoice') pain += 2; if (card.id === 'sour') pain += 3; });
    if (pain) loseHp(pain);
    if (PZ.hasRelic('interlinear') && c.energy > 0) alive().forEach(e => applyHarm(e, 2 * c.energy));
    c.hand.forEach(card => {
      card.tmpCost = null;
      if (PZ.def(card).ethereal) c.exhaust.push(card); else c.discard.push(card);
    });
    c.hand = [];
    render();
    if (checkDeath()) return;
    if (checkEnd()) { PZ.G.busy = false; return; }
    await U.sleep(350);
    // Enemy turns
    for (const e of c.enemies) {
      if (e.state !== 'alive') continue;
      e.block = 0;
      const move = intentOf(e);
      const el = enemyEl(e); if (el) PZ.shake(el, 'lunge');
      for (const a of move.acts) {
        if (a.atk != null) {
          for (let h = 0; h < (a.hits || 1); h++) {
            takeDamage(enemyAtk(a.atk, e));
            render();
            if (R().hp <= 0) { checkDeath(); return; }
            await U.sleep(a.hits > 1 ? 180 : 250);
          }
        } else if (a.block) { e.block += a.block; PZ.floatAt(enemyEl(e), '+' + a.block + ' 🛡', 'block'); PZ.audio.sfx('block'); }
        else if (a.self) { addStatus(e.st, a.self); PZ.floatAt(enemyEl(e), Object.keys(a.self).join(' ') + ' ↑', 'buff'); PZ.audio.sfx('buff'); }
        else if (a.player) { addStatus(c.st, a.player); PZ.floatAt(playerEl(), Object.keys(a.player).join(' ') + ' ↓', 'debuff'); PZ.audio.sfx('debuff'); }
        else if (a.junk) { addJunk(a.junk, a.n, a.to); PZ.floatAt(playerEl(), `+${a.n} ${PZ.CARDS[a.junk].name}`, 'debuff'); PZ.audio.sfx('debuff'); }
      }
      DUR.forEach(k => { if (e.st[k]) { e.st[k]--; if (!e.st[k]) delete e.st[k]; } });
      advanceIntent(e);
      render();
      await U.sleep(380);
    }
    DUR.forEach(k => { if (c.st[k]) { c.st[k]--; if (!c.st[k]) delete c.st[k]; } });
    PZ.G.busy = false;
    startTurn();
  };

  function checkDeath() {
    if (R().hp > 0) return false;
    R().hp = 0; C().over = true; PZ.G.busy = false;
    render();
    setTimeout(() => PZ.gameOver(false), 900);
    return true;
  }

  function checkEnd() {
    const c = C();
    if (c.over) return true;
    if (alive().length) return false;
    c.over = true;
    render();
    setTimeout(() => PZ.combatWon(), 1000);
    return true;
  }

  // ---------- Playing cards ----------
  PZ.clickCard = uid => {
    const c = C(); if (!c || PZ.G.busy || c.over) return;
    const card = c.hand.find(x => x.uid === uid); if (!card) return;
    const d = PZ.def(card);
    if (c.selected === uid) { c.selected = null; render(); return; }
    if (d.unplayable) { PZ.toast(`${d.name} can't be played.`); shakeCard(uid); return; }
    if (PZ.costOf(card) > c.energy) { PZ.toast('Not enough Energy.'); shakeCard(uid); return; }
    const targets = alive();
    if (d.target === 'enemy') {
      if (targets.length === 1) return playCard(uid, targets[0].uid);
      c.selected = uid; render(); return;
    }
    playCard(uid, null);
  };
  function shakeCard(uid) { const el = document.querySelector(`#hand .card[data-uid="${uid}"]`); PZ.shake(el); PZ.audio.sfx('click'); }

  PZ.clickEnemy = euid => {
    const c = C(); if (!c || !c.selected || PZ.G.busy) return;
    const e = c.enemies.find(x => x.uid === euid); if (!e || e.state !== 'alive') return;
    const uid = c.selected; c.selected = null;
    playCard(uid, euid);
  };
  PZ.cancelSelect = () => { const c = C(); if (c && c.selected) { c.selected = null; render(); } };

  async function playCard(uid, euid) {
    const c = C(), run = R();
    const idx = c.hand.findIndex(x => x.uid === uid); if (idx < 0) return;
    const card = c.hand[idx];
    const d = PZ.def(card);
    const cost = PZ.costOf(card);
    if (cost > c.energy) return;
    PZ.G.busy = true;
    c.energy -= cost;
    c.hand.splice(idx, 1);
    c.cardsThisTurn++;
    run.stats.cardsPlayed++;
    PZ.audio.sfx('card');
    render();
    const target = euid ? c.enemies.find(e => e.uid === euid) : null;
    await resolve(card, PZ.fxOf(card), target);
    // Where does the card go?
    card.tmpCost = null;
    if (d.type === 'Power') { c.powers.push(card); if (PZ.hasRelic('keyboard')) drawCards(2); }
    else if (PZ.exhaustOf(card)) c.exhaust.push(card);
    else c.discard.push(card);
    c.played.push(card);
    if (PZ.hasRelic('pick') && c.cardsThisTurn % 3 === 0) { alive().forEach(e => applyHarm(e, 3)); fxQueue.push({ el: '.relic-bar .relic', cls: 'bounce' }); }
    PZ.G.busy = false;
    render();
    if (checkDeath()) return;
    checkEnd();
  }

  async function resolve(card, fx, target) {
    const c = C();
    const hits = fx.hits || 1;
    if (fx.pierce && target) target.block = 0;
    if (fx.dmg) for (let i = 0; i < hits; i++) { dealDamage(target, fx.dmg); render(); if (hits > 1) await U.sleep(130); }
    if (fx.dmgAll) for (let i = 0; i < hits; i++) { alive().forEach(e => dealDamage(e, fx.dmgAll)); render(); if (hits > 1) await U.sleep(150); }
    if (fx.dmgRandom) for (let i = 0; i < hits; i++) { const a = alive(); if (a.length) dealDamage(U.pick(a), fx.dmgRandom); render(); await U.sleep(130); }
    if (fx.harm && fx.special !== 'leap') for (let i = 0; i < hits; i++) { applyHarm(target, fx.harm); render(); if (hits > 1) await U.sleep(140); }
    if (fx.harmAll) { alive().forEach(e => applyHarm(e, fx.harmAll)); }
    if (fx.apply && target && target.state === 'alive') { addStatus(target.st, fx.apply); PZ.audio.sfx('debuff'); }
    if (fx.applyAll) alive().forEach(e => addStatus(e.st, fx.applyAll));
    if (fx.block) gainBlock(fx.block, true);
    if (fx.self) { addStatus(c.st, fx.self); PZ.audio.sfx('buff'); }
    if (fx.heal) heal(fx.heal);
    if (fx.energy) c.energy += fx.energy;
    if (fx.draw) drawCards(fx.draw);
    if (fx.addJunk) addJunk(fx.addJunk, 1, 'discard');
    if (fx.special) await special(card, fx, target);
  }

  async function special(card, fx, target) {
    const c = C();
    switch (fx.special) {
      case 'bodySlam': dealDamage(target, c.block); break;
      case 'timeTravel': {
        for (let i = c.played.length - 1; i >= 0; i--) {
          const p = c.played[i]; const at = c.discard.indexOf(p);
          if (at >= 0 && p.uid !== card.uid) { c.discard.splice(at, 1); p.tmpCost = 0; c.hand.push(p); PZ.toast(`⏳ ${PZ.def(p).name} returns.`); return; }
        }
        PZ.toast('Nothing to bring back yet.'); break;
      }
      case 'reshuffle': shuffleDiscardIntoDraw(); break;
      case 'genie': {
        if (c.hand.length >= 10) break;
        const inst = PZ.inst(PZ.randomCardId(null, PZ.rollRarity(false))); inst.tmpCost = 0; c.hand.push(inst);
        PZ.toast(`🧞 Genie suggests: ${PZ.def(inst).name}`); break;
      }
      case 'upgradeHand': c.hand.forEach(h => { if (PZ.def(h).fam !== 'junk') h.tmpUp = true; }); break;
      case 'vacuum': {
        const junk = c.hand.filter(h => PZ.def(h).fam === 'junk');
        c.hand = c.hand.filter(h => PZ.def(h).fam !== 'junk');
        c.exhaust.push(...junk);
        drawCards(1 + junk.length); break;
      }
      case 'prairie': gainBlock(fx.per * c.hand.length, true); break;
      case 'leap':
        if (target && target.state === 'alive') {
          if (target.unrest <= fx.t) { PZ.floatAt(enemyEl(target), 'Leap!', 'harm'); reconcile(target); }
          else applyHarm(target, fx.harm);
        }
        break;
      case 'pickExhaust': {
        if (!c.hand.length) break;
        render();
        await new Promise(res => {
          PZ.pickCard(c.hand, 'Frog a card', picked => {
            c.hand = c.hand.filter(h => h.uid !== picked.uid); c.exhaust.push(picked); res();
          }, { sub: 'Choose a card in your hand to Exhaust.', cancel: false });
        });
        break;
      }
    }
  }

  // ---------- Snacks ----------
  PZ.useSnack = i => {
    const run = R(); const id = run.snacks[i]; if (!id) return;
    const sn = PZ.SNACKS[id]; const c = C();
    const inCombat = PZ.G.screen === 'combat' && c && !c.over;
    if (!inCombat && !sn.anywhere) { PZ.toast(`Save the ${sn.name} for a fight.`); return; }
    if (inCombat && PZ.G.busy) return;
    run.snacks.splice(i, 1);
    PZ.closeModal();
    PZ.audio.sfx('heal');
    if (!inCombat) { const before = run.hp; run.hp = Math.min(run.maxHp, run.hp + 12); PZ.toast(`${sn.art} ${sn.name}: +${run.hp - before} HP`); PZ.renderTopBar(); return; }
    PZ.award('snack');
    switch (id) {
      case 'kolache': heal(12); break;
      case 'cold_brew': c.energy += 2; break;
      case 'sweet_tea': drawCards(3); break;
      case 'crawfish': alive().forEach(e => dealDamage(e, 10)); break;
      case 'cobbler': alive().forEach(e => applyHarm(e, 10)); break;
      case 'taco': gainBlock(14, false); break;
      case 'brisket_snack': addStatus(c.st, { Torque: 2 }); break;
    }
    PZ.toast(`${sn.art} ${sn.name}!`);
    render();
    checkEnd();
  };
  PZ.snackMenu = i => {
    const run = R(); const id = run.snacks[i]; if (!id) return;
    const sn = PZ.SNACKS[id];
    const usable = sn.anywhere || (PZ.G.screen === 'combat' && C() && !C().over);
    PZ.modal(`<div class="snack-modal"><div class="snack-art">${sn.art}</div><h2 class="modal-title">${sn.name}</h2><p class="modal-sub">${U.esc(sn.text)}</p>
      <div class="modal-actions"><button class="btn" ${usable ? '' : 'disabled'} onclick="PZ.useSnack(${i})">${usable ? 'Eat it' : 'Only in a fight'}</button>
      <button class="btn ghost" onclick="PZ.G.run.snacks.splice(${i},1); PZ.closeModal(); PZ.renderTopBar(); PZ.renderCombat && PZ.renderCombat()">Toss it</button></div></div>`);
  };

  // ---------- First-fight coach marks ----------
  const COACH = [
    { sel: '#hand', text: 'These are your cards. The number in the orange circle is the Energy it costs. Click a card to play it.' },
    { sel: '#energy', text: 'This is your Energy. You get it back every turn.' },
    { sel: '.enemy', text: 'Red is Health. Empty it to <b>Plug</b> the hazard. Purple is Unrest. Empty it with Harmony to <b>Reconcile</b>. Either one wins.' },
    { sel: '.intents', text: 'This shows what the enemy will do next. ⚔️ is an attack. Play Block cards to soak it up.' },
    { sel: '#endturn', text: 'When you run out of Energy or good plays, end your turn. Have fun down there.' },
  ];
  function coach(step) {
    const old = U.$('.coach'); if (old) old.remove();
    U.$$('.coach-focus').forEach(el => el.classList.remove('coach-focus'));
    if (step >= COACH.length) { PZ.profile.tutorialDone = true; PZ.saveProfile(); return; }
    const c = COACH[step]; const target = document.querySelector(c.sel);
    if (!target) return coach(step + 1);
    target.classList.add('coach-focus');
    const box = document.createElement('div'); box.className = 'coach';
    box.innerHTML = `<p>${c.text}</p><div class="coach-row"><small>${step + 1} / ${COACH.length}</small><span><button class="btn ghost" data-skip>Skip</button> <button class="btn" data-next>${step === COACH.length - 1 ? 'Got it' : 'Next'}</button></span></div>`;
    document.body.appendChild(box);
    const r = target.getBoundingClientRect();
    const bw = box.offsetWidth, bh = box.offsetHeight;
    let top = r.top - bh - 14; if (top < 64) top = r.bottom + 14;
    box.style.left = U.clamp(r.left + r.width / 2 - bw / 2, 12, window.innerWidth - bw - 12) + 'px';
    box.style.top = U.clamp(top, 64, window.innerHeight - bh - 12) + 'px';
    box.querySelector('[data-next]').onclick = e => { e.stopPropagation(); coach(step + 1); };
    box.querySelector('[data-skip]').onclick = e => { e.stopPropagation(); coach(COACH.length); };
  }
  PZ.maybeCoach = () => { if (!PZ.profile.tutorialDone && !PZ.fast) setTimeout(() => coach(0), 700); };

  // ---------- Rendering ----------
  function layout() {
    U.$('#screen').innerHTML = `<div id="combat" class="screen-combat">
      <div class="battlefield">
        <div id="player" class="player"></div>
        <div id="enemies" class="enemies"></div>
      </div>
      <div class="combat-bottom">
        <div class="left-cluster">
          <div id="energy" class="energy-orb"></div>
          <button id="drawpile" class="pile" onclick="PZ.viewPile('draw')" data-tip="Draw pile (shown in random order)"></button>
        </div>
        <div id="hand" class="hand"></div>
        <div class="right-cluster">
          <button id="endturn" class="btn end-turn" onclick="PZ.endTurn()">End Turn <kbd>E</kbd></button>
          <div class="pile-row">
            <button id="discardpile" class="pile" onclick="PZ.viewPile('discard')" data-tip="Discard pile"></button>
            <button id="exhaustpile" class="pile small" onclick="PZ.viewPile('exhaust')" data-tip="Exhausted cards"></button>
          </div>
        </div>
      </div>
    </div>`;
    PZ.renderTopBar();
  }

  PZ.viewPile = which => {
    const c = C(); if (!c) return;
    const names = { draw: 'Draw Pile', discard: 'Discard Pile', exhaust: 'Exhausted' };
    const cards = which === 'draw' ? U.shuffle(c.draw.slice()) : c[which];
    PZ.viewCards(cards, names[which], which === 'draw' ? 'Shown in random order.' : '');
  };

  function statusHtml(st) {
    return Object.keys(st).filter(k => st[k] > 0 && PZ.STATUS[k]).map(k => {
      const s = PZ.STATUS[k];
      return `<span class="st" data-tip="<b>${k}</b> ${st[k]}<br>${U.esc(s.desc).replace('N', st[k])}">${s.icon}<i>${st[k]}</i></span>`;
    }).join('');
  }

  function intentHtml(move, e, small) {
    const c = C();
    const parts = []; const tips = [];
    const blurry = PZ.hasRelic('monovision');
    move.acts.forEach(a => {
      if (a.atk != null) {
        const v = enemyAtk(a.atk, e);
        parts.push(`<span class="i-atk">⚔️<b class="${blurry ? 'blurry' : ''}">${v}${a.hits > 1 ? '×' + a.hits : ''}</b></span>`);
        tips.push(`Attack for ${v}${a.hits > 1 ? ' × ' + a.hits : ''}`);
      } else if (a.block) { parts.push('<span>🛡️</span>'); tips.push(`Gain ${a.block} Block`); }
      else if (a.self) { parts.push('<span>⬆️</span>'); tips.push('Buff: ' + Object.entries(a.self).map(([k, v]) => `${k} ${v}`).join(', ')); }
      else if (a.player) { parts.push('<span>⬇️</span>'); tips.push('Debuff you: ' + Object.entries(a.player).map(([k, v]) => `${k} ${v}`).join(', ')); }
      else if (a.junk) { parts.push('<span>🗑️</span>'); tips.push(`Add ${a.n} ${PZ.CARDS[a.junk].name} to your ${a.to} pile`); }
    });
    const label = move.label ? `<b>${U.esc(move.label)}</b><br>` : '';
    return `<div class="intent ${small ? 'next' : ''}" data-tip="${U.esc(label + tips.join('<br>'))}">${small ? '<em>then</em>' : ''}${parts.join('')}</div>`;
  }

  function moodFace(e) {
    const r = e.unrest / e.maxUnrest;
    return r > 0.66 ? '😠' : r > 0.33 ? '😐' : '🙂';
  }

  function renderEnemies() {
    const c = C();
    const lenses = PZ.hasRelic('lenses');
    U.$('#enemies').innerHTML = c.enemies.map(e => {
      const hpPct = U.clamp(e.hp / e.maxHp * 100, 0, 100), urPct = U.clamp(e.unrest / e.maxUnrest * 100, 0, 100);
      const tgt = c.selected && e.state === 'alive' ? 'targetable' : '';
      const size = e.boss ? 'boss' : e.elite ? 'elite' : '';
      return `<div class="enemy ${e.state} ${tgt} ${size}" data-euid="${e.uid}" onclick="PZ.clickEnemy('${e.uid}')">
        <div class="intents">${e.state === 'alive' ? intentHtml(intentOf(e), e) + (lenses ? intentHtml(nextIntentOf(e), e, true) : '') : ''}</div>
        <div class="e-art"><span>${e.art}</span>${e.block > 0 ? `<div class="e-block" data-tip="Block: absorbs damage. Harmony ignores it.">🛡️<b>${e.block}</b></div>` : ''}</div>
        <div class="e-name">${U.esc(e.name)}</div>
        <div class="bar hp" data-tip="Health. Bring to 0 to <b>Plug</b> this hazard."><div class="fill" style="width:${hpPct}%"></div><span>❤️ ${Math.max(0, e.hp)}/${e.maxHp}</span></div>
        <div class="bar unrest" data-tip="Unrest. Bring to 0 with Harmony to <b>Reconcile</b>. Reconciled foes can join your deck."><div class="fill" style="width:${urPct}%"></div><span>${moodFace(e)} ${Math.max(0, e.unrest)}/${e.maxUnrest}</span></div>
        <div class="statuses">${statusHtml(e.st)}</div>
        ${e.state === 'plugged' ? '<div class="stamp plugged">Plugged</div>' : ''}
        ${e.state === 'reconciled' ? '<div class="stamp reconciled">Reconciled 🕊️</div>' : ''}
      </div>`;
    }).join('');
  }

  function renderPlayer() {
    const c = C(), run = R();
    const pet = PZ.RELICS[run.companion];
    const hpPct = U.clamp(run.hp / run.maxHp * 100, 0, 100);
    U.$('#player').innerHTML = `
      <div class="p-art"><span class="hero">👷</span><span class="pet" data-tip="<b>${pet.name}</b><br>${U.esc(pet.text)}">${pet.art}</span>
        ${c.block > 0 ? `<div class="p-block" data-tip="Block absorbs attack damage. Resets at the start of your turn.">🛡️<b>${c.block}</b></div>` : ''}</div>
      <div class="p-name">${U.esc(run.name)} <small>Wellsite Pilgrim</small></div>
      <div class="bar hp big"><div class="fill" style="width:${hpPct}%"></div><span>❤️ ${Math.max(0, run.hp)}/${run.maxHp}</span></div>
      <div class="statuses">${statusHtml(c.st)}</div>`;
  }

  function displayFx(card) {
    const c = C(); const fx = Object.assign({}, PZ.fxOf(card));
    const tq = c.st.Torque || 0, weak = c.st.Weak, stitch = c.st.Stitches || 0, flow = c.st.Flow || 0;
    ['dmg', 'dmgAll', 'dmgRandom'].forEach(k => { if (fx[k]) { let v = fx[k] + tq; if (weak) v = Math.floor(v * 0.75); fx[k] = v; } });
    if (fx.block) fx.block += stitch;
    if (fx.harm) fx.harm += flow;
    if (fx.harmAll) fx.harmAll += flow;
    if (fx.special === 'prairie') fx.per = fx.per;
    return fx;
  }

  function renderHand() {
    const c = C();
    const n = c.hand.length;
    U.$('#hand').innerHTML = c.hand.map((card, i) => {
      const off = i - (n - 1) / 2;
      const playable = !PZ.def(card).unplayable && PZ.costOf(card) <= c.energy;
      const style = `style="--rot:${(off * 3.2).toFixed(1)}deg; --lift:${(Math.abs(off) * Math.abs(off) * 2.2).toFixed(1)}px; --i:${i}; z-index:${i + 1}"`;
      const cls = (playable ? 'playable' : 'unplayable') + (c.selected === card.uid ? ' selected' : '');
      return PZ.renderCard(card, { cls, fx: displayFx(card), flavor: false, attrs: style + ` onclick="PZ.clickCard('${card.uid}')" data-key="${i < 9 ? i + 1 : i === 9 ? 0 : ''}"` });
    }).join('');
    U.$('#hand').style.setProperty('--n', n);
  }

  function render() {
    const c = C(); if (!c || !U.$('#combat')) return;
    renderEnemies(); renderPlayer(); renderHand();
    const e = U.$('#energy'); e.innerHTML = `<b>${c.energy}</b><small>/${PZ.maxEnergy()}</small>`; e.dataset.tip = 'Energy. Cards cost Energy to play. Refills each turn.';
    e.classList.toggle('empty', c.energy === 0);
    U.$('#drawpile').innerHTML = `<span>🂠</span><b>${c.draw.length}</b>`;
    U.$('#discardpile').innerHTML = `<span>♻️</span><b>${c.discard.length}</b>`;
    U.$('#exhaustpile').innerHTML = `<span>🔥</span><b>${c.exhaust.length}</b>`;
    const et = U.$('#endturn'); et.disabled = PZ.G.busy || c.over;
    et.classList.toggle('nudge', !c.over && !PZ.G.busy && !c.hand.some(h => !PZ.def(h).unplayable && PZ.costOf(h) <= c.energy));
    U.$('#combat').classList.toggle('targeting', !!c.selected);
    PZ.renderTopBar();
    // apply queued animations
    const q = fxQueue; fxQueue = [];
    q.forEach(f => {
      const el = f.euid ? document.querySelector(`.enemy[data-euid="${f.euid}"] .e-art`) : document.querySelector(f.el);
      PZ.shake(el, f.cls);
    });
  }
  PZ.renderCombat = render;
})(window.PZ);
