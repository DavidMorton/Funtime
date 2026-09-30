/* Pay Zone — game data: cards, enemies, relics, encounters, events. */
window.PZ = window.PZ || {};

(function (PZ) {
  // ---------- Families ----------
  PZ.FAMILIES = {
    drill: { name: 'Drill', desc: 'Engineering. Hits hard.' },
    lake: { name: 'Lakehouse', desc: 'Data tools. Draw, energy, combos.' },
    craft: { name: 'Craft', desc: 'Crochet, drawing, architecture. Builds Block.' },
    hymn: { name: 'Hymn', desc: 'Music and faith. Applies Harmony.' },
    ally: { name: 'Ally', desc: 'Former foes who joined you.' },
    junk: { name: 'Status', desc: 'Clutter. Get rid of it.' },
  };

  // Helpers for card text
  const s = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const times = (f) => (f.hits && f.hits > 1 ? ` ${f.hits} times` : '');

  // ---------- Cards ----------
  // fx keys: dmg, dmgAll, dmgRandom, hits, pierce, harm, harmAll, block, draw, energy, heal,
  //          apply{}, applyAll{}, self{}, addJunk, special
  const C = {};
  const card = (id, o) => { o.id = id; C[id] = o; };

  // ===== DRILL =====
  card('drill_bit', { name: 'Drill Bit', fam: 'drill', type: 'Attack', cost: 1, rarity: 'starter', art: '🔩', target: 'enemy',
    fx: { dmg: 6 }, up: { dmg: 9 },
    text: f => `Deal ${f.dmg} damage.`, flavor: 'Turn to the right. Make hole.' });
  card('pdc_cutter', { name: 'PDC Cutter', fam: 'drill', type: 'Attack', cost: 2, rarity: 'common', art: '💎', target: 'enemy',
    fx: { dmg: 10, apply: { Exposed: 2 } }, up: { dmg: 13, apply: { Exposed: 3 } },
    text: f => `Deal ${f.dmg} damage. Apply ${f.apply.Exposed} Exposed.`, flavor: 'Polycrystalline diamond. Unmoved by your feelings.' });
  card('rop', { name: 'Rate of Penetration', fam: 'drill', type: 'Attack', cost: 1, rarity: 'common', art: '⏩', target: 'enemy',
    fx: { dmg: 3, hits: 3 }, up: { dmg: 4 },
    text: f => `Deal ${f.dmg} damage${times(f)}.`, flavor: 'Feet per hour is a love language.' });
  card('jar_pipe', { name: 'Jar the Pipe', fam: 'drill', type: 'Attack', cost: 1, rarity: 'common', art: '🔨', target: 'enemy',
    fx: { pierce: true, dmg: 8 }, up: { dmg: 11 },
    text: f => `Remove the enemy's Block. Deal ${f.dmg} damage.`, flavor: 'Up, down, up, down. Something gives.' });
  card('frack_stage', { name: 'Frack Stage', fam: 'drill', type: 'Attack', cost: 2, rarity: 'uncommon', art: '💥', target: 'all',
    fx: { dmgAll: 4, hits: 3 }, up: { dmgAll: 5 },
    text: f => `Deal ${f.dmgAll} damage to ALL enemies${times(f)}.`, flavor: 'Stage 14 of 40. Coffee is cold.' });
  card('mud_weight', { name: 'Mud Weight Up', fam: 'drill', type: 'Skill', cost: 1, rarity: 'common', art: '🪣', target: 'self',
    fx: { block: 8 }, up: { block: 11 },
    text: f => `Gain ${f.block} Block.`, flavor: 'Heavier mud. Calmer well.' });
  card('bop', { name: 'Blowout Preventer', fam: 'drill', type: 'Skill', cost: 2, rarity: 'uncommon', art: '🛑', target: 'self',
    fx: { block: 13, self: { Buttress: 1 } }, up: { block: 17 },
    text: f => `Gain ${f.block} Block. Your Block is not removed next turn.`, flavor: 'The last line of defense. Test it often.' });
  card('top_drive', { name: 'Top Drive', fam: 'drill', type: 'Power', cost: 1, rarity: 'uncommon', art: '⚙️', target: 'self',
    fx: { self: { Torque: 2 } }, up: { self: { Torque: 3 } },
    text: f => `Gain ${f.self.Torque} Torque. (Your attacks deal +${f.self.Torque} damage per hit.)`, flavor: 'More torque. Fewer excuses.' });
  card('kill_mud', { name: 'Kill Mud', fam: 'drill', type: 'Skill', cost: 1, rarity: 'common', art: '🧪', target: 'enemy',
    fx: { apply: { Weak: 2, Exposed: 1 } }, up: { apply: { Weak: 3, Exposed: 2 } },
    text: f => `Apply ${f.apply.Weak} Weak and ${f.apply.Exposed} Exposed.`, flavor: 'Balance the pressure. Then breathe.' });
  card('directional', { name: 'Directional Drilling', fam: 'drill', type: 'Attack', cost: 1, rarity: 'common', art: '↪️', target: 'all',
    fx: { dmgRandom: 5, hits: 2 }, up: { dmgRandom: 7 },
    text: f => `Deal ${f.dmgRandom} damage to a random enemy${times(f)}.`, flavor: 'Aim for the sweet spot. Adjust as you go.' });
  card('gusher', { name: 'Gusher', fam: 'drill', type: 'Attack', cost: 3, rarity: 'rare', art: '⛲', target: 'enemy',
    fx: { dmg: 28 }, up: { dmg: 36 },
    text: f => `Deal ${f.dmg} damage.`, flavor: 'The whole crew cheers. Then they call the regulator.' });
  card('total_depth', { name: 'Total Depth', fam: 'drill', type: 'Attack', cost: 1, rarity: 'rare', art: '📏', target: 'enemy',
    fx: { special: 'bodySlam' }, upCost: 0,
    text: f => `Deal damage equal to your Block.`, flavor: 'Everything you built, all at once.' });
  card('wildcat', { name: 'Wildcat Well', fam: 'drill', type: 'Attack', cost: 0, rarity: 'uncommon', art: '🐈', target: 'enemy',
    fx: { dmg: 4, draw: 1 }, up: { dmg: 7 },
    text: f => `Deal ${f.dmg} damage. Draw 1 card.`, flavor: 'Nobody has drilled here. The cat does not care.' });
  card('hard_hat', { name: 'Hard Hat', fam: 'drill', type: 'Skill', cost: 1, rarity: 'common', art: '⛑️', target: 'self',
    fx: { block: 5, draw: 1 }, up: { block: 8 },
    text: f => `Gain ${f.block} Block. Draw 1 card.`, flavor: 'Safety meeting at 0600. Donuts at 0601.' });

  // ===== LAKEHOUSE =====
  card('photon', { name: 'Photon Query', fam: 'lake', type: 'Skill', cost: 1, rarity: 'starter', art: '⚡', target: 'self',
    fx: { draw: 2 }, up: { draw: 3 },
    text: f => `Draw ${s(f.draw, 'card')}.`, flavor: 'Vectorized. Very fast. Very pleased with itself.' });
  card('delta_merge', { name: 'Delta Merge', fam: 'lake', type: 'Attack', cost: 1, rarity: 'common', art: '🔺', target: 'enemy',
    fx: { dmg: 5, block: 5 }, up: { dmg: 7, block: 7 },
    text: f => `Deal ${f.dmg} damage. Gain ${f.block} Block.`, flavor: 'MERGE INTO problems USING solutions.' });
  card('time_travel', { name: 'Time Travel', fam: 'lake', type: 'Skill', cost: 0, rarity: 'uncommon', art: '⏳', target: 'self',
    fx: { special: 'timeTravel' }, exhaust: true, up: { exhaust: false },
    text: (f, c) => `Return the last card you played this turn to your hand. It costs 0.${c.exhaust ? ' Exhaust.' : ''}`,
    flavor: 'SELECT * FROM regrets VERSION AS OF yesterday.' });
  card('liquid', { name: 'Liquid Clustering', fam: 'lake', type: 'Skill', cost: 1, rarity: 'common', art: '💧', target: 'self',
    fx: { special: 'reshuffle', draw: 3 }, up: { draw: 4 },
    text: f => `Shuffle your discard pile into your draw pile. Draw ${s(f.draw, 'card')}.`, flavor: 'No more partitions. Just flow.' });
  card('autoscale', { name: 'Autoscaling', fam: 'lake', type: 'Skill', cost: 0, rarity: 'common', art: '📈', target: 'self',
    fx: { energy: 1, draw: 1 }, up: { energy: 2 }, exhaust: true,
    text: f => `Gain ${f.energy} Energy. Draw 1 card. Exhaust.`, flavor: 'Scale up. Scale down. Sleep well.' });
  card('unity', { name: 'Unity Catalog', fam: 'lake', type: 'Power', cost: 1, rarity: 'rare', art: '🗂️', target: 'self',
    fx: { self: { Catalog: 1 } }, upCost: 0,
    text: f => `At the start of each turn, draw 1 extra card.`, flavor: 'Everything in its place. Everyone can find it.' });
  card('serverless', { name: 'Serverless', fam: 'lake', type: 'Skill', cost: 0, rarity: 'uncommon', art: '☁️', target: 'self',
    fx: { energy: 2, addJunk: 'invoice' }, up: { energy: 3 },
    text: f => `Gain ${f.energy} Energy. Add a Surprise Invoice to your discard pile.`, flavor: 'Infinite scale. Finite budget.' });
  card('lakebase', { name: 'Lakebase', fam: 'lake', type: 'Skill', cost: 1, rarity: 'uncommon', art: '🐘', target: 'enemy',
    fx: { harm: 6, block: 6 }, up: { harm: 8, block: 8 },
    text: f => `Apply ${f.harm} Harmony. Gain ${f.block} Block.`, flavor: 'Transactions and analytics, finally getting along.' });
  card('genie', { name: 'Ask Genie', fam: 'lake', type: 'Skill', cost: 1, rarity: 'uncommon', art: '🧞', target: 'self',
    fx: { special: 'genie' }, upCost: 0,
    text: f => `Add a random card to your hand. It costs 0 this turn.`, flavor: '"Show me revenue by region." It did.' });
  card('medallion', { name: 'Medallion Architecture', fam: 'lake', type: 'Power', cost: 2, rarity: 'uncommon', art: '🥇', target: 'self',
    fx: { self: { Medallion: 4 } }, up: { self: { Medallion: 6 } },
    text: f => `At the start of each turn, gain ${f.self.Medallion} Block.`, flavor: 'Bronze. Silver. Gold. Sleep.' });
  card('mosaic', { name: 'Mosaic AI', fam: 'lake', type: 'Attack', cost: 2, rarity: 'rare', art: '🧩', target: 'all',
    fx: { dmgAll: 7, harmAll: 7 }, up: { dmgAll: 9, harmAll: 9 },
    text: f => `Deal ${f.dmgAll} damage and apply ${f.harmAll} Harmony to ALL enemies.`, flavor: 'Many small pieces. One picture.' });
  card('schema_evo', { name: 'Schema Evolution', fam: 'lake', type: 'Skill', cost: 1, rarity: 'uncommon', art: '🧬', target: 'self',
    fx: { special: 'upgradeHand' }, upCost: 0,
    text: f => `Upgrade all cards in your hand for the rest of this combat.`, flavor: 'mergeSchema = true. Growth, not breakage.' });
  card('vacuum', { name: 'OPTIMIZE & VACUUM', fam: 'lake', type: 'Skill', cost: 1, rarity: 'common', art: '🧹', target: 'self',
    fx: { special: 'vacuum' }, upCost: 0,
    text: f => `Exhaust all Status cards in your hand. Draw 1 card, plus 1 for each card exhausted.`, flavor: 'Small files, begone.' });
  card('notebook', { name: 'Notebook Cell', fam: 'lake', type: 'Attack', cost: 1, rarity: 'common', art: '📓', target: 'enemy',
    fx: { dmg: 4, harm: 4 }, up: { dmg: 6, harm: 6 },
    text: f => `Deal ${f.dmg} damage. Apply ${f.harm} Harmony.`, flavor: 'Run all. Hold your breath.' });

  // ===== CRAFT =====
  card('chain_stitch', { name: 'Chain Stitch', fam: 'craft', type: 'Skill', cost: 1, rarity: 'starter', art: '🧶', target: 'self',
    fx: { block: 5 }, up: { block: 8 },
    text: f => `Gain ${f.block} Block.`, flavor: 'Every blanket starts here.' });
  card('granny_square', { name: 'Granny Square', fam: 'craft', type: 'Skill', cost: 2, rarity: 'common', art: '🟪', target: 'self',
    fx: { block: 12, draw: 1 }, up: { block: 15 },
    text: f => `Gain ${f.block} Block. Draw 1 card.`, flavor: 'Make forty. Sew them together. Stay warm.' });
  card('magic_ring', { name: 'Magic Ring', fam: 'craft', type: 'Skill', cost: 1, rarity: 'common', art: '⭕', target: 'self',
    fx: { block: 4, self: { Stitches: 1 } }, up: { block: 6, self: { Stitches: 2 } },
    text: f => `Gain ${f.block} Block. Gain ${f.self.Stitches} Stitches. (Block from cards +${f.self.Stitches}.)`, flavor: 'Pull the tail. Watch it close.' });
  card('amigurumi', { name: 'Amigurumi', fam: 'craft', type: 'Skill', cost: 2, rarity: 'uncommon', art: '🧸', target: 'all',
    fx: { block: 10, harmAll: 4 }, up: { block: 13, harmAll: 6 },
    text: f => `Gain ${f.block} Block. Apply ${f.harmAll} Harmony to ALL enemies.`, flavor: 'Nobody stays angry holding a tiny crocheted whale.' });
  card('blanket', { name: 'Blanket Stitch', fam: 'craft', type: 'Skill', cost: 2, rarity: 'uncommon', art: '🛏️', target: 'self',
    fx: { block: 17 }, up: { block: 22 },
    text: f => `Gain ${f.block} Block.`, flavor: 'Thirty hours of work. Worth it.' });
  card('frogging', { name: 'Frogging', fam: 'craft', type: 'Skill', cost: 0, rarity: 'common', art: '🐸', target: 'self',
    fx: { block: 4, special: 'pickExhaust' }, up: { block: 7 },
    text: f => `Gain ${f.block} Block. Choose a card in your hand to Exhaust.`, flavor: 'Rip it, rip it. Start again.' });
  card('sketchbook', { name: 'Sketchbook', fam: 'craft', type: 'Skill', cost: 1, rarity: 'common', art: '✏️', target: 'self',
    fx: { block: 3, draw: 2 }, up: { block: 6 },
    text: f => `Gain ${f.block} Block. Draw 2 cards.`, flavor: 'Draw what you see, not what you think you see.' });
  card('contour', { name: 'Contour Line', fam: 'craft', type: 'Attack', cost: 1, rarity: 'common', art: '🗺️', target: 'enemy',
    fx: { dmg: 5, block: 4 }, up: { dmg: 7, block: 6 },
    text: f => `Deal ${f.dmg} damage. Gain ${f.block} Block.`, flavor: 'Same line on a map and in a sketch. Follow the shape.' });
  card('buttress', { name: 'Flying Buttress', fam: 'craft', type: 'Skill', cost: 1, rarity: 'uncommon', art: '⛪', target: 'self',
    fx: { block: 8, self: { Buttress: 1 } }, up: { block: 11 },
    text: f => `Gain ${f.block} Block. Your Block is not removed next turn.`, flavor: 'Push back from the outside so the inside can soar.' });
  card('prairie', { name: 'Prairie Style', fam: 'craft', type: 'Skill', cost: 1, rarity: 'uncommon', art: '🏡', target: 'self',
    fx: { special: 'prairie', per: 3 }, up: { per: 4 },
    text: f => `Gain ${f.per} Block for each other card in your hand.`, flavor: 'Long, low, horizontal lines. Rooted in the land.' });
  card('cantilever', { name: 'Cantilever', fam: 'craft', type: 'Power', cost: 2, rarity: 'rare', art: '🏞️', target: 'self',
    fx: { self: { Barricade: 1 } }, upCost: 1,
    text: f => `Your Block is no longer removed at the start of your turn.`, flavor: 'A house over a waterfall should not work. It does.' });
  card('brutalist', { name: 'Brutalist Pour', fam: 'craft', type: 'Skill', cost: 3, rarity: 'uncommon', art: '🧱', target: 'self',
    fx: { block: 26 }, up: { block: 32 },
    text: f => `Gain ${f.block} Block.`, flavor: 'Honest concrete. Nothing to hide.' });
  card('perspective', { name: 'One-Point Perspective', fam: 'craft', type: 'Skill', cost: 1, rarity: 'common', art: '📐', target: 'enemy',
    fx: { apply: { Exposed: 2 }, draw: 1 }, up: { apply: { Exposed: 3 } },
    text: f => `Apply ${f.apply.Exposed} Exposed. Draw 1 card.`, flavor: 'Everything leads to one point. Aim there.' });

  // ===== HYMN =====
  card('gentle_word', { name: 'Gentle Word', fam: 'hymn', type: 'Skill', cost: 1, rarity: 'starter', art: '🕊️', target: 'enemy',
    fx: { harm: 6 }, up: { harm: 9 },
    text: f => `Apply ${f.harm} Harmony.`, flavor: 'A soft answer turneth away wrath.' });
  card('ambient_jazz', { name: 'Ambient Jazz', fam: 'hymn', type: 'Skill', cost: 1, rarity: 'common', art: '🎷', target: 'all',
    fx: { harmAll: 4, applyAll: { Calm: 1 } }, up: { harmAll: 5, applyAll: { Calm: 2 } },
    text: f => `Apply ${f.harmAll} Harmony and ${f.applyAll.Calm} Calm to ALL enemies.`, flavor: 'Brushes on a snare. Nobody wants to fight.' });
  card('lament', { name: 'Psalm of Lament', fam: 'hymn', type: 'Skill', cost: 2, rarity: 'common', art: '📜', target: 'enemy',
    fx: { harm: 15 }, up: { harm: 20 },
    text: f => `Apply ${f.harm} Harmony.`, flavor: 'How long? Honest words disarm.' });
  card('doxology', { name: 'Doxology', fam: 'hymn', type: 'Skill', cost: 2, rarity: 'rare', art: '🎶', target: 'all',
    fx: { heal: 6, harmAll: 8 }, up: { heal: 9, harmAll: 10 }, exhaust: true,
    text: f => `Heal ${f.heal} HP. Apply ${f.harmAll} Harmony to ALL enemies. Exhaust.`, flavor: 'The last verse. Everyone stands.' });
  card('passing_peace', { name: 'Passing the Peace', fam: 'hymn', type: 'Skill', cost: 0, rarity: 'common', art: '🤝', target: 'enemy',
    fx: { harm: 3, draw: 1 }, up: { harm: 5 },
    text: f => `Apply ${f.harm} Harmony. Draw 1 card.`, flavor: 'Peace be with you. And also with you.' });
  card('leap', { name: 'Leap of Faith', fam: 'hymn', type: 'Skill', cost: 1, rarity: 'uncommon', art: '🌌', target: 'enemy',
    fx: { special: 'leap', t: 15, harm: 5 }, up: { t: 22 },
    text: f => `If the enemy has ${f.t} or less Unrest, Reconcile it. Otherwise apply ${f.harm} Harmony.`, flavor: 'Not a step into the dark. A step toward someone.' });
  card('infinite_game', { name: 'The Infinite Game', fam: 'hymn', type: 'Power', cost: 2, rarity: 'rare', art: '♾️', target: 'self',
    fx: { self: { Infinite: 3 } }, up: { self: { Infinite: 4 } },
    text: f => `At the start of each turn, apply ${f.self.Infinite} Harmony to ALL enemies.`, flavor: 'Some games are played to win. Some are played to keep playing.' });
  card('folk_song', { name: 'Folk Song', fam: 'hymn', type: 'Skill', cost: 1, rarity: 'common', art: '🪕', target: 'enemy',
    fx: { harm: 5, block: 5 }, up: { harm: 7, block: 7 },
    text: f => `Apply ${f.harm} Harmony. Gain ${f.block} Block.`, flavor: 'Three chords and the truth.' });
  card('sabbath', { name: 'Sabbath Rest', fam: 'hymn', type: 'Skill', cost: 1, rarity: 'uncommon', art: '🌅', target: 'self',
    fx: { heal: 4, self: { Flow: 1 } }, up: { heal: 6, self: { Flow: 2 } }, exhaust: true,
    text: f => `Heal ${f.heal} HP. Gain ${f.self.Flow} Flow. (Harmony +${f.self.Flow}.) Exhaust.`, flavor: 'The work will be there tomorrow.' });
  card('benediction', { name: 'Benediction', fam: 'hymn', type: 'Skill', cost: 1, rarity: 'common', art: '🙌', target: 'enemy',
    fx: { apply: { Calm: 2 }, harm: 3 }, up: { apply: { Calm: 3 }, harm: 5 },
    text: f => `Apply ${f.apply.Calm} Calm. Apply ${f.harm} Harmony.`, flavor: 'The Lord bless you and keep you.' });
  card('peacemaker', { name: 'Blessed Are the Peacemakers', fam: 'hymn', type: 'Power', cost: 1, rarity: 'rare', art: '🕯️', target: 'self',
    fx: { self: { Peacemaker: 2 } }, up: { self: { Peacemaker: 3 } },
    text: f => `Whenever you apply Harmony, gain ${f.self.Peacemaker} Block.`, flavor: 'Not peace-keepers. Peace-makers. It takes work.' });
  card('table_set', { name: 'Set the Table', fam: 'hymn', type: 'Skill', cost: 1, rarity: 'common', art: '🍞', target: 'enemy',
    fx: { apply: { Weak: 2 }, harm: 4 }, up: { apply: { Weak: 3 }, harm: 6 },
    text: f => `Apply ${f.apply.Weak} Weak. Apply ${f.harm} Harmony.`, flavor: 'Hard to fight someone who just passed you the bread.' });
  card('five_part', { name: 'Five-Part Harmony', fam: 'hymn', type: 'Skill', cost: 2, rarity: 'uncommon', art: '🎤', target: 'enemy',
    fx: { harm: 3, hits: 5 }, up: { harm: 4 },
    text: f => `Apply ${f.harm} Harmony${times(f)}.`, flavor: 'Five voices. One chord. Grown adults screaming in Las Vegas.' });

  // ===== ALLIES (earned by reconciling) =====
  const ally = (id, o) => card(id, Object.assign({ fam: 'ally', rarity: 'special' }, o));
  ally('a_gas', { name: 'Clean-Burning Gas', type: 'Skill', cost: 0, art: '🔥', target: 'self', fx: { energy: 1, draw: 1 }, exhaust: true, up: { exhaust: false },
    text: (f, c) => `Gain 1 Energy. Draw 1 card.${c.exhaust ? ' Exhaust.' : ''}`, flavor: 'Flared no more. Put to work.' });
  ally('a_pipe', { name: 'Freed Pipe', type: 'Attack', cost: 1, art: '🔧', target: 'enemy', fx: { dmg: 9, block: 4 }, up: { dmg: 12, block: 6 },
    text: f => `Deal ${f.dmg} damage. Gain ${f.block} Block.`, flavor: 'It just needed to be understood. And jarred.' });
  ally('a_null', { name: 'NOT NULL', type: 'Skill', cost: 0, art: '🚫', target: 'self', fx: { block: 4, draw: 1 }, up: { block: 7 },
    text: f => `Gain ${f.block} Block. Draw 1 card.`, flavor: 'A constraint is a kind of promise.' });
  ally('a_schema', { name: 'Schema Friend', type: 'Skill', cost: 0, art: '🦎', target: 'self', fx: { draw: 2 }, exhaust: true, up: { draw: 3 },
    text: f => `Draw ${f.draw} cards. Exhaust.`, flavor: 'Still changes shape. Now it tells you first.' });
  ally('a_mosquito', { name: 'Dragonfly', type: 'Attack', cost: 1, art: '🪰', target: 'all', fx: { dmgRandom: 3, hits: 4 }, up: { dmgRandom: 4 },
    text: f => `Deal ${f.dmgRandom} damage to a random enemy${times(f)}.`, flavor: 'Eats mosquitoes. A Pearland hero.' });
  ally('a_ants', { name: 'Ant Colony', type: 'Power', cost: 1, art: '🐜', target: 'self', fx: { self: { Torque: 1, Stitches: 1 } }, upCost: 0,
    text: f => `Gain 1 Torque and 1 Stitches.`, flavor: 'Ten thousand small jobs, done well.' });
  ally('a_hydra', { name: 'Hydra Pipeline', type: 'Attack', cost: 2, art: '🐉', target: 'enemy', fx: { dmg: 6, hits: 3 }, up: { dmg: 8 },
    text: f => `Deal ${f.dmg} damage${times(f)}.`, flavor: 'Three heads. One DAG. Finally orchestrated.' });
  ally('a_hurricane', { name: 'Gulf Breeze', type: 'Skill', cost: 1, art: '🌬️', target: 'all', fx: { harmAll: 6, block: 6 }, up: { harmAll: 8, block: 8 },
    text: f => `Apply ${f.harmAll} Harmony to ALL enemies. Gain ${f.block} Block.`, flavor: 'After the storm, the nicest week of the year.' });
  ally('a_swamp', { name: 'Clean Lakehouse', type: 'Power', cost: 1, art: '🏠', target: 'self', fx: { self: { Catalog: 1, Flow: 1 } }, upCost: 0,
    text: f => `Draw 1 extra card each turn. Gain 1 Flow.`, flavor: 'The swamp was a lake all along. It just needed governance.' });
  ally('a_salt', { name: 'Salt Crystal', type: 'Skill', cost: 1, art: '🧂', target: 'self', fx: { block: 12 }, up: { block: 16 },
    text: f => `Gain ${f.block} Block.`, flavor: 'A perfect cube. A perfect seal.' });
  ally('a_circ', { name: 'Full Returns', type: 'Skill', cost: 0, art: '🔄', target: 'self', fx: { energy: 1, block: 3 }, up: { block: 6 },
    text: f => `Gain 1 Energy. Gain ${f.block} Block.`, flavor: 'Everything you pumped down came back up.' });
  ally('a_h2s', { name: 'Sweetened Gas', type: 'Skill', cost: 1, art: '🌫️', target: 'all', fx: { harmAll: 5, heal: 2 }, up: { harmAll: 7, heal: 3 },
    text: f => `Apply ${f.harmAll} Harmony to ALL enemies. Heal ${f.heal} HP.`, flavor: 'Scrubbed. Safe. Still smells a little.' });
  ally('a_sheet', { name: 'Final_v3_REAL.xlsx', type: 'Attack', cost: 1, art: '📊', target: 'enemy', fx: { dmg: 3, hits: 4 }, up: { dmg: 4 },
    text: f => `Deal ${f.dmg} damage${times(f)}.`, flavor: 'Now in version control. Probably.' });
  ally('a_shadow', { name: 'Sanctioned Tool', type: 'Skill', cost: 1, art: '🕶️', target: 'self', fx: { draw: 3 }, upCost: 0,
    text: f => `Draw ${f.draw} cards.`, flavor: 'It was useful. Now it is also allowed.' });
  ally('a_scope', { name: 'Scope Agreement', type: 'Skill', cost: 1, art: '📋', target: 'enemy', fx: { block: 8, apply: { Weak: 2 } }, up: { block: 11, apply: { Weak: 3 } },
    text: f => `Gain ${f.block} Block. Apply ${f.apply.Weak} Weak.`, flavor: 'Signed by both parties. In ink.' });
  ally('a_monolith', { name: 'Decomposed Service', type: 'Attack', cost: 2, art: '🏛️', target: 'all', fx: { dmgAll: 8, draw: 1 }, up: { dmgAll: 11 },
    text: f => `Deal ${f.dmgAll} damage to ALL enemies. Draw 1 card.`, flavor: 'Smaller parts. Same good bones.' });
  ally('a_blowout', { name: 'Capped Well', type: 'Power', cost: 2, art: '🗻', target: 'self', fx: { self: { Medallion: 6, Torque: 2 } }, upCost: 1,
    text: f => `At the start of each turn, gain 6 Block. Gain 2 Torque.`, flavor: 'All that pressure, now producing steadily.' });
  ally('a_wave', { name: 'Steady Pressure', type: 'Skill', cost: 1, art: '🌊', target: 'self', fx: { block: 7, self: { Flow: 1 } }, up: { block: 10 },
    text: f => `Gain ${f.block} Block. Gain 1 Flow.`, flavor: 'The same force, gentled.' });
  ally('a_critic', { name: 'Inner Coach', type: 'Skill', cost: 0, art: '🪞', target: 'self', fx: { self: { Torque: 1 }, draw: 1 }, exhaust: true, upCost: 0, up: { exhaust: false },
    text: (f, c) => `Gain 1 Torque. Draw 1 card.${c.exhaust ? ' Exhaust.' : ''}`, flavor: 'Same voice. Kinder words.' });
  ally('a_perfect', { name: 'Good Enough', type: 'Skill', cost: 0, art: '✅', target: 'enemy', fx: { block: 5, harm: 5 }, up: { block: 7, harm: 7 },
    text: f => `Gain ${f.block} Block. Apply ${f.harm} Harmony.`, flavor: 'Done is its own kind of beautiful.' });
  ally('a_doubt', { name: 'Honest Question', type: 'Skill', cost: 1, art: '❔', target: 'enemy', fx: { harm: 10, draw: 1 }, up: { harm: 14 },
    text: f => `Apply ${f.harm} Harmony. Draw 1 card.`, flavor: 'Asked out loud, it lost its teeth.' });
  ally('a_kick', { name: 'Controlled Kick', type: 'Attack', cost: 1, art: '🫧', target: 'all', fx: { dmgAll: 9 }, up: { dmgAll: 12 },
    text: f => `Deal ${f.dmgAll} damage to ALL enemies.`, flavor: 'Shut in. Circulated out. Textbook.' });
  ally('a_burnout', { name: 'Sabbatical', type: 'Skill', cost: 1, art: '🏖️', target: 'self', fx: { heal: 10 }, exhaust: true, up: { heal: 15 },
    text: f => `Heal ${f.heal} HP. Exhaust.`, flavor: 'The inbox survived without you. Humbling. Freeing.' });
  ally('a_quarterly', { name: 'Customer Win', type: 'Attack', cost: 2, art: '🏆', target: 'enemy', fx: { dmg: 20, draw: 1 }, up: { dmg: 26 },
    text: f => `Deal ${f.dmg} damage. Draw 1 card.`, flavor: 'Production workload. Happy champion. Cake.' });
  ally('a_finite', { name: 'The Long Play', type: 'Power', cost: 1, art: '🎲', target: 'self', fx: { self: { Infinite: 3, Flow: 2 } }, upCost: 0,
    text: f => `At the start of each turn, apply 3 Harmony to ALL enemies. Gain 2 Flow.`, flavor: 'It stopped keeping score. It started having fun.' });

  // ===== JUNK / STATUS =====
  const junk = (id, o) => card(id, Object.assign({ fam: 'junk', rarity: 'special', type: 'Status', cost: -1, target: 'none', fx: {}, unplayable: true }, o));
  junk('stuck', { name: 'Stuck Pipe', art: '🪨', text: () => `Unplayable.`, flavor: 'It is not going anywhere. Neither are you.' });
  junk('malformed', { name: 'Malformed Row', art: '❌', ethereal: true, text: () => `Unplayable. Vanishes at the end of your turn.`, flavor: '"2026-13-45","N/A","null","NULL"' });
  junk('invoice', { name: 'Surprise Invoice', art: '🧾', text: () => `Unplayable. If this is in your hand at the end of your turn, lose 2 HP.`, flavor: 'Someone left a cluster running over the weekend.' });
  junk('sour', { name: 'Sour Gas', art: '☠️', unplayable: false, cost: 1, target: 'self', exhaust: true, text: () => `If this is in your hand at the end of your turn, lose 3 HP. Play to vent it. Exhaust.`, flavor: 'Smells like eggs. Then smells like nothing. That is the bad part.' });
  junk('second_guess', { name: 'Second-Guess', art: '🌀', ethereal: true, text: () => `Unplayable. Vanishes at the end of your turn.`, flavor: 'Did you close the garage door?' });

  PZ.CARDS = C;

  // ---------- Enemies ----------
  // move: { acts: [ {atk, hits}, {block}, {self:{}}, {player:{}}, {junk, n, to}, {drain} ], label }
  const E = {};
  const enemy = (id, o) => { o.id = id; E[id] = o; };
  const atk = (n, hits) => ({ atk: n, hits: hits || 1 });

  // ACT 1 — Gulf Coast Sediments
  enemy('mosquito', { name: 'Mosquito Swarm', art: '🦟', hp: [13, 17], unrest: 10, ally: 'a_mosquito', ai: 'random',
    moves: [{ acts: [atk(2, 3)] }, { acts: [atk(5), { player: { Weak: 1 } }] }] });
  enemy('fire_ants', { name: 'Fire Ant Mound', art: '🐜', hp: [16, 20], unrest: 12, ally: 'a_ants', ai: 'random',
    moves: [{ acts: [atk(6)] }, { acts: [atk(3), { player: { Exposed: 1 } }] }] });
  enemy('shallow_gas', { name: 'Shallow Gas Pocket', art: '💨', hp: [20, 24], unrest: 15, ally: 'a_gas', ai: 'cycle',
    moves: [{ acts: [atk(7)] }, { acts: [{ block: 5 }, { self: { Torque: 1 } }], label: 'Pressure builds' }] });
  enemy('stuck_pipe', { name: 'Stuck Pipe', art: '⛓️', hp: [28, 32], unrest: 20, ally: 'a_pipe', ai: 'cycle',
    moves: [{ acts: [{ block: 8 }, { junk: 'stuck', n: 1, to: 'discard' }] }, { acts: [atk(9)] }, { acts: [atk(5), { block: 4 }] }] });
  enemy('null_gremlin', { name: 'Null Gremlin', art: '👾', hp: [17, 21], unrest: 12, ally: 'a_null', ai: 'cycle',
    moves: [{ acts: [atk(3, 2)] }, { acts: [atk(3), { player: { Weak: 2 } }] }] });
  enemy('schema_drift', { name: 'Schema Drift', art: '🦎', hp: [24, 28], unrest: 18, ally: 'a_schema', ai: 'cycle',
    moves: [{ acts: [atk(7)] }, { acts: [{ junk: 'malformed', n: 2, to: 'draw' }] }, { acts: [atk(4), { block: 4 }] }] });
  enemy('etl_hydra', { name: 'Legacy ETL Hydra', art: '🐉', hp: [62, 66], unrest: 46, ally: 'a_hydra', ai: 'cycle', elite: true,
    moves: [{ acts: [atk(6, 2)] }, { acts: [{ self: { Torque: 2 } }, { block: 8 }], label: 'Grows another head' }, { acts: [atk(14)] }] });
  enemy('hurricane', { name: 'Hurricane (Cat 1)', art: '🌀', hp: [56, 60], unrest: 40, ally: 'a_hurricane', ai: 'cycle', elite: true,
    moves: [{ acts: [atk(4, 3)] }, { acts: [{ player: { Weak: 2, Exposed: 2 } }], label: 'Eye wall' }, { acts: [atk(16)] }] });
  enemy('data_swamp', { name: 'The Data Swamp', art: '🐊', hp: [108, 108], unrest: 80, ally: 'a_swamp', ai: 'cycle', boss: true,
    moves: [{ acts: [{ junk: 'malformed', n: 3, to: 'draw' }, { block: 10 }], label: 'Dumps raw files' }, { acts: [atk(8, 2)] },
      { acts: [{ self: { Torque: 2 } }], label: 'Undocumented growth' }, { acts: [atk(18)] }, { acts: [atk(6), { junk: 'stuck', n: 1, to: 'discard' }] }] });

  // ACT 2 — The Salt Dome
  enemy('salt_creep', { name: 'Salt Creep', art: '🧂', hp: [42, 46], unrest: 30, ally: 'a_salt', ai: 'cycle',
    moves: [{ acts: [{ block: 12 }] }, { acts: [atk(11)] }, { acts: [atk(6), { player: { Exposed: 1 } }] }] });
  enemy('lost_circ', { name: 'Lost Circulation', art: '🕳️', hp: [36, 40], unrest: 26, ally: 'a_circ', ai: 'cycle',
    moves: [{ acts: [atk(9), { player: { Drained: 1 } }], label: 'Swallows your mud' }, { acts: [atk(12)] }] });
  enemy('h2s', { name: 'H₂S Wraith', art: '👻', hp: [34, 38], unrest: 28, ally: 'a_h2s', ai: 'cycle',
    moves: [{ acts: [{ junk: 'sour', n: 1, to: 'discard' }, atk(4)] }, { acts: [atk(10)] }, { acts: [atk(4, 2)] }] });
  enemy('spreadsheet', { name: 'Spreadsheet Golem', art: '📊', hp: [48, 52], unrest: 34, ally: 'a_sheet', ai: 'cycle',
    moves: [{ acts: [atk(13)] }, { acts: [{ block: 14 }, { self: { Torque: 2 } }], label: 'Adds a VLOOKUP' }, { acts: [atk(5, 3)] }] });
  enemy('shadow_it', { name: 'Shadow IT', art: '🕶️', hp: [30, 34], unrest: 22, ally: 'a_shadow', ai: 'cycle',
    moves: [{ acts: [atk(8), { player: { Weak: 1 } }] }, { acts: [{ junk: 'invoice', n: 1, to: 'discard' }, { block: 6 }] }, { acts: [atk(12)] }] });
  enemy('monolith', { name: 'The Monolith Warehouse', art: '🏢', hp: [108, 112], unrest: 78, ally: 'a_monolith', ai: 'cycle', elite: true,
    moves: [{ acts: [{ block: 20 }] }, { acts: [atk(22)] }, { acts: [atk(8, 3)] }, { acts: [{ self: { Torque: 3 } }], label: 'Nightly batch' }] });
  enemy('scope_creep', { name: 'Scope Creep', art: '📋', hp: [94, 98], unrest: 68, ally: 'a_scope', ai: 'cycle', elite: true,
    moves: [{ acts: [atk(10), { self: { Torque: 2 } }], label: '"One small thing…"' }, { acts: [atk(10), { self: { Torque: 2 } }], label: '"While you\'re in there…"' }, { acts: [{ junk: 'invoice', n: 2, to: 'discard' }] }] });
  enemy('blowout', { name: 'The Blowout', art: '🌋', hp: [185, 185], unrest: 135, ally: 'a_blowout', ai: 'cycle', boss: true,
    moves: [{ acts: [atk(10, 2)] }, { acts: [{ block: 20 }, { self: { Torque: 3 } }], label: 'Pressure builds' }, { acts: [atk(30)], label: 'GUSH' },
      { acts: [{ junk: 'sour', n: 2, to: 'discard' }, atk(6)] }, { acts: [{ player: { Exposed: 2, Weak: 2 } }], label: 'Kick!' }] });

  // ACT 3 — The Pay Zone
  enemy('pressure_wave', { name: 'Pressure Wave', art: '🌊', hp: [55, 60], unrest: 40, ally: 'a_wave', ai: 'cycle',
    moves: [{ acts: [atk(16)] }, { acts: [atk(7, 2)] }, { acts: [{ block: 15 }] }] });
  enemy('inner_critic', { name: 'The Inner Critic', art: '🪞', hp: [48, 52], unrest: 24, ally: 'a_critic', ai: 'cycle',
    moves: [{ acts: [{ player: { Weak: 2 } }, { junk: 'second_guess', n: 2, to: 'draw' }], label: '"That was sloppy."' }, { acts: [atk(14)] }] });
  enemy('perfectionism', { name: 'Perfectionism', art: '💠', hp: [58, 62], unrest: 38, ally: 'a_perfect', ai: 'cycle',
    moves: [{ acts: [{ block: 18 }, { self: { Torque: 2 } }], label: 'One more revision' }, { acts: [atk(18)] }] });
  enemy('doubt', { name: 'Creeping Doubt', art: '🌫️', hp: [45, 50], unrest: 30, ally: 'a_doubt', ai: 'cycle',
    moves: [{ acts: [{ junk: 'second_guess', n: 2, to: 'draw' }, atk(5)] }, { acts: [atk(11), { player: { Exposed: 1 } }] }] });
  enemy('kick', { name: 'Gas Kick', art: '🫧', hp: [52, 56], unrest: 38, ally: 'a_kick', ai: 'cycle',
    moves: [{ acts: [atk(5, 4)] }, { acts: [{ self: { Torque: 3 } }], label: 'Pit gain' }, { acts: [atk(20)] }] });
  enemy('burnout', { name: 'Burnout', art: '🔥', hp: [148, 152], unrest: 96, ally: 'a_burnout', ai: 'cycle', elite: true,
    moves: [{ acts: [atk(12, 2)] }, { acts: [{ player: { Weak: 2, Drained: 1 } }, atk(6)], label: 'One more late night' }, { acts: [atk(30)] }] });
  enemy('quarterly', { name: 'The Quarterly Number', art: '📉', hp: [158, 162], unrest: 108, ally: 'a_quarterly', ai: 'cycle', elite: true,
    moves: [{ acts: [atk(25)] }, { acts: [{ block: 25 }, { self: { Torque: 4 } }], label: 'Forecast call' }, { acts: [atk(9, 3)] }] });
  enemy('finite_game', { name: 'The Finite Game', art: '♟️', hp: [300, 300], unrest: 215, ally: 'a_finite', ai: 'cycle', boss: true,
    moves: [{ acts: [atk(14, 2)] }, { acts: [{ self: { Torque: 4 } }, { block: 25 }], label: 'Raises the stakes' }, { acts: [atk(44)], label: 'Winner takes all' },
      { acts: [{ junk: 'second_guess', n: 3, to: 'draw' }, { player: { Weak: 2, Exposed: 2 } }], label: 'Sets the rules' }, { acts: [atk(10, 3)] }] });

  PZ.ENEMIES = E;

  // ---------- Acts & Encounters ----------
  PZ.ACTS = [
    { name: 'Gulf Coast Sediments', short: 'Sediments', depth0: 0, colors: ['#c9a36b', '#b58a55', '#9c7446', '#8a6a44', '#7a5c3a'],
      easy: [['mosquito'], ['fire_ants'], ['null_gremlin'], ['shallow_gas']],
      hard: [['stuck_pipe'], ['schema_drift', 'mosquito'], ['fire_ants', 'null_gremlin'], ['shallow_gas', 'fire_ants'], ['mosquito', 'mosquito', 'fire_ants'], ['schema_drift', 'null_gremlin']],
      elites: [['etl_hydra'], ['hurricane']], boss: 'data_swamp' },
    { name: 'The Salt Dome', short: 'Salt Dome', depth0: 3500, colors: ['#8d8f93', '#a7a9ad', '#c8cacd', '#9ea3a8', '#7d8187'],
      easy: [['salt_creep'], ['lost_circ'], ['h2s']],
      hard: [['spreadsheet'], ['shadow_it', 'h2s'], ['salt_creep', 'shadow_it'], ['lost_circ', 'h2s'], ['spreadsheet', 'shadow_it']],
      elites: [['monolith'], ['scope_creep']], boss: 'blowout' },
    { name: 'The Pay Zone', short: 'Pay Zone', depth0: 8000, colors: ['#4a3a2a', '#3d2f22', '#57412b', '#2f261d', '#6b4e2f'],
      easy: [['pressure_wave'], ['inner_critic'], ['doubt']],
      hard: [['perfectionism'], ['kick'], ['inner_critic', 'doubt'], ['pressure_wave', 'inner_critic'], ['kick', 'doubt']],
      elites: [['burnout'], ['quarterly']], boss: 'finite_game' },
  ];

  // ---------- Relics (Keepsakes) ----------
  PZ.RELICS = {
    mutt: { name: 'Loyal Mutt', art: '🐕', text: 'At the start of each combat, gain 8 Block. Good boy.', companion: true },
    tabby: { name: 'Orange Tabby', art: '🐈', text: 'On your first turn of each combat, gain 1 Energy and draw 1 extra card. Then she naps.', companion: true },
    guinea: { name: 'Guinea Pig Pair', art: '🐹', text: 'Whenever you Reconcile an enemy, heal 5 HP. Wheek wheek!', companion: true },
    lenses: { name: 'Progressive Lenses', art: '👓', text: 'See each enemy\'s next two moves. Find the sweet spot.' },
    skimmer: { name: 'Pool Skimmer', art: '🏊', text: 'Heal 5 HP after each combat.' },
    deckbox: { name: 'Commander Deck Box', art: '🗃️', text: 'At the start of each combat, add a random Rare card to your hand. It costs 0 this turn.' },
    hymnal: { name: 'Hymnal', art: '📖', text: 'Start each combat with 1 Flow.' },
    hook: { name: 'Size-H Crochet Hook', art: '🪝', text: 'Start each combat with 1 Stitches.' },
    collar: { name: 'Drill Collar', art: '🛢️', text: 'Start each combat with 1 Torque.' },
    pick: { name: 'Guitar Pick', art: '🎸', text: 'Every 3rd card you play each turn applies 3 Harmony to ALL enemies.' },
    radio: { name: 'Weather Radio', art: '📻', text: 'Enemies start each combat with 1 Weak.' },
    lei: { name: 'Hawaiian Lei', art: '🌺', text: 'Resting at the pool heals 15 more HP.' },
    buffet: { name: 'Cruise Buffet Pass', art: '🍤', text: 'Card rewards offer 1 more choice.' },
    brisket: { name: 'Texas Brisket', art: '🍖', text: 'Raise your Max HP by 10 when you pick this up.' },
    binder: { name: 'Nine-Pocket Binder', art: '📒', text: 'Keep 2 cards from each booster pack instead of 1.' },
    core: { name: 'Core Sample', art: '🪨', text: 'Whenever you shuffle your draw pile, gain 5 Block.' },
    interlinear: { name: 'Interlinear Bible', art: '📜', text: 'At the end of your turn, apply 2 Harmony to ALL enemies for each unspent Energy.' },
    keyboard: { name: 'Mechanical Keyboard', art: '⌨️', text: 'Whenever you play a Power, draw 2 cards.' },
    // boss relics
    switch2: { name: 'Switch 2', art: '🎮', text: 'Gain 1 Energy at the start of each turn. Co-op mode unlocked.', boss: true },
    monovision: { name: 'Monovision', art: '👁️', text: 'Gain 1 Energy each turn. Enemy intent numbers are a little blurry.', boss: true },
    porch: { name: 'Porch Chair', art: '🪑', text: 'Gain 1 Energy each turn. Rest stops no longer offer Practice (upgrade).', boss: true },
  };
  PZ.COMPANIONS = ['mutt', 'tabby', 'guinea'];
  PZ.COMMON_RELICS = ['lenses', 'skimmer', 'deckbox', 'hymnal', 'hook', 'collar', 'pick', 'radio', 'lei', 'buffet', 'brisket', 'core', 'interlinear', 'keyboard'];
  PZ.BOSS_RELICS = ['switch2', 'monovision', 'porch'];

  // ---------- Statuses ----------
  PZ.STATUS = {
    Torque: { icon: '⚙️', desc: 'Attacks deal +N damage per hit.' },
    Stitches: { icon: '🧶', desc: 'Block from cards +N.' },
    Flow: { icon: '🎵', desc: 'Harmony applied +N.' },
    Weak: { icon: '🥀', desc: 'Deals 25% less attack damage. Wears off.', dur: true },
    Exposed: { icon: '🎯', desc: 'Takes 50% more attack damage. Wears off.', dur: true },
    Calm: { icon: '🍃', desc: 'Takes 50% more Harmony. Wears off.', dur: true },
    Buttress: { icon: '⛪', desc: 'Block is kept next turn.' },
    Barricade: { icon: '🏞️', desc: 'Block is never removed at turn start.' },
    Drained: { icon: '🕳️', desc: 'Lose N Energy next turn.' },
    Catalog: { icon: '🗂️', desc: 'Draw N extra cards each turn.' },
    Medallion: { icon: '🥇', desc: 'Gain N Block at the start of each turn.' },
    Infinite: { icon: '♾️', desc: 'Apply N Harmony to ALL enemies at the start of each turn.' },
    Peacemaker: { icon: '🕯️', desc: 'Gain N Block whenever you apply Harmony.' },
  };

  // ---------- Events ----------
  // Each event: title, art, text, choices [{label, desc, run: (api) => resultText}]
  // api methods defined in screens.js
  PZ.EVENTS = [
    { id: 'escalation', title: '2 A.M. Escalation', art: '📱',
      text: 'Your phone buzzes on the nightstand. A big customer\'s nightly pipeline failed. The on-call engineer sounds scared.',
      choices: [
        { label: 'Jump on the call', desc: 'Lose 7 HP. Gain 60 gold and a Lakehouse card.', run: a => { a.loseHp(7); a.gold(60); a.addRandomCard('lake', 'uncommon'); return 'You find the bad join at 3:40. The champion sends a thank-you GIF.'; } },
        { label: 'Write a runbook, then sleep', desc: 'Upgrade 2 random cards.', run: a => { a.upgradeRandom(2); return 'Next time, they will not need you. That is the goal.'; } },
        { label: 'It can wait until morning', desc: 'Heal 10 HP.', run: a => { a.heal(10); return 'It could. It did. Everything is fine.'; } },
      ] },
    { id: 'docent', title: 'The Docent\'s Tour', art: '🏛️',
      text: 'A retired architect runs weekend tours of a Prairie School house. Low roofs. Long windows. She lights up when she sees your sketchbook.',
      choices: [
        { label: 'Take the full tour', desc: 'Pay 30 gold. Gain a random rare Craft card.', cond: a => a.hasGold(30), run: a => { a.gold(-30); a.addRandomCard('craft', 'rare'); return 'She shows you the hidden cantilever. You will think about it for weeks.'; } },
        { label: 'Sit and sketch the facade', desc: 'Gain an upgraded Sketchbook.', run: a => { a.addCard('sketchbook', true); return 'Your horizon line is finally straight.'; } },
        { label: 'Admire it from the car', desc: 'Heal 5 HP.', run: a => { a.heal(5); return 'Still beautiful from the curb.'; } },
      ] },
    { id: 'crochet', title: 'Crochet Circle at the Library', art: '🧶',
      text: 'Six people, six projects, one very opinionated woman named Barb. She looks at your work and says, "Frog it."',
      choices: [
        { label: 'Frog it', desc: 'Remove a card from your deck.', run: a => { a.removeCard(); return 'Barb nods. High praise.'; } },
        { label: 'Learn a new stitch', desc: 'Gain a random Craft card.', run: a => { a.addRandomCard('craft'); return 'Your tension is better already.'; } },
        { label: 'Just chat and stitch', desc: 'Heal 12 HP.', run: a => { a.heal(12); return 'Two hours pass. It felt like twenty minutes.'; } },
      ] },
    { id: 'porch', title: 'Porch Conversation', art: '☕',
      text: 'Your friend, a pastor, pours two coffees. He asks the question you have been writing about: "So why did the cross have to happen?"',
      choices: [
        { label: 'Make your case', desc: 'Gain Leap of Faith.', run: a => { a.addCard('leap'); return 'He pushes back. You push back. Neither of you is angry. Both of you are sharper.'; } },
        { label: 'Mostly listen', desc: 'Heal 12 HP. Upgrade a random Hymn card.', run: a => { a.heal(12); a.upgradeRandom(1, 'hymn'); return 'You learn more than you expected. You usually do.'; } },
        { label: 'Talk about the World Cup instead', desc: 'Gain 35 gold.', run: a => { a.gold(35); return 'Some questions can wait for another pot of coffee.'; } },
      ] },
    { id: 'league', title: 'League Night', art: '⚡',
      text: 'Your son has the Battle Academy box open on the kitchen table. "Dad. One game. Best of one."',
      choices: [
        { label: 'Play him (and let him win)', desc: 'Open a free booster pack.', run: a => { a.freePack(); return 'He wins by one prize card. He will never know. You will never tell.'; } },
        { label: 'Play him for real', desc: '50%: gain a rare card. 50%: lose 6 HP.', run: a => { if (Math.random() < 0.5) { a.addRandomCard(null, 'rare'); return 'You win. He demands a rematch. That is the real prize.'; } a.loseHp(6); return 'He wins fair and square. He reminds you about it for a week.'; } },
        { label: 'Trade cards instead', desc: 'Transform a random card into another card.', run: a => { a.transformRandom(); return 'You both think you got the better deal.'; } },
      ] },
    { id: 'commander', title: 'Commander Pod', art: '🛡️',
      text: 'Four players. Forty life each. Someone says, "My deck is pretty casual." It is not.',
      choices: [
        { label: 'Assemble!', desc: 'Lose 10 HP. Gain a random rare card.', run: a => { a.loseHp(10); a.addRandomCard(null, 'rare'); return 'The table targets you. You still pull off the combo.'; } },
        { label: 'Make a deal with the table', desc: 'Gain a Hymn card and 20 gold.', run: a => { a.addRandomCard('hymn'); a.gold(20); return 'Politics wins games. So does kindness.'; } },
        { label: 'Watch and learn', desc: 'Upgrade 2 random cards.', run: a => { a.upgradeRandom(2); return 'You leave with three new ideas and a card-sleeve recommendation.'; } },
      ] },
    { id: 'vegas', title: 'Five Guys, One Big Arena', art: '🎤',
      text: 'The 90s boy band is back. The lights go down. Twenty thousand people know every word.',
      choices: [
        { label: 'Sing along, loudly', desc: 'Gain Five-Part Harmony. Heal 10 HP.', run: a => { a.addCard('five_part'); a.heal(10); return 'Your voice is gone. Your spirit is not.'; } },
        { label: 'Buy the tour shirt', desc: 'Pay 60 gold. Gain the Guitar Pick keepsake.', cond: a => a.hasGold(60) && !a.hasRelic('pick'), run: a => { a.gold(-60); a.addRelic('pick'); return 'A guitar pick falls out of the bag. Nobody knows why. You keep it.'; } },
        { label: 'Leave early to beat traffic', desc: 'Gain 25 gold.', run: a => { a.gold(25); return 'You beat traffic. You hear the encore from the parking garage.'; } },
      ] },
    { id: 'hurricane', title: 'Cone of Uncertainty', art: '🌪️',
      text: 'The five-day cone runs right over Pearland. The grocery store is out of bread and water.',
      choices: [
        { label: 'Board up and ride it out', desc: 'Lose 8 HP. Gain the Weather Radio keepsake.', cond: a => !a.hasRelic('radio'), run: a => { a.loseHp(8); a.addRelic('radio'); return 'The power is out for three days. The radio never stops talking.'; } },
        { label: 'Evacuate to Austin', desc: 'Pay 40 gold. Heal 20 HP.', cond: a => a.hasGold(40), run: a => { a.gold(-40); a.heal(20); return 'Hotel breakfast. Kids in the pool. It turns north at the last minute.'; } },
        { label: 'Fill the tub, stock the pantry', desc: 'Gain an upgraded Mud Weight Up.', run: a => { a.addCard('mud_weight', true); return 'Prepared is a kind of peace.'; } },
      ] },
    { id: 'signal', title: 'A Signal Among the Stars', art: '🪐',
      text: 'Late-night Switch session. Your ship picks up a strange signal. Portal glyphs glow on the screen.',
      choices: [
        { label: 'Dial the portal', desc: '60%: gain a keepsake. 40%: lose 10 HP.', run: a => { if (Math.random() < 0.6) { a.addRandomRelic(); return 'A new galaxy. And something shiny in the inventory.'; } a.loseHp(10); return 'Toxic rain. Sentinels. You log off.'; } },
        { label: 'Scan the planet', desc: 'Gain 40 gold.', run: a => { a.gold(40); return 'Rare flora. Good units.'; } },
        { label: 'Name the planet after your cat', desc: 'Gain Wildcat Well. Heal 5 HP.', run: a => { a.addCard('wildcat'); a.heal(5); return 'Planet Tabby-9. Mostly orange. Mostly asleep.'; } },
      ] },
    { id: 'cruise', title: 'Formal Night at Sea', art: '🛳️',
      text: 'The ship leans into a warm Caribbean breeze. The kids are already running toward the characters.',
      choices: [
        { label: 'Character breakfast with the kids', desc: 'Heal 15 HP.', run: a => { a.heal(15); return 'Too many pancakes. Perfect morning.'; } },
        { label: 'Hit the midnight buffet', desc: 'Raise Max HP by 6.', run: a => { a.maxHp(6); return 'Shrimp. Then more shrimp.'; } },
        { label: 'Stay for the deck party', desc: 'Gain an upgraded Ambient Jazz.', run: a => { a.addCard('ambient_jazz', true); return 'A trio plays under the stars. Nobody wants to go inside.'; } },
      ] },
    { id: 'verse', title: 'The Hard Verse', art: '📜',
      text: 'You are translating late at night. One Greek word has no clean English match. Every choice loses something.',
      choices: [
        { label: 'Stay close to the words', desc: 'Upgrade a random card twice over (2 upgrades).', run: a => { a.upgradeRandom(2); return 'Clunky, but honest. You can smooth it later.'; } },
        { label: 'Stay close to the meaning', desc: 'Gain the Interlinear Bible keepsake.', cond: a => !a.hasRelic('interlinear'), run: a => { a.addRelic('interlinear'); return 'Faithful, not wooden. You sleep well.'; } },
        { label: 'Write a footnote', desc: 'Gain a random Hymn card.', run: a => { a.addRandomCard('hymn'); return 'Footnotes: where translators tell the truth.'; } },
      ] },
    { id: 'seismic', title: 'Bright Spot', art: '📡',
      text: 'The 3D seismic survey shows a bright spot. It could be gas. It could be nothing.',
      choices: [
        { label: 'Drill it', desc: '50%: gain 100 gold. 50%: dry hole, lose 10 HP.', run: a => { if (Math.random() < 0.5) { a.gold(100); return 'Pay dirt. The office brings in kolaches.'; } a.loseHp(10); return 'Dry hole. It happens to everyone. It still stings.'; } },
        { label: 'Order more data', desc: 'Pay 25 gold. Gain an upgraded Photon Query.', cond: a => a.hasGold(25), run: a => { a.gold(-25); a.addCard('photon', true); return 'Better data. Better decisions. Slightly smaller budget.'; } },
        { label: 'Pass on it', desc: 'Nothing happens.', run: a => 'Someone else drills it. You read about it later. You feel fine.' },
      ] },
  ];

  PZ.NODE_TYPES = {
    battle: { icon: '⚒️', name: 'Hazard' },
    elite: { icon: '⚠️', name: 'Major Hazard' },
    rest: { icon: '🏊', name: 'Backyard Pool' },
    shop: { icon: '🃏', name: 'Game Store' },
    event: { icon: '❓', name: 'Unknown' },
    treasure: { icon: '🪨', name: 'Core Sample' },
    boss: { icon: '💀', name: 'Boss' },
  };
})(window.PZ);
