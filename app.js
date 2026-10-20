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
// 🚀 Lv.6《Rocket Girl & Activity Book》國小閱讀理解與文法題庫
// ============================================================================
const ROCKET_BOOK1_BANK = {
  units: [
    { id: 'all', title: '🌟 全部單元綜合挑戰 (All Units)' },
    { id: 'u1', title: '🎒 Unit 1: School Subjects & Rules (校園科目與規範)' },
    { id: 'u2', title: '👨‍👩‍👧‍👦 Unit 2: Family & Occupations (家庭與職業)' },
    { id: 'u3', title: '🐾 Unit 3: Wildlife & Habitats (動物與棲息地)' },
    { id: 'u4', title: '🎻 Unit 4: Hobbies & Instruments (才藝與興趣)' },
    { id: 'u5', title: '🥗 Unit 5: Healthy Diet & Ordering (健康飲食與點餐)' },
    { id: 'roxy', title: '🦸‍♀️ Rocket Girl: Space Mission (火箭女孩太空任務閱讀)' },
  ],
  readingQuizzes: [
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
      unit: 'roxy',
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
      unit: 'roxy',
      badge: '🦸‍♀️ Rocket Girl 未來式文法 (Future Tense)',
      passage: 'Don\'t worry, citizens! Rocket Girl ______ protect Metro City from the giant robot!',
      question: '請選出表示「將會保護」的助動詞：',
      ans: 'will',
      zh: '助動詞 will + 原形動詞 protect',
      wrong: ['did', 'was', 'are'],
    },
  ],
};

// 🐱 數學視覺化與商店單品題庫
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
let state = {
  currentPet: null, // 'en' | 'math' | 'clock'
  level: { en: 1, math: 1, clock: 1 },
  rocketUnit: 'all',
  score: 0,
  questionIndex: 0,
  totalQuestions: 5,
  currentQuestion: null,
  isAnswering: false,
  lastEarnedSticker: null,
  lastCoinsEarned: 0,
  lastExpEarned: 0,
};

let audioCtx = null;
let selectedZhVoice = null;
let selectedEnVoice = null;
let speechQueueId = 0;
let activeCloudAudio = null;

// ============================================================================
// 🚀 初始化與存檔系統整合
// ============================================================================
function initApp() {
  loadPetConfig();
  loadSaveData();
  applyPetNamesToDOM();

  initSpeechVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = initSpeechVoices;
  }

  renderPetSanctuary();
  renderBadgesAndStreaks();
  renderStickerWall();
  startPlaytimeMonitor();

  // 預熱音效與語音
  document.addEventListener(
    'pointerdown',
    () => {
      getAudioContext();
    },
    { once: true }
  );
}

function renderBadgesAndStreaks() {
  if (!SAVE_DATA) return;
  document.getElementById('total-stars').textContent = SAVE_DATA.totalStars;
  document.getElementById('coin-count').textContent = SAVE_DATA.coins;

  // 各關卡完成次數徽章
  const subjects = [
    { key: 'en', max: 6 },
    { key: 'math', max: 6 },
    { key: 'clock', max: 3 },
  ];
  subjects.forEach((sub) => {
    for (let lv = 1; lv <= sub.max; lv++) {
      const id = `${sub.key}-${lv}`;
      const count = SAVE_DATA.levelClears[id] || 0;
      const el = document.getElementById(`badge-${id}`);
      if (el) {
        if (count > 0) {
          el.textContent = `🏅×${count}`;
          el.classList.add('cleared');
        } else {
          el.textContent = '未挑戰';
          el.classList.remove('cleared');
        }
      }
    }
    const streakEl = document.getElementById(`${sub.key}-streak-pill`);
    if (streakEl) {
      streakEl.textContent = `🔥 連對 ${SAVE_DATA.streaks[sub.key] || 0}`;
    }
  });
}

// ============================================================================
// 💾 學習檔案與進度備份視窗
// ============================================================================
function openProgressModal() {
  playClickTick();
  const grid = document.getElementById('progress-summary-grid');
  if (grid && SAVE_DATA) {
    const totalClears = Object.values(SAVE_DATA.levelClears).reduce((a, b) => a + b, 0);
    const unlockedPets = Object.values(SAVE_DATA.pets).filter((p) => p.unlocked).length;
    grid.innerHTML = `
      <div class="progress-stat-box">
        <span class="stat-num">⭐ ${SAVE_DATA.totalStars}</span>
        <span class="stat-label">累積榮譽星星</span>
      </div>
      <div class="progress-stat-box">
        <span class="stat-num">🪙 ${SAVE_DATA.coins}</span>
        <span class="stat-label">目前擁有金幣</span>
      </div>
      <div class="progress-stat-box">
        <span class="stat-num">🏆 ${totalClears} 次</span>
        <span class="stat-label">累計通關次數</span>
      </div>
      <div class="progress-stat-box">
        <span class="stat-num">✅ ${SAVE_DATA.totalCorrect || 0} 題</span>
        <span class="stat-label">累計答對題數</span>
      </div>
      <div class="progress-stat-box">
        <span class="stat-num">🐾 ${unlockedPets} / 5 隻</span>
        <span class="stat-label">已解鎖守護夥伴</span>
      </div>
      <div class="progress-stat-box">
        <span class="stat-num">🎁 ${SAVE_DATA.unlockedStickers.length} / ${STICKERS.length}</span>
        <span class="stat-label">已收集榮譽貼紙</span>
      </div>
    `;
  }
  document.getElementById('progress-modal').classList.remove('hidden');
}

function closeProgressModal() {
  playClickTick();
  document.getElementById('progress-modal').classList.add('hidden');
}

function exportSaveCode() {
  try {
    const json = JSON.stringify(SAVE_DATA);
    const code = btoa(encodeURIComponent(json));
    const box = document.getElementById('save-code-textarea');
    if (box) {
      box.value = code;
      box.select();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).catch(() => {});
      }
    }
    playSuccessJingle();
    speakSequence([{ text: '進度備份碼已經產生並複製囉！', lang: 'zh-TW' }]);
  } catch (e) {
    console.warn('Export failed:', e);
  }
}

function importSaveCode() {
  const box = document.getElementById('save-code-textarea');
  const raw = (box ? box.value : '').trim();
  if (!raw) {
    speakSequence([{ text: '請先在文字框貼上備份碼喔！', lang: 'zh-TW' }]);
    return;
  }
  try {
    const json = decodeURIComponent(atob(raw));
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed.coins === 'number') {
      SAVE_DATA = Object.assign(getDefaultSaveData(), parsed);
      saveProgress();
      renderPetSanctuary();
      renderBadgesAndStreaks();
      renderStickerWall();
      openProgressModal();
      playSuccessJingle();
      speakSequence([{ text: '太棒了！學習進度與寵物屋已經成功還原！', lang: 'zh-TW' }]);
    }
  } catch (e) {
    playTryAgainSound();
    speakSequence([{ text: '備份碼格式不正確，請重新確認喔！', lang: 'zh-TW' }]);
  }
}

function confirmResetAllProgress() {
  const ok = window.confirm('確定要清除所有學習進度、金幣、寵物等級與貼紙嗎？此動作無法復原喔！');
  if (!ok) return;
  SAVE_DATA = getDefaultSaveData();
  saveProgress();
  renderPetSanctuary();
  renderBadgesAndStreaks();
  renderStickerWall();
  openProgressModal();
  speakSequence([{ text: '已重置所有學習紀錄。', lang: 'zh-TW' }]);
}

// ============================================================================
// 🔊 雙語音與音效引擎
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

function initSpeechVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || !voices.length) return;

  const zhPriority = [
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
      break;
    }
  }

  const enPriority = [
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
      break;
    }
  }
}

function clearPendingSpeech() {
  speechQueueId++;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (activeCloudAudio) {
    try {
      activeCloudAudio.pause();
      activeCloudAudio.src = '';
    } catch (e) {}
    activeCloudAudio = null;
  }
}

function speakSequence(items) {
  if (!items || !items.length) return;
  clearPendingSpeech();
  const myQueueId = speechQueueId;
  const speed = Number(PET_CONFIG.speechRate) || 1.05;

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

function speakCurrentPrompt() {
  if (state.currentQuestion && state.currentQuestion.speech) {
    speakSequence(state.currentQuestion.speech);
  }
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
  const freqs = [300, 240];
  freqs.forEach((freq, i) => {
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

function playClickTick() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 660;
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.055);
}

// ============================================================================
// 🧭 畫面切換與關卡控制
// ============================================================================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  playClickTick();
  clearPendingSpeech();
  state.currentPet = null;
  renderPetSanctuary();
  renderBadgesAndStreaks();
  renderStickerWall();
  showScreen('home-screen');
}

function selectPet(petKey, levelNum) {
  playClickTick();
  state.currentPet = petKey;
  if (levelNum) {
    state.level[petKey] = levelNum;
  }
  state.score = 0;
  state.questionIndex = 0;
  state.lastCoinsEarned = 0;
  state.lastExpEarned = 0;

  if (petKey === 'en') {
    updateLevelTabs('en-screen', state.level.en);
    const rocketBar = document.getElementById('rocket-unit-bar');
    if (rocketBar) {
      rocketBar.classList.toggle('hidden', state.level.en !== 6);
      if (state.level.en === 6) renderRocketUnitBar();
    }
    showScreen('en-screen');
    loadEnglishQuestion();
  } else if (petKey === 'math') {
    updateLevelTabs('math-screen', state.level.math);
    showScreen('math-screen');
    loadMathQuestion();
  } else if (petKey === 'clock') {
    updateLevelTabs('clock-screen', state.level.clock);
    showScreen('clock-screen');
    loadClockQuestion();
  }
}

function changeLevel(petKey, lv) {
  playClickTick();
  state.level[petKey] = lv;
  state.questionIndex = 0;
  state.score = 0;
  selectPet(petKey, lv);
}

function updateLevelTabs(screenId, activeLv) {
  const container = document.getElementById(screenId);
  if (!container) return;
  const tabs = container.querySelectorAll('.level-tabs .lvl-tab');
  tabs.forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === activeLv);
  });
}

