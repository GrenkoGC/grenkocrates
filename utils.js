// utils.js

// Страховки от "is not defined"
const FALLBACK = typeof FALLBACK_IMG !== 'undefined' ? FALLBACK_IMG : 'https://yourimageshare.com/ib/w1HE053pTL.jpg';
const GIFT = typeof GIFT_IMG !== 'undefined' ? GIFT_IMG : 'https://yourimageshare.com/ib/cwwrwslAaB.png';

const $ = id => document.getElementById(id);
const $ = id => document.getElementById(id);

function toast(m) {
  const t = $('toast');
  if (!t) return; // Если элемента нет (например, в админке), просто выходим
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2000);
}

const getItemData = name => ALL_UNITS.find(u => u.name === name);

/* ===== Безопасные хелперы ===== */
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
  if (!it) return `<img src="${GIFT}" alt="">`;
  if (hide && it.secret) return `<img src="${FALLBACK}" alt="">`;
  return it.img ? `<img src="${it.img}" alt="${esc(it.name)}">` : `<img src="${GIFT}" alt="">`;
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
