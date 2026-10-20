// ============================================================================
// 🎓 角色、家長護眼時間鎖定與語音全域設定（自動持久化儲存）
// ============================================================================
const PET_CONFIG = {
  corieName: localStorage.getItem('pet_corie_name') || 'Corie',
  duncanName: localStorage.getItem('pet_duncan_name') || 'Duncan',
  shannonName: localStorage.getItem('pet_shannon_name') || 'Shannon',
  ttsMode: localStorage.getItem('pet_tts_mode') || 'auto',
  speechRate: parseFloat(localStorage.getItem('pet_speech_rate') || '1.00'),
  zhVoiceURI: localStorage.getItem('pet_zh_voice') || '',
  enVoiceURI: localStorage.getItem('pet_en_voice') || '',
  timeLimitMinutes: parseInt(localStorage.getItem('pet_time_limit_mins') || '20', 10),
  parentPin: localStorage.getItem('pet_parent_pin') || '1234',
};

// ============================================================================
// 💾 玩家完整學習進度與寵物養成存檔系統 (SAVE_DATA)
// ============================================================================
const DEFAULT_SAVE = {
  totalStars: parseInt(localStorage.getItem('kids_total_stars') || '0', 10),
  coins: 60, // 初始贈送 60 金幣讓小朋友體驗餵食
  totalAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  activePetId: 'corie',
  currentShopTab: 'food',
  levelClears: {}, // e.g., { 'en_1': 2, 'math_4': 1 }
  savedSession: null, // 自動記錄未完局的關卡與題號
  pets: {
    corie: { level: 1, exp: 0, hunger: 80, mood: 85, hat: '', item: '' },
    duncan: { level: 1, exp: 0, hunger: 80, mood: 85, hat: '', item: '' },
    shannon: { level: 1, exp: 0, hunger: 80, mood: 85, hat: '', item: '' },
    dragon: { level: 1, exp: 0, hunger: 75, mood: 80, hat: '', item: '' },
    unicorn: { level: 1, exp: 0, hunger: 75, mood: 80, hat: '', item: '' },
  },
  ownedItems: [],
};

let SAVE_DATA = loadSaveData();

function loadSaveData() {
  try {
    const raw = localStorage.getItem('kids_scholar_save_v8');
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SAVE));
    const parsed = JSON.parse(raw);
    return {
      ... DEFAULT_SAVE,
      ...parsed,
      pets: { ...DEFAULT_SAVE.pets, ...(parsed.pets || {}) },
      levelClears: { ...(parsed.levelClears || {}) },
      ownedItems: Array.isArray(parsed.ownedItems) ? parsed.ownedItems : [],
    };
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_SAVE));
  }
}

function saveProgress() {
  localStorage.setItem('kids_total_stars', String(SAVE_DATA.totalStars));
  localStorage.setItem('kids_scholar_save_v8', JSON.stringify(SAVE_DATA));
}

// ============================================================================
// 🏡 寵物養成商店資料（餐廳食物、特訓陪玩、穿戴造型）
// ============================================================================
const PET_SHOP_CATALOG = {
  food: [
    { id: 'food_bone', icon: '🍖', title: '香烤大雞腿', cost: 15, hunger: 20, mood: 5, exp: 25, msg: '阿姆阿姆！香烤雞腿超多汁，體力滿滿！' },
    { id: 'food_sushi', icon: '🍣', title: '頂級鮭魚壽司', cost: 25, hunger: 30, mood: 10, exp: 45, msg: '哇！新鮮鮭魚壽司，腦力瞬間提升！' },
    { id: 'food_tart', icon: '🍓', title: '皇家草莓塔', cost: 35, hunger: 25, mood: 25, exp: 65, msg: '酸酸甜甜的草莓塔，心情變成一百分！' },
    { id: 'food_steak', icon: '🥩', title: '威靈頓牛排', cost: 50, hunger: 50, mood: 30, exp: 100, msg: '太豪華了吧！吃完直接升等變學霸！' },
  ],
  play: [
    { id: 'play_frisbee', icon: '🥏', title: '極限飛盤特訓', cost: 15, hunger: -5, mood: 25, exp: 35, msg: '咻—啪！精準接住飛盤，反應力大提升！' },
    { id: 'play_chess', icon: '♟️', title: '西洋棋腦力賽', cost: 25, hunger: -5, mood: 20, exp: 55, msg: '動動腦下西洋棋，邏輯推理變超強！' },
    { id: 'play_skate', icon: '🛹', title: '火箭滑板衝刺', cost: 35, hunger: -10, mood: 35, exp: 75, msg: '帥氣翻轉滑板！全場為你歡呼！' },
    { id: 'play_space', icon: '🚀', title: '太空無重力探險', cost: 50, hunger: -10, mood: 50, exp: 110, msg: '飛向宇宙浩瀚無垠！獲得滿滿經驗值！' },
  ],
  dress: [
    { id: 'hat_crown', slot: 'hat', icon: '👑', title: '黃金學霸皇冠', cost: 60, msg: '戴上閃亮亮的黃金皇冠，太有氣勢了！' },
    { id: 'hat_grad', slot: 'hat', icon: '🎓', title: '博士畢業方帽', cost: 50, msg: '戴上博士帽，看起來就像大學教授！' },
    { id: 'hat_wizard', slot: 'hat', icon: '🧙', title: '星辰魔法帽', cost: 70, msg: '充滿魔力的星辰巫師帽！' },
    { id: 'hat_ribbon', slot: 'hat', icon: '🎀', title: '皇家粉紅蝴蝶結', cost: 40, msg: '超可愛的皇家蝴蝶結！' },
    { id: 'item_glasses', slot: 'item', icon: '🕶️', title: '特務帥氣墨鏡', cost: 45, msg: '戴上特務墨鏡，帥度破表！' },
    { id: 'item_wand', slot: 'item', icon: '🪄', title: '仙女星光魔杖', cost: 65, msg: '揮動星光魔杖，難題通通迎刃而解！' },
    { id: 'item_medal', slot: 'item', icon: '🏅', title: '奧林匹亞金牌', cost: 80, msg: '榮耀的奧林匹亞金牌得主！' },
    { id: 'item_trophy', slot: 'item', icon: '🏆', title: '傳奇大宗師獎盃', cost: 120, msg: '最高榮譽傳奇獎盃！你是最強小學霸！' },
  ],
};

function getPetRankTitle(lvl) {
  if (lvl >= 15) return `👑 Lv.${lvl} 傳奇大宗師`;
  if (lvl >= 10) return `💎 Lv.${lvl} 皇家智多星`;
  if (lvl >= 6) return `🏆 Lv.${lvl} 榮譽小學霸`;
  if (lvl >= 3) return `🌟 Lv.${lvl} 聰明小隊長`;
  return `🌱 Lv.${lvl} 實習小跟班`;
}

function getPetDisplayName(petId) {
  if (petId === 'corie') return `橘貓 ${PET_CONFIG.corieName}`;
  if (petId === 'duncan') return `邊牧 ${PET_CONFIG.duncanName}`;
  if (petId === 'shannon') return `魚姊姊 ${PET_CONFIG.shannonName}`;
  if (petId === 'dragon') return '星光小龍 Draco';
  return '彩虹獨角獸 Stella';
}

function selectCompanionPet(petId) {
  SAVE_DATA.activePetId = petId;
  saveProgress();
  renderPetSanctuary();
  playTone(580, 0.1, 'triangle');
}

function switchPetShopTab(tab) {
  SAVE_DATA.currentShopTab = tab;
  renderPetSanctuary();
}

function renderPetSanctuary() {
  const petId = SAVE_DATA.activePetId || 'corie';
  const petObj = SAVE_DATA.pets[petId] || SAVE_DATA.pets.corie;

  ['corie', 'duncan', 'shannon', 'dragon', 'unicorn'].forEach((id) => {
    const btn = document.getElementById(`switch-pet-${id}`);
    if (btn) btn.classList.toggle('active', id === petId);
  });

  const titleEl = document.getElementById('active-pet-title');
  if (titleEl) titleEl.textContent = `正在養成：${getPetDisplayName(petId)}`;

  const imgEl = document.getElementById('companion-img');
  const emoEl = document.getElementById('companion-emoji');
  if (imgEl && emoEl) {
    if (petId === 'corie' || petId === 'duncan' || petId === 'shannon') {
      imgEl.style.display = 'block';
      imgEl.src = `assets/${petId}.png?v=8`;
      emoEl.style.display = 'none';
    } else {
      imgEl.style.display = 'none';
      emoEl.style.display = 'flex';
      emoEl.textContent = petId === 'dragon' ? '🐲' : '🦄';
    }
  }

  document.getElementById('pet-equipped-hat').textContent = petObj.hat || '';
  document.getElementById('pet-equipped-item').textContent = petObj.item || '';
  document.getElementById('pet-stage-rank').textContent = getPetRankTitle(petObj.level);

  const expNeeded = petObj.level * 100;
  const expPct = Math.min(100, Math.round((petObj.exp / expNeeded) * 100));
  document.getElementById('pet-lvl-text').textContent = `Lv.${petObj.level} (${petObj.exp}/${expNeeded})`;
  document.getElementById('pet-exp-bar').style.width = `${expPct}%`;

  document.getElementById('pet-hunger-text').textContent = `${petObj.hunger}%`;
  document.getElementById('pet-hunger-bar').style.width = `${petObj.hunger}%`;

  document.getElementById('pet-mood-text').textContent = `${petObj.mood}%`;
  document.getElementById('pet-mood-bar').style.width = `${petObj.mood}%`;

  const tab = SAVE_DATA.currentShopTab || 'food';
  ['food', 'play', 'dress'].forEach((t) => {
    const b = document.getElementById(`tab-btn-${t}`);
    if (b) b.classList.toggle('active', t === tab);
  });

  const listEl = document.getElementById('pet-shop-items');
  if (!listEl) return;
  listEl.innerHTML = '';

  const items = PET_SHOP_CATALOG[tab] || [];
  items.forEach((entry) => {
    const btn = document.createElement('button');
    btn.className = 'shop-item-btn';
    const isOwned = SAVE_DATA.ownedItems.includes(entry.id);
    const isEquipped =
      tab === 'dress' &&
      ((entry.slot === 'hat' && petObj.hat === entry.icon) ||
       (entry.slot === 'item' && petObj.item === entry.icon));

    if (isOwned) btn.classList.add('owned');
    if (isEquipped) btn.classList.add('equipped');

    let costLabel = `🪙 ${entry.cost} 金幣`;
    if (tab === 'dress' && isOwned) {
      costLabel = isEquipped ? '✅ 穿戴中（點此卸下）' : '🎒 已擁有（點此穿戴）';
    }

    btn.innerHTML = `
      <div class="shop-icon">${entry.icon}</div>
      <div class="shop-title">${entry.title}</div>
      <div class="shop-cost">${costLabel}</div>
    `;
    btn.onclick = () => handleBuyOrUseShopItem(tab, entry);
    listEl.appendChild(btn);
  });
}

function addPetExp(petObj, amount) {
  petObj.exp += amount;
  let leveledUp = false;
  while (petObj.exp >= petObj.level * 100) {
    petObj.exp -= petObj.level * 100;
    petObj.level += 1;
    leveledUp = true;
  }
  return leveledUp;
}

function handleBuyOrUseShopItem(tab, entry) {
  const petId = SAVE_DATA.activePetId || 'corie';
  const petObj = SAVE_DATA.pets[petId];
  const speechEl = document.getElementById('companion-speech');

  if (tab === 'dress') {
    const isOwned = SAVE_DATA.ownedItems.includes(entry.id);
    if (!isOwned) {
      if (SAVE_DATA.coins < entry.cost) {
        playTryAgainSound();
        speechEl.textContent = `💬 「金幣還差 ${entry.cost - SAVE_DATA.coins} 枚喔！快去挑戰英文、數學或時鐘賺金幣吧！」`;
        speakSequence([{ text: '金幣還不夠喔，快去玩遊戲賺金幣吧！', lang: 'zh-TW' }]);
        return;
      }
      SAVE_DATA.coins -= entry.cost;
      SAVE_DATA.ownedItems.push(entry.id);
    }
    if (entry.slot === 'hat') {
      petObj.hat = petObj.hat === entry.icon ? '' : entry.icon;
    } else {
      petObj.item = petObj.item === entry.icon ? '' : entry.icon;
    }
    playSuccessJingle();
    spawnConfetti(15);
    speechEl.textContent = `💬 「${entry.msg}」`;
    speakSequence([{ text: entry.msg, lang: 'zh-TW' }]);
    updateTopCountersUI();
    renderPetSanctuary();
    saveProgress();
    return;
  }

  // 食物或陪玩
  if (SAVE_DATA.coins < entry.cost) {
    playTryAgainSound();
    speechEl.textContent = `💬 「還差 ${entry.cost - SAVE_DATA.coins} 枚金幣才能買『${entry.title}』，去答題闖關就能賺金幣囉！」`;
    speakSequence([{ text: '金幣還不夠喔，去闖關答題就能賺取金幣！', lang: 'zh-TW' }]);
    return;
  }

  SAVE_DATA.coins -= entry.cost;
  petObj.hunger = Math.max(10, Math.min(100, petObj.hunger + (entry.hunger || 0)));
  petObj.mood = Math.max(10, Math.min(100, petObj.mood + (entry.mood || 0)));
  const leveledUp = addPetExp(petObj, entry.exp || 20);

  playSuccessJingle();
  spawnConfetti(leveledUp ? 30 : 12);

  if (leveledUp) {
    const rank = getPetRankTitle(petObj.level);
    speechEl.textContent = `🎉 「升級啦！我進化成 ${rank} 了！謝謝小主人！」`;
    speakSequence([{ text: `太棒了！你的寵物升級成為 Lv.${petObj.level} 了！`, lang: 'zh-TW' }]);
  } else {
    speechEl.textContent = `💬 「${entry.msg}（經驗值 +${entry.exp}）」`;
    speakSequence([{ text: entry.msg, lang: 'zh-TW' }]);
  }

  updateTopCountersUI();
  renderPetSanctuary();
  saveProgress();
}

function interactWithCompanion() {
  const petId = SAVE_DATA.activePetId || 'corie';
  const petObj = SAVE_DATA.pets[petId];
  playSuccessJingle();
  const speechEl = document.getElementById('companion-speech');
  const lines = [
    `我是 ${getPetDisplayName(petId)}，目前是 ${getPetRankTitle(petObj.level)}！`,
    '每答對一題都能賺取金幣跟經驗值，連續答對還有額外獎勵喔！',
    '試試看 6 到 12 歲的進階挑戰，幫我買黃金學霸皇冠吧！',
  ];
  const pick = lines[Math.floor(Math.random() * lines.length)];
  if (speechEl) speechEl.textContent = `💬 「${pick}」`;
  speakSequence([{ text: pick, lang: 'zh-TW' }]);
}