function updateProgressDots(prefix) {
  const container = document.getElementById(`${prefix}-dots`);
  if (!container) return;
  let html = '';
  for (let i = 0; i < state.totalQuestions; i++) {
    let cls = 'dot';
    if (i < state.questionIndex) cls += ' done';
    else if (i === state.questionIndex) cls += ' active';
    html += `<span class="${cls}"></span>`;
  }
  container.innerHTML = html;
}

function renderStickerWall() {
  const wall = document.getElementById('sticker-wall');
  const countEl = document.getElementById('sticker-count');
  const totalEl = document.getElementById('sticker-total');
  if (!wall || !SAVE_DATA) return;

  if (countEl) countEl.textContent = SAVE_DATA.unlockedStickers.length;
  if (totalEl) totalEl.textContent = STICKERS.length;

  wall.innerHTML = STICKERS.map((s, idx) => {
    const unlocked = SAVE_DATA.unlockedStickers.includes(idx);
    if (unlocked) {
      return `<div class="sticker-slot unlocked" title="${s.name}" onclick="speakSticker(${idx})">
        <span class="s-emoji">${s.emoji}</span>
        <span class="s-name">${s.name}</span>
      </div>`;
    }
    return `<div class="sticker-slot locked" title="再得 3 顆星即可解鎖">🔒</div>`;
  }).join('');
}

function speakSticker(idx) {
  const s = STICKERS[idx];
  if (!s) return;
  playClickTick();
  speakSequence([{ text: s.name, lang: 'zh-TW' }]);
}

// ============================================================================
// 🐶 Duncan 國小英文學院 (6~12歲 6大進階關卡)
// ============================================================================
function renderRocketUnitBar() {
  const bar = document.getElementById('rocket-unit-bar');
  if (!bar) return;
  bar.innerHTML = ROCKET_BOOK1_BANK.units
    .map(
      (u) => `<button class="lvl-tab ${state.rocketUnit === u.id ? 'active' : ''}"
        onclick="selectRocketUnit('${u.id}')">${u.title}</button>`
    )
    .join('');
}

function selectRocketUnit(unitId) {
  playClickTick();
  state.rocketUnit = unitId;
  state.questionIndex = 0;
  renderRocketUnitBar();
  loadEnglishQuestion();
}

function loadEnglishQuestion() {
  state.isAnswering = false;
  updateProgressDots('en');
  renderBadgesAndStreaks();

  const fb = document.getElementById('en-feedback');
  if (fb) {
    fb.textContent = '';
    fb.className = 'feedback-banner';
  }

  const lv = state.level.en;
  if (lv === 1) renderEnLv1ClueChallenge();
  else if (lv === 2) renderEnLv2ClozeAndOpposite();
  else if (lv === 3) renderEnLv3ScrambleAndSpell();
  else if (lv === 4) renderEnLv4GeometryBalloon();
  else if (lv === 5) renderEnLv5MemoryMatch12();
  else renderEnLv6ReadingAndGrammar();
}

// Lv.1 國小百大單字與英英定義謎題 (Word Detective)
function renderEnLv1ClueChallenge() {
  const stage = document.getElementById('en-stage');
  const grid = document.getElementById('en-options');
  const target = pickRandom(ENGLISH_BANK);
  const distractors = shuffle(ENGLISH_BANK.filter((w) => w.word !== target.word)).slice(0, 3);
  const options = shuffle([target, ...distractors]);

  state.currentQuestion = {
    answer: target.word,
    speech: [
      { text: 'Word Detective! Listen to the clue:', lang: 'en-US' },
      { text: target.clue, lang: 'en-US' },
      { text: `Which word means ${target.zh}?`, lang: 'zh-TW' },
    ],
  };

  document.getElementById('en-prompt').textContent =
    `${PET_CONFIG.en}：「請閱讀英文定義線索，找出正確的國小核心單字！」`;

  stage.innerHTML = `
    <div class="word-problem-card">
      <div class="wp-badge">🕵️ 英英定義解謎 (English Definition Clue)</div>
      <div class="wp-text">"${target.clue}"</div>
      <div style="margin-top:8px; font-weight:800; color:#4f46e5;">💡 中文提示：${target.emoji} ${target.zh}（字首：${target.letter}）</div>
    </div>
  `;

  grid.innerHTML = options
    .map(
      (opt) => `
      <button class="option-btn" onclick="checkEnglishOption(this, '${opt.word}', '${target.word}')">
        <span style="font-size:2rem;">${opt.emoji}</span>
        <span style="font-size:1.25rem; font-weight:900;">${opt.word}</span>
        <span style="font-size:0.9rem; color:#64748b;">${opt.zh}</span>
      </button>
    `
    )
    .join('');

  speakCurrentPrompt();
}

// Lv.2 克漏字填空與反義/同義詞挑戰
function renderEnLv2ClozeAndOpposite() {
  const stage = document.getElementById('en-stage');
  const grid = document.getElementById('en-options');

  const isOppositeMode = state.questionIndex % 2 === 1;
  if (isOppositeMode) {
    const item = pickRandom(EN_OPPOSITES_BANK);
    const opts = shuffle([item.ans, ...item.wrong]);
    state.currentQuestion = {
      answer: item.ans,
      speech: [
        { text: `Find the ${item.rel.includes('Opposite') ? 'opposite' : 'synonym'} of`, lang: 'en-US' },
        { text: item.base.split(' ')[0], lang: 'en-US' },
      ],
    };
    document.getElementById('en-prompt').textContent =
      `${PET_CONFIG.en}：「請找出下列單字的【${item.rel}】！」`;

    stage.innerHTML = `
      <div class="word-problem-card">
        <div class="wp-badge">🔄 國小必考字彙關係 (${item.rel})</div>
        <div class="wp-text" style="font-size:1.5rem; text-align:center;">
          <strong>${item.base}</strong> ➔ <span style="color:#ec4899; border-bottom:3px dashed #ec4899; padding:0 12px;">?</span>
        </div>
      </div>
    `;
    grid.innerHTML = opts
      .map(
        (w) => `
        <button class="option-btn" onclick="checkEnglishOption(this, '${w}', '${item.ans}')">
          <span style="font-size:1.35rem; font-weight:900;">${w}</span>
        </button>
      `
      )
      .join('');
  } else {
    // 進階克漏字拼字填空 (挖空2~3個母音/子音字母)
    const target = pickRandom(ENGLISH_BANK);
    const word = target.word;
    const midIdx = Math.max(1, Math.floor(word.length / 2) - 1);
    const missingPart = word.slice(midIdx, midIdx + 2);
    const maskedWord = word.slice(0, midIdx) + '__' + word.slice(midIdx + 2);

    const pool = ['ea', 'ou', 'ar', 'er', 'in', 'on', 'at', 'or', 'an', 'el', 'ic', 'ol', 'ur', 'il'];
    const distractors = shuffle(pool.filter((p) => p !== missingPart.toLowerCase())).slice(0, 3);
    const opts = shuffle([missingPart, ...distractors]);

    state.currentQuestion = {
      answer: missingPart,
      speech: [
        { text: target.word, lang: 'en-US' },
        { text: target.clue, lang: 'en-US' },
      ],
    };
    document.getElementById('en-prompt').textContent =
      `${PET_CONFIG.en}：「聽發音，選出正確的字母組合完成單字！」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">🔤 自然發音雙字母填空 (Phonics Cloze)</div>
        <div style="font-size:3.2rem; margin:6px 0;">${target.emoji}</div>
        <div style="font-size:2rem; font-weight:900; letter-spacing:3px; color:#1e293b;">${maskedWord}</div>
        <div style="font-size:1rem; color:#475569; margin-top:4px;">${target.zh} — "${target.clue}"</div>
      </div>
    `;
    grid.innerHTML = opts
      .map(
        (part) => `
        <button class="option-btn" onclick="checkEnglishOption(this, '${part}', '${missingPart}')">
          <span style="font-size:1.6rem; font-weight:900; color:#4f46e5;">${part}</span>
        </button>
      `
      )
      .join('');
  }
  speakCurrentPrompt();
}

// Lv.3 英文句子重組與長單字拼寫
function renderEnLv3ScrambleAndSpell() {
  const stage = document.getElementById('en-stage');
  const grid = document.getElementById('en-options');
  grid.innerHTML = '';

  const item = pickRandom(EN_SENTENCE_SCRAMBLE_BANK);
  const fullSentence = item.words.join(' ');
  const shuffledWords = shuffle(item.words.map((w, i) => ({ w, id: i })));

  state.currentQuestion = {
    targetWords: item.words,
    pickedWords: [],
    shuffledPool: shuffledWords,
    speech: [
      { text: fullSentence, lang: 'en-US' },
      { text: item.zh, lang: 'zh-TW' },
    ],
  };

  document.getElementById('en-prompt').textContent =
    `${PET_CONFIG.en}：「請依正確英文文法順序，點擊單字卡重組完整句子！」`;

  renderScrambleUI(item.zh);
  speakCurrentPrompt();
}

