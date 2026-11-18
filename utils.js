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

/* ===== Безопасные хелперы (добавлены, не ломают старое) ===== */

// Экранирование HTML
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));

// Нормализация редкости: 'Ultimate' → 'ultimate', ' ultimate ' → 'ultimate'
const normalizeRarity = r => {
  const n = String(r || '').trim().toLowerCase();
  return (typeof RARITY !== 'undefined' && n in RARITY) ? n : 'common';
};

// Поиск юнита по имени с нормализацией (trim + lower)
const findUnit = name => {
  const n = String(name || '').trim().toLowerCase();
  return ALL_UNITS.find(u => u.name.trim().toLowerCase() === n);
};

// Глубокая копия объекта (без structuredClone — для совместимости)
const deepClone = obj => obj == null ? obj : JSON.parse(JSON.stringify(obj));

// Валидный массив инвентаря
const safeInventory = inv => Array.isArray(inv) ? inv : [];

// Иконка по имени с безопасным фолбэком (заменяет старый iconOf)
const iconOf = (name, hide = false) => {
  const it = findUnit(name);
  if (!it) return `<img src="${GIFT_IMG}" alt="">`;
  if (hide && it.secret) return `<img src="${FALLBACK_IMG}" alt="">`;
  return it.img ? `<img src="${it.img}" alt="${esc(it.name)}">` : `<img src="${GIFT_IMG}" alt="">`;
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
// config.js

const RARITY = {
  ultimate:  { label: 'Ultimate',  color: '#ff00d4', w: 0.5 },
  exclusive: { label: 'Exclusive', color: '#eec5ff', w: 100 },
  secret:    { label: 'Secret',    color: '#fff',    w: 1 },
  leader:    { label: 'Leader',    color: '#4bb152', w: 2 },
  mythic:    { label: 'Mythic',    color: '#b51500', w: 6 },
  legendary: { label: 'Legendary', color: '#fef605', w: 20 },
  epic:      { label: 'Epic',      color: '#b554e8', w: 80 },
  rare:      { label: 'Rare',      color: '#2557a6', w: 300 },
  common:    { label: 'Common',    color: '#6cb862', w: 1000 }
};

const RARITY_ORDER = [
  'ultimate', 'exclusive', 'secret', 'leader',
  'mythic', 'legendary', 'epic', 'rare', 'common'
];

// --- Классы для радужного Ultimate ---
const RARITY_CLASS = { ultimate: 'rar-ultimate' };
const rarityTextClass = r => RARITY_CLASS[r] || '';
const rarityIconClass = r => r === 'ultimate' ? 'rar-ultimate-icon' : '';
const rarityCardClass = r => r === 'ultimate' ? 'rar-ultimate-card' : '';

const GIFT_IMG = 'https://yourimageshare.com/ib/cwwrwslAaB.png';
const GEM_CRATE_IMG = 'https://yourimageshare.com/ib/fKPwU3NRf6.png';
const FALLBACK_IMG = 'https://yourimageshare.com/ib/w1HE053pTL.jpg';

const SHOP_ITEM = ALL_UNITS.find(u => u.name === 'Eggren');

const GACHA_POOL = [
  { amount: 10,  w: 50, color: '#888' },
  { amount: 25,  w: 30, color: '#3b82f6' },
  { amount: 50,  w: 15, color: '#a855f7' },
  { amount: 100, w: 5,  color: '#eab308' }
];

const GACHA_COOLDOWN = 600000;
const MAX_GACHA_SPINS = 5;

const TYPE_TRANS_RU = {
  'Type': 'Тип',
  'Damage': 'Урон',
  'Range': 'Дальность',
  'Cooldown': 'Перезарядка',
  'Limit': 'Лимит',
  'Stun Time': 'Время стана',
  'Damage Boost': 'Бонус урона',
  'Spawn Cooldown': 'Перезарядка спавна',
  'Ally HP': 'Здоровье миньона',
  'Ally DPS': 'Урон миньона',
  'Knockback Strength': 'Сила отбрасывания',
  'Critical Stun Chance': 'Шанс стана',
  'Critical Stun Damage Multiplier': 'Множитель урона',
  'Critical Stun Time': 'Время стана',
  'Cheating': 'Читерство',
  'Slowing': 'Замедление',
  'Critical Damage Multiplier': 'Множитель крит. урона',
  'Critical Damage Chance': 'Шанс крит. урона',
  'All Stats Nerf': 'Ослабление статов'
};

const TYPE_TRANS_EN = {
  'Type': 'Type',
  'Damage': 'Damage',
  'Range': 'Range',
  'Cooldown': 'Cooldown',
  'Limit': 'Limit',
  'Stun Time': 'Stun Time',
  'Damage Boost': 'Damage Boost',
  'Spawn Cooldown': 'Spawn Cooldown',
  'Ally HP': 'Minion HP',
  'Ally DPS': 'Minion DPS',
  'Knockback Strength': 'Knockback Strength',
  'Critical Stun Chance': 'Stun Chance',
  'Critical Stun Damage Multiplier': 'Damage Multiplier',
  'Critical Stun Time': 'Stun Time',
  'Cheating': 'Cheating',
  'Slowing': 'Slowing',
  'Critical Damage Multiplier': 'Crit Damage Multiplier',
  'Critical Damage Chance': 'Crit Damage Chance',
  'All Stats Nerf': 'All Stats Nerf'
};

const L10N = {
  ru: {
    title: 'Grenko Crates',
    lblBal: 'Баланс',
    lblGems: 'Гемы',
    lblInv: 'Инвентарь',
    lblChances: 'Шансы',
    lblIndex: 'Индекс',
    lblShop: 'Магазин',
    lblProfile: 'Профиль',
    lblOpen: 'Открыть',
    lblOpen10: 'x10',
    lblInvTitle: 'Инвентарь',
    lblInvHint: 'Клик — продать',
    emptyInv: 'Инвентарь пуст',
    lblChancesTitle: 'Шансы выпадения',
    clickOpen: 'Нажми «Открыть»',
    priceAfter: 'Цена продажи',
    takeInv: 'Забрать в инвентарь',
    sold: 'Продан',
    soldAll: 'Продано',
    for: 'за',
    history: 'Последние',
    noHist: 'История открытий появится здесь',
    autoOpen: '⚡ Авто-открытие',
    sellAll: 'Продать всё',
    typeTrans: TYPE_TRANS_RU
  },
  en: {
    title: 'Grenko Crates',
    lblBal: 'Balance',
    lblGems: 'Gems',
    lblInv: 'Inventory',
    lblChances: 'Chances',
    lblIndex: 'Index',
    lblShop: 'Shop',
    lblProfile: 'Profile',
    lblOpen: 'Open',
    lblOpen10: 'x10',
    lblInvTitle: 'Inventory',
    lblInvHint: 'Click to sell',
    emptyInv: 'Inventory is empty',
    lblChancesTitle: 'Drop Chances',
    clickOpen: 'Click "Open"',
    priceAfter: 'Sell price',
    takeInv: 'Take to inventory',
    sold: 'Sold',
    soldAll: 'Sold',
    for: 'for',
    history: 'Recent',
    noHist: 'Open history will appear here',
    autoOpen: '⚡ Auto-Open',
    sellAll: 'Sell All',
    typeTrans: TYPE_TRANS_EN
  }
};
