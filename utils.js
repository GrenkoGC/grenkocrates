// utils.js
const $=id=>document.getElementById(id);

function toast(m){
  const t = $('toast');
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove('show'), 2000);
}

// Получаем полные данные юнита из units.js по имени
const getItemData = (name) => ALL_UNITS.find(u => u.name === name);

const iconOf=(name,hide=false)=>{
  const it = getItemData(name);
  if(!it) return `<img src="${GIFT_IMG}">`;
  if(hide && it.secret) return `<img src="https://yourimageshare.com/ib/w1HE053pTL.jpg">`;
  return it.img ? `<img src="${it.img}" alt="${name}">` : `<img src="${GIFT_IMG}">`;
};

// Выбор предмета на основе шансов из crates.js
const randomItem = () => {
  const pool = CRATES[activeCrate].pool;
  let random = Math.random() * 100;
  
  for (const entry of pool) {
    random -= entry.chance;
    if (random <= 0) {
      return getItemData(entry.name);
    }
  }
  return getItemData(pool[0].name);
};