function renderScrambleUI(zhHint) {
  const stage = document.getElementById('en-stage');
  const q = state.currentQuestion;
  const pickedHtml = q.targetWords
    .map((_, idx) => {
      const picked = q.pickedWords[idx];
      if (picked) {
        return `<span class="spell-slot filled" style="width:auto; padding:6px 12px; font-size:1.1rem;">${picked.w}</span>`;
      }
      return `<span class="spell-slot" style="width:48px; font-size:1rem;">${idx + 1}</span>`;
    })
    .join('');

  const poolHtml = q.shuffledPool
    .map((token) => {
      const used = q.pickedWords.some((p) => p.id === token.id);
      return `<button class="letter-tile ${used ? 'used' : ''}"
        style="width:auto; padding:10px 16px; font-size:1.15rem;"
        ${used ? 'disabled' : ''}
        onclick="pickScrambleWord(${token.id})">${token.w}</button>`;
    })
    .join('');

  stage.innerHTML = `
    <div class="word-problem-card" style="text-align:center;">
      <div class="wp-badge">✍️ 國小英文句型重組 (Sentence Scramble)</div>
      <div class="wp-text" style="font-size:1.25rem; margin-bottom:10px;">中文句意：<strong>${zhHint}</strong></div>
      <div class="spell-slots-row" style="flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:14px;">
        ${pickedHtml}
      </div>
      <div class="letter-tiles-row" style="flex-wrap:wrap; gap:10px; justify-content:center;">
        ${poolHtml}
      </div>
      <div style="margin-top:12px;">
        <button class="secondary-pill-btn" onclick="resetScrambleWords()">🔄 重新排列</button>
      </div>
    </div>
  `;
}

function pickScrambleWord(tokenId) {
  if (state.isAnswering) return;
  playClickTick();
  const q = state.currentQuestion;
  const token = q.shuffledPool.find((t) => t.id === tokenId);
  if (!token) return;

  const expectedWord = q.targetWords[q.pickedWords.length];
  if (token.w.toLowerCase() === expectedWord.toLowerCase()) {
    q.pickedWords.push(token);
    speakSequence([{ text: token.w, lang: 'en-US' }]);
    const zhHint = q.speech[1] ? q.speech[1].text : '';
    renderScrambleUI(zhHint);

    if (q.pickedWords.length === q.targetWords.length) {
      handleCorrectAnswer('en', q.targetWords.join(' '), [
        { text: 'Awesome! ' + q.targetWords.join(' '), lang: 'en-US' },
      ]);
    }
  } else {
    handleWrongAnswer('en', `下一個單字不是 "${token.w}" 喔，再聽一次句子順序！`);
  }
}

function resetScrambleWords() {
  if (state.isAnswering || !state.currentQuestion) return;
  playClickTick();
  state.currentQuestion.pickedWords = [];
  renderScrambleUI(state.currentQuestion.speech[1].text);
}

// Lv.4 幾何圖形與色彩英文任務 (Geometry & Color Balloons)
function renderEnLv4GeometryBalloon() {
  const stage = document.getElementById('en-stage');
  const grid = document.getElementById('en-options');
  grid.innerHTML = '';

  const targetColor = pickRandom(EN_COLORS);
  const targetShape = pickRandom(EN_SHAPES);
  const targetKey = `${targetColor.shortEn}-${targetShape.id}`;

  const combos = [{ color: targetColor, shape: targetShape, key: targetKey }];
  while (combos.length < 6) {
    const c = pickRandom(EN_COLORS);
    const s = pickRandom(EN_SHAPES);
    const k = `${c.shortEn}-${s.id}`;
    if (!combos.some((item) => item.key === k)) {
      combos.push({ color: c, shape: s, key: k });
    }
  }
  const shuffledCombos = shuffle(combos);

  state.currentQuestion = {
    answer: targetKey,
    speech: [
      { text: `Pop the ${targetColor.en} ${targetShape.en}!`, lang: 'en-US' },
      { text: `Hint: ${targetShape.en} is ${targetShape.clue}.`, lang: 'en-US' },
    ],
  };

  document.getElementById('en-prompt').textContent =
    `${PET_CONFIG.en}：「請找出【${targetColor.en} ${targetShape.en}】（${targetShape.clue}）！」`;

  stage.innerHTML = `
    <div style="width:100%;">
      <div class="word-problem-card" style="margin-bottom:12px; text-align:center;">
        <div class="wp-badge">🎈 國小幾何多邊形與色彩指令</div>
        <div class="wp-text">Target: <strong>${targetColor.en} ${targetShape.en}</strong> (${targetColor.zh}${targetShape.zh})</div>
        <div style="font-size:0.9rem; color:#64748b;">Clue: A ${targetShape.en.toLowerCase()} is ${targetShape.clue}.</div>
      </div>
      <div class="balloon-stage-grid">
        ${shuffledCombos
          .map(
            (item) => `
          <button class="balloon-card" style="background:${item.color.bg}; border-color:${item.color.border};"
            onclick="checkBalloonPop(this, '${item.key}', '${targetKey}', '${item.color.en} ${item.shape.en}')">
            <div class="balloon-svg-wrap">${getPolygonSvg(item.shape.id, item.color.fill)}</div>
            <div class="balloon-label">${item.color.shortEn} ${item.shape.en}</div>
          </button>
        `
          )
          .join('')}
      </div>
    </div>
  `;
  speakCurrentPrompt();
}

function getPolygonSvg(shapeId, fill) {
  let shapeMarkup = '';
  if (shapeId === 'pentagon') {
    shapeMarkup = `<polygon points="50,8 92,38 76,88 24,88 8,38" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'hexagon') {
    shapeMarkup = `<polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'octagon') {
    shapeMarkup = `<polygon points="32,8 68,8 92,32 92,68 68,92 32,92 8,68 8,32" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'rectangle') {
    shapeMarkup = `<rect x="10" y="24" width="80" height="52" rx="6" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'triangle') {
    shapeMarkup = `<polygon points="50,10 90,86 10,86" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else {
    shapeMarkup = `<polygon points="50,8 88,50 50,92 12,50" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  }
  return `<svg viewBox="0 0 100 100" width="68" height="68">${shapeMarkup}</svg>`;
}

function checkBalloonPop(btn, chosenKey, targetKey, spokenLabel) {
  if (state.isAnswering) return;
  if (chosenKey === targetKey) {
    btn.classList.add('correct');
    handleCorrectAnswer('en', spokenLabel, [{ text: `Great job! ${spokenLabel}!`, lang: 'en-US' }]);
  } else {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 500);
    handleWrongAnswer('en', `這顆是 ${spokenLabel}，再仔細數數看邊數與顏色喔！`);
  }
}

// Lv.5 12張進階英文單字與中文釋義記憶翻牌 (6對)
function renderEnLv5MemoryMatch12() {
  const stage = document.getElementById('en-stage');
  const grid = document.getElementById('en-options');
  grid.innerHTML = '';

  const chosenWords = shuffle(ENGLISH_BANK).slice(0, 6);
  const deck = [];
  chosenWords.forEach((item) => {
    deck.push({
      pairId: item.word,
      type: 'en',
      displayTop: '🔤 English',
      displayMain: item.word,
      displaySub: `(${item.letter}...)`,
      word: item.word,
    });
    deck.push({
      pairId: item.word,
      type: 'zh',
      displayTop: item.emoji,
      displayMain: item.zh,
      displaySub: '中文意義',
      word: item.word,
    });
  });

  const shuffledDeck = shuffle(deck);
  state.currentQuestion = {
    deck: shuffledDeck,
    flippedIndices: [],
    matchedPairs: 0,
    totalPairs: 6,
    lockFlip: false,
    speech: [{ text: 'Match the English word card with its Chinese meaning card!', lang: 'en-US' }],
  };

  document.getElementById('en-prompt').textContent =
    `${PET_CONFIG.en}：「12 張記憶大考驗！請翻開配對【英文單字卡】與對應的【中文意義卡】！」`;

  stage.innerHTML = `
    <div class="memory-grid-12" id="memory-board-12">
      ${shuffledDeck
        .map(
          (card, idx) => `
        <div class="memory-card" id="mem-card-${idx}" onclick="flipMemoryCard12(${idx})">
          <div class="memory-card-inner">
            <div class="memory-face memory-front">🐾</div>
            <div class="memory-face memory-back">
              <span style="font-size:1.3rem;">${card.displayTop}</span>
              <strong style="font-size:0.95rem; color:#1e293b; word-break:break-word;">${card.displayMain}</strong>
            </div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
  speakCurrentPrompt();
}

function flipMemoryCard12(idx) {
  if (state.isAnswering) return;
  const q = state.currentQuestion;
  if (!q || q.lockFlip) return;
  if (q.flippedIndices.includes(idx)) return;

  const cardEl = document.getElementById(`mem-card-${idx}`);
  if (!cardEl || cardEl.classList.contains('matched')) return;

  playClickTick();
  cardEl.classList.add('flipped');
  const cardData = q.deck[idx];
  speakSequence([{ text: cardData.word, lang: 'en-US' }]);

  q.flippedIndices.push(idx);
  if (q.flippedIndices.length === 2) {
    q.lockFlip = true;
    const [i1, i2] = q.flippedIndices;
    const c1 = q.deck[i1];
    const c2 = q.deck[i2];

    if (c1.pairId === c2.pairId && c1.type !== c2.type) {
      setTimeout(() => {
        document.getElementById(`mem-card-${i1}`)?.classList.add('matched');
        document.getElementById(`mem-card-${i2}`)?.classList.add('matched');
        q.flippedIndices = [];
        q.lockFlip = false;
        q.matchedPairs++;
        playSuccessJingle();
        if (q.matchedPairs >= q.totalPairs) {
          handleCorrectAnswer('en', '6組單字全數配對成功！', [
            { text: 'Fantastic memory! You matched all six pairs!', lang: 'en-US' },
          ]);
        }
      }, 450);
    } else {
      setTimeout(() => {
        document.getElementById(`mem-card-${i1}`)?.classList.remove('flipped');
        document.getElementById(`mem-card-${i2}`)?.classList.remove('flipped');
        q.flippedIndices = [];
        q.lockFlip = false;
      }, 950);
    }
  }
}

