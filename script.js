(() => {
'use strict';
/* ============================== constants ============================== */
const N = 26, HW = 48, HH = 24, OUT = '#5a3b22';
const ITEMS = {
  wheat:{e:'🌾',n:'Wheat',v:3,lvl:1}, corn:{e:'🌽',n:'Corn',v:7,lvl:2}, pumpkin:{e:'🎃',n:'Pumpkin',v:14,lvl:3},
  egg:{e:'🥚',n:'Egg',v:6,lvl:1}, milk:{e:'🥛',n:'Milk',v:10,lvl:1}, feed:{e:'🥣',n:'Feed',v:4,lvl:1},
  apple:{e:'🍎',n:'Apple',v:6,lvl:2}, fish:{e:'🐟',n:'Fish',v:9,lvl:2}, honey:{e:'🍯',n:'Honey',v:13,lvl:3},
  wool:{e:'🧶',n:'Wool',v:12,lvl:4}, bacon:{e:'🥓',n:'Bacon',v:18,lvl:5},
  bread:{e:'🍞',n:'Bread',v:15,lvl:1}, pie:{e:'🥧',n:'Pumpkin Pie',v:40,lvl:3}, butter:{e:'🧈',n:'Butter',v:18,lvl:3}, cheese:{e:'🧀',n:'Cheese',v:26,lvl:3},
  juice:{e:'🧃',n:'Apple Juice',v:22,lvl:2}, candy:{e:'🍬',n:'Honey Candy',v:20,lvl:4}, scarf:{e:'🧣',n:'Scarf',v:44,lvl:4}, cake:{e:'🍰',n:'Cake',v:60,lvl:4}
};
const CROPS = {
  wheat:  {cost:2,  time:8,  xp:2, lvl:1},
  corn:   {cost:5,  time:16, xp:4, lvl:2},
  pumpkin:{cost:10, time:28, xp:8, lvl:3}
};
const RECIPES = {
  mill:[
    {out:'feed', n:2, inp:{wheat:1},  time:6,  lvl:1},
    {out:'feed', n:4, inp:{corn:1},   time:10, lvl:2}
  ],
  bakery:[
    {out:'bread',n:1, inp:{wheat:2},  time:12, lvl:1},
    {out:'pie',  n:1, inp:{pumpkin:1,wheat:1}, time:25, lvl:3},
    {out:'cake', n:1, inp:{wheat:2,egg:1,milk:1}, time:40, lvl:4}
  ],
  kitchen:[
    {out:'juice',n:1, inp:{apple:2},  time:15, lvl:2},
    {out:'candy',n:2, inp:{honey:1},  time:20, lvl:4}
  ],
  dairy:[
    {out:'butter',n:1, inp:{milk:1},  time:10, lvl:3},
    {out:'cheese',n:1, inp:{milk:2},  time:22, lvl:3}
  ],
  loom:[
    {out:'scarf', n:1, inp:{wool:2},  time:30, lvl:4}
  ]
};
const MACHS = ['mill','bakery','kitchen','dairy','loom'];
const MACH_NAME = {mill:'Feed Mill', bakery:'Bakery', kitchen:'Jam Kitchen', dairy:'Dairy', loom:'Weaving Loom'};
const MACH_ICON = {mill:'⚙️', bakery:'🥖', kitchen:'🍹', dairy:'🧀', loom:'🧵'};
const MACH_LVL = {mill:1, bakery:1, kitchen:2, dairy:3, loom:4};
const PENS = {
  chick:{name:'Chicken Coop', prod:'egg',  count:4, time:14},
  cow:  {name:'Cow Pasture',  prod:'milk', count:2, time:22},
  sheep:{name:'Sheep Meadow', prod:'wool', count:3, time:18, lvl:4},
  pig:  {name:'Pig Sty',      prod:'bacon',count:2, time:26, lvl:5}
};
const BLD = {
  barn:  {i:9, j:1, w:3, d:2, h:80},
  silo:  {i:12,j:2, w:1, d:1, h:130},
  mill:  {i:4, j:2, w:2, d:2, h:70},
  bakery:{i:6, j:2, w:2, d:2, h:80},
  dairy: {i:14,j:2, w:2, d:2, h:75},
  loom:  {i:17,j:2, w:2, d:2, h:75},
  kitchen:{i:20,j:2,w:2, d:2, h:80},
  windmill:{i:23,j:1,w:2,d:2, h:150},
  board: {i:10,j:4, w:1, d:1, h:56},
  chick: {i:9, j:7, w:3, d:2, h:24},
  cow:   {i:9, j:10,w:3, d:3, h:24},
  sheep: {i:12,j:7, w:2, d:3, h:24},
  pig:   {i:14,j:7, w:3, d:3, h:24}
};
const PLOT_COLS = [3,4,5,6], PLOT_ROWS = [8,9,10,13,14,15];
const PLOT_SLOTS = [];
PLOT_ROWS.forEach(j => PLOT_COLS.forEach(i => PLOT_SLOTS.push({i,j})));
const START_PLOTS = 6;
/* collectable spots: orchard trees, beehives, fishing pond */
const NODE_DEF = {
  apple:{time:70, lvl:2, out:'apple', n:2, xp:3},
  hive: {time:50, lvl:3, out:'honey', n:1, xp:4},
  fish: {time:30, lvl:2, out:'fish',  n:1, xp:2}
};
const NODE_NAME = {apple:'Apple Orchard', hive:'Beehive', fish:'Fishing Pond'};
const NODES = [];
[[19,7],[21,7],[23,7],[19,10],[21,10],[23,10]].forEach(([i,j],k) => NODES.push({id:'a'+k, type:'apple', i, j, w:1, d:1, h:100}));
[[14,12],[15,12],[16,12]].forEach(([i,j],k) => NODES.push({id:'h'+k, type:'hive', i, j, w:1, d:1, h:34}));
NODES.push({id:'f0', type:'fish', i:19, j:13, w:3, d:3, h:20});
const QT = {
  harvest:{t:'Harvest crops', e:'🌾', u:4}, deliver:{t:'Deliver orders', e:'🚚', u:1},
  collect:{t:'Collect animal & farm goods', e:'🧺', u:2}, make:{t:'Make goods in buildings', e:'⚙️', u:2}
};

/* ============================== helpers ============================== */
const $ = id => document.getElementById(id);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const now = () => Date.now();
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shade(hex, f){
  const n = parseInt(hex.slice(1), 16);
  const r = clamp(Math.round((n >> 16) * f), 0, 255), g = clamp(Math.round((n >> 8 & 255) * f), 0, 255), b = clamp(Math.round((n & 255) * f), 0, 255);
  return `rgb(${r},${g},${b})`;
}
const P = (x, y, z = 0) => [(x - y) * HW, (x + y) * HH - z];

/* ============================== state ============================== */
const SAVE_KEY = 'farm-house-save-v1';
function freshState(){
  return {
    coins:120, gems:5, xp:0, level:1, seed:'wheat', fert:2, mute:false,
    inv:{wheat:4, corn:0, pumpkin:0, egg:0, milk:0, feed:3, bread:0, pie:0},
    plots:PLOT_SLOTS.map(() => null), unlocked:START_PLOTS,
    mach:{mill:{q:[], t0:0}, bakery:{q:[], t0:0}, kitchen:{q:[], t0:0}, dairy:{q:[], t0:0}, loom:{q:[], t0:0}},
    pens:{chick:{st:'hungry', t0:0}, cow:{st:'hungry', t0:0}, sheep:{st:'hungry', t0:0}, pig:{st:'hungry', t0:0}},
    nodes:{}, stats:{harvest:0, deliver:0, collect:0, make:0}, quests:[],
    orders:[]
  };
}
let S = freshState();
try {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    const o = JSON.parse(raw), f = freshState();
    S = Object.assign(f, o);
    S.inv = Object.assign(freshState().inv, o.inv); S.pens = Object.assign(freshState().pens, o.pens); S.mach = Object.assign(freshState().mach, o.mach);
    S.stats = Object.assign(freshState().stats, o.stats); S.nodes = o.nodes || {};
    while (S.plots.length < PLOT_SLOTS.length) S.plots.push(null);
  }
} catch (e) {}
function save(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
const xpNeed = lv => 20 + lv * 15;

/* ============================== world layout ============================== */
const riverC = j => 1.4 + Math.sin(j * 0.55) * 0.6;
const inPond = (i, j) => ((i + .5 - 20.5) / 3) ** 2 + ((j + .5 - 14.5) / 2.6) ** 2 < 1;
const isWater = (i, j) => i >= 0 && j >= 0 && i < N && j < N && (Math.abs(i + .5 - riverC(j + .5)) < 0.95 || inPond(i, j));
const occ = Array.from({length:N}, () => Array(N).fill(0));   // 1 = building / plot / pen, 2 = path, 3 = water
const noTree = Array.from({length:N}, () => Array(N).fill(false));
function mark(i, j, w, d, v, pad = 0){
  for (let a = i - pad; a < i + w + pad; a++) for (let b = j - pad; b < j + d + pad; b++){
    if (a < 0 || b < 0 || a >= N || b >= N) continue;
    noTree[a][b] = true;
    if (v && a >= i && a < i + w && b >= j && b < j + d) occ[a][b] = occ[a][b] || v;
  }
}
Object.values(BLD).forEach(b => mark(b.i, b.j, b.w, b.d, 1, 1));
PLOT_SLOTS.forEach(p => mark(p.i, p.j, 1, 1, 1, 1));
NODES.forEach(n => mark(n.i, n.j, n.w, n.d, n.type === 'fish' ? 0 : 1, 1));
mark(16, 12, 4, 4, 0, 0);
function pathTile(i, j){
  if (j === 5 && i >= 3) return true;
  if (i === 8 && j >= 4 && j <= 22) return true;
  if (j === 4 && i >= 4 && i <= 8) return true;
  if (i === 3 && j >= 5 && j <= 7) return true;
  if (i === 17 && j >= 5 && j <= 14) return true;
  if (j === 9 && i >= 17 && i <= 24) return true;
  if (j === 13 && i >= 8 && i <= 17) return true;
  return false;
}
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (pathTile(i, j) && !occ[i][j]) { occ[i][j] = 2; noTree[i][j] = true; }
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (isWater(i, j)) { occ[i][j] = 3; noTree[i][j] = true; }

/* ---- decorations (seeded) ---- */
const R = rng(7);
const decor = [];     // {k:'tree'|'apple'|'bush'|'flower'|'rock'|'hay'|..., i, j, ox, oy, s}
const tufts = {};     // per-tile grass blades
for (let i = -7; i < N + 7; i++) for (let j = -7; j < N + 7; j++){
  const inside = i >= 0 && j >= 0 && i < N && j < N;
  const r = R(), r2 = R(), r3 = R();
  tufts[i + ',' + j] = [[r, r2], [r2, r3]];
  if ((j >= 3 && j <= 6 && i >= 9) || (i <= 2 && j >= 6 && j <= 8)) continue;   // keep the truck lane and bridge clear
  if (inside){
    if (occ[i][j] || noTree[i][j]) { if (!occ[i][j] && r3 < .08 && !pathTile(i, j) && !isWater(i, j)) decor.push({k:'flower', i, j, ox:r, oy:r2, s:r3}); continue; }
    const edge = (i <= 2 || j >= N - 2 || i >= N - 2 || j <= 1);
    if (r < (edge ? .10 : .025)) decor.push({k: r2 < .25 ? 'apple' : 'tree', i, j, ox:.5, oy:.5, s:r3});
    else if (r < (edge ? .17 : .05)) decor.push({k:'bush', i, j, ox:.5, oy:.5, s:r3});
    else if (r < .34) decor.push({k:'flower', i, j, ox:r2, oy:r3, s:r});
    else if (r < .355) decor.push({k:'rock', i, j, ox:.5, oy:.5, s:r3});
  } else {
    const dist = Math.max(-i, -j, i - N + 1, j - N + 1);
    if (dist >= 2 && r < .42) decor.push({k: r2 < .2 ? 'apple' : 'tree', i, j, ox:.3 + r3 * .4, oy:.3 + r * .4, s:r3 + .2});
  }
}
decor.push({k:'hay', i:11, j:3, ox:.3, oy:.6, s:0}, {k:'hay', i:12, j:3, ox:.2, oy:.2, s:1},
  {k:'scarecrow', i:7, j:9, ox:.5, oy:.5, s:0}, {k:'scarecrow', i:7, j:14, ox:.5, oy:.5, s:0},
  {k:'well', i:7, j:6, ox:.5, oy:.5, s:0}, {k:'fsign', i:4, j:6, ox:.5, oy:.5, s:0}, {k:'hay', i:18, j:6, ox:.4, oy:.4, s:1});
const LAMPS = [[3.5, 4.55], [7.5, 5.55], [8.55, 3.6], [8.55, 9.2], [8.55, 12.2], [13.2, 4.4], [14.5, 4.55], [19.5, 4.55], [24.4, 4.5], [17.55, 8.4], [12.5, 13.6], [8.55, 19.2], [17.55, 12.4]];
LAMPS.forEach(([x, y]) => decor.push({k:'lamp', i:x, j:y, ox:0, oy:0, s:0}));

/* ============================== orders / truck ============================== */
function orderPool(){ return Object.keys(ITEMS).filter(t => ITEMS[t].lvl <= S.level); }
function newOrder(){
  const pool = orderPool().slice(), items = {};
  const kinds = 1 + Math.floor(Math.random() * 3);
  let value = 0;
  for (let k = 0; k < kinds && pool.length; k++){
    const t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const max = ITEMS[t].v >= 14 ? 2 : 3;
    const q = 1 + Math.floor(Math.random() * max);
    items[t] = q; value += q * ITEMS[t].v;
  }
  return {items, coins:Math.round(value * 1.5), xp:Math.max(3, Math.round(value / 2)), gems: Math.random() < .2 ? 1 : 0};
}
while (S.orders.length < 3) S.orders.push(newOrder());
function newQuest(avoid = []){
  const types = Object.keys(QT).filter(t => !avoid.includes(t)), type = types[Math.floor(Math.random() * types.length)];
  const n = QT[type].u * (1 + Math.floor(Math.random() * 2)) * (1 + Math.floor(S.level / 4)), per = {harvest:8, deliver:70, collect:14, make:20}[type];
  return {type, n, base:S.stats[type], coins:n * per, xp:n * (type === 'deliver' ? 12 : 4), gems:type === 'deliver' ? 1 : 0};
}
while (S.quests.length < 3) S.quests.push(newQuest(S.quests.map(q => q.type)));
const qProg = q => clamp(S.stats[q.type] - q.base, 0, q.n);
const questsReady = () => S.quests.some(q => qProg(q) >= q.n);
const truck = {i:11.6, phase:'idle', wait:0, loaded:false};

/* ============================== animals ============================== */
const animals = [];
Object.entries(PENS).forEach(([id, p]) => {
  const b = BLD[id];
  for (let k = 0; k < p.count; k++){
    const x = b.i + .6 + Math.random() * (b.w - 1.2), y = b.j + .6 + Math.random() * (b.d - 1.2);
    animals.push({pen:id, x, y, tx:x, ty:y, wait:Math.random() * 2, dir:1, ph:Math.random() * 6, moving:false});
  }
});
const dog = {x:7.5, y:5.5, tx:7.5, ty:5.5, wait:1, dir:1, moving:false, bark:0};
const pathList = []; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (occ[i][j] === 2) pathList.push([i, j]);
const ducks = [{y:3, v:.35, off:-.25}, {y:6.5, v:-.28, off:.3}, {y:10, v:.3, off:0}, {y:14, v:-.32, off:.2}, {y:18, v:.3, off:-.2}, {y:22, v:-.26, off:.1}];
const flies = Array.from({length:10}, (_, k) => ({x:4 + (k * 5.3 % 20), y:6 + (k * 7.1 % 18), ph:k * 2.1}));
let NIGHT = 0, RAIN = 0;
function updateDog(dt){
  dog.bark = Math.max(0, dog.bark - dt);
  if (dog.wait > 0){ dog.wait -= dt; dog.moving = false; if (dog.wait <= 0){ const t = pathList[Math.floor(Math.random() * pathList.length)]; dog.tx = t[0] + .3 + Math.random() * .4; dog.ty = t[1] + .3 + Math.random() * .4; } return; }
  const dx = dog.tx - dog.x, dy = dog.ty - dog.y, dist = Math.hypot(dx, dy);
  if (dist < .08){ dog.wait = 1 + Math.random() * 4; return; }
  dog.moving = true; dog.x += dx / dist * 1.7 * dt; dog.y += dy / dist * 1.7 * dt;
  if (Math.abs(dx - dy) > .02) dog.dir = (dx - dy) >= 0 ? 1 : -1;
}
function updateAnimals(dt){
  updateDog(dt);
  ducks.forEach(du => { du.y += du.v * dt; if (du.y > N - 1.5 || du.y < .5) du.v = -du.v; });
  animals.forEach(a => {
    const b = BLD[a.pen], sp = a.pen === 'chick' ? .9 : .45;
    if (a.wait > 0){ a.wait -= dt; a.moving = false; if (a.wait <= 0){ a.tx = b.i + .55 + Math.random() * (b.w - 1.1); a.ty = b.j + .55 + Math.random() * (b.d - 1.1); } return; }
    const dx = a.tx - a.x, dy = a.ty - a.y, dist = Math.hypot(dx, dy);
    if (dist < .05){ a.wait = .6 + Math.random() * 3; return; }
    a.moving = true;
    a.x += dx / dist * sp * dt; a.y += dy / dist * sp * dt;
    if (Math.abs(dx - dy) > .02) a.dir = (dx - dy) >= 0 ? 1 : -1;   // screen x ∝ (x - y)
  });
}

/* ============================== game logic ============================== */
const toastEl = $('toast'); let toastT;
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 1800); }
const floats = [], parts = [];
function floatText(wx, wy, txt, col = '#fff'){ floats.push({x:wx, y:wy, txt, col, t:0}); }
function burst(wx, wy, cols, n = 10){
  for (let k = 0; k < n; k++) parts.push({x:wx, y:wy, vx:(Math.random() - .5) * 140, vy:-60 - Math.random() * 120, t:0, life:.7 + Math.random() * .4, c:cols[k % cols.length], r:2 + Math.random() * 3});
}
function addXP(n, wx, wy){
  S.xp += n;
  while (S.xp >= xpNeed(S.level)){
    S.xp -= xpNeed(S.level); S.level++; S.gems += 2; S.coins += 25;
    toast(`⭐ Level ${S.level}! +2 💎 +25 💰`); sfx('level');
  }
}
let AC = null;
function sfx(n){
  if (S.mute) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
    const seq = {pop:[[660,.06],[880,.08]], plant:[[300,.05],[380,.06]], coin:[[988,.07],[1319,.14]], level:[[523,.1],[659,.1],[784,.1],[1047,.28]], ding:[[880,.12]], woof:[[190,.07],[150,.1]], err:[[200,.14]], horn:[[220,.18],[260,.25]]}[n] || [];
    let t = AC.currentTime;
    seq.forEach(([f, d]) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = n === 'woof' || n === 'horn' ? 'sawtooth' : 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(.07, t); g.gain.exponentialRampToValueAtTime(.001, t + d + .05); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .06); t += d; });
  } catch (e) {}
}
const add = (t, n) => { S.inv[t] = (S.inv[t] || 0) + n; };
const canAfford = inp => Object.entries(inp).every(([k, v]) => (S.inv[k] || 0) >= v);

