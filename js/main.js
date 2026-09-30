/* Pay Zone — boot and input. */
(function (PZ) {
  const prefs = PZ.store.get('prefs', { music: true, sfx: true });
  PZ.audio.setPrefs(prefs.music, prefs.sfx);

  // Browsers need a user gesture before audio can start.
  const unlock = () => { PZ.audio.init(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  document.addEventListener('keydown', e => {
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    const modalOpen = document.querySelector('#modal.open');
    if (e.key === 'Escape') { if (modalOpen) { if (modalOpen.querySelector('.modal-x')) PZ.closeModal(); } else PZ.cancelSelect && PZ.cancelSelect(); return; }
    if (modalOpen || PZ.G.screen !== 'combat' || !PZ.G.combat) return;
    if (e.key === 'e' || e.key === 'E') { PZ.endTurn(); return; }
    if (/^[0-9]$/.test(e.key)) {
      const idx = e.key === '0' ? 9 : Number(e.key) - 1;
      const card = PZ.G.combat.hand[idx];
      if (card) PZ.clickCard(card.uid);
    }
  });

  // Right-click cancels targeting
  document.addEventListener('contextmenu', e => { if (PZ.G.combat && PZ.G.combat.selected) { e.preventDefault(); PZ.cancelSelect(); } });
  // Clicking empty battlefield cancels targeting
  document.addEventListener('click', e => {
    if (!PZ.G.combat || !PZ.G.combat.selected) return;
    if (e.target.closest('.enemy') || e.target.closest('.card')) return;
    PZ.cancelSelect();
  });

  PZ.initTooltips();
  PZ.initHolo();
  PZ.showTitle();
})(window.PZ);
