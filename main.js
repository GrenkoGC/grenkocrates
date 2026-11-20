// main.js

let gameSettings = { luck: 1, forceDrop: null };

const scene = $('scene');
const slotIcon = $('slotIcon');
const flash = $('flash');
const dropOverlay = $('dropOverlay');
const multiOverlay = $('multiOverlay');
const invGrid = $('invGrid');
const bgMusic = $('bgMusic');
const volumeSlider = $('volumeSlider');

/* ===== UI ===== */

function updateUI() {
  $('invCount').textContent = inventory.length;
  $('balance').textContent = Math.floor(balance);
  $('gems').textContent = Math.floor(gems);
  
  const c = CRATES[activeCrate];
  $('sceneTitle').textContent = c.name;
  
  if (c.currency === '💎') {
    $('openBtn').innerHTML = `Открыть <small>${c.cost} 💎</small>`;
    $('open10Btn').innerHTML = `Открыть x10 <small>${c.cost * 10} 💎</small>`;
  } else {
    $('openBtn').innerHTML = `Открыть <small>${c.cost} $</small>`;
    $('open10Btn').innerHTML = `Открыть x10 <small>${c.cost * 10} $</small>`;
  }
  
  $('openBtn').disabled = spinning;
  $('open10Btn').disabled = spinning;
  $('sellAllBtn').textContent = L10N[lang].sellAll;
}

function applyLang() {
  const t = L10N[lang];
  $('langBtn').textContent = lang === 'ru' ? 'EN' : 'RU';
  $('lblInvHint').textContent = t.lblInvHint;
  $('invGrid').setAttribute('data-empty', t.emptyInv);
  $('dClose').textContent = t.takeInv;
  updateUI();
  renderInventory();
}