function tapPlot(k, silent){
  const p = PLOT_SLOTS[k];
  const wx = P(p.i + .5, p.j + .5)[0], wy = P(p.i + .5, p.j + .5)[1];
  if (k >= S.unlocked){
    if (k !== S.unlocked || silent) return;
    const cost = unlockCost();
    if (S.coins < cost) return toast(`Need ${cost} 💰 to unlock this plot`);
    S.coins -= cost; S.unlocked++; burst(wx, wy, ['#ffd23f','#fff'], 12); toast('New plot unlocked!'); return;
  }
  const c = S.plots[k];
  if (S.seed === 'fert' && c && now() - c.t0 < CROPS[c.crop].time * 1000){
    if (S.fert < 1) return silent || toast('No fertilizer — buy some in the Shop 🧪');
    S.fert--; c.t0 = now() - CROPS[c.crop].time * 1000; burst(wx, wy - 10, ['#b78cff','#fff','#9ef56a'], 10); sfx('pop'); return;
  }
  if (!c){
    if (S.seed === 'fert') return silent || toast('Pick a seed to plant first');
    const def = CROPS[S.seed];
    if (S.level < def.lvl) return silent || toast(`${ITEMS[S.seed].n} unlocks at level ${def.lvl}`);
    if (S.coins < def.cost) return silent || toast('Not enough coins');
    S.coins -= def.cost; S.plots[k] = {crop:S.seed, t0:now()};
    burst(wx, wy, ['#8a5a34','#6b4226'], 6); sfx('plant');
  } else if (now() - c.t0 >= CROPS[c.crop].time * 1000){
    add(c.crop, 2); S.plots[k] = null; S.stats.harvest++;
    addXP(CROPS[c.crop].xp);
    floatText(wx, wy - 40, `+2 ${ITEMS[c.crop].e}`, '#fff');
    floatText(wx + 18, wy - 62, `+${CROPS[c.crop].xp} XP`, '#9ef56a');
    burst(wx, wy - 10, ['#ffd23f','#9ef56a','#fff'], 12); sfx('pop');
  } else if (!silent){ const left = Math.ceil((CROPS[c.crop].time * 1000 - (now() - c.t0)) / 1000); floatText(wx, wy - 50, '⏱ ' + left + 's', '#fff'); }
}
const unlockCost = () => Math.min(260, 40 + 15 * (S.unlocked - START_PLOTS));

function machTime(m){ const q = S.mach[m].q; return q.length ? RECIPES[m][q[0]].time * 1000 : 0; }
function updateMachines(){
  for (const m of Object.keys(S.mach)){
    const st = S.mach[m];
    while (st.q.length && now() - st.t0 >= machTime(m)){
      const r = RECIPES[m][st.q[0]];
      add(r.out, r.n); S.stats.make++; st.t0 += machTime(m); st.q.shift();
      const b = BLD[m], [x, y] = P(b.i + 1, b.j + 1, b.h);
      floatText(x, y, `+${r.n} ${ITEMS[r.out].e}`, '#fff'); sfx('ding');
      if (!st.q.length) st.t0 = 0;
    }
  }
}
function startMake(m, idx){
  const st = S.mach[m], r = RECIPES[m][idx];
  if (S.level < r.lvl) return toast(`Unlocks at level ${r.lvl}`);
  if (st.q.length >= 4) return toast('Queue is full');
  if (!canAfford(r.inp)) return toast('Missing ingredients');
  for (const [k, v] of Object.entries(r.inp)) S.inv[k] -= v;
  if (!st.q.length) st.t0 = now();
  st.q.push(idx);
}
function speedUp(m){
  const st = S.mach[m];
  if (!st.q.length) return;
  if (S.gems < 1) return toast('Not enough gems');
  S.gems--; st.t0 = now() - machTime(m);
}

function penDone(id){ const p = S.pens[id]; return p.st === 'fed' && now() - p.t0 >= PENS[id].time * 1000; }
function tapPen(id){
  const p = S.pens[id], def = PENS[id], b = BLD[id];
  const [x, y] = P(b.i + b.w / 2, b.j + b.d / 2, 40);
  if (def.lvl && S.level < def.lvl) return toast(`${def.name} unlocks at level ${def.lvl}`);
  if (penDone(id) || p.st === 'ready'){
    p.st = 'hungry'; add(def.prod, def.count); S.stats.collect++;
    addXP(def.count);
    floatText(x, y, `+${def.count} ${ITEMS[def.prod].e}`, '#fff'); sfx('coin');
    burst(x, y + 30, ['#fff','#ffd23f'], 10);
  } else if (p.st === 'hungry'){
    if (S.inv.feed < 1) return toast('Out of feed — make some at the Feed Mill 🥣');
    S.inv.feed--; p.st = 'fed'; p.t0 = now();
    floatText(x, y, '-1 🥣', '#ffd23f');
  } else toast('Your animals are busy producing…');
}

const nodeDef = n => NODE_DEF[n.type];
const nodeLocked = n => S.level < nodeDef(n).lvl;
function nodeT0(n){ if (S.nodes[n.id] == null) S.nodes[n.id] = now() - nodeDef(n).time * 1000; return S.nodes[n.id]; }
const nodeReady = n => !nodeLocked(n) && now() - nodeT0(n) >= nodeDef(n).time * 1000;
function tapNode(n){
  const def = nodeDef(n), [x, y] = P(n.i + n.w / 2, n.j + n.d / 2, 40);
  if (nodeLocked(n)) return toast(`${NODE_NAME[n.type]} unlocks at level ${def.lvl}`);
  if (nodeReady(n)){
    S.nodes[n.id] = now(); add(def.out, def.n); S.stats.collect++; addXP(def.xp);
    floatText(x, y, `+${def.n} ${ITEMS[def.out].e}`, '#fff'); burst(x, y + 20, ['#fff', '#ffd23f'], 8); sfx('pop');
    if (n.type === 'fish' && Math.random() < .12){ S.gems++; floatText(x + 20, y - 26, '+1 💎', '#8fe0ff'); }
  } else {
    const left = Math.ceil((def.time * 1000 - (now() - nodeT0(n))) / 1000);
    floatText(x, y, '⏱ ' + left + 's', '#fff');
  }
}
function claimQuest(k){
  const q = S.quests[k]; if (!q || qProg(q) < q.n) return;
  S.coins += q.coins; S.gems += q.gems; addXP(q.xp); sfx('coin');
  toast(`Quest complete! +${q.coins} 💰${q.gems ? ' +' + q.gems + ' 💎' : ''}`);
  S.quests[k] = newQuest(S.quests.map(x => x.type));
}
function orderReady(o){ return canAfford(o.items); }
function deliver(idx){
  const o = S.orders[idx];
  if (!o || !orderReady(o)) return;
  for (const [k, v] of Object.entries(o.items)) S.inv[k] -= v;
  S.coins += o.coins; S.gems += o.gems; addXP(o.xp); S.stats.deliver++;
  toast(`Delivered! +${o.coins} 💰${o.gems ? ' +1 💎' : ''} +${o.xp} XP`);
  S.orders[idx] = newOrder();
  truck.phase = 'out'; truck.loaded = true; sfx('horn'); setTimeout(() => sfx('coin'), 350);
}

function sell(t){
  if ((S.inv[t] || 0) < 1) return;
  S.inv[t]--; S.coins += ITEMS[t].v; sfx('coin');
}

