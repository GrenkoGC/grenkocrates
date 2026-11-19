// main.js — Часть 1/2: UI

let gameSettings = { luck: 1, forceDrop: null };

const scene = gid('scene');
const slotIcon = gid('slotIcon');
const slotName = gid('slotName');
const flash = gid('flash');
const dropOverlay = gid('dropOverlay');
const multiOverlay = gid('multiOverlay');
const invGrid = gid('invGrid');
const bgMusic = gid('bgMusic');
const volumeSlider = gid('volumeSlider');

/* ===== UI ===== */

function updateUI() {
  $('invCount').textContent = inventory.length;
  $('balance').textContent = Math.floor(balance);
  $('gems').textContent = Math.floor(gems);
  $('openBtn').disabled = spinning;
  $('open10Btn').disabled = spinning;

  const c = CRATES[activeCrate], l = L10N[lang];
  $('lblOpen').textContent = `${l.lblOpen} · ${c.cost} ${c.currency}`;
  $('lblOpen10').textContent = `${l.lblOpen10} · ${c.cost * 10} ${c.currency}`;
  $('sellAllBtn').textContent = l.sellAll;
}

function applyLang() {
  const t = L10N[lang];
  $('title').textContent = t.title;
  $('lblBal').textContent = t.lblBal;
  $('lblGems').textContent = t.lblGems;
  $('lblInv').textContent = t.lblInv;
  $('lblChances').textContent = t.lblChances;

  const elIndex = $('lblIndex'); if (elIndex) elIndex.textContent = t.lblIndex || 'Индекс';
  const elShop = $('lblShop'); if (elShop) elShop.textContent = t.lblShop || 'Магазин';
  const elProfile = $('lblProfile'); if (elProfile) elProfile.textContent = t.lblProfile || 'Профиль';

  $('lblInvTitle').textContent = t.lblInvTitle;
  $('lblInvHint').textContent = t.lblInvHint;
  $('invGrid').setAttribute('data-empty', t.emptyInv);
  $('lblChancesTitle').textContent = t.lblChancesTitle;
  $('dClose').textContent = t.takeInv;
  $('langBtn').textContent = lang === 'ru' ? 'EN' : 'RU';
  $('autoBtn').textContent = t.autoOpen;

  if (!inventory.length) $('history').textContent = t.noHist;
  if (!spinning && !dropOverlay.classList.contains('show') && !multiOverlay.classList.contains('show')) {
    $('slotName').textContent = t.clickOpen;
  }

  if ($('chancesOverlay').classList.contains('show')) renderChances();

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
    el.className = `inv-item ${rKey}`;

    const iconStyle = ult ? '' : `filter:drop-shadow(0 0 6px ${r.color}80)`;
    const nameCls = rarityTextClass(rKey);
    const nameStyle = ult ? '' : 'color:var(--txt);';

    el.innerHTML = `
      <div class="icon ${rarityIconClass(rKey)}" style="${iconStyle}">${iconOf(it.name, false)}</div>
      <div class="${nameCls}" style="${nameStyle}margin-top:4px;font-size:10px;word-break:break-word;line-height:1.1">${esc(it.name)}</div>
      <div class="price">${it.price} $</div>
    `;

    let statsHtml = '';
    if (it.stats && Object.keys(it.stats).length) {
      statsHtml = Object.entries(it.stats).map(([k, v]) => {
        const tk = L10N[lang].typeTrans[k] || k;
        return `<div class="st-row"><span class="st-name">${esc(tk)}:</span><span class="st-val">${esc(v)}</span></div>`;
      }).join('');
    } else {
      statsHtml = '<div class="st-row" style="justify-content:center;color:var(--txt2)">Нет характеристик</div>';
    }

    const tooltip = document.getElementById('invTooltip');

    el.onmouseenter = () => {
      if (window.innerWidth < 768) return;
      tooltip.innerHTML = statsHtml;
      tooltip.classList.add('show');
      const rect = el.getBoundingClientRect();
      tooltip.style.left = Math.min(window.innerWidth - 210, Math.max(10, rect.left + rect.width / 2 - 100)) + 'px';
      tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
    };

    el.onmouseleave = () => tooltip.classList.remove('show');

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
        card.style.boxShadow = '';
      } else {
        card.classList.remove('rar-ultimate-card');
        card.style.borderColor = r.color;
        card.style.boxShadow = `0 0 30px ${r.color}33, inset 0 0 20px ${r.color}11`;
      }

      const s = $('dStats');
      if (it.stats && Object.keys(it.stats).length) {
        s.style.display = 'flex';
        s.innerHTML = Object.entries(it.stats).filter(([k, v]) => v).map(([k, v], idx) => {
          const tk = L10N[lang].typeTrans[k] || k;
          return `<div class="stat-row" style="${idx === 0 ? 'color:#fff;font-weight:bold;margin-bottom:4px' : ''}"><span>${esc(tk)}:</span><span>${esc(v)}</span></div>`;
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
        updateUI();
        renderInventory();
        sfx.sell();
        toast(`${L10N[lang].sold} ${it.name}`);
        save();

        btn.textContent = L10N[lang].takeInv;
        btn.style.borderColor = 'var(--lin)';
        btn.style.color = 'var(--txt)';
        btn.onclick = () => {
          sfx.click();
          dropOverlay.classList.remove('show');
          setTimeout(() => {
            slotIcon.innerHTML = `<img src="${CRATES[activeCrate].img}">`;
            slotName.textContent = L10N[lang].clickOpen;
          }, 320);
        };
        setTimeout(() => {
          slotIcon.innerHTML = `<img src="${CRATES[activeCrate].img}">`;
          slotName.textContent = L10N[lang].clickOpen;
        }, 320);
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
  list.innerHTML = '';
  sum.innerHTML = '';

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
    row.className = 'chance-row';
    row.style.borderLeftColor = r.color;

    const displayName = it.secret ? '???' : it.name;
    const nameCls = it.secret ? '' : rarityTextClass(rKey);

    row.innerHTML = `
      <div class="ci" style="width:30px;height:30px;filter:drop-shadow(0 0 4px ${r.color}80)">${iconOf(it.name, true)}</div>
      <div class="cn ${nameCls}">${esc(displayName)}
        <div class="cr" style="color:${r.color}">${r.label} · ${it.price} $</div>
        <div class="chance-bar"><div data-w="${Math.min(entry.chance * 10, 100)}" style="background:${r.color}"></div></div>
      </div>
      <div class="cp" style="color:${r.color}">${entry.chance.toFixed(2)}%</div>
    `;
    list.appendChild(row);
  });

  setTimeout(() => {
    list.querySelectorAll('.chance-bar div').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }, 50);
}