function renderInventory() {
  invGrid.innerHTML = '';
  const inv = safeInventory(inventory);

  inv.forEach((it, i) => {
    const rKey = normalizeRarity(it.r);
    const ult = rKey === 'ultimate';
    const r = RARITY[rKey] || RARITY.common;

    const el = document.createElement('div');
    el.style.cssText = `position:relative; padding:10px 5px; display:flex; flex-direction:column; align-items:center; gap:6px; font-size:11px; text-align:center; background:var(--btn-bg); border:2px solid var(--border); cursor:pointer; border-radius:8px; transition:0.2s;`;
    el.onmouseover = () => el.style.borderColor = 'var(--txt)';
    el.onmouseout = () => el.style.borderColor = 'var(--border)';

    const iconStyle = ult ? '' : `filter:drop-shadow(0 0 6px ${r.color}80)`;
    const nameCls = rarityTextClass(rKey);
    const nameStyle = ult ? '' : 'color:var(--txt);';

    el.innerHTML = `
      <div class="icon ${rarityIconClass(rKey)}" style="width:45px;height:45px;${iconStyle}">${iconOf(it.name, false)}</div>
      <div class="${nameCls}" style="${nameStyle}font-weight:600;word-break:break-word;line-height:1.1">${esc(it.name)}</div>
      <div class="price" style="color:var(--acc);font-family:monospace;">${it.price} $</div>
    `;

    let statsHtml = '';
    if (it.stats && Object.keys(it.stats).length) {
      statsHtml = Object.entries(it.stats).map(([k, v]) => {
        const tk = L10N[lang].typeTrans[k] || k;
        return `<div style="display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,0.1);padding:2px 0;"><span style="color:var(--txt2);">${esc(tk)}:</span><span style="color:var(--acc);font-weight:bold;text-align:right;">${esc(v)}</span></div>`;
      }).join('');
    } else {
      statsHtml = '<div style="text-align:center;color:var(--txt2)">Нет характеристик</div>';
    }

    const tooltip = document.getElementById('invTooltip');

    el.onmouseenter = () => {
      if (window.innerWidth < 768) return;
      tooltip.innerHTML = statsHtml;
      tooltip.classList.add('show');
      tooltip.style.opacity = '1'; tooltip.style.visibility = 'visible';
      const rect = el.getBoundingClientRect();
      tooltip.style.left = Math.min(window.innerWidth - 230, Math.max(10, rect.left + rect.width / 2 - 100)) + 'px';
      tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
    };

    el.onmouseleave = () => {
      tooltip.classList.remove('show');
      tooltip.style.opacity = '0'; tooltip.style.visibility = 'hidden';
    };

    el.onclick = () => {
      $('dIcon').innerHTML = iconOf(it.name, false);
      $('dIcon').style.filter = ult ? '' : `drop-shadow(0 0 20px ${r.color}cc)`;
      $('dName').innerHTML = `<span class="${rarityTextClass(rKey)}">${esc(it.name)}</span>`;
      $('dRarity').textContent = r.label;
      $('dRarity').style.color = ult ? '' : r.color;
      $('dPrice').textContent = `${L10N[lang].priceAfter}: ${it.price} $`;
      $('dPrice').style.color = ult ? '' : r.color;

      const card = $('dropCard');
      if (ult) {
        card.classList.add('rar-ultimate-card');
        card.style.borderColor = '';
      } else {
        card.classList.remove('rar-ultimate-card');
        card.style.borderColor = r.color;
      }

      const s = $('dStats');
      if (it.stats && Object.keys(it.stats).length) {
        s.style.display = 'flex';
        s.innerHTML = Object.entries(it.stats).filter(([k, v]) => v).map(([k, v], idx) => {
          const tk = L10N[lang].typeTrans[k] || k;
          return `<div style="display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,0.1);padding:4px 0;${idx === 0 ? 'color:#fff;font-weight:bold;' : ''}"><span>${esc(tk)}:</span><span>${esc(v)}</span></div>`;
        }).join('');
      } else {
        s.style.display = 'none';
      }

      const btn = $('dClose');
      btn.textContent = `${L10N[lang].sold} ${L10N[lang].for} ${it.price} $`;
      btn.style.borderColor = 'var(--red)';
      btn.style.color = 'var(--red)';

      btn.onclick = () => {
        sfx.click();
        dropOverlay.classList.remove('show');
        const idx = inventory.indexOf(it);
        if (idx !== -1) inventory.splice(idx, 1);
        balance += it.price;
        updateUI(); renderInventory(); save();
        sfx.sell(); toast(`${L10N[lang].sold} ${it.name}`);

        btn.textContent = L10N[lang].takeInv;
        btn.style.borderColor = 'var(--border)';
        btn.style.color = 'var(--txt)';
        btn.onclick = () => { sfx.click(); dropOverlay.classList.remove('show'); };
      };

      dropOverlay.classList.add('show');
      sfx.drop(rKey);
    };

    invGrid.appendChild(el);
  });

  updateUI();
}