// Lv.6 Rocket Girl 國小閱讀理解與文法選擇
function renderEnLv6ReadingAndGrammar() {
  const stage = document.getElementById('en-stage');
  const grid = document.getElementById('en-options');

  let pool = ROCKET_BOOK1_BANK.readingQuizzes;
  if (state.rocketUnit !== 'all') {
    const filtered = pool.filter((q) => q.unit === state.rocketUnit);
    if (filtered.length > 0) pool = filtered;
  }

  const quiz = pickRandom(pool);
  const options = shuffle([quiz.ans, ...quiz.wrong]);

  state.currentQuestion = {
    answer: quiz.ans,
    speech: [
      { text: quiz.passage.replace('______', 'blank'), lang: 'en-US' },
      { text: quiz.question, lang: quiz.question.match(/[a-zA-Z]/) ? 'en-US' : 'zh-TW' },
    ],
  };

  document.getElementById('en-prompt').textContent =
    `${PET_CONFIG.en}：「請仔細閱讀短文，回答下列閱讀理解或文法問題！」`;

  stage.innerHTML = `
    <div class="word-problem-card">
      <div class="wp-badge">${quiz.badge}</div>
      <div class="wp-text" style="background:#f8fafc; padding:12px; border-radius:12px; border:1px solid #cbd5e1;">
        "${quiz.passage}"
      </div>
      <div style="margin-top:10px; font-size:1.15rem; font-weight:900; color:#4f46e5;">
        ❓ Question: ${quiz.question}
      </div>
    </div>
  `;

  grid.innerHTML = options
    .map(
      (opt) => `
      <button class="option-btn" style="padding:14px;" onclick="checkEnglishOption(this, '${opt.replace(/'/g, "\\'")}', '${quiz.ans.replace(/'/g, "\\'")}')">
        <span style="font-size:1.1rem; font-weight:800;">${opt}</span>
      </button>
    `
    )
    .join('');

  speakCurrentPrompt();
}

function checkEnglishOption(btn, chosen, correct) {
  if (state.isAnswering) return;
  if (chosen === correct) {
    btn.classList.add('correct');
    handleCorrectAnswer('en', correct, [{ text: correct, lang: 'en-US' }]);
  } else {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 500);
    handleWrongAnswer('en', '答案不太對喔，再讀一次題目線索試試看！');
  }
}