function renderIndex() {
  const grid = document.getElementById('indexGrid');
  grid.innerHTML = '';
  const inv = safeInventory(inventory);
  const foundItems = new Set(inv.map(it => String(it.name).trim().toLowerCase()));

  RARITY_ORDER.forEach(rKey => {
    const unitsInRarity = ALL_UNITS.filter(u => normalizeRarity(u.r) === rKey);
    if (unitsInRarity.length === 0) return;

    const r = RARITY[rKey];
    const section = document.createElement('div');
    section.innerHTML = `<div class="index-section-title ${rarityTextClass(rKey)}" style="color:${r.color}">${r.label}</div>`;

    const row = document.createElement('div');
    row.className = 'index-items-row';

    unitsInRarity.forEach(it => {
      const hasFound = foundItems.has(String(it.name).trim().toLowerCase());
      const isSecret = it.secret;
      const displayName = (!hasFound || isSecret) ? '???' : it.name;

      const el = document.createElement('div');
      el.className = `index-item ${hasFound ? '' : 'locked'}`;

      const iconCls = hasFound && !isSecret ? rarityIconClass(rKey) : '';
      const nameCls = hasFound && !isSecret ? rarityTextClass(rKey) : '';
      const nameStyle = hasFound && !isSecret ? '' : 'color:var(--txt2)';

      el.innerHTML = `
        <img src="${hasFound && !isSecret ? esc(it.img) : FALLBACK_IMG}" class="${iconCls}" alt="${esc(displayName)}">
        <span class="${nameCls}" style="${nameStyle}">${esc(displayName)}</span>
      `;
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
      el.className = 'profile-unit';

      const iconCls = rarityIconClass(rKey);
      const nameCls = rarityTextClass(rKey);
      const iconStyle = rKey === 'ultimate' ? '' : `filter:drop-shadow(0 0 5px ${r.color}aa)`;
      const nameStyle = rKey === 'ultimate' ? '' : `color:${r.color}`;

      el.innerHTML = `
        <div class="${iconCls}" style="width:24px; height:24px; ${iconStyle}">${iconOf(it.name)}</div>
        <span class="${nameCls}" style="${nameStyle}">${esc(it.name)}</span>
        <span class="u-price">${it.price} $</span>
      `;
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
      <div style="font-size:11px; color:var(--txt2); text-align:center; margin-top:5px;">Узнать свой ID можно у бота <b>@userinfobot</b></div>
    `;
  } else {
    actionsContainer.innerHTML = `<button class="btn-danger" style="width:100%; border-color:var(--red); color:var(--red); background:linear-gradient(180deg, rgba(255,68,68,0.1), transparent);" onclick="logoutProfile()">Выйти из профиля</button>`;
  }
}

function renderShop() {
  const item = SHOP_ITEM;
  if (!item) return;
  const rKey = normalizeRarity(item.r);
  const r = RARITY[rKey];

  $('shopItemImg').innerHTML = `<img src="${esc(item.img)}" alt="${esc(item.name)}">`;
  $('shopItemName').textContent = item.name;
  $('shopItemRarity').textContent = r.label;
  $('shopItemRarity').style.color = r.color;
  $('shopItemStats').innerHTML = Object.entries(item.stats || {}).map(([k, v], idx) => {
    const tk = L10N[lang].typeTrans[k] || k;
    return `<div class="stat-row" style="${idx === 0 ? 'color:#fff;font-weight:bold;margin-bottom:4px' : ''}"><span>${esc(tk)}:</span><span>${esc(v)}</span></div>`;
  }).join('');
}

/* ===== ЛОГИКА ===== */

function processSpin(won, isAuto = false) {
  if (spinning) return; // Защита от двойного запуска
  spinning = true;
  updateUI();

  const c = CRATES[activeCrate];

  // Проверка баланса
  if (c.currency === '💎') {
    if (gems < c.cost) {
      spinning = false;
      isAutoOpen = false;
      $('autoBtn').classList.remove('active');
      updateUI();
      save();
      return toast(L10N[lang].lblGems + ' не хватает!');
    }
    gems -= c.cost;
  } else {
    if (balance < c.cost) {
      spinning = false;
      isAutoOpen = false;
      $('autoBtn').classList.remove('active');
      updateUI();
      save();
      return toast('Недостаточно $');
    }
    balance -= c.cost;
  }

  casesOpened++;
  updateUI();
  save();

  // Настройка анимации
  const duration = isAuto ? 800 : 2600;
  const startT = performance.now();
  const ease = t => t * t * t;

  (function spin() {
    const el = performance.now() - startT;
    const prog = Math.min(el / duration, 1);
    const interval = 170 - 135 * ease(prog);
    const pool = c.pool;
    
    // Для анимации берем случайный предмет
    const it = pool[Math.floor(Math.random() * pool.length)];
    const displayItem = getItemData(it.name);

    slotIcon.innerHTML = iconOf(displayItem.name, true);
    slotName.textContent = displayItem.secret ? '???' : displayItem.name;
    slotIcon.classList.remove('tick');
    void slotIcon.offsetWidth; // Сброс анимации CSS
    slotIcon.classList.add('tick');
    
    if (typeof sfx !== 'undefined' && sfx.tick) sfx.tick(prog);

    if (prog >= 1) {
      // Анимация завершена, показываем результат
      scene.classList.remove('tension');
      flash.classList.remove('on');
      void flash.offsetWidth;
      flash.classList.add('on');
      
      if (typeof sfx !== 'undefined' && sfx.flash) sfx.flash();

      setTimeout(() => {
        slotIcon.innerHTML = iconOf(won.name, false);
        slotName.textContent = won.secret ? '???' : won.name;

        const wonRKey = normalizeRarity(won.r);
        const isSold = autoSellRarities.has(wonRKey);
        
        if (isSold) {
          balance += won.price;
          updateUI();
          if (typeof sfx !== 'undefined' && sfx.sell) sfx.sell();
          toast(`${L10N[lang].sold} ${won.name}`);
        } else if (inventory.length >= 1000) {
          balance += won.price;
          toast('Инвентарь полон — юнит продан');
        } else {
          inventory.push(won);
        }

        renderInventory();

        if (!isAuto) showDrop(won);

        spinning = false; // Разблокируем кнопки
        updateUI();
        save();

        if (!isAuto) {
          const inv = safeInventory(inventory);
          $('history').innerHTML = L10N[lang].history + ': ' + inv.slice(-5).reverse().map(x => x.secret ? '???' : esc(x.name)).join(' · ');
        } else {
          setTimeout(() => {
            if (isAutoOpen) processSpin(randomItem(), true);
          }, 500);
        }
      }, isAuto ? 200 : 800 * .35);
    } else {
      // Продолжаем крутить
      setTimeout(spin, interval);
    }
  })();

  scene.classList.add('tension');
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
    card.style.boxShadow = '';
  } else {
    card.classList.remove('rar-ultimate-card');
    card.style.borderColor = r.color;
    card.style.boxShadow = `0 0 30px ${r.color}33, inset 0 0 20px ${r.color}11`;
  }

  card.style.maxHeight = '85vh';
  card.style.overflow = 'hidden';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';

  const s = $('dStats');
  if (it.stats && Object.keys(it.stats).length) {
    s.style.display = 'flex';
    s.innerHTML = Object.entries(it.stats).filter(([k, v]) => v).map(([k, v], idx) => {
      const tk = L10N[lang].typeTrans[k] || k;
      return `<div class="stat-row" style="${idx === 0 ? 'color:#fff;font-weight:bold;margin-bottom:4px' : ''}"><span>${esc(tk)}:</span><span>${esc(v)}</span></div>`;
    }).join('');
    s.style.maxHeight = '40vh';
    s.style.overflowY = 'auto';
    s.style.flexShrink = '0';
    s.style.paddingRight = '8px';
  } else {
    s.style.display = 'none';
  }

  const btn = $('dClose');
  btn.textContent = L10N[lang].takeInv;
  btn.style.borderColor = 'var(--lin)';
  btn.style.color = 'var(--txt)';
  btn.onclick = () => {
    sfx.click();
    dropOverlay.classList.remove('show');
    setTimeout(() => {
      slotIcon.innerHTML = `<img src="${CRATES[activeCrate].img}">`;
      slotName.textContent = L10N[lang].clickOpen;
    }, 320);
  };

  dropOverlay.classList.add('show');
  sfx.drop(rKey);
}

function openCase(isMulti = false) {
  if (spinning) return;
  const c = CRATES[activeCrate];
  const needSpace = isMulti ? 10 : 1;
  if (inventory.length + needSpace > 1000) return toast('Инвентарь переполнен! Продай что-нибудь');

  const totalCost = isMulti ? c.cost * 10 : c.cost;
  if (c.currency === '💎' && gems < totalCost) return toast(L10N[lang].lblGems + ' не хватает!');
  if (c.currency === '$' && balance < totalCost) return toast('Недостаточно $');

  sfx.click();

  if (isMulti) {
    const wonItems = [];
    let totalProfit = 0;

    if (c.currency === '💎') gems -= totalCost;
    else balance -= totalCost;

    casesOpened += 10;
    updateUI();
    save();

    for (let i = 0; i < 10; i++) {
      const it = randomItem();
      if (autoSellRarities.has(normalizeRarity(it.r))) totalProfit += it.price;
      else wonItems.push(it);
    }

    balance += totalProfit;
    inventory.push(...wonItems);
    renderInventory();
    updateUI();
    save();
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
    el.className = 'multi-item';

    const iconStyle = ult ? '' : `filter:drop-shadow(0 0 6px ${r.color}cc)`;

    el.innerHTML = `
      <div class="mi-icon ${rarityIconClass(rKey)}" style="${iconStyle}">${iconOf(it.name, false)}</div>
      <div class="mi-name ${rarityTextClass(rKey)}">${esc(it.name)}</div>
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
  if (gems < SHOP_ITEM.price) {
    toast('Недостаточно гемов!');
    return;
  }
  gems -= SHOP_ITEM.price;
  const newItem = { ...SHOP_ITEM, r: normalizeRarity(SHOP_ITEM.r), stats: deepClone(SHOP_ITEM.stats || {}) };
  inventory.push(newItem);
  updateUI();
  renderInventory();
  save();
  toast(`Куплен ${SHOP_ITEM.name}!`);
  $('shopOverlay').classList.remove('show');
  sfx.drop('exclusive');
}

/* ===== АВТОРИЗАЦИЯ (без изменений контракта) ===== */

function linkAccount() {
  const id = $('inpUserId').value.trim();
  if (!id || isNaN(id)) return toast('Введите корректный цифровой ID');

  toast('Проверка ID...');

  fetch(`${API_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: id })
  })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(user => {
      tgWebData = user;
      localStorage.setItem('grenko_tg_user', JSON.stringify(user));
      toast('Аккаунт успешно привязан!');
      load().then(() => {
        renderInventory();
        updateUI();
        $('profileOverlay').classList.remove('show');
        renderProfile();
      });
    })
    .catch(() => toast('Ошибка: неверный ID или проблемы с сервером'));
}

function logoutProfile() {
  if (!confirm('Выйти из профиля? Ваш прогресс сохранится в облаке, но локальный кэш будет удалён.')) return;
  localStorage.removeItem('grenko_tg_user');
  localStorage.removeItem(SAVE_KEY);
  tgWebData = null;
  toast('Вы вышли из профиля');
  $('profileOverlay').classList.remove('show');
  setTimeout(() => { window.location.reload(); }, 1000);
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

  const badge = $('gachaBadge');
  if (gachaSpins > 0) {
    badge.style.display = 'flex';
    badge.textContent = gachaSpins;
  } else {
    badge.style.display = 'none';
  }

  if (gachaSpins >= MAX_GACHA_SPINS) {
    $('gachaTimer').textContent = 'Максимум спинов!';
  } else {
    const nextSpin = GACHA_COOLDOWN - (now - gachaLastTick);
    const m = Math.floor(nextSpin / 60000);
    const s = Math.floor((nextSpin % 60000) / 1000);
    $('gachaTimer').textContent = `Спинов: ${gachaSpins}. Следующий через: ${m}м ${s}с`;
  }
}

setInterval(updateGachaUI, 1000);

function playGacha() {
  if (gachaSpins <= 0) return;
  gachaSpins--;
  save();
  updateGachaUI();
  $('gachaSpinBtn').disabled = true;

  const reel = $('gachaReel');
  reel.innerHTML = '';
  let ticks = 0;
  const maxTicks = 20;

  const interval = setInterval(() => {
    ticks++;
    const rand = GACHA_POOL[Math.floor(Math.random() * GACHA_POOL.length)];
    reel.innerHTML = `<div class="gacha-item" style="color:${rand.color};font-size:24px;font-weight:bold;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05);border-radius:8px;width:100%;max-width:80px;transform:scale(1.1);transition:transform .1s;">${rand.amount}</div>`;
    sfx.tick(ticks / maxTicks);

    if (ticks >= maxTicks) {
      clearInterval(interval);

      const totalW = GACHA_POOL.reduce((s, i) => s + i.w, 0);
      let r = Math.random() * totalW;
      let won = GACHA_POOL[0];
      for (const it of GACHA_POOL) {
        r -= it.w;
        if (r <= 0) { won = it; break; }
      }

      reel.innerHTML = `<div class="gacha-item" style="color:${won.color};font-size:32px;font-weight:bold;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.1);border-radius:8px;width:100%;max-width:80px;transform:scale(1.2);transition:transform .3s var(--ease);">${won.amount}</div>`;
      $('gachaResult').innerHTML = `Вы выиграли <span style="color:${won.color}">${won.amount} 💎</span>!`;
      gems += won.amount;
      updateUI();
      save();
      sfx.drop('exclusive');
      $('gachaSpinBtn').disabled = false;
      updateGachaUI();
    }
  }, 50);
}

/* ===== ПРОДАЖА ВСЕГО ===== */

function sellAll() {
  const inv = safeInventory(inventory);
  if (inv.length === 0) {
    return toast(L10N[lang].emptyInv);
  }

  const total = inv.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  if (!confirm(`${L10N[lang].sellAll} ${inv.length} шт. за ${total} $?`)) return;

  inventory = [];
  balance += total;

  renderInventory();
  updateUI();
  save();
  sfx.sell();
  toast(`${L10N[lang].soldAll} ${total} $`);
}

/* ===== ИНИЦИАЛИЗАЦИЯ ===== */

function initApp() {
  $('openBtn').onclick = () => openCase(false);
  $('open10Btn').onclick = () => openCase(true);

  $('autoBtn').onclick = () => {
    isAutoOpen = !isAutoOpen;
    $('autoBtn').classList.toggle('active', isAutoOpen);
    save();
    if (isAutoOpen && !spinning) processSpin(randomItem(), true);
  };

  $('sellAllBtn').onclick = () => {
    sfx.click();
    sellAll();
  };

  $('chancesBtn').onclick = () => { sfx.click(); renderChances(); $('chancesOverlay').classList.add('show'); };
  $('indexBtn').onclick = () => { sfx.click(); renderIndex(); $('indexOverlay').classList.add('show'); };
  $('shopBtn').onclick = () => { sfx.click(); renderShop(); $('shopOverlay').classList.add('show'); };
  $('profileBtn').onclick = () => { sfx.click(); renderProfile(); $('profileOverlay').classList.add('show'); };

  $('muteBtn').onclick = () => {
    muted = !muted;
    $('soundOn').style.display = muted ? 'none' : 'block';
    $('soundOff').style.display = muted ? 'block' : 'none';
    if (!muted) sfx.click();
    save();
  };

  $('resetBtn').onclick = () => {
    if (!confirm('Сбросить весь прогресс? Это нельзя отменить.')) return;
    localStorage.removeItem(SAVE_KEY);
    balance = 1000;
    gems = 50;
    inventory = [];
    activeCrate = 'crate1';
    lang = 'ru';
    autoSellRarities = new Set();
    gachaSpins = 0;
    gachaLastTick = Date.now();
    muted = false;
    casesOpened = 0;
    gameSettings = { luck: 1, forceDrop: null };
    document.querySelectorAll('.auto-sell-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.crate-btn').forEach(b => b.classList.toggle('active', b.dataset.id === 'crate1'));
    $('soundOn').style.display = 'block';
    $('soundOff').style.display = 'none';
    slotIcon.innerHTML = `<img src="${CRATES.crate1.img}">`;
    renderInventory();
    updateUI();
    updateGachaUI();
    applyLang();
    toast('Прогресс сброшен');
  };

  $('gachaBtn').onclick = () => {
    sfx.click();
    $('gachaOverlay').classList.add('show');
    updateGachaUI();
    $('gachaResult').textContent = '';
  };
  $('gachaSpinBtn').onclick = playGacha;

  $('multiClose').onclick = () => {
    sfx.click();
    multiOverlay.classList.remove('show');
    setTimeout(() => {
      slotIcon.innerHTML = `<img src="${CRATES[activeCrate].img}">`;
      slotName.textContent = L10N[lang].clickOpen;
    }, 320);
  };

  bgMusic.volume = 0.2;
  volumeSlider.value = 0.2;
  volumeSlider.addEventListener('input', e => {
    bgMusic.volume = e.target.value;
    save();
  });

  document.addEventListener('click', () => { bgMusic.play().catch(() => {}); }, { once: true });

  document.querySelectorAll('.auto-sell-btn').forEach(btn => {
    btn.onclick = () => {
      const r = btn.dataset.r;
      if (autoSellRarities.has(r)) {
        autoSellRarities.delete(r);
        btn.classList.remove('active');
      } else {
        autoSellRarities.add(r);
        btn.classList.add('active');
      }
      sfx.click();
      save();
    };
  });

  document.querySelectorAll('.overlay').forEach(el => {
    el.onclick = e => {
      if (e.target === el) {
        el.classList.remove('show');
        if (el.id === 'dropOverlay' || el.id === 'multiOverlay') {
          setTimeout(() => {
            slotIcon.innerHTML = `<img src="${CRATES[activeCrate].img}">`;
            slotName.textContent = L10N[lang].clickOpen;
          }, 320);
        }
      }
    };
  });

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

setInterval(() => { save(); }, 3000);

document.addEventListener('DOMContentLoaded', () => {
  const crateListEl = $('crateList');
  Object.keys(CRATES).forEach(id => {
    const btn = document.createElement('button');
    btn.className = `crate-btn ${id === activeCrate ? 'active' : ''}`;
    btn.dataset.id = id;
    btn.innerHTML = `<img src="${CRATES[id].img}" alt="crate"> ${esc(CRATES[id].name)}`;
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
