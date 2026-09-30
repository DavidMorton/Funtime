/* Pay Zone — procedural ambient jazz and sound effects (Web Audio, no files). */
window.PZ = window.PZ || {};

(function (PZ) {
  const A = { ctx: null, master: null, musicBus: null, sfxBus: null, reverb: null,
    musicOn: true, sfxOn: true, mood: 'calm', timer: null, nextBeat: 0, beat: 0 };

  const midi = n => 440 * Math.pow(2, (n - 69) / 12);

  // Chord voicings (MIDI). Each progression: [{bass, notes, scale}]
  const PROGS = {
    calm: { bpm: 62, chords: [
      { bass: 41, notes: [57, 60, 64, 67], scale: [65, 67, 69, 72, 74, 76] },      // Fmaj9 (A C E G)
      { bass: 40, notes: [55, 59, 62, 66], scale: [64, 67, 69, 71, 74, 76] },      // Em9-ish
      { bass: 38, notes: [53, 57, 60, 64], scale: [62, 65, 69, 72, 74, 77] },      // Dm9
      { bass: 43, notes: [53, 57, 59, 64], scale: [62, 67, 69, 71, 74, 76] },      // G13sus
    ] },
    combat: { bpm: 76, chords: [
      { bass: 45, notes: [55, 60, 64, 67], scale: [69, 72, 74, 76, 79, 81] },      // Am9
      { bass: 38, notes: [54, 57, 60, 64], scale: [66, 69, 71, 74, 76, 78] },      // D9
      { bass: 41, notes: [57, 59, 64, 67], scale: [65, 69, 71, 72, 76, 77] },      // Fmaj7#11
      { bass: 40, notes: [56, 59, 62, 65], scale: [64, 68, 71, 72, 74, 76] },      // E7b9
    ] },
    boss: { bpm: 70, chords: [
      { bass: 38, notes: [53, 57, 60, 64], scale: [62, 65, 67, 69, 72, 74] },      // Dm9
      { bass: 46, notes: [53, 57, 62, 64], scale: [65, 67, 69, 70, 74, 77] },      // Bbmaj9#11
      { bass: 43, notes: [53, 58, 62, 65], scale: [62, 65, 67, 70, 74, 77] },      // Gm11
      { bass: 45, notes: [55, 58, 61, 65], scale: [64, 67, 69, 70, 73, 76] },      // A7alt
    ] },
    victory: { bpm: 66, chords: [
      { bass: 36, notes: [55, 59, 62, 64], scale: [67, 69, 72, 74, 76, 79] },      // Cmaj9
      { bass: 41, notes: [57, 60, 64, 67], scale: [65, 69, 72, 74, 76, 79] },      // Fmaj9
      { bass: 45, notes: [55, 60, 64, 67], scale: [67, 69, 72, 74, 76, 79] },      // Am9
      { bass: 43, notes: [53, 57, 59, 64], scale: [62, 67, 69, 71, 74, 79] },      // G13sus
    ] },
  };

  function init() {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    A.ctx = new Ctx();
    A.master = A.ctx.createGain(); A.master.gain.value = 0.8; A.master.connect(A.ctx.destination);
    A.reverb = A.ctx.createConvolver(); A.reverb.buffer = impulse(3.2, 2.4);
    const revGain = A.ctx.createGain(); revGain.gain.value = 0.55;
    A.reverb.connect(revGain); revGain.connect(A.master);
    A.musicBus = A.ctx.createGain(); A.musicBus.gain.value = A.musicOn ? 0.5 : 0;
    A.musicBus.connect(A.master); A.musicBus.connect(A.reverb);
    A.sfxBus = A.ctx.createGain(); A.sfxBus.gain.value = A.sfxOn ? 0.6 : 0;
    A.sfxBus.connect(A.master);
    const sfxRev = A.ctx.createGain(); sfxRev.gain.value = 0.25; A.sfxBus.connect(sfxRev); sfxRev.connect(A.reverb);
    A.nextBeat = A.ctx.currentTime + 0.1;
    A.timer = setInterval(schedule, 100);
  }

  function impulse(seconds, decay) {
    const rate = A.ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = A.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  // Electric-piano-ish voice
  function rhodes(note, t, dur, vel, bus) {
    const c = A.ctx, f = midi(note);
    const g = c.createGain(); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.012);
    g.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const trem = c.createGain(); trem.gain.value = 1;
    const lfo = c.createOscillator(); lfo.frequency.value = 4.2;
    const lfoG = c.createGain(); lfoG.gain.value = 0.12; lfo.connect(lfoG); lfoG.connect(trem.gain);
    const o1 = c.createOscillator(); o1.type = 'sine'; o1.frequency.value = f;
    const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2.001;
    const g2 = c.createGain(); g2.gain.setValueAtTime(0.18, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    const tine = c.createOscillator(); tine.type = 'sine'; tine.frequency.value = f * 7.02;
    const gt = c.createGain(); gt.gain.setValueAtTime(0.05, t); gt.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o1.connect(g); o2.connect(g2); g2.connect(g); tine.connect(gt); gt.connect(g);
    g.connect(trem); trem.connect(bus || A.musicBus);
    [o1, o2, tine, lfo].forEach(o => { o.start(t); o.stop(t + dur + 0.05); });
  }

  function bass(note, t, dur, vel) {
    const c = A.ctx, f = midi(note);
    const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    const g = c.createGain(); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(A.musicBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  let noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    const len = A.ctx.sampleRate; noiseBuf = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function brush(t, vel, len) {
    const c = A.ctx, src = c.createBufferSource(); src.buffer = noise();
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 5200; bp.Q.value = 0.6;
    const g = c.createGain(); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + (len > 0.15 ? 0.08 : 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(bp); bp.connect(g); g.connect(A.musicBus);
    src.start(t); src.stop(t + len + 0.05);
  }
  function vibes(note, t, vel) {
    const c = A.ctx, f = midi(note);
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 4;
    const g2 = c.createGain(); g2.gain.value = 0.06;
    const trem = c.createGain(); const lfo = c.createOscillator(); lfo.frequency.value = 5.5;
    const lg = c.createGain(); lg.gain.value = 0.3; lfo.connect(lg); lg.connect(trem.gain);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(trem); trem.connect(A.musicBus);
    [o, o2, lfo].forEach(x => { x.start(t); x.stop(t + 2.3); });
  }

  function schedule() {
    if (!A.ctx || !A.musicOn) { if (A.ctx) A.nextBeat = Math.max(A.nextBeat, A.ctx.currentTime + 0.05); return; }
    const prog = PROGS[A.mood] || PROGS.calm;
    const spb = 60 / prog.bpm;
    while (A.nextBeat < A.ctx.currentTime + 0.3) {
      const t = A.nextBeat, b = A.beat;
      const bar = Math.floor(b / 4), beatInBar = b % 4;
      const chord = prog.chords[Math.floor(bar / 2) % prog.chords.length];
      const swing = spb * 0.66;
      // Comping: chord on beat 1 of each 2-bar block, soft stabs elsewhere
      if (beatInBar === 0 && bar % 2 === 0) chord.notes.forEach((n, i) => rhodes(n, t + i * 0.018, spb * 7, 0.07));
      else if (Math.random() < 0.18) {
        const tt = t + (Math.random() < 0.5 ? 0 : swing);
        chord.notes.slice(1).forEach(n => rhodes(n, tt, spb * 1.5, 0.04));
      }
      // Bass: root on 1, sometimes fifth on 3
      if (beatInBar === 0) bass(chord.bass, t, spb * 1.9, 0.22);
      if (beatInBar === 2 && Math.random() < 0.55) bass(chord.bass + (Math.random() < 0.5 ? 7 : 12), t, spb * 1.4, 0.16);
      // Brushes: swish on 1 & 3, tap on 2 & 4 + swung ride
      if (beatInBar % 2 === 0) brush(t, 0.025, spb * 0.9);
      else brush(t, 0.04, 0.08);
      if (Math.random() < 0.5) brush(t + swing, 0.02, 0.06);
      // Melody: sparse vibraphone notes
      if (Math.random() < (A.mood === 'combat' ? 0.32 : 0.22)) {
        const n = chord.scale[Math.floor(Math.random() * chord.scale.length)];
        vibes(n, t + (Math.random() < 0.4 ? swing : 0), 0.05);
      }
      A.nextBeat += spb; A.beat++;
    }
  }

  // ---------- Sound effects ----------
  function tone(freq, t, dur, type, vel, slideTo) {
    const c = A.ctx; const o = c.createOscillator(); o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(A.sfxBus); o.start(t); o.stop(t + dur + 0.05);
  }
  function nburst(t, dur, freq, vel, type) {
    const c = A.ctx, src = c.createBufferSource(); src.buffer = noise();
    const f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
    const g = c.createGain(); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(A.sfxBus); src.start(t); src.stop(t + dur + 0.05);
  }

  const SFX = {
    card: t => { nburst(t, 0.12, 2400, 0.25); },
    hit: t => { tone(140, t, 0.18, 'sine', 0.6, 50); nburst(t, 0.1, 900, 0.35, 'lowpass'); },
    bighit: t => { tone(110, t, 0.35, 'sine', 0.8, 35); nburst(t, 0.25, 600, 0.5, 'lowpass'); },
    block: t => { tone(420, t, 0.08, 'triangle', 0.3); tone(280, t + 0.02, 0.1, 'triangle', 0.25); },
    harm: t => { [72, 76, 79].forEach((n, i) => tone(midi(n), t + i * 0.05, 0.9, 'sine', 0.13)); },
    reconcile: t => { [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => tone(midi(n), t + i * 0.07, 1.4, 'sine', 0.12)); },
    plug: t => { tone(220, t, 0.5, 'triangle', 0.3, 60); nburst(t + 0.1, 0.4, 300, 0.3, 'lowpass'); },
    hurt: t => { tone(180, t, 0.2, 'square', 0.12, 90); nburst(t, 0.15, 500, 0.3); },
    coin: t => { tone(988, t, 0.08, 'square', 0.08); tone(1319, t + 0.07, 0.25, 'square', 0.08); },
    buff: t => { tone(midi(67), t, 0.25, 'triangle', 0.15, midi(79)); },
    debuff: t => { tone(midi(62), t, 0.3, 'triangle', 0.15, midi(50)); },
    click: t => { tone(1200, t, 0.03, 'square', 0.05); },
    pack: t => { nburst(t, 0.4, 3000, 0.3, 'highpass'); [79, 83, 86, 91].forEach((n, i) => tone(midi(n), t + 0.3 + i * 0.06, 0.6, 'sine', 0.1)); },
    rare: t => { [72, 79, 84, 88, 91, 96].forEach((n, i) => tone(midi(n), t + i * 0.05, 1.2, 'triangle', 0.08)); },
    heal: t => { [67, 71, 74].forEach((n, i) => tone(midi(n), t + i * 0.08, 0.6, 'sine', 0.12)); },
    turn: t => { tone(midi(64), t, 0.3, 'sine', 0.1); tone(midi(71), t + 0.1, 0.4, 'sine', 0.1); },
    lose: t => { [60, 58, 55, 51].forEach((n, i) => tone(midi(n), t + i * 0.25, 0.9, 'triangle', 0.15)); },
  };

  PZ.audio = {
    init,
    sfx(name) { if (!A.ctx || !A.sfxOn || !SFX[name]) return; try { SFX[name](A.ctx.currentTime + 0.01); } catch (e) { /* ignore */ } },
    mood(m) { if (A.mood !== m) { A.mood = m; A.beat = A.beat - (A.beat % 8); } },
    toggleMusic() { A.musicOn = !A.musicOn; if (A.musicBus) A.musicBus.gain.setTargetAtTime(A.musicOn ? 0.5 : 0, A.ctx.currentTime, 0.2); return A.musicOn; },
    toggleSfx() { A.sfxOn = !A.sfxOn; if (A.sfxBus) A.sfxBus.gain.value = A.sfxOn ? 0.6 : 0; return A.sfxOn; },
    get musicOn() { return A.musicOn; },
    get sfxOn() { return A.sfxOn; },
    setPrefs(m, s) { A.musicOn = m; A.sfxOn = s; },
  };
})(window.PZ);