function scrollToPetHouse() {
  showScreen('home');
  const el = document.getElementById('pet-sanctuary');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================================
// ⏳ 20 分鐘防沉迷護眼計時鎖定系統（跨重新整理自動記憶今日已玩秒數）
// ============================================================================
let playtimeInterval = null;
let parentMathAnswer = 56;

function getTodayDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getUsedPlaySecondsToday() {
  const savedDate = localStorage.getItem('kids_play_date');
  const today = getTodayDateKey();
  if (savedDate !== today) {
    localStorage.setItem('kids_play_date', today);
    localStorage.setItem('kids_play_used_sec', '0');
    return 0;
  }
  return parseInt(localStorage.getItem('kids_play_used_sec') || '0', 10);
}

function setUsedPlaySecondsToday(sec) {
  localStorage.setItem('kids_play_date', getTodayDateKey());
  localStorage.setItem('kids_play_used_sec', String(Math.max(0, sec)));
}

function startPlaytimeMonitor() {
  updateTimerUIAndCheckLock();
  if (playtimeInterval) clearInterval(playtimeInterval);
  playtimeInterval = setInterval(() => {
    if (document.hidden) return;
    if (PET_CONFIG.timeLimitMinutes <= 0) {
      updateTimerUIAndCheckLock();
      return;
    }
    const used = getUsedPlaySecondsToday();
    const limitSec = PET_CONFIG.timeLimitMinutes * 60;
    if (used < limitSec) {
      setUsedPlaySecondsToday(used + 1);
    }
    updateTimerUIAndCheckLock();
  }, 1000);
}

function updateTimerUIAndCheckLock() {
  const pill = document.getElementById('playtime-pill');
  const disp = document.getElementById('timer-display');
  const overlay = document.getElementById('time-lock-overlay');

  if (PET_CONFIG.timeLimitMinutes <= 0) {
    if (disp) disp.textContent = '不限時';
    if (pill) pill.classList.remove('warning');
    if (overlay) overlay.classList.add('hidden');
    return;
  }

  const limitSec = PET_CONFIG.timeLimitMinutes * 60;
  const used = getUsedPlaySecondsToday();
  const remain = Math.max(0, limitSec - used);

  const mins = Math.floor(remain / 60);
  const secs = remain % 60;
  if (disp) {
    disp.textContent = `${mins}:${secs < 10 ? '0' + secs : secs}`;
  }
  if (pill) {
    pill.classList.toggle('warning', remain <= 180 && remain > 0);
  }

  if (remain <= 0) {
    if (overlay && overlay.classList.contains('hidden')) {
      clearPendingSpeech();
      document.getElementById('locked-minutes-label').textContent = PET_CONFIG.timeLimitMinutes;
      const m1 = randInt(12, 19);
      const m2 = randInt(6, 9);
      parentMathAnswer = m1 * m2;
      document.getElementById('parent-math-prompt').textContent =
        `請家長輸入密碼，或計算驗證題：「${m1} × ${m2} ＝ ？」以延長時間：`;
      overlay.classList.remove('hidden');
    }
  } else {
    if (overlay) overlay.classList.add('hidden');
  }
}

function verifyParentUnlock(addMinutes) {
  const input = document.getElementById('parent-unlock-input');
  const errEl = document.getElementById('parent-unlock-error');
  const val = (input ? input.value : '').trim();

  if (val === PET_CONFIG.parentPin || val === String(parentMathAnswer)) {
    const used = getUsedPlaySecondsToday();
    setUsedPlaySecondsToday(Math.max(0, used - addMinutes * 60));
    if (input) input.value = '';
    if (errEl) errEl.textContent = '';
    updateTimerUIAndCheckLock();
    playSuccessJingle();
  } else {
    playTryAgainSound();
    if (errEl) errEl.textContent = '❌ 密碼或家長驗證算式答案不正確喔！';
  }
}

function openParentTimeModal() {
  openSettingsModal();
}

function resetDailyTimerFromSettings() {
  setUsedPlaySecondsToday(0);
  updateTimerUIAndCheckLock();
  playSuccessJingle();
  speakSequence([{ text: '今日遊玩時間已重置！', lang: 'zh-TW' }]);
}

// ============================================================================
// 🎁 豪華 120 張榮譽貼紙圖鑑
// ============================================================================
const STICKERS = [
  { emoji: '🎀', name: '粉紅蝴蝶結' }, { emoji: '🦄', name: '閃亮獨角獸' },
  { emoji: '🍓', name: '香甜大草莓' }, { emoji: '👑', name: '公主皇冠' },
  { emoji: '🍭', name: '彩虹棒棒糖' }, { emoji: '🧸', name: '泰迪熊娃娃' },
  { emoji: '🌈', name: '七彩彩虹' }, { emoji: '🏰', name: '夢幻城堡' },
  { emoji: '🦋', name: '美麗蝴蝶' }, { emoji: '🍦', name: '香草冰淇淋' },
  { emoji: '🐬', name: '可愛小海豚' }, { emoji: '🎨', name: '小畫家調色盤' },
  { emoji: '🎠', name: '旋轉木馬' }, { emoji: '🧁', name: '杯子蛋糕' },
  { emoji: '🌺', name: '扶桑花' }, { emoji: '🐳', name: '噴水大鯨魚' },
  { emoji: '🍉', name: '多汁大西瓜' }, { emoji: '🧚', name: '魔法小仙子' },
  { emoji: '💎', name: '閃耀鑽石' }, { emoji: '🚀', name: '太空火箭' },
  { emoji: '🐱', name: '橘貓好朋友' }, { emoji: '🐶', name: '邊牧小狗狗' },
  { emoji: '🐰', name: '長耳小白兔' }, { emoji: '🐼', name: '圓滾滾熊貓' },
  { emoji: '🐨', name: '愛睡覺無尾熊' }, { emoji: '🦊', name: '聰明小狐狸' },
  { emoji: '🦁', name: '勇敢小獅子' }, { emoji: '🐯', name: '威風小老虎' },
  { emoji: '🦒', name: '高個子長頸鹿' }, { emoji: '🐘', name: '長鼻子大象' },
  { emoji: '🐧', name: '搖擺小企鵝' }, { emoji: '🐤', name: '黃色小雞' },
  { emoji: '🦆', name: '游水小鴨子' }, { emoji: '🦉', name: '博士貓頭鷹' },
  { emoji: '🐢', name: '慢吞吞小烏龜' }, { emoji: '🦖', name: '暴龍小隊長' },
  { emoji: '🦕', name: '長頸雷龍' }, { emoji: '🦩', name: '粉紅紅鶴' },
  { emoji: '🦚', name: '開屏孔雀' }, { emoji: '🦜', name: '彩色鸚鵡' },
  { emoji: '🐟', name: '比奇堡魚姊姊' }, { emoji: '🐠', name: '熱帶小丑魚' },
  { emoji: '🐡', name: '鼓鼓河豚' }, { emoji: '🐙', name: '八爪大章魚' },
  { emoji: '🪼', name: '漂浮小水母' }, { emoji: '🦀', name: '大螯紅螃蟹' },
  { emoji: '🦞', name: '大海螯蝦' }, { emoji: '🦐', name: '跳跳小蝦米' },
  { emoji: '🐚', name: '珍珠海螺殼' }, { emoji: '🪸', name: '海底彩色珊瑚' },
  { emoji: '🧜‍♀️', name: '海底美人魚' }, { emoji: '🦈', name: '微笑小鯊魚' },
  { emoji: '🦭', name: '拍手小海豹' }, { emoji: '🦦', name: '牽手小海獺' },
  { emoji: '🫧', name: '夢幻七彩泡泡' }, { emoji: '🌊', name: '藍色大海浪' },
  { emoji: '🏝️', name: '椰子樹小島' }, { emoji: '⛵', name: '乘風小帆船' },
  { emoji: '⚓', name: '船長大船錨' }, { emoji: '🍍', name: '深海大鳳梨屋' },
  { emoji: '🍰', name: '草莓鮮奶油蛋糕' }, { emoji: '🎂', name: '生日大蛋糕' },
  { emoji: '🍩', name: '巧克力甜甜圈' }, { emoji: '🍪', name: '脆脆巧克力餅乾' },
  { emoji: '🍫', name: '甜心巧克力' }, { emoji: '🍬', name: '水果糖果' },
  { emoji: '🍮', name: '焦糖布丁' }, { emoji: '🍯', name: '小熊維尼蜂蜜罐' },
  { emoji: '🥞', name: '奶油鬆餅' }, { emoji: '🧇', name: '格子鬆餅' },
  { emoji: '🥐', name: '酥脆可頌麵包' }, { emoji: '🥨', name: '蝴蝶脆餅' },
  { emoji: '🍿', name: '電影院爆米花' }, { emoji: '🍧', name: '彩虹雪花冰' },
  { emoji: '🍨', name: '水果聖代' }, { emoji: '🧃', name: '蘋果汁利樂包' },
  { emoji: '🧋', name: '珍珠奶茶' }, { emoji: '🥛', name: '營養鮮奶' },
  { emoji: '🍕', name: '牽絲起司披薩' }, { emoji: '🍔', name: '美味蟹堡' },
  { emoji: '🍎', name: '紅通通蘋果' }, { emoji: '🍑', name: '粉紅水蜜桃' },
  { emoji: '🍒', name: '雙胞胎櫻桃' }, { emoji: '🍇', name: '紫寶石葡萄' },
  { emoji: '🍋', name: '酸酸黃檸檬' }, { emoji: '🍊', name: '香甜柳丁' },
  { emoji: '🍌', name: '彎彎黃香蕉' }, { emoji: '🥝', name: '奇異果' },
  { emoji: '🌸', name: '粉紅櫻花' }, { emoji: '🌻', name: '陽光向日葵' },
  { emoji: '🌷', name: '鬱金香' }, { emoji: '🌹', name: '紅玫瑰' },
  { emoji: '🍀', name: '四葉幸運草' }, { emoji: '🍄', name: '童話紅蘑菇' },
  { emoji: '☀️', name: '溫暖太陽公公' }, { emoji: '🌙', name: '彎彎月亮' },
  { emoji: '⭐', name: '閃亮小星星' }, { emoji: '🌟', name: '超級大明星' },
  { emoji: '❄️', name: '冰雪奇緣雪花' }, { emoji: '⛄', name: '微笑小雪人' },
  { emoji: '🎡', name: '遊樂園摩天輪' }, { emoji: '🎢', name: '刺激雲霄飛車' },
  { emoji: '🎪', name: '歡樂馬戲團' }, { emoji: '🎈', name: '飛天紅氣球' },
  { emoji: '🎉', name: '派對拉炮' }, { emoji: '🎁', name: '驚喜禮物盒' },
  { emoji: '👑', name: '黃金王冠' }, { emoji: '💍', name: '寶石戒指' },
  { emoji: '🪄', name: '仙女魔法棒' }, { emoji: '🔮', name: '魔法水晶球' },
  { emoji: '🎻', name: '優雅小提琴' }, { emoji: '🎹', name: '黑白鋼琴' },
  { emoji: '🎸', name: '搖滾吉他' }, { emoji: '🎺', name: '黃金小喇叭' },
  { emoji: '🥁', name: '咚咚小鼓' }, { emoji: '🪁', name: '飛高高風箏' },
  { emoji: '🪀', name: '炫彩溜溜球' }, { emoji: '🧩', name: '聰明拼圖' },
  { emoji: '🎠', name: '皇家白馬馬車' }, { emoji: '🏆', name: '冠軍大獎盃' },
];

// ============================================================================
// 📚 6~12歲國小高頻進階英文題庫（含英英定義線索、科目、職業、自然科學與長單字）
// ============================================================================
const ENGLISH_BANK = [
  { letter: 'A', word: 'Astronaut', zh: '太空人', emoji: '🧑‍🚀', clue: 'A person who travels into outer space in a rocket.' },
  { letter: 'A', word: 'Ambulance', zh: '救護車', emoji: '🚑', clue: 'A special vehicle that takes sick people to the hospital.' },
  { letter: 'A', word: 'Aquarium', zh: '水族館', emoji: '🐠', clue: 'A building where you can see many fish and sea animals.' },
  { letter: 'B', word: 'Bakery', zh: '麵包店', emoji: '🥐', clue: 'A shop that bakes and sells fresh bread and cakes.' },
  { letter: 'B', word: 'Bridge', zh: '橋樑', emoji: '🌉', clue: 'Something built over a river so people and cars can cross.' },
  { letter: 'B', word: 'Backpack', zh: '後背包', emoji: '🎒', clue: 'A bag that you carry on your back when going to school.' },
  { letter: 'B', word: 'Badminton', zh: '羽毛球', emoji: '🏸', clue: 'A sport where players hit a shuttlecock over a high net.' },
  { letter: 'C', word: 'Calendar', zh: '日曆 / 月曆', emoji: '📅', clue: 'A chart that shows the days, weeks, and months of a year.' },
  { letter: 'C', word: 'Computer', zh: '電腦', emoji: '💻', clue: 'An electronic machine used for work, study, and internet.' },
  { letter: 'C', word: 'Cucumber', zh: '小黃瓜', emoji: '🥒', clue: 'A long, green vegetable that is crisp and fresh in salads.' },
  { letter: 'C', word: 'Camouflage', zh: '保護色 / 偽裝', emoji: '🦎', clue: 'How animals blend in with their surroundings to hide.' },
  { letter: 'D', word: 'Dictionary', zh: '字典', emoji: '📕', clue: 'A thick book that explains the meanings of words from A to Z.' },
  { letter: 'D', word: 'Dentist', zh: '牙醫', emoji: '🦷', clue: 'A doctor who takes care of your teeth.' },
  { letter: 'D', word: 'Detective', zh: '偵探', emoji: '🕵️', clue: 'A person who looks for clues to solve mysteries.' },
  { letter: 'D', word: 'Dinosaur', zh: '恐龍', emoji: '🦖', clue: 'A giant reptile that lived on Earth millions of years ago.' },
  { letter: 'E', word: 'Earthquake', zh: '地震', emoji: '🌍', clue: 'When the ground suddenly shakes strongly.' },
  { letter: 'E', word: 'Envelope', zh: '信封', emoji: '✉️', clue: 'A paper cover used to mail a letter.' },
  { letter: 'E', word: 'Experiment', zh: '科學實驗', emoji: '🧪', clue: 'A scientific test you do in a laboratory to learn something.' },
  { letter: 'F', word: 'Firefighter', zh: '消防員', emoji: '🧑‍🚒', clue: 'A brave person whose job is to put out fires.' },
  { letter: 'F', word: 'refrigerator', zh: '冰箱', emoji: '🧊', clue: 'A kitchen appliance that keeps food and milk cold.' },
  { letter: 'F', word: 'Flashlight', zh: '手電筒', emoji: '🔦', clue: 'A small light you carry in your hand when it is dark.' },
  { letter: 'G', word: 'Geography', zh: '地理課', emoji: '🗺️', clue: 'The school subject where you study countries, rivers, and maps.' },
  { letter: 'G', word: 'Gymnasium', zh: '體育館', emoji: '🏀', clue: 'A large indoor room for playing sports and exercising.' },
  { letter: 'H', word: 'Helicopter', zh: '直升機', emoji: '🚁', clue: 'An aircraft with spinning blades on top that can hover.' },
  { letter: 'H', word: 'Hospital', zh: '醫院', emoji: '🏥', clue: 'A place where doctors and nurses help sick people.' },
  { letter: 'I', word: 'Instrument', zh: '樂器', emoji: '🎻', clue: 'An object like a piano, violin, or guitar used to play music.' },
  { letter: 'I', word: 'Ingredient', zh: '食材 / 原料', emoji: '🥣', clue: 'One of the foods you mix together to cook a dish.' },
  { letter: 'J', word: 'Journalist', zh: '新聞記者', emoji: '🎤', clue: 'A person who writes news stories for newspapers or TV.' },
  { letter: 'K', word: 'Kangaroo', zh: '袋鼠', emoji: '🦘', clue: 'An Australian animal that hops and carries its baby in a pouch.' },
  { letter: 'K', word: 'Keyboard', zh: '鍵盤', emoji: '⌨️', clue: 'The set of keys you press to type letters on a computer.' },
  { letter: 'L', word: 'Library', zh: '圖書館', emoji: '🏛️', clue: 'A quiet place where you can borrow and read many books.' },
  { letter: 'L', word: 'Lightning', zh: '閃電', emoji: '⚡', clue: 'A bright flash of electricity in the sky during a storm.' },
  { letter: 'M', word: 'Microscope', zh: '顯微鏡', emoji: '🔬', clue: 'A science tool that makes tiny things look much bigger.' },
  { letter: 'M', word: 'Mountain', zh: '高山', emoji: '⛰️', clue: 'A very high hill that often has snow at the top.' },
  { letter: 'M', word: 'Museum', zh: '博物館', emoji: '🏺', clue: 'A building where historical art and dinosaur bones are shown.' },
  { letter: 'N', word: 'Notebook', zh: '筆記本', emoji: '📓', clue: 'A book of blank pages for writing notes in class.' },
  { letter: 'N', word: 'Neighborhood', zh: '社區 / 鄰里', emoji: '🏘️', clue: 'The area and streets around your home.' },
  { letter: 'O', word: 'Orchestra', zh: '管弦樂團', emoji: '🎼', clue: 'A large group of musicians playing instruments together.' },
  { letter: 'P', word: 'Passenger', zh: '乘客', emoji: '🚆', clue: 'A person who is riding in a train, bus, or airplane.' },
  { letter: 'P', word: 'Planetarium', zh: '天文館', emoji: '🪐', clue: 'A theater where you look up at stars and planets on a dome.' },
  { letter: 'P', word: 'Pharmacy', zh: '藥局', emoji: '💊', clue: 'A store where you get medicine.' },
  { letter: 'Q', word: 'Question', zh: '問題', emoji: '❓', clue: 'Something you ask when you want to know an answer.' },
  { letter: 'R', word: 'Restaurant', zh: '餐廳', emoji: '🍽️', clue: 'A place where you buy and eat a meal cooked by a chef.' },
  { letter: 'R', word: 'Recycle', zh: '資源回收', emoji: '♻️', clue: 'Turning used paper, plastic, and bottles into new things.' },
  { letter: 'S', word: 'Scientist', zh: '科學家', emoji: '👩‍🔬', clue: 'A person who studies science and does experiments.' },
  { letter: 'S', word: 'Submarine', zh: '潛水艇', emoji: '🛥️', clue: 'A special ship that can travel deep underwater.' },
  { letter: 'S', word: 'Scissors', zh: '剪刀', emoji: '✂️', clue: 'A tool with two sharp blades used for cutting paper.' },
  { letter: 'T', word: 'Telescope', zh: '望遠鏡', emoji: '🔭', clue: 'A tool used to look at faraway stars and the Moon.' },
  { letter: 'T', word: 'Temperature', zh: '溫度 / 體溫', emoji: '🌡️', clue: 'A measure of how hot or cold the weather or your body is.' },
  { letter: 'U', word: 'Umbrella', zh: '雨傘', emoji: '☂️', clue: 'Something you hold over your head to stay dry in the rain.' },
  { letter: 'V', word: 'Vegetable', zh: '蔬菜', emoji: '🥦', clue: 'Healthy plants like broccoli, carrots, and spinach.' },
  { letter: 'V', word: 'Volcano', zh: '火山', emoji: '🌋', clue: 'A mountain that can erupt with hot lava and ash.' },
  { letter: 'W', word: 'Weather', zh: '天氣', emoji: '🌦️', clue: 'Whether it is sunny, rainy, windy, or snowy outside.' },
  { letter: 'W', word: 'Waterfall', zh: '瀑布', emoji: '🏞️', clue: 'A place where a river falls steeply down over rocks.' },
];

// 國小必背反義詞與同義詞題庫 (Lv.2)
const EN_OPPOSITES_BANK = [
  { base: 'Expensive (昂貴的)', rel: '反義詞 (Opposite)', ans: 'Cheap', zh: '便宜的', wrong: ['Heavy', 'Loud', 'Bright'] },
  { base: 'Ancient (古老的)', rel: '反義詞 (Opposite)', ans: 'Modern', zh: '現代的', wrong: ['Empty', 'Quiet', 'Weak'] },
  { base: 'Dangerous (危險的)', rel: '反義詞 (Opposite)', ans: 'Safe', zh: '安全的', wrong: ['Sharp', 'Deep', 'Wide'] },
  { base: 'Generous (慷慨大方的)', rel: '反義詞 (Opposite)', ans: 'Selfish', zh: '自私的', wrong: ['Polite', 'Honest', 'Clever'] },
  { base: 'Borrow (借入)', rel: '反義詞 (Opposite)', ans: 'Lend', zh: '借出', wrong: ['Spend', 'Catch', 'Throw'] },
  { base: 'Arrive (抵達)', rel: '反義詞 (Opposite)', ans: 'Depart', zh: '出發 / 離開', wrong: ['Follow', 'Invite', 'visit'] },
  { base: 'Giant (巨大的)', rel: '同義詞 (Synonym)', ans: 'Huge', zh: '龐大的', wrong: ['Tiny', 'Narrow', 'Shallow'] },
  { base: 'Intelligent (聰明的)', rel: '同義詞 (Synonym)', ans: 'Smart', zh: '聰穎的', wrong: ['Lazy', 'Bored', 'Noisy'] },
  { base: 'Difficult (困難的)', rel: '反義詞 (Opposite)', ans: 'Simple', zh: '簡單的', wrong: ['Strict', 'Bitter', 'Rough'] },
  { base: 'Victory (勝利)', rel: '反義詞 (Opposite)', ans: 'Defeat', zh: '失敗 / 戰敗', wrong: ['Courage', 'journey', 'Treasure'] },
];

// 國小文法句子重組題庫 (Lv.3)
const EN_SENTENCE_SCRAMBLE_BANK = [
  { words: ['She', 'goes', 'to', 'school', 'by', 'bus'], zh: '她搭公車去上學。' },
  { words: ['How', 'much', 'is', 'this', 'dictionary'], zh: '這本字典多少錢？' },
  { words: ['My', 'favorite', 'subject', 'is', 'science'], zh: '我最喜歡的科目是自然科學。' },
  { words: ['We', 'visited', 'the', 'museum', 'yesterday'], zh: '我們昨天參觀了博物館。' },
  { words: ['What', 'will', 'you', 'do', 'tomorrow'], zh: '你明天打算做什麼？' },
  { words: ['Please', 'turn', 'off', 'the', 'lights'], zh: '請隨手關燈。' },
  { words: ['The', 'library', 'is', 'next', 'to', 'the', 'park'], zh: '圖書館在公園旁邊。' },
  { words: ['He', 'is', 'taller', 'than', 'his', 'brother'], zh: '他比他的哥哥還要高。' },
];

// 🎈 國小幾何圖形與色彩氣球題庫 (Lv.4)
const EN_COLORS = [
  { en: 'Crimson Red', shortEn: 'Red', zh: '深紅色', fill: '#ef4444', bg: '#fee2e2', border: '#fca5a5' },
  { en: 'Royal Blue', shortEn: 'Blue', zh: '寶藍色', fill: '#3b82f6', bg: '#dbeafe', border: '#93c5fd' },
  { en: 'Golden Yellow', shortEn: 'Yellow', zh: '金黃色', fill: '#eab308', bg: '#fef9c3', border: '#fde047' },
  { en: 'Emerald Green', shortEn: 'Green', zh: '翠綠色', fill: '#22c55e', bg: '#dcfce7', border: '#86efac' },
  { en: 'Violet Purple', shortEn: 'Purple', zh: '紫羅蘭色', fill: '#a855f7', bg: '#f3e8ff', border: '#d8b4fe' },
  { en: 'Coral Orange', shortEn: 'Orange', zh: '珊瑚橘', fill: '#f97316', bg: '#ffedd5', border: '#fdba74' },
];

const EN_SHAPES = [
  { id: 'pentagon', en: 'Pentagon', zh: '五邊形', clue: 'a 5-sided polygon' },
  { id: 'hexagon', en: 'Hexagon', zh: '六邊形', clue: 'a 6-sided polygon like a honeycomb' },
  { id: 'octagon', en: 'Octagon', zh: '八邊形', clue: 'an 8-sided polygon like a stop sign' },
  { id: 'rectangle', en: 'Rectangle', zh: '長方形', clue: 'a 4-sided shape with two long sides and two short sides' },
  { id: 'triangle', en: 'Triangle', zh: '三角形', clue: 'a polygon with 3 angles and 3 sides' },
  { id: 'rhombus', en: 'Rhombus', zh: '菱形', clue: 'a diamond shape with 4 equal sides' },
];


// ============================================================================
// 🛠️ 通用隨機與陣列工具函式
// ============================================================================
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ============================================================================
// 🚀 Lv.6《Rocket Girl & Activity Book》國小閱讀理解與文法題庫
// ============================================================================
const ROCKET_BOOK1_BANK = [
  {
    unit: 'u1',
    badge: '📖 校園短篇閱讀理解 (Reading Comprehension)',
    passage: 'Every Tuesday morning, Lucas brings his microscope and notebook to the science lab. His favorite subject is science because he loves doing exciting experiments with his classmates.',
    question: 'Why does Lucas love science class?',
    ans: 'Because he loves doing experiments.',
    zh: '因為他喜歡做實驗。',
    wrong: [
      'Because he likes playing badminton.',
      'Because the library is very quiet.',
      'Because he wants to buy a sandwich.',
    ],
  },
  {
    unit: 'u1',
    badge: '📝 國小核心文法選擇 (Grammar Challenge)',
    passage: 'Please ______ quiet in the school library! Many students are reading books right now.',
    question: '請選出最符合祈使句文法的動詞：',
    ans: 'be',
    zh: '祈使句原形動詞：Please be quiet!',
    wrong: ['is', 'are', 'am'],
  },
  {
    unit: 'u2',
    badge: '📖 家庭與職業閱讀 (Reading Comprehension)',
    passage: 'My aunt Emma works at a big city hospital. She wears a white coat and helps sick children feel better every day. My uncle Leo is a firefighter who drives a red fire truck.',
    question: 'Where does Aunt Emma work?',
    ans: 'At a city hospital.',
    zh: '在市立醫院工作。',
    wrong: [
      'At a bakery near the park.',
      'Inside a space station.',
      'At an elementary school.',
    ],
  },
  {
    unit: 'u2',
    badge: '📝 過去式文法挑戰 (Past Tense Grammar)',
    passage: 'Yesterday evening, my father ______ a delicious pasta dinner for our whole family.',
    question: '句中有 Yesterday（昨天），應使用哪一個過去式動詞？',
    ans: 'cooked',
    zh: '過去式：cooked (煮了)',
    wrong: ['cooks', 'cooking', 'to cook'],
  },
  {
    unit: 'u3',
    badge: '📖 自然科學閱讀 (Science Reading)',
    passage: 'Chameleons and arctic foxes are masters of camouflage. An arctic fox has white fur during the snowy winter so predators cannot see it easily in the snow.',
    question: 'How does white fur help the arctic fox in winter?',
    ans: 'It helps the fox hide in the snow.',
    zh: '幫助北極狐在雪地中隱藏自己。',
    wrong: [
      'It helps the fox fly in the sky.',
      'It makes the fox swim faster than sharks.',
      'It helps the fox breathe underwater.',
    ],
  },
  {
    unit: 'u3',
    badge: '📝 比較級文法挑戰 (Comparative Grammar)',
    passage: 'A blue whale is much ______ than a dolphin. It is the largest animal on Earth!',
    question: '句中有 than（比…更…），請選出正確的比較級形容詞：',
    ans: 'heavier',
    zh: '比較級：heavier (更重的)',
    wrong: ['heavy', 'heaviest', 'more heavy'],
  },
  {
    unit: 'u4',
    badge: '📖 才藝與音樂閱讀 (Hobbies Reading)',
    passage: 'Sophia practices the violin for forty-five minutes every afternoon. Next Saturday, she will perform on stage with the school orchestra in front of her parents.',
    question: 'What will Sophia do next Saturday?',
    ans: 'Perform with the school orchestra.',
    zh: '與學校管弦樂團一起登台演出。',
    wrong: [
      'Go camping in the high mountains.',
      'Visit the dentist after school.',
      'Buy a new bicycle at the store.',
    ],
  },
  {
    unit: 'u5',
    badge: '📖 健康飲食閱讀 (Healthy Diet Reading)',
    passage: 'Waiter: "May I take your order?" Mia: "Yes, I would like a bowl of vegetable soup, a grilled chicken sandwich, and a glass of fresh orange juice, please."',
    question: 'What drink did Mia order at the restaurant?',
    ans: 'A glass of fresh orange juice.',
    zh: '一杯新鮮柳橙汁。',
    wrong: [
      'A cup of hot chocolate.',
      'A bottle of strawberry milk.',
      'Two bowls of tomato soup.',
    ],
  },
  {
    unit: 'rg',
    badge: '🦸‍♀️ Rocket Girl 英雄閱讀挑戰 (Hero Story Reading)',
    passage: 'Whenever Metro City is in trouble, Roxy puts on her silver jetpack and flies faster than a helicopter! Today, she rescued a little kitten stuck on top of a tall bridge.',
    question: 'How does Rocket Girl fly into the sky?',
    ans: 'She uses her silver jetpack.',
    zh: '她使用銀色噴射背包飛行。',
    wrong: [
      'She rides a yellow submarine.',
      'She takes an underground train.',
      'She sails on a wooden boat.',
    ],
  },
  {
    unit: 'rg',
    badge: '🦸‍♀️ Rocket Girl 未來式文法 (Future Tense)',
    passage: "Don't worry, citizens! Rocket Girl ______ protect Metro City from the giant robot!",
    question: '請選出表示「將會保護」的助動詞：',
    ans: 'will',
    zh: '助動詞 will + 原形動詞 protect',
    wrong: ['did', 'was', 'are'],
  },
];

const MATH_ITEMS = [
  { emoji: '🍓', name: '日本大草莓', unit: '顆' },
  { emoji: '🍩', name: '巧克力甜甜圈', unit: '個' },
  { emoji: '🧁', name: '藍莓杯子蛋糕', unit: '個' },
  { emoji: '🍪', name: '手工牛奶餅乾', unit: '片' },
  { emoji: '🍎', name: '富士大蘋果', unit: '顆' },
  { emoji: '🥐', name: '法式牛角可頌', unit: '個' },
  { emoji: '🍕', name: '總匯起司披薩', unit: '片' },
  { emoji: '📚', name: '精裝百科全書', unit: '本' },
  { emoji: '🎨', name: '水彩畫具組', unit: '盒' },
  { emoji: '⚽', name: '世界盃足球', unit: '顆' },
];

// ============================================================================
// 🎮 全域遊戲狀態
// ============================================================================
const TOTAL_ROUNDS = 8;
let state = {
  currentMode: 'home', // 'home' | 'english' | 'math' | 'clock'
  enLevel: 1,
  mathLevel: 1,
  clockLevel: 1,
  rocketUnit: 'all',
  round: 1,
  streak: { en: 0, math: 0, clock: 0 },
  isAnswering: false,
  currentSpeech: [],
  currentQuestion: null,
};

let audioCtx = null;
let selectedZhVoice = null;
let selectedEnVoice = null;
let speechQueueId = 0;

// ============================================================================
// 🔊 音效與雙語音合成引擎
// ============================================================================
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq = 520, duration = 0.1, type = 'triangle') {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.01);
}

