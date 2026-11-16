// main.js
const scene = $('scene'), slotIcon = $('slotIcon'), slotName = $('slotName'), flash = $('flash'), dropOverlay = $('dropOverlay'), multiOverlay = $('multiOverlay'), invGrid = $('invGrid');
const bgMusic = $('bgMusic'), volumeSlider = $('volumeSlider');

/* ===== UI ===== */
function updateUI(){
  $('invCount').textContent=inventory.length;
  $('balance').textContent=Math.floor(balance);
  $('gems').textContent=Math.floor(gems);
  $('openBtn').disabled=spinning;$('open10Btn').disabled=spinning;
  const c=CRATES[activeCrate],l=L10N[lang];
  $('lblOpen').textContent=`${l.lblOpen} · ${c.cost} ${c.currency}`;
  $('lblOpen10').textContent=`${l.lblOpen10} · ${c.cost*10} ${c.currency}`;
  $('sellAllBtn').textContent=l.sellAll;
}

function applyLang(){
  const t=L10N[lang];
  $('title').textContent=t.title;
  $('lblBal').textContent=t.lblBal;
  $('lblGems').textContent=t.lblGems;
  $('lblInv').textContent=t.lblInv;
  $('lblChances').textContent=t.lblChances;
  const elIndex = $('lblIndex'); if (elIndex) elIndex.textContent = t.lblIndex || 'Индекс';
  const elShop = $('lblShop'); if (elShop) elShop.textContent = t.lblShop || 'Магазин';
  const elProfile = $('lblProfile'); if (elProfile) elProfile.textContent = t.lblProfile || 'Профиль';
  
  $('lblInvTitle').textContent=t.lblInvTitle;
  $('lblInvHint').textContent=t.lblInvHint;
  $('invGrid').setAttribute('data-empty',t.emptyInv);
  $('lblChancesTitle').textContent=t.lblChancesTitle;
  $('dClose').textContent=t.takeInv;
  $('langBtn').textContent=lang==='ru'?'EN':'RU';
  $('autoBtn').textContent=t.autoOpen;
  if(!inventory.length)$('history').textContent=t.noHist;
  if(!spinning&&!dropOverlay.classList.contains('show')&&!multiOverlay.classList.contains('show'))$('slotName').textContent=t.clickOpen;
  if($('chancesOverlay').classList.contains('show'))renderChances();
  updateUI();renderInventory();
}

function renderInventory(){
  invGrid.innerHTML='';
  inventory.forEach((it,i)=>{
    const el=document.createElement('div');el.className=`inv-item ${it.r}`;
    el.innerHTML=`<div class="icon" style="filter:drop-shadow(0 0 6px ${RARITY[it.r].color}80)">${iconOf(it.name,false)}</div><div style="color:var(--txt);margin-top:4px;font-size:10px;word-break:break-word;line-height:1.1">${it.name}</div><div class="price">${it.price} $</div>`;
    
    let statsHtml = '';
    if(it.stats){
      statsHtml = Object.entries(it.stats).map(([k,v])=>{
        const tk = L10N[lang].typeTrans[k] || k;
        return `<div class="st-row"><span class="st-name">${tk}:</span><span class="st-val">${v}</span></div>`;
      }).join('');
    } else {
      statsHtml = '<div class="st-row" style="justify-content:center;color:var(--txt2)">Нет характеристик</div>';
    }

    const tooltip = document.getElementById('invTooltip');
    
    el.onmouseenter = () => {
      if(window.innerWidth < 768) return;
      tooltip.innerHTML = statsHtml;
      tooltip.classList.add('show');
      const rect = el.getBoundingClientRect();
      tooltip.style.left = Math.min(window.innerWidth - 210, Math.max(10, rect.left + rect.width/2 - 100)) + 'px';
      tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
    };
    
    el.onmouseleave = () => { tooltip.classList.remove('show'); };
    
    el.onclick=()=>{
      const r = RARITY[it.r];
      $('dIcon').innerHTML=iconOf(it.name,false);
      $('dIcon').style.filter=`drop-shadow(0 0 20px ${r.color}cc)`;
      $('dName').textContent=it.name;
      $('dRarity').textContent=r.label; $('dRarity').style.color=r.color;
      $('dPrice').textContent=`${L10N[lang].priceAfter}: ${it.price} $`;
      $('dPrice').style.color=r.color;
      $('dropCard').style.borderColor=r.color;
      $('dropCard').style.boxShadow=`0 0 30px ${r.color}33, inset 0 0 20px ${r.color}11`;
      
      const s=$('dStats');
      if(it.stats){
        s.style.display='flex';
        s.innerHTML=Object.entries(it.stats).filter(([k,v])=>v).map(([k,v],idx)=>{
          const tk=L10N[lang].typeTrans[k]||k;
          return`<div class="stat-row" style="${idx===0?'color:#fff;font-weight:bold;margin-bottom:4px':''}"><span>${tk}:</span><span>${v}</span></div>`;
        }).join('');
      } else {
        s.style.display='none';
      }

      const btn = $('dClose');
      btn.textContent = `Продать за ${it.price} $`;
      btn.style.borderColor = 'var(--red)';
      btn.style.color = 'var(--red)';
      
      btn.onclick = () => {
        sfx.click();
        dropOverlay.classList.remove('show');
        inventory.splice(i,1);
        balance += it.price;
        updateUI(); renderInventory(); sfx.sell();
        toast(`${L10N[lang].sold} ${it.name}`);
        save();
        
        btn.textContent = L10N[lang].takeInv;
        btn.style.borderColor = 'var(--lin)';
        btn.style.color = 'var(--txt)';
        btn.onclick = () => { sfx.click(); dropOverlay.classList.remove('show'); setTimeout(()=>{slotIcon.innerHTML=`<img src="${CRATES[activeCrate].img}">`;slotName.textContent=L10N[lang].clickOpen;},320); };
        setTimeout(()=>{slotIcon.innerHTML=`<img src="${CRATES[activeCrate].img}">`;slotName.textContent=L10N[lang].clickOpen;},320);
      };

      dropOverlay.classList.add('show');
      sfx.drop(it.r);
    };
    
    invGrid.appendChild(el);
  });
  updateUI();
}

