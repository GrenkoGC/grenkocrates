// main.js
const scene = $('scene'), slotIcon = $('slotIcon'), slotName = $('slotName'), flash = $('flash'), dropOverlay = $('dropOverlay'), multiOverlay = $('multiOverlay'), invGrid = $('invGrid');
const bgMusic = $('bgMusic'), volumeSlider = $('volumeSlider');

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

// Функция Окон Шансов (обновлена под новый формат)
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

// Остальные функции (renderInventory, renderIndex, renderProfile, openCase и т.д.) 
// остаются без изменений, так как они используют getItemData и randomItem из utils.js