/* ============================== UI ============================== */
const modal = $('modal'), mt = $('mt'), mb = $('mb');
let openM = null;
function openModal(type, arg){ openM = {type, arg}; modal.classList.remove('hidden'); renderModal(); }
function closeModal(){ openM = null; modal.classList.add('hidden'); }
$('mx').onclick = closeModal;
modal.addEventListener('pointerdown', e => { if (e.target === modal) closeModal(); });
$('barnBtn').onclick = () => openModal('barn');
const sndBtn = $('snd'); sndBtn.textContent = S.mute ? '🔇' : '🔊';
sndBtn.onclick = () => { S.mute = !S.mute; sndBtn.textContent = S.mute ? '🔇' : '🔊'; sfx('pop'); save(); };
$('shopBtn').onclick = () => openModal('shop');
$('questBtn').onclick = () => openModal('quests');

const chip = (t, n, cls = '') => `<span class="chip ${cls}">${ITEMS[t].e} ${n}</span>`;
const fmtT = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : s + 's'; };

function renderModal(){
  if (!openM) return;
  const {type, arg} = openM;
  let h = '';
  if (type === 'barn'){
    mt.textContent = '🏚️ Barn';
    h = '<div class="grid">' + Object.keys(ITEMS).filter(t => ITEMS[t].lvl <= S.level || (S.inv[t] || 0) > 0).map(t => `
      <div class="cell"><b>${ITEMS[t].e}</b><div>${ITEMS[t].n}</div><div class="sub">×${S.inv[t] || 0} · ${ITEMS[t].v}💰</div>
      <button class="btn coin" data-act="sell" data-t="${t}" ${(S.inv[t] || 0) < 1 ? 'disabled' : ''}>Sell 1</button></div>`).join('') + '</div>';
  }
  else if (type === 'shop'){
    mt.textContent = '🔨 Shop';
    const cost = unlockCost(), full = S.unlocked >= PLOT_SLOTS.length;
    h = `
      <div class="row"><div class="big-e">🟫</div><div class="grow"><b>New crop plot</b><div class="sub">${S.unlocked}/${PLOT_SLOTS.length} unlocked</div></div>
        <button class="btn coin" data-act="plot" ${full || S.coins < cost ? 'disabled' : ''}>${full ? 'Max' : cost + ' 💰'}</button></div>
      <div class="row"><div class="big-e">🧪</div><div class="grow"><b>Fertilizer ×3</b><div class="sub">Instantly ripens a growing crop (you have ${S.fert})</div></div>
        <button class="btn coin" data-act="fert" ${S.coins < 30 ? 'disabled' : ''}>30 💰</button></div>
      <div class="row"><div class="big-e">🥣</div><div class="grow"><b>Animal feed ×5</b><div class="sub">For chickens &amp; cows</div></div>
        <button class="btn coin" data-act="feed" ${S.coins < 20 ? 'disabled' : ''}>20 💰</button></div>
      <div class="row"><div class="big-e">🌾</div><div class="grow"><b>Wheat ×5</b><div class="sub">Handy for the bakery</div></div>
        <button class="btn coin" data-act="wheat" ${S.coins < 20 ? 'disabled' : ''}>20 💰</button></div>
      <div class="row"><div class="big-e">💎</div><div class="grow"><b>Trade a gem</b><div class="sub">1 gem → 40 coins</div></div>
        <button class="btn gem" data-act="gem" ${S.gems < 1 ? 'disabled' : ''}>1 💎</button></div>`;
  }
  else if (type === 'orders'){
    mt.textContent = '📋 Order Board';
    h = S.orders.map((o, k) => {
      const ok = orderReady(o);
      return `<div class="row ${ok ? 'ok' : ''}"><div class="grow">
        ${Object.entries(o.items).map(([t, q]) => chip(t, `${Math.min(S.inv[t] || 0, q)}/${q}`, (S.inv[t] || 0) >= q ? 'good' : 'bad')).join('')}
        <div class="sub">Reward: 💰${o.coins} · ${o.xp} XP${o.gems ? ' · 💎1' : ''}</div></div>
        <button class="btn" data-act="deliver" data-k="${k}" ${ok ? '' : 'disabled'}>🚚 Deliver</button></div>`;
    }).join('');
  }
  else if (type === 'quests'){
    mt.textContent = '📜 Quests';
    h = S.quests.map((q, k) => { const p = qProg(q), ok = p >= q.n; return `<div class="row ${ok ? 'ok' : ''}"><div class="big-e">${QT[q.type].e}</div><div class="grow"><b>${QT[q.type].t}</b> <span class="sub">${p}/${q.n}</span>
      <div class="bar"><div style="width:${p / q.n * 100}%"></div></div><div class="sub">Reward: 💰${q.coins} · ${q.xp} XP${q.gems ? ' · 💎' + q.gems : ''}</div></div>
      <button class="btn" data-act="claim" data-k="${k}" ${ok ? '' : 'disabled'}>Claim</button></div>`; }).join('');
  }
  else if (type === 'mach'){
    const m = arg, st = S.mach[m], b = BLD[m];
    mt.textContent = MACH_ICON[m] + ' ' + MACH_NAME[m];
    h = RECIPES[m].map((r, idx) => {
      const locked = S.level < r.lvl;
      return `<div class="row"><div class="big-e">${ITEMS[r.out].e}</div><div class="grow">
        <b>${ITEMS[r.out].n} ×${r.n}</b> <span class="sub">${fmtT(r.time * 1000)}</span><br>
        ${Object.entries(r.inp).map(([t, q]) => chip(t, q, (S.inv[t] || 0) >= q ? 'good' : 'bad')).join('')}</div>
        <button class="btn" data-act="make" data-m="${m}" data-k="${idx}" ${locked || !canAfford(r.inp) || st.q.length >= 4 ? 'disabled' : ''}>${locked ? '🔒 Lv' + r.lvl : 'Make'}</button></div>`;
    }).join('');
    h += `<h3 style="margin:14px 0 4px">Queue (${st.q.length}/4)</h3>`;
    if (!st.q.length) h += '<div class="sub">Nothing in production.</div>';
    else {
      h += st.q.map((ri, k) => {
        const r = RECIPES[m][ri], pr = k === 0 ? clamp((now() - st.t0) / (r.time * 1000), 0, 1) : 0;
        return `<div class="row"><div class="big-e">${ITEMS[r.out].e}</div><div class="grow"><b>${ITEMS[r.out].n}</b>
          <div class="bar"><div style="width:${pr * 100}%"></div></div></div>
          ${k === 0 ? `<button class="btn gem" data-act="speed" data-m="${m}" ${S.gems < 1 ? 'disabled' : ''}>⚡ 1 💎</button>` : ''}</div>`;
      }).join('');
    }
  }
  if (mb._h !== h){ mb.innerHTML = h; mb._h = h; }
}
mb.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const a = b.dataset.act;
  if (a === 'sell') sell(b.dataset.t);
  else if (a === 'plot'){ if (S.coins >= unlockCost()) { S.coins -= unlockCost(); S.unlocked++; } }
  else if (a === 'feed'){ if (S.coins >= 20){ S.coins -= 20; add('feed', 5); } }
  else if (a === 'fert'){ if (S.coins >= 30){ S.coins -= 30; S.fert += 3; } }
  else if (a === 'wheat'){ if (S.coins >= 20){ S.coins -= 20; add('wheat', 5); } }
  else if (a === 'gem'){ if (S.gems >= 1){ S.gems--; S.coins += 40; } }
  else if (a === 'deliver') deliver(+b.dataset.k);
  else if (a === 'claim') claimQuest(+b.dataset.k);
  else if (a === 'make') startMake(b.dataset.m, +b.dataset.k);
  else if (a === 'speed') speedUp(b.dataset.m);
  updateHUD(); renderModal(); save();
});

/* seed bar */
const seedsEl = $('seeds');
function renderSeeds(){
  seedsEl.innerHTML = Object.entries(CROPS).map(([k, c]) => {
    const lock = S.level < c.lvl;
    return `<button class="seed ${S.seed === k ? 'on' : ''} ${lock ? 'lock' : ''}" data-s="${k}"><b>${lock ? '🔒' : ITEMS[k].e}</b><span>${lock ? 'Lv ' + c.lvl : '💰' + c.cost}</span></button>`;
  }).join('') + `<button class="seed fert ${S.seed === 'fert' ? 'on' : ''}" data-s="fert"><b>🧪</b><span>×${S.fert}</span></button>`;
}
seedsEl.addEventListener('click', e => {
  const b = e.target.closest('[data-s]'); if (!b) return;
  const k = b.dataset.s;
  if (k !== 'fert' && S.level < CROPS[k].lvl) return toast(`${ITEMS[k].n} unlocks at level ${CROPS[k].lvl}`);
  S.seed = k; renderSeeds();
});
let hudKey = '';
function updateHUD(){
  $('coins').textContent = S.coins; $('gems').textContent = S.gems; $('badge').textContent = S.level;
  const need = xpNeed(S.level);
  $('xpfill').style.width = (S.xp / need * 100) + '%'; $('xptxt').textContent = `${S.xp} / ${need} XP`;
  $('questBtn').classList.toggle('alert', questsReady());
  const key = S.level + S.seed + S.fert; if (key !== hudKey){ hudKey = key; renderSeeds(); }
}

/* ============================== rendering primitives ============================== */
const cv = $('c'), mainCtx = cv.getContext('2d');
let ctx = mainCtx;
let W, H, dpr, sc = .8, tx = 0, ty = 0;
const cam = {x:60, y:330}, MINSC = .3, MAXSC = 1.8;
function applyCam(){
  const mx = N * HW * .95, my = N * HH * 2;
  cam.x = clamp(cam.x, -mx, mx); cam.y = clamp(cam.y, -40, my);
  tx = W / 2 - cam.x * sc; ty = H / 2 - cam.y * sc;
}
function resize(){
  dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  if (!resize.done){ resize.done = true; sc = W < 700 ? .62 : clamp(Math.min(W / 1150, H / 800), .5, 1.1); cam.x = 60; cam.y = 330; }
  sc = clamp(sc, MINSC, MAXSC); applyCam();
}
function zoomAt(px, py, f){
  const nsc = clamp(sc * f, MINSC, MAXSC), wx = (px - tx) / sc, wy = (py - ty) / sc;
  sc = nsc; cam.x = wx - (px - W / 2) / sc; cam.y = wy - (py - H / 2) / sc; applyCam();
}
addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 150)); resize();

/* ---- minimap ---- */
const mini = $('mini'), mctx = mini.getContext('2d'), miniBase = document.createElement('canvas');
const MW = 240, MH = 120, MS = MW / (2 * N * HW);
mini.width = miniBase.width = MW; mini.height = miniBase.height = MH;
const MP = (x, y) => { const p = P(x, y); return [(p[0] + N * HW) * MS, p[1] * MS]; };
function buildMini(){
  const g = miniBase.getContext('2d');
  const tri = (x, y, w, d, fill) => { g.beginPath(); [MP(x, y), MP(x + w, y), MP(x + w, y + d), MP(x, y + d)].forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = fill; g.fill(); };
  tri(0, 0, N, N, '#86d05a');
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++){ if (isWater(i, j)) tri(i, j, 1.04, 1.04, '#58bdea'); else if (occ[i][j] === 2) tri(i, j, 1.04, 1.04, '#dcb97c'); }
  PLOT_SLOTS.forEach(p => tri(p.i, p.j, 1, 1, '#94603a'));
  NODES.forEach(n => { if (n.type === 'apple') tri(n.i, n.j, 1, 1, '#2f8f3a'); });
  Object.entries(BLD).forEach(([k, b]) => tri(b.i, b.j, b.w, b.d, PENS[k] ? '#c9a566' : k === 'barn' ? '#c8352f' : '#8a5a30'));
}
function drawMini(){
  mctx.clearRect(0, 0, MW, MH); mctx.drawImage(miniBase, 0, 0);
  const x0 = (-tx / sc + N * HW) * MS, y0 = (-ty / sc) * MS, x1 = ((W - tx) / sc + N * HW) * MS, y1 = ((H - ty) / sc) * MS;
  mctx.fillStyle = 'rgba(255,255,255,.16)'; mctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  mctx.strokeStyle = '#fff'; mctx.lineWidth = 2.5; mctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
}

