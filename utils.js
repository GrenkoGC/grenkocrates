// utils.js
const $=id=>document.getElementById(id);

function toast(m){
  const t = $('toast');
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove('show'), 2000);
}

const getItemData = (name) => ALL_UNITS.find(u => u.name === name);

const iconOf=(name,hide=false)=>{
  const it = getItemData(name);
  if(!it) return `<img src="${GIFT_IMG}">`;
  if(hide && it.secret) return `<img src="https://yourimageshare.com/ib/w1HE053pTL.jpg">`;
  return it.img ? `<img src="${it.img}" alt="${name}">` : `<img src="${GIFT_IMG}">`;
};

const randomItem = () => {
  // 1. Проверка на форс-дроп
  if (gameSettings && gameSettings.forceDrop) {
    const forced = getItemData(gameSettings.forceDrop);
    if (forced) {
      gameSettings.forceDrop = null; 
      return forced;
    }
  }

  const pool = CRATES[activeCrate].pool;
  let totalChance = 0;
  
  // 2. Множитель удачи
  const luck = (gameSettings && gameSettings.luck) ? gameSettings.luck : 1;
  const modifiedPool = pool.map(entry => {
    const item = getItemData(entry.name);
    let chance = entry.chance;
    if (['exclusive', 'secret', 'leader', 'mythic'].includes(item.r)) {
      chance *= luck;
    }
    totalChance += chance;
    return { name: entry.name, chance };
  });

  // 3. Выбор
  let random = Math.random() * totalChance;
  for (const entry of modifiedPool) {
    random -= entry.chance;
    if (random <= 0) return getItemData(entry.name);
  }
  return getItemData(modifiedPool[0].name);
};
