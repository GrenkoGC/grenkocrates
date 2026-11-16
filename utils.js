// utils.js

const $ = id => document.getElementById(id);

function toast(m) {
  const t = $('toast');
  if (!t) return;
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2000);
}

const getItemData = name => ALL_UNITS.find(u => u.name === name);

const iconOf = (name, hide = false) => {
  const it = getItemData(name);
  if (!it) return `<img src="${GIFT_IMG}">`;
  if (hide && it.secret) return `<img src="https://yourimageshare.com/ib/w1HE053pTL.jpg">`;
  return it.img ? `<img src="${it.img}" alt="${name}">` : `<img src="${GIFT_IMG}">`;
};

// --- Выбор предмета ---
const randomItem = () => {
  if (typeof gameSettings !== 'undefined' && gameSettings.forceDrop) {
    const f = getItemData(gameSettings.forceDrop);
    if (f) {
      gameSettings.forceDrop = null;
      return f;
    }
  }

  const pool = CRATES[activeCrate].pool;
  const luck = (typeof gameSettings !== 'undefined' && gameSettings.luck) ? Math.max(0.1, Math.min(100, gameSettings.luck)) : 1;
  const RARE = new Set(['exclusive', 'secret', 'leader', 'mythic']);

  let total = 0;
  const mod = pool.map(e => {
    const it = getItemData(e.name);
    const c = e.chance * (RARE.has(it.r) ? luck : 1);
    total += c;
    return { name: e.name, chance: c };
  });

  let r = Math.random() * total;
  for (const e of mod) {
    r -= e.chance;
    if (r <= 0) return getItemData(e.name);
  }
  return getItemData(mod[0].name);
};