function playClickTick() {
  playTone(660, 0.05, 'sine');
}

function playSuccessJingle() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.14, ctx.currentTime + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.25);
  });
}

function playTryAgainSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  [300, 240].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.22);
  });
}

function initSpeechVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || !voices.length) return;

  const zhSelect = document.getElementById('select-zh-voice');
  const enSelect = document.getElementById('select-en-voice');

  const zhVoices = voices.filter((v) => v.lang.startsWith('zh'));
  const enVoices = voices.filter((v) => v.lang.startsWith('en'));

  if (zhSelect && zhVoices.length) {
    zhSelect.innerHTML = zhVoices
      .map((v) => `<option value="${v.voiceURI}">${v.name} (${v.lang})</option>`)
      .join('');
  }
  if (enSelect && enVoices.length) {
    enSelect.innerHTML = enVoices
      .map((v) => `<option value="${v.voiceURI}">${v.name} (${v.lang})</option>`)
      .join('');
  }

  const zhPriority = [
    (v) => PET_CONFIG.zhVoiceURI && v.voiceURI === PET_CONFIG.zhVoiceURI,
    (v) => v.name.includes('HsiaoChen') && v.name.includes('Natural'),
    (v) => v.name.includes('HsiaoYu') && v.name.includes('Natural'),
    (v) => v.name.includes('Meijia') || v.name.includes('美佳'),
    (v) => v.lang === 'zh-TW' && v.name.includes('Google'),
    (v) => v.lang === 'zh-TW' || v.lang === 'zh_TW',
    (v) => v.lang.startsWith('zh'),
  ];
  for (const test of zhPriority) {
    const found = voices.find(test);
    if (found) {
      selectedZhVoice = found;
      if (zhSelect) zhSelect.value = found.voiceURI;
      break;
    }
  }

  const enPriority = [
    (v) => PET_CONFIG.enVoiceURI && v.voiceURI === PET_CONFIG.enVoiceURI,
    (v) => v.name.includes('Aria') && v.name.includes('Natural'),
    (v) => v.name.includes('Jenny') && v.name.includes('Natural'),
    (v) => v.name.includes('Samantha'),
    (v) => v.lang === 'en-US' && v.name.includes('Google'),
    (v) => v.lang === 'en-US' || v.lang === 'en_US',
    (v) => v.lang.startsWith('en'),
  ];
  for (const test of enPriority) {
    const found = voices.find(test);
    if (found) {
      selectedEnVoice = found;
      if (enSelect) enSelect.value = found.voiceURI;
      break;
    }
  }
}