function poly(pts, fill, stroke = OUT, lw = 2){
  ctx.beginPath(); pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
  if (fill){ ctx.fillStyle = fill; ctx.fill(); }
  if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
}
function box(x, y, w, d, h, base, z0 = 0){
  poly([P(x, y + d, z0), P(x + w, y + d, z0), P(x + w, y + d, z0 + h), P(x, y + d, z0 + h)], shade(base, .88));
  poly([P(x + w, y, z0), P(x + w, y + d, z0), P(x + w, y + d, z0 + h), P(x + w, y, z0 + h)], shade(base, .66));
  poly([P(x, y, z0 + h), P(x + w, y, z0 + h), P(x + w, y + d, z0 + h), P(x, y + d, z0 + h)], shade(base, 1.08));
}
const qY = (x0, x1, z0, z1, y, fill, st = OUT, lw = 2) => poly([P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)], fill, st, lw);
const qX = (y0, y1, z0, z1, x, fill, st = OUT, lw = 2) => poly([P(x, y0, z0), P(x, y1, z0), P(x, y1, z1), P(x, y0, z1)], fill, st, lw);
function gable(x, y, w, d, z, rh, roof, wall, o = .22){
  poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d / 2, z + rh)], shade(wall, .66));
  poly([P(x - o, y + d + o, z - 3), P(x + w + o, y + d + o, z - 3), P(x + w + o, y + d / 2, z + rh), P(x - o, y + d / 2, z + rh)], shade(roof, 1));
  // shingle lines
  ctx.strokeStyle = shade(roof, .72); ctx.lineWidth = 1.5;
  for (let k = 1; k < 4; k++){
    const f = k / 4, yy = y + d + o - f * (d / 2 + o), zz = z - 3 + f * (rh + 3);
    const a = P(x - o, yy, zz), b = P(x + w + o, yy, zz);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  // ridge cap
  const r0 = P(x - o, y + d / 2, z + rh), r1 = P(x + w + o, y + d / 2, z + rh);
  ctx.strokeStyle = shade(roof, 1.25); ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1]); ctx.stroke();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineCap = 'butt';
}
function shadowFoot(x, y, w, d, off = 16){
  const pts = [P(x, y), P(x + w, y), P(x + w, y + d), P(x, y + d)].map(p => [p[0] + off, p[1] + off * .35]);
  poly(pts, 'rgba(40,60,20,.22)', null);
}
function ell(x, y, rx, ry, fill, st = OUT, lw = 1.8, rot = 0){
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  if (fill){ ctx.fillStyle = fill; ctx.fill(); } if (st){ ctx.strokeStyle = st; ctx.lineWidth = lw; ctx.stroke(); }
}
function bubble(x, y, label, opts = {}){
  const bob = Math.sin(T * 3 + (opts.ph || 0)) * 3;
  y += bob;
  ctx.save();
  const kz = clamp(.8 / sc, 1, 1.8); ctx.translate(x, y + 25); ctx.scale(kz, kz); x = 0; y = -25;
  ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
  ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.fillStyle = '#fffbea'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.moveTo(x - 6, y + 15); ctx.lineTo(x, y + 25); ctx.lineTo(x + 6, y + 15); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = opts.col || '#7a4a26'; ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.stroke();
  if (opts.prog != null){
    ctx.strokeStyle = '#5cc13b'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 18, -Math.PI / 2, -Math.PI / 2 + opts.prog * Math.PI * 2); ctx.stroke();
  }
  if (label === 'SICKLE') drawSickle(x, y);
  else { ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText(label, x, y + 1); }
  if (opts.badge){
    ctx.beginPath(); ctx.arc(x + 14, y - 14, 9, 0, 7); ctx.fillStyle = '#e03a2e'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Fredoka, sans-serif'; ctx.fillText(opts.badge, x + 14, y - 13);
  }
  ctx.restore();
}
function drawSickle(x, y){
  ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round';
  ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-8, 9); ctx.lineTo(2, -1); ctx.stroke();
  ctx.strokeStyle = '#6f7a86'; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.arc(1, -2, 9, Math.PI * .95, Math.PI * 1.95); ctx.stroke();
  ctx.strokeStyle = '#d4dde6'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(1, -2, 9, Math.PI * 1.05, Math.PI * 1.75); ctx.stroke();
  ctx.restore();
}

/* ============================== sprites ============================== */
let T = 0;
function drawTree(cx, cy, s, apple){
  const sw = Math.sin(T * 1.3 + s * 9) * 2;
  ctx.fillStyle = '#6b4226'; ctx.strokeStyle = OUT; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 5, cy); ctx.lineTo(cx - 3, cy - 26); ctx.lineTo(cx + 3, cy - 26); ctx.lineTo(cx + 5, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
  const k = 30 + s * 8;
  const cols = ['#2f8f3a', '#3da64a', '#58c05a'];
  ell(cx - 14 + sw * .5, cy - 34, k * .62, k * .56, cols[0]);
  ell(cx + 14 + sw * .5, cy - 36, k * .6, k * .54, cols[0]);
  ell(cx + sw, cy - 48, k * .72, k * .66, cols[1]);
  ell(cx - 6 + sw, cy - 55, k * .38, k * .3, cols[2], null);
  if (apple){ [[-14,-38],[10,-50],[16,-34],[-4,-60]].forEach(([a, b]) => { ell(cx + a + sw, cy + b, 4, 4, '#e03a2e', '#8c1d14', 1.2); }); }
}
function drawBush(cx, cy, s){
  ell(cx - 9, cy - 6, 11, 9, '#3da64a'); ell(cx + 8, cy - 7, 12, 10, '#46b653'); ell(cx, cy - 12, 10, 8, '#58c05a', null);
  if (s > .5) [[-8,-8],[6,-12],[10,-4]].forEach(([a, b]) => ell(cx + a, cy + b, 2.6, 2.6, '#ff6f91', null));
}
function drawFlower(cx, cy, s){
  const c = ['#ff6f91', '#ffd23f', '#fff', '#b78cff'][Math.floor(s * 40) % 4];
  ctx.strokeStyle = '#2f8f3a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 7); ctx.stroke();
  for (let a = 0; a < 5; a++){ ell(cx + Math.cos(a * 1.256) * 3, cy - 8 + Math.sin(a * 1.256) * 3, 2.2, 2.2, c, null); }
  ell(cx, cy - 8, 1.8, 1.8, '#ffb300', null);
}
function drawRock(cx, cy){ ell(cx, cy - 5, 10, 7, '#a9a9a2'); ell(cx - 3, cy - 8, 4, 2.5, '#d4d4cc', null); }
function drawHay(cx, cy){
  ell(cx, cy - 3, 17, 7, '#c8942a'); ctx.fillStyle = '#e8b845'; ctx.fillRect(cx - 17, cy - 22, 34, 19);
  ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.strokeRect(cx - 17, cy - 22, 34, 19);
  ell(cx, cy - 22, 17, 7, '#f2cd5e'); ctx.strokeStyle = '#a87a1a'; ctx.lineWidth = 1.5;
  for (let k = -10; k <= 10; k += 5){ ctx.beginPath(); ctx.moveTo(cx + k, cy - 20); ctx.lineTo(cx + k, cy - 4); ctx.stroke(); }
}

function drawCropClump(cx, cy, crop, p, s){
  const g = .3 + .7 * clamp(p, 0, 1), sw = Math.sin(T * 2 + s * 5) * 1.5 * g;
  if (crop === 'wheat'){
    const col = p < .5 ? '#6fc24a' : `rgb(${Math.round(111 + (225 - 111) * (p - .5) * 2)},${Math.round(194 - (194 - 170) * (p - .5) * 2)},${Math.round(74 - 30 * (p - .5) * 2)})`;
    for (let k = -2; k <= 2; k++){
      const hx = cx + k * 3.2, ht = (22 + (k % 2 ? 4 : 0)) * g;
      ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, cy); ctx.quadraticCurveTo(hx + k * 1.2, cy - ht / 2, hx + k * 1.6 + sw, cy - ht); ctx.stroke();
      if (p > .45){ ell(hx + k * 1.6 + sw, cy - ht - 3, 2.4, 5.5 * g, '#f0c040', '#a67a12', 1, k * .15); }
    }
  } else if (crop === 'corn'){
    const ht = 46 * g;
    ctx.strokeStyle = '#3f9a36'; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sw, cy - ht); ctx.stroke();
    ctx.fillStyle = '#58b848'; ctx.strokeStyle = '#2d7a2a'; ctx.lineWidth = 1.2;
    [[-1, .35], [1, .5], [-1, .72], [1, .85]].forEach(([d, f]) => {
      const by = cy - ht * f;
      ctx.beginPath(); ctx.moveTo(cx + sw * f, by); ctx.quadraticCurveTo(cx + d * 14 * g, by - 10 * g, cx + d * 18 * g, by + 8 * g); ctx.quadraticCurveTo(cx + d * 8 * g, by - 2, cx + sw * f, by); ctx.fill(); ctx.stroke();
    });
    if (p > .6){ ell(cx + 5 + sw * .5, cy - ht * .55, 3.5, 8 * g, '#ffd23f', '#a67a12', 1.2, -.2); ell(cx + 4 + sw * .5, cy - ht * .5 - 6 * g, 4.2, 4, '#7dc060', null); }
    if (p > .5){ ell(cx + sw, cy - ht - 2, 1.5, 4 * g, '#f4e29a', null); }
  } else {
    const r = 11 * g;
    ctx.strokeStyle = '#4aa13a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 14, cy - 3); ctx.quadraticCurveTo(cx - 8, cy - r * 1.8, cx - 1, cy - r * 1.5); ctx.stroke();
    ell(cx - 12 * g, cy - 7 * g, 6 * g, 3.4 * g, '#58c05a', '#2d7a2a', 1.2, -.5);
    ell(cx, cy - r * .85, r * 1.3, r, p > .85 ? '#f58a1f' : '#9bc23a', OUT);
    ctx.strokeStyle = p > .85 ? '#c9640a' : '#6f9a2a'; ctx.lineWidth = 1.4;
    [-.45, 0, .45].forEach(f => { ctx.beginPath(); ctx.ellipse(cx, cy - r * .85, r * 1.3 * Math.abs(f) + .5, r * .95, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke(); });
    ctx.fillStyle = '#5a7a2a'; ctx.fillRect(cx - 1.5, cy - r * 1.9, 3, 5 * g);
    if (p > .85) ell(cx - r * .4, cy - r * 1.1, 2.5, 4, 'rgba(255,255,255,.4)', null);
  }
}
const CLUMPS = [[.28, .3], [.72, .3], [.28, .72], [.72, .72], [.5, .5]];
function drawPlotCrop(i, j, c){
  const p = (now() - c.t0) / (CROPS[c.crop].time * 1000);
  const list = c.crop === 'wheat' ? CLUMPS : c.crop === 'corn' ? CLUMPS.slice(0, 4) : CLUMPS.slice(1, 4);
  list.slice().sort((a, b) => (a[0] + a[1]) - (b[0] + b[1])).forEach((q, k) => {
    const [x, y] = P(i + q[0], j + q[1]); drawCropClump(x, y, c.crop, p, k + i * 3 + j);
  });
}

function drawChicken(a){
  const [x, y] = P(a.x, a.y), hop = a.moving ? Math.abs(Math.sin(T * 12 + a.ph)) * 3 : 0, peck = !a.moving ? Math.max(0, Math.sin(T * 5 + a.ph)) * 3 : 0;
  const d = a.dir, by = y - hop;
  ell(x, y + 1, 8, 3, 'rgba(0,0,0,.18)', null);
  ctx.strokeStyle = '#e8932a'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x - 2, by - 3); ctx.lineTo(x - 2, y); ctx.moveTo(x + 2, by - 3); ctx.lineTo(x + 2, y); ctx.stroke();
  ell(x - d * 8, by - 11, 4, 5, '#f2f2ee', OUT, 1.5, d * .6);                 // tail
  ell(x, by - 9, 9, 7, '#fffdf5');                                              // body
  ell(x - d * 1, by - 8, 5, 3.5, '#ece7d6', null, 1, d * .3);                   // wing
  ell(x + d * 7, by - 15 + peck, 5, 5, '#fffdf5');                              // head
  ell(x + d * 7, by - 21 + peck, 2.4, 2.4, '#e03a2e', null);                    // comb
  poly([[x + d * 11, by - 15 + peck], [x + d * 15, by - 14 + peck], [x + d * 11, by - 12 + peck]], '#ffb21f', OUT, 1);
  ell(x + d * 8.5, by - 16.5 + peck, 1, 1, '#222', null);
}
function drawCow(a){
  const [x, y] = P(a.x, a.y), d = a.dir, bob = a.moving ? Math.sin(T * 6 + a.ph) * 1.5 : 0, by = y + bob;
  ell(x, y + 2, 24, 7, 'rgba(0,0,0,.2)', null);
  const leg = (lx, ph) => { const sw = a.moving ? Math.sin(T * 6 + ph) * 3 : 0; ctx.fillStyle = '#f6f2e8'; ctx.fillRect(x + lx + sw - 3, by - 14, 6, 14); ctx.strokeRect(x + lx + sw - 3, by - 14, 6, 14); ctx.fillStyle = '#4a3a30'; ctx.fillRect(x + lx + sw - 3, by - 3, 6, 3); };
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.6;
  leg(-d * 12 - 6 * d, 0); leg(d * 8 - 6 * d, 3);
  ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - d * 20, by - 26); ctx.quadraticCurveTo(x - d * 27, by - 18, x - d * 23, by - 10); ctx.stroke();
  ell(x - d * 23, by - 9, 2.4, 3.6, '#2b2220', null);
  ell(x, by - 24, 23, 13, '#fffdf5');
  ell(x - d * 7, by - 27, 7, 5, '#33272a', null); ell(x + d * 6, by - 20, 6, 4.5, '#33272a', null);
  ell(x + d * 20, by - 31, 9, 8.5, '#fffdf5');                                  // head
  ell(x + d * 21, by - 26, 7.5, 5.5, '#ffb7b0');                                // muzzle
  ell(x + d * 24, by - 26, 1.2, 1.5, '#b3544f', null); ell(x + d * 19, by - 26, 1.2, 1.5, '#b3544f', null);
  ell(x + d * 18, by - 34, 1.6, 1.6, '#222', null);
  ell(x + d * 12, by - 34, 5, 2.8, '#33272a', OUT, 1.4, d * -.4);               // ear
  ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.fillStyle = '#f4e6c0';
  ctx.beginPath(); ctx.moveTo(x + d * 16, by - 38); ctx.lineTo(x + d * 14, by - 44); ctx.lineTo(x + d * 19, by - 39); ctx.fill(); ctx.stroke();
}