function renderChances() {
  const pool = CRATES[activeCrate].pool;
  const list = $('chancesList');
  const sum = $('raritySummary');
  list.innerHTML = ''; sum.innerHTML = '';

  const byR = {};
  pool.forEach(entry => {
    const item = getItemData(entry.name);
    if (!item) return;
    const rKey = normalizeRarity(item.r);
    if (!byR[rKey]) byR[rKey] = 0;
    byR[rKey] += entry.chance;
  });

  RARITY_ORDER.forEach(k => {
    if (!byR[k]) return;
    const v = RARITY[k];
    const s = document.createElement('span');
    s.className = rarityTextClass(k);
    s.style.color = v.color;
    s.innerHTML = `${v.label} <b>${byR[k].toFixed(2)}%</b>`;
    sum.appendChild(s);
  });

  [...pool].sort((a, b) => b.chance - a.chance).forEach(entry => {
    const it = getItemData(entry.name);
    if (!it) return;
    const rKey = normalizeRarity(it.r);
    const r = RARITY[rKey];
    const row = document.createElement('div');
    row.style.cssText = `display:flex;align-items:center;gap:10px;padding:8px;background:rgba(255,255,255,.02);border-left:4px solid ${r.color};margin-bottom:6px;border-radius:4px;`;

    const displayName = it.secret ? '???' : it.name;
    const nameCls = it.secret ? '' : rarityTextClass(rKey);

    row.innerHTML = `
      <div style="width:30px;height:30px;filter:drop-shadow(0 0 4px ${r.color}80)">${iconOf(it.name, true)}</div>
      <div class="${nameCls}" style="flex:1;font-size:14px;font-weight:600;line-height:1.1;">${esc(displayName)}
        <div style="font-size:10px;opacity:.7;text-transform:uppercase;font-family:monospace;margin-top:2px;color:${r.color}">${r.label} · ${it.price} $</div>
      </div>
      <div style="font-size:14px;font-weight:700;font-family:monospace;color:${r.color}">${entry.chance.toFixed(2)}%</div>
    `;
    list.appendChild(row);
  });
}

