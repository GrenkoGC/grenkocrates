// utils.js

window.$ = window.$ || function(id) { return document.getElementById(id); };

function toast(m) {
  const t = window.$('toast');
  if (!t) return;
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2000);
}

const getItemData = name => ALL_UNITS.find(u => u.name === name);

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));

const normalizeRarity = r => {
  const n = String(r || '').trim().toLowerCase();
  return (typeof RARITY !== 'undefined' && n in RARITY) ? n : 'common';
};

const findUnit = name => {
  const n = String(name || '').trim().toLowerCase();
  return ALL_UNITS.find(u => u.name.trim().toLowerCase() === n);
};

const deepClone = obj => obj == null ? obj : JSON.parse(JSON.stringify(obj));

const safeInventory = inv => Array.isArray(inv) ? inv : [];

const iconOf = (name, hide = false) => {
  const it = findUnit(name);
  if (!it) return `<img src="${GIFT_IMG}" alt="">`;
  if (hide && it.secret) return `<img src="${FALLBACK_IMG}" alt="">`;
  return it.img ? `<img src="${it.img}" alt="${esc(it.name)}">` : `<img src="${GIFT_IMG}" alt="">`;
};

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
