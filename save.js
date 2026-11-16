// save.js
async function save() {
  const saveData = { balance, gems, inventory, activeCrate, lang, autoSell: [...autoSellRarities], gachaSpins, gachaLastTick, vol: bgMusic.volume, muted, casesOpened };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData)); 
  
  if (!tgWebData) return; 

  try {
    await fetch(`${API_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: tgWebData.id, saveData })
    });
  } catch (e) { console.error('Ошибка сохранения:', e); }
}

async function load() {
  try {
    const local = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (local) applySaveData(local);
  } catch (e) {}

  if (tgWebData) {
    try {
      const res = await fetch(`${API_URL}/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tgWebData.id })
      });
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && Object.keys(cloudData).length > 0) {
          applySaveData(cloudData);
          save(); 
          toast('Прогресс загружен из облака');
        }
      }
    } catch (e) { console.error('Ошибка загрузки:', e); }
  }
}

function applySaveData(s) {
  if (!s) return;
  if (typeof s.balance === 'number') balance = s.balance;
  if (typeof s.gems === 'number') gems = s.gems;
  if (Array.isArray(s.inventory)) inventory = s.inventory;
  if (s.activeCrate && CRATES[s.activeCrate]) activeCrate = s.activeCrate;
  if (s.lang) lang = s.lang;
  if (Array.isArray(s.autoSell)) autoSellRarities = new Set(s.autoSell);
  if (typeof s.gachaSpins === 'number') gachaSpins = s.gachaSpins;
  if (typeof s.gachaLastTick === 'number') gachaLastTick = s.gachaLastTick;
  if (typeof s.muted === 'boolean') muted = s.muted;
  if (typeof s.vol === 'number') { bgMusic.volume = s.vol; volumeSlider.value = s.vol; }
  if (typeof s.casesOpened === 'number') casesOpened = s.casesOpened;
}