function renderIndex() {
  const grid = document.getElementById('indexGrid');
  grid.innerHTML = '';
  const inv = safeInventory(inventory);
  const foundItems = new Set(inv.map(it => String(it.name).trim().toLowerCase()));

  let tooltip = document.getElementById('invTooltip');

  RARITY_ORDER.forEach(rKey => {
    const unitsInRarity = ALL_UNITS.filter(u => normalizeRarity(u.r) === rKey);
    if (unitsInRarity.length === 0) return;

    const r = RARITY[rKey];
    const section = document.createElement('div');
    section.innerHTML = `<div style="font-size:16px; font-weight:bold; text-transform:uppercase; letter-spacing:1px; padding-bottom:6px; border-bottom:2px solid var(--border); margin-bottom:10px; text-align:left; color:${r.color}" class="${rarityTextClass(rKey)}">${r.label}</div>`;

    const row = document.createElement('div');
    row.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(85px, 1fr)); gap:10px;';

    unitsInRarity.forEach(it => {
      const hasFound = foundItems.has(String(it.name).trim().toLowerCase());
      const displayName = hasFound ? it.name : '???';

      const el = document.createElement('div');
      el.style.cssText = `background:var(--btn-bg); border:2px solid var(--border); border-radius:8px; padding:10px; display:flex; flex-direction:column; align-items:center; text-align:center; cursor:pointer; ${hasFound ? '' : 'filter:grayscale(100%) opacity(0.3);'}`;

      const iconCls = hasFound ? rarityIconClass(rKey) : '';
      const nameCls = hasFound ? rarityTextClass(rKey) : '';
      const nameStyle = hasFound ? '' : 'color:var(--txt2)';

      el.innerHTML = `
        <img src="${hasFound ? esc(it.img) : FALLBACK_IMG}" class="${iconCls}" alt="${esc(displayName)}" style="width:45px; height:45px; object-fit:contain; margin-bottom:8px;">
        <span class="${nameCls}" style="${nameStyle} font-size:11px; font-weight:bold; line-height:1.1;">${esc(displayName)}</span>
      `;

      el.onmouseenter = () => {
        if (window.innerWidth < 768) return;
        let html = '';
        if (it.stats && Object.keys(it.stats).length) {
          html = Object.entries(it.stats).map(([k, v]) => {
            const tk = L10N[lang].typeTrans[k] || k;
            let tv = v;
            try { if (typeof transVal === 'function') tv = transVal(v, lang); } catch(e) {}
            return `<div style="display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,0.1);padding:2px 0;"><span style="color:var(--txt2);">${esc(tk)}:</span><span style="color:var(--acc);font-weight:bold;text-align:right;">${esc(tv)}</span></div>`;
          }).join('');
        }
        tooltip.innerHTML = html;
        tooltip.classList.add('show');
        tooltip.style.opacity = '1'; tooltip.style.visibility = 'visible';
        const rect = el.getBoundingClientRect();
        tooltip.style.left = Math.min(window.innerWidth - 230, Math.max(10, rect.left + rect.width / 2 - 100)) + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
      };
      el.onmouseleave = () => { tooltip.classList.remove('show'); tooltip.style.opacity = '0'; tooltip.style.visibility = 'hidden'; };

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

  const inv = safeInventory(inventory);
  const top3 = [...inv].sort((a, b) => b.price - a.price).slice(0, 3);
  const container = $('profTopUnits');
  container.innerHTML = '';

  if (top3.length === 0) {
    container.innerHTML = '<div style="font-size:12px; color:var(--txt2); text-align:center;">Инвентарь пуст</div>';
  } else {
    top3.forEach(it => {
      const rKey = normalizeRarity(it.r);
      const r = RARITY[rKey];
      const el = document.createElement('div');
      el.style.cssText = 'display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);padding:8px 10px;border-radius:6px;font-size:13px;';

      const iconCls = rarityIconClass(rKey);
      const nameCls = rarityTextClass(rKey);
      const iconStyle = rKey === 'ultimate' ? '' : `filter:drop-shadow(0 0 5px ${r.color}aa)`;
      const nameStyle = rKey === 'ultimate' ? '' : `color:${r.color}`;

      el.innerHTML = `
        <div class="${iconCls}" style="width:28px; height:28px; ${iconStyle}">${iconOf(it.name)}</div>
        <span class="${nameCls}" style="${nameStyle} font-weight:bold;">${esc(it.name)}</span>
        <span style="color:var(--acc);margin-left:auto;font-family:monospace;">${it.price} $</span>
      `;
      container.appendChild(el);
    });
  }

  const actionsContainer = $('profActions');
  actionsContainer.innerHTML = '';

  if (isGuest) {
    actionsContainer.innerHTML = `
      <div style="text-align:center; margin-bottom:10px; font-size:13px;">Войдите, чтобы сохранять прогресс:</div>
      <div style="display:flex; flex-direction:column; gap:10px; background:rgba(255,255,255,0.02); padding:15px; border-radius:6px; border:1px solid var(--border);">
        <input type="text" id="inpUserId" placeholder="Ваш Telegram ID (цифры)" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--border); border-radius:6px; color:var(--acc); font-size:14px; outline:none; text-align:center;">
        <button onclick="linkAccount()" style="width:100%; padding:10px; font-size:14px; background:var(--btn-bg); color:var(--acc); border:2px solid var(--border); border-radius:6px; cursor:pointer; font-weight:bold;">Привязать</button>
      </div>
      <div style="font-size:11px; color:var(--txt2); text-align:center; margin-top:5px;">ID можно узнать у бота <b>@userinfobot</b></div>
    `;
  } else {
    actionsContainer.innerHTML = `<button style="width:100%; border:2px solid var(--red); color:var(--red); background:rgba(255,68,68,0.1); padding:10px; border-radius:6px; cursor:pointer; font-weight:bold;" onclick="logoutProfile()">Выйти из профиля</button>`;
  }
}

function renderShop() {
  const item = SHOP_ITEM;
  if (!item) return;
  const rKey = normalizeRarity(item.r);
  const r = RARITY[rKey];

  $('shopItemImg').innerHTML = `<img src="${esc(item.img)}" alt="${esc(item.name)}" style="width:120px;height:120px;object-fit:contain;">`;
  $('shopItemName').textContent = item.name;
  $('shopItemRarity').textContent = r.label;
  $('shopItemRarity').style.color = r.color;
  $('shopItemStats').innerHTML = Object.entries(item.stats || {}).map(([k, v], idx) => {
    const tk = L10N[lang].typeTrans[k] || k;
    return `<div style="display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,0.1);padding:4px 0;${idx === 0 ? 'color:#fff;font-weight:bold;' : ''}"><span>${esc(tk)}:</span><span>${esc(v)}</span></div>`;
  }).join('');
}

/* ===== ЛОГИКА ===== */

function processSpin(won, isAuto = false) {
  if (spinning) return;
  spinning = true;
  updateUI();

  const c = CRATES[activeCrate];

  if (c.currency === '💎') {
    if (gems < c.cost) {
      spinning = false; isAutoOpen = false; updateUI(); save();
      return toast('Не хватает 💎!');
    }
    gems -= c.cost;
  } else {
    if (balance < c.cost) {
      spinning = false; isAutoOpen = false; updateUI(); save();
      return toast('Недостаточно $');
    }
    balance -= c.cost;
  }

  casesOpened++; updateUI(); save();

  const duration = isAuto ? 800 : 2600;
  const startT = performance.now();
  const ease = t => t * t * t;

  (function spin() {
    const el = performance.now() - startT;
    const prog = Math.min(el / duration, 1);
    const interval = 170 - 135 * ease(prog);
    const pool = c.pool;
    const it = pool[Math.floor(Math.random() * pool.length)];
    const displayItem = getItemData(it.name);

    // Картинка строго внутри круга
    slotIcon.innerHTML = `<div class="icon tick" style="width:100%; height:100%;">${iconOf(displayItem.name, true)}</div>`;
    slotIcon.classList.add('tick');
    if (typeof sfx !== 'undefined' && sfx.tick) sfx.tick(prog);

    if (prog >= 1) {
      flash.classList.remove('on');
      void flash.offsetWidth;
      flash.classList.add('on');
      if (typeof sfx !== 'undefined' && sfx.flash) sfx.flash();

      setTimeout(() => {
        slotIcon.innerHTML = `<div class="icon" style="width:100%; height:100%;">${iconOf(won.name, false)}</div>`;

        const wonRKey = normalizeRarity(won.r);
        const isSold = autoSellRarities.has(wonRKey);
        
        if (isSold) {
          balance += won.price; updateUI();
          if (typeof sfx !== 'undefined' && sfx.sell) sfx.sell();
          toast(`${L10N[lang].sold} ${won.name}`);
        } else if (inventory.length >= 1000) {
          balance += won.price; toast('Инвентарь полон — юнит продан');
        } else {
          inventory.push(won);
        }

        renderInventory();
        if (!isAuto) showDrop(won);

        spinning = false; updateUI(); save();

        if (isAuto) {
          setTimeout(() => { if (isAutoOpen) processSpin(randomItem(), true); }, 500);
        }
      }, isAuto ? 200 : 800 * .35);
    } else {
      setTimeout(spin, interval);
    }
  })();
}

function showDrop(it) {
  const rKey = normalizeRarity(it.r);
  const r = RARITY[rKey];
  const ult = rKey === 'ultimate';

  $('dIcon').innerHTML = iconOf(it.name, false);
  $('dIcon').style.filter = ult ? '' : `drop-shadow(0 0 20px ${r.color}cc)`;
  $('dName').innerHTML = `<span class="${rarityTextClass(rKey)}">${esc(it.name)}</span>`;
  $('dRarity').textContent = r.label;
  $('dRarity').style.color = ult ? '' : r.color;
  $('dPrice').textContent = `${L10N[lang].priceAfter}: ${it.price} $`;
  $('dPrice').style.color = ult ? '' : r.color;

  const card = $('dropCard');
  if (ult) {
    card.classList.add('rar-ultimate-card');
    card.style.borderColor = '';
  } else {
    card.classList.remove('rar-ultimate-card');
    card.style.borderColor = r.color;
  }

  const s = $('dStats');
  if (it.stats && Object.keys(it.stats).length) {
    s.style.display = 'flex';
    s.innerHTML = Object.entries(it.stats).filter(([k, v]) => v).map(([k, v], idx) => {
      const tk = L10N[lang].typeTrans[k] || k;
      return `<div style="display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,0.1);padding:4px 0;${idx === 0 ? 'color:#fff;font-weight:bold;' : ''}"><span>${esc(tk)}:</span><span>${esc(v)}</span></div>`;
    }).join('');
  } else {
    s.style.display = 'none';
  }

  const btn = $('dClose');
  btn.textContent = L10N[lang].takeInv;
  btn.style.borderColor = 'var(--border)';
  btn.style.color = 'var(--txt)';
  btn.onclick = () => { sfx.click(); dropOverlay.classList.remove('show'); };

  dropOverlay.classList.add('show');
  sfx.drop(rKey);
}

function openCase(isMulti = false) {
  if (spinning) return;
  const c = CRATES[activeCrate];
  const needSpace = isMulti ? 10 : 1;
  if (inventory.length + needSpace > 1000) return toast('Инвентарь переполнен!');

  const totalCost = isMulti ? c.cost * 10 : c.cost;
  if (c.currency === '💎' && gems < totalCost) return toast('Не хватает 💎!');
  if (c.currency === '$' && balance < totalCost) return toast('Недостаточно $');

  sfx.click();

  if (isMulti) {
    const wonItems = [];
    let totalProfit = 0;

    if (c.currency === '💎') gems -= totalCost;
    else balance -= totalCost;

    casesOpened += 10; updateUI(); save();

    for (let i = 0; i < 10; i++) {
      const it = randomItem();
      if (autoSellRarities.has(normalizeRarity(it.r))) totalProfit += it.price;
      else wonItems.push(it);
    }

    balance += totalProfit;
    inventory.push(...wonItems);
    renderInventory(); updateUI(); save();
    showMultiDrop(wonItems);
  } else {
    processSpin(randomItem(), false);
  }
}

function showMultiDrop(items) {
  const list = $('multiList');
  list.innerHTML = '';

  items.forEach(it => {
    const rKey = normalizeRarity(it.r);
    const r = RARITY[rKey];
    const ult = rKey === 'ultimate';
    const el = document.createElement('div');
    el.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;background:rgba(255,255,255,.03);padding:8px;border-radius:6px;border:1px solid var(--border);text-align:center;';

    const iconStyle = ult ? '' : `filter:drop-shadow(0 0 6px ${r.color}cc)`;

    el.innerHTML = `
      <div class="${rarityIconClass(rKey)}" style="width:45px;height:45px;display:flex;justify-content:center;align-items:center;${iconStyle}">${iconOf(it.name, false)}</div>
      <div class="${rarityTextClass(rKey)}" style="font-size:10px;font-weight:600;word-break:break-word;line-height:1.1;color:#fff;">${esc(it.name)}</div>
    `;
    list.appendChild(el);
  });

  multiOverlay.classList.add('show');

  if (items.length) {
    const best = items.reduce((p, c) =>
      RARITY_ORDER.indexOf(normalizeRarity(c.r)) < RARITY_ORDER.indexOf(normalizeRarity(p.r)) ? c : p,
      items[0]
    );
    sfx.drop(normalizeRarity(best.r));
  }
}

function buyShopItem() {
  if (!SHOP_ITEM) return;
  if (gems < SHOP_ITEM.price) return toast('Недостаточно гемов!');
  gems -= SHOP_ITEM.price;
  const newItem = { ...SHOP_ITEM, r: normalizeRarity(SHOP_ITEM.r), stats: deepClone(SHOP_ITEM.stats || {}) };
  inventory.push(newItem);
  updateUI(); renderInventory(); save();
  toast(`Куплен ${SHOP_ITEM.name}!`);
  $('shopOverlay').classList.remove('show');
  sfx.drop('exclusive');
}

function linkAccount() {
  const id = $('inpUserId').value.trim();
  if (!id || isNaN(id)) return toast('Введите корректный цифровой ID');
  toast('Проверка ID...');
  fetch(`${API_URL}/auth`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: id })
  })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(user => {
      tgWebData = user;
      localStorage.setItem('grenko_tg_user', JSON.stringify(user));
      toast('Аккаунт привязан!');
      loadWithAuth().then(() => {
        renderInventory(); updateUI();
        $('profileOverlay').classList.remove('show');
      });
    })
    .catch(() => toast('Ошибка: неверный ID или проблемы с сервером'));
}