function renderChances(){
  const pool = CRATES[activeCrate].pool;
  const list = $('chancesList'), sum = $('raritySummary');
  list.innerHTML=''; sum.innerHTML='';
  
  const byR = {};
  pool.forEach(entry => {
    const item = getItemData(entry.name);
    if (!item) return;
    if (!byR[item.r]) byR[item.r] = 0;
    byR[item.r] += entry.chance;
  });

  Object.entries(RARITY).forEach(([k,v])=>{
    if(!byR[k]) return;
    const s=document.createElement('span');
    s.style.color=v.color;
    s.innerHTML=`${v.label} <b>${byR[k].toFixed(2)}%</b>`;
    sum.appendChild(s);
  });

  [...pool].sort((a,b)=>b.chance-a.chance).forEach(entry => {
    const it = getItemData(entry.name);
    if (!it) return;
    const r = RARITY[it.r];
    const row = document.createElement('div');
    row.className = 'chance-row';
    row.style.borderLeftColor = r.color;
    const displayName = it.secret ? '???' : it.name;
    
    row.innerHTML = `<div class="ci" style="width:30px;height:30px;filter:drop-shadow(0 0 4px ${r.color}80)">${iconOf(it.name,true)}</div><div class="cn">${displayName}<div class="cr" style="color:${r.color}">${r.label} · ${it.price} $</div><div class="chance-bar"><div data-w="${Math.min(entry.chance*10,100)}" style="background:${r.color}"></div></div></div><div class="cp" style="color:${r.color}">${entry.chance.toFixed(2)}%</div>`;
    list.appendChild(row);
  });
  
  setTimeout(()=>{list.querySelectorAll('.chance-bar div').forEach(el=>{el.style.width=el.dataset.w+'%';});},50);
}

function renderIndex() {
  const grid = document.getElementById('indexGrid');
  grid.innerHTML = '';
  const foundItems = new Set(inventory.map(it => it.name));
  const rarityOrder = ['exclusive', 'secret', 'leader', 'mythic', 'legendary', 'epic', 'rare', 'common'];
  rarityOrder.forEach(rKey => {
    const unitsInRarity = ALL_UNITS.filter(u => u.r === rKey);
    if (unitsInRarity.length === 0) return;
    const r = RARITY[rKey];
    const section = document.createElement('div');
    section.innerHTML = `<div class="index-section-title" style="color:${r.color}">${r.label}</div>`;
    const row = document.createElement('div');
    row.className = 'index-items-row';
    unitsInRarity.forEach(it => {
      const hasFound = foundItems.has(it.name);
      const isSecret = it.secret;
      const displayName = (!hasFound || isSecret) ? '???' : it.name;
      const el = document.createElement('div');
      el.className = `index-item ${hasFound ? '' : 'locked'}`;
      el.innerHTML = `<img src="${hasFound && !isSecret ? it.img : 'https://yourimageshare.com/ib/w1HE053pTL.jpg'}" alt="${displayName}"><span style="color:${hasFound ? r.color : 'var(--txt2)'}">${displayName}</span>`;
      row.appendChild(el);
    });
    section.appendChild(row);
    grid.appendChild(section);
  });
}