function clearPendingSpeech() {
  speechQueueId++;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function speakSequence(items) {
  if (!items || !items.length) return;
  clearPendingSpeech();
  const myQueueId = speechQueueId;
  const speed = Number(PET_CONFIG.speechRate) || 1.0;

  let idx = 0;
  function playNext() {
    if (myQueueId !== speechQueueId || idx >= items.length) return;
    const item = items[idx++];
    speakSingleItem(item, speed, () => {
      if (myQueueId !== speechQueueId) return;
      setTimeout(playNext, item.pauseAfter || 120);
    });
  }
  playNext();
}

function speakSingleItem(item, speed, onDone) {
  if (!item || !item.text) {
    if (onDone) onDone();
    return;
  }
  const lang = item.lang || 'zh-TW';
  const rate = Math.min(1.6, Math.max(0.65, (item.rate || 1.0) * speed));

  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(item.text);
    utter.lang = lang;
    utter.rate = rate;
    utter.pitch = item.pitch || 1.05;
    if (lang.startsWith('zh') && selectedZhVoice) utter.voice = selectedZhVoice;
    if (lang.startsWith('en') && selectedEnVoice) utter.voice = selectedEnVoice;

    let finished = false;
    const finishOnce = () => {
      if (finished) return;
      finished = true;
      if (onDone) onDone();
    };
    utter.onend = finishOnce;
    utter.onerror = finishOnce;
    setTimeout(finishOnce, Math.max(4000, item.text.length * 320));
    window.speechSynthesis.speak(utter);
  } else {
    if (onDone) onDone();
  }
}

// ============================================================================
// 🧭 畫面切換、頂部計數器與貼紙櫃渲染
// ============================================================================
function applyPetNamesToDOM() {
  document.querySelectorAll('[data-pet-name="corie"]').forEach((el) => {
    el.textContent = PET_CONFIG.corieName;
  });
  document.querySelectorAll('[data-pet-name="duncan"]').forEach((el) => {
    el.textContent = PET_CONFIG.duncanName;
  });
  document.querySelectorAll('[data-pet-name="shannon"]').forEach((el) => {
    el.textContent = PET_CONFIG.shannonName;
  });
}

function updateTopCountersUI() {
  const starEl = document.getElementById('star-count');
  const coinEl = document.getElementById('coin-count');
  if (starEl) starEl.textContent = SAVE_DATA.totalStars;
  if (coinEl) coinEl.textContent = SAVE_DATA.coins;

  // 更新首頁關卡過關次數徽章
  const mapping = [
    { key: 'en', max: 6 },
    { key: 'math', max: 6 },
    { key: 'clock', max: 3 },
  ];
  mapping.forEach((m) => {
    for (let lv = 1; lv <= m.max; lv++) {
      const badge = document.getElementById(`badge-${m.key}-${lv}`);
      const clears = SAVE_DATA.levelClears[`${m.key}_${lv}`] || 0;
      if (badge) {
        badge.textContent = clears > 0 ? `🏅×${clears}` : '';
      }
    }
  });

  renderStickerWall();
}

function renderStickerWall() {
  const listEl = document.getElementById('sticker-list');
  const progEl = document.getElementById('sticker-progress-text');
  if (!listEl) return;

  const unlockedCount = Math.min(STICKERS.length, Math.floor(SAVE_DATA.totalStars / 3));
  if (progEl) {
    progEl.textContent = `已解鎖 ${unlockedCount} / ${STICKERS.length} 張`;
  }

  listEl.innerHTML = STICKERS.map((s, idx) => {
    const unlocked = idx < unlockedCount;
    if (unlocked) {
      return `<div class="sticker-item unlocked" title="${s.name}" onclick="speakSequence([{text:'${s.name}',lang:'zh-TW'}])">
        <span class="sticker-emoji">${s.emoji}</span>
        <span class="sticker-name">${s.name}</span>
      </div>`;
    }
    return `<div class="sticker-item locked" title="每集滿 3 顆星解鎖一張">🔒</div>`;
  }).join('');
}