function logoutProfile() {
  if (!confirm('Выйти из профиля?')) return;
  localStorage.removeItem('grenko_tg_user');
  localStorage.removeItem(SAVE_KEY);
  tgWebData = null;
  toast('Вы вышли');
  location.reload();
}

/* ===== ГАЧА ===== */
function updateGachaUI() {
  const now = Date.now();
  const timePassed = now - gachaLastTick;
  const earnedSpins = Math.floor(timePassed / GACHA_COOLDOWN);
  if (earnedSpins > 0) {
    gachaSpins = Math.min(gachaSpins + earnedSpins, MAX_GACHA_SPINS);
    gachaLastTick = now - (timePassed % GACHA_COOLDOWN);
    save();
  }
  if (gachaSpins >= MAX_GACHA_SPINS) $('gachaTimer').textContent = 'Максимум спинов!';
  else {
    const nextSpin = GACHA_COOLDOWN - (now - gachaLastTick);
    const m = Math.floor(nextSpin / 60000), s = Math.floor((nextSpin % 60000) / 1000);
    $('gachaTimer').textContent = `Спинов: ${gachaSpins}. Следующий: ${m}м ${s}с`;
  }
}
setInterval(updateGachaUI, 1000);

function playGacha() {
  if (gachaSpins <= 0) return;
  gachaSpins--; save(); updateGachaUI();
  $('gachaSpinBtn').disabled = true;
  const reel = $('gachaReel'); reel.innerHTML = '';
  let ticks = 0; const maxTicks = 20;
  const interval = setInterval(() => {
    ticks++;
    const rand = GACHA_POOL[Math.floor(Math.random() * GACHA_POOL.length)];
    reel.innerHTML = `<div style="color:${rand.color};font-size:28px;font-weight:bold;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05);border-radius:8px;width:80px;height:80px;">${rand.amount}</div>`;
    sfx.tick(ticks / maxTicks);
    if (ticks >= maxTicks) {
      clearInterval(interval);
      const totalW = GACHA_POOL.reduce((s, i) => s + i.w, 0);
      let r = Math.random() * totalW; let won = GACHA_POOL[0];
      for (const it of GACHA_POOL) { r -= it.w; if (r <= 0) { won = it; break; } }
      reel.innerHTML = `<div style="color:${won.color};font-size:36px;font-weight:bold;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.1);border-radius:8px;width:80px;height:80px;">${won.amount}</div>`;
      $('gachaResult').innerHTML = `Вы выиграли <span style="color:${won.color}">${won.amount} 💎</span>!`;
      gems += won.amount; updateUI(); save();
      sfx.drop('exclusive');
      $('gachaSpinBtn').disabled = false;
      updateGachaUI();
    }
  }, 50);
}