function renderProfile() {
  let username = 'Гость';
  if (tgWebData) username = tgWebData.username ? '@' + tgWebData.username : tgWebData.first_name;
  const isGuest = (username === 'Гость');
  $('profUsername').textContent = username;
  $('profCases').textContent = casesOpened;
  $('profBalance').textContent = Math.floor(balance) + ' $';
  $('profGems').textContent = Math.floor(gems) + ' 💎';
  $('profWarning').style.display = isGuest ? 'block' : 'none';

  const top3 = [...inventory].sort((a,b) => b.price - a.price).slice(0, 3);
  const container = $('profTopUnits');
  container.innerHTML = '';
  if (top3.length === 0) container.innerHTML = '<div style="font-size:12px; color:var(--txt2); text-align:center;">Инвентарь пуст</div>';
  else {
    top3.forEach(it => {
      const r = RARITY[it.r];
      const el = document.createElement('div');
      el.className = 'profile-unit';
      el.innerHTML = `<div style="width:24px; height:24px; filter:drop-shadow(0 0 5px ${r.color}aa)">${iconOf(it.name)}</div><span style="color:${r.color}">${it.name}</span><span class="u-price">${it.price} $</span>`;
      container.appendChild(el);
    });
  }

  const actionsContainer = $('profActions');
  actionsContainer.innerHTML = '';
  if (isGuest) {
    actionsContainer.innerHTML = `
      <div style="text-align:center; margin-bottom:10px; font-size:12px;">Войдите, чтобы сохранять прогресс в облаке:</div>
      <div class="tg-login-form">
        <input type="text" id="inpUserId" placeholder="Ваш Telegram ID (цифры)">
        <button class="tg-login-btn" onclick="linkAccount()">Привязать аккаунт</button>
      </div>
      <div style="font-size:11px; color:var(--txt2); text-align:center; margin-top:5px;">Узнать свой ID можно у бота <b>@userinfobot</b></div>`;
  } else {
    actionsContainer.innerHTML = `<button class="btn-danger" style="width:100%; border-color:var(--red); color:var(--red); background:linear-gradient(180deg, rgba(255,68,68,0.1), transparent);" onclick="logoutProfile()">Выйти из профиля</button>`;
  }
}

function renderShop() {
  const item = SHOP_ITEM;
  const r = RARITY[item.r];
  $('shopItemImg').innerHTML = `<img src="${item.img}" alt="${item.name}">`;
  $('shopItemName').textContent = item.name;
  $('shopItemRarity').textContent = r.label;
  $('shopItemRarity').style.color = r.color;
  $('shopItemStats').innerHTML = Object.entries(item.stats).map(([k,v],idx)=>{
    const tk = L10N[lang].typeTrans[k] || k;
    return `<div class="stat-row" style="${idx===0?'color:#fff;font-weight:bold;margin-bottom:4px':''}"><span>${tk}:</span><span>${v}</span></div>`;
  }).join('');
}

/* ===== ЛОГИКА ===== */
function processSpin(won,isAuto=false){
  spinning=true;updateUI();
  const c=CRATES[activeCrate];
  if(c.currency==='💎'){
    if(gems<c.cost){spinning=false;isAutoOpen=false;$('autoBtn').classList.remove('active');updateUI();save();return toast(L10N[lang].lblGems+' не хватает!');}
    gems-=c.cost;
  }else{
    if(balance<c.cost){spinning=false;isAutoOpen=false;$('autoBtn').classList.remove('active');updateUI();save();return toast('Недостаточно $');}
    balance-=c.cost;
  }
  casesOpened++;
  updateUI();save();

  const duration=isAuto?800:2600,startT=performance.now(),ease=t=>t*t*t;
  (function spin(){
    const el=performance.now()-startT,prog=Math.min(el/duration,1),interval=170-135*ease(prog),pool=c.pool,it=pool[Math.floor(Math.random()*pool.length)];
    const displayItem = getItemData(it.name);
    
    slotIcon.innerHTML=iconOf(displayItem.name,true);slotName.textContent=displayItem.secret?'???':displayItem.name;
    slotIcon.classList.remove('tick');void slotIcon.offsetWidth;slotIcon.classList.add('tick');
    sfx.tick(prog);
    if(prog>=1){
      scene.classList.remove('tension');flash.classList.remove('on');void flash.offsetWidth;flash.classList.add('on');sfx.flash();
      setTimeout(()=>{
        slotIcon.innerHTML=iconOf(won.name,false);slotName.textContent=won.secret?'???':won.name;
        const isSold=autoSellRarities.has(won.r);
        if(isSold){ balance+=won.price; updateUI(); sfx.sell(); toast(`${L10N[lang].sold} ${won.name}`); } 
        else { inventory.push(won); }
        renderInventory();
        if(!isAuto) showDrop(won);
        spinning=false;updateUI();save();
        if(!isAuto){$('history').innerHTML=L10N[lang].history+': '+inventory.slice(-5).reverse().map(x=>x.secret?'???':x.name).join(' · ');}
        else{setTimeout(()=>{if(isAutoOpen)processSpin(randomItem(),true);},500);}
      },isAuto?200:800*.35);
    }else setTimeout(spin,interval);
  })();
  scene.classList.add('tension');
}