function showScreen(screenKey) {
  playClickTick();
  clearPendingSpeech();

  const map = {
    home: 'screen-home',
    english: 'screen-english',
    math: 'screen-math',
    clock: 'screen-clock',
    celebrate: 'screen-celebrate',
  };
  const targetId = map[screenKey] || screenKey;

  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const targetEl = document.getElementById(targetId);
  if (targetEl) targetEl.classList.add('active');

  const homeBtn = document.getElementById('btn-home');
  if (homeBtn) {
    homeBtn.classList.toggle('hidden', targetId === 'screen-home');
  }

  if (targetId === 'screen-home') {
    state.currentMode = 'home';
    updateTopCountersUI();
    renderPetSanctuary();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateRoundProgressUI(prefix) {
  const roundEl = document.getElementById(`${prefix}-round-text`);
  const fillEl = document.getElementById(`${prefix}-progress-fill`);
  const streakEl = document.getElementById(`${prefix}-streak-pill`);
  if (roundEl) roundEl.textContent = `第 ${state.round} / ${TOTAL_ROUNDS} 題`;
  if (fillEl) fillEl.style.width = `${Math.round((state.round / TOTAL_ROUNDS) * 100)}%`;
  if (streakEl) streakEl.textContent = `🔥 連對 ${state.streak[prefix] || 0}`;
}

function spawnConfetti(count = 24) {
  const container = document.getElementById('confetti-container');
  if (!container) return;
  container.innerHTML = '';
  const emojis = ['🎉', '⭐', '🪙', '🏆', '🌈', '✨', '🎈'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.textContent = emojis[i % emojis.length];
    piece.style.left = `${Math.random() * 95}%`;
    piece.style.animationDelay = `${(Math.random() * 0.7).toFixed(2)}s`;
    container.appendChild(piece);
  }
  setTimeout(() => {
    container.innerHTML = '';
  }, 3000);
}

// ============================================================================
// 🐶 Duncan 國小英文學院 (6~12歲 6大關卡)
// ============================================================================
function startEnglishGame(lv = 1) {
  state.currentMode = 'english';
  state.enLevel = lv;
  state.round = 1;
  showScreen('english');
  syncEnglishLevelChips();
  loadEnglishQuestion();
}

function switchEnglishLevel(lv) {
  playClickTick();
  state.enLevel = lv;
  state.round = 1;
  syncEnglishLevelChips();
  loadEnglishQuestion();
}

function syncEnglishLevelChips() {
  for (let i = 1; i <= 6; i++) {
    const chip = document.getElementById(`en-lvl-chip-${i}`);
    if (chip) chip.classList.toggle('active', i === state.enLevel);
  }
  const rocketBar = document.getElementById('rocket-unit-bar');
  if (rocketBar) {
    rocketBar.classList.toggle('hidden', state.enLevel !== 6);
  }
}

function switchRocketUnit(unitId) {
  playClickTick();
  state.rocketUnit = unitId;
  state.round = 1;
  ['all', 'u1', 'u2', 'u3', 'u4', 'u5', 'rg'].forEach((id) => {
    const btn = document.getElementById(`rk-unit-${id}`);
    if (btn) btn.classList.toggle('active', id === unitId);
  });
  loadEnglishQuestion();
}

function repeatEnglishPrompt() {
  if (state.currentSpeech && state.currentSpeech.length) {
    speakSequence(state.currentSpeech);
  }
}

function loadEnglishQuestion() {
  state.isAnswering = false;
  updateRoundProgressUI('en');

  const slotsEl = document.getElementById('en-spelling-slots');
  if (slotsEl) {
    slotsEl.innerHTML = '';
    slotsEl.classList.add('hidden');
  }

  const lv = state.enLevel;
  if (lv === 1) renderEnLv1ClueChallenge();
  else if (lv === 2) renderEnLv2ClozeAndOpposite();
  else if (lv === 3) renderEnLv3ScrambleAndSpell();
  else if (lv === 4) renderEnLv4GeometryBalloon();
  else if (lv === 5) renderEnLv5MemoryMatch12();
  else renderEnLv6ReadingAndGrammar();
}

function setEnglishStageCard(bigText, subHtml, hintText) {
  const stageBox = document.getElementById('en-stage-box');
  if (!stageBox) return;
  stageBox.innerHTML = `
    <div class="big-letter" id="en-target-letter">${bigText}</div>
    <div class="target-subword" id="en-target-subword">${subHtml}</div>
    <div class="target-hint" id="en-target-hint">${hintText}</div>
  `;
}

// Lv.1 國小百大單字與英英定義謎題
function renderEnLv1ClueChallenge() {
  const container = document.getElementById('en-options-container');
  const target = pickRandom(ENGLISH_BANK);
  const distractors = shuffle(ENGLISH_BANK.filter((w) => w.word !== target.word)).slice(0, 3);
  const options = shuffle([target, ...distractors]);

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}：「請閱讀英文定義線索，推理出正確的國小單字！」`;

  setEnglishStageCard(
    `${target.emoji} Word Detective`,
    `<div style="font-size:1.15rem; color:#1e293b; font-weight:800; line-height:1.5; margin:6px 0;">"${target.clue}"</div>`,
    `💡 字首提示：${target.letter}... ｜ 點此聽英文線索發音`
  );

  state.currentSpeech = [
    { text: target.clue, lang: 'en-US' },
    { text: `Which word means ${target.zh}?`, lang: 'zh-TW' },
  ];

  container.className = 'options-grid english-options';
  container.innerHTML = options
    .map(
      (opt) => `
      <button class="option-card" onclick="checkEnglishAnswer(this, '${opt.word}', '${target.word}', '${opt.word} (${opt.zh})')">
        <div class="opt-emoji">${opt.emoji}</div>
        <div class="opt-word">${opt.word}</div>
        <div class="opt-zh">${opt.zh}</div>
      </button>
    `
    )
    .join('');

  repeatEnglishPrompt();
}

// Lv.2 自然發音填空＆同反義詞
function renderEnLv2ClozeAndOpposite() {
  const container = document.getElementById('en-options-container');
  const isOpposite = state.round % 2 === 0;

  if (isOpposite) {
    const item = pickRandom(EN_OPPOSITES_BANK);
    const opts = shuffle([item.ans, ...item.wrong]);

    document.getElementById('en-prompt-text').textContent =
      `${PET_CONFIG.duncanName}：「請找出下列單字的【${item.rel}】！」`;

    setEnglishStageCard(
      item.base,
      `<div style="font-size:1.2rem; color:#ec4899; font-weight:900;">請選出它的 ${item.rel} ➔ [ ? ]</div>`,
      `🔊 點此聽單字發音`
    );

    state.currentSpeech = [
      { text: item.base.split(' ')[0], lang: 'en-US' },
      { text: `請找出它的${item.rel}`, lang: 'zh-TW' },
    ];

    container.className = 'options-grid english-options';
    container.innerHTML = opts
      .map(
        (w) => `
        <button class="option-card" onclick="checkEnglishAnswer(this, '${w}', '${item.ans}', '${w}')">
          <div class="opt-word" style="font-size:1.5rem;">${w}</div>
        </button>
      `
      )
      .join('');
  } else {
    const target = pickRandom(ENGLISH_BANK);
    const word = target.word;
    const midIdx = Math.max(1, Math.floor(word.length / 2) - 1);
    const missingPart = word.slice(midIdx, midIdx + 2);
    const maskedWord = word.slice(0, midIdx) + '__' + word.slice(midIdx + 2);

    const pool = ['ea', 'ou', 'ar', 'er', 'in', 'on', 'at', 'or', 'an', 'el', 'ic', 'ol', 'ur', 'il'];
    const distractors = shuffle(pool.filter((p) => p !== missingPart.toLowerCase())).slice(0, 3);
    const opts = shuffle([missingPart, ...distractors]);

    document.getElementById('en-prompt-text').textContent =
      `${PET_CONFIG.duncanName}：「聽發音與線索，選出正確的雙字母完成單字！」`;

    setEnglishStageCard(
      `${target.emoji} ${maskedWord}`,
      `<div style="font-size:1.05rem; color:#475569; font-weight:800;">${target.zh} — "${target.clue}"</div>`,
      `🔊 點此聽完整單字發音`
    );

    state.currentSpeech = [
      { text: target.word, lang: 'en-US' },
      { text: target.zh, lang: 'zh-TW' },
    ];

    container.className = 'options-grid english-options';
    container.innerHTML = opts
      .map(
        (part) => `
        <button class="option-card" onclick="checkEnglishAnswer(this, '${part}', '${missingPart}', '${target.word}')">
          <div class="opt-word" style="font-size:1.75rem; color:#4f46e5;">${part}</div>
        </button>
      `
      )
      .join('');
  }
  repeatEnglishPrompt();
}

// Lv.3 進階拼字＆英文句子重組
function renderEnLv3ScrambleAndSpell() {
  const slotsEl = document.getElementById('en-spelling-slots');
  const container = document.getElementById('en-options-container');
  slotsEl.classList.remove('hidden');

  const item = pickRandom(EN_SENTENCE_SCRAMBLE_BANK);
  const fullSentence = item.words.join(' ');
  const pool = shuffle(item.words.map((w, idx) => ({ w, id: idx })));

  state.currentQuestion = {
    targetWords: item.words,
    picked: [],
    pool,
    zh: item.zh,
  };

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}：「請按照正確的英文文法順序，依序點擊單字卡重組句子！」`;

  setEnglishStageCard(
    '✍️ Sentence Scramble',
    `<div style="font-size:1.25rem; color:#1e293b; font-weight:900;">中文句意：${item.zh}</div>`,
    `🔊 點此聽完整英文句子提示`
  );

  state.currentSpeech = [
    { text: fullSentence, lang: 'en-US' },
    { text: item.zh, lang: 'zh-TW' },
  ];

  renderEnLv3ScrambleSlots();
  repeatEnglishPrompt();
}

function renderEnLv3ScrambleSlots() {
  const slotsEl = document.getElementById('en-spelling-slots');
  const container = document.getElementById('en-options-container');
  const q = state.currentQuestion;

  slotsEl.innerHTML = q.targetWords
    .map((_, i) => {
      const p = q.picked[i];
      return `<div class="letter-slot ${p ? 'filled' : ''}" style="min-width:64px; width:auto; padding:0 12px; font-size:1.15rem;">
        ${p ? p.w : i + 1}
      </div>`;
    })
    .join('');

  container.className = 'options-grid english-options';
  container.innerHTML = q.pool
    .map((token) => {
      const used = q.picked.some((p) => p.id === token.id);
      return `<button class="option-card ${used ? 'correct-pick' : ''}"
        style="padding:12px 18px; min-height:64px;"
        ${used ? 'disabled' : ''}
        onclick="handleScrambleWordPick(${token.id})">
        <div class="opt-word" style="font-size:1.3rem;">${token.w}</div>
      </button>`;
    })
    .join('');
}

function handleScrambleWordPick(tokenId) {
  if (state.isAnswering) return;
  const q = state.currentQuestion;
  const token = q.pool.find((t) => t.id === tokenId);
  if (!token) return;

  const expected = q.targetWords[q.picked.length];
  if (token.w.toLowerCase() === expected.toLowerCase()) {
    playClickTick();
    q.picked.push(token);
    speakSequence([{ text: token.w, lang: 'en-US' }]);
    renderEnLv3ScrambleSlots();

    if (q.picked.length === q.targetWords.length) {
      const sentence = q.targetWords.join(' ');
      onCorrectAnswer('en', sentence, [{ text: `Awesome! ${sentence}`, lang: 'en-US' }]);
    }
  } else {
    onWrongAnswer('en', `下一個單字不是 "${token.w}" 喔，再聽一次句子順序！`);
  }
}

// Lv.4 幾何多邊形與雙重指令氣球
function renderEnLv4GeometryBalloon() {
  const container = document.getElementById('en-options-container');
  const targetColor = pickRandom(EN_COLORS);
  const targetShape = pickRandom(EN_SHAPES);
  const targetKey = `${targetColor.shortEn}-${targetShape.id}`;

  const combos = [{ color: targetColor, shape: targetShape, key: targetKey }];
  while (combos.length < 6) {
    const c = pickRandom(EN_COLORS);
    const s = pickRandom(EN_SHAPES);
    const k = `${c.shortEn}-${s.id}`;
    if (!combos.some((x) => x.key === k)) combos.push({ color: c, shape: s, key: k });
  }
  const shuffled = shuffle(combos);

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}：「幾何色彩雙重指令！請戳破【${targetColor.en} ${targetShape.en}】！」`;

  setEnglishStageCard(
    `🎈 ${targetColor.en} ${targetShape.en}`,
    `<div style="font-size:1.05rem; color:#475569; font-weight:800;">Clue: A ${targetShape.en.toLowerCase()} is ${targetShape.clue} (${targetColor.zh}${targetShape.zh})</div>`,
    `🔊 點此聽英文幾何指令`
  );

  state.currentSpeech = [
    { text: `Pop the ${targetColor.en} ${targetShape.en}!`, lang: 'en-US' },
    { text: `It is ${targetShape.clue}.`, lang: 'en-US' },
  ];

  container.className = 'balloon-stage-grid';
  container.innerHTML = shuffled
    .map(
      (item) => `
      <button class="balloon-card" style="background:${item.color.bg}; border-color:${item.color.border};"
        onclick="checkEnglishAnswer(this, '${item.key}', '${targetKey}', '${item.color.en} ${item.shape.en}')">
        <div class="balloon-svg-wrap">${getPolygonSvg(item.shape.id, item.color.fill)}</div>
        <div class="balloon-label" style="font-weight:900; color:#1e293b;">${item.color.shortEn} ${item.shape.en}</div>
      </button>
    `
    )
    .join('');

  repeatEnglishPrompt();
}

function getPolygonSvg(shapeId, fill) {
  let poly = '';
  if (shapeId === 'pentagon') {
    poly = `<polygon points="50,8 92,38 76,88 24,88 8,38" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'hexagon') {
    poly = `<polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'octagon') {
    poly = `<polygon points="32,8 68,8 92,32 92,68 68,92 32,92 8,68 8,32" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'rectangle') {
    poly = `<rect x="10" y="24" width="80" height="52" rx="6" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'triangle') {
    poly = `<polygon points="50,10 90,86 10,86" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else {
    poly = `<polygon points="50,8 88,50 50,92 12,50" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  }
  return `<svg viewBox="0 0 100 100" width="68" height="68">${poly}</svg>`;
}

// Lv.5 12張英漢意思配對翻牌 (6對)
function renderEnLv5MemoryMatch12() {
  const container = document.getElementById('en-options-container');
  const chosenWords = shuffle(ENGLISH_BANK).slice(0, 6);
  const deck = [];
  chosenWords.forEach((item) => {
    deck.push({ pairId: item.word, type: 'en', top: '🔤 EN', main: item.word, word: item.word });
    deck.push({ pairId: item.word, type: 'zh', top: item.emoji, main: item.zh, word: item.word });
  });
  const shuffledDeck = shuffle(deck);

  state.currentQuestion = {
    deck: shuffledDeck,
    flipped: [],
    matched: 0,
    totalPairs: 6,
    lock: false,
  };

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}：「12 張記憶翻牌！請把【英文單字卡】與對應的【中文意義卡】配對起來！」`;

  setEnglishStageCard(
    '🃏 12-Card Memory Match',
    `<div style="font-size:1.05rem; color:#475569; font-weight:800;">目前已配對：<span id="mem-pair-progress">0 / 6</span> 對</div>`,
    `🔊 翻開卡片時會自動唸出英文單字喔！`
  );

  state.currentSpeech = [
    { text: 'Match each English word card with its Chinese meaning card!', lang: 'en-US' },
  ];

  container.className = 'memory-grid-12';
  container.innerHTML = shuffledDeck
    .map(
      (c, idx) => `
      <button class="memory-card-btn" id="mem12-card-${idx}" onclick="handleFlipCard12(${idx})">
        <div class="mem-card-front">🐾 翻牌</div>
        <div class="mem-card-back" style="display:none;">
          <div style="font-size:1.3rem;">${c.top}</div>
          <div style="font-size:0.95rem; font-weight:900; color:#1e293b;">${c.main}</div>
        </div>
      </button>
    `
    )
    .join('');

  repeatEnglishPrompt();
}

function handleFlipCard12(idx) {
  if (state.isAnswering) return;
  const q = state.currentQuestion;
  if (!q || q.lock || q.flipped.includes(idx)) return;

  const btn = document.getElementById(`mem12-card-${idx}`);
  if (!btn || btn.classList.contains('matched')) return;

  playClickTick();
  const front = btn.querySelector('.mem-card-front');
  const back = btn.querySelector('.mem-card-back');
  if (front) front.style.display = 'none';
  if (back) back.style.display = 'block';
  btn.classList.add('flipped');

  speakSequence([{ text: q.deck[idx].word, lang: 'en-US' }]);
  q.flipped.push(idx);

  if (q.flipped.length === 2) {
    q.lock = true;
    const [i1, i2] = q.flipped;
    const c1 = q.deck[i1];
    const c2 = q.deck[i2];

    if (c1.pairId === c2.pairId && c1.type !== c2.type) {
      setTimeout(() => {
        const b1 = document.getElementById(`mem12-card-${i1}`);
        const b2 = document.getElementById(`mem12-card-${i2}`);
        b1?.classList.add('matched');
        b2?.classList.add('matched');
        q.flipped = [];
        q.lock = false;
        q.matched++;
        playSuccessJingle();
        const prog = document.getElementById('mem-pair-progress');
        if (prog) prog.textContent = `${q.matched} / ${q.totalPairs}`;
        if (q.matched >= q.totalPairs) {
          onCorrectAnswer('en', '6組全數配對完成', [
            { text: 'Awesome memory! All six pairs matched!', lang: 'en-US' },
          ]);
        }
      }, 400);
    } else {
      setTimeout(() => {
        [i1, i2].forEach((i) => {
          const b = document.getElementById(`mem12-card-${i}`);
          if (b) {
            b.classList.remove('flipped');
            const f = b.querySelector('.mem-card-front');
            const bk = b.querySelector('.mem-card-back');
            if (f) f.style.display = 'block';
            if (bk) bk.style.display = 'none';
          }
        });
        q.flipped = [];
        q.lock = false;
      }, 900);
    }
  }
}

// Lv.6 Rocket Girl 閱讀理解＆文法
function renderEnLv6ReadingAndGrammar() {
  const container = document.getElementById('en-options-container');
  let pool = ROCKET_BOOK1_BANK;
  if (state.rocketUnit !== 'all') {
    const filtered = pool.filter((q) => q.unit === state.rocketUnit);
    if (filtered.length) pool = filtered;
  }
  const quiz = pickRandom(pool);
  const opts = shuffle([quiz.ans, ...quiz.wrong]);

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}：「請閱讀短文，選出最正確的閱讀理解或文法答案！」`;

  setEnglishStageCard(
    quiz.badge,
    `<div style="font-size:1.08rem; color:#1e293b; background:#f8fafc; padding:12px; border-radius:12px; border:1px solid #cbd5e1; text-align:left; line-height:1.55; margin:8px 0;">
      "${quiz.passage}"
    </div>
    <div style="font-size:1.15rem; font-weight:900; color:#4f46e5;">❓ ${quiz.question}</div>`,
    `🔊 點此聽英文短文朗讀`
  );

  state.currentSpeech = [
    { text: quiz.passage.replace('______', 'blank'), lang: 'en-US' },
    { text: quiz.question, lang: /[a-zA-Z]/.test(quiz.question) ? 'en-US' : 'zh-TW' },
  ];

  container.className = 'options-grid english-options';
  container.innerHTML = opts
    .map(
      (opt) => `
      <button class="option-card" style="padding:14px;" onclick="checkEnglishAnswer(this, '${opt.replace(/'/g, "\\'")}', '${quiz.ans.replace(/'/g, "\\'")}', '${quiz.ans.replace(/'/g, "\\'")}')">
        <div class="opt-word" style="font-size:1.1rem;">${opt}</div>
      </button>
    `
    )
    .join('');

  repeatEnglishPrompt();
}

function checkEnglishAnswer(btn, chosen, correct, spokenLabel) {
  if (state.isAnswering) return;
  if (String(chosen) === String(correct)) {
    btn.classList.add('correct-pick');
    onCorrectAnswer('en', spokenLabel || correct, [{ text: String(correct), lang: 'en-US' }]);
  } else {
    btn.classList.add('wrong-pick');
    setTimeout(() => btn.classList.remove('wrong-pick'), 500);
    onWrongAnswer('en', '答案不太對喔，再仔細讀一次題目線索！');
  }
}


// ============================================================================
// 🐱 Corie 國小數理學院 (6~12歲 6大進階關卡)
// ============================================================================
function startMathGame(lv = 1) {
  state.currentMode = 'math';
  state.mathLevel = lv;
  state.round = 1;
  showScreen('math');
  syncMathLevelChips();
  loadMathQuestion();
}

function switchMathLevel(lv) {
  playClickTick();
  state.mathLevel = lv;
  state.round = 1;
  syncMathLevelChips();
  loadMathQuestion();
}

function syncMathLevelChips() {
  for (let i = 1; i <= 6; i++) {
    const chip = document.getElementById(`math-lvl-chip-${i}`);
    if (chip) chip.classList.toggle('active', i === state.mathLevel);
  }
}

function repeatMathPrompt() {
  if (state.currentSpeech && state.currentSpeech.length) {
    speakSequence(state.currentSpeech);
  }
}

function makeNumericDistractors(correct, count = 3, stepRange = [1, 10]) {
  const set = new Set([correct]);
  const list = [correct];
  let guard = 0;
  while (list.length < count + 1 && guard < 60) {
    guard++;
    const delta = randInt(stepRange[0], stepRange[1]) * (Math.random() < 0.5 ? 1 : -1);
    const cand = guard % 3 === 0 ? correct + (Math.random() < 0.5 ? 10 : -10) : correct + delta;
    if (cand >= 0 && !set.has(cand)) {
      set.add(cand);
      list.push(cand);
    }
  }
  return shuffle(list);
}

function loadMathQuestion() {
  state.isAnswering = false;
  updateRoundProgressUI('math');

  const lv = state.mathLevel;
  if (lv === 1) renderMathLv1MultiDigit();
  else if (lv === 2) renderMathLv2MultDivCompare();
  else if (lv === 3) renderMathLv3EquationAndWordProblem();
  else if (lv === 4) renderMathLv4CashierPro();
  else if (lv === 5) renderMathLv5OlympiadSequence();
  else renderMathLv6FractionAndGeometry();
}

// Lv.1 雙位數與百位進退位加減
function renderMathLv1MultiDigit() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');

  const isAdd = Math.random() < 0.55;
  let a, b, ans, op;
  if (isAdd) {
    a = randInt(36, 245);
    b = randInt(28, 178);
    ans = a + b;
    op = '+';
  } else {
    a = randInt(85, 340);
    b = randInt(27, a - 15);
    ans = a - b;
    op = '−';
  }

  const opts = makeNumericDistractors(ans, 3, [1, 12]);
  const item = pickRandom(MATH_ITEMS);
  const hA = Math.floor(a / 100);
  const tA = Math.floor((a % 100) / 10);
  const uA = a % 10;

  document.getElementById('math-prompt-text').textContent =
    `${PET_CONFIG.corieName}：「多位數進退位挑戰！先算個位、再算十位與百位喔！」`;

  stage.innerHTML = `
    <div class="word-problem-card" style="text-align:center;">
      <div class="wp-badge">🧮 國小二～三位數進退位心算</div>
      <div style="font-size:1.05rem; color:#475569; font-weight:800; margin-top:4px;">
        ${item.emoji} 位值分解提示：<strong>${a}</strong> ＝ ${hA > 0 ? hA + '個百 + ' : ''}${tA}個十 + ${uA}個一
      </div>
    </div>
  `;

  eqBar.innerHTML = `<span style="font-size:2.3rem; font-weight:900;">${a} <span style="color:#f59e0b;">${op}</span> ${b} ＝ <span style="color:#ec4899;">?</span></span>`;

  state.currentSpeech = [
    { text: `請計算：${a} ${isAdd ? '加' : '減'} ${b} 等於多少？`, lang: 'zh-TW' },
  ];

  container.className = 'options-grid math-options';
  container.innerHTML = opts
    .map(
      (n) => `
      <button class="option-card math-opt-btn" onclick="checkMathAnswer(this, ${n}, ${ans})">
        <div class="opt-word" style="font-size:1.9rem;">${n}</div>
      </button>
    `
    )
    .join('');

  repeatMathPrompt();
}

// Lv.2 九九乘法、除法＆算式比大小
function renderMathLv2MultDivCompare() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');

  const mode = state.round % 3;
  if (mode === 1) {
    const a = randInt(3, 12);
    const b = randInt(3, 9);
    const ans = a * b;
    const opts = makeNumericDistractors(ans, 3, [2, 9]);

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}：「乘法進階挑戰！每組有 ${a} 個，共 ${b} 組，總共是多少？」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">✖️ 國小乘法挑戰 (Multiplication)</div>
        <div style="font-size:1rem; color:#475569; font-weight:800;">💡 提示：每組 ${a} 個 × ${b} 組</div>
      </div>
    `;
    eqBar.innerHTML = `<span style="font-size:2.4rem; font-weight:900;">${a} × ${b} ＝ <span style="color:#ec4899;">?</span></span>`;
    state.currentSpeech = [{ text: `請問 ${a} 乘以 ${b} 等於多少？`, lang: 'zh-TW' }];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map(
        (n) => `<button class="option-card math-opt-btn" onclick="checkMathAnswer(this, ${n}, ${ans})"><div class="opt-word" style="font-size:1.9rem;">${n}</div></button>`
      )
      .join('');
  } else if (mode === 2) {
    const divisor = randInt(3, 9);
    const quotient = randInt(4, 12);
    const dividend = divisor * quotient;
    const opts = makeNumericDistractors(quotient, 3, [1, 4]);

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}：「整除除法挑戰！把 ${dividend} 平分成 ${divisor} 組，每組有幾個？」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">➗ 國小整除除法 (Division)</div>
        <div style="font-size:1rem; color:#475569; font-weight:800;">💡 乘法驗算思考：${divisor} × (?) ＝ ${dividend}</div>
      </div>
    `;
    eqBar.innerHTML = `<span style="font-size:2.4rem; font-weight:900;">${dividend} ÷ ${divisor} ＝ <span style="color:#ec4899;">?</span></span>`;
    state.currentSpeech = [{ text: `請問 ${dividend} 除以 ${divisor} 等於多少？`, lang: 'zh-TW' }];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map(
        (n) => `<button class="option-card math-opt-btn" onclick="checkMathAnswer(this, ${n}, ${quotient})"><div class="opt-word" style="font-size:1.9rem;">${n}</div></button>`
      )
      .join('');
  } else {
    const a1 = randInt(4, 9), b1 = randInt(4, 9);
    const leftVal = a1 * b1;
    const a2 = randInt(15, 45), b2 = randInt(10, 35);
    const rightVal = a2 + b2;
    const correctSym = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '=';

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}：「先算出左右兩個算式的答案，再比較哪一邊比較大！」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">⚖️ 雙邊算式比大小</div>
        <div style="font-size:1rem; color:#475569; font-weight:800;">請選出 > 、 = 或 < 填入中間的問號框！</div>
      </div>
    `;
    eqBar.innerHTML = `
      <span style="font-size:1.9rem; font-weight:900;">
        (${a1} × ${b1}) <span style="color:#ec4899; padding:0 10px;">[ ? ]</span> (${a2} + ${b2})
      </span>
    `;
    state.currentSpeech = [
      { text: `請比較左邊 ${a1} 乘以 ${b1}，和右邊 ${a2} 加 ${b2}，哪一邊比較大？`, lang: 'zh-TW' },
    ];

    container.className = 'options-grid math-options';
    container.innerHTML = ['>', '=', '<']
      .map(
        (sym) => `<button class="option-card math-opt-btn" onclick="checkMathAnswer(this, '${sym}', '${correctSym}')"><div class="opt-word" style="font-size:2.2rem;">${sym}</div></button>`
      )
      .join('');
  }
  repeatMathPrompt();
}