// ============================================================================
// 🐱 Corie 國小數理學院 (6~12歲 6大進階關卡)
// ============================================================================
function loadMathQuestion() {
  state.isAnswering = false;
  updateProgressDots('math');
  renderBadgesAndStreaks();

  const fb = document.getElementById('math-feedback');
  if (fb) {
    fb.textContent = '';
    fb.className = 'feedback-banner';
  }

  const lv = state.level.math;
  if (lv === 1) renderMathLv1MultiDigit();
  else if (lv === 2) renderMathLv2MultDivCompare();
  else if (lv === 3) renderMathLv3EquationAndWordProblem();
  else if (lv === 4) renderMathLv4CashierPro();
  else if (lv === 5) renderMathLv5OlympiadSequence();
  else renderMathLv6FractionAndGeometry();
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

// Lv.1 二～三位數進位加法與退位減法
function renderMathLv1MultiDigit() {
  const stage = document.getElementById('math-stage');
  const grid = document.getElementById('math-options');

  const isAdd = Math.random() < 0.55;
  let a, b, ans, op;
  if (isAdd) {
    a = randInt(35, 240);
    b = randInt(28, 185);
    ans = a + b;
    op = '+';
  } else {
    a = randInt(85, 320);
    b = randInt(27, a - 15);
    ans = a - b;
    op = '−';
  }

  const opts = makeNumericDistractors(ans, 3, [1, 12]);
  const item = pickRandom(MATH_ITEMS);

  state.currentQuestion = {
    answer: ans,
    speech: [
      {
        text: `請計算：${a} ${isAdd ? '加' : '減'} ${b} 等於多少？`,
        lang: 'zh-TW',
      },
    ],
  };

  document.getElementById('math-prompt').textContent =
    `${PET_CONFIG.math}：「多位數進退位挑戰！先算個位、再算十位與百位喔！」`;

  const hA = Math.floor(a / 100);
  const tA = Math.floor((a % 100) / 10);
  const uA = a % 10;

  stage.innerHTML = `
    <div class="word-problem-card" style="text-align:center;">
      <div class="wp-badge">🧮 國小二～三位數進退位心算</div>
      <div style="font-size:2.4rem; font-weight:900; color:#1e293b; margin:8px 0;">
        ${a} <span style="color:#f59e0b;">${op}</span> ${b} ＝ <span style="color:#ec4899;">?</span>
      </div>
      <div style="font-size:0.95rem; color:#475569;">
        ${item.emoji} 位值分解提示：${a} ＝ ${hA > 0 ? hA + '個百 + ' : ''}${tA}個十 + ${uA}個一
      </div>
    </div>
  `;

  grid.innerHTML = opts
    .map(
      (n) => `
      <button class="option-btn" onclick="checkMathOption(this, ${n}, ${ans})">
        <span style="font-size:1.8rem; font-weight:900;">${n}</span>
      </button>
    `
    )
    .join('');

  speakCurrentPrompt();
}

// Lv.2 九九乘法、整除除法與算式比大小
function renderMathLv2MultDivCompare() {
  const stage = document.getElementById('math-stage');
  const grid = document.getElementById('math-options');

  const mode = state.questionIndex % 3; // 0: 乘法, 1: 除法, 2: 算式比大小
  if (mode === 0) {
    const a = randInt(3, 12);
    const b = randInt(3, 9);
    const ans = a * b;
    const opts = makeNumericDistractors(ans, 3, [2, 9]);
    state.currentQuestion = {
      answer: ans,
      speech: [{ text: `請問 ${a} 乘以 ${b} 等於多少？`, lang: 'zh-TW' }],
    };
    document.getElementById('math-prompt').textContent =
      `${PET_CONFIG.math}：「乘法達人挑戰！算算看總共是多少？」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">✖️ 國小乘法進階挑戰 (Multiplication)</div>
        <div style="font-size:2.5rem; font-weight:900; margin:10px 0;">
          ${a} × ${b} ＝ <span style="color:#ec4899;">?</span>
        </div>
        <div style="font-size:0.95rem; color:#64748b;">💡 提示：每組有 ${a} 個，共有 ${b} 組</div>
      </div>
    `;
    grid.innerHTML = opts
      .map(
        (n) => `
        <button class="option-btn" onclick="checkMathOption(this, ${n}, ${ans})">
          <span style="font-size:1.8rem; font-weight:900;">${n}</span>
        </button>
      `
      )
      .join('');
  } else if (mode === 1) {
    const divisor = randInt(3, 9);
    const quotient = randInt(4, 12);
    const dividend = divisor * quotient;
    const opts = makeNumericDistractors(quotient, 3, [1, 4]);
    state.currentQuestion = {
      answer: quotient,
      speech: [{ text: `請問 ${dividend} 除以 ${divisor} 等於多少？`, lang: 'zh-TW' }],
    };
    document.getElementById('math-prompt').textContent =
      `${PET_CONFIG.math}：「整除除法挑戰！平分成 ${divisor} 組，每組有幾個？」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">➗ 國小除法運算 (Division)</div>
        <div style="font-size:2.5rem; font-weight:900; margin:10px 0;">
          ${dividend} ÷ ${divisor} ＝ <span style="color:#ec4899;">?</span>
        </div>
        <div style="font-size:0.95rem; color:#64748b;">💡 驗算思考：${divisor} × (?) ＝ ${dividend}</div>
      </div>
    `;
    grid.innerHTML = opts
      .map(
        (n) => `
        <button class="option-btn" onclick="checkMathOption(this, ${n}, ${quotient})">
          <span style="font-size:1.8rem; font-weight:900;">${n}</span>
        </button>
      `
      )
      .join('');
  } else {
    // 雙邊算式比大小
    const a1 = randInt(4, 9), b1 = randInt(4, 9);
    const leftVal = a1 * b1;
    const a2 = randInt(15, 45), b2 = randInt(10, 35);
    const rightVal = a2 + b2;
    const correctSym = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '=';

    state.currentQuestion = {
      answer: correctSym,
      speech: [
        {
          text: `請比較左邊算式 ${a1} 乘以 ${b1}，和右邊算式 ${a2} 加 ${b2}，哪一邊比較大？`,
          lang: 'zh-TW',
        },
      ],
    };
    document.getElementById('math-prompt').textContent =
      `${PET_CONFIG.math}：「先算出左右兩個算式的答案，再選出正確的比較符號！」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">⚖️ 雙算式比大小挑戰</div>
        <div style="display:flex; align-items:center; justify-content:center; gap:14px; font-size:1.9rem; font-weight:900; margin:12px 0;">
          <span style="background:#eef2ff; padding:8px 14px; border-radius:12px;">${a1} × ${b1}</span>
          <span style="color:#ec4899; border:3px dashed #ec4899; border-radius:12px; padding:4px 14px;">?</span>
          <span style="background:#fef3c7; padding:8px 14px; border-radius:12px;">${a2} + ${b2}</span>
        </div>
      </div>
    `;
    grid.innerHTML = ['>', '=', '<']
      .map(
        (sym) => `
        <button class="option-btn" onclick="checkMathOption(this, '${sym}', '${correctSym}')">
          <span style="font-size:2.2rem; font-weight:900;">${sym}</span>
        </button>
      `
      )
      .join('');
  }
  speakCurrentPrompt();
}

// Lv.3 四則混合運算、未知數方程式與生活應用題
function renderMathLv3EquationAndWordProblem() {
  const stage = document.getElementById('math-stage');
  const grid = document.getElementById('math-options');

  const mode = state.questionIndex % 3;
  if (mode === 0) {
    // 先乘除後加減： A + B × C
    const a = randInt(12, 35);
    const b = randInt(3, 8);
    const c = randInt(4, 9);
    const ans = a + b * c;
    const opts = makeNumericDistractors(ans, 3, [2, 10]);

    state.currentQuestion = {
      answer: ans,
      speech: [{ text: `四則運算規則：先乘除後加減。請問 ${a} 加 ${b} 乘以 ${c} 等於多少？`, lang: 'zh-TW' }],
    };
    document.getElementById('math-prompt').textContent =
      `${PET_CONFIG.math}：「注意四則運算黃金法則：【先乘除、後加減】！」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">📐 四則運算（先乘除後加減）</div>
        <div style="font-size:2.3rem; font-weight:900; margin:10px 0;">
          ${a} ＋ ${b} × ${c} ＝ <span style="color:#ec4899;">?</span>
        </div>
        <div style="font-size:0.95rem; color:#4f46e5; font-weight:700;">💡 先算 ${b} × ${c}，再加上 ${a} 喔！</div>
      </div>
    `;
    grid.innerHTML = opts
      .map((n) => `<button class="option-btn" onclick="checkMathOption(this, ${n}, ${ans})"><span style="font-size:1.8rem; font-weight:900;">${n}</span></button>`)
      .join('');
  } else if (mode === 1) {
    // 未知數方程式： A × [?] + B = C
    const a = randInt(3, 8);
    const x = randInt(4, 11);
    const b = randInt(5, 20);
    const c = a * x + b;
    const opts = makeNumericDistractors(x, 3, [1, 4]);

    state.currentQuestion = {
      answer: x,
      speech: [{ text: `未知數推理：${a} 乘以多少，再加上 ${b} 會等於 ${c}？`, lang: 'zh-TW' }],
    };
    document.getElementById('math-prompt').textContent =
      `${PET_CONFIG.math}：「小小代數偵探！請推理出問號格子裡的數字！」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">🕵️ 未知數方程式逆推 (Algebra Detective)</div>
        <div style="font-size:2.2rem; font-weight:900; margin:10px 0;">
          ${a} × <span style="display:inline-block; padding:2px 14px; border:3px dashed #ec4899; border-radius:10px; color:#ec4899;">?</span> ＋ ${b} ＝ ${c}
        </div>
        <div style="font-size:0.95rem; color:#64748b;">💡 提示：先算出 ${c} − ${b}，再除以 ${a}！</div>
      </div>
    `;
    grid.innerHTML = opts
      .map((n) => `<button class="option-btn" onclick="checkMathOption(this, ${n}, ${x})"><span style="font-size:1.8rem; font-weight:900;">${n}</span></button>`)
      .join('');
  } else {
    // 國小兩步驟文字應用題
    const item = pickRandom(MATH_ITEMS);
    const price = randInt(12, 25);
    const qty = randInt(3, 6);
    const paid = 200;
    const ans = paid - price * qty;
    const opts = makeNumericDistractors(ans, 3, [5, 15]);

    const story = `小明去文具美食百貨買了 ${qty} ${item.unit}${item.name}（${item.emoji}），每${item.unit}售價 ${price} 元。他付了一張 ${paid} 元鈔票，請問老闆應該找他多少元？`;
    state.currentQuestion = {
      answer: ans,
      speech: [{ text: story, lang: 'zh-TW' }],
    };
    document.getElementById('math-prompt').textContent =
      `${PET_CONFIG.math}：「請閱讀生活應用題，列式算出正確答案！」`;

    stage.innerHTML = `
      <div class="word-problem-card">
        <div class="wp-badge">📖 國小兩步驟文字應用題</div>
        <div class="wp-text">${story}</div>
        <div style="margin-top:8px; font-size:0.92rem; color:#4f46e5; font-weight:800;">
          💡 解題步驟：① 先算總價 ${price} × ${qty} ② 再用 ${paid} 減去總價
        </div>
      </div>
    `;
    grid.innerHTML = opts
      .map((n) => `<button class="option-btn" onclick="checkMathOption(this, ${n}, ${ans})"><span style="font-size:1.7rem; font-weight:900;">${n} 元</span></button>`)
      .join('');
  }
  speakCurrentPrompt();
}

// Lv.4 🛒 百元鈔票收銀台 ($100 / $50 / $10 / $5 / $1 湊錢與找零)
function renderMathLv4CashierPro() {
  const stage = document.getElementById('math-stage');
  const grid = document.getElementById('math-options');
  grid.innerHTML = '';

  const i1 = pickRandom(MATH_ITEMS);
  const i2 = pickRandom(MATH_ITEMS.filter((x) => x.name !== i1.name));
  const p1 = randInt(25, 89);
  const p2 = randInt(18, 75);
  const qty1 = randInt(1, 2);
  const totalCost = p1 * qty1 + p2;

  const isChangeMode = state.questionIndex % 2 === 1;
  let targetAmount = totalCost;
  let modeTitle = '請拿出剛好足夠支付總金額的鈔票與硬幣';
  let customerPaid = 0;

  if (isChangeMode) {
    customerPaid = Math.ceil((totalCost + 15) / 50) * 50;
    targetAmount = customerPaid - totalCost;
    modeTitle = `客人付了 $${customerPaid}，請湊出正確的【找零金額】放到托盤！`;
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
    modeTitle,
    speech: [
      {
        text: isChangeMode
          ? `商品總共 ${totalCost} 元，客人付了 ${customerPaid} 元，請算出要找客人多少錢並放上收銀盤！`
          : `買了 ${qty1} ${i1.unit}${i1.name}和 1 ${i2.unit}${i2.name}，請算出總價並拿出正確的鈔票硬幣！`,
        lang: 'zh-TW',
      },
    ],
  };

  document.getElementById('math-prompt').textContent = `${PET_CONFIG.math}：「${modeTitle}」`;
  renderCashierProUI();
  speakCurrentPrompt();
}

function renderCashierProUI() {
  const stage = document.getElementById('math-stage');
  const q = state.currentQuestion;
  const currentSum = q.trayCoins.reduce((a, b) => a + b, 0);

  stage.innerHTML = `
    <div class="cashier-stage" style="width:100%;">
      <div class="word-problem-card" style="margin-bottom:10px;">
        <div class="wp-badge">🛒 超級收銀員：${q.isChangeMode ? '找零錢特訓' : '多件結帳特訓'}</div>
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

      <div class="cashier-tray">
        <div class="tray-header">
          <span>📥 收銀托盤（點擊托盤內錢幣可退回）</span>
          <span class="tray-total">目前合計：$${currentSum} 元</span>
        </div>
        <div class="tray-coins-area">
          ${
            q.trayCoins.length === 0
              ? '<span style="color:#94a3b8; font-weight:700;">請點擊下方鈔票或硬幣放入托盤...</span>'
              : q.trayCoins
                  .map(
                    (val, idx) =>
                      `<button class="${val === 100 ? 'bill-100-btn' : val === 50 ? 'coin-50-btn' : val === 10 ? 'coin-10-btn' : val === 5 ? 'coin-btn coin-5' : 'coin-btn coin-1'}"
                        style="transform:scale(0.88);"
                        onclick="removeCashierMoney(${idx})">$${val}</button>`
                  )
                  .join('')
          }
        </div>
      </div>

      <div class="cashier-wallet" style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:12px;">
        <button class="bill-100-btn" onclick="addCashierMoney(100)">💵 $100</button>
        <button class="coin-50-btn" onclick="addCashierMoney(50)">$50</button>
        <button class="coin-10-btn" onclick="addCashierMoney(10)">$10</button>
        <button class="coin-btn coin-5" onclick="addCashierMoney(5)">$5</button>
        <button class="coin-btn coin-1" onclick="addCashierMoney(1)">$1</button>
      </div>

      <div style="display:flex; justify-content:center; gap:12px; margin-top:12px;">
        <button class="secondary-pill-btn" onclick="clearCashierTray()">🗑️ 清空重湊</button>
        <button class="checkout-btn" onclick="submitCashierCheckout()">✅ 確認結帳 ($${currentSum})</button>
      </div>
    </div>
  `;
}

function addCashierMoney(val) {
  if (state.isAnswering || !state.currentQuestion) return;
  playClickTick();
  state.currentQuestion.trayCoins.push(val);
  renderCashierProUI();
}

function removeCashierMoney(idx) {
  if (state.isAnswering || !state.currentQuestion) return;
  playClickTick();
  state.currentQuestion.trayCoins.splice(idx, 1);
  renderCashierProUI();
}

function clearCashierTray() {
  if (state.isAnswering || !state.currentQuestion) return;
  playClickTick();
  state.currentQuestion.trayCoins = [];
  renderCashierProUI();
}

function submitCashierCheckout() {
  if (state.isAnswering || !state.currentQuestion) return;
  const q = state.currentQuestion;
  const sum = q.trayCoins.reduce((a, b) => a + b, 0);
  if (sum === q.targetAmount) {
    handleCorrectAnswer('math', `$${sum} 元`, [
      { text: `結帳正確！總共是 ${sum} 元！`, lang: 'zh-TW' },
    ]);
  } else {
    const diff = sum - q.targetAmount;
    handleWrongAnswer(
      'math',
      diff > 0
        ? `目前放了 $${sum} 元，太多了喔！請點擊托盤裡的錢幣退回一部分。`
        : `目前只有 $${sum} 元，還不夠喔！請再仔細算算看目標金額。`
    );
  }
}

// Lv.5 🚂 奧數數列與邏輯推理火車 (等差、倍數、平方數、費氏數列)
function renderMathLv5OlympiadSequence() {
  const stage = document.getElementById('math-stage');
  const grid = document.getElementById('math-options');

  const seqTypes = [
    () => {
      // 等差數列 (+6 ~ +15)
      const start = randInt(5, 25);
      const step = randInt(6, 14);
      const arr = [0, 1, 2, 3, 4].map((i) => start + i * step);
      return { arr, rule: `公差 +${step} 的等差數列`, stepHint: `每一節車廂都比前一節多 ${step}` };
    },
    () => {
      // 遞減等差數列 (-7 ~ -12)
      const step = randInt(7, 12);
      const start = randInt(65, 98);
      const arr = [0, 1, 2, 3, 4].map((i) => start - i * step);
      return { arr, rule: `公差 −${step} 的倒數數列`, stepHint: `每一節車廂都比前一節少 ${step}` };
    },
    () => {
      // 等比倍數數列 (×2)
      const start = randInt(2, 5);
      const arr = [start, start * 2, start * 4, start * 8, start * 16];
      return { arr, rule: '×2 等比倍數數列', stepHint: '後一個數字都是前一個數字的 2 倍（×2）' };
    },
    () => {
      // 完全平方數列
      const base = randInt(1, 4);
      const arr = [0, 1, 2, 3, 4].map((i) => (base + i) * (base + i));
      return { arr, rule: '平方數數列 (n × n)', stepHint: '分別是連續整數自己乘以自己的平方數' };
    },
    () => {
      // 費氏相加數列 (前兩項相加等於下一項)
      const a = randInt(1, 4);
      const b = randInt(2, 5);
      const c = a + b;
      const d = b + c;
      const e = c + d;
      return { arr: [a, b, c, d, e], rule: '費氏加法數列', stepHint: '前兩節車廂的數字加起來，剛好等於下一節車廂！' };
    },
  ];

  const chosen = pickRandom(seqTypes)();
  const missingIdx = randInt(3, 4);
  const ans = chosen.arr[missingIdx];
  const opts = makeNumericDistractors(ans, 3, [2, 9]);

  state.currentQuestion = {
    answer: ans,
    speech: [
      { text: `奧數邏輯火車！請觀察車廂數字規律，找出問號車廂的數字！提示：${chosen.stepHint}`, lang: 'zh-TW' },
    ],
  };

  document.getElementById('math-prompt').textContent =
    `${PET_CONFIG.math}：「觀察相鄰車廂的差或倍數，推理出問號車廂的數字！」`;

  const carsHtml = chosen.arr
    .map((num, idx) => {
      if (idx === missingIdx) {
        return `<div class="train-car missing"><span>?</span></div>`;
      }
      return `<div class="train-car"><span>${num}</span></div>`;
    })
    .join('<span class="train-link">🔗</span>');

  stage.innerHTML = `
    <div style="width:100%; text-align:center;">
      <div class="word-problem-card" style="margin-bottom:12px;">
        <div class="wp-badge">🚂 國小資優奧數數列推理</div>
        <div style="font-size:0.95rem; color:#4f46e5; font-weight:800;">💡 規律提示：${chosen.stepHint}</div>
      </div>
      <div class="train-track-wrap">
        <div class="train-engine">🚂</div>
        ${carsHtml}
      </div>
    </div>
  `;

  grid.innerHTML = opts
    .map(
      (n) => `
      <button class="option-btn" onclick="checkMathOption(this, ${n}, ${ans})">
        <span style="font-size:1.8rem; font-weight:900;">${n}</span>
      </button>
    `
    )
    .join('');

  speakCurrentPrompt();
}

// Lv.6 🍕 分數圖形認知與幾何周長面積計算
function renderMathLv6FractionAndGeometry() {
  const stage = document.getElementById('math-stage');
  const grid = document.getElementById('math-options');

  const isGeometry = state.questionIndex % 2 === 1;
  if (!isGeometry) {
    // 分數圓餅圖認知
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

    state.currentQuestion = {
      answer: target.label,
      speech: [
        {
          text: `披薩平分成 ${target.den} 等份，塗顏色的部分佔了 ${target.num} 份，請問用分數怎麼表示？`,
          lang: 'zh-TW',
        },
      ],
    };

    document.getElementById('math-prompt').textContent =
      `${PET_CONFIG.math}：「數數看圓餅圖總共平分成幾份（分母），塗色佔了幾份（分子）！」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">🍕 國小分數視覺圖形挑戰 (Fractions)</div>
        <div style="margin:10px auto;">${buildFractionPieSvg(target.num, target.den)}</div>
        <div style="font-size:1rem; font-weight:800; color:#475569;">
          全部平分成 <strong>${target.den}</strong> 等份，塗色部分有 <strong>${target.num}</strong> 份
        </div>
      </div>
    `;

    grid.innerHTML = opts
      .map(
        (o) => `
        <button class="option-btn" onclick="checkMathOption(this, '${o.label}', '${target.label}')">
          <span style="font-size:1.35rem; font-weight:900;">${o.label}</span>
        </button>
      `
      )
      .join('');
  } else {
    // 長方形周長與面積計算
    const w = randInt(5, 14);
    const h = randInt(3, 9);
    const askArea = Math.random() < 0.5;
    const ans = askArea ? w * h : (w + h) * 2;
    const unitLabel = askArea ? '平方公分 (cm²)' : '公分 (cm)';
    const formulaHint = askArea
      ? '長方形面積公式 ＝ 長 × 寬'
      : '長方形周長公式 ＝ (長 ＋ 寬) × 2';

    const opts = makeNumericDistractors(ans, 3, [2, 10]);

    state.currentQuestion = {
      answer: ans,
      speech: [
        {
          text: `有一個長方形，長是 ${w} 公分，寬是 ${h} 公分，請問它的${askArea ? '面積' : '周長'}是多少？`,
          lang: 'zh-TW',
        },
      ],
    };

    document.getElementById('math-prompt').textContent =
      `${PET_CONFIG.math}：「請計算這個長方形的【${askArea ? '面積 (Area)' : '周長 (Perimeter)'}】！」`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">📐 國小幾何圖形：長方形${askArea ? '面積' : '周長'}</div>
        <div class="geometry-rect-box">
          長 ${w} cm × 寬 ${h} cm
        </div>
        <div style="font-size:0.95rem; font-weight:800; color:#4f46e5;">💡 ${formulaHint}</div>
      </div>
    `;

    grid.innerHTML = opts
      .map(
        (n) => `
        <button class="option-btn" onclick="checkMathOption(this, ${n}, ${ans})">
          <span style="font-size:1.45rem; font-weight:900;">${n} ${unitLabel}</span>
        </button>
      `
      )
      .join('');
  }
  speakCurrentPrompt();
}

function buildFractionPieSvg(num, den) {
  const cx = 70, cy = 70, r = 58;
  let paths = '';
  for (let i = 0; i < den; i++) {
    const startAngle = (i * 2 * Math.PI) / den - Math.PI / 2;
    const endAngle = ((i + 1) * 2 * Math.PI) / den - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const fill = i < num ? '#f97316' : '#f1f5f9';
    paths += `<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z"
      fill="${fill}" stroke="#334155" stroke-width="2.5"/>`;
  }
  return `<svg viewBox="0 0 140 140" width="135" height="135">${paths}</svg>`;
}

function checkMathOption(btn, chosen, correct) {
  if (state.isAnswering) return;
  if (String(chosen) === String(correct)) {
    btn.classList.add('correct');
    handleCorrectAnswer('math', String(correct), [
      { text: `答對了！答案是 ${correct}`, lang: 'zh-TW' },
    ]);
  } else {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 500);
    handleWrongAnswer('math', '算式結果不太對喔，再檢查一次計算步驟！');
  }
}

// ============================================================================
// 🐟 Shannon 國小時間與行程學院 (6~12歲 3大進階關卡)
// ============================================================================
function loadClockQuestion() {
  state.isAnswering = false;
  updateProgressDots('clock');
  renderBadgesAndStreaks();

  const fb = document.getElementById('clock-feedback');
  if (fb) {
    fb.textContent = '';
    fb.className = 'feedback-banner';
  }

  const lv = state.level.clock;
  if (lv === 1) renderClockLv1ExactMinute();
  else if (lv === 2) renderClockLv2ElapsedTime();
  else renderClockLv3InteractiveSet();
}

function formatClockTime(h, m) {
  return `${h}:${m < 10 ? '0' + m : m}`;
}

function buildClockSvg(hour, minute) {
  const h12 = hour % 12;
  const minAngle = minute * 6;
  const hourAngle = h12 * 30 + minute * 0.5;

  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6 * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const rOuter = 98;
    const rInner = isMajor ? 86 : 93;
    const x1 = 110 + rInner * Math.sin(angle);
    const y1 = 110 - rInner * Math.cos(angle);
    const x2 = 110 + rOuter * Math.sin(angle);
    const y2 = 110 - rOuter * Math.cos(angle);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      stroke="${isMajor ? '#1e293b' : '#94a3b8'}" stroke-width="${isMajor ? 3 : 1.4}" stroke-linecap="round"/>`;
  }

  let numbers = '';
  for (let n = 1; n <= 12; n++) {
    const angle = (n * 30 * Math.PI) / 180;
    const rNum = 72;
    const x = 110 + rNum * Math.sin(angle);
    const y = 110 - rNum * Math.cos(angle) + 6;
    numbers += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle"
      font-size="16" font-weight="900" fill="#1e293b">${n}</text>`;
  }

  return `
    <svg viewBox="0 0 220 220" class="clock-svg">
      <circle cx="110" cy="110" r="102" fill="#ffffff" stroke="#0ea5e9" stroke-width="8"/>
      ${ticks}
      ${numbers}
      <!-- 紅色短針 (時針) -->
      <line x1="110" y1="110" x2="110" y2="58"
        stroke="#ef4444" stroke-width="7" stroke-linecap="round"
        transform="rotate(${hourAngle} 110 110)"/>
      <!-- 藍色長針 (分針) -->
      <line x1="110" y1="110" x2="110" y2="34"
        stroke="#2563eb" stroke-width="4.5" stroke-linecap="round"
        transform="rotate(${minAngle} 110 110)"/>
      <circle cx="110" cy="110" r="6" fill="#0f172a"/>
    </svg>
  `;
}

// Lv.1 精準到「1分鐘」刻度讀時與 24小時制換算
function renderClockLv1ExactMinute() {
  const stage = document.getElementById('clock-stage');
  const grid = document.getElementById('clock-options');

  const is24HrMode = state.questionIndex % 2 === 1;
  const h12 = randInt(1, 11);
  const min = randInt(1, 58);
  const h24 = h12 + 12;

  const ansStr = is24HrMode
    ? `${h24}:${min < 10 ? '0' + min : min}`
    : formatClockTime(h12, min);

  const distractorTimes = new Set([ansStr]);
  const opts = [ansStr];
  while (opts.length < 4) {
    const dm = (min + pickRandom([-5, -2, -1, 1, 2, 5, 15, 30]) + 60) % 60;
    const dh = is24HrMode ? (Math.random() < 0.35 ? h12 : h24) : h12;
    const cand = `${dh}:${dm < 10 ? '0' + dm : dm}`;
    if (!distractorTimes.has(cand)) {
      distractorTimes.add(cand);
      opts.push(cand);
    }
  }

  state.currentQuestion = {
    answer: ansStr,
    speech: [
      {
        text: is24HrMode
          ? `請看時鐘上的細小分鐘刻度，如果是下午時刻，用 24 小時制表示是幾點幾分？`
          : `請仔細數一數藍色分針指在第幾小格，現在是幾點幾分？`,
        lang: 'zh-TW',
      },
    ],
  };

  document.getElementById('clock-prompt').textContent = is24HrMode
    ? `${PET_CONFIG.clock}：「現在是【下午 (PM)】，請換算成 24 小時制（小時 +12）並讀出精準分鐘！」`
    : `${PET_CONFIG.clock}：「請看紅短針與藍長針指的小刻度，選出精準到 1 分鐘的時刻！」`;

  stage.innerHTML = `
    <div style="text-align:center;">
      <div class="wp-badge" style="margin-bottom:8px;">
        ${is24HrMode ? '🌆 下午時刻 ➔ 24小時制換算' : '🔍 1分鐘細刻度精準判讀'}
      </div>
      ${buildClockSvg(h12, min)}
    </div>
  `;

  grid.innerHTML = shuffle(opts)
    .map(
      (t) => `
      <button class="option-btn" onclick="checkClockOption(this, '${t}', '${ansStr}')">
        <span style="font-size:1.75rem; font-weight:900;">${t}</span>
      </button>
    `
    )
    .join('');

  speakCurrentPrompt();
}

// Lv.2 經過時間與行程推算應用題 (Elapsed Time)
function renderClockLv2ElapsedTime() {
  const stage = document.getElementById('clock-stage');
  const grid = document.getElementById('clock-options');

  const startH = randInt(8, 16);
  const startM = pickRandom([5, 10, 15, 20, 25, 30, 35, 40, 45]);
  const duration = pickRandom([25, 35, 40, 45, 50, 55, 65, 75]);

  const totalEndMins = startH * 60 + startM + duration;
  const endH = Math.floor(totalEndMins / 60);
  const endM = totalEndMins % 60;
  const ansStr = formatClockTime(endH, endM);

  const scenarios = [
    `科博館太空劇場在 ${formatClockTime(startH, startM)} 開始播放，片長總共 ${duration} 分鐘，請問會在幾點幾分結束？`,
    `自強號火車在 ${formatClockTime(startH, startM)} 從車站發車，行駛了 ${duration} 分鐘後抵達終點站，請問抵達時刻是幾點幾分？`,
    `小華在 ${formatClockTime(startH, startM)} 開始練習小提琴與寫作業，共花了 ${duration} 分鐘完成，請問他幾點幾分寫完？`,
  ];
  const story = pickRandom(scenarios);

  const opts = [ansStr];
  const deltas = [-15, -10, -5, 5, 10, 15, 20];
  while (opts.length < 4) {
    const t = totalEndMins + pickRandom(deltas);
    const cand = formatClockTime(Math.floor(t / 60), ((t % 60) + 60) % 60);
    if (!opts.includes(cand)) opts.push(cand);
  }

  state.currentQuestion = {
    answer: ansStr,
    speech: [{ text: story, lang: 'zh-TW' }],
  };

  document.getElementById('clock-prompt').textContent =
    `${PET_CONFIG.clock}：「左邊是開始時刻，請推算經過 ${duration} 分鐘後的結束時刻！」`;

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:16px; width:100%;">
      <div style="text-align:center;">
        <div style="font-weight:800; color:#0284c7; margin-bottom:4px;">🕒 開始時刻：${formatClockTime(startH, startM)}</div>
        ${buildClockSvg(startH, startM)}
      </div>
      <div class="word-problem-card" style="max-width:340px;">
        <div class="wp-badge">⏳ 跨小時經過時間推算</div>
        <div class="wp-text">${story}</div>
        <div style="margin-top:8px; font-size:0.9rem; color:#0284c7; font-weight:800;">
          💡 提示：滿 60 分鐘要向小時進位 1 小時喔！
        </div>
      </div>
    </div>
  `;

  grid.innerHTML = shuffle(opts)
    .map(
      (t) => `
      <button class="option-btn" onclick="checkClockOption(this, '${t}', '${ansStr}')">
        <span style="font-size:1.75rem; font-weight:900;">${t}</span>
      </button>
    `
    )
    .join('');

  speakCurrentPrompt();
}

// Lv.3 親手撥針特訓 (支援 1分鐘與跨時推算調鬧鐘)
function renderClockLv3InteractiveSet() {
  const stage = document.getElementById('clock-stage');
  const grid = document.getElementById('clock-options');
  grid.innerHTML = '';

  const targetH = randInt(1, 12);
  const targetM = randInt(1, 59);
  const initH = (targetH + randInt(2, 6)) % 12 || 12;
  const initM = (targetM + randInt(12, 42)) % 60;

  state.currentQuestion = {
    targetH,
    targetM,
    userH: initH,
    userM: initM,
    speech: [
      {
        text: `請操作按鈕撥動指針，把時鐘精準調整到 ${targetH} 點 ${targetM} 分！`,
        lang: 'zh-TW',
      },
    ],
  };

  document.getElementById('clock-prompt').textContent =
    `${PET_CONFIG.clock}：「請點擊下方調時按鈕，將指針精準撥到【${formatClockTime(targetH, targetM)}】！」`;

  renderClockLv3UI();
  speakCurrentPrompt();
}

function renderClockLv3UI() {
  const stage = document.getElementById('clock-stage');
  const q = state.currentQuestion;
  stage.innerHTML = `
    <div style="text-align:center; width:100%;">
      <div class="word-problem-card" style="margin-bottom:10px; text-align:center;">
        <div class="wp-badge">🛠️ 精準 1 分鐘手動撥針任務</div>
        <div style="font-size:1.35rem; font-weight:900; color:#1e293b;">
          🎯 目標時刻：<span style="color:#e11d48; font-size:1.6rem;">${formatClockTime(q.targetH, q.targetM)}</span>
        </div>
      </div>
      ${buildClockSvg(q.userH, q.userM)}
      <div class="clock-adjust-controls" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:12px;">
        <button class="secondary-pill-btn" onclick="adjustClockHand(60)">🔴 時針 +1小時</button>
        <button class="secondary-pill-btn" onclick="adjustClockHand(-60)">🔴 時針 -1小時</button>
        <button class="secondary-pill-btn" onclick="adjustClockHand(5)">🔵 分針 +5分</button>
        <button class="secondary-pill-btn" onclick="adjustClockHand(-5)">🔵 分針 -5分</button>
        <button class="secondary-pill-btn" onclick="adjustClockHand(1)">✨ 分針 +1分</button>
        <button class="secondary-pill-btn" onclick="adjustClockHand(-1)">✨ 分針 -1分</button>
      </div>
      <div style="margin-top:12px;">
        <button class="checkout-btn" onclick="submitClockAdjust()">✅ 完成調時確認</button>
      </div>
    </div>
  `;
}

function adjustClockHand(deltaMins) {
  if (state.isAnswering || !state.currentQuestion) return;
  playClickTick();
  const q = state.currentQuestion;
  let total = (q.userH % 12) * 60 + q.userM + deltaMins;
  total = ((total % 720) + 720) % 720;
  q.userH = Math.floor(total / 60) || 12;
  q.userM = total % 60;
  renderClockLv3UI();
}

function submitClockAdjust() {
  if (state.isAnswering || !state.currentQuestion) return;
  const q = state.currentQuestion;
  if (q.userH % 12 === q.targetH % 12 && q.userM === q.targetM) {
    const label = formatClockTime(q.targetH, q.targetM);
    handleCorrectAnswer('clock', label, [
      { text: `太精準了！成功調到 ${q.targetH} 點 ${q.targetM} 分！`, lang: 'zh-TW' },
    ]);
  } else {
    handleWrongAnswer(
      'clock',
      `目前指針在 ${formatClockTime(q.userH, q.userM)}，目標是 ${formatClockTime(q.targetH, q.targetM)}，再微調一下分鐘刻度喔！`
    );
  }
}

function checkClockOption(btn, chosen, correct) {
  if (state.isAnswering) return;
  if (chosen === correct) {
    btn.classList.add('correct');
    handleCorrectAnswer('clock', correct, [
      { text: `答對了！時刻是 ${correct}`, lang: 'zh-TW' },
    ]);
  } else {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 500);
    handleWrongAnswer('clock', '時刻不太對喔，再仔細觀察時針與分針的位置！');
  }
}

// ============================================================================
// 🏆 統一答題回饋、連勝金幣加成與過關結算
// ============================================================================
function handleCorrectAnswer(petKey, answerText, customSpeech) {
  state.isAnswering = true;
  state.score++;
  playSuccessJingle();

  // 更新連勝與金幣獎勵
  SAVE_DATA.streaks[petKey] = (SAVE_DATA.streaks[petKey] || 0) + 1;
  SAVE_DATA.totalCorrect = (SAVE_DATA.totalCorrect || 0) + 1;
  const streakBonus = Math.min(10, SAVE_DATA.streaks[petKey] * 2);
  const coinsEarned = 10 + streakBonus;
  const expEarned = 12;

  SAVE_DATA.coins += coinsEarned;
  state.lastCoinsEarned += coinsEarned;
  state.lastExpEarned += expEarned;
  addPetExp(SAVE_DATA.activeCompanion, expEarned);
  saveProgress();
  renderBadgesAndStreaks();

  const fb = document.getElementById(`${petKey}-feedback`);
  if (fb) {
    fb.textContent = `🎉 答對了！(${answerText}) 🪙+${coinsEarned} 金幣 ｜ 🔥連對 ${SAVE_DATA.streaks[petKey]} 題！`;
    fb.className = 'feedback-banner success';
  }

  if (customSpeech) {
    speakSequence(customSpeech);
  }

  setTimeout(() => {
    state.questionIndex++;
    if (state.questionIndex >= state.totalQuestions) {
      finishGame(petKey);
    } else {
      if (petKey === 'en') loadEnglishQuestion();
      else if (petKey === 'math') loadMathQuestion();
      else if (petKey === 'clock') loadClockQuestion();
    }
  }, 1500);
}

function handleWrongAnswer(petKey, hintMsg) {
  playTryAgainSound();
  SAVE_DATA.streaks[petKey] = 0;
  saveProgress();
  renderBadgesAndStreaks();

  const fb = document.getElementById(`${petKey}-feedback`);
  if (fb) {
    fb.textContent = `💪 ${hintMsg}`;
    fb.className = 'feedback-banner error';
  }
  speakSequence([{ text: hintMsg, lang: 'zh-TW' }]);
}

function finishGame(petKey) {
  const lv = state.level[petKey];
  const clearKey = `${petKey}-${lv}`;
  SAVE_DATA.levelClears[clearKey] = (SAVE_DATA.levelClears[clearKey] || 0) + 1;

  // 過關額外加發 3 顆星與通關金幣紅包
  const starsEarned = 3;
  const clearBonusCoins = 25;
  SAVE_DATA.totalStars += starsEarned;
  SAVE_DATA.coins += clearBonusCoins;
  state.lastCoinsEarned += clearBonusCoins;

  // 解鎖新貼紙
  let unlockedStickerObj = null;
  if (SAVE_DATA.unlockedStickers.length < STICKERS.length) {
    const nextIdx = SAVE_DATA.unlockedStickers.length;
    SAVE_DATA.unlockedStickers.push(nextIdx);
    unlockedStickerObj = STICKERS[nextIdx];
  }

  saveProgress();
  renderBadgesAndStreaks();
  renderStickerWall();
  renderPetSanctuary();

  // 更新過關畫面
  const petName = PET_CONFIG[petKey];
  document.getElementById('celeb-title').textContent = `太棒了！完成 ${petName} Lv.${lv} 挑戰！`;
  document.getElementById('celeb-desc').textContent =
    `獲得 3 顆榮譽星星 ⭐，這關已經累計通關 ${SAVE_DATA.levelClears[clearKey]} 次囉！`;

  const rewardSummary = document.getElementById('celeb-reward-summary');
  const activePet = SAVE_DATA.pets[SAVE_DATA.activeCompanion];
  if (rewardSummary) {
    rewardSummary.innerHTML = `
      🪙 本局共獲得 <strong>+${state.lastCoinsEarned} 金幣</strong>（目前總金幣：${SAVE_DATA.coins}）<br/>
      🐾 守護夥伴獲得 <strong>+${state.lastExpEarned} 經驗值</strong>（目前 Lv.${activePet ? activePet.level : 1}）
    `;
  }

  const stickerBox = document.getElementById('new-sticker-box');
  if (stickerBox) {
    if (unlockedStickerObj) {
      stickerBox.classList.remove('hidden');
      document.getElementById('new-sticker-emoji').textContent = unlockedStickerObj.emoji;
      document.getElementById('new-sticker-name').textContent = unlockedStickerObj.name;
    } else {
      stickerBox.classList.add('hidden');
    }
  }

  showScreen('celebration-screen');
  spawnConfetti();
  playSuccessJingle();

  const celebSpeech = [
    {
      text: `恭喜過關！獲得 ${state.lastCoinsEarned} 枚金幣！快回首頁的寵物養成屋餵食或買新造型吧！`,
      lang: 'zh-TW',
    },
  ];
  if (unlockedStickerObj) {
    celebSpeech.push({ text: `還獲得了新貼紙：${unlockedStickerObj.name}`, lang: 'zh-TW' });
  }
  speakSequence(celebSpeech);
}

function playAgain() {
  if (!state.currentPet) {
    goHome();
    return;
  }
  selectPet(state.currentPet, state.level[state.currentPet]);
}

function spawnConfetti() {
  const box = document.getElementById('confetti-box');
  if (!box) return;
  box.innerHTML = '';
  const emojis = ['🎉', '⭐', '🪙', '🏆', '🌈', '✨', '🎈'];
  for (let i = 0; i < 22; i++) {
    const span = document.createElement('span');
    span.className = 'confetti-piece';
    span.textContent = emojis[i % emojis.length];
    span.style.left = `${Math.random() * 94}%`;
    span.style.animationDelay = `${(Math.random() * 0.8).toFixed(2)}s`;
    box.appendChild(span);
  }
}

// ============================================================================
// ⚙️ 家長設定視窗 (角色改名 + 語速 + 20分鐘護眼鎖定設定)
// ============================================================================
function openSettingsModal() {
  playClickTick();
  document.getElementById('input-name-math').value = PET_CONFIG.math;
  document.getElementById('input-name-en').value = PET_CONFIG.en;
  document.getElementById('input-name-clock').value = PET_CONFIG.clock;

  const rateInput = document.getElementById('input-speech-rate');
  const rateVal = document.getElementById('speech-rate-val');
  if (rateInput) rateInput.value = PET_CONFIG.speechRate;
  if (rateVal) rateVal.textContent = `${Number(PET_CONFIG.speechRate).toFixed(2)}x`;

  const limitSelect = document.getElementById('select-time-limit');
  if (limitSelect) limitSelect.value = String(PET_CONFIG.timeLimitMinutes || 20);

  const pinInput = document.getElementById('input-parent-pin');
  if (pinInput) pinInput.value = PET_CONFIG.parentPin || '1234';

  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettingsModal() {
  playClickTick();
  document.getElementById('settings-modal').classList.add('hidden');
}

function previewSpeechRate(val) {
  const rateVal = document.getElementById('speech-rate-val');
  if (rateVal) rateVal.textContent = `${Number(val).toFixed(2)}x`;
  PET_CONFIG.speechRate = Number(val);
}

function resetDefaultPetNames() {
  playClickTick();
  document.getElementById('input-name-math').value = DEFAULT_PET_NAMES.math;
  document.getElementById('input-name-en').value = DEFAULT_PET_NAMES.en;
  document.getElementById('input-name-clock').value = DEFAULT_PET_NAMES.clock;
  document.getElementById('input-speech-rate').value = DEFAULT_PET_NAMES.speechRate;
  document.getElementById('speech-rate-val').textContent = '1.05x';
  document.getElementById('select-time-limit').value = '20';
  document.getElementById('input-parent-pin').value = '1234';
}

function savePetNamesFromModal() {
  const mathName = document.getElementById('input-name-math').value.trim() || DEFAULT_PET_NAMES.math;
  const enName = document.getElementById('input-name-en').value.trim() || DEFAULT_PET_NAMES.en;
  const clockName = document.getElementById('input-name-clock').value.trim() || DEFAULT_PET_NAMES.clock;
  const rate = Number(document.getElementById('input-speech-rate').value) || 1.05;
  const limitMins = Number(document.getElementById('select-time-limit').value) || 20;
  const pin = document.getElementById('input-parent-pin').value.trim() || '1234';

  PET_CONFIG = {
    math: mathName,
    en: enName,
    clock: clockName,
    speechRate: rate,
    timeLimitMinutes: limitMins,
    parentPin: pin,
  };

  try {
    localStorage.setItem(PET_NAMES_STORAGE_KEY, JSON.stringify(PET_CONFIG));
  } catch (e) {}

  applyPetNamesToDOM();
  renderPetSanctuary();
  updateTimerUIAndCheckLock();
  closeSettingsModal();
  playSuccessJingle();
  speakSequence([{ text: '設定已經儲存成功囉！', lang: 'zh-TW' }]);
}

window.addEventListener('DOMContentLoaded', initApp);
