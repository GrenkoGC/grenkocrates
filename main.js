// ... (начало файла с let gameSettings = { luck: 1, forceDrop: null }; и функциями рендера)

async function loadWithAuth() {
  const savedUser = localStorage.getItem('grenko_tg_user');
  if (savedUser) {
    try { tgWebData = JSON.parse(savedUser); } catch(e) { localStorage.removeItem('grenko_tg_user'); }
  }

  try {
    const local = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (local) applySaveData(local);
  } catch(e) {}

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
          applySaveData(cloudData); // Сначала грузим сейв
          
          // ПОТОМ применяем настройки удачи, чтобы их не перезаписало
          if (cloudData.luck) gameSettings.luck = cloudData.luck;
          if (cloudData.forceDrop !== undefined) gameSettings.forceDrop = cloudData.forceDrop;
          
          save(); 
          toast('Прогресс загружен из облака');
        }
      }
    } catch(e) { console.error('Ошибка загрузки:', e); }
  }
}

function initApp() {
  $('openBtn').onclick = () => openCase(false);
  $('open10Btn').onclick = () => openCase(true);
  $('autoBtn').onclick = () => { isAutoOpen = !isAutoOpen; $('autoBtn').classList.toggle('active', isAutoOpen); save(); if(isAutoOpen && !spinning) processSpin(randomItem(), true); };
  $('chancesBtn').onclick = () => { sfx.click(); renderChances(); $('chancesOverlay').classList.add('show'); };
  $('indexBtn').onclick = () => { sfx.click(); renderIndex(); $('indexOverlay').classList.add('show'); };
  $('shopBtn').onclick = () => { sfx.click(); renderShop(); $('shopOverlay').classList.add('show'); };
  $('profileBtn').onclick = () => { sfx.click(); renderProfile(); $('profileOverlay').classList.add('show'); };
  $('muteBtn').onclick = () => { muted = !muted; $('soundOn').style.display = muted ? 'none' : 'block'; $('soundOff').style.display = muted ? 'block' : 'none'; if(!muted) sfx.click(); save(); };
  
  $('resetBtn').onclick = () => {
    if(!confirm('Сбросить весь прогресс? Это нельзя отменить.')) return;
    localStorage.removeItem(SAVE_KEY);
    balance = 1000; gems = 50; inventory = []; activeCrate = 'crate1'; lang = 'ru'; autoSellRarities = new Set(); gachaSpins = 0; gachaLastTick = Date.now(); muted = false; casesOpened = 0;
    document.querySelectorAll('.auto-sell-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.crate-btn').forEach(b => b.classList.toggle('active', b.dataset.id === 'crate1'));
    $('soundOn').style.display = 'block'; $('soundOff').style.display = 'none';
    slotIcon.innerHTML = `<img src="${CRATES.crate1.img}">`;
    renderInventory(); updateUI(); updateGachaUI(); applyLang(); toast('Прогресс сброшен');
  };

  // Гача
  $('gachaBtn').onclick = () => { sfx.click(); $('gachaOverlay').classList.add('show'); updateGachaUI(); $('gachaResult').textContent = ''; };
  $('gachaSpinBtn').onclick = playGacha;
  $('multiClose').onclick = () => { sfx.click(); multiOverlay.classList.remove('show'); setTimeout(()=>{slotIcon.innerHTML=`<img src="${CRATES[activeCrate].img}">`;slotName.textContent=L10N[lang].clickOpen;},320); };

  // Музыка
  bgMusic.volume = 0.2; volumeSlider.value = 0.2;
  volumeSlider.addEventListener('input', e => { bgMusic.volume = e.target.value; save(); });
  document.addEventListener('click', () => { bgMusic.play().catch(()=>{}); }, { once: true });

  // Кнопки авто-продажи
  document.querySelectorAll('.auto-sell-btn').forEach(btn => {
    btn.onclick = () => {
      const r = btn.dataset.r;
      if(autoSellRarities.has(r)){autoSellRarities.delete(r);btn.classList.remove('active');}
      else{autoSellRarities.add(r);btn.classList.add('active');}
      sfx.click();save();
    };
  });

  // Закрытие оверлеев по клику на фон
  document.querySelectorAll('.overlay').forEach(el => {
    el.onclick = e => {
      if(e.target === el) {
        el.classList.remove('show');
        if(el.id === 'dropOverlay' || el.id === 'multiOverlay') {
          setTimeout(()=>{ slotIcon.innerHTML = `<img src="${CRATES[activeCrate].img}">`; slotName.textContent = L10N[lang].clickOpen; }, 320);
        }
      }
    };
  });

  // Загрузка
  loadWithAuth().then(() => {
    if (typeof balance === 'undefined' || balance === null) balance = 1000;
    if (typeof gems === 'undefined' || gems === null) gems = 50;
    if (!Array.isArray(inventory)) inventory = [];

    document.querySelectorAll('.crate-btn').forEach(b => b.classList.toggle('active', b.dataset.id === activeCrate));
    document.querySelectorAll('.auto-sell-btn').forEach(b => b.classList.toggle('active', autoSellRarities.has(b.dataset.r)));
    $('soundOn').style.display = muted ? 'none' : 'block';
    $('soundOff').style.display = muted ? 'block' : 'none';
    $('autoBtn').classList.toggle('active', isAutoOpen);
    slotIcon.innerHTML = `<img src="${CRATES[activeCrate].img}">`;
    applyLang();
    updateGachaUI();
  });
}

// Автосохранение
setInterval(() => { save(); }, 3000);

document.addEventListener('DOMContentLoaded', () => {
  const crateListEl = $('crateList');
  Object.keys(CRATES).forEach(id => {
    const btn = document.createElement('button');
    btn.className = `crate-btn ${id === activeCrate ? 'active' : ''}`;
    btn.dataset.id = id;
    btn.innerHTML = `<img src="${CRATES[id].img}" alt="crate"> ${CRATES[id].name}`;
    btn.onclick = () => {
      document.querySelectorAll('.crate-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sfx.click();
      activeCrate = id;
      slotIcon.innerHTML = `<img src="${CRATES[id].img}">`;
      renderChances();
      updateUI();
      save();
    };
    crateListEl.appendChild(btn);
  });

  initApp();
});