function sellAll() {
  const inv = safeInventory(inventory);
  if (inv.length === 0) return toast(L10N[lang].emptyInv);
  const total = inv.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
  if (!confirm(`Продать ${inv.length} шт. за ${total} $?`)) return;
  inventory = [];
  balance += total;
  renderInventory(); updateUI(); save();
  sfx.sell(); toast(`Продано ${total} $`);
}

/* ===== ИНИЦИАЛИЗАЦИЯ ===== */
function initApp() {
  if ($('openBtn')) $('openBtn').onclick = () => openCase(false);
  if ($('open10Btn')) $('open10Btn').onclick = () => openCase(true);
  if ($('sellAllBtn')) $('sellAllBtn').onclick = () => { sfx.click(); sellAll(); };
  if ($('chancesBtn')) $('chancesBtn').onclick = () => { sfx.click(); renderChances(); $('chancesOverlay').classList.add('show'); };
  if ($('indexBtn')) $('indexBtn').onclick = () => { sfx.click(); renderIndex(); $('indexOverlay').classList.add('show'); };
  if ($('shopBtn')) $('shopBtn').onclick = () => { sfx.click(); renderShop(); $('shopOverlay').classList.add('show'); };
  if ($('profileBtn')) $('profileBtn').onclick = () => { sfx.click(); renderProfile(); $('profileOverlay').classList.add('show'); };
  
  if ($('invBtn')) $('invBtn').onclick = () => {
    sfx.click(); renderInventory(); $('inventoryOverlay').classList.add('show');
  };

  if ($('muteBtn')) $('muteBtn').onclick = () => {
    muted = !muted;
    $('musicIcon').src = muted ? 'https://yourimageshare.com/ib/gZjZUKCOGU.png' : 'https://yourimageshare.com/ib/5XIcp7m5ke.png';
    if (!muted) sfx.click();
    save();
  };

  if ($('langBtn')) $('langBtn').onclick = () => {
    lang = lang === 'ru' ? 'en' : 'ru';
    sfx.click(); applyLang(); save();
  };

  if ($('gachaBtn')) $('gachaBtn').onclick = () => {
    sfx.click(); $('gachaOverlay').classList.add('show');
    updateGachaUI(); $('gachaResult').textContent = '';
  };
  if ($('gachaSpinBtn')) $('gachaSpinBtn').onclick = playGacha;
  if ($('multiClose')) $('multiClose').onclick = () => { sfx.click(); multiOverlay.classList.remove('show'); };

  if (bgMusic && volumeSlider) {
    bgMusic.volume = 0.2; volumeSlider.value = 0.2;
    volumeSlider.addEventListener('input', e => { bgMusic.volume = e.target.value; save(); });
    document.addEventListener('click', () => { bgMusic.play().catch(() => {}); }, { once: true });
  }

  document.querySelectorAll('.auto-btn').forEach(btn => {
    btn.onclick = () => {
      const r = btn.dataset.r;
      if (autoSellRarities.has(r)) { autoSellRarities.delete(r); btn.classList.remove('active'); }
      else { autoSellRarities.add(r); btn.classList.add('active'); }
      sfx.click(); save();
    };
  });

  document.querySelectorAll('.overlay').forEach(el => {
    el.onclick = e => { if (e.target === el) el.classList.remove('show'); };
  });

  loadWithAuth().then(() => {
    if (typeof balance === 'undefined' || balance === null) balance = 1000;
    if (typeof gems === 'undefined' || gems === null) gems = 50;
    if (!Array.isArray(inventory)) inventory = [];

    document.querySelectorAll('.auto-btn').forEach(b => b.classList.toggle('active', autoSellRarities.has(b.dataset.r)));
    
    if ($('musicIcon')) {
      $('musicIcon').src = muted ? 'https://yourimageshare.com/ib/gZjZUKCOGU.png' : 'https://yourimageshare.com/ib/5XIcp7m5ke.png';
    }
    
    applyLang();
    updateGachaUI();
  });
}

setInterval(() => { save(); }, 3000);

document.addEventListener('DOMContentLoaded', () => {
  const crateListEl = $('crateList');
  Object.keys(CRATES).forEach(id => {
    const btn = document.createElement('button');
    btn.className = `crate-btn ${id === activeCrate ? 'active' : ''}`;
    btn.dataset.id = id;
    btn.innerHTML = `<span>${esc(CRATES[id].name)}</span>`;
    btn.onclick = () => {
      document.querySelectorAll('.crate-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sfx.click();
      activeCrate = id;
      updateUI();
      save();
    };
    crateListEl.appendChild(btn);
  });

  initApp();
});
