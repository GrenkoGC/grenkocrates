// state.js
let balance=1000, gems=50, inventory=[], spinning=false, muted=false, isAutoOpen=false;
let autoSellRarities=new Set(), lang='ru', activeCrate='crate1';
let gachaSpins=0, gachaLastTick=Date.now(), casesOpened=0;
let tgWebData = null;
const SAVE_KEY = 'grenko_save_v2'; 
const API_URL = 'https://grenko-api.treugalnik.workers.dev';