function showDrop(it){
  const r=RARITY[it.r];
  $('dIcon').innerHTML=iconOf(it.name,false);
  $('dIcon').style.filter=`drop-shadow(0 0 20px ${r.color}cc)`;
  $('dName').textContent=it.name;
  $('dRarity').textContent=r.label;$('dRarity').style.color=r.color;
  $('dPrice').textContent=`${L10N[lang].priceAfter}: ${it.price} $`;
  $('dPrice').style.color=r.color;
  
  const card = $('dropCard');
  card.style.borderColor=r.color;
  card.style.boxShadow=`0 0 30px ${r.color}33, inset 0 0 20px ${r.color}11`;
  card.style.maxHeight = '85vh';
  card.style.overflow = 'hidden';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';

  const s=$('dStats');
  if(it.stats){
    s.style.display='flex';
    s.innerHTML=Object.entries(it.stats).filter(([k,v])=>v).map(([k,v],idx)=>{
      const tk=L10N[lang].typeTrans[k]||k;
      return`<div class="stat-row" style="${idx===0?'color:#fff;font-weight:bold;margin-bottom:4px':''}"><span>${tk}:</span><span>${v}</span></div>`;
    }).join('');
    s.style.maxHeight = '40vh';
    s.style.overflowY = 'auto';
    s.style.flexShrink = '0';
    s.style.paddingRight = '8px';
  } else {
    s.style.display='none';
  }

  // ПРИНУДИТЕЛЬНО ПЕРЕНАЗНАЧАЕМ КНОПКУ "ЗАБРАТЬ В ИНВЕНТАРЬ"
  const btn = $('dClose');
  btn.textContent = L10N[lang].takeInv;
  btn.style.borderColor = 'var(--lin)';
  btn.style.color = 'var(--txt)';
  btn.onclick = () => { 
    sfx.click(); 
    dropOverlay.classList.remove('show'); 
    setTimeout(()=>{
      slotIcon.innerHTML=`<img src="${CRATES[activeCrate].img}">`;
      slotName.textContent=L10N[lang].clickOpen;
    },320); 
  };
  
  dropOverlay.classList.add('show');
  sfx.drop(it.r);
}

function openCase(isMulti=false){
  if(spinning)return;
  const c=CRATES[activeCrate],needSpace=isMulti?10:1;
  if(inventory.length+needSpace>1000)return toast('Инвентарь переполнен! Продай что-нибудь');
  const totalCost=isMulti?c.cost*10:c.cost;
  if(c.currency==='💎'&&gems<totalCost)return toast(L10N[lang].lblGems+' не хватает!');
  if(c.currency==='$'&&balance<totalCost)return toast('Недостаточно $');
  sfx.click();
  if(isMulti){
    const wonItems=[];let totalProfit=0;
    if(c.currency==='💎')gems-=totalCost;else balance-=totalCost;
    casesOpened+=10;
    updateUI();save();
    for(let i=0;i<10;i++){
      const it=randomItem();
      if(autoSellRarities.has(it.r))totalProfit+=it.price;
      else wonItems.push(it);
    }
    balance+=totalProfit;inventory.push(...wonItems);renderInventory();updateUI();save();showMultiDrop(wonItems);
  }else processSpin(randomItem(),false);
}

function showMultiDrop(items){
  const list=$('multiList');list.innerHTML='';
  items.forEach(it=>{const r=RARITY[it.r];const el=document.createElement('div');el.className='multi-item';el.innerHTML=`<div class="mi-icon" style="filter:drop-shadow(0 0 6px ${r.color}cc)">${iconOf(it.name,false)}</div><div class="mi-name">${it.name}</div>`;list.appendChild(el);});
  multiOverlay.classList.add('show');
  const best=items.reduce((p,c)=>Object.keys(RARITY).indexOf(c.r)>Object.keys(RARITY).indexOf(p.r)?c:p,items[0]);
  sfx.drop(best.r);
}

