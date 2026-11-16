// config.js
const RARITY = {
  common:    {label:'Common',    color:'#6cb862', w:1000},
  rare:      {label:'Rare',      color:'#2557a6', w:300},
  epic:      {label:'Epic',      color:'#b554e8', w:80},
  legendary: {label:'Legendary', color:'#fef605', w:20},
  mythic:    {label:'Mythic',    color:'#b51500', w:6},
  leader:    {label:'Leader',    color:'#4bb152', w:2},
  secret:    {label:'Secret',    color:'#fff',    w:1},
  exclusive: {label:'Exclusive', color:'#eec5ff', w:100}
};

const GIFT_IMG='https://yourimageshare.com/ib/cwwrwslAaB.png';
const GEM_CRATE_IMG='https://yourimageshare.com/ib/fKPwU3NRf6.png';

// Магазин (Эггрен)
const SHOP_ITEM = ALL_UNITS.find(u => u.name === 'Eggren');

const GACHA_POOL=[{amount:10,w:50,color:'#888'},{amount:25,w:30,color:'#3b82f6'},{amount:50,w:15,color:'#a855f7'},{amount:100,w:5,color:'#eab308'}];
const GACHA_COOLDOWN=600000, MAX_GACHA_SPINS=5;

const L10N={ru:{title:'Grenko Crates',lblBal:'Баланс',lblGems:'Гемы',lblInv:'Инвентарь',lblChances:'Шансы',lblIndex:'Индекс',lblShop:'Магазин',lblProfile:'Профиль',lblOpen:'Открыть',lblOpen10:'x10',lblInvTitle:'Инвентарь',lblInvHint:'Клик — продать',emptyInv:'Инвентарь пуст',lblChancesTitle:'Шансы выпадения',clickOpen:'Нажми «Открыть»',priceAfter:'Цена продажи',takeInv:'Забрать в инвентарь',sold:'Продан',soldAll:'Продано',for:'за',history:'Последние',noHist:'История открытий появится здесь',autoOpen:'⚡ Авто-открытие',sellAll:'Продать всё',typeTrans:{'Type':'Тип','Damage':'Урон','Range':'Дальность','Cooldown':'Перезарядка','Limit':'Лимит','Stun Time':'Время стана','Damage Boost':'Бонус урона','Spawn Cooldown':'Перезарядка спавна','Ally HP':'Здоровье миньона','Ally DPS':'Урон миньона','Knockback Strength':'Сила отбрасывания','Critical Stun Chance':'Шанс стана','Critical Stun Damage Multiplier':'Множитель урона','Critical Stun Time':'Время стана'}},en:{title:'Grenko Crates',lblBal:'Balance',lblGems:'Gems',lblInv:'Inventory',lblChances:'Chances',lblIndex:'Index',lblShop:'Shop',lblProfile:'Profile',lblOpen:'Open',lblOpen10:'x10',lblInvTitle:'Inventory',lblInvHint:'Click to sell',emptyInv:'Inventory is empty',lblChancesTitle:'Drop Chances',clickOpen:'Click "Open"',priceAfter:'Sell price',takeInv:'Take to inventory',sold:'Sold',soldAll:'Sold',for:'for',history:'Recent',noHist:'Open history will appear here',autoOpen:'⚡ Auto-Open',sellAll:'Sell All',typeTrans:{'Type':'Type','Damage':'Damage','Range':'Range','Cooldown':'Cooldown','Limit':'Limit','Stun Time':'Stun Time','Damage Boost':'Damage Boost','Spawn Cooldown':'Spawn Cooldown','Ally HP':'Minion HP','Ally DPS':'Minion DPS','Knockback Strength':'Knockback Strength','Critical Stun Chance':'Stun Chance','Critical Stun Damage Multiplier':'Damage Multiplier','Critical Stun Time':'Stun Time'}}};