const winCol = () => NIGHT > .3 ? '#ffe08a' : '#bde6f5';
function drawSheep(a){
  const [x, y] = P(a.x, a.y), d = a.dir, by = y + (a.moving ? Math.sin(T * 6 + a.ph) * 1.2 : 0), graze = a.moving ? 0 : Math.max(0, Math.sin(T * 2 + a.ph)) * 4;
  ell(x, y + 2, 17, 5, 'rgba(0,0,0,.2)', null);
  ctx.fillStyle = '#4a3b36'; ctx.strokeStyle = OUT; ctx.lineWidth = 1.5;
  [-8, -2, 5, 10].forEach(lx => { ctx.fillRect(x + lx - 1.5, by - 9, 3.5, 9); ctx.strokeRect(x + lx - 1.5, by - 9, 3.5, 9); });
  ell(x + d * 12, by - 17 + graze, 6.5, 5.8, '#4a3b36'); ell(x + d * 9, by - 23 + graze, 3.2, 2, '#4a3b36', OUT, 1.2, d * .5);
  ell(x + d * 13.5, by - 18 + graze, 1.2, 1.2, '#fff', null);
  [[-9, -16, 9, 8], [0, -20, 11, 9], [9, -16, 8, 7.5], [-4, -13, 12, 7], [-10, -11, 7, 6]].forEach(([a, b, rx, ry]) => ell(x + a - d * 2, by + b, rx, ry, '#fffdf5'));
  ell(x - 2, by - 24, 6, 3, '#fff', null);
}
function drawDog(){
  const [x, y] = P(dog.x, dog.y), d = dog.dir, hop = dog.bark > 0 ? Math.abs(Math.sin(dog.bark * 14)) * 8 : dog.moving ? Math.abs(Math.sin(T * 14)) * 2 : 0, by = y - hop;
  ell(x, y + 1, 13, 4, 'rgba(0,0,0,.2)', null);
  ctx.strokeStyle = '#9a5f28'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - d * 11, by - 13); ctx.lineTo(x - d * 16, by - 20 + Math.sin(T * 18) * 3); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = '#b87333'; ctx.strokeStyle = OUT; ctx.lineWidth = 1.5;
  [-8, -3, 5, 9].forEach((lx, k) => { const sw = dog.moving ? Math.sin(T * 14 + k * 1.6) * 2 : 0; ctx.fillRect(x + lx + sw - 1.5, by - 7, 3.5, 7); ctx.strokeRect(x + lx + sw - 1.5, by - 7, 3.5, 7); });
  ell(x, by - 12, 12.5, 7, '#c68642'); ell(x, by - 9, 8, 3.5, '#f0cf9a', null);
  ell(x + d * 11, by - 18, 6.5, 6, '#c68642'); ell(x + d * 16, by - 16, 3.8, 2.8, '#f0cf9a'); ell(x + d * 18.5, by - 17, 1.4, 1.2, '#222', null);
  ell(x + d * 8, by - 21, 2.8, 5, '#7a4a26', OUT, 1.3, d * .4); ell(x + d * 12, by - 20, 1.1, 1.1, '#222', null);
}
function drawDuck(du){
  const x = riverC(du.y) + du.off, [sx, sy] = P(x, du.y), d = du.v > 0 ? -1 : 1, bob = Math.sin(T * 3 + du.y * 2) * 1.2;
  ell(sx, sy + 3, 12, 4, 'rgba(255,255,255,.55)', null);
  ell(sx, sy - 3 + bob, 9, 6, '#fffdf5'); ell(sx - d * 7, sy - 6 + bob, 3.5, 3.5, '#f5efe0', OUT, 1.3);
  ell(sx + d * 7, sy - 10 + bob, 4.2, 4.2, '#2f8f3a'); poly([[sx + d * 10, sy - 10 + bob], [sx + d * 14, sy - 9 + bob], [sx + d * 10, sy - 8 + bob]], '#ffb21f', OUT, 1);
  ell(sx + d * 8, sy - 11 + bob, 1, 1, '#111', null);
}
function drawScarecrow(x, y){
  const sw = Math.sin(T * 1.6) * 2;
  ell(x + 8, y + 1, 14, 4, 'rgba(40,60,20,.22)', null);
  ctx.strokeStyle = '#6b4226'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 52); ctx.moveTo(x - 20, y - 36 + sw * .3); ctx.lineTo(x + 20, y - 36 - sw * .3); ctx.stroke();
  poly([[x - 10, y - 38], [x + 10, y - 38], [x + 8, y - 18], [x - 8, y - 18]], '#4f7fd0', OUT, 1.8);
  ell(x - 3, y - 28, 3, 3, '#e8c34a', null);
  ctx.strokeStyle = '#e8c34a'; ctx.lineWidth = 2; [[-20, -36], [20, -36]].forEach(([a, b]) => { for (let k = -1; k <= 1; k++){ ctx.beginPath(); ctx.moveTo(x + a, y + b); ctx.lineTo(x + a + Math.sign(a) * 6, y + b + k * 4 + sw); ctx.stroke(); } });
  ell(x, y - 52, 9, 9, '#e8c98a'); ell(x - 3, y - 54, 1.3, 1.3, '#222', null); ell(x + 3, y - 54, 1.3, 1.3, '#222', null);
  ctx.strokeStyle = '#8a4a2a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y - 50, 3.5, .2, Math.PI - .2); ctx.stroke(); ctx.lineCap = 'butt';
  ell(x, y - 60, 14, 4, '#c48a52'); poly([[x - 8, y - 60], [x + 8, y - 60], [x + 4, y - 72], [x - 4, y - 72]], '#d9a05a', OUT, 1.8);
}
function drawWell(x, y){
  ell(x + 10, y + 2, 26, 8, 'rgba(40,60,20,.22)', null);
  ctx.fillStyle = '#b9b6ac'; ctx.strokeStyle = OUT; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 17, y - 4); ctx.lineTo(x - 17, y - 22); ctx.lineTo(x + 17, y - 22); ctx.lineTo(x + 17, y - 4); ctx.ellipse(x, y - 4, 17, 8, 0, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(90,59,34,.45)'; ctx.lineWidth = 1.2; for (let k = -12; k <= 12; k += 8){ ctx.beginPath(); ctx.moveTo(x + k, y - 20); ctx.lineTo(x + k, y - 6); ctx.stroke(); }
  ell(x, y - 22, 17, 8, '#4aa6d8', OUT, 2);
  ctx.fillStyle = '#8a5a30'; ctx.strokeStyle = OUT; ctx.lineWidth = 2; [-15, 13].forEach(px => { ctx.fillRect(x + px, y - 52, 3.5, 32); ctx.strokeRect(x + px, y - 52, 3.5, 32); });
  poly([[x - 22, y - 50], [x + 22, y - 50], [x, y - 68]], '#c8352f', OUT, 2);
  ctx.strokeStyle = '#6b4226'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - 50); ctx.lineTo(x, y - 36); ctx.stroke(); ell(x, y - 33, 4, 3.5, '#8a5a30');
}
function drawLamp(x, y){
  ell(x + 4, y + 1, 7, 2.5, 'rgba(40,60,20,.25)', null);
  ctx.strokeStyle = '#3b3b44'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 56); ctx.stroke();
  ctx.fillStyle = NIGHT > .15 ? '#ffe9a0' : '#e8f2f5'; ctx.strokeStyle = '#3b3b44'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.roundRect(x - 6, y - 70, 12, 15, 3); ctx.fill(); ctx.stroke();
  poly([[x - 8, y - 70], [x + 8, y - 70], [x, y - 78]], '#3b3b44', null);
}
function drawFarmSign(x, y){
  ell(x + 8, y + 1, 22, 5, 'rgba(40,60,20,.22)', null);
  ctx.fillStyle = '#7a4a26'; ctx.strokeStyle = OUT; ctx.lineWidth = 2;
  [-30, 28].forEach(px => { ctx.fillRect(x + px, y - 58, 5, 58); ctx.strokeRect(x + px, y - 58, 5, 58); });
  ctx.fillStyle = '#c48a52'; ctx.beginPath(); ctx.roundRect(x - 36, y - 62, 76, 26, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4e2d14'; ctx.font = '700 13px Fredoka, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('FARM HOUSE', x + 2, y - 49);
  ell(x - 30, y - 62, 4, 4, '#ff6f91', null); ell(x + 34, y - 62, 4, 4, '#ffd23f', null);
}
function drawBridge(){
  const i = 0, j = 7, w = 3.2, d = 1;
  const post = (x, y) => { const a = P(x, y, 3), c = P(x, y, 17); ctx.strokeStyle = OUT; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); ctx.strokeStyle = '#c48a52'; ctx.lineWidth = 2.4; ctx.stroke(); };
  const rail = y => { for (let k = 0; k <= 4; k++) post(i + k * w / 4, y); const a = P(i, y, 15), c = P(i + w, y, 15); ctx.strokeStyle = OUT; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); ctx.strokeStyle = '#d9a56a'; ctx.lineWidth = 2.4; ctx.stroke(); };
  rail(j + .02);
  box(i, j, w, d, 3, '#b98550', 3);
  ctx.strokeStyle = 'rgba(90,59,34,.55)'; ctx.lineWidth = 1.5;
  for (let k = 1; k < 13; k++){ const a = P(i + k * w / 13, j, 6), c = P(i + k * w / 13, j + d, 6); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); }
  rail(j + d - .02);
}
function drawPig(a){
  const [x, y] = P(a.x, a.y), d = a.dir, by = y + (a.moving ? Math.sin(T * 7 + a.ph) * 1.2 : 0), root = a.moving ? 0 : Math.max(0, Math.sin(T * 3 + a.ph)) * 3;
  ell(x, y + 2, 19, 6, 'rgba(0,0,0,.2)', null);
  ctx.fillStyle = '#f1a0b0'; ctx.strokeStyle = OUT; ctx.lineWidth = 1.5;
  [-9, -3, 5, 11].forEach(lx => { ctx.fillRect(x + lx - 2, by - 8, 4, 8); ctx.strokeRect(x + lx - 2, by - 8, 4, 8); });
  ctx.strokeStyle = '#d97a90'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x - d * 17, by - 15, 3.5, 0, 5); ctx.stroke();
  ell(x, by - 14, 17, 11, '#f6aab8');
  ell(x + d * 15, by - 15 + root, 8, 7.5, '#f6aab8'); ell(x + d * 21, by - 14 + root, 4, 3.5, '#e8879b');
  ell(x + d * 20, by - 14 + root, .9, 1.2, '#7a3342', null); ell(x + d * 22.5, by - 14 + root, .9, 1.2, '#7a3342', null);
  poly([[x + d * 11, by - 21 + root], [x + d * 15, by - 27 + root], [x + d * 17, by - 20 + root]], '#e8879b', OUT, 1.3);
  ell(x + d * 15, by - 18 + root, 1.2, 1.2, '#222', null);
  ell(x - 3, by - 18, 6, 3, 'rgba(255,255,255,.35)', null);
}
function drawDairy(){
  const {i, j, w, d} = BLD.dairy;
  box(i, j, w, d, 42, '#eaf2f8');
  qY(i + .25, i + .85, 0, 30, j + d, '#3f6fa6');
  qY(i + 1.2, i + 1.75, 16, 32, j + d, winCol());
  gable(i, j, w, d, 42, 28, '#4a86c8', '#eaf2f8', .25);
  const sp = P(i + w, j + .9, 22); ell(sp[0], sp[1], 7, 5, '#33272a', null); ell(sp[0] + 11, sp[1] + 8, 5, 4, '#33272a', null);
  const [cx, cy] = P(i + 1.5, j + d + .4);
  [[0, 0], [17, 5]].forEach(([a, b]) => {
    ctx.fillStyle = '#c9d3dc'; ctx.strokeStyle = OUT; ctx.lineWidth = 1.8; ctx.fillRect(cx + a - 6, cy + b - 18, 12, 18); ctx.strokeRect(cx + a - 6, cy + b - 18, 12, 18);
    ell(cx + a, cy + b - 18, 6, 2.5, '#e3e9ee'); ell(cx + a, cy + b - 22, 3.5, 2, '#c9d3dc');
  });
}
function drawLoom(){
  const {i, j, w, d} = BLD.loom;
  box(i, j, w, d, 42, '#ecc9e3');
  qY(i + .25, i + .85, 0, 30, j + d, '#7a4a8a');
  qY(i + 1.2, i + 1.75, 16, 32, j + d, winCol());
  gable(i, j, w, d, 42, 28, '#8a5ec0', '#ecc9e3', .25);
  const [cx, cy] = P(i + 1.35, j + d + .45);
  [[0, '#ff6f91'], [15, '#ffd23f'], [29, '#6fd0ff']].forEach(([a, c]) => {
    ell(cx + a, cy - 7, 8, 8, c); ctx.strokeStyle = shade('#ffffff', .85); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx + a, cy - 7, 5, .3, 2.6); ctx.stroke();
  });
  const sg = P(i + 1.5, j + d, 52); ell(sg[0] + 22, sg[1] + 6, 9, 9, '#ff9ec4'); ctx.strokeStyle = OUT; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(sg[0] + 22, sg[1] + 6, 5, .2, 3.4); ctx.stroke();
}
function drawKitchen(){
  const {i, j, w, d} = BLD.kitchen;
  box(i, j, w, d, 46, '#f7e3c0');
  qY(i + .25, i + .85, 0, 34, j + d, '#a8532a');
  qY(i + 1.2, i + 1.75, 16, 34, j + d, winCol());
  const y0 = j + d, y1 = j + d + .45;
  for (let k = 0; k < 4; k++){ const xa = i + .1 + k * .25, xb = xa + .25; poly([P(xa, y0, 40), P(xb, y0, 40), P(xb, y1, 31), P(xa, y1, 31)], k % 2 ? '#fff' : '#3fae5a', OUT, 1.5); }
  gable(i, j, w, d, 46, 30, '#c8352f', '#f7e3c0', .25);
  box(i + 1.35, j + .55, .3, .3, 26, '#a8532a', 54);
  const [cx, cy] = P(i + 1.5, j + .7, 84);
  if (S.mach.kitchen.q.length) for (let k = 0; k < 4; k++){ const f = ((T * .5 + k / 4) % 1); ctx.globalAlpha = (1 - f) * .7; ell(cx + Math.sin(f * 6 + k) * 6 + f * 8, cy - f * 46, 5 + f * 9, 5 + f * 9, '#fff', null); ctx.globalAlpha = 1; }
  const [jx, jy] = P(i + 1.55, j + d + .5);
  [['#d9453a', 0], ['#7a4ac0', 11], ['#f2b01e', 22]].forEach(([c, a]) => { ctx.fillStyle = c; ctx.strokeStyle = OUT; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(jx + a - 5, jy - 17, 10, 15, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e8d8a8'; ctx.fillRect(jx + a - 5, jy - 19, 10, 3); });
}
function drawWindmill(){
  const b = BLD.windmill, [cx, cy] = P(b.i + 1, b.j + 1);
  ell(cx + 36, cy + 4, 52, 17, 'rgba(40,60,20,.22)', null);
  poly([[cx - 36, cy], [cx + 36, cy], [cx + 21, cy - 98], [cx - 21, cy - 98]], '#f0e2c6', OUT, 2.4);
  const g = ctx.createLinearGradient(cx - 36, 0, cx + 36, 0); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(60,40,20,.28)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - 36, cy); ctx.lineTo(cx + 36, cy); ctx.lineTo(cx + 21, cy - 98); ctx.lineTo(cx - 21, cy - 98); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7a4a26'; ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(cx - 8, cy - 28, 16, 28, [8, 8, 0, 0]); ctx.fill(); ctx.stroke();
  ctx.fillStyle = winCol(); ctx.beginPath(); ctx.roundRect(cx - 6, cy - 66, 12, 16, 5); ctx.fill(); ctx.stroke();
  poly([[cx - 27, cy - 96], [cx + 27, cy - 96], [cx, cy - 130]], '#a8532a', OUT, 2.4);
  ctx.save(); ctx.translate(cx, cy - 104); ctx.rotate(T * (.35 + RAIN * .5));
  for (let k = 0; k < 4; k++){
    ctx.rotate(Math.PI / 2);
    ctx.strokeStyle = '#6b4226'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -78); ctx.stroke();
    ctx.fillStyle = '#f6efe0'; ctx.strokeStyle = OUT; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.rect(3, -74, 20, 56); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(90,59,34,.5)'; ctx.lineWidth = 1.2; for (let m = -66; m < -20; m += 11){ ctx.beginPath(); ctx.moveTo(3, m); ctx.lineTo(23, m); ctx.stroke(); }
  }
  ctx.restore(); ell(cx, cy - 104, 5, 5, '#6b4226');
}
function drawAppleTree(n){
  const [x, y] = P(n.i + .5, n.j + .5);
  ell(x + 14, y + 2, 26, 8, 'rgba(40,60,20,.22)', null); drawTree(x, y, ((n.i * 7 + n.j * 3) % 10) / 10, nodeReady(n));
}
function drawHive(n){
  const [x, y] = P(n.i + .5, n.j + .5);
  ell(x + 6, y + 2, 18, 6, 'rgba(40,60,20,.22)', null);
  ctx.fillStyle = '#8a5a30'; ctx.strokeStyle = OUT; ctx.lineWidth = 1.5; [-11, 9].forEach(lx => { ctx.fillRect(x + lx, y - 10, 3.5, 10); ctx.strokeRect(x + lx, y - 10, 3.5, 10); });
  box(n.i + .22, n.j + .22, .56, .56, 16, '#f2cf5a', 9);
  box(n.i + .12, n.j + .12, .76, .76, 4, '#c8352f', 25);
  const e = P(n.i + .5, n.j + .78, 15); ell(e[0], e[1], 4, 2.6, '#4a3320', null);
  if (nodeReady(n)) for (let k = 0; k < 3; k++){ const a = T * 2.4 + k * 2.1; ell(x + Math.cos(a) * 20, y - 30 + Math.sin(a * 1.3) * 9, 2.6, 2, '#ffd23f', OUT, .8); }
}
function drawFishSpot(n){
  const post = (x, y) => { const a = P(x, y, 0), c = P(x, y, 10); ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); };
  [[18.2, 14.5], [19.4, 14.5], [20.6, 14.5]].forEach(([x, y]) => { post(x, y + .55); });
  box(17.6, 14.0, 3.2, .7, 3, '#b98550', 7);
  ctx.strokeStyle = 'rgba(90,59,34,.55)'; ctx.lineWidth = 1.5;
  for (let k = 1; k < 12; k++){ const a = P(17.6 + k * .267, 14.0, 10), c = P(17.6 + k * .267, 14.7, 10); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); }
  const tip = P(20.4, 14.3, 34), [bx, by] = P(21.4, 15.0), bob = Math.sin(T * 3) * 1.6;
  ctx.strokeStyle = '#6b4226'; ctx.lineWidth = 2.5; const r0 = P(19.2, 14.35, 10); ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.lineTo(tip[0], tip[1]); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tip[0], tip[1]); ctx.lineTo(bx, by + bob); ctx.stroke();
  ell(bx, by + bob, 4, 4, '#fff'); ctx.fillStyle = '#e03a2e'; ctx.beginPath(); ctx.arc(bx, by + bob, 4, Math.PI, 0); ctx.fill();
  if (nodeReady(n)){
    for (let k = 0; k < 2; k++){ const f = (T * .8 + k * .5) % 1; ctx.strokeStyle = `rgba(255,255,255,${1 - f})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(bx, by + 2, 6 + f * 18, 3 + f * 8, 0, 0, 7); ctx.stroke(); }
    const jf = (T * .9) % 1, jx = bx + 14 + jf * 24, jy = by - Math.sin(jf * Math.PI) * 26;
    ell(jx, jy, 7, 3.5, '#ff9a3c', OUT, 1.2, -.6 + jf * 1.2); poly([[jx - 6, jy], [jx - 11, jy - 3], [jx - 11, jy + 3]], '#ff9a3c', OUT, 1);
  }
}
function drawBarn(){
  const b = BLD.barn, {i, j, w, d} = b, wh = 46, rh = 38;
  box(i, j, w, d, wh, '#c8352f');
  // white trim on corners + door
  qY(i + 1.05, i + 1.95, 0, 34, j + d, '#8e2420', '#fff', 3);
  const [a0, a1, a2, a3] = [P(i + 1.05, j + d, 0), P(i + 1.95, j + d, 0), P(i + 1.95, j + d, 34), P(i + 1.05, j + d, 34)];
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a2[0], a2[1]); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a3[0], a3[1]); ctx.stroke();
  qY(i + .25, i + .75, 12, 32, j + d, '#7a1c18', '#fff', 2.5);
  qY(i + 2.25, i + 2.75, 12, 32, j + d, '#7a1c18', '#fff', 2.5);
  qX(j + .5, j + 1.5, 10, 30, i + w, '#7a1c18', '#fff', 2.5);
  gable(i, j, w, d, wh, rh, '#6d5a52', '#c8352f', .28);
  // hayloft window on gable
  const hx = P(i + w, j + d / 2, wh + 12);
  ctx.fillStyle = '#4a1612'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(hx[0], hx[1], 7, 0, 7); ctx.fill(); ctx.stroke();
  ell(hx[0], hx[1] + 2, 4, 3, '#f2cd5e', null);
}
function drawSilo(){
  const b = BLD.silo, [cx, cy] = P(b.i + .5, b.j + .5), rw = 25, bh = 100;
  ctx.fillStyle = '#d9dde3'; ctx.strokeStyle = OUT; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(cx - rw, cy); ctx.lineTo(cx - rw, cy - bh); ctx.lineTo(cx + rw, cy - bh); ctx.lineTo(cx + rw, cy); ctx.ellipse(cx, cy, rw, rw * .5, 0, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
  const g = ctx.createLinearGradient(cx - rw, 0, cx + rw, 0); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(60,40,80,.28)');
  ctx.fillStyle = g; ctx.fillRect(cx - rw, cy - bh, rw * 2, bh);
  ctx.strokeStyle = '#8f98a3'; ctx.lineWidth = 2;
  for (let k = 1; k < 5; k++){ ctx.beginPath(); ctx.ellipse(cx, cy - k * 20, rw, rw * .5, 0, 0, Math.PI); ctx.stroke(); }
  ctx.fillStyle = '#c8352f'; ctx.strokeStyle = OUT; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.ellipse(cx, cy - bh, rw, rw * .5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy - bh, rw, rw * .9, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
  ell(cx - 8, cy - bh - 14, 6, 10, 'rgba(255,255,255,.35)', null, 0, -.5);
  ctx.fillStyle = '#7a4a26'; ctx.fillRect(cx - 7, cy - 24, 14, 24); ctx.strokeRect(cx - 7, cy - 24, 14, 24);
}
function drawMill(){
  const b = BLD.mill, {i, j, w, d} = b;
  box(i, j, w, d, 40, '#d2a572');
  ctx.strokeStyle = 'rgba(90,59,34,.35)'; ctx.lineWidth = 1.5;
  for (let k = 1; k < 8; k++){ const a = P(i + w, j, k * 5), c = P(i + w, j + d, k * 5); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); }
  qY(i + .25, i + .8, 0, 30, j + d, '#6b4226');
  qY(i + 1.2, i + 1.75, 14, 32, j + d, winCol());
  gable(i, j, w, d, 40, 28, '#4f8f5a', '#d2a572', .25);
  const [gx, gy] = P(i + 1.5, j + d, 18);                                       // grain wheel
  ctx.save(); ctx.translate(gx + 24, gy + 12); ctx.rotate(T * (S.mach.mill.q.length ? 1.4 : .15));
  ell(0, 0, 14, 14, '#b98550', OUT, 2.2); ctx.strokeStyle = OUT; ctx.lineWidth = 2.2;
  for (let k = 0; k < 6; k++){ ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(k * 1.047) * 14, Math.sin(k * 1.047) * 14); ctx.stroke(); }
  ell(0, 0, 3.5, 3.5, '#6b4226'); ctx.restore();
  const [sx, sy] = P(i + .2, j + d + .45); ell(sx, sy - 6, 9, 8, '#e8d8a8'); ell(sx, sy - 13, 5, 3, '#c8b078', null);
}
function drawBakery(){
  const b = BLD.bakery, {i, j, w, d} = b;
  box(i, j, w, d, 46, '#f3dcaa');
  qY(i + .25, i + .85, 0, 34, j + d, '#a8532a');
  qY(i + 1.2, i + 1.75, 16, 34, j + d, winCol());
  // striped awning
  const y0 = j + d, y1 = j + d + .45;
  for (let k = 0; k < 4; k++){
    const xa = i + .1 + k * .25, xb = xa + .25;
    poly([P(xa, y0, 40), P(xb, y0, 40), P(xb, y1, 31), P(xa, y1, 31)], k % 2 ? '#fff' : '#e0453a', OUT, 1.5);
  }
  gable(i, j, w, d, 46, 30, '#d9693b', '#f3dcaa', .25);
  box(i + 1.35, j + .55, .3, .3, 26, '#b5533c', 54);
  const [cx, cy] = P(i + 1.5, j + .7, 84);
  if (S.mach.bakery.q.length) for (let k = 0; k < 4; k++){
    const f = ((T * .5 + k / 4) % 1);
    ctx.globalAlpha = (1 - f) * .7; ell(cx + Math.sin(f * 6 + k) * 6 + f * 8, cy - f * 46, 5 + f * 9, 5 + f * 9, '#fff', null); ctx.globalAlpha = 1;
  }
  const [sx, sy] = P(i + 1.5, j + d, 52);                                        // bread sign
  ell(sx + 18, sy + 10, 11, 8, '#e6a850', OUT, 1.8); ell(sx + 18, sy + 8, 7, 4, '#f6c878', null);
}
function drawBoard(){
  const b = BLD.board, {i, j} = b;
  ctx.strokeStyle = OUT; ctx.lineWidth = 2;
  [[.1, .6], [.9, .6]].forEach(([a, c]) => { box(i + a - .05, j + c - .05, .1, .1, 44, '#8a5a30'); });
  qY(i, i + 1, 22, 52, j + .62, '#b98550', OUT, 2.5);
  qY(i + .08, i + .92, 26, 48, j + .66, '#d4a56a', null);
  [[.12, 34, '#fff9e0'], [.42, 38, '#fff'], [.7, 31, '#ffe9a8']].forEach(([a, z, col]) => qY(i + a, i + a + .2, z, z + 12, j + .68, col, OUT, 1.2));
  if (S.orders.some(orderReady)) bubble(...P(i + .5, j + .6, 80), '✅', {ph:1, col:'#3fae24'});
}
function drawTruck(){
  const x = truck.i, y = 5.15;
  const [sx, sy] = P(x + .7, y + .35);
  ell(sx + 6, sy + 4, 36, 11, 'rgba(0,0,0,.2)', null);
  box(x, y, .95, .7, 26, '#f4efe2', 8);
  box(x + .95, y, .42, .7, 20, '#d9453a', 8);
  qY(x, x + .95, 22, 28, y + .7, '#d9453a', null);
  qX(y + .1, y + .6, 20, 28, x + 1.37, winCol(), OUT, 1.5);
  if (truck.loaded) [[.12, .08], [.5, .15], [.3, .38]].forEach(([a, c]) => box(x + a, y + c, .3, .3, 12, '#c4893f', 34));
  [.2, .72, 1.15].forEach(a => { const [wx, wy] = P(x + a, y + .7, 7); ell(wx, wy, 8, 8, '#2f2f33'); ell(wx, wy, 3.5, 3.5, '#c9ccd3', null); });
}
function drawSign(k){
  const p = PLOT_SLOTS[k], [x, y] = P(p.i + .5, p.j + .5), cost = unlockCost();
  ctx.save(); ctx.globalAlpha = .9;
  ctx.fillStyle = '#7a4a26'; ctx.fillRect(x - 2, y - 24, 4, 24);
  ctx.fillStyle = '#c48a52'; ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - 26, y - 50, 52, 30, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4e2d14'; ctx.font = '700 13px Fredoka, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🔒 ' + cost, x, y - 35);
  ctx.restore();
}

function drawPen(id){
  const b = BLD[id], {i, j, w, d} = b, post = (x, y) => { const [a, c] = P(x, y); ctx.strokeStyle = OUT; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(a, c); ctx.lineTo(a, c - 20); ctx.stroke(); ctx.strokeStyle = '#d9a56a'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(a, c); ctx.lineTo(a, c - 20); ctx.stroke(); };
  const rail = (x0, y0, x1, y1, gap) => {
    const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / .5), inGap = f => gap && f > gap[0] - 1e-6 && f < gap[1] + 1e-6;
    for (let k = 0; k <= n; k++){
      const f = k / n, nf = (k + 1) / n, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f;
      if (k < n && !(inGap(f) && inGap(nf))){
        const x2 = x0 + (x1 - x0) * nf, y2 = y0 + (y1 - y0) * nf;
        [6, 14].forEach(z => { const A = P(x, y, z), B = P(x2, y2, z); ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); ctx.strokeStyle = '#e6b57a'; ctx.lineWidth = 2; ctx.stroke(); });
      }
      if (!(gap && f > gap[0] + 1e-6 && f < gap[1] - 1e-6)) post(x, y);
    }
  };
  // back fences
  rail(i, j, i + w, j);                                          // north
  rail(i, j, i, j + d, [.3, .7]);                                // west with gate gap
  // trough
  const [tx0, ty0] = P(i + w - .8, j + .5);
  ctx.fillStyle = '#8a5a30'; ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.fillRect(tx0 - 14, ty0 - 8, 28, 8); ctx.strokeRect(tx0 - 14, ty0 - 8, 28, 8);
  ell(tx0, ty0 - 8, 14, 4, S.pens[id].st === 'hungry' ? '#b38a52' : '#e8b845');
  // animals sorted by depth
  animals.filter(a => a.pen === id && (!PENS[id].lvl || S.level >= PENS[id].lvl)).sort((a, b) => (a.x + a.y) - (b.x + b.y)).forEach(a => ({chick:drawChicken, cow:drawCow, sheep:drawSheep, pig:drawPig})[id](a));
  // front fences
  rail(i, j + d, i + w, j + d);
  rail(i + w, j, i + w, j + d);
}

/* ============================== scene assembly ============================== */
function groundPass(mode = 'all'){
  const base = mode !== 'dyn', anim = mode !== 'static';
  for (let i = -7; i < N + 7; i++) for (let j = -7; j < N + 7; j++){
    const inside = i >= 0 && j >= 0 && i < N && j < N, a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
    if (mode !== 'static' && (a[1] > (H - ty) / sc + 80 || d[1] < -ty / sc - 80 || d[0] < -tx / sc - 100 || b[0] > (W - tx) / sc + 100)) continue;
    if (mode === 'dyn' && !isWater(i, j)) continue;
    const road = !inside && j === 5 && i >= N && i < N + 4;
    let col = road ? ((i + j) & 1 ? '#dcb97c' : '#d4af72') : inside ? ((i + j) & 1 ? '#a1e463' : '#97dc58') : ((i + j) & 1 ? '#6db44a' : '#65aa43');
    if (inside && occ[i][j] === 2) col = ((i + j) & 1) ? '#dcb97c' : '#d4af72';
    if (isWater(i, j)) col = '#58bdea';
    for (const id of Object.keys(PENS)){ const bb = BLD[id]; if (inside && i >= bb.i && i < bb.i + bb.w && j >= bb.j && j < bb.j + bb.d) col = id === 'chick' ? ((i + j) & 1 ? '#d8bf7c' : '#d0b574') : id === 'pig' ? ((i + j) & 1 ? '#b88d5c' : '#ad8354') : ((i + j) & 1 ? '#a9d56a' : '#9fcb60'); }
    if (base) poly([a, b, c, d], col, col, 1);
    if (isWater(i, j)){
      if (!anim) continue;
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      const ph = (T * .4 + i * .37 + j * .21) % 1, [cx, cy] = P(i + .5, j + .5);
      ctx.beginPath(); ctx.moveTo(cx - 16 + ph * 12, cy - 4); ctx.quadraticCurveTo(cx - 8 + ph * 12, cy - 8, cx + ph * 12, cy - 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 2 - ph * 10, cy + 6); ctx.quadraticCurveTo(cx + 10 - ph * 10, cy + 2, cx + 18 - ph * 10, cy + 6); ctx.stroke();
      ctx.lineCap = 'butt';
      const lp = tufts[i + ',' + j][0];
      if (lp[0] > .62){ const [px, py] = P(i + .3 + lp[1] * .4, j + .5); ell(px, py, 9, 4.5, '#3fae5a', '#2d7a3f', 1.2); if (lp[1] > .5) ell(px, py - 2, 2.6, 2, '#ff8fb1', null); }
      if (!isWater(i + 1, j) && i + 1 < N){ ctx.strokeStyle = '#3d8f55'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); }
      continue;
    }
    if (base && (!occ[i]?.[j] || !inside)){
      const tf = tufts[i + ',' + j];
      ctx.strokeStyle = inside ? '#7cc443' : '#4f9a3a'; ctx.lineWidth = 1.5;
      tf.forEach(([u, v]) => { const [x, y] = P(i + .15 + u * .7, j + .15 + v * .7); ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x - 4, y - 5); ctx.moveTo(x, y); ctx.lineTo(x, y - 7); ctx.moveTo(x + 3, y); ctx.lineTo(x + 4, y - 5); ctx.stroke(); });
    }
  }
  // path pebbles
  if (base) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (occ[i][j] === 2){
    const tf = tufts[i + ',' + j]; ctx.fillStyle = '#b8935a';
    tf.forEach(([u, v]) => { const [x, y] = P(i + .2 + u * .6, j + .2 + v * .6); ell(x, y, 2.6, 1.6, '#b8935a', null); });
  }
  if (!anim) return;
  // plot soil
  PLOT_SLOTS.forEach((p, k) => {
    const open = k < S.unlocked;
    const a = P(p.i + .04, p.j + .04), b = P(p.i + .96, p.j + .04), c = P(p.i + .96, p.j + .96), d = P(p.i + .04, p.j + .96);
    if (open){
      poly([a, b, c, d], '#94603a', '#5e3a1f', 2.5);
      ctx.strokeStyle = '#74482a'; ctx.lineWidth = 2;
      for (let f = .25; f < 1; f += .25){ const u = P(p.i + .12, p.j + f), v = P(p.i + .88, p.j + f); ctx.beginPath(); ctx.moveTo(u[0], u[1]); ctx.lineTo(v[0], v[1]); ctx.stroke(); }
    } else {
      poly([a, b, c, d], 'rgba(255,255,255,.08)', 'rgba(90,59,34,.35)', 2);
    }
  });
  // building shadows
  ['barn', 'board', 'windmill', ...MACHS].forEach(k => { const b = BLD[k]; shadowFoot(b.i, b.j, b.w, b.d, b.h * .22); });
  const sb = BLD.silo, [sx, sy] = P(sb.i + .5, sb.j + .5); ell(sx + 24, sy + 4, 34, 12, 'rgba(40,60,20,.22)', null);
  // hover tile
  if (hover && hover.k != null && hover.k <= S.unlocked){
    const p = PLOT_SLOTS[hover.k];
    poly([P(p.i, p.j), P(p.i + 1, p.j), P(p.i + 1, p.j + 1), P(p.i, p.j + 1)], 'rgba(255,255,255,.22)', 'rgba(255,255,255,.8)', 2);
  }
}

/* static ground is cached when zoomed out, so a wide view stays cheap */
const GX0 = -(N + 8) * HW, GY0 = -8 * 2 * HH, gcv = document.createElement('canvas');
let gBuilt = false;
function drawGroundCache(){
  if (!gBuilt){
    gBuilt = true; gcv.width = (N + 8) * HW * 2; gcv.height = (N + 8) * 2 * HH + 16 * HH;
    const g = gcv.getContext('2d'); g.translate(-GX0, -GY0); ctx = g; groundPass('static'); ctx = mainCtx;
  }
  ctx.drawImage(gcv, GX0, GY0);
}
function frame(ts){
  const dt = Math.min(.05, (ts - (frame.last || ts)) / 1000); frame.last = ts; T += dt;
  update(dt);
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#5aa83c'); sky.addColorStop(1, '#4f9a37');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * tx, dpr * ty);
  if (sc * dpr <= 1) { drawGroundCache(); groundPass('dyn'); } else groundPass('all');

  // drawables
  const list = [];
  decor.forEach(o => {
    const v = o.k === 'flower' ? 0 : 1, [x, y] = P(o.i + o.ox, o.j + o.oy);
    if (x < -tx / sc - 80 || x > (W - tx) / sc + 80 || y > (H - ty) / sc + 40 || y < -ty / sc - 160) return;
    list.push({d: o.i + o.ox + o.j + o.oy + (o.k === 'flower' ? -.4 : 0), f: () => {
      if (o.k === 'tree' || o.k === 'apple'){ ell(x + 14, y + 2, 26, 8, 'rgba(40,60,20,.22)', null); drawTree(x, y, o.s, o.k === 'apple'); }
      else if (o.k === 'bush') drawBush(x, y, o.s); else if (o.k === 'flower') drawFlower(x, y, o.s);
      else if (o.k === 'rock') drawRock(x, y); else if (o.k === 'scarecrow') drawScarecrow(x, y); else if (o.k === 'well') drawWell(x, y);
      else if (o.k === 'lamp') drawLamp(x, y); else if (o.k === 'fsign') drawFarmSign(x, y); else drawHay(x, y);
    }});
  });
  PLOT_SLOTS.forEach((p, k) => { if (k < S.unlocked && S.plots[k]) list.push({d: p.i + p.j + 1, f: () => drawPlotCrop(p.i, p.j, S.plots[k])}); else if (k === S.unlocked) list.push({d: p.i + p.j + 1, f: () => drawSign(k)}); });
  const c = b => b.i + b.w / 2 + b.j + b.d / 2;
  const DR = {mill:drawMill, bakery:drawBakery, dairy:drawDairy, loom:drawLoom, kitchen:drawKitchen};
  MACHS.forEach(m => list.push({d: c(BLD[m]), f: DR[m]}));
  list.push({d: c(BLD.barn), f: drawBarn}, {d: c(BLD.silo), f: drawSilo}, {d: c(BLD.windmill), f: drawWindmill}, {d: c(BLD.board), f: drawBoard},
            {d: dog.x + dog.y + .3, f: drawDog}, {d: 9, f: drawBridge}, {d: truck.i + .7 + 5.5, f: drawTruck});
  Object.keys(PENS).forEach(id => list.push({d: c(BLD[id]), f: () => drawPen(id)}));
  NODES.forEach(n => list.push({d: n.type === 'fish' ? 33 : n.i + n.j + 1, f: n.type === 'apple' ? () => drawAppleTree(n) : n.type === 'hive' ? () => drawHive(n) : () => drawFishSpot(n)}));
  ducks.forEach(du => list.push({d: riverC(du.y) + du.y, f: () => drawDuck(du)}));
  list.sort((a, b) => a.d - b.d).forEach(o => { ctx.save(); o.f(); ctx.restore(); });

  // overlay icons
  PLOT_SLOTS.forEach((p, k) => {
    const cr = S.plots[k]; if (k >= S.unlocked || !cr) return;
    if (now() - cr.t0 >= CROPS[cr.crop].time * 1000){ const [x, y] = P(p.i + .5, p.j + .5, 56); bubble(x, y, 'SICKLE', {ph:k, col:'#c98a1a'}); }
  });
  MACHS.forEach((m, idx) => {
    const st = S.mach[m], b = BLD[m], [x, y] = P(b.i + 1, b.j + 1, b.h + 52);
    if (S.level < MACH_LVL[m]){ bubble(x, y, '🔒', {col:'#888', badge:MACH_LVL[m], ph:idx}); return; }
    if (!st.q.length) return;
    const r = RECIPES[m][st.q[0]];
    bubble(x, y, ITEMS[r.out].e, {prog: clamp((now() - st.t0) / (r.time * 1000), 0, 1), badge: st.q.length > 1 ? st.q.length : null, ph: idx});
  });
  NODES.forEach(n => {
    const def = nodeDef(n), [x, y] = P(n.i + n.w / 2, n.j + n.d / 2, n.type === 'apple' ? 112 : n.type === 'hive' ? 52 : 46);
    if (nodeLocked(n)){ if (n.type !== 'apple' || n.id === 'a0') bubble(x, y, '🔒', {col:'#888', badge:def.lvl, ph:n.i}); }
    else if (nodeReady(n)) bubble(x, y, ITEMS[def.out].e, {col:'#c98a1a', ph:n.i});
  });
  Object.keys(PENS).forEach(id => {
    const p = S.pens[id], b = BLD[id], [x, y] = P(b.i + b.w / 2, b.j + b.d / 2, 62);
    if (PENS[id].lvl && S.level < PENS[id].lvl){ bubble(x, y, '🔒', {col:'#888', badge:PENS[id].lvl, ph:1}); return; }
    if (penDone(id) || p.st === 'ready') bubble(x, y, ITEMS[PENS[id].prod].e, {col:'#c98a1a', ph:1});
    else if (p.st === 'hungry') bubble(x, y, '🥣', {col:'#8a8a8a', ph:3});
    else bubble(x, y, '💤', {prog: clamp((now() - p.t0) / (PENS[id].time * 1000), 0, 1), ph:2});
  });

  // butterflies + birds
  flies.forEach(b => {
    const x = b.x + Math.sin(T * .7 + b.ph) * 2.5, y = b.y + Math.cos(T * .5 + b.ph * 2) * 2, [sx, sy] = P(x, y, 34 + Math.sin(T * 2 + b.ph) * 10), fl = Math.abs(Math.sin(T * 14 + b.ph)) * 5 + 1;
    const col = ['#ff9ec4', '#ffd23f', '#9ad0ff'][Math.round(b.ph) % 3]; ell(sx - 3, sy, fl, 4, col, null); ell(sx + 3, sy, fl, 4, col, null); ctx.fillStyle = '#4a3a2a'; ctx.fillRect(sx - .8, sy - 3, 1.6, 6);
  });
  ctx.strokeStyle = 'rgba(60,50,60,.7)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++){
    const span = W / sc + 240, bx = cam.x - W / sc / 2 - 120 + ((T * 38 + k * span / 3) % span), by = cam.y - H / sc / 2 + 70 + k * 30 + Math.sin(T + k) * 6, fl = Math.sin(T * 9 + k * 2) * 6;
    ctx.beginPath(); ctx.moveTo(bx - 9, by + fl * .5); ctx.quadraticCurveTo(bx - 4, by - 5 - fl, bx, by); ctx.quadraticCurveTo(bx + 4, by - 5 - fl, bx + 9, by + fl * .5); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  // particles + floating text
  parts.forEach(p => { ctx.globalAlpha = clamp(1 - p.t / p.life, 0, 1); ell(p.x, p.y, p.r, p.r, p.c, null); });
  ctx.globalAlpha = 1;
  floats.forEach(f => {
    ctx.globalAlpha = clamp(1.4 - f.t, 0, 1); ctx.font = '700 22px Fredoka, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(70,40,10,.9)';
    ctx.strokeText(f.txt, f.x, f.y - f.t * 40); ctx.fillStyle = f.col; ctx.fillText(f.txt, f.x, f.y - f.t * 40);
  });
  ctx.globalAlpha = 1;

  // warm light + drifting cloud shadows + vignette (screen space)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = 'rgba(40,70,30,.06)';
  for (let k = 0; k < 3; k++){ const cx = ((T * 14 + k * W * .45) % (W + 500)) - 250, cy = H * (.25 + k * .27); ctx.beginPath(); ctx.ellipse(cx, cy, 230, 70, -.25, 0, 7); ctx.fill(); }
  const warm = ctx.createRadialGradient(W * .25, H * .1, 20, W * .25, H * .1, Math.max(W, H));
  warm.addColorStop(0, 'rgba(255,225,150,.28)'); warm.addColorStop(.6, 'rgba(255,210,140,.06)'); warm.addColorStop(1, 'rgba(80,40,10,.22)');
  ctx.globalAlpha = 1 - NIGHT * .85; ctx.fillStyle = warm; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  if (NIGHT > .01){
    ctx.fillStyle = `rgba(12,22,72,${NIGHT * .5})`; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * tx, dpr * ty); ctx.globalCompositeOperation = 'lighter';
    LAMPS.forEach(([x, y]) => { const [gx, gy] = P(x, y, 62), g = ctx.createRadialGradient(gx, gy, 2, gx, gy, 90); g.addColorStop(0, `rgba(255,205,110,${.55 * NIGHT})`); g.addColorStop(1, 'rgba(255,170,60,0)'); ctx.fillStyle = g; ctx.fillRect(gx - 90, gy - 90, 180, 180); });
    for (let k = 0; k < 40; k++){
      const fx = 2 + (k * 7.3 % 22) + Math.sin(T * .6 + k) * 1.2, fy = 2 + (k * 5.1 % 22) + Math.cos(T * .5 + k * 1.7) * 1.2, [gx, gy] = P(fx, fy, 14 + Math.sin(T + k) * 8);
      if (gx * sc + tx < -20 || gx * sc + tx > W + 20 || gy * sc + ty < -20 || gy * sc + ty > H + 20) continue;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 9); g.addColorStop(0, `rgba(230,255,120,${NIGHT * (.5 + .5 * Math.sin(T * 3 + k))})`); g.addColorStop(1, 'rgba(230,255,120,0)'); ctx.fillStyle = g; ctx.fillRect(gx - 9, gy - 9, 18, 18);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  if (RAIN > .02){
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = `rgba(50,70,100,${RAIN * .16})`; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = `rgba(215,235,255,${.35 + RAIN * .3})`; ctx.lineWidth = 1.3;
    const n = Math.floor(160 * RAIN); ctx.beginPath();
    for (let k = 0; k < n; k++){ const x = (k * 137.5) % (W + 40), y = ((k * 61.8 + T * (700 + (k % 5) * 90)) % (H + 60)) - 30; ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 15); }
    ctx.stroke();
  }
  drawMini();
  requestAnimationFrame(frame);
}

let acc = 0;
function update(dt){
  NIGHT = clamp(Math.sin(T * Math.PI * 2 / 300) * 1.7 - .35, 0, 1);
  RAIN = clamp(Math.sin(T * Math.PI * 2 / 400 + 4) * 2.2 - 1, 0, 1);
  if (!modal.classList.contains('hidden')) { for (const k in keys) keys[k] = false; }
  else { const sp = 650 / sc * dt; let mv = false; if (keys.arrowleft || keys.a){ cam.x -= sp; mv = true; } if (keys.arrowright || keys.d){ cam.x += sp; mv = true; } if (keys.arrowup || keys.w){ cam.y -= sp; mv = true; } if (keys.arrowdown || keys.s){ cam.y += sp; mv = true; } if (mv) applyCam(); }
  updateAnimals(dt);
  floats.forEach(f => f.t += dt); for (let k = floats.length - 1; k >= 0; k--) if (floats[k].t > 1.4) floats.splice(k, 1);
  parts.forEach(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; }); for (let k = parts.length - 1; k >= 0; k--) if (parts[k].t > parts[k].life) parts.splice(k, 1);
  if (truck.phase === 'out'){ truck.i += 7 * dt; if (truck.i > N + 3){ truck.phase = 'gone'; truck.wait = 1.2; truck.loaded = false; } }
  else if (truck.phase === 'gone'){ truck.wait -= dt; if (truck.wait <= 0){ truck.phase = 'back'; truck.i = N + 3; } }
  else if (truck.phase === 'back'){ truck.i -= 6 * dt; if (truck.i <= 11.6){ truck.i = 11.6; truck.phase = 'idle'; } }
  acc += dt;
  if (acc > .25){ acc = 0; updateMachines(); updateHUD(); renderModal(); }
}
setInterval(save, 5000);
addEventListener('beforeunload', save);

/* ============================== input ============================== */
let hover = null, down = false, lastK = null, gest = null;
const ptrs = new Map(), keys = {};
function toWorld(e){ return [(e.clientX - tx) / sc, (e.clientY - ty) / sc]; }
function pick(e){
  const [wx, wy] = toWorld(e);
  const objs = [];
  PLOT_SLOTS.forEach((p, k) => objs.push({kind:'plot', k, i:p.i, j:p.j, w:1, d:1, h:50}));
  const add = (kind, id) => objs.push(Object.assign({kind, id}, BLD[id]));
  MACHS.forEach(m => add('mach', m)); add('barn', 'barn'); add('barn', 'silo'); add('orders', 'board'); Object.keys(PENS).forEach(id => add('pen', id));
  NODES.forEach(n => objs.push({kind:'node', n, i:n.i, j:n.j, w:n.w, d:n.d, h:n.h}));
  objs.push({kind:'dog', i:dog.x - .5, j:dog.y - .5, w:1, d:1, h:32});
  objs.push({kind:'truck', i:truck.i, j:5.15, w:1.4, d:.7, h:34});
  objs.sort((a, b) => (b.i + b.w / 2 + b.j + b.d / 2) - (a.i + a.w / 2 + a.j + a.d / 2));
  for (const z of [0, 14, 30, 50, 75, 100, 125]){
    const yy = wy + z, i = (wx / HW + yy / HH) / 2, j = (yy / HH - wx / HW) / 2;
    for (const o of objs) if (z <= o.h + 8 && i >= o.i && i < o.i + o.w && j >= o.j && j < o.j + o.d) return o;
  }
  return null;
}
function act(o, silent){
  if (!o) return;
  if (o.kind === 'plot') tapPlot(o.k, silent);
  else if (silent) return;
  else if (o.kind === 'mach'){ if (S.level < MACH_LVL[o.id]) toast(`${MACH_NAME[o.id]} unlocks at level ${MACH_LVL[o.id]}`); else openModal('mach', o.id); }
  else if (o.kind === 'barn') openModal('barn');
  else if (o.kind === 'orders') openModal('orders');
  else if (o.kind === 'pen') tapPen(o.id);
  else if (o.kind === 'node') tapNode(o.n);
  else if (o.kind === 'dog'){ dog.bark = .7; sfx('woof'); const [dx, dy] = P(dog.x, dog.y, 40); floatText(dx, dy, 'Woof!', '#ffe9a0'); }
  else if (o.kind === 'truck') toast(truck.phase === 'idle' ? 'Deliver orders at the board to send the truck!' : 'Vroom vroom! 🚚');
  updateHUD(); save();
}
cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if (ptrs.size >= 2){ gest = {mode:'pinch'}; down = false; return; }
  const o = pick(e);
  if (o && o.kind === 'plot'){ gest = {mode:'plot'}; down = true; lastK = o.k; act(o, false); }
  else gest = {mode:'drag', o, sx:e.clientX, sy:e.clientY, cx:cam.x, cy:cam.y, moved:false};
});
cv.addEventListener('pointermove', e => {
  const prev = ptrs.get(e.pointerId);
  if (prev){
    if (ptrs.size >= 2 && gest && gest.mode === 'pinch'){
      const [a, b] = [...ptrs.values()], d0 = Math.hypot(a.x - b.x, a.y - b.y), m0x = (a.x + b.x) / 2, m0y = (a.y + b.y) / 2;
      prev.x = e.clientX; prev.y = e.clientY;
      const d1 = Math.hypot(a.x - b.x, a.y - b.y), m1x = (a.x + b.x) / 2, m1y = (a.y + b.y) / 2;
      if (d0 > 0) zoomAt(m1x, m1y, d1 / d0);
      cam.x -= (m1x - m0x) / sc; cam.y -= (m1y - m0y) / sc; applyCam();
      return;
    }
    prev.x = e.clientX; prev.y = e.clientY;
  }
  if (gest && gest.mode === 'drag'){
    const dx = e.clientX - gest.sx, dy = e.clientY - gest.sy;
    if (!gest.moved && Math.hypot(dx, dy) > 7) gest.moved = true;
    if (gest.moved){ cam.x = gest.cx - dx / sc; cam.y = gest.cy - dy / sc; applyCam(); cv.style.cursor = 'grabbing'; }
    return;
  }
  if (e.pointerType === 'mouse' || (gest && gest.mode === 'plot')){
    const o = pick(e); hover = o && o.kind === 'plot' ? {k:o.k} : null;
    if (!gest) cv.style.cursor = o ? 'pointer' : 'grab';
    if (down && o && o.kind === 'plot' && o.k !== lastK){ lastK = o.k; act(o, true); }
  }
});
function endPtr(e, cancel){
  ptrs.delete(e.pointerId);
  if (gest && gest.mode === 'drag' && !gest.moved && !cancel && gest.o && ptrs.size === 0) act(gest.o, false);
  if (!ptrs.size){ gest = null; down = false; lastK = null; cv.style.cursor = ''; }
}
cv.addEventListener('pointerup', e => endPtr(e, false));
cv.addEventListener('pointercancel', e => endPtr(e, true));
cv.addEventListener('pointerleave', () => { hover = null; });
cv.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * .0015)); }, {passive:false});
addEventListener('keydown', e => {
  if (e.key === '+' || e.key === '=') zoomAt(W / 2, H / 2, 1.2); else if (e.key === '-') zoomAt(W / 2, H / 2, .83);
  else keys[e.key.toLowerCase()] = true;
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
$('zin').onclick = () => zoomAt(W / 2, H / 2, 1.25);
$('zout').onclick = () => zoomAt(W / 2, H / 2, .8);
$('home').onclick = () => { cam.x = 60; cam.y = 330; applyCam(); };
function miniGo(e){ const r = mini.getBoundingClientRect(); cam.x = (e.clientX - r.left) / r.width * MW / MS - N * HW; cam.y = (e.clientY - r.top) / r.height * MH / MS; applyCam(); }
let miniDown = false;
mini.addEventListener('pointerdown', e => { miniDown = true; mini.setPointerCapture(e.pointerId); miniGo(e); });
mini.addEventListener('pointermove', e => { if (miniDown) miniGo(e); });
mini.addEventListener('pointerup', () => { miniDown = false; });

/* ============================== boot ============================== */
buildMini(); updateMachines(); updateHUD(); renderSeeds();
setTimeout(() => toast('Tap a plot to plant 🌾 · drag to explore the big map!'), 700);
requestAnimationFrame(frame);
})();