function buyShopItem() {
  if (gems < SHOP_ITEM.price) {
    toast('Недостаточно гемов!');
    return;
  }
  gems -= SHOP_ITEM.price;
  const newItem = { ...SHOP_ITEM };
  inventory.push(newItem);
  updateUI(); renderInventory(); save();
  toast(`Куплен ${SHOP_ITEM.name}!`);
  $('shopOverlay').classList.remove('show');
  sfx.drop('exclusive');
}

/* ===== АВТОРИЗАЦИЯ ===== */
function linkAccount() {
  const id = $('inpUserId').value.trim();
  if (!id || isNaN(id)) return toast('Введите корректный цифровой ID');
  toast('Проверка ID...');
  fetch(`${API_URL}/auth`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id })
  }).then(res => res.ok ? res.json() : Promise.reject())
  .then(user => {
    tgWebData = user;
    localStorage.setItem('grenko_tg_user', JSON.stringify(user));
    toast('Аккаунт успешно привязан!');
    load().then(() => { renderInventory(); updateUI(); $('profileOverlay').classList.remove('show'); renderProfile(); });
  }).catch(() => toast('Ошибка: неверный ID или проблемы с сервером'));
}

function logoutProfile() {
  if(!confirm('Выйти из профиля? Ваш прогресс сохранится в облаке, но локальный кэш будет удалён.')) return;
  localStorage.removeItem('grenko_tg_user'); localStorage.removeItem(SAVE_KEY); tgWebData = null;
  toast('Вы вышли из профиля'); $('profileOverlay').classList.remove('show');
  setTimeout(() => { window.location.reload(); }, 1000);
}

/* ===== ГАЧА ===== */
function updateGachaUI(){
  const now=Date.now(),timePassed=now-gachaLastTick,earnedSpins=Math.floor(timePassed/GACHA_COOLDOWN);
  if(earnedSpins>0){gachaSpins=Math.min(gachaSpins+earnedSpins,MAX_GACHA_SPINS);gachaLastTick=now-(timePassed%GACHA_COOLDOWN);save();}
  const badge=$('gachaBadge');
  if(gachaSpins>0){badge.style.display='flex';badge.textContent=gachaSpins;}else badge.style.display='none';
  if(gachaSpins>=MAX_GACHA_SPINS){$('gachaTimer').textContent='Максимум спинов!';}
  else{const nextSpin=GACHA_COOLDOWN-(now-gachaLastTick),m=Math.floor(nextSpin/60000),s=Math.floor((nextSpin%60000)/1000);$('gachaTimer').textContent=`Спинов: ${gachaSpins}. Следующий через: ${m}м ${s}с`;}
}
setInterval(updateGachaUI,1000);

function playGacha(){
  if(gachaSpins<=0)return;
  gachaSpins--;save();updateGachaUI();
  $('gachaSpinBtn').disabled=true;
  const reel=$('gachaReel');reel.innerHTML='';let ticks=0;const maxTicks=20;
  const interval=setInterval(()=>{
    ticks++;
    const rand=GACHA_POOL[Math.floor(Math.random()*GACHA_POOL.length)];
    reel.innerHTML=`<div class="gacha-item" style="color:${rand.color};font-size:24px;font-weight:bold;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05);border-radius:8px;width:100%;max-width:80px;transform:scale(1.1);transition:transform .1s;">${rand.amount}</div>`;
    sfx.tick(ticks/maxTicks);
    if(ticks>=maxTicks){
      clearInterval(interval);
      const totalW=GACHA_POOL.reduce((s,i)=>s+i.w,0);let r=Math.random()*totalW,won=GACHA_POOL[0];
      for(const it of GACHA_POOL){r-=it.w;if(r<=0){won=it;break;}}
      reel.innerHTML=`<div class="gacha-item" style="color:${won.color};font-size:32px;font-weight:bold;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.1);border-radius:8px;width:100%;max-width:80px;transform:scale(1.2);transition:transform .3s var(--ease);">${won.amount}</div>`;
      $('gachaResult').innerHTML=`Вы выиграли <span style="color:${won.color}">${won.amount} 💎</span>!`;
      gems+=won.amount;updateUI();save();sfx.drop('exclusive');
      $('gachaSpinBtn').disabled=false;updateGachaUI();
    }
  },50);
}

/* ===== ИНИЦИАЛИЗАЦИЯ ===== */
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
          applySaveData(cloudData);
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

// Автосохранение каждые 3 секунды для защиты от вылетов
setInterval(() => { save(); }, 3000);

// Запуск при загрузке страницы
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