// Lv.3 四則先乘除後加減、代數未知數＆生活應用題
function renderMathLv3EquationAndWordProblem() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');

  const mode = state.round % 3;
  if (mode === 1) {
    const a = randInt(12, 35);
    const b = randInt(3, 8);
    const c = randInt(4, 9);
    const ans = a + b * c;
    const opts = makeNumericDistractors(ans, 3, [2, 10]);

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}：「記住四則運算黃金法則：【先乘除、後加減】！」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">📐 四則運算（先乘除後加減）</div>
        <div style="font-size:1rem; color:#4f46e5; font-weight:800;">💡 先算 ${b} × ${c}，最後再加上 ${a} 喔！</div>
      </div>
    `;
    eqBar.innerHTML = `<span style="font-size:2.3rem; font-weight:900;">${a} ＋ ${b} × ${c} ＝ <span style="color:#ec4899;">?</span></span>`;
    state.currentSpeech = [{ text: `先乘除後加減：請問 ${a} 加 ${b} 乘以 ${c} 等於多少？`, lang: 'zh-TW' }];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map((n) => `<button class="option-card math-opt-btn" onclick="checkMathAnswer(this, ${n}, ${ans})"><div class="opt-word" style="font-size:1.9rem;">${n}</div></button>`)
      .join('');
  } else if (mode === 2) {
    const a = randInt(3, 8);
    const x = randInt(4, 11);
    const b = randInt(5, 20);
    const c = a * x + b;
    const opts = makeNumericDistractors(x, 3, [1, 4]);

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}：「代數未知數推理！請問問號格裡的數字是多少？」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">🕵️ 未知數方程式逆推</div>
        <div style="font-size:1rem; color:#475569; font-weight:800;">💡 提示：先算 ${c} − ${b}，再除以 ${a}！</div>
      </div>
    `;
    eqBar.innerHTML = `<span style="font-size:2.2rem; font-weight:900;">${a} × <span style="color:#ec4899;">[ ? ]</span> ＋ ${b} ＝ ${c}</span>`;
    state.currentSpeech = [{ text: `${a} 乘以多少，再加上 ${b} 會等於 ${c}？`, lang: 'zh-TW' }];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map((n) => `<button class="option-card math-opt-btn" onclick="checkMathAnswer(this, ${n}, ${x})"><div class="opt-word" style="font-size:1.9rem;">${n}</div></button>`)
      .join('');
  } else {
    const item = pickRandom(MATH_ITEMS);
    const price = randInt(12, 25);
    const qty = randInt(3, 6);
    const paid = 200;
    const ans = paid - price * qty;
    const opts = makeNumericDistractors(ans, 3, [5, 15]);
    const story = `小華去商店買了 ${qty} ${item.unit}${item.name}（${item.emoji}），每${item.unit}售價 ${price} 元。他付了一張 ${paid} 元鈔票，請問老闆應該找他多少元？`;

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}：「請閱讀兩步驟文字應用題，算出正確的找零金額！」`;

    stage.innerHTML = `
      <div class="word-problem-card">
        <div class="wp-badge">📖 國小兩步驟文字應用題</div>
        <div class="wp-text">${story}</div>
      </div>
    `;
    eqBar.innerHTML = `<span style="font-size:1.6rem; font-weight:900; color:#4f46e5;">${paid} − (${price} × ${qty}) ＝ ? 元</span>`;
    state.currentSpeech = [{ text: story, lang: 'zh-TW' }];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map((n) => `<button class="option-card math-opt-btn" onclick="checkMathAnswer(this, ${n}, ${ans})"><div class="opt-word" style="font-size:1.75rem;">${n} 元</div></button>`)
      .join('');
  }
  repeatMathPrompt();
}

// Lv.4 超市收銀店長（百元湊錢＆找零）
function renderMathLv4CashierPro() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');
  eqBar.innerHTML = '';
  container.innerHTML = '';

  const i1 = pickRandom(MATH_ITEMS);
  const i2 = pickRandom(MATH_ITEMS.filter((x) => x.name !== i1.name));
  const p1 = randInt(25, 89);
  const p2 = randInt(18, 75);
  const qty1 = randInt(1, 2);
  const totalCost = p1 * qty1 + p2;

  const isChangeMode = state.round % 2 === 0;
  let targetAmount = totalCost;
  let customerPaid = 0;

  if (isChangeMode) {
    customerPaid = Math.ceil((totalCost + 15) / 50) * 50;
    targetAmount = customerPaid - totalCost;
  }

  state.currentQuestion = {
    targetAmount,
    trayCoins: [],
    isChangeMode,
    totalCost,
    customerPaid,
    i1,
    i2,
    p1,
    p2,
    qty1,
  };

  document.getElementById('math-prompt-text').textContent = isChangeMode
    ? `${PET_CONFIG.corieName}：「商品共 $${totalCost}，客人付了 $${customerPaid}，請湊出正確的【找零金額】！」`
    : `${PET_CONFIG.corieName}：「請先算出兩項商品的總價，再拿出剛好金額的鈔票與硬幣！」`;

  state.currentSpeech = [
    {
      text: isChangeMode
        ? `商品總共 ${totalCost} 元，客人付了 ${customerPaid} 元，請算出要找客人多少錢並放上收銀托盤！`
        : `買了 ${qty1} ${i1.unit}${i1.name}和 1 ${i2.unit}${i2.name}，請算出總價並拿出正確的鈔票硬幣！`,
      lang: 'zh-TW',
    },
  ];

  renderCashierProStage();
  repeatMathPrompt();
}

function renderCashierProStage() {
  const stage = document.getElementById('math-visual-stage');
  const q = state.currentQuestion;
  const currentSum = q.trayCoins.reduce((a, b) => a + b, 0);

  stage.innerHTML = `
    <div class="cashier-stage" style="width:100%;">
      <div class="word-problem-card" style="margin-bottom:10px;">
        <div class="wp-badge">🛒 超市收銀店長：${q.isChangeMode ? '找零錢特訓' : '多件結帳特訓'}</div>
        <div style="display:flex; justify-content:space-around; flex-wrap:wrap; gap:10px; margin:8px 0;">
          <div style="background:#f8fafc; padding:8px 14px; border-radius:12px; border:1px solid #cbd5e1; font-weight:800;">
            ${q.i1.emoji} ${q.i1.name} $${q.p1} × ${q.qty1} ＝ <strong>$${q.p1 * q.qty1}</strong>
          </div>
          <div style="background:#f8fafc; padding:8px 14px; border-radius:12px; border:1px solid #cbd5e1; font-weight:800;">
            ${q.i2.emoji} ${q.i2.name} $${q.p2} × 1 ＝ <strong>$${q.p2}</strong>
          </div>
        </div>
        <div style="text-align:center; font-size:1.1rem; font-weight:900; color:#1e293b;">
          🧾 商品總計：<span style="color:#4f46e5;">$${q.totalCost}</span>
          ${q.isChangeMode ? ` ｜ 💵 客人付現：<span style="color:#16a34a;">$${q.customerPaid}</span> ｜ 🎯 應找零：<span style="color:#ec4899;">$ ?</span>` : ''}
        </div>
      </div>

      <div class="cashier-tray" style="background:#f8fafc; border:2px dashed #94a3b8; border-radius:16px; padding:12px;">
        <div style="display:flex; justify-content:space-between; font-weight:900; margin-bottom:8px;">
          <span>📥 收銀托盤（點擊錢幣可退回）</span>
          <span style="color:#0284c7; font-size:1.15rem;">目前合計：$${currentSum} 元</span>
        </div>
        <div style="min-height:54px; display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:center;">
          ${
            q.trayCoins.length === 0
              ? '<span style="color:#94a3b8; font-weight:700;">請點擊下方鈔票或硬幣放入托盤...</span>'
              : q.trayCoins
                  .map(
                    (val, idx) =>
                      `<button class="${val === 100 ? 'bill-100-btn' : val === 50 ? 'coin-50-btn' : val === 10 ? 'coin-10-btn' : 'coin-btn'}"
                        onclick="removeCashierMoney(${idx})">$${val}</button>`
                  )
                  .join('')
          }
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:12px;">
        <button class="bill-100-btn" onclick="addCashierMoney(100)">💵 $100</button>
        <button class="coin-50-btn" onclick="addCashierMoney(50)">🪙 $50</button>
        <button class="coin-10-btn" onclick="addCashierMoney(10)">🪙 $10</button>
        <button class="coin-btn" style="background:#fef08a; border:2px solid #eab308; padding:10px 16px; border-radius:999px; font-weight:900;" onclick="addCashierMoney(5)">🪙 $5</button>
        <button class="coin-btn" style="background:#fed7aa; border:2px solid #f97316; padding:10px 16px; border-radius:999px; font-weight:900;" onclick="addCashierMoney(1)">🪙 $1</button>
      </div>

      <div style="display:flex; justify-content:center; gap:12px; margin-top:14px;">
        <button class="speed-chip" onclick="clearCashierTray()">🗑️ 清空重湊</button>
        <button class="submit-clock-btn" style="margin:0;" onclick="submitCashierCheckout()">✅ 確認結帳 ($${currentSum})</button>
      </div>
    </div>
  `;
}

function addCashierMoney(val) {
  if (state.isAnswering || !state.currentQuestion) return;
  playClickTick();
  state.currentQuestion.trayCoins.push(val);
  renderCashierProStage();
}

function removeCashierMoney(idx) {
  if (state.isAnswering || !state.currentQuestion) return;
  playClickTick();
  state.currentQuestion.trayCoins.splice(idx, 1);
  renderCashierProStage();
}

function clearCashierTray() {
  if (state.isAnswering || !state.currentQuestion) return;
  playClickTick();
  state.currentQuestion.trayCoins = [];
  renderCashierProStage();
}

function submitCashierCheckout() {
  if (state.isAnswering || !state.currentQuestion) return;
  const q = state.currentQuestion;
  const sum = q.trayCoins.reduce((a, b) => a + b, 0);
  if (sum === q.targetAmount) {
    onCorrectAnswer('math', `$${sum} 元`, [{ text: `結帳正確！總共是 ${sum} 元！`, lang: 'zh-TW' }]);
  } else {
    onWrongAnswer(
      'math',
      sum > q.targetAmount
        ? `目前放了 $${sum} 元，太多了喔！請點擊托盤裡的錢幣退回一部分。`
        : `目前只有 $${sum} 元，還不夠喔！請再算算看目標金額。`
    );
  }
}

// Lv.5 奧數級數列火車（等差/等比/平方/費氏）
function renderMathLv5OlympiadSequence() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');

  const seqTypes = [
    () => {
      const start = randInt(5, 25);
      const step = randInt(6, 14);
      return {
        arr: [0, 1, 2, 3, 4].map((i) => start + i * step),
        hint: `每一節車廂都比前一節多 ${step}（+${step}）`,
      };
    },
    () => {
      const step = randInt(7, 12);
      const start = randInt(65, 98);
      return {
        arr: [0, 1, 2, 3, 4].map((i) => start - i * step),
        hint: `每一節車廂都比前一節少 ${step}（−${step}）`,
      };
    },
    () => {
      const start = randInt(2, 5);
      return {
        arr: [start, start * 2, start * 4, start * 8, start * 16],
        hint: '後一個數字都是前一個數字的 2 倍（×2）',
      };
    },
    () => {
      const base = randInt(1, 4);
      return {
        arr: [0, 1, 2, 3, 4].map((i) => (base + i) * (base + i)),
        hint: '連續整數自己乘以自己的完全平方數 (n × n)',
      };
    },
    () => {
      const a = randInt(1, 4), b = randInt(2, 5);
      const c = a + b, d = b + c, e = c + d;
      return {
        arr: [a, b, c, d, e],
        hint: '費氏數列：前兩節車廂加起來，等於下一節車廂！',
      };
    },
  ];

  const chosen = pickRandom(seqTypes)();
  const missingIdx = randInt(3, 4);
  const ans = chosen.arr[missingIdx];
  const opts = makeNumericDistractors(ans, 3, [2, 9]);

  document.getElementById('math-prompt-text').textContent =
    `${PET_CONFIG.corieName}：「觀察火車車廂的規律，推理出問號車廂的數字！」`;

  const carsHtml = chosen.arr
    .map((n, i) =>
      i === missingIdx
        ? `<div class="train-car missing" style="display:inline-flex; align-items:center; justify-content:center; width:62px; height:52px; border-radius:12px; background:#fce7f3; border:3px dashed #ec4899; font-weight:900; font-size:1.4rem; color:#ec4899;">?</div>`
        : `<div class="train-car" style="display:inline-flex; align-items:center; justify-content:center; width:62px; height:52px; border-radius:12px; background:#e0f2fe; border:2px solid #0284c7; font-weight:900; font-size:1.35rem; color:#0f172a;">${n}</div>`
    )
    .join('<span style="margin:0 4px; font-weight:900;">🔗</span>');

  stage.innerHTML = `
    <div class="word-problem-card" style="text-align:center;">
      <div class="wp-badge">🚂 國小資優奧數數列推理</div>
      <div style="margin:12px 0; display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:4px;">
        <span style="font-size:2.2rem; margin-right:6px;">🚂</span>${carsHtml}
      </div>
      <div style="font-size:0.95rem; color:#4f46e5; font-weight:800;">💡 規律提示：${chosen.hint}</div>
    </div>
  `;
  eqBar.innerHTML = '';

  state.currentSpeech = [
    { text: `請觀察車廂數字規律，找出問號車廂的數字！提示：${chosen.hint}`, lang: 'zh-TW' },
  ];

  container.className = 'options-grid math-options';
  container.innerHTML = opts
    .map(
      (n) => `<button class="option-card math-opt-btn" onclick="checkMathAnswer(this, ${n}, ${ans})"><div class="opt-word" style="font-size:1.9rem;">${n}</div></button>`
    )
    .join('');

  repeatMathPrompt();
}

// Lv.6 分數認知、長方形周長面積
function renderMathLv6FractionAndGeometry() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');

  const isGeo = state.round % 2 === 0;
  if (!isGeo) {
    const fractions = [
      { num: 1, den: 3, label: '1/3 (三分之一)' },
      { num: 2, den: 3, label: '2/3 (三分之二)' },
      { num: 1, den: 4, label: '1/4 (四分之一)' },
      { num: 3, den: 4, label: '3/4 (四分之三)' },
      { num: 2, den: 5, label: '2/5 (五分之二)' },
      { num: 3, den: 5, label: '3/5 (五分之三)' },
      { num: 3, den: 8, label: '3/8 (八分之三)' },
      { num: 5, den: 8, label: '5/8 (八分之五)' },
    ];
    const target = pickRandom(fractions);
    const distractors = shuffle(fractions.filter((f) => f.label !== target.label)).slice(0, 3);
    const opts = shuffle([target, ...distractors]);

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}：「數數看圓餅圖平分成幾等份（分母），塗色佔了幾份（分子）！」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">🍕 國小分數圖形認知 (Fractions)</div>
        <div style="margin:8px auto;">${buildFractionPieSvg(target.num, target.den)}</div>
        <div style="font-weight:800; color:#475569;">平分成 <strong>${target.den}</strong> 等份，塗色佔 <strong>${target.num}</strong> 份</div>
      </div>
    `;
    eqBar.innerHTML = '';

    state.currentSpeech = [
      { text: `圓餅平分成 ${target.den} 等份，塗色部分佔了 ${target.num} 份，用分數怎麼表示？`, lang: 'zh-TW' },
    ];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map(
        (o) => `<button class="option-card math-opt-btn" onclick="checkMathAnswer(this, '${o.label}', '${target.label}')"><div class="opt-word" style="font-size:1.35rem;">${o.label}</div></button>`
      )
      .join('');
  } else {
    const w = randInt(5, 14);
    const h = randInt(3, 9);
    const askArea = Math.random() < 0.5;
    const ans = askArea ? w * h : (w + h) * 2;
    const unitLabel = askArea ? 'cm²' : 'cm';
    const formula = askArea ? '面積 ＝ 長 × 寬' : '周長 ＝ (長 ＋ 寬) × 2';
    const opts = makeNumericDistractors(ans, 3, [2, 10]);

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}：「幾何計算挑戰！請算出這個長方形的【${askArea ? '面積' : '周長'}】！」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">📐 長方形${askArea ? '面積 (Area)' : '周長 (Perimeter)'}計算</div>
        <div class="geometry-rect-box">長 ${w} cm × 寬 ${h} cm</div>
        <div style="font-weight:800; color:#4f46e5;">💡 公式提示：${formula}</div>
      </div>
    `;
    eqBar.innerHTML = '';

    state.currentSpeech = [
      { text: `長方形的長是 ${w} 公分，寬是 ${h} 公分，請問它的${askArea ? '面積' : '周長'}是多少？`, lang: 'zh-TW' },
    ];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map(
        (n) => `<button class="option-card math-opt-btn" onclick="checkMathAnswer(this, ${n}, ${ans})"><div class="opt-word" style="font-size:1.6rem;">${n} ${unitLabel}</div></button>`
      )
      .join('');
  }
  repeatMathPrompt();
}

function buildFractionPieSvg(num, den) {
  const cx = 65, cy = 65, r = 55;
  let paths = '';
  for (let i = 0; i < den; i++) {
    const a1 = (i * 2 * Math.PI) / den - Math.PI / 2;
    const a2 = ((i + 1) * 2 * Math.PI) / den - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const fill = i < num ? '#f97316' : '#f1f5f9';
    paths += `<path d="M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${fill}" stroke="#334155" stroke-width="2.5"/>`;
  }
  return `<svg viewBox="0 0 130 130" width="125" height="125">${paths}</svg>`;
}

function checkMathAnswer(btn, chosen, correct) {
  if (state.isAnswering) return;
  if (String(chosen) === String(correct)) {
    btn.classList.add('correct-pick');
    onCorrectAnswer('math', String(correct), [{ text: `答對了！答案是 ${correct}`, lang: 'zh-TW' }]);
  } else {
    btn.classList.add('wrong-pick');
    setTimeout(() => btn.classList.remove('wrong-pick'), 500);
    onWrongAnswer('math', '算式結果不太對喔，再檢查一次計算步驟！');
  }
}

// ============================================================================
// 🐟 Shannon 國小時間推理學院 (6~12歲 3大進階關卡)
// ============================================================================
function startClockGame(lv = 1) {
  state.currentMode = 'clock';
  state.clockLevel = lv;
  state.round = 1;
  showScreen('clock');
  syncClockLevelChips();
  loadClockQuestion();
}

function switchClockLevel(lv) {
  playClickTick();
  state.clockLevel = lv;
  state.round = 1;
  syncClockLevelChips();
  loadClockQuestion();
}

function syncClockLevelChips() {
  for (let i = 1; i <= 3; i++) {
    const chip = document.getElementById(`clock-lvl-chip-${i}`);
    if (chip) chip.classList.toggle('active', i === state.clockLevel);
  }
}

function repeatClockPrompt() {
  if (state.currentSpeech && state.currentSpeech.length) {
    speakSequence(state.currentSpeech);
  }
}

function formatClockTime(h, m) {
  return `${h}:${m < 10 ? '0' + m : m}`;
}

function drawAnalogClockSvg(hour, minute) {
  const svg = document.getElementById('analog-clock-svg');
  if (!svg) return;

  const h12 = hour % 12;
  const minAngle = minute * 6;
  const hourAngle = h12 * 30 + minute * 0.5;

  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const rad = (i * 6 * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const rOut = 114;
    const rIn = isMajor ? 100 : 108;
    const x1 = 130 + rIn * Math.sin(rad);
    const y1 = 130 - rIn * Math.cos(rad);
    const x2 = 130 + rOut * Math.sin(rad);
    const y2 = 130 - rOut * Math.cos(rad);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      stroke="${isMajor ? '#0f172a' : '#94a3b8'}" stroke-width="${isMajor ? 3.2 : 1.5}" stroke-linecap="round"/>`;
  }

  let nums = '';
  for (let n = 1; n <= 12; n++) {
    const rad = (n * 30 * Math.PI) / 180;
    const rNum = 84;
    const x = 130 + rNum * Math.sin(rad);
    const y = 130 - rNum * Math.cos(rad) + 6;
    nums += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="18" font-weight="900" fill="#1e293b">${n}</text>`;
  }

  svg.innerHTML = `
    <circle cx="130" cy="130" r="120" fill="#ffffff" stroke="#0ea5e9" stroke-width="8"/>
    ${ticks}
    ${nums}
    <line x1="130" y1="130" x2="130" y2="68" stroke="#ef4444" stroke-width="7.5" stroke-linecap="round" transform="rotate(${hourAngle} 130 130)"/>
    <line x1="130" y1="130" x2="130" y2="38" stroke="#2563eb" stroke-width="5" stroke-linecap="round" transform="rotate(${minAngle} 130 130)"/>
    <circle cx="130" cy="130" r="7" fill="#0f172a"/>
  `;
}

function loadClockQuestion() {
  state.isAnswering = false;
  updateRoundProgressUI('clock');

  const controls = document.getElementById('clock-set-controls');
  const container = document.getElementById('clock-options-container');

  const lv = state.clockLevel;
  if (lv === 1) {
    if (controls) controls.classList.add('hidden');
    renderClockLv1ExactMinute(container);
  } else if (lv === 2) {
    if (controls) controls.classList.add('hidden');
    renderClockLv2ElapsedTime(container);
  } else {
    if (controls) controls.classList.remove('hidden');
    renderClockLv3InteractiveSet(container);
  }
}

// Lv.1 精準1分鐘刻度＆24小時制換算
function renderClockLv1ExactMinute(container) {
  const is24Hr = state.round % 2 === 0;
  const h12 = randInt(1, 11);
  const min = randInt(1, 58);
  const h24 = h12 + 12;

  const ansStr = is24Hr ? formatClockTime(h24, min) : formatClockTime(h12, min);
  drawAnalogClockSvg(h12, min);

  const badge = document.getElementById('clock-activity-badge');
  if (badge) {
    badge.textContent = is24Hr
      ? '🌆 下午時刻 (PM) ➔ 請換算成 24 小時制（小時 +12）'
      : '🔍 精準 1 分鐘細刻度判讀';
  }

  document.getElementById('clock-prompt-text').textContent = is24Hr
    ? `${PET_CONFIG.shannonName}：「現在是【下午】，請讀出精準分鐘並換算成 24 小時制！」`
    : `${PET_CONFIG.shannonName}：「請仔細數一數藍色分針指在第幾小格，選出正確時刻！」`;

  const opts = [ansStr];
  while (opts.length < 4) {
    const dm = (min + pickRandom([-5, -2, -1, 1, 2, 5, 15, 30]) + 60) % 60;
    const dh = is24Hr ? (Math.random() < 0.35 ? h12 : h24) : h12;
    const cand = formatClockTime(dh, dm);
    if (!opts.includes(cand)) opts.push(cand);
  }

  state.currentSpeech = [
    {
      text: is24Hr
        ? '請看時鐘，如果是下午時刻，用 24 小時制表示是幾點幾分？'
        : '請看時鐘上的細小刻度，現在是幾點幾分？',
      lang: 'zh-TW',
    },
  ];

  container.innerHTML = shuffle(opts)
    .map(
      (t) => `<button class="option-card clock-opt-btn" onclick="checkClockAnswer(this, '${t}', '${ansStr}')"><div class="opt-word" style="font-size:1.85rem;">${t}</div></button>`
    )
    .join('');

  repeatClockPrompt();
}

// Lv.2 經過時間推算應用題
function renderClockLv2ElapsedTime(container) {
  const startH = randInt(8, 16);
  const startM = pickRandom([5, 10, 15, 20, 25, 30, 35, 40, 45]);
  const duration = pickRandom([25, 35, 40, 45, 50, 55, 65, 75]);

  const endTotal = startH * 60 + startM + duration;
  const endH = Math.floor(endTotal / 60);
  const endM = endTotal % 60;
  const ansStr = formatClockTime(endH, endM);

  drawAnalogClockSvg(startH, startM);

  const badge = document.getElementById('clock-activity-badge');
  if (badge) {
    badge.textContent = `🕒 開始時刻：${formatClockTime(startH, startM)} ｜ ⏳ 經過 ${duration} 分鐘後是幾點幾分？`;
  }

  const story = `時鐘顯示的是開始時刻 ${formatClockTime(startH, startM)}，經過 ${duration} 分鐘之後，請問會變成幾點幾分？`;
  document.getElementById('clock-prompt-text').textContent = `${PET_CONFIG.shannonName}：「${story}（滿 60 分鐘要進位 1 小時喔！）」`;

  const opts = [ansStr];
  while (opts.length < 4) {
    const t = endTotal + pickRandom([-15, -10, -5, 5, 10, 15, 20]);
    const cand = formatClockTime(Math.floor(t / 60), ((t % 60) + 60) % 60);
    if (!opts.includes(cand)) opts.push(cand);
  }

  state.currentSpeech = [{ text: story, lang: 'zh-TW' }];

  container.innerHTML = shuffle(opts)
    .map(
      (t) => `<button class="option-card clock-opt-btn" onclick="checkClockAnswer(this, '${t}', '${ansStr}')"><div class="opt-word" style="font-size:1.85rem;">${t}</div></button>`
    )
    .join('');

  repeatClockPrompt();
}

// Lv.3 跨時應用題＆1分鐘微調撥針
function renderClockLv3InteractiveSet(container) {
  container.innerHTML = '';
  const targetH = randInt(1, 12);
  const targetM = randInt(1, 59);
  const userH = (targetH + randInt(2, 5)) % 12 || 12;
  const userM = (targetM + randInt(15, 40)) % 60;

  state.currentQuestion = { targetH, targetM, userH, userM };
  drawAnalogClockSvg(userH, userM);

  const badge = document.getElementById('clock-activity-badge');
  if (badge) {
    badge.textContent = `🎯 請撥針到目標時刻：【 ${formatClockTime(targetH, targetM)} 】（目前：${formatClockTime(userH, userM)}）`;
  }

  document.getElementById('clock-prompt-text').textContent =
    `${PET_CONFIG.shannonName}：「請使用下方按鈕微調時針與分針，精準對準【${formatClockTime(targetH, targetM)}】！」`;

  state.currentSpeech = [
    { text: `請操作按鈕撥動指針，把時鐘精準調整到 ${targetH} 點 ${targetM} 分！`, lang: 'zh-TW' },
  ];

  repeatClockPrompt();
}

function adjustInteractiveClock(deltaH, deltaM) {
  if (state.isAnswering || !state.currentQuestion) return;
  playClickTick();
  const q = state.currentQuestion;
  let total = (q.userH % 12) * 60 + q.userM + deltaH * 60 + deltaM;
  total = ((total % 720) + 720) % 720;
  q.userH = Math.floor(total / 60) || 12;
  q.userM = total % 60;
  drawAnalogClockSvg(q.userH, q.userM);

  const badge = document.getElementById('clock-activity-badge');
  if (badge) {
    badge.textContent = `🎯 請撥針到目標時刻：【 ${formatClockTime(q.targetH, q.targetM)} 】（目前：${formatClockTime(q.userH, q.userM)}）`;
  }
}

function checkInteractiveClockAnswer() {
  if (state.isAnswering || !state.currentQuestion) return;
  const q = state.currentQuestion;
  if (q.userH % 12 === q.targetH % 12 && q.userM === q.targetM) {
    const label = formatClockTime(q.targetH, q.targetM);
    onCorrectAnswer('clock', label, [
      { text: `太精準了！成功把時鐘調到 ${q.targetH} 點 ${q.targetM} 分！`, lang: 'zh-TW' },
    ]);
  } else {
    onWrongAnswer(
      'clock',
      `目前指針在 ${formatClockTime(q.userH, q.userM)}，目標是 ${formatClockTime(q.targetH, q.targetM)}，再微調一下喔！`
    );
  }
}

function checkClockAnswer(btn, chosen, correct) {
  if (state.isAnswering) return;
  if (chosen === correct) {
    btn.classList.add('correct-pick');
    onCorrectAnswer('clock', correct, [{ text: `答對了！時刻是 ${correct}`, lang: 'zh-TW' }]);
  } else {
    btn.classList.add('wrong-pick');
    setTimeout(() => btn.classList.remove('wrong-pick'), 500);
    onWrongAnswer('clock', '時刻不太對喔，再仔細看一次指針指的小格！');
  }
}

// ============================================================================
// 🏆 統一答題結算、金幣與寵物經驗值發放
// ============================================================================
function onCorrectAnswer(prefix, label, speechItems) {
  state.isAnswering = true;
  playSuccessJingle();

  state.streak[prefix] = (state.streak[prefix] || 0) + 1;
  SAVE_DATA.totalAnswered = (SAVE_DATA.totalAnswered || 0) + 1;
  SAVE_DATA.totalCorrect = (SAVE_DATA.totalCorrect || 0) + 1;
  if (state.streak[prefix] > (SAVE_DATA.bestStreak || 0)) {
    SAVE_DATA.bestStreak = state.streak[prefix];
  }

  const bonusCoins = Math.min(10, state.streak[prefix] * 2);
  const earnedCoins = 8 + bonusCoins;
  SAVE_DATA.coins += earnedCoins;
  SAVE_DATA.totalStars += 1;

  const activePet = SAVE_DATA.pets[SAVE_DATA.activePetId || 'corie'];
  if (activePet) addPetExp(activePet, 15);

  saveProgress();
  updateTopCountersUI();
  updateRoundProgressUI(prefix);

  const promptId = prefix === 'en' ? 'en-prompt-text' : prefix === 'math' ? 'math-prompt-text' : 'clock-prompt-text';
  const promptEl = document.getElementById(promptId);
  if (promptEl) {
    promptEl.textContent = `🎉 答對了！(${label}) 獲得 ⭐+1 ‧ 🪙+${earnedCoins} 金幣！`;
  }

  if (speechItems) speakSequence(speechItems);

  setTimeout(() => {
    if (state.round >= TOTAL_ROUNDS) {
      finishRoundSet(prefix);
    } else {
      state.round++;
      if (prefix === 'en') loadEnglishQuestion();
      else if (prefix === 'math') loadMathQuestion();
      else loadClockQuestion();
    }
  }, 1400);
}

function onWrongAnswer(prefix, msg) {
  playTryAgainSound();
  state.streak[prefix] = 0;
  SAVE_DATA.totalAnswered = (SAVE_DATA.totalAnswered || 0) + 1;
  saveProgress();
  updateRoundProgressUI(prefix);

  const promptId = prefix === 'en' ? 'en-prompt-text' : prefix === 'math' ? 'math-prompt-text' : 'clock-prompt-text';
  const promptEl = document.getElementById(promptId);
  if (promptEl) promptEl.textContent = `💪 ${msg}`;
  speakSequence([{ text: msg, lang: 'zh-TW' }]);
}

function finishRoundSet(prefix) {
  const lv = prefix === 'en' ? state.enLevel : prefix === 'math' ? state.mathLevel : state.clockLevel;
  const clearKey = `${prefix}_${lv}`;
  SAVE_DATA.levelClears[clearKey] = (SAVE_DATA.levelClears[clearKey] || 0) + 1;

  SAVE_DATA.coins += 30;
  SAVE_DATA.totalStars += 2;
  const activePet = SAVE_DATA.pets[SAVE_DATA.activePetId || 'corie'];
  if (activePet) addPetExp(activePet, 30);

  saveProgress();
  updateTopCountersUI();

  const msgEl = document.getElementById('celebrate-message');
  if (msgEl) {
    msgEl.innerHTML = `恭喜完成 <strong>Lv.${lv}</strong> 全部 8 題挑戰！（累計過關 ${SAVE_DATA.levelClears[clearKey]} 次 🏅）<br/>目前擁有 <strong>🪙 ${SAVE_DATA.coins} 金幣</strong> 與 <strong>⭐ ${SAVE_DATA.totalStars} 顆星</strong>，快回寵物養成屋幫夥伴買大餐跟新造型吧！`;
  }

  const againBtn = document.getElementById('btn-play-again');
  if (againBtn) {
    againBtn.onclick = () => {
      if (prefix === 'en') startEnglishGame(state.enLevel);
      else if (prefix === 'math') startMathGame(state.mathLevel);
      else startClockGame(state.clockLevel);
    };
  }

  showScreen('celebrate');
  spawnConfetti(35);
  playSuccessJingle();
  speakSequence([
    { text: '太棒了！學霸關卡完成！快回寵物養成屋餵食你的小動物吧！', lang: 'zh-TW' },
  ]);
}

// ============================================================================
// 📊 進度備份彈窗、安裝教學彈窗與家長設定彈窗
// ============================================================================
function openProgressModal() {
  playClickTick();
  const grid = document.getElementById('progress-summary-grid');
  const totalClears = Object.values(SAVE_DATA.levelClears).reduce((a, b) => a + b, 0);
  const unlockedStickers = Math.min(STICKERS.length, Math.floor(SAVE_DATA.totalStars / 3));

  if (grid) {
    grid.innerHTML = `
      <div class="progress-stat-box">
        <div class="stat-num">⭐ ${SAVE_DATA.totalStars}</div>
        <div class="stat-label">累積榮譽星星</div>
      </div>
      <div class="progress-stat-box">
        <div class="stat-num">🪙 ${SAVE_DATA.coins}</div>
        <div class="stat-label">寵物養成金幣</div>
      </div>
      <div class="progress-stat-box">
        <div class="stat-num">🏅 ${totalClears} 次</div>
        <div class="stat-label">關卡完賽次數</div>
      </div>
      <div class="progress-stat-box">
        <div class="stat-num">✅ ${SAVE_DATA.totalCorrect || 0} 題</div>
        <div class="stat-label">累計答對題數</div>
      </div>
      <div class="progress-stat-box">
        <div class="stat-num">🔥 ${SAVE_DATA.bestStreak || 0} 題</div>
        <div class="stat-label">最高連對紀錄</div>
      </div>
      <div class="progress-stat-box">
        <div class="stat-num">🎁 ${unlockedStickers} / ${STICKERS.length}</div>
        <div class="stat-label">已解鎖貼紙圖鑑</div>
      </div>
    `;
  }

  const codeBox = document.getElementById('save-code-textarea');
  if (codeBox) {
    try {
      codeBox.value = btoa(encodeURIComponent(JSON.stringify(SAVE_DATA)));
    } catch (e) {}
  }

  document.getElementById('progress-modal').classList.remove('hidden');
}

function closeProgressModal() {
  playClickTick();
  document.getElementById('progress-modal').classList.add('hidden');
}

function copySaveCode() {
  const codeBox = document.getElementById('save-code-textarea');
  if (!codeBox) return;
  codeBox.select();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(codeBox.value).catch(() => {});
  }
  playSuccessJingle();
  speakSequence([{ text: '已經複製跨裝置存檔碼囉！', lang: 'zh-TW' }]);
}

function promptImportSaveCode() {
  const raw = window.prompt('請貼上您的跨裝置進度引繼碼：');
  if (!raw || !raw.trim()) return;
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(raw.trim())));
    if (parsed && typeof parsed.coins === 'number') {
      SAVE_DATA = { ...DEFAULT_SAVE, ...parsed };
      saveProgress();
      updateTopCountersUI();
      renderPetSanctuary();
      openProgressModal();
      playSuccessJingle();
      speakSequence([{ text: '進度還原成功！', lang: 'zh-TW' }]);
    }
  } catch (e) {
    playTryAgainSound();
    speakSequence([{ text: '引繼碼格式不正確喔！', lang: 'zh-TW' }]);
  }
}

function openInstallModal() {
  playClickTick();
  document.getElementById('install-modal').classList.remove('hidden');
}

function closeInstallModal() {
  playClickTick();
  document.getElementById('install-modal').classList.add('hidden');
}

function openSettingsModal() {
  playClickTick();
  document.getElementById('select-time-limit').value = String(PET_CONFIG.timeLimitMinutes);
  document.getElementById('input-parent-pin').value = PET_CONFIG.parentPin || '1234';
  document.getElementById('input-corie-name').value = PET_CONFIG.corieName;
  document.getElementById('input-duncan-name').value = PET_CONFIG.duncanName;
  document.getElementById('input-shannon-name').value = PET_CONFIG.shannonName;
  document.getElementById('select-tts-mode').value = PET_CONFIG.ttsMode || 'auto';
  document.getElementById('input-speech-rate').value = String(PET_CONFIG.speechRate || 1.0);
  updateSpeedLabel(PET_CONFIG.speechRate || 1.0);
  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettingsModal() {
  playClickTick();
  document.getElementById('settings-modal').classList.add('hidden');
}

function updateSpeedLabel(val) {
  const num = parseFloat(val) || 1.0;
  const label = document.getElementById('speed-label-val');
  if (label) {
    label.textContent = `${num.toFixed(2)}x`;
  }
}

function setSpeedPreset(val) {
  playClickTick();
  const input = document.getElementById('input-speech-rate');
  if (input) input.value = String(val);
  updateSpeedLabel(val);
}

function testVoicePreview() {
  const rate = parseFloat(document.getElementById('input-speech-rate').value) || 1.0;
  PET_CONFIG.speechRate = rate;
  speakSequence([
    { text: `嗨！我是 ${PET_CONFIG.corieName}，一起來挑戰國小學霸遊戲吧！`, lang: 'zh-TW' },
    { text: `Hello! I am ${PET_CONFIG.duncanName}. Let's learn English together!`, lang: 'en-US' },
  ]);
}

function saveSettings() {
  PET_CONFIG.timeLimitMinutes = parseInt(document.getElementById('select-time-limit').value, 10);
  PET_CONFIG.parentPin = document.getElementById('input-parent-pin').value.trim() || '1234';
  PET_CONFIG.corieName = document.getElementById('input-corie-name').value.trim() || 'Corie';
  PET_CONFIG.duncanName = document.getElementById('input-duncan-name').value.trim() || 'Duncan';
  PET_CONFIG.shannonName = document.getElementById('input-shannon-name').value.trim() || 'Shannon';
  PET_CONFIG.ttsMode = document.getElementById('select-tts-mode').value || 'auto';
  PET_CONFIG.speechRate = parseFloat(document.getElementById('input-speech-rate').value) || 1.0;

  const zhSel = document.getElementById('select-zh-voice');
  const enSel = document.getElementById('select-en-voice');
  if (zhSel && zhSel.value) PET_CONFIG.zhVoiceURI = zhSel.value;
  if (enSel && enSel.value) PET_CONFIG.enVoiceURI = enSel.value;

  localStorage.setItem('pet_time_limit_mins', String(PET_CONFIG.timeLimitMinutes));
  localStorage.setItem('pet_parent_pin', PET_CONFIG.parentPin);
  localStorage.setItem('pet_corie_name', PET_CONFIG.corieName);
  localStorage.setItem('pet_duncan_name', PET_CONFIG.duncanName);
  localStorage.setItem('pet_shannon_name', PET_CONFIG.shannonName);
  localStorage.setItem('pet_tts_mode', PET_CONFIG.ttsMode);
  localStorage.setItem('pet_speech_rate', String(PET_CONFIG.speechRate));
  localStorage.setItem('pet_zh_voice', PET_CONFIG.zhVoiceURI);
  localStorage.setItem('pet_en_voice', PET_CONFIG.enVoiceURI);

  initSpeechVoices();
  applyPetNamesToDOM();
  renderPetSanctuary();
  updateTimerUIAndCheckLock();
  closeSettingsModal();
  playSuccessJingle();
  speakSequence([{ text: '家長設定已經儲存成功囉！', lang: 'zh-TW' }]);
}

// ============================================================================
// 🚀 啟動應用程式
// ============================================================================
function initApp() {
  applyPetNamesToDOM();
  initSpeechVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = initSpeechVoices;
  }
  updateTopCountersUI();
  renderPetSanctuary();
  startPlaytimeMonitor();

  document.addEventListener(
    'pointerdown',
    () => {
      getAudioContext();
    },
    { once: true }
  );
}

window.addEventListener('DOMContentLoaded', initApp);
