// ============================================================================
// 🎓 角色、家長護眼時間鎖定與語音全域設定（自動持久化儲存）
// ============================================================================
const PET_CONFIG = {
  corieName: localStorage.getItem('pet_corie_name') || 'Corie',
  duncanName: localStorage.getItem('pet_duncan_name') || 'Duncan',
  shannonName: localStorage.getItem('pet_shannon_name') || 'Shannon',
  ttsMode: localStorage.getItem('pet_tts_mode') || 'auto',
  speechRate: parseFloat(localStorage.getItem('pet_speech_rate') || '1.00'),
  enVoiceURI: localStorage.getItem('pet_en_voice') || '',
  timeLimitMinutes: parseInt(localStorage.getItem('pet_time_limit_mins') || '20', 10),
  parentPin: localStorage.getItem('pet_parent_pin') || '1234',
};

// ============================================================================
// 🐾 All pets in the Pet House (first 5 are free, the rest can be adopted)
// ============================================================================
const PET_LIST = [
  { id: 'corie', emoji: '🐱', img: 'assets/corie.png', kind: 'Cat', cost: 0 },
  { id: 'duncan', emoji: '🐶', img: 'assets/duncan.png', kind: 'Dog', cost: 0 },
  { id: 'shannon', emoji: '🐟', img: 'assets/shannon.png', kind: 'Fish', cost: 0 },
  { id: 'dragon', emoji: '🐲', name: 'Draco', kind: 'Star Dragon', cost: 0 },
  { id: 'unicorn', emoji: '🦄', name: 'Stella', kind: 'Rainbow Unicorn', cost: 0 },
  { id: 'bunny', emoji: '🐰', name: 'Bobo', kind: 'Bunny', cost: 80 },
  { id: 'panda', emoji: '🐼', name: 'Pom Pom', kind: 'Panda', cost: 120 },
  { id: 'penguin', emoji: '🐧', name: 'Pip', kind: 'Penguin', cost: 150 },
  { id: 'fox', emoji: '🦊', name: 'Foxy', kind: 'Fox', cost: 180 },
  { id: 'dino', emoji: '🦖', name: 'Rexy', kind: 'Baby Dino', cost: 250 },
  { id: 'owl', emoji: '🦉', name: 'Hoot', kind: 'Wise Owl', cost: 300 },
];
const FREE_PET_IDS = PET_LIST.filter((p) => p.cost === 0).map((p) => p.id);

// ============================================================================
// 💾 玩家完整學習進度與寵物養成存檔系統 (SAVE_DATA)
// ============================================================================
function makeDefaultPet() {
  return { level: 1, exp: 0, hunger: 80, mood: 85, clean: 80, hat: '', item: '', room: 'room_home' };
}

const DEFAULT_SAVE = {
  totalStars: parseInt(localStorage.getItem('kids_total_stars') || '0', 10),
  coins: 60, // 初始贈送 60 金幣讓小朋友體驗餵食
  totalAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  activePetId: 'corie',
  currentShopTab: 'food',
  ageTrack: 'little', // 'little' = age 5-6, 'big' = age 6-12
  levelClears: {}, // e.g., { 'en_1': 2, 'math_e4': 1 }
  savedSession: null, // 自動記錄未完局的關卡與題號
  pets: {},
  adoptedPets: [...FREE_PET_IDS],
  ownedItems: [],
  lastGiftDate: '',
};

function normalizeSave(parsed) {
  const src = parsed && typeof parsed === 'object' ? parsed : {};
  const out = {
    ...JSON.parse(JSON.stringify(DEFAULT_SAVE)),
    ...src,
    levelClears: { ...(src.levelClears || {}) },
    ownedItems: Array.isArray(src.ownedItems) ? src.ownedItems : [],
  };
  const adopted = new Set([...(Array.isArray(src.adoptedPets) ? src.adoptedPets : []), ...FREE_PET_IDS]);
  out.adoptedPets = [...adopted];
  out.pets = {};
  PET_LIST.forEach((p) => {
    out.pets[p.id] = { ...makeDefaultPet(), ...((src.pets || {})[p.id] || {}) };
  });
  if (!PET_LIST.some((p) => p.id === out.activePetId) || !out.adoptedPets.includes(out.activePetId)) {
    out.activePetId = 'corie';
  }
  if (out.currentShopTab === 'dress') out.currentShopTab = 'hats';
  if (out.ageTrack !== 'big') out.ageTrack = 'little';
  return out;
}

let SAVE_DATA = loadSaveData();

function loadSaveData() {
  try {
    const raw = localStorage.getItem('kids_scholar_save_v8');
    if (!raw) return normalizeSave({});
    return normalizeSave(JSON.parse(raw));
  } catch (e) {
    return normalizeSave({});
  }
}

function saveProgress() {
  localStorage.setItem('kids_total_stars', String(SAVE_DATA.totalStars));
  localStorage.setItem('kids_scholar_save_v8', JSON.stringify(SAVE_DATA));
}

// ============================================================================
// 🏡 寵物養成商店資料（食物、陪玩、清潔、帽子、玩具配件、房間背景）
// ============================================================================
const PET_SHOP_CATALOG = {
  food: [
    { id: 'food_carrot', icon: '🥕', title: 'Carrot', cost: 8, hunger: 10, mood: 2, exp: 12, msg: 'Crunch crunch! Carrots are good for me!' },
    { id: 'food_apple', icon: '🍎', title: 'Red Apple', cost: 10, hunger: 12, mood: 4, exp: 15, msg: 'Yum! A sweet red apple!' },
    { id: 'food_bone', icon: '🍖', title: 'Chicken Leg', cost: 15, hunger: 20, mood: 5, exp: 25, msg: 'Yummy! I feel so strong!' },
    { id: 'food_icecream', icon: '🍦', title: 'Ice Cream', cost: 20, hunger: 10, mood: 20, exp: 30, msg: 'Cold and sweet! I love ice cream!' },
    { id: 'food_sushi', icon: '🍣', title: 'Fish Sushi', cost: 25, hunger: 30, mood: 10, exp: 45, msg: 'Fresh sushi! My brain feels smart!' },
    { id: 'food_pizza', icon: '🍕', title: 'Cheese Pizza', cost: 30, hunger: 35, mood: 15, exp: 55, msg: 'Pizza party! So much cheese!' },
    { id: 'food_tart', icon: '🍓', title: 'Strawberry Cake', cost: 35, hunger: 25, mood: 25, exp: 65, msg: 'Sweet strawberries! I am so happy!' },
    { id: 'food_steak', icon: '🥩', title: 'Big Steak', cost: 50, hunger: 50, mood: 30, exp: 100, msg: 'Wow, a big dinner! I feel super!' },
    { id: 'food_cake', icon: '🎂', title: 'Party Cake', cost: 60, hunger: 40, mood: 45, exp: 125, msg: 'A party cake! Is it my birthday?' },
  ],
  play: [
    { id: 'play_balloon', icon: '🎈', title: 'Balloon Game', cost: 10, hunger: -3, mood: 15, exp: 20, msg: 'Pop! Pop! Balloons are so fun!' },
    { id: 'play_ball', icon: '⚽', title: 'Kick the Ball', cost: 15, hunger: -5, mood: 20, exp: 30, msg: 'Goal! I kicked the ball!' },
    { id: 'play_frisbee', icon: '🥏', title: 'Catch the Frisbee', cost: 15, hunger: -5, mood: 25, exp: 35, msg: 'Whoosh! I caught it!' },
    { id: 'play_puzzle', icon: '🧩', title: 'Puzzle Time', cost: 20, hunger: -3, mood: 18, exp: 45, msg: 'I did the puzzle! I am so smart!' },
    { id: 'play_chess', icon: '♟️', title: 'Chess Game', cost: 25, hunger: -5, mood: 20, exp: 55, msg: 'Thinking hard makes my brain strong!' },
    { id: 'play_skate', icon: '🛹', title: 'Skateboard', cost: 35, hunger: -10, mood: 35, exp: 75, msg: 'Look at me go! So cool!' },
    { id: 'play_carousel', icon: '🎠', title: 'Merry-Go-Round', cost: 40, hunger: -8, mood: 40, exp: 85, msg: 'Round and round we go! Wheee!' },
    { id: 'play_space', icon: '🚀', title: 'Space Trip', cost: 50, hunger: -10, mood: 50, exp: 110, msg: 'Up, up to the stars! What a trip!' },
  ],
  care: [
    { id: 'care_teeth', icon: '🪥', title: 'Brush Teeth', cost: 8, clean: 15, mood: 3, exp: 12, msg: 'Brush, brush! My teeth are shiny!' },
    { id: 'care_nap', icon: '😴', title: 'Nap Time', cost: 10, clean: 0, mood: 15, hunger: -3, exp: 20, msg: 'Zzz... I feel so rested now!' },
    { id: 'care_shampoo', icon: '🧴', title: 'Shampoo', cost: 12, clean: 25, mood: 5, exp: 20, msg: 'Bubbles on my head! So soft!' },
    { id: 'care_bath', icon: '🛁', title: 'Bubble Bath', cost: 15, clean: 40, mood: 10, exp: 30, msg: 'Splash splash! I am clean now!' },
    { id: 'care_vitamin', icon: '💊', title: 'Vitamins', cost: 15, clean: 0, hunger: 5, mood: 5, exp: 30, msg: 'Vitamins make me healthy and strong!' },
    { id: 'care_haircut', icon: '✂️', title: 'New Haircut', cost: 20, clean: 30, mood: 10, exp: 35, msg: 'Snip snip! Do you like my new look?' },
    { id: 'care_spa', icon: '💅', title: 'Spa Day', cost: 35, clean: 50, mood: 25, exp: 60, msg: 'A spa day! I feel like a star!' },
  ],
  hats: [
    { id: 'hat_flower', slot: 'hat', icon: '🌸', title: 'Flower', cost: 25, msg: 'A pretty pink flower for me!' },
    { id: 'hat_cap', slot: 'hat', icon: '🧢', title: 'Sport Cap', cost: 30, msg: 'Ready to play ball!' },
    { id: 'hat_sun', slot: 'hat', icon: '👒', title: 'Sun Hat', cost: 35, msg: 'A sun hat for a sunny day!' },
    { id: 'hat_ribbon', slot: 'hat', icon: '🎀', title: 'Pink Bow', cost: 40, msg: 'I look so cute with my bow!' },
    { id: 'hat_helmet', slot: 'hat', icon: '⛑️', title: 'Helper Helmet', cost: 45, msg: 'I am ready to help!' },
    { id: 'hat_grad', slot: 'hat', icon: '🎓', title: 'Smart Cap', cost: 50, msg: 'I look like a teacher now!' },
    { id: 'hat_top', slot: 'hat', icon: '🎩', title: 'Magic Top Hat', cost: 55, msg: 'Ta-da! A fancy top hat!' },
    { id: 'hat_crown', slot: 'hat', icon: '👑', title: 'Gold Crown', cost: 60, msg: 'A shiny gold crown! I am a king!' },
    { id: 'hat_wizard', slot: 'hat', icon: '🧙', title: 'Wizard Hat', cost: 70, msg: 'Magic hat on! Abracadabra!' },
    { id: 'hat_halo', slot: 'hat', icon: '😇', title: 'Angel Halo', cost: 90, msg: 'A glowing halo! I am an angel!' },
  ],
  toys: [
    { id: 'item_lolly', slot: 'item', icon: '🍭', title: 'Lollipop', cost: 15, msg: 'A big rainbow lollipop!' },
    { id: 'item_balloon', slot: 'item', icon: '🎈', title: 'Red Balloon', cost: 20, msg: 'My red balloon goes up, up!' },
    { id: 'item_ball', slot: 'item', icon: '⚽', title: 'Soccer Ball', cost: 25, msg: 'Let us play soccer!' },
    { id: 'item_umbrella', slot: 'item', icon: '🌂', title: 'Umbrella', cost: 30, msg: 'Rain, rain, go away!' },
    { id: 'item_teddy', slot: 'item', icon: '🧸', title: 'Teddy Bear', cost: 40, msg: 'My teddy bear is my best friend!' },
    { id: 'item_glasses', slot: 'item', icon: '🕶️', title: 'Cool Glasses', cost: 45, msg: 'I look so cool!' },
    { id: 'item_guitar', slot: 'item', icon: '🎸', title: 'Guitar', cost: 60, msg: 'Strum strum! Let us sing a song!' },
    { id: 'item_wand', slot: 'item', icon: '🪄', title: 'Magic Wand', cost: 65, msg: 'Wave the wand! Magic time!' },
    { id: 'item_medal', slot: 'item', icon: '🏅', title: 'Gold Medal', cost: 80, msg: 'I won a gold medal!' },
    { id: 'item_trophy', slot: 'item', icon: '🏆', title: 'Big Trophy', cost: 120, msg: 'The biggest trophy! You are a super star!' },
  ],
  rooms: [
    { id: 'room_home', slot: 'room', icon: '🏡', title: 'Cozy Home', cost: 0, bg: 'radial-gradient(circle at 50% 35%, #ffffff 0%, #fae8ff 100%)', deco: '🪴 🖼️ 🛋️', msg: 'Home sweet home!' },
    { id: 'room_garden', slot: 'room', icon: '🌷', title: 'Flower Garden', cost: 40, bg: 'linear-gradient(180deg, #e0f2fe 0%, #dcfce7 60%, #86efac 100%)', deco: '🌷 🌼 🦋 🌻', msg: 'So many flowers! And butterflies!' },
    { id: 'room_beach', slot: 'room', icon: '🏖️', title: 'Sunny Beach', cost: 60, bg: 'linear-gradient(180deg, #bae6fd 0%, #7dd3fc 55%, #fde68a 100%)', deco: '☀️ 🐚 🏝️ 🦀', msg: 'Sun, sand and sea! Let us swim!' },
    { id: 'room_snow', slot: 'room', icon: '❄️', title: 'Snow Land', cost: 70, bg: 'linear-gradient(180deg, #e0f2fe 0%, #f8fafc 70%, #ffffff 100%)', deco: '❄️ ⛄ 🌨️ 🎿', msg: 'Brrr! Let us build a snowman!' },
    { id: 'room_candy', slot: 'room', icon: '🍭', title: 'Candy Land', cost: 80, bg: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)', deco: '🍭 🍬 🧁 🍩', msg: 'Everything is made of candy!' },
    { id: 'room_sea', slot: 'room', icon: '🌊', title: 'Under the Sea', cost: 80, bg: 'linear-gradient(180deg, #67e8f9 0%, #0ea5e9 60%, #0369a1 100%)', deco: '🐠 🫧 🐙 🪸', msg: 'Blub blub! Hello, fish friends!' },
    { id: 'room_space', slot: 'room', icon: '🌌', title: 'Outer Space', cost: 90, bg: 'radial-gradient(circle at 50% 30%, #6366f1 0%, #312e81 60%, #0f172a 100%)', deco: '🪐 ⭐ 🌙 🛸', msg: 'Hello from space! Look at the stars!' },
    { id: 'room_castle', slot: 'room', icon: '🏰', title: 'Royal Castle', cost: 100, bg: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 55%, #c4b5fd 100%)', deco: '🏰 👑 🚩 💎', msg: 'Welcome to my castle!' },
    { id: 'room_rainbow', slot: 'room', icon: '🌈', title: 'Rainbow Sky', cost: 120, bg: 'linear-gradient(180deg, #fecaca 0%, #fde68a 25%, #bbf7d0 50%, #bfdbfe 75%, #e9d5ff 100%)', deco: '🌈 ☁️ ✨ 🦄', msg: 'A rainbow sky! So many colors!' },
  ],
};

const WEARABLE_TABS = ['hats', 'toys', 'rooms'];
let pendingAdopt = { id: '', time: 0 };
let lastPetTapTime = 0;

function getPetInfo(petId) {
  return PET_LIST.find((p) => p.id === petId) || PET_LIST[0];
}

function getPetName(petId) {
  if (petId === 'corie') return PET_CONFIG.corieName;
  if (petId === 'duncan') return PET_CONFIG.duncanName;
  if (petId === 'shannon') return PET_CONFIG.shannonName;
  return getPetInfo(petId).name || 'Buddy';
}

function getPetRankTitle(lvl) {
  if (lvl >= 15) return `👑 Lv.${lvl} Super Star`;
  if (lvl >= 10) return `💎 Lv.${lvl} Royal Star`;
  if (lvl >= 6) return `🏆 Lv.${lvl} Smart Star`;
  if (lvl >= 3) return `🌟 Lv.${lvl} Brave Buddy`;
  return `🌱 Lv.${lvl} Little Helper`;
}

function getPetAuraClass(lvl) {
  if (lvl >= 15) return 'aura-4';
  if (lvl >= 10) return 'aura-3';
  if (lvl >= 6) return 'aura-2';
  if (lvl >= 3) return 'aura-1';
  return '';
}

function getPetDisplayName(petId) {
  return `${getPetName(petId)} the ${getPetInfo(petId).kind}`;
}

function setPetSpeech(text, speak = true) {
  const speechEl = document.getElementById('companion-speech');
  if (speechEl) speechEl.textContent = `💬 "${text}"`;
  if (speak) speakSequence([{ text, lang: 'en-US' }]);
}

function selectCompanionPet(petId) {
  const info = getPetInfo(petId);
  if (!SAVE_DATA.adoptedPets.includes(petId)) {
    const now = Date.now();
    if (pendingAdopt.id === petId && now - pendingAdopt.time < 6000) {
      pendingAdopt = { id: '', time: 0 };
      if (SAVE_DATA.coins < info.cost) {
        playTryAgainSound();
        setPetSpeech(`You need ${info.cost - SAVE_DATA.coins} more coins to adopt ${info.name}. Play games to win coins!`);
        return;
      }
      SAVE_DATA.coins -= info.cost;
      SAVE_DATA.adoptedPets.push(petId);
      SAVE_DATA.activePetId = petId;
      saveProgress();
      updateTopCountersUI();
      renderPetSanctuary();
      playSuccessJingle();
      spawnConfetti(30);
      setPetSpeech(`Yay! ${info.name} the ${info.kind} is your new friend!`);
      return;
    }
    pendingAdopt = { id: petId, time: now };
    playTone(520, 0.12, 'triangle');
    setPetSpeech(`Do you want ${info.name} the ${info.kind}? Tap again to adopt for ${info.cost} coins!`);
    return;
  }
  SAVE_DATA.activePetId = petId;
  saveProgress();
  renderPetSanctuary();
  playTone(580, 0.1, 'triangle');
  setPetSpeech(`Hi! I am ${getPetName(petId)}!`);
}

function switchPetShopTab(tab) {
  SAVE_DATA.currentShopTab = tab;
  playClickTick();
  renderPetSanctuary();
}

function renderPetSwitcher() {
  const wrap = document.getElementById('pet-switcher');
  if (!wrap) return;
  const activeId = SAVE_DATA.activePetId || 'corie';
  wrap.innerHTML = PET_LIST.map((p) => {
    const adopted = SAVE_DATA.adoptedPets.includes(p.id);
    const cls = ['pet-switch-btn'];
    if (p.id === activeId) cls.push('active');
    if (!adopted) cls.push('locked');
    const label = adopted ? getPetName(p.id) : `🔒 🪙${p.cost}`;
    return `<button class="${cls.join(' ')}" id="switch-pet-${p.id}" onclick="selectCompanionPet('${p.id}')">${p.emoji} ${label}</button>`;
  }).join('');
}

function renderPetSanctuary() {
  const petId = SAVE_DATA.activePetId || 'corie';
  const petObj = SAVE_DATA.pets[petId] || SAVE_DATA.pets.corie;
  const info = getPetInfo(petId);

  renderPetSwitcher();

  const titleEl = document.getElementById('active-pet-title');
  if (titleEl) titleEl.textContent = getPetDisplayName(petId);

  const imgEl = document.getElementById('companion-img');
  const emoEl = document.getElementById('companion-emoji');
  if (imgEl && emoEl) {
    if (info.img) {
      imgEl.style.display = 'block';
      imgEl.src = `${info.img}?v=9`;
      emoEl.style.display = 'none';
    } else {
      imgEl.style.display = 'none';
      emoEl.style.display = 'flex';
    }
    emoEl.textContent = info.emoji;
  }

  const room = PET_SHOP_CATALOG.rooms.find((r) => r.id === petObj.room) || PET_SHOP_CATALOG.rooms[0];
  const stage = document.getElementById('pet-stage-box');
  if (stage) {
    stage.style.background = room.bg;
    stage.classList.remove('aura-1', 'aura-2', 'aura-3', 'aura-4');
    const aura = getPetAuraClass(petObj.level);
    if (aura) stage.classList.add(aura);
  }
  const deco = document.getElementById('pet-room-deco');
  if (deco) deco.textContent = room.deco;

  document.getElementById('pet-equipped-hat').textContent = petObj.hat || '';
  document.getElementById('pet-equipped-item').textContent = petObj.item || '';
  document.getElementById('pet-stage-rank').textContent = getPetRankTitle(petObj.level);

  const expNeeded = petObj.level * 100;
  const expPct = Math.min(100, Math.round((petObj.exp / expNeeded) * 100));
  document.getElementById('pet-lvl-text').textContent = `Lv.${petObj.level} (${petObj.exp}/${expNeeded})`;
  document.getElementById('pet-exp-bar').style.width = `${expPct}%`;

  [['hunger', petObj.hunger], ['mood', petObj.mood], ['clean', petObj.clean]].forEach(([key, val]) => {
    const t = document.getElementById(`pet-${key}-text`);
    const b = document.getElementById(`pet-${key}-bar`);
    if (t) t.textContent = `${val}%`;
    if (b) b.style.width = `${val}%`;
  });

  const tab = PET_SHOP_CATALOG[SAVE_DATA.currentShopTab] ? SAVE_DATA.currentShopTab : 'food';
  Object.keys(PET_SHOP_CATALOG).forEach((t) => {
    const b = document.getElementById(`tab-btn-${t}`);
    if (b) b.classList.toggle('active', t === tab);
  });

  const giftBtn = document.getElementById('daily-gift-btn');
  if (giftBtn) {
    const opened = SAVE_DATA.lastGiftDate === getTodayDateKey();
    giftBtn.classList.toggle('opened', opened);
    giftBtn.textContent = opened ? '✅ Gift opened' : '🎁 Daily Gift';
  }

  const listEl = document.getElementById('pet-shop-items');
  if (!listEl) return;
  listEl.innerHTML = '';

  const items = PET_SHOP_CATALOG[tab] || [];
  items.forEach((entry) => {
    const btn = document.createElement('button');
    btn.className = 'shop-item-btn';
    const isWearable = WEARABLE_TABS.includes(tab);
    const isOwned = entry.cost === 0 || SAVE_DATA.ownedItems.includes(entry.id);
    let isEquipped = false;
    if (entry.slot === 'hat') isEquipped = petObj.hat === entry.icon;
    if (entry.slot === 'item') isEquipped = petObj.item === entry.icon;
    if (entry.slot === 'room') isEquipped = petObj.room === entry.id;

    if (isWearable && isOwned) btn.classList.add('owned');
    if (isEquipped) btn.classList.add('equipped');

    let costLabel = `🪙 ${entry.cost}`;
    if (isWearable && isOwned) {
      if (entry.slot === 'room') costLabel = isEquipped ? '✅ You are here' : '🏠 Tap to go';
      else costLabel = isEquipped ? '✅ Wearing (tap to take off)' : '🎒 Tap to wear';
    }

    let effects = '';
    if (!isWearable) {
      const parts = [];
      if (entry.hunger > 0) parts.push(`🍖+${entry.hunger}`);
      if (entry.mood > 0) parts.push(`💖+${entry.mood}`);
      if (entry.clean > 0) parts.push(`🛁+${entry.clean}`);
      if (entry.exp > 0) parts.push(`✨+${entry.exp}`);
      effects = `<div class="shop-effect">${parts.join(' ')}</div>`;
    }

    btn.innerHTML = `
      <div class="shop-icon">${entry.icon}</div>
      <div class="shop-title">${entry.title}</div>
      ${effects}
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

function clampStat(v) {
  return Math.max(10, Math.min(100, Math.round(v)));
}

function handleBuyOrUseShopItem(tab, entry) {
  const petId = SAVE_DATA.activePetId || 'corie';
  const petObj = SAVE_DATA.pets[petId];

  if (WEARABLE_TABS.includes(tab)) {
    const isOwned = entry.cost === 0 || SAVE_DATA.ownedItems.includes(entry.id);
    if (!isOwned) {
      if (SAVE_DATA.coins < entry.cost) {
        playTryAgainSound();
        setPetSpeech(`You need ${entry.cost - SAVE_DATA.coins} more coins. Play a game to win coins!`);
        return;
      }
      SAVE_DATA.coins -= entry.cost;
      SAVE_DATA.ownedItems.push(entry.id);
    }
    if (entry.slot === 'hat') {
      petObj.hat = petObj.hat === entry.icon ? '' : entry.icon;
    } else if (entry.slot === 'item') {
      petObj.item = petObj.item === entry.icon ? '' : entry.icon;
    } else {
      petObj.room = entry.id;
    }
    playSuccessJingle();
    spawnConfetti(15);
    setPetSpeech(entry.msg);
    updateTopCountersUI();
    renderPetSanctuary();
    saveProgress();
    return;
  }

  // 食物、陪玩或清潔
  if (SAVE_DATA.coins < entry.cost) {
    playTryAgainSound();
    setPetSpeech(`You need ${entry.cost - SAVE_DATA.coins} more coins for the ${entry.title}. Play a game to win coins!`);
    return;
  }

  SAVE_DATA.coins -= entry.cost;
  petObj.hunger = clampStat(petObj.hunger + (entry.hunger || 0));
  petObj.mood = clampStat(petObj.mood + (entry.mood || 0));
  petObj.clean = clampStat(petObj.clean + (entry.clean || 0));
  const leveledUp = addPetExp(petObj, entry.exp || 20);

  playSuccessJingle();
  spawnConfetti(leveledUp ? 30 : 12);
  animatePet('pet-anim-bounce');
  spawnPetHearts(tab === 'care' ? '🫧' : tab === 'food' ? '😋' : '💖');

  if (leveledUp) {
    setPetSpeech(`Level up! I am now ${getPetRankTitle(petObj.level).replace(/^\S+\s/, '')}! Thank you!`);
  } else {
    setPetSpeech(entry.msg);
  }

  updateTopCountersUI();
  renderPetSanctuary();
  saveProgress();
}

function animatePet(cls) {
  const vis = document.getElementById('pet-main-visual');
  if (!vis) return;
  vis.classList.remove('pet-anim-bounce', 'pet-anim-spin', 'pet-anim-wiggle');
  void vis.offsetWidth;
  vis.classList.add(cls);
  setTimeout(() => vis.classList.remove(cls), 900);
}

function spawnPetHearts(symbol = '💖') {
  const layer = document.getElementById('pet-hearts-layer');
  if (!layer) return;
  for (let i = 0; i < 5; i++) {
    const h = document.createElement('span');
    h.className = 'float-heart';
    h.textContent = symbol;
    h.style.left = `${20 + Math.random() * 60}%`;
    h.style.animationDelay = `${(i * 0.12).toFixed(2)}s`;
    layer.appendChild(h);
    setTimeout(() => h.remove(), 1800);
  }
}

function interactWithCompanion() {
  const petId = SAVE_DATA.activePetId || 'corie';
  const petObj = SAVE_DATA.pets[petId];
  const name = getPetName(petId);

  animatePet(pickRandom(['pet-anim-bounce', 'pet-anim-spin', 'pet-anim-wiggle']));
  spawnPetHearts('💖');
  playSuccessJingle();

  const now = Date.now();
  if (now - lastPetTapTime > 1500 && petObj.mood < 100) {
    petObj.mood = clampStat(petObj.mood + 1);
    saveProgress();
    renderPetSanctuary();
  }
  lastPetTapTime = now;

  let line;
  if (petObj.hunger < 40) line = 'My tummy says grrr! Can I have a snack?';
  else if (petObj.clean < 40) line = 'I am a little dirty. Can I have a bath?';
  else if (petObj.mood < 40) line = 'Can we play together, please?';
  else {
    line = pickRandom([
      `Hi! I am ${name}. I love you!`,
      `I am ${getPetRankTitle(petObj.level).replace(/^\S+\s/, '')}!`,
      'Play a game and win coins for me!',
      'Tee-hee! That tickles!',
      'You are my best friend!',
      'Can I have a new hat, please?',
      'Let us learn something new today!',
    ]);
  }
  setPetSpeech(line);
}

function claimDailyGift() {
  const today = getTodayDateKey();
  if (SAVE_DATA.lastGiftDate === today) {
    playTryAgainSound();
    setPetSpeech('You opened today\'s gift. Come back tomorrow for a new one!');
    return;
  }
  const gift = randInt(20, 40);
  SAVE_DATA.coins += gift;
  SAVE_DATA.lastGiftDate = today;
  saveProgress();
  updateTopCountersUI();
  renderPetSanctuary();
  playSuccessJingle();
  spawnConfetti(28);
  animatePet('pet-anim-spin');
  setPetSpeech(`Surprise! You got ${gift} coins today!`);
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
    if (disp) disp.textContent = 'No limit';
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
        `Grown-ups: type the PIN, or the answer to ${m1} × ${m2} = ?, to add more time.`;
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
    if (errEl) errEl.textContent = '❌ That PIN or answer is not right.';
  }
}

function openParentTimeModal() {
  openSettingsModal();
}

function resetDailyTimerFromSettings() {
  setUsedPlaySecondsToday(0);
  updateTimerUIAndCheckLock();
  playSuccessJingle();
  speakSequence([{ text: 'Play time is reset for today!', lang: 'en-US' }]);
}

// ============================================================================
// 🎁 豪華 120 張榮譽貼紙圖鑑
// ============================================================================
const STICKERS = [
  { emoji: '🎀', name: 'Pink Bow' }, { emoji: '🦄', name: 'Unicorn' },
  { emoji: '🍓', name: 'Strawberry' }, { emoji: '👑', name: 'Princess Crown' },
  { emoji: '🍭', name: 'Lollipop' }, { emoji: '🧸', name: 'Teddy Bear' },
  { emoji: '🌈', name: 'Rainbow' }, { emoji: '🏰', name: 'Castle' },
  { emoji: '🦋', name: 'Butterfly' }, { emoji: '🍦', name: 'Ice Cream' },
  { emoji: '🐬', name: 'Dolphin' }, { emoji: '🎨', name: 'Paint' },
  { emoji: '🎠', name: 'Merry-Go-Round' }, { emoji: '🧁', name: 'Cupcake' },
  { emoji: '🌺', name: 'Flower' }, { emoji: '🐳', name: 'Whale' },
  { emoji: '🍉', name: 'Watermelon' }, { emoji: '🧚', name: 'Fairy' },
  { emoji: '💎', name: 'Diamond' }, { emoji: '🚀', name: 'Rocket' },
  { emoji: '🐱', name: 'Cat' }, { emoji: '🐶', name: 'Dog' },
  { emoji: '🐰', name: 'Bunny' }, { emoji: '🐼', name: 'Panda' },
  { emoji: '🐨', name: 'Koala' }, { emoji: '🦊', name: 'Fox' },
  { emoji: '🦁', name: 'Lion' }, { emoji: '🐯', name: 'Tiger' },
  { emoji: '🦒', name: 'Giraffe' }, { emoji: '🐘', name: 'Elephant' },
  { emoji: '🐧', name: 'Penguin' }, { emoji: '🐤', name: 'Chick' },
  { emoji: '🦆', name: 'Duck' }, { emoji: '🦉', name: 'Owl' },
  { emoji: '🐢', name: 'Turtle' }, { emoji: '🦖', name: 'T-Rex' },
  { emoji: '🦕', name: 'Dinosaur' }, { emoji: '🦩', name: 'Flamingo' },
  { emoji: '🦚', name: 'Peacock' }, { emoji: '🦜', name: 'Parrot' },
  { emoji: '🐟', name: 'Fish' }, { emoji: '🐠', name: 'Clownfish' },
  { emoji: '🐡', name: 'Puffer Fish' }, { emoji: '🐙', name: 'Octopus' },
  { emoji: '🪼', name: 'Jellyfish' }, { emoji: '🦀', name: 'Crab' },
  { emoji: '🦞', name: 'Lobster' }, { emoji: '🦐', name: 'Shrimp' },
  { emoji: '🐚', name: 'Shell' }, { emoji: '🪸', name: 'Coral' },
  { emoji: '🧜‍♀️', name: 'Mermaid' }, { emoji: '🦈', name: 'Shark' },
  { emoji: '🦭', name: 'Seal' }, { emoji: '🦦', name: 'Otter' },
  { emoji: '🫧', name: 'Bubbles' }, { emoji: '🌊', name: 'Wave' },
  { emoji: '🏝️', name: 'Island' }, { emoji: '⛵', name: 'Sailboat' },
  { emoji: '⚓', name: 'Anchor' }, { emoji: '🍍', name: 'Pineapple' },
  { emoji: '🍰', name: 'Cake' }, { emoji: '🎂', name: 'Birthday Cake' },
  { emoji: '🍩', name: 'Donut' }, { emoji: '🍪', name: 'Cookie' },
  { emoji: '🍫', name: 'Chocolate' }, { emoji: '🍬', name: 'Candy' },
  { emoji: '🍮', name: 'Pudding' }, { emoji: '🍯', name: 'Honey' },
  { emoji: '🥞', name: 'Pancakes' }, { emoji: '🧇', name: 'Waffle' },
  { emoji: '🥐', name: 'Croissant' }, { emoji: '🥨', name: 'Pretzel' },
  { emoji: '🍿', name: 'Popcorn' }, { emoji: '🍧', name: 'Shaved Ice' },
  { emoji: '🍨', name: 'Sundae' }, { emoji: '🧃', name: 'Juice Box' },
  { emoji: '🧋', name: 'Bubble Tea' }, { emoji: '🥛', name: 'Milk' },
  { emoji: '🍕', name: 'Pizza' }, { emoji: '🍔', name: 'Burger' },
  { emoji: '🍎', name: 'Apple' }, { emoji: '🍑', name: 'Peach' },
  { emoji: '🍒', name: 'Cherries' }, { emoji: '🍇', name: 'Grapes' },
  { emoji: '🍋', name: 'Lemon' }, { emoji: '🍊', name: 'Orange' },
  { emoji: '🍌', name: 'Banana' }, { emoji: '🥝', name: 'Kiwi' },
  { emoji: '🌸', name: 'Cherry Blossom' }, { emoji: '🌻', name: 'Sunflower' },
  { emoji: '🌷', name: 'Tulip' }, { emoji: '🌹', name: 'Rose' },
  { emoji: '🍀', name: 'Lucky Clover' }, { emoji: '🍄', name: 'Mushroom' },
  { emoji: '☀️', name: 'Sun' }, { emoji: '🌙', name: 'Moon' },
  { emoji: '⭐', name: 'Star' }, { emoji: '🌟', name: 'Super Star' },
  { emoji: '❄️', name: 'Snowflake' }, { emoji: '⛄', name: 'Snowman' },
  { emoji: '🎡', name: 'Ferris Wheel' }, { emoji: '🎢', name: 'Roller Coaster' },
  { emoji: '🎪', name: 'Circus' }, { emoji: '🎈', name: 'Balloon' },
  { emoji: '🎉', name: 'Party' }, { emoji: '🎁', name: 'Gift' },
  { emoji: '👑', name: 'Gold Crown' }, { emoji: '💍', name: 'Ring' },
  { emoji: '🪄', name: 'Magic Wand' }, { emoji: '🔮', name: 'Crystal Ball' },
  { emoji: '🎻', name: 'Violin' }, { emoji: '🎹', name: 'Piano' },
  { emoji: '🎸', name: 'Guitar' }, { emoji: '🎺', name: 'Trumpet' },
  { emoji: '🥁', name: 'Drum' }, { emoji: '🪁', name: 'Kite' },
  { emoji: '🪀', name: 'Yo-Yo' }, { emoji: '🧩', name: 'Puzzle' },
  { emoji: '🎠', name: 'Carousel Horse' }, { emoji: '🏆', name: 'Trophy' },
];

// ============================================================================
// 📚 Big Stars (6~12) English word bank — clue sentences in simple English
// ============================================================================
const ENGLISH_BANK = [
  { letter: 'A', word: 'Astronaut', emoji: '🧑‍🚀', clue: 'A person who flies a rocket into space.' },
  { letter: 'A', word: 'Ambulance', emoji: '🚑', clue: 'A car that takes sick people to the hospital.' },
  { letter: 'A', word: 'Aquarium', emoji: '🐠', clue: 'A place where you can see many fish and sea animals.' },
  { letter: 'B', word: 'Bakery', emoji: '🥐', clue: 'A shop that makes and sells bread and cakes.' },
  { letter: 'B', word: 'Bridge', emoji: '🌉', clue: 'It goes over a river so people and cars can cross.' },
  { letter: 'B', word: 'Backpack', emoji: '🎒', clue: 'A bag you carry on your back to school.' },
  { letter: 'B', word: 'Badminton', emoji: '🏸', clue: 'A sport where you hit a birdie over a high net.' },
  { letter: 'C', word: 'Calendar', emoji: '📅', clue: 'It shows the days, weeks and months of the year.' },
  { letter: 'C', word: 'Computer', emoji: '💻', clue: 'A machine you use for work, games and the internet.' },
  { letter: 'C', word: 'Cucumber', emoji: '🥒', clue: 'A long green vegetable. It is crunchy in salads.' },
  { letter: 'C', word: 'Camouflage', emoji: '🦎', clue: 'Colors that help an animal hide.' },
  { letter: 'D', word: 'Dictionary', emoji: '📕', clue: 'A big book that tells you what words mean.' },
  { letter: 'D', word: 'Dentist', emoji: '🦷', clue: 'A doctor who takes care of your teeth.' },
  { letter: 'D', word: 'Detective', emoji: '🕵️', clue: 'A person who looks for clues to solve a mystery.' },
  { letter: 'D', word: 'Dinosaur', emoji: '🦖', clue: 'A giant animal that lived a very long time ago.' },
  { letter: 'E', word: 'Earthquake', emoji: '🌍', clue: 'When the ground shakes very hard.' },
  { letter: 'E', word: 'Envelope', emoji: '✉️', clue: 'You put a letter in it before you mail it.' },
  { letter: 'E', word: 'Experiment', emoji: '🧪', clue: 'A science test you do to learn something new.' },
  { letter: 'F', word: 'Firefighter', emoji: '🧑‍🚒', clue: 'A brave person who puts out fires.' },
  { letter: 'F', word: 'Flashlight', emoji: '🔦', clue: 'A small light you hold in your hand in the dark.' },
  { letter: 'G', word: 'Geography', emoji: '🗺️', clue: 'The school subject about countries, rivers and maps.' },
  { letter: 'G', word: 'Gymnasium', emoji: '🏀', clue: 'A big room for sports and exercise.' },
  { letter: 'H', word: 'Helicopter', emoji: '🚁', clue: 'It flies with big blades that spin on top.' },
  { letter: 'H', word: 'Hospital', emoji: '🏥', clue: 'Doctors and nurses help sick people here.' },
  { letter: 'I', word: 'Instrument', emoji: '🎻', clue: 'A piano, violin or guitar. You play music with it.' },
  { letter: 'I', word: 'Ingredient', emoji: '🥣', clue: 'One of the foods you mix together to cook.' },
  { letter: 'J', word: 'Journalist', emoji: '🎤', clue: 'A person who writes news for TV or newspapers.' },
  { letter: 'K', word: 'Kangaroo', emoji: '🦘', clue: 'It hops and carries its baby in a pocket.' },
  { letter: 'K', word: 'Keyboard', emoji: '⌨️', clue: 'You press its keys to type on a computer.' },
  { letter: 'L', word: 'Library', emoji: '🏛️', clue: 'A quiet place where you can borrow books.' },
  { letter: 'L', word: 'Lightning', emoji: '⚡', clue: 'A bright flash in the sky in a storm.' },
  { letter: 'M', word: 'Microscope', emoji: '🔬', clue: 'It makes very tiny things look big.' },
  { letter: 'M', word: 'Mountain', emoji: '⛰️', clue: 'A very tall hill. It can have snow on top.' },
  { letter: 'M', word: 'Museum', emoji: '🏺', clue: 'You can see old art and dinosaur bones here.' },
  { letter: 'N', word: 'Notebook', emoji: '📓', clue: 'A book with empty pages for writing in class.' },
  { letter: 'N', word: 'Neighborhood', emoji: '🏘️', clue: 'The streets and houses near your home.' },
  { letter: 'O', word: 'Orchestra', emoji: '🎼', clue: 'A big group of people playing music together.' },
  { letter: 'P', word: 'Passenger', emoji: '🚆', clue: 'A person riding on a train, bus or plane.' },
  { letter: 'P', word: 'Planetarium', emoji: '🪐', clue: 'A place where you see stars and planets on the ceiling.' },
  { letter: 'P', word: 'Pharmacy', emoji: '💊', clue: 'A shop where you get medicine.' },
  { letter: 'Q', word: 'Question', emoji: '❓', clue: 'You ask this when you want to know something.' },
  { letter: 'R', word: 'Restaurant', emoji: '🍽️', clue: 'A place where you buy and eat a meal.' },
  { letter: 'R', word: 'Recycle', emoji: '♻️', clue: 'Making old paper and bottles into new things.' },
  { letter: 'R', word: 'Refrigerator', emoji: '🧊', clue: 'It keeps food and milk cold in the kitchen.' },
  { letter: 'S', word: 'Scientist', emoji: '👩‍🔬', clue: 'A person who studies science and does tests.' },
  { letter: 'S', word: 'Submarine', emoji: '🛥️', clue: 'A ship that can go deep under the water.' },
  { letter: 'S', word: 'Scissors', emoji: '✂️', clue: 'You use them to cut paper.' },
  { letter: 'T', word: 'Telescope', emoji: '🔭', clue: 'You use it to look at stars and the Moon.' },
  { letter: 'T', word: 'Temperature', emoji: '🌡️', clue: 'It tells how hot or cold something is.' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️', clue: 'You hold it over your head in the rain.' },
  { letter: 'V', word: 'Vegetable', emoji: '🥦', clue: 'Healthy food like carrots and broccoli.' },
  { letter: 'V', word: 'Volcano', emoji: '🌋', clue: 'A mountain that can shoot out hot lava.' },
  { letter: 'W', word: 'Weather', emoji: '🌦️', clue: 'Is it sunny, rainy, windy or snowy outside?' },
  { letter: 'W', word: 'Waterfall', emoji: '🏞️', clue: 'Where a river falls down over rocks.' },
];

// Opposites and same-meaning words (Big Stars Lv.2)
const EN_OPPOSITES_BANK = [
  { base: 'Expensive', rel: 'opposite', ans: 'Cheap', wrong: ['Heavy', 'Loud', 'Bright'] },
  { base: 'Ancient', rel: 'opposite', ans: 'Modern', wrong: ['Empty', 'Quiet', 'Weak'] },
  { base: 'Dangerous', rel: 'opposite', ans: 'Safe', wrong: ['Sharp', 'Deep', 'Wide'] },
  { base: 'Generous', rel: 'opposite', ans: 'Selfish', wrong: ['Polite', 'Honest', 'Clever'] },
  { base: 'Borrow', rel: 'opposite', ans: 'Lend', wrong: ['Spend', 'Catch', 'Throw'] },
  { base: 'Arrive', rel: 'opposite', ans: 'Leave', wrong: ['Follow', 'Invite', 'Visit'] },
  { base: 'Giant', rel: 'same', ans: 'Huge', wrong: ['Tiny', 'Narrow', 'Shallow'] },
  { base: 'Intelligent', rel: 'same', ans: 'Smart', wrong: ['Lazy', 'Bored', 'Noisy'] },
  { base: 'Difficult', rel: 'opposite', ans: 'Easy', wrong: ['Strict', 'Bitter', 'Rough'] },
  { base: 'Victory', rel: 'opposite', ans: 'Defeat', wrong: ['Courage', 'Journey', 'Treasure'] },
  { base: 'Happy', rel: 'same', ans: 'Glad', wrong: ['Angry', 'Sleepy', 'Hungry'] },
  { base: 'Begin', rel: 'same', ans: 'Start', wrong: ['Stop', 'Sleep', 'Shout'] },
];

// Sentence building (Big Stars Lv.3) — picture hints instead of translations
const EN_SENTENCE_SCRAMBLE_BANK = [
  { words: ['She', 'goes', 'to', 'school', 'by', 'bus'], hint: '👧 ➡️ 🏫 🚌' },
  { words: ['How', 'much', 'is', 'this', 'dictionary'], hint: '💰 ❓ 📕' },
  { words: ['My', 'favorite', 'subject', 'is', 'science'], hint: '❤️ 🔬 🧪' },
  { words: ['We', 'visited', 'the', 'museum', 'yesterday'], hint: '👨‍👩‍👧 🏛️ ⬅️ 📅' },
  { words: ['What', 'will', 'you', 'do', 'tomorrow'], hint: '❓ 🧒 ➡️ 📅' },
  { words: ['Please', 'turn', 'off', 'the', 'lights'], hint: '🙏 💡 ❌' },
  { words: ['The', 'library', 'is', 'next', 'to', 'the', 'park'], hint: '📚 🏛️ ↔️ 🌳' },
  { words: ['He', 'is', 'taller', 'than', 'his', 'brother'], hint: '👦⬆️ 👦' },
  { words: ['I', 'like', 'to', 'eat', 'apples'], hint: '😋 🍎 🍎' },
  { words: ['They', 'are', 'playing', 'soccer', 'now'], hint: '👦👧 ⚽ ⏰' },
];

// 🎈 Big Stars shape balloons (Lv.4)
const EN_COLORS = [
  { en: 'Crimson Red', shortEn: 'Red', fill: '#ef4444', bg: '#fee2e2', border: '#fca5a5' },
  { en: 'Royal Blue', shortEn: 'Blue', fill: '#3b82f6', bg: '#dbeafe', border: '#93c5fd' },
  { en: 'Golden Yellow', shortEn: 'Yellow', fill: '#eab308', bg: '#fef9c3', border: '#fde047' },
  { en: 'Emerald Green', shortEn: 'Green', fill: '#22c55e', bg: '#dcfce7', border: '#86efac' },
  { en: 'Violet Purple', shortEn: 'Purple', fill: '#a855f7', bg: '#f3e8ff', border: '#d8b4fe' },
  { en: 'Coral Orange', shortEn: 'Orange', fill: '#f97316', bg: '#ffedd5', border: '#fdba74' },
];

const EN_SHAPES = [
  { id: 'pentagon', en: 'Pentagon', clue: 'a shape with 5 sides' },
  { id: 'hexagon', en: 'Hexagon', clue: 'a shape with 6 sides, like a honeycomb' },
  { id: 'octagon', en: 'Octagon', clue: 'a shape with 8 sides, like a stop sign' },
  { id: 'rectangle', en: 'Rectangle', clue: 'a shape with 2 long sides and 2 short sides' },
  { id: 'triangle', en: 'Triangle', clue: 'a shape with 3 sides' },
  { id: 'rhombus', en: 'Rhombus', clue: 'a diamond shape with 4 sides the same' },
];

// ============================================================================
// 🐣 Little Stars (5~6) English banks
// ============================================================================
const EASY_WORDS = [
  { word: 'cat', emoji: '🐱' }, { word: 'dog', emoji: '🐶' }, { word: 'pig', emoji: '🐷' },
  { word: 'cow', emoji: '🐮' }, { word: 'hen', emoji: '🐔' }, { word: 'fox', emoji: '🦊' },
  { word: 'bee', emoji: '🐝' }, { word: 'ant', emoji: '🐜' }, { word: 'owl', emoji: '🦉' },
  { word: 'fish', emoji: '🐟' }, { word: 'frog', emoji: '🐸' }, { word: 'duck', emoji: '🦆' },
  { word: 'bear', emoji: '🐻' }, { word: 'lion', emoji: '🦁' }, { word: 'sun', emoji: '☀️' },
  { word: 'moon', emoji: '🌙' }, { word: 'star', emoji: '⭐' }, { word: 'car', emoji: '🚗' },
  { word: 'bus', emoji: '🚌' }, { word: 'egg', emoji: '🥚' }, { word: 'cake', emoji: '🎂' },
  { word: 'apple', emoji: '🍎' }, { word: 'ball', emoji: '⚽' }, { word: 'hat', emoji: '🎩' },
  { word: 'cup', emoji: '☕' }, { word: 'bed', emoji: '🛏️' }, { word: 'book', emoji: '📖' },
  { word: 'tree', emoji: '🌳' }, { word: 'milk', emoji: '🥛' }, { word: 'key', emoji: '🔑' },
  { word: 'boat', emoji: '⛵' }, { word: 'rain', emoji: '🌧️' }, { word: 'pen', emoji: '🖊️' },
  { word: 'door', emoji: '🚪' }, { word: 'kite', emoji: '🪁' }, { word: 'nose', emoji: '👃' },
];

const EASY_COLORS = [
  { en: 'red', fill: '#ef4444', bg: '#fee2e2', border: '#fca5a5' },
  { en: 'blue', fill: '#3b82f6', bg: '#dbeafe', border: '#93c5fd' },
  { en: 'yellow', fill: '#eab308', bg: '#fef9c3', border: '#fde047' },
  { en: 'green', fill: '#22c55e', bg: '#dcfce7', border: '#86efac' },
  { en: 'purple', fill: '#a855f7', bg: '#f3e8ff', border: '#d8b4fe' },
  { en: 'orange', fill: '#f97316', bg: '#ffedd5', border: '#fdba74' },
  { en: 'pink', fill: '#ec4899', bg: '#fce7f3', border: '#f9a8d4' },
];

const EASY_SHAPES = [
  { id: 'circle', en: 'circle' },
  { id: 'square', en: 'square' },
  { id: 'triangle', en: 'triangle' },
  { id: 'star', en: 'star' },
  { id: 'heart', en: 'heart' },
];

const ANIMAL_SOUNDS = [
  { name: 'cow', emoji: '🐮', sound: 'Moo' },
  { name: 'dog', emoji: '🐶', sound: 'Woof' },
  { name: 'cat', emoji: '🐱', sound: 'Meow' },
  { name: 'duck', emoji: '🦆', sound: 'Quack' },
  { name: 'pig', emoji: '🐷', sound: 'Oink' },
  { name: 'sheep', emoji: '🐑', sound: 'Baa' },
  { name: 'lion', emoji: '🦁', sound: 'Roar' },
  { name: 'hen', emoji: '🐔', sound: 'Cluck' },
  { name: 'frog', emoji: '🐸', sound: 'Ribbit' },
  { name: 'owl', emoji: '🦉', sound: 'Hoot' },
  { name: 'bee', emoji: '🐝', sound: 'Buzz' },
  { name: 'horse', emoji: '🐴', sound: 'Neigh' },
  { name: 'mouse', emoji: '🐭', sound: 'Squeak' },
  { name: 'snake', emoji: '🐍', sound: 'Hiss' },
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

// Escape a string so it can sit inside onclick="fn('...')"
function jsq(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function plural(n, one, many) {
  return n === 1 ? one : many;
}

// ============================================================================
// 🚀 Big Stars Lv.6 Rocket Girl reading & grammar bank
// ============================================================================
const ROCKET_BOOK1_BANK = [
  {
    unit: 'u1',
    badge: '📖 School Story',
    passage: 'Every Tuesday morning, Lucas brings his microscope and notebook to the science lab. His favorite subject is science because he loves doing fun experiments with his classmates.',
    question: 'Why does Lucas love science class?',
    ans: 'Because he loves doing experiments.',
    wrong: [
      'Because he likes playing badminton.',
      'Because the library is very quiet.',
      'Because he wants to buy a sandwich.',
    ],
  },
  {
    unit: 'u1',
    badge: '📝 Grammar',
    passage: 'Please ______ quiet in the school library! Many students are reading books right now.',
    question: 'Pick the right word for the blank.',
    ans: 'be',
    wrong: ['is', 'are', 'am'],
  },
  {
    unit: 'u2',
    badge: '📖 Family & Jobs Story',
    passage: 'My aunt Emma works at a big city hospital. She wears a white coat and helps sick children feel better every day. My uncle Leo is a firefighter who drives a red fire truck.',
    question: 'Where does Aunt Emma work?',
    ans: 'At a city hospital.',
    wrong: [
      'At a bakery near the park.',
      'Inside a space station.',
      'At an elementary school.',
    ],
  },
  {
    unit: 'u2',
    badge: '📝 Past Tense',
    passage: 'Yesterday evening, my father ______ a yummy pasta dinner for our whole family.',
    question: 'It says "Yesterday". Pick the past tense word.',
    ans: 'cooked',
    wrong: ['cooks', 'cooking', 'to cook'],
  },
  {
    unit: 'u3',
    badge: '📖 Science Story',
    passage: 'Chameleons and arctic foxes are great at hiding. An arctic fox has white fur in the snowy winter, so other animals cannot see it in the snow.',
    question: 'How does white fur help the arctic fox in winter?',
    ans: 'It helps the fox hide in the snow.',
    wrong: [
      'It helps the fox fly in the sky.',
      'It makes the fox swim faster than sharks.',
      'It helps the fox breathe underwater.',
    ],
  },
  {
    unit: 'u3',
    badge: '📝 Comparing Words',
    passage: 'A blue whale is much ______ than a dolphin. It is the biggest animal on Earth!',
    question: 'The sentence has "than". Pick the right word.',
    ans: 'heavier',
    wrong: ['heavy', 'heaviest', 'more heavy'],
  },
  {
    unit: 'u4',
    badge: '📖 Hobbies Story',
    passage: 'Sophia practices the violin for forty-five minutes every afternoon. Next Saturday, she will play on stage with the school orchestra in front of her parents.',
    question: 'What will Sophia do next Saturday?',
    ans: 'Play with the school orchestra.',
    wrong: [
      'Go camping in the high mountains.',
      'Visit the dentist after school.',
      'Buy a new bicycle at the store.',
    ],
  },
  {
    unit: 'u5',
    badge: '📖 Healthy Food Story',
    passage: 'Waiter: "May I take your order?" Mia: "Yes, I would like a bowl of vegetable soup, a chicken sandwich, and a glass of orange juice, please."',
    question: 'What drink did Mia order?',
    ans: 'A glass of orange juice.',
    wrong: [
      'A cup of hot chocolate.',
      'A bottle of strawberry milk.',
      'Two bowls of tomato soup.',
    ],
  },
  {
    unit: 'rg',
    badge: '🦸‍♀️ Rocket Girl Story',
    passage: 'When Metro City is in trouble, Roxy puts on her silver jetpack and flies faster than a helicopter! Today, she saved a little kitten stuck on top of a tall bridge.',
    question: 'How does Rocket Girl fly into the sky?',
    ans: 'She uses her silver jetpack.',
    wrong: [
      'She rides a yellow submarine.',
      'She takes an underground train.',
      'She sails on a wooden boat.',
    ],
  },
  {
    unit: 'rg',
    badge: '🦸‍♀️ Rocket Girl Grammar',
    passage: "Don't worry, everyone! Rocket Girl ______ protect Metro City from the giant robot!",
    question: 'Pick the word that means "is going to".',
    ans: 'will',
    wrong: ['did', 'was', 'are'],
  },
];

// ============================================================================
// 🔢 Math items
// ============================================================================
const MATH_ITEMS = [
  { emoji: '🍓', one: 'strawberry', many: 'strawberries' },
  { emoji: '🍩', one: 'donut', many: 'donuts' },
  { emoji: '🧁', one: 'cupcake', many: 'cupcakes' },
  { emoji: '🍪', one: 'cookie', many: 'cookies' },
  { emoji: '🍎', one: 'apple', many: 'apples' },
  { emoji: '🥐', one: 'croissant', many: 'croissants' },
  { emoji: '🍕', one: 'pizza slice', many: 'pizza slices' },
  { emoji: '📚', one: 'book', many: 'books' },
  { emoji: '🎨', one: 'paint set', many: 'paint sets' },
  { emoji: '⚽', one: 'soccer ball', many: 'soccer balls' },
];

const COUNT_ITEMS = [
  { emoji: '🍎', one: 'apple', many: 'apples' },
  { emoji: '⭐', one: 'star', many: 'stars' },
  { emoji: '🐟', one: 'fish', many: 'fish' },
  { emoji: '🦆', one: 'duck', many: 'ducks' },
  { emoji: '🚗', one: 'car', many: 'cars' },
  { emoji: '🎈', one: 'balloon', many: 'balloons' },
  { emoji: '🍪', one: 'cookie', many: 'cookies' },
  { emoji: '🌸', one: 'flower', many: 'flowers' },
  { emoji: '🐝', one: 'bee', many: 'bees' },
  { emoji: '🐱', one: 'cat', many: 'cats' },
];

const EAT_ITEMS = [
  { emoji: '🍎', one: 'apple', many: 'apples' },
  { emoji: '🍪', one: 'cookie', many: 'cookies' },
  { emoji: '🍓', one: 'strawberry', many: 'strawberries' },
  { emoji: '🍩', one: 'donut', many: 'donuts' },
  { emoji: '🧁', one: 'cupcake', many: 'cupcakes' },
  { emoji: '🍌', one: 'banana', many: 'bananas' },
];

const LITTLE_SHOP_ITEMS = [
  { emoji: '🍎', name: 'apple' }, { emoji: '🍌', name: 'banana' },
  { emoji: '🧃', name: 'juice box' }, { emoji: '🍭', name: 'lollipop' },
  { emoji: '🧸', name: 'teddy bear' }, { emoji: '🎈', name: 'balloon' },
  { emoji: '✏️', name: 'pencil' }, { emoji: '🍪', name: 'cookie' },
  { emoji: '🚗', name: 'toy car' }, { emoji: '🍦', name: 'ice cream' },
];

const STORY_NAMES = ['Leo', 'Mia', 'Sam', 'Amy', 'Ben', 'Lily'];

// ============================================================================
// 🎮 全域遊戲狀態
// ============================================================================
let state = {
  currentMode: 'home', // 'home' | 'english' | 'math' | 'clock'
  enLevel: 'e1',
  mathLevel: 'e1',
  clockLevel: 'e1',
  rocketUnit: 'all',
  round: 1,
  totalRounds: 8,
  streak: { en: 0, math: 0, clock: 0 },
  isAnswering: false,
  currentSpeech: [],
  currentQuestion: null,
};

let audioCtx = null;
let selectedEnVoice = null;
let speechQueueId = 0;

// ============================================================================
// 🔊 音效與語音合成引擎（全英文）
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

  const enSelect = document.getElementById('select-en-voice');
  const enVoices = voices.filter((v) => v.lang.startsWith('en'));

  if (enSelect && enVoices.length) {
    enSelect.innerHTML = enVoices
      .map((v) => `<option value="${v.voiceURI}">${v.name} (${v.lang})</option>`)
      .join('');
  }

  const enPriority = [
    (v) => PET_CONFIG.enVoiceURI && v.voiceURI === PET_CONFIG.enVoiceURI,
    (v) => v.name.includes('Aria') && v.name.includes('Natural'),
    (v) => v.name.includes('Jenny') && v.name.includes('Natural'),
    (v) => v.name.includes('Ana') && v.name.includes('Natural'),
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
  const lang = 'en-US';
  const rate = Math.min(1.6, Math.max(0.65, (item.rate || 0.95) * speed));

  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(item.text);
    utter.lang = lang;
    utter.rate = rate;
    utter.pitch = item.pitch || 1.08;
    if (selectedEnVoice) utter.voice = selectedEnVoice;

    let finished = false;
    const finishOnce = () => {
      if (finished) return;
      finished = true;
      if (onDone) onDone();
    };
    utter.onend = finishOnce;
    utter.onerror = finishOnce;
    setTimeout(finishOnce, Math.max(4000, item.text.length * 160));
    window.speechSynthesis.speak(utter);
  } else {
    if (onDone) onDone();
  }
}

// Short helper: speak a list of plain English strings
function say(...texts) {
  speakSequence(texts.filter(Boolean).map((t) => ({ text: t, lang: 'en-US' })));
}

// ============================================================================
// 🧭 Age Switcher, Level Lists, Counters & Sticker Book
// ============================================================================
const LEVEL_DEFINITIONS = {
  little: {
    en: [
      { id: 'e1', cls: 'lvl-1', title: '🐣 Lv.1 ABC Letters & Pictures', chip: '🐣 Lv.1 ABCs' },
      { id: 'e2', cls: 'lvl-2', title: '🔤 Lv.2 First Sound (C-A-T)', chip: '🔤 Lv.2 First Sound' },
      { id: 'e3', cls: 'lvl-3', title: '🧩 Lv.3 Spell 3-Letter Words', chip: '🧩 Lv.3 Spell' },
      { id: 'e4', cls: 'lvl-4', title: '🎈 Lv.4 Color & Shape Balloons', chip: '🎈 Lv.4 Balloons' },
      { id: 'e5', cls: 'lvl-5', title: '🃏 Lv.5 6-Card Picture Match', chip: '🃏 Lv.5 Match' },
      { id: 'e6', cls: 'lvl-6', title: '🐮 Lv.6 Animal Sounds (Moo!)', chip: '🐮 Lv.6 Animals' },
    ],
    math: [
      { id: 'e1', cls: 'lvl-1', title: '🍎 Lv.1 Count 1 to 10', chip: '🍎 Lv.1 Count' },
      { id: 'e2', cls: 'lvl-2', title: '➕ Lv.2 Picture Add & Take Away', chip: '➕ Lv.2 Add/Sub' },
      { id: 'e3', cls: 'lvl-3', title: '⚖️ Lv.3 Bigger or Smaller & Make 10', chip: '⚖️ Lv.3 Make 10' },
      { id: 'e4', cls: 'lvl-4', title: '🛒 Lv.4 Little Toy Shop ($1 & $5)', chip: '🛒 Lv.4 Toy Shop' },
      { id: 'e5', cls: 'lvl-5', title: '🚂 Lv.5 Pattern & Number Train', chip: '🚂 Lv.5 Train' },
      { id: 'e6', cls: 'lvl-6', title: '🍪 Lv.6 Share the Cookies Fairly', chip: '🍪 Lv.6 Share' },
    ],
    clock: [
      { id: 'e1', cls: 'lvl-1', title: '🕐 Lv.1 O\'clock & Half Past', chip: '🕐 Lv.1 O\'clock' },
      { id: 'e2', cls: 'lvl-2', title: '☀️ Lv.2 Morning, Noon & Night', chip: '☀️ Lv.2 My Day' },
      { id: 'e3', cls: 'lvl-3', title: '🛠️ Lv.3 Move the Hands (Easy)', chip: '🛠️ Lv.3 Move Hands' },
    ],
  },
  big: {
    en: [
      { id: 1, cls: 'lvl-1', title: '🌱 Lv.1 Word Clue Detective', chip: '🌱 Lv.1 Clues' },
      { id: 2, cls: 'lvl-2', title: '🎧 Lv.2 Missing Letters & Opposites', chip: '🎧 Lv.2 Opposites' },
      { id: 3, cls: 'lvl-3', title: '🔤 Lv.3 Build a Sentence', chip: '🔤 Lv.3 Sentences' },
      { id: 4, cls: 'lvl-4', title: '🎈 Lv.4 Polygon & Color Balloons', chip: '🎈 Lv.4 Polygons' },
      { id: 5, cls: 'lvl-5', title: '🃏 Lv.5 12-Card Word & Picture Match', chip: '🃏 Lv.5 12 Cards' },
      { id: 6, cls: 'lvl-6', title: '🚀 Lv.6 Short Stories & Grammar', chip: '🚀 Lv.6 Stories' },
    ],
    math: [
      { id: 1, cls: 'lvl-1', title: '🌱 Lv.1 Big Number Add & Subtract', chip: '🌱 Lv.1 Big Add' },
      { id: 2, cls: 'lvl-2', title: '🌟 Lv.2 Multiply, Divide & Compare', chip: '🌟 Lv.2 × ÷' },
      { id: 3, cls: 'lvl-3', title: '🏆 Lv.3 Two-Step Math & Stories', chip: '🏆 Lv.3 Stories' },
      { id: 4, cls: 'lvl-4', title: '🛒 Lv.4 Big Store Cashier ($100)', chip: '🛒 Lv.4 Cashier' },
      { id: 5, cls: 'lvl-5', title: '🚂 Lv.5 Super Number Train', chip: '🚂 Lv.5 Train' },
      { id: 6, cls: 'lvl-6', title: '🍕 Lv.6 Pizza Fractions & Shapes', chip: '🍕 Lv.6 Fractions' },
    ],
    clock: [
      { id: 1, cls: 'lvl-1', title: '🌱 Lv.1 Exact Minutes & 24-Hour Time', chip: '🌱 Lv.1 Minutes' },
      { id: 2, cls: 'lvl-2', title: '🌟 Lv.2 How Much Time Passed?', chip: '🌟 Lv.2 Later' },
      { id: 3, cls: 'lvl-3', title: '🏆 Lv.3 Set the Exact Minute', chip: '🏆 Lv.3 Set Clock' },
    ],
  },
};

function setAgeTrack(track) {
  playClickTick();
  SAVE_DATA.ageTrack = track === 'big' ? 'big' : 'little';
  saveProgress();
  renderAgeTrackUI();
  say(track === 'big' ? 'Big Stars mode! Ready for a challenge!' : 'Little Stars mode! Let us play and learn!');
}

function renderAgeTrackUI() {
  const track = SAVE_DATA.ageTrack === 'big' ? 'big' : 'little';
  const btnLittle = document.getElementById('age-btn-little');
  const btnBig = document.getElementById('age-btn-big');
  if (btnLittle) btnLittle.classList.toggle('active', track === 'little');
  if (btnBig) btnBig.classList.toggle('active', track === 'big');

  const descEn = document.getElementById('card-desc-en');
  const descMath = document.getElementById('card-desc-math');
  const descClock = document.getElementById('card-desc-clock');
  if (track === 'little') {
    if (descEn) descEn.textContent = 'Letters, easy words, colors, shapes and animal sounds!';
    if (descMath) descMath.textContent = 'Count 1 to 10, add with pictures, toy shop and share cookies!';
    if (descClock) descClock.textContent = 'O\'clock, half past and fun times of the day!';
  } else {
    if (descEn) descEn.textContent = 'Word clues, opposites, sentences, polygons and short stories!';
    if (descMath) descMath.textContent = 'Big numbers, multiply, divide, $100 cashier and fractions!';
    if (descClock) descClock.textContent = 'Exact minutes, 24-hour time and time stories!';
  }

  const defs = LEVEL_DEFINITIONS[track];
  const renderGroup = (key, fnName) => {
    const box = document.getElementById(`levels-${key}`);
    if (!box) return;
    box.innerHTML = defs[key]
      .map((lv) => {
        const clears = SAVE_DATA.levelClears[`${key}_${lv.id}`] || 0;
        const badge = clears > 0 ? `🏅×${clears}` : '';
        const arg = typeof lv.id === 'string' ? `'${lv.id}'` : lv.id;
        return `<button class="lvl-btn ${lv.cls}" onclick="${fnName}(${arg})">${lv.title} <span class="prog-tag" id="badge-${key}-${lv.id}">${badge}</span></button>`;
      })
      .join('');
  };
  renderGroup('en', 'startEnglishGame');
  renderGroup('math', 'startMathGame');
  renderGroup('clock', 'startClockGame');
}

function startFirstLevel(key) {
  const firstId = SAVE_DATA.ageTrack === 'big' ? 1 : 'e1';
  if (key === 'en') startEnglishGame(firstId);
  else if (key === 'math') startMathGame(firstId);
  else startClockGame(firstId);
}

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

  renderAgeTrackUI();
  renderStickerWall();
}

function renderStickerWall() {
  const listEl = document.getElementById('sticker-list');
  const progEl = document.getElementById('sticker-progress-text');
  if (!listEl) return;

  const unlockedCount = Math.min(STICKERS.length, Math.floor(SAVE_DATA.totalStars / 3));
  if (progEl) {
    progEl.textContent = `${unlockedCount} / ${STICKERS.length} stickers`;
  }

  listEl.innerHTML = STICKERS.map((s, idx) => {
    const unlocked = idx < unlockedCount;
    if (unlocked) {
      return `<div class="sticker-slot unlocked" title="${s.name}" onclick="say('${jsq(s.name)}')">
        <span>${s.emoji}</span>
      </div>`;
    }
    return `<div class="sticker-slot locked" title="Get 3 stars to open a new sticker">🔒</div>`;
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

function isEasyLevel(lv) {
  return String(lv).startsWith('e');
}

function updateRoundProgressUI(prefix) {
  const roundEl = document.getElementById(`${prefix}-round-text`);
  const fillEl = document.getElementById(`${prefix}-progress-fill`);
  const streakEl = document.getElementById(`${prefix}-streak-pill`);
  const total = state.totalRounds || 8;
  if (roundEl) roundEl.textContent = `Question ${state.round} / ${total}`;
  if (fillEl) fillEl.style.width = `${Math.round((state.round / total) * 100)}%`;
  if (streakEl) streakEl.textContent = `🔥 Streak ${state.streak[prefix] || 0}`;
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
// 🐶 Duncan's English Fun (Little Stars e1~e6 + Big Stars 1~6)
// ============================================================================
function startEnglishGame(lv = 'e1') {
  state.currentMode = 'english';
  state.enLevel = lv;
  state.round = 1;
  state.totalRounds = isEasyLevel(lv) ? 6 : 8;
  showScreen('english');
  syncEnglishLevelChips();
  loadEnglishQuestion();
}

function switchEnglishLevel(lv) {
  playClickTick();
  state.enLevel = lv;
  state.round = 1;
  state.totalRounds = isEasyLevel(lv) ? 6 : 8;
  syncEnglishLevelChips();
  loadEnglishQuestion();
}

function syncEnglishLevelChips() {
  const track = isEasyLevel(state.enLevel) ? 'little' : 'big';
  const bar = document.getElementById('en-level-chips');
  if (bar) {
    const list = LEVEL_DEFINITIONS[track].en;
    bar.innerHTML =
      `<span class="bar-label">${track === 'little' ? '🐣 Easy:' : '🎓 Hard:'}</span>` +
      list
        .map((item) => {
          const active = String(item.id) === String(state.enLevel) ? 'active' : '';
          const arg = typeof item.id === 'string' ? `'${item.id}'` : item.id;
          return `<button class="chip-btn ${active}" onclick="switchEnglishLevel(${arg})">${item.chip}</button>`;
        })
        .join('');
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
  if (lv === 'e1') renderEnEasy1ABC();
  else if (lv === 'e2') renderEnEasy2FirstSound();
  else if (lv === 'e3') renderEnEasy3SimpleSpell();
  else if (lv === 'e4') renderEnEasy4ColorShapeBalloon();
  else if (lv === 'e5') renderEnEasy5Memory6();
  else if (lv === 'e6') renderEnEasy6AnimalSounds();
  else if (lv === 1) renderEnLv1ClueChallenge();
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

// ---------- Little Stars e1: ABC Letters & Pictures ----------
function renderEnEasy1ABC() {
  const container = document.getElementById('en-options-container');
  const target = pickRandom(EASY_WORDS);
  const firstLetter = target.word[0].toUpperCase();
  const distractors = shuffle(
    EASY_WORDS.filter((w) => w.word[0].toUpperCase() !== firstLetter)
  ).slice(0, 3);
  const options = shuffle([target, ...distractors]);

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}: "Find the picture for ${firstLetter} — ${target.word}!"`;

  setEnglishStageCard(
    `${firstLetter} ${firstLetter.toLowerCase()}`,
    `<div style="font-size:1.4rem; color:#1e293b; font-weight:900;">${firstLetter} is for <span style="color:#ec4899;">${target.word}</span></div>`,
    '🔊 Tap to hear the word'
  );

  state.currentSpeech = [
    { text: `${firstLetter}! ${firstLetter} is for ${target.word}!`, lang: 'en-US' },
  ];

  container.className = 'options-grid english-options';
  container.innerHTML = options
    .map(
      (opt) => `
      <button class="option-card" onclick="checkEnglishAnswer(this, '${jsq(opt.word)}', '${jsq(target.word)}', '${jsq(opt.word)}')">
        <div class="option-emoji">${opt.emoji}</div>
        <div class="option-word">${opt.word}</div>
      </button>
    `
    )
    .join('');

  repeatEnglishPrompt();
}

// ---------- Little Stars e2: First Sound ----------
function renderEnEasy2FirstSound() {
  const container = document.getElementById('en-options-container');
  const target = pickRandom(EASY_WORDS);
  const firstLetter = target.word[0].toUpperCase();
  const rest = target.word.slice(1);
  const allLetters = 'ABCDEFGHIKLMNOPRSTW'.split('');
  const wrongLetters = shuffle(allLetters.filter((l) => l !== firstLetter)).slice(0, 3);
  const options = shuffle([firstLetter, ...wrongLetters]);

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}: "What is the first letter of ${target.word}?"`;

  setEnglishStageCard(
    `${target.emoji}  _${rest}`,
    `<div style="font-size:1.3rem; color:#475569; font-weight:800;">Pick the first letter!</div>`,
    '🔊 Tap to hear the word'
  );

  state.currentSpeech = [
    { text: `${target.word}! What is the first letter of ${target.word}?`, lang: 'en-US' },
  ];

  container.className = 'options-grid english-options';
  container.innerHTML = options
    .map(
      (ltr) => `
      <button class="option-card" onclick="checkEnglishAnswer(this, '${ltr}', '${firstLetter}', '${jsq(target.word)}')">
        <div class="option-word" style="font-size:2.3rem; color:#2563eb;">${ltr} ${ltr.toLowerCase()}</div>
      </button>
    `
    )
    .join('');

  repeatEnglishPrompt();
}

// ---------- Little Stars e3: Tap Letters to Spell a 3- or 4-Letter Word ----------
function renderEnEasy3SimpleSpell() {
  const slotsEl = document.getElementById('en-spelling-slots');
  slotsEl.classList.remove('hidden');

  const shortWords = EASY_WORDS.filter((w) => w.word.length <= 4);
  const target = pickRandom(shortWords);
  const letters = target.word.toUpperCase().split('');
  const extraPool = 'AEIOUBCDFGHJKLMNPRST'.split('').filter((c) => !letters.includes(c));
  const extra = shuffle(extraPool).slice(0, Math.max(1, 5 - letters.length));
  const pool = shuffle([...letters, ...extra].map((ch, idx) => ({ w: ch, id: idx })));

  state.currentQuestion = {
    targetWords: letters,
    picked: [],
    pool,
    fullWord: target.word,
  };

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}: "Tap the letters to spell ${target.word.toUpperCase()}!"`;

  setEnglishStageCard(
    `${target.emoji}`,
    `<div style="font-size:1.4rem; color:#1e293b; font-weight:900;">Spell: <span style="color:#2563eb; letter-spacing:3px;">${target.word.toUpperCase()}</span></div>`,
    '🔊 Tap to hear the word'
  );

  state.currentSpeech = [
    { text: `Let's spell ${target.word}! ${letters.join(', ')}!`, lang: 'en-US' },
  ];

  renderEnEasy3Slots();
  repeatEnglishPrompt();
}

function renderEnEasy3Slots() {
  const slotsEl = document.getElementById('en-spelling-slots');
  const container = document.getElementById('en-options-container');
  const q = state.currentQuestion;

  slotsEl.innerHTML = q.targetWords
    .map((ltr, i) => {
      const p = q.picked[i];
      return `<div class="spell-slot ${p ? 'filled' : ''}">${p ? p.w : ltr}</div>`;
    })
    .join('');

  container.className = 'options-grid english-options';
  container.innerHTML = q.pool
    .map((token) => {
      const used = q.picked.some((p) => p.id === token.id);
      return `<button class="option-card ${used ? 'used-letter' : ''}"
        ${used ? 'disabled' : ''}
        onclick="handleEasySpellPick(${token.id})">
        <div class="option-word" style="font-size:2.1rem; color:#1e40af;">${token.w}</div>
      </button>`;
    })
    .join('');
}

function handleEasySpellPick(tokenId) {
  if (state.isAnswering) return;
  const q = state.currentQuestion;
  const token = q.pool.find((t) => t.id === tokenId);
  if (!token) return;

  const expected = q.targetWords[q.picked.length];
  if (token.w === expected) {
    playClickTick();
    q.picked.push(token);
    say(token.w);
    renderEnEasy3Slots();

    if (q.picked.length === q.targetWords.length) {
      onCorrectAnswer('en', q.fullWord.toUpperCase(), [
        { text: `Great job! ${q.fullWord}!`, lang: 'en-US' },
      ]);
    }
  } else {
    onWrongAnswer('en', `Look at the next letter: ${expected}. Try again!`);
  }
}

// ---------- Little Stars e4: Color & Easy Shape Balloons ----------
function renderEnEasy4ColorShapeBalloon() {
  const container = document.getElementById('en-options-container');
  const targetColor = pickRandom(EASY_COLORS);
  const targetShape = pickRandom(EASY_SHAPES);
  const targetKey = `${targetColor.en}-${targetShape.id}`;

  const combos = [{ color: targetColor, shape: targetShape, key: targetKey }];
  while (combos.length < 4) {
    const c = pickRandom(EASY_COLORS);
    const s = pickRandom(EASY_SHAPES);
    const k = `${c.en}-${s.id}`;
    if (!combos.some((x) => x.key === k)) combos.push({ color: c, shape: s, key: k });
  }
  const shuffled = shuffle(combos);

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}: "Pop the ${targetColor.en} ${targetShape.en}!"`;

  setEnglishStageCard(
    `🎈 ${targetColor.en} ${targetShape.en}`,
    `<div style="font-size:1.15rem; color:#475569; font-weight:800;">Tap the matching balloon!</div>`,
    '🔊 Tap to listen'
  );

  state.currentSpeech = [
    { text: `Pop the ${targetColor.en} ${targetShape.en}!`, lang: 'en-US' },
  ];

  container.className = 'options-grid english-options';
  container.innerHTML = shuffled
    .map(
      (item) => `
      <button class="option-card balloon-card" style="background:${item.color.bg}; border-color:${item.color.border};"
        onclick="checkEnglishAnswer(this, '${item.key}', '${targetKey}', '${item.color.en} ${item.shape.en}')">
        <div class="balloon-svg-wrap">${getShapeSvg(item.shape.id, item.color.fill)}</div>
        <div class="option-word" style="font-size:1.15rem;">${item.color.en} ${item.shape.en}</div>
      </button>
    `
    )
    .join('');

  repeatEnglishPrompt();
}

// ---------- Little Stars e5: 6-Card Picture & Word Match (3 pairs) ----------
function renderEnEasy5Memory6() {
  renderMemoryCards(3, EASY_WORDS);
}

// ---------- Little Stars e6: Animal Sounds ----------
function renderEnEasy6AnimalSounds() {
  const container = document.getElementById('en-options-container');
  const target = pickRandom(ANIMAL_SOUNDS);
  const distractors = shuffle(ANIMAL_SOUNDS.filter((a) => a.name !== target.name)).slice(0, 3);
  const options = shuffle([target, ...distractors]);

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}: "Who says '${target.sound}! ${target.sound}!'?"`;

  setEnglishStageCard(
    `🔊 "${target.sound}! ${target.sound}!"`,
    `<div style="font-size:1.25rem; color:#1e293b; font-weight:900;">Which animal makes this sound?</div>`,
    '🔊 Tap to hear the sound'
  );

  state.currentSpeech = [
    { text: `${target.sound}! ${target.sound}! Which animal says ${target.sound}?`, lang: 'en-US' },
  ];

  container.className = 'options-grid english-options';
  container.innerHTML = options
    .map(
      (opt) => `
      <button class="option-card" onclick="checkEnglishAnswer(this, '${opt.name}', '${target.name}', 'The ${opt.name} says ${opt.sound}!')">
        <div class="option-emoji">${opt.emoji}</div>
        <div class="option-word">${opt.name}</div>
      </button>
    `
    )
    .join('');

  repeatEnglishPrompt();
}

// ---------- Big Stars Lv.1: Word Clue Detective ----------
function renderEnLv1ClueChallenge() {
  const container = document.getElementById('en-options-container');
  const target = pickRandom(ENGLISH_BANK);
  const distractors = shuffle(ENGLISH_BANK.filter((w) => w.word !== target.word)).slice(0, 3);
  const options = shuffle([target, ...distractors]);

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}: "Read the clue and pick the right word!"`;

  setEnglishStageCard(
    `${target.emoji} Word Detective`,
    `<div style="font-size:1.15rem; color:#1e293b; font-weight:800; line-height:1.5; margin:6px 0;">"${target.clue}"</div>`,
    `💡 Starts with ${target.letter}... · 🔊 Tap to listen`
  );

  state.currentSpeech = [
    { text: target.clue, lang: 'en-US' },
    { text: 'Which word is it?', lang: 'en-US' },
  ];

  container.className = 'options-grid english-options';
  container.innerHTML = options
    .map(
      (opt) => `
      <button class="option-card" onclick="checkEnglishAnswer(this, '${jsq(opt.word)}', '${jsq(target.word)}', '${jsq(opt.word)}')">
        <div class="option-emoji">${opt.emoji}</div>
        <div class="option-word">${opt.word}</div>
      </button>
    `
    )
    .join('');

  repeatEnglishPrompt();
}

// ---------- Big Stars Lv.2: Missing Letters & Opposites ----------
function renderEnLv2ClozeAndOpposite() {
  const container = document.getElementById('en-options-container');
  const isOpposite = state.round % 2 === 0;

  if (isOpposite) {
    const item = pickRandom(EN_OPPOSITES_BANK);
    const opts = shuffle([item.ans, ...item.wrong]);
    const askText =
      item.rel === 'opposite'
        ? `Pick the OPPOSITE of "${item.base}"!`
        : `Pick the word that means the SAME as "${item.base}"!`;

    document.getElementById('en-prompt-text').textContent = `${PET_CONFIG.duncanName}: "${askText}"`;

    setEnglishStageCard(
      item.base,
      `<div style="font-size:1.2rem; color:#ec4899; font-weight:900;">${item.rel === 'opposite' ? '↔️ Opposite word' : '🟰 Same meaning'} ➔ [ ? ]</div>`,
      '🔊 Tap to hear the word'
    );

    state.currentSpeech = [{ text: askText, lang: 'en-US' }];

    container.className = 'options-grid english-options';
    container.innerHTML = opts
      .map(
        (w) => `
        <button class="option-card" onclick="checkEnglishAnswer(this, '${jsq(w)}', '${jsq(item.ans)}', '${jsq(w)}')">
          <div class="option-word" style="font-size:1.5rem;">${w}</div>
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
      `${PET_CONFIG.duncanName}: "Listen to the word and pick the two missing letters!"`;

    setEnglishStageCard(
      `${target.emoji} ${maskedWord}`,
      `<div style="font-size:1.05rem; color:#475569; font-weight:800;">"${target.clue}"</div>`,
      '🔊 Tap to hear the word'
    );

    state.currentSpeech = [{ text: `${target.word}. ${target.clue}`, lang: 'en-US' }];

    container.className = 'options-grid english-options';
    container.innerHTML = opts
      .map(
        (part) => `
        <button class="option-card" onclick="checkEnglishAnswer(this, '${jsq(part)}', '${jsq(missingPart)}', '${jsq(target.word)}')">
          <div class="option-word" style="font-size:1.75rem; color:#4f46e5;">${part}</div>
        </button>
      `
      )
      .join('');
  }
  repeatEnglishPrompt();
}

// ---------- Big Stars Lv.3: Build a Sentence ----------
function renderEnLv3ScrambleAndSpell() {
  const slotsEl = document.getElementById('en-spelling-slots');
  slotsEl.classList.remove('hidden');

  const item = pickRandom(EN_SENTENCE_SCRAMBLE_BANK);
  const fullSentence = item.words.join(' ');
  const pool = shuffle(item.words.map((w, idx) => ({ w, id: idx })));

  state.currentQuestion = {
    targetWords: item.words,
    picked: [],
    pool,
  };

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}: "Listen and tap the words in the right order!"`;

  setEnglishStageCard(
    '✍️ Build the Sentence',
    `<div style="font-size:1.6rem; margin:4px 0;">${item.hint}</div>`,
    '🔊 Tap to hear the whole sentence'
  );

  state.currentSpeech = [{ text: fullSentence, lang: 'en-US' }];

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
      return `<div class="spell-slot ${p ? 'filled' : ''}" style="min-width:64px; width:auto; padding:0 12px; font-size:1.15rem;">
        ${p ? p.w : i + 1}
      </div>`;
    })
    .join('');

  container.className = 'options-grid english-options';
  container.innerHTML = q.pool
    .map((token) => {
      const used = q.picked.some((p) => p.id === token.id);
      return `<button class="option-card ${used ? 'used-letter' : ''}"
        style="padding:12px 18px; min-height:64px;"
        ${used ? 'disabled' : ''}
        onclick="handleScrambleWordPick(${token.id})">
        <div class="option-word" style="font-size:1.3rem;">${token.w}</div>
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
    say(token.w);
    renderEnLv3ScrambleSlots();

    if (q.picked.length === q.targetWords.length) {
      const sentence = q.targetWords.join(' ');
      onCorrectAnswer('en', sentence, [{ text: `Awesome! ${sentence}`, lang: 'en-US' }]);
    }
  } else {
    onWrongAnswer('en', `Not "${token.w}". Listen again to the sentence!`);
  }
}

// ---------- Big Stars Lv.4: Polygon & Color Balloons ----------
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
    `${PET_CONFIG.duncanName}: "Pop the ${targetColor.en} ${targetShape.en}!"`;

  setEnglishStageCard(
    `🎈 ${targetColor.en} ${targetShape.en}`,
    `<div style="font-size:1.05rem; color:#475569; font-weight:800;">Clue: A ${targetShape.en.toLowerCase()} is ${targetShape.clue}.</div>`,
    '🔊 Tap to listen'
  );

  state.currentSpeech = [
    { text: `Pop the ${targetColor.en} ${targetShape.en}!`, lang: 'en-US' },
    { text: `It is ${targetShape.clue}.`, lang: 'en-US' },
  ];

  container.className = 'options-grid english-options';
  container.innerHTML = shuffled
    .map(
      (item) => `
      <button class="option-card balloon-card" style="background:${item.color.bg}; border-color:${item.color.border};"
        onclick="checkEnglishAnswer(this, '${item.key}', '${targetKey}', '${item.color.en} ${item.shape.en}')">
        <div class="balloon-svg-wrap">${getShapeSvg(item.shape.id, item.color.fill)}</div>
        <div class="option-word" style="font-size:1.1rem;">${item.color.shortEn} ${item.shape.en}</div>
      </button>
    `
    )
    .join('');

  repeatEnglishPrompt();
}

function getShapeSvg(shapeId, fill) {
  let poly = '';
  if (shapeId === 'circle') {
    poly = `<circle cx="50" cy="50" r="38" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'square') {
    poly = `<rect x="16" y="16" width="68" height="68" rx="6" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'star') {
    poly = `<polygon points="50,8 61,36 91,38 68,57 76,87 50,70 24,87 32,57 9,38 39,36" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'heart') {
    poly = `<path d="M50,84 C20,62 12,42 12,28 C12,16 22,10 33,10 C42,10 47,16 50,22 C53,16 58,10 67,10 C78,10 88,16 88,28 C88,42 80,62 50,84 Z" fill="${fill}" stroke="#fff" stroke-width="4"/>`;
  } else if (shapeId === 'pentagon') {
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

// ---------- Memory Match (shared by e5 = 3 pairs and Lv.5 = 6 pairs) ----------
function renderEnLv5MemoryMatch12() {
  renderMemoryCards(6, ENGLISH_BANK);
}

function renderMemoryCards(pairCount, bank) {
  const container = document.getElementById('en-options-container');
  const chosenWords = shuffle(bank).slice(0, pairCount);
  const deck = [];
  chosenWords.forEach((item) => {
    deck.push({ pairId: item.word, type: 'word', top: '🔤', main: item.word, word: item.word });
    deck.push({ pairId: item.word, type: 'pic', top: item.emoji, main: 'Picture', word: item.word });
  });
  const shuffledDeck = shuffle(deck);

  state.currentQuestion = {
    deck: shuffledDeck,
    flipped: [],
    matched: 0,
    totalPairs: pairCount,
    lock: false,
  };

  document.getElementById('en-prompt-text').textContent =
    `${PET_CONFIG.duncanName}: "Flip two cards! Match each word with its picture!"`;

  setEnglishStageCard(
    `🃏 ${pairCount * 2}-Card Match`,
    `<div style="font-size:1.05rem; color:#475569; font-weight:800;">Matched: <span id="mem-pair-progress">0 / ${pairCount}</span> pairs</div>`,
    '🔊 Tap a card to flip it and hear the word'
  );

  state.currentSpeech = [
    { text: 'Flip two cards! Match each word with its picture!', lang: 'en-US' },
  ];

  container.className = pairCount <= 3 ? 'options-grid memory-grid-mode' : 'options-grid memory-grid-12';
  container.innerHTML = shuffledDeck
    .map(
      (c, idx) => `
      <button class="memory-card ${pairCount > 3 ? 'compact-card' : ''}" id="mem12-card-${idx}" onclick="handleFlipCard12(${idx})">
        <div class="paw-back">🐾</div>
        <div class="paw-label">Tap</div>
        <div class="card-front">
          <div style="font-size:${c.type === 'pic' ? '2.4rem' : '1.2rem'};">${c.top}</div>
          <div style="font-size:1.05rem; font-weight:900; color:#1e293b;">${c.type === 'pic' ? '' : c.main}</div>
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
  btn.classList.add('flipped');

  say(q.deck[idx].word);
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
          onCorrectAnswer('en', 'All matched!', [
            { text: 'Awesome memory! You matched them all!', lang: 'en-US' },
          ]);
        }
      }, 400);
    } else {
      setTimeout(() => {
        [i1, i2].forEach((i) => {
          const b = document.getElementById(`mem12-card-${i}`);
          if (b) b.classList.remove('flipped');
        });
        q.flipped = [];
        q.lock = false;
      }, 900);
    }
  }
}

// ---------- Big Stars Lv.6: Rocket Girl Reading & Grammar ----------
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
    `${PET_CONFIG.duncanName}: "Read the short story and pick the best answer!"`;

  setEnglishStageCard(
    quiz.badge,
    `<div style="font-size:1.08rem; color:#1e293b; background:#f8fafc; padding:12px; border-radius:12px; border:1px solid #cbd5e1; text-align:left; line-height:1.55; margin:8px 0;">
      "${quiz.passage}"
    </div>
    <div style="font-size:1.15rem; font-weight:900; color:#4f46e5;">❓ ${quiz.question}</div>`,
    '🔊 Tap to hear the story'
  );

  state.currentSpeech = [
    { text: quiz.passage.replace('______', 'blank'), lang: 'en-US' },
    { text: quiz.question, lang: 'en-US' },
  ];

  container.className = 'options-grid english-options';
  container.innerHTML = opts
    .map(
      (opt) => `
      <button class="option-card" style="padding:14px;" onclick="checkEnglishAnswer(this, '${jsq(opt)}', '${jsq(quiz.ans)}', '${jsq(quiz.ans)}')">
        <div class="option-word" style="font-size:1.1rem;">${opt}</div>
      </button>
    `
    )
    .join('');

  repeatEnglishPrompt();
}

function checkEnglishAnswer(btn, chosen, correct, spokenLabel) {
  if (state.isAnswering) return;
  if (String(chosen) === String(correct)) {
    btn.classList.add('correct');
    onCorrectAnswer('en', spokenLabel || correct, [{ text: `Yes! ${spokenLabel || correct}!`, lang: 'en-US' }]);
  } else {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 500);
    onWrongAnswer('en', 'Oops! Try again! Listen to the clue.');
  }
}

// ============================================================================
// 🐱 Corie's Math Fun (Little Stars e1~e6 + Big Stars 1~6)
// ============================================================================
function startMathGame(lv = 'e1') {
  state.currentMode = 'math';
  state.mathLevel = lv;
  state.round = 1;
  state.totalRounds = isEasyLevel(lv) ? 6 : 8;
  showScreen('math');
  syncMathLevelChips();
  loadMathQuestion();
}

function switchMathLevel(lv) {
  playClickTick();
  state.mathLevel = lv;
  state.round = 1;
  state.totalRounds = isEasyLevel(lv) ? 6 : 8;
  syncMathLevelChips();
  loadMathQuestion();
}

function syncMathLevelChips() {
  const track = isEasyLevel(state.mathLevel) ? 'little' : 'big';
  const bar = document.getElementById('math-level-chips');
  if (bar) {
    const list = LEVEL_DEFINITIONS[track].math;
    bar.innerHTML =
      `<span class="bar-label">${track === 'little' ? '🐣 Easy:' : '🎓 Hard:'}</span>` +
      list
        .map((item) => {
          const active = String(item.id) === String(state.mathLevel) ? 'active' : '';
          const arg = typeof item.id === 'string' ? `'${item.id}'` : item.id;
          return `<button class="chip-btn ${active}" onclick="switchMathLevel(${arg})">${item.chip}</button>`;
        })
        .join('');
  }
}

function repeatMathPrompt() {
  if (state.currentSpeech && state.currentSpeech.length) {
    speakSequence(state.currentSpeech);
  }
}

function makeNumericDistractors(correct, count = 3, stepRange = [1, 10], minVal = 0) {
  const set = new Set([correct]);
  const list = [correct];
  let guard = 0;
  while (list.length < count + 1 && guard < 80) {
    guard++;
    const delta = randInt(stepRange[0], stepRange[1]) * (Math.random() < 0.5 ? 1 : -1);
    const cand = correct + delta;
    if (cand >= minVal && !set.has(cand)) {
      set.add(cand);
      list.push(cand);
    }
  }
  while (list.length < count + 1) {
    const fallback = correct + list.length;
    if (!set.has(fallback)) {
      set.add(fallback);
      list.push(fallback);
    }
  }
  return shuffle(list);
}

function loadMathQuestion() {
  state.isAnswering = false;
  updateRoundProgressUI('math');

  const lv = state.mathLevel;
  if (lv === 'e1') renderMathEasy1Count();
  else if (lv === 'e2') renderMathEasy2PicAddSub();
  else if (lv === 'e3') renderMathEasy3CompareAndTenFrame();
  else if (lv === 'e4') renderMathEasy4LittleShop();
  else if (lv === 'e5') renderMathEasy5PatternTrain();
  else if (lv === 'e6') renderMathEasy6FairShare();
  else if (lv === 1) renderMathLv1MultiDigit();
  else if (lv === 2) renderMathLv2MultDivCompare();
  else if (lv === 3) renderMathLv3EquationAndWordProblem();
  else if (lv === 4) renderMathLv4CashierPro();
  else if (lv === 5) renderMathLv5OlympiadSequence();
  else renderMathLv6FractionAndGeometry();
}

function tapCountItem(el) {
  playClickTick();
  el.classList.toggle('counted');
  const count = document.querySelectorAll('#math-visual-stage .countable-item.counted').length;
  if (count > 0) say(String(count));
}

// ---------- Little Stars e1: Count 1 to 10 ----------
function renderMathEasy1Count() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');

  const item = pickRandom(COUNT_ITEMS);
  const ans = randInt(1, 10);
  const opts = makeNumericDistractors(ans, 3, [1, 3], 1);

  document.getElementById('math-prompt-text').textContent =
    `${PET_CONFIG.corieName}: "How many ${item.many} do you see? Tap them to count!"`;

  const icons = Array.from({ length: ans }, () =>
    `<div class="countable-item" onclick="tapCountItem(this)">${item.emoji}</div>`
  ).join('');

  stage.innerHTML = `<div class="math-group" style="max-width:420px;">${icons}</div>`;
  eqBar.innerHTML = `How many ${item.many}? <span class="question-mark-pill">?</span>`;

  state.currentSpeech = [
    { text: `How many ${item.many} do you see? Tap them to count!`, lang: 'en-US' },
  ];

  container.className = 'options-grid math-options';
  container.innerHTML = opts
    .map(
      (n) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${ans})">${n}</button>`
    )
    .join('');

  repeatMathPrompt();
}

// ---------- Little Stars e2: Picture Add & Take Away (within 10) ----------
function renderMathEasy2PicAddSub() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');

  const isAdd = state.round % 2 === 1;
  const item = pickRandom(EAT_ITEMS);
  let a, b, ans;

  if (isAdd) {
    a = randInt(1, 5);
    b = randInt(1, 5);
    ans = a + b;
    const g1 = Array.from({ length: a }, () => `<div class="countable-item" onclick="tapCountItem(this)">${item.emoji}</div>`).join('');
    const g2 = Array.from({ length: b }, () => `<div class="countable-item" onclick="tapCountItem(this)">${item.emoji}</div>`).join('');
    stage.innerHTML = `
      <div class="math-group">${g1}</div>
      <div class="math-operator">+</div>
      <div class="math-group">${g2}</div>
      <div class="math-operator">=</div>
      <div class="math-question-box">?</div>
    `;
    eqBar.innerHTML = `${a} + ${b} = <span class="question-mark-pill">?</span>`;
    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "${a} ${plural(a, item.one, item.many)} plus ${b} more. How many in all?"`;
    state.currentSpeech = [
      { text: `${a} plus ${b} equals how many?`, lang: 'en-US' },
    ];
  } else {
    a = randInt(3, 9);
    b = randInt(1, a - 1);
    ans = a - b;
    const icons = Array.from({ length: a }, (_, idx) => {
      const crossed = idx >= ans ? 'crossed-out' : '';
      return `<div class="countable-item ${crossed}" onclick="tapCountItem(this)">${item.emoji}</div>`;
    }).join('');
    stage.innerHTML = `<div class="math-group" style="max-width:420px;">${icons}</div>`;
    eqBar.innerHTML = `${a} − ${b} = <span class="question-mark-pill">?</span>`;
    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "We had ${a} ${item.many} and ate ${b}. How many are left?"`;
    state.currentSpeech = [
      { text: `We had ${a} ${item.many} and ate ${b}. ${a} minus ${b} equals how many?`, lang: 'en-US' },
    ];
  }

  const opts = makeNumericDistractors(ans, 3, [1, 3], 0);
  container.className = 'options-grid math-options';
  container.innerHTML = opts
    .map((n) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${ans})">${n}</button>`)
    .join('');

  repeatMathPrompt();
}

// ---------- Little Stars e3: Bigger / Smaller & Ten-Frame Make 10 ----------
function renderMathEasy3CompareAndTenFrame() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');

  if (state.round % 2 === 1) {
    // Ten-frame: how many more to make 10?
    const item = pickRandom(EAT_ITEMS);
    const have = randInt(2, 9);
    const ans = 10 - have;
    const cells = Array.from({ length: 10 }, (_, i) => {
      if (i < have) return `<div class="ten-frame-cell">${item.emoji}</div>`;
      return `<div class="ten-frame-cell empty-slot" onclick="this.classList.toggle('counted'); playClickTick();">?</div>`;
    }).join('');

    stage.innerHTML = `
      <div class="ten-frame-wrap">
        <div class="ten-frame-grid">${cells}</div>
        <div style="font-weight:800; color:#475569;">A full box holds 10! We have ${have}.</div>
      </div>
    `;
    eqBar.innerHTML = `${have} + <span class="question-mark-pill">?</span> = 10`;
    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "We have ${have}. How many more do we need to make 10?"`;
    state.currentSpeech = [
      { text: `We have ${have}. How many more to make 10?`, lang: 'en-US' },
    ];

    const opts = makeNumericDistractors(ans, 3, [1, 3], 1);
    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map((n) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${ans})">${n}</button>`)
      .join('');
  } else {
    // Which number is bigger?
    const a = randInt(1, 15);
    let b = randInt(1, 15);
    while (b === a) b = randInt(1, 15);
    const askBigger = Math.random() < 0.7;
    const ans = askBigger ? Math.max(a, b) : Math.min(a, b);
    const item = pickRandom(COUNT_ITEMS);

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">⚖️ ${askBigger ? 'Which is BIGGER?' : 'Which is SMALLER?'}</div>
        <div style="font-size:1.1rem; color:#475569; margin-top:4px;">Tap the ${askBigger ? 'bigger' : 'smaller'} number!</div>
      </div>
    `;
    eqBar.innerHTML = `${item.emoji} ${a} &nbsp; or &nbsp; ${item.emoji} ${b}`;
    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "Which number is ${askBigger ? 'BIGGER' : 'SMALLER'}: ${a} or ${b}?"`;
    state.currentSpeech = [
      { text: `Which number is ${askBigger ? 'bigger' : 'smaller'}, ${a} or ${b}?`, lang: 'en-US' },
    ];

    container.className = 'options-grid math-options';
    container.innerHTML = [a, b]
      .map((n) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${ans})">${n}</button>`)
      .join('');
  }

  repeatMathPrompt();
}

// ---------- Little Stars e4: Little Toy Shop ($1 & $5 coins up to $10) ----------
function renderMathEasy4LittleShop() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');
  eqBar.innerHTML = '';
  container.innerHTML = '';

  const toy = pickRandom(LITTLE_SHOP_ITEMS);
  const price = randInt(2, 10);

  state.currentQuestion = {
    targetAmount: price,
    trayCoins: [],
    toy,
    easyMode: true,
  };

  document.getElementById('math-prompt-text').textContent =
    `${PET_CONFIG.corieName}: "The ${toy.name} costs $${price}. Put $${price} in the tray!"`;

  state.currentSpeech = [
    { text: `The ${toy.name} costs ${price} dollars. Tap the coins to make ${price} dollars!`, lang: 'en-US' },
  ];

  renderLittleShopStage();
  repeatMathPrompt();
}

function renderLittleShopStage() {
  const stage = document.getElementById('math-visual-stage');
  const q = state.currentQuestion;
  const sum = q.trayCoins.reduce((a, b) => a + b, 0);

  stage.innerHTML = `
    <div class="cashier-shop-wrap">
      <div class="shop-items-row">
        <div class="shop-item-card">
          <div class="shop-item-emoji">${q.toy.emoji}</div>
          <div class="shop-item-name">${q.toy.name}</div>
          <div class="shop-price-tag">$${q.targetAmount}</div>
        </div>
      </div>

      <div class="coin-tray-box" style="width:100%; max-width:460px;">
        <div class="tray-header">
          <span>📥 Coin Tray (tap a coin to take it back)</span>
          <span>Total: <strong>$${sum}</strong> / $${q.targetAmount}</span>
        </div>
        <div class="tray-coins-list">
          ${
            q.trayCoins.length === 0
              ? '<span style="color:#94a3b8; font-weight:700;">Tap +$1 or +$5 below...</span>'
              : q.trayCoins
                  .map(
                    (v, idx) =>
                      `<button class="coin-token coin-${v}" onclick="removeCashierMoney(${idx})">$${v}</button>`
                  )
                  .join('')
          }
        </div>
      </div>

      <div class="cashier-btn-grid">
        <button class="coin-action-btn btn-add-1" onclick="addCashierMoney(1)">🪙 +$1</button>
        <button class="coin-action-btn btn-add-5" onclick="addCashierMoney(5)">🪙 +$5</button>
        <button class="coin-action-btn btn-clear-coins" onclick="clearCashierTray()">🗑️ Clear</button>
        <button class="coin-action-btn btn-checkout" onclick="submitCashierCheckout()">✅ Pay $${sum}</button>
      </div>
    </div>
  `;
}

// ---------- Little Stars e5: Pattern & Number Train ----------
function renderMathEasy5PatternTrain() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');
  eqBar.innerHTML = '';

  if (state.round % 2 === 1) {
    // Emoji ABAB pattern
    const pairs = [
      ['🍎', '🍌'], ['🐱', '🐶'], ['☀️', '🌙'], ['⭐', '🌈'], ['🍓', '🧁'], ['🚗', '🚌'],
    ];
    const [A, B] = pickRandom(pairs);
    const seq = [A, B, A, B, A];
    const ans = A;
    const wrongPool = ['🍇', '🎈', '🐸', '🍪'].filter((x) => x !== A && x !== B);
    const opts = shuffle([A, B, wrongPool[0]]);

    const cars = [A, B, A, B, '?']
      .map((c) => `<div class="train-car ${c === '?' ? 'mystery-car' : ''}">${c}</div>`)
      .join('<span class="train-link">🔗</span>');

    stage.innerHTML = `<div class="train-track-wrap"><span class="train-engine">🚂</span>${cars}</div>`;
    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "Look at the train pattern! What comes next?"`;
    state.currentSpeech = [
      { text: 'Look at the pattern on the train! What comes next?', lang: 'en-US' },
    ];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map(
        (em) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, '${em}', '${ans}')">${em}</button>`
      )
      .join('');
    void seq;
  } else {
    // Simple +1 or +2 counting train
    const step = Math.random() < 0.7 ? 1 : 2;
    const start = randInt(1, 5);
    const arr = [0, 1, 2, 3, 4].map((i) => start + i * step);
    const ans = arr[4];
    const opts = makeNumericDistractors(ans, 3, [1, 3], 1);

    const cars = arr
      .map((n, i) => `<div class="train-car ${i === 4 ? 'mystery-car' : ''}">${i === 4 ? '?' : n}</div>`)
      .join('<span class="train-link">🔗</span>');

    stage.innerHTML = `<div class="train-track-wrap"><span class="train-engine">🚂</span>${cars}</div>`;
    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "Count along the train (+${step} each time)! What number goes in the ? car?"`;
    state.currentSpeech = [
      { text: `${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]}... What number comes next?`, lang: 'en-US' },
    ];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map((n) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${ans})">${n}</button>`)
      .join('');
  }

  repeatMathPrompt();
}

// ---------- Little Stars e6: Share the Cookies Fairly ----------
function renderMathEasy6FairShare() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');

  const item = pickRandom(EAT_ITEMS);
  const each = randInt(1, 5);
  const total = each * 2;
  const opts = makeNumericDistractors(each, 3, [1, 3], 1);

  const plateIcons = Array.from({ length: each }, () => `<span style="font-size:2rem;">${item.emoji}</span>`).join('');

  stage.innerHTML = `
    <div class="fair-share-wrap">
      <div class="share-plate corie-plate">
        <div class="plate-owner">🐱 ${PET_CONFIG.corieName}'s plate</div>
        <div class="plate-items">${plateIcons}</div>
      </div>
      <div class="share-plate">
        <div class="plate-owner">🐶 ${PET_CONFIG.duncanName}'s plate</div>
        <div class="plate-items">${plateIcons}</div>
      </div>
    </div>
  `;
  eqBar.innerHTML = `${total} ${item.many} shared by 2 friends = <span class="question-mark-pill">?</span> each`;

  document.getElementById('math-prompt-text').textContent =
    `${PET_CONFIG.corieName}: "Share ${total} ${item.many} fairly between ${PET_CONFIG.corieName} and ${PET_CONFIG.duncanName}. How many does each friend get?"`;

  state.currentSpeech = [
    { text: `We have ${total} ${item.many} to share fairly between 2 friends. How many does each friend get?`, lang: 'en-US' },
  ];

  container.className = 'options-grid math-options';
  container.innerHTML = opts
    .map((n) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${each})">${n}</button>`)
    .join('');

  repeatMathPrompt();
}

// ---------- Big Stars Lv.1: Big Number Add & Subtract ----------
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
    `${PET_CONFIG.corieName}: "Add or subtract the ones first, then the tens and hundreds!"`;

  stage.innerHTML = `
    <div class="word-problem-card" style="text-align:center;">
      <div class="wp-badge">🧮 Big Number Math</div>
      <div style="font-size:1.05rem; color:#475569; font-weight:800; margin-top:4px;">
        ${item.emoji} Place value hint: <strong>${a}</strong> = ${hA > 0 ? hA + ' hundreds + ' : ''}${tA} tens + ${uA} ones
      </div>
    </div>
  `;

  eqBar.innerHTML = `<span style="font-size:2.3rem; font-weight:900;">${a} <span style="color:#f59e0b;">${op}</span> ${b} = <span style="color:#ec4899;">?</span></span>`;

  state.currentSpeech = [
    { text: `What is ${a} ${isAdd ? 'plus' : 'minus'} ${b}?`, lang: 'en-US' },
  ];

  container.className = 'options-grid math-options';
  container.innerHTML = opts
    .map(
      (n) => `
      <button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${ans})">${n}</button>
    `
    )
    .join('');

  repeatMathPrompt();
}

// ---------- Big Stars Lv.2: Multiply, Divide & Compare ----------
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
      `${PET_CONFIG.corieName}: "There are ${b} groups with ${a} in each group. How many in all?"`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">✖️ Multiplication</div>
        <div style="font-size:1rem; color:#475569; font-weight:800;">💡 Hint: ${a} in each group × ${b} groups</div>
      </div>
    `;
    eqBar.innerHTML = `<span style="font-size:2.4rem; font-weight:900;">${a} × ${b} = <span style="color:#ec4899;">?</span></span>`;
    state.currentSpeech = [{ text: `What is ${a} times ${b}?`, lang: 'en-US' }];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map((n) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${ans})">${n}</button>`)
      .join('');
  } else if (mode === 2) {
    const divisor = randInt(3, 9);
    const quotient = randInt(4, 12);
    const dividend = divisor * quotient;
    const opts = makeNumericDistractors(quotient, 3, [1, 4]);

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "Share ${dividend} equally into ${divisor} groups. How many in each group?"`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">➗ Division</div>
        <div style="font-size:1rem; color:#475569; font-weight:800;">💡 Think: ${divisor} × (?) = ${dividend}</div>
      </div>
    `;
    eqBar.innerHTML = `<span style="font-size:2.4rem; font-weight:900;">${dividend} ÷ ${divisor} = <span style="color:#ec4899;">?</span></span>`;
    state.currentSpeech = [{ text: `What is ${dividend} divided by ${divisor}?`, lang: 'en-US' }];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map((n) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${quotient})">${n}</button>`)
      .join('');
  } else {
    const a1 = randInt(4, 9), b1 = randInt(4, 9);
    const leftVal = a1 * b1;
    const a2 = randInt(15, 45), b2 = randInt(10, 35);
    const rightVal = a2 + b2;
    const correctSym = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '=';

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "Solve both sides first, then pick >, = or <!"`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">⚖️ Compare Both Sides</div>
        <div style="font-size:1rem; color:#475569; font-weight:800;">Pick >, = or < for the box in the middle!</div>
      </div>
    `;
    eqBar.innerHTML = `
      <span style="font-size:1.9rem; font-weight:900;">
        (${a1} × ${b1}) <span style="color:#ec4899; padding:0 10px;">[ ? ]</span> (${a2} + ${b2})
      </span>
    `;
    state.currentSpeech = [
      { text: `Compare ${a1} times ${b1} and ${a2} plus ${b2}. Which side is bigger?`, lang: 'en-US' },
    ];

    container.className = 'options-grid math-options';
    container.innerHTML = ['>', '=', '<']
      .map((sym) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, '${sym}', '${correctSym}')">${sym}</button>`)
      .join('');
  }
  repeatMathPrompt();
}

// ---------- Big Stars Lv.3: Two-Step Math, Mystery Number & Word Problems ----------
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
      `${PET_CONFIG.corieName}: "Remember the rule: multiply FIRST, then add!"`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">📐 Multiply First, Then Add</div>
        <div style="font-size:1rem; color:#4f46e5; font-weight:800;">💡 First do ${b} × ${c}, then add ${a}!</div>
      </div>
    `;
    eqBar.innerHTML = `<span style="font-size:2.3rem; font-weight:900;">${a} + ${b} × ${c} = <span style="color:#ec4899;">?</span></span>`;
    state.currentSpeech = [{ text: `Multiply first, then add: what is ${a} plus ${b} times ${c}?`, lang: 'en-US' }];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map((n) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${ans})">${n}</button>`)
      .join('');
  } else if (mode === 2) {
    const a = randInt(3, 8);
    const x = randInt(4, 11);
    const b = randInt(5, 20);
    const c = a * x + b;
    const opts = makeNumericDistractors(x, 3, [1, 4]);

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "Find the mystery number in the [ ? ] box!"`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">🕵️ Mystery Number</div>
        <div style="font-size:1rem; color:#475569; font-weight:800;">💡 Hint: first do ${c} − ${b}, then divide by ${a}!</div>
      </div>
    `;
    eqBar.innerHTML = `<span style="font-size:2.2rem; font-weight:900;">${a} × <span style="color:#ec4899;">[ ? ]</span> + ${b} = ${c}</span>`;
    state.currentSpeech = [{ text: `${a} times what number, plus ${b}, equals ${c}?`, lang: 'en-US' }];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map((n) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${x})">${n}</button>`)
      .join('');
  } else {
    const item = pickRandom(MATH_ITEMS);
    const kid = pickRandom(STORY_NAMES);
    const price = randInt(12, 25);
    const qty = randInt(3, 6);
    const paid = 200;
    const ans = paid - price * qty;
    const opts = makeNumericDistractors(ans, 3, [5, 15]);
    const story = `${kid} buys ${qty} ${item.many} (${item.emoji}). Each one costs $${price}. ${kid} pays with $${paid}. How much change does ${kid} get back?`;

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "Read the shopping story and find the change!"`;

    stage.innerHTML = `
      <div class="word-problem-card">
        <div class="wp-badge">📖 Shopping Story</div>
        <div class="wp-text">${story}</div>
      </div>
    `;
    eqBar.innerHTML = `<span style="font-size:1.6rem; font-weight:900; color:#4f46e5;">$${paid} − ($${price} × ${qty}) = $?</span>`;
    state.currentSpeech = [{ text: story, lang: 'en-US' }];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map((n) => `<button class="option-card num-btn" style="font-size:1.75rem;" onclick="checkMathAnswer(this, ${n}, ${ans})">$${n}</button>`)
      .join('');
  }
  repeatMathPrompt();
}

// ---------- Big Stars Lv.4: Big Store Cashier ($100 bills & change) ----------
function renderMathLv4CashierPro() {
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');
  eqBar.innerHTML = '';
  container.innerHTML = '';

  const i1 = pickRandom(MATH_ITEMS);
  const i2 = pickRandom(MATH_ITEMS.filter((x) => x.one !== i1.one));
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
    easyMode: false,
  };

  document.getElementById('math-prompt-text').textContent = isChangeMode
    ? `${PET_CONFIG.corieName}: "Total is $${totalCost}. The buyer pays $${customerPaid}. Put the right CHANGE in the tray!"`
    : `${PET_CONFIG.corieName}: "Add up both items and put the exact money in the tray!"`;

  state.currentSpeech = [
    {
      text: isChangeMode
        ? `The total is ${totalCost} dollars. The buyer pays ${customerPaid} dollars. Put the right change in the tray!`
        : `Add up the items and put the exact money in the tray!`,
      lang: 'en-US',
    },
  ];

  renderCashierProStage();
  repeatMathPrompt();
}

function renderCashierProStage() {
  const stage = document.getElementById('math-visual-stage');
  const q = state.currentQuestion;
  if (q.easyMode) {
    renderLittleShopStage();
    return;
  }
  const currentSum = q.trayCoins.reduce((a, b) => a + b, 0);

  stage.innerHTML = `
    <div class="cashier-shop-wrap">
      <div class="word-problem-card" style="width:100%;">
        <div class="wp-badge">🛒 Store Cashier: ${q.isChangeMode ? 'Give Change' : 'Pay the Total'}</div>
        <div style="display:flex; justify-content:space-around; flex-wrap:wrap; gap:10px; margin:8px 0;">
          <div style="background:#f8fafc; padding:8px 14px; border-radius:12px; border:1px solid #cbd5e1; font-weight:800;">
            ${q.i1.emoji} ${q.i1.one} $${q.p1} × ${q.qty1} = <strong>$${q.p1 * q.qty1}</strong>
          </div>
          <div style="background:#f8fafc; padding:8px 14px; border-radius:12px; border:1px solid #cbd5e1; font-weight:800;">
            ${q.i2.emoji} ${q.i2.one} $${q.p2} × 1 = <strong>$${q.p2}</strong>
          </div>
        </div>
        <div style="text-align:center; font-size:1.1rem; font-weight:900; color:#1e293b;">
          🧾 Total: <span style="color:#4f46e5;">$${q.totalCost}</span>
          ${q.isChangeMode ? ` ｜ 💵 Paid: <span style="color:#16a34a;">$${q.customerPaid}</span> ｜ 🎯 Change: <span style="color:#ec4899;">$ ?</span>` : ''}
        </div>
      </div>

      <div class="coin-tray-box" style="width:100%;">
        <div class="tray-header">
          <span>📥 Money Tray (tap a coin or bill to remove)</span>
          <span style="color:#0284c7; font-size:1.15rem;">In tray: $${currentSum}</span>
        </div>
        <div class="tray-coins-list">
          ${
            q.trayCoins.length === 0
              ? '<span style="color:#94a3b8; font-weight:700;">Tap the bills and coins below...</span>'
              : q.trayCoins
                  .map(
                    (val, idx) =>
                      `<button class="coin-token coin-${val}" onclick="removeCashierMoney(${idx})">$${val}</button>`
                  )
                  .join('')
          }
        </div>
      </div>

      <div class="cashier-btn-grid">
        <button class="coin-action-btn btn-add-100" onclick="addCashierMoney(100)">💵 +$100</button>
        <button class="coin-action-btn btn-add-50" onclick="addCashierMoney(50)">🪙 +$50</button>
        <button class="coin-action-btn btn-add-10" onclick="addCashierMoney(10)">🪙 +$10</button>
        <button class="coin-action-btn btn-add-5" onclick="addCashierMoney(5)">🪙 +$5</button>
        <button class="coin-action-btn btn-add-1" onclick="addCashierMoney(1)">🪙 +$1</button>
      </div>

      <div style="display:flex; justify-content:center; gap:12px; margin-top:6px;">
        <button class="coin-action-btn btn-clear-coins" onclick="clearCashierTray()">🗑️ Clear</button>
        <button class="coin-action-btn btn-checkout" onclick="submitCashierCheckout()">✅ Done ($${currentSum})</button>
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
    onCorrectAnswer('math', `$${sum}`, [{ text: `That's right! ${sum} dollars!`, lang: 'en-US' }]);
  } else {
    onWrongAnswer(
      'math',
      sum > q.targetAmount
        ? `You put $${sum}. That is too much! Tap a coin in the tray to take it back.`
        : `You only have $${sum}. Add more coins!`
    );
  }
}

// ---------- Big Stars Lv.5: Super Number Train ----------
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
        hint: `Add ${step} each time (+${step})`,
      };
    },
    () => {
      const step = randInt(7, 12);
      const start = randInt(65, 98);
      return {
        arr: [0, 1, 2, 3, 4].map((i) => start - i * step),
        hint: `Subtract ${step} each time (−${step})`,
      };
    },
    () => {
      const start = randInt(2, 5);
      return {
        arr: [start, start * 2, start * 4, start * 8, start * 16],
        hint: 'Double the number each time (×2)',
      };
    },
    () => {
      const base = randInt(1, 4);
      return {
        arr: [0, 1, 2, 3, 4].map((i) => (base + i) * (base + i)),
        hint: 'Square numbers: 1×1, 2×2, 3×3, 4×4...',
      };
    },
    () => {
      const a = randInt(1, 4), b = randInt(2, 5);
      const c = a + b, d = b + c, e = c + d;
      return {
        arr: [a, b, c, d, e],
        hint: 'Add the two cars before it to get the next car!',
      };
    },
  ];

  const chosen = pickRandom(seqTypes)();
  const missingIdx = randInt(3, 4);
  const ans = chosen.arr[missingIdx];
  const opts = makeNumericDistractors(ans, 3, [2, 9]);

  document.getElementById('math-prompt-text').textContent =
    `${PET_CONFIG.corieName}: "Find the pattern on the train! What number goes in the ? car?"`;

  const carsHtml = chosen.arr
    .map((n, i) => `<div class="train-car ${i === missingIdx ? 'mystery-car' : ''}">${i === missingIdx ? '?' : n}</div>`)
    .join('<span class="train-link">🔗</span>');

  stage.innerHTML = `
    <div class="word-problem-card" style="text-align:center;">
      <div class="wp-badge">🚂 Super Number Train</div>
      <div class="train-track-wrap"><span class="train-engine">🚂</span>${carsHtml}</div>
      <div style="font-size:0.95rem; color:#4f46e5; font-weight:800;">💡 Hint: ${chosen.hint}</div>
    </div>
  `;
  eqBar.innerHTML = '';

  state.currentSpeech = [
    { text: `Look at the numbers on the train. Hint: ${chosen.hint}. What is the missing number?`, lang: 'en-US' },
  ];

  container.className = 'options-grid math-options';
  container.innerHTML = opts
    .map((n) => `<button class="option-card num-btn" onclick="checkMathAnswer(this, ${n}, ${ans})">${n}</button>`)
    .join('');

  repeatMathPrompt();
}

// ---------- Big Stars Lv.6: Pizza Fractions & Rectangle Area / Perimeter ----------
function renderMathLv6FractionAndGeometry() {
  const stage = document.getElementById('math-visual-stage');
  const eqBar = document.getElementById('math-equation-bar');
  const container = document.getElementById('math-options-container');

  const isGeo = state.round % 2 === 0;
  if (!isGeo) {
    const fractions = [
      { num: 1, den: 3, label: '1/3' },
      { num: 2, den: 3, label: '2/3' },
      { num: 1, den: 4, label: '1/4' },
      { num: 3, den: 4, label: '3/4' },
      { num: 2, den: 5, label: '2/5' },
      { num: 3, den: 5, label: '3/5' },
      { num: 3, den: 8, label: '3/8' },
      { num: 5, den: 8, label: '5/8' },
    ];
    const target = pickRandom(fractions);
    const distractors = shuffle(fractions.filter((f) => f.label !== target.label)).slice(0, 3);
    const opts = shuffle([target, ...distractors]);

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "${target.num} out of ${target.den} slices are colored. Which fraction is that?"`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">🍕 Pizza Fractions</div>
        <div style="margin:8px auto;">${buildFractionPieSvg(target.num, target.den)}</div>
        <div style="font-weight:800; color:#475569;"><strong>${target.num}</strong> colored out of <strong>${target.den}</strong> equal slices</div>
      </div>
    `;
    eqBar.innerHTML = '';

    state.currentSpeech = [
      { text: `The pie has ${target.den} equal slices, and ${target.num} of them are colored. Pick the fraction!`, lang: 'en-US' },
    ];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map(
        (o) => `<button class="option-card num-btn" style="font-size:1.7rem;" onclick="checkMathAnswer(this, '${o.label}', '${target.label}')">${o.label}</button>`
      )
      .join('');
  } else {
    const w = randInt(5, 14);
    const h = randInt(3, 9);
    const askArea = Math.random() < 0.5;
    const ans = askArea ? w * h : (w + h) * 2;
    const unitLabel = askArea ? 'cm²' : 'cm';
    const formula = askArea ? 'Area = length × width' : 'Perimeter = (length + width) × 2';
    const opts = makeNumericDistractors(ans, 3, [2, 10]);

    document.getElementById('math-prompt-text').textContent =
      `${PET_CONFIG.corieName}: "Find the ${askArea ? 'AREA' : 'PERIMETER'} of this rectangle!"`;

    stage.innerHTML = `
      <div class="word-problem-card" style="text-align:center;">
        <div class="wp-badge">📐 Rectangle ${askArea ? 'Area' : 'Perimeter'}</div>
        <div class="geometry-rect-box" style="margin:8px auto;">Length ${w} cm × Width ${h} cm</div>
        <div style="font-weight:800; color:#4f46e5;">💡 Formula: ${formula}</div>
      </div>
    `;
    eqBar.innerHTML = '';

    state.currentSpeech = [
      { text: `The rectangle is ${w} centimeters long and ${h} centimeters wide. What is its ${askArea ? 'area' : 'perimeter'}?`, lang: 'en-US' },
    ];

    container.className = 'options-grid math-options';
    container.innerHTML = opts
      .map(
        (n) => `<button class="option-card num-btn" style="font-size:1.6rem;" onclick="checkMathAnswer(this, ${n}, ${ans})">${n} ${unitLabel}</button>`
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
    btn.classList.add('correct');
    onCorrectAnswer('math', String(correct), [{ text: `Great job! The answer is ${correct}!`, lang: 'en-US' }]);
  } else {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 500);
    onWrongAnswer('math', 'Not quite! Count or check the numbers one more time.');
  }
}

// ============================================================================
// 🐟 Shannon's Clock Fun (Little Stars e1~e3 + Big Stars 1~3)
// ============================================================================
function startClockGame(lv = 'e1') {
  state.currentMode = 'clock';
  state.clockLevel = lv;
  state.round = 1;
  state.totalRounds = isEasyLevel(lv) ? 6 : 8;
  showScreen('clock');
  syncClockLevelChips();
  loadClockQuestion();
}

function switchClockLevel(lv) {
  playClickTick();
  state.clockLevel = lv;
  state.round = 1;
  state.totalRounds = isEasyLevel(lv) ? 6 : 8;
  syncClockLevelChips();
  loadClockQuestion();
}

function syncClockLevelChips() {
  const track = isEasyLevel(state.clockLevel) ? 'little' : 'big';
  const bar = document.getElementById('clock-level-chips');
  if (bar) {
    const list = LEVEL_DEFINITIONS[track].clock;
    bar.innerHTML =
      `<span class="bar-label">${track === 'little' ? '🐣 Easy:' : '🎓 Hard:'}</span>` +
      list
        .map((item) => {
          const active = String(item.id) === String(state.clockLevel) ? 'active' : '';
          const arg = typeof item.id === 'string' ? `'${item.id}'` : item.id;
          return `<button class="chip-btn ${active}" onclick="switchClockLevel(${arg})">${item.chip}</button>`;
        })
        .join('');
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
  const dialGroup = document.getElementById('clock-dial-group');

  const lv = state.clockLevel;
  if (lv === 'e1') {
    if (controls) controls.classList.add('hidden');
    renderClockEasy1OclockHalf(container);
  } else if (lv === 'e2') {
    if (controls) controls.classList.add('hidden');
    renderClockEasy2DailyRoutine(container);
  } else if (lv === 'e3') {
    if (controls) controls.classList.remove('hidden');
    if (dialGroup) {
      dialGroup.innerHTML = `
        <button class="dial-btn hour-dial-btn" onclick="adjustInteractiveClock(-1, 0)">🔴 −1 Hour</button>
        <button class="dial-btn hour-dial-btn" onclick="adjustInteractiveClock(1, 0)">🔴 +1 Hour</button>
        <button class="dial-btn min-dial-btn" onclick="adjustInteractiveClock(0, 30)">🔵 +30 Min</button>
      `;
    }
    renderClockEasy3SetHands(container);
  } else if (lv === 1) {
    if (controls) controls.classList.add('hidden');
    renderClockLv1ExactMinute(container);
  } else if (lv === 2) {
    if (controls) controls.classList.add('hidden');
    renderClockLv2ElapsedTime(container);
  } else {
    if (controls) controls.classList.remove('hidden');
    if (dialGroup) {
      dialGroup.innerHTML = `
        <button class="dial-btn hour-dial-btn" onclick="adjustInteractiveClock(-1, 0)">🔴 −1 Hour</button>
        <button class="dial-btn hour-dial-btn" onclick="adjustInteractiveClock(1, 0)">🔴 +1 Hour</button>
        <button class="dial-btn min-dial-btn" onclick="adjustInteractiveClock(0, 10)">🔵 +10 Min</button>
        <button class="dial-btn min-dial-btn" onclick="adjustInteractiveClock(0, 5)">🔵 +5 Min</button>
        <button class="dial-btn min-dial-btn" onclick="adjustInteractiveClock(0, 1)">🔵 +1 Min</button>
        <button class="dial-btn min-dial-btn" onclick="adjustInteractiveClock(0, -1)">🔵 −1 Min</button>
      `;
    }
    renderClockLv3InteractiveSet(container);
  }
}

// ---------- Little Stars e1: O'clock & Half Past (:00 and :30) ----------
function renderClockEasy1OclockHalf(container) {
  const h = randInt(1, 12);
  const m = state.round <= 3 ? 0 : pickRandom([0, 30]);
  const ansStr = formatClockTime(h, m);
  drawAnalogClockSvg(h, m);

  const badge = document.getElementById('clock-activity-badge');
  if (badge) {
    badge.textContent = m === 0 ? '🕐 Blue hand on 12 = :00 (o\'clock)' : '🕡 Blue hand on 6 = :30 (half past)';
  }

  document.getElementById('clock-prompt-text').textContent =
    `${PET_CONFIG.shannonName}: "What time does the clock show?"`;

  const opts = [ansStr];
  while (opts.length < 4) {
    const dh = randInt(1, 12);
    const dm = pickRandom([0, 30]);
    const cand = formatClockTime(dh, dm);
    if (!opts.includes(cand)) opts.push(cand);
  }

  state.currentSpeech = [
    { text: 'What time does the clock show?', lang: 'en-US' },
  ];

  container.innerHTML = shuffle(opts)
    .map(
      (t) => `<button class="option-card num-btn" onclick="checkClockAnswer(this, '${t}', '${ansStr}')">${t}</button>`
    )
    .join('');

  repeatClockPrompt();
}

// ---------- Little Stars e2: My Day (Morning, Noon & Night) ----------
const DAILY_ROUTINES = [
  { h: 7, m: 0, label: '☀️ 7:00 Morning — Wake up & brush teeth!' },
  { h: 8, m: 30, label: '🎒 8:30 Morning — Go to school!' },
  { h: 12, m: 0, label: '🍱 12:00 Noon — Eat yummy lunch!' },
  { h: 3, m: 30, label: '🛝 3:30 Afternoon — Play at the park!' },
  { h: 6, m: 0, label: '🍝 6:00 Evening — Eat dinner with family!' },
  { h: 8, m: 0, label: '📖 8:00 Night — Read a bedtime story!' },
  { h: 9, m: 0, label: '🌙 9:00 Night — Go to sleep! Good night!' },
];

function renderClockEasy2DailyRoutine(container) {
  const item = pickRandom(DAILY_ROUTINES);
  const ansStr = formatClockTime(item.h, item.m);
  drawAnalogClockSvg(item.h, item.m);

  const badge = document.getElementById('clock-activity-badge');
  if (badge) badge.textContent = item.label.replace(/\s*\d+:\d+\s*/, ' ');

  document.getElementById('clock-prompt-text').textContent =
    `${PET_CONFIG.shannonName}: "Look at the clock! What time is it?"`;

  const opts = [ansStr];
  while (opts.length < 4) {
    const dh = randInt(1, 12);
    const dm = pickRandom([0, 30]);
    const cand = formatClockTime(dh, dm);
    if (!opts.includes(cand)) opts.push(cand);
  }

  state.currentSpeech = [
    { text: `${item.label.replace(/^[^\w]+/, '')}. What time does the clock show?`, lang: 'en-US' },
  ];

  container.innerHTML = shuffle(opts)
    .map(
      (t) => `<button class="option-card num-btn" onclick="checkClockAnswer(this, '${t}', '${ansStr}')">${t}</button>`
    )
    .join('');

  repeatClockPrompt();
}

// ---------- Little Stars e3: Move the Hands (:00 or :30) ----------
function renderClockEasy3SetHands(container) {
  container.innerHTML = '';
  const targetH = randInt(1, 12);
  const targetM = pickRandom([0, 30]);
  const userH = (targetH + randInt(2, 5)) % 12 || 12;
  const userM = targetM === 0 ? 30 : 0;

  state.currentQuestion = { targetH, targetM, userH, userM };
  drawAnalogClockSvg(userH, userM);

  const badge = document.getElementById('clock-activity-badge');
  if (badge) {
    badge.textContent = `🎯 Set the clock to ${formatClockTime(targetH, targetM)} (Now: ${formatClockTime(userH, userM)})`;
  }

  document.getElementById('clock-prompt-text').textContent =
    `${PET_CONFIG.shannonName}: "Tap the buttons to set the clock to ${formatClockTime(targetH, targetM)}!"`;

  state.currentSpeech = [
    { text: `Move the hands to set the clock to ${targetH} ${targetM === 0 ? "o'clock" : 'thirty'}!`, lang: 'en-US' },
  ];

  repeatClockPrompt();
}

// ---------- Big Stars Lv.1: Exact 1-Minute Marks & 24-Hour Time ----------
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
      ? '🌆 Afternoon (PM) ➔ 24-Hour Time (add 12 to the hour)'
      : '🔍 Count the little minute marks!';
  }

  document.getElementById('clock-prompt-text').textContent = is24Hr
    ? `${PET_CONFIG.shannonName}: "It is the afternoon (PM). Pick the 24-hour time!"`
    : `${PET_CONFIG.shannonName}: "Count the small marks for the blue minute hand. What time is it?"`;

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
        ? 'It is the afternoon. What is the time on a 24-hour clock?'
        : 'Look closely at the minute hand. What time is it?',
      lang: 'en-US',
    },
  ];

  container.innerHTML = shuffle(opts)
    .map(
      (t) => `<button class="option-card num-btn" onclick="checkClockAnswer(this, '${t}', '${ansStr}')">${t}</button>`
    )
    .join('');

  repeatClockPrompt();
}

// ---------- Big Stars Lv.2: How Much Time Passed? ----------
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
    badge.textContent = `🕒 Start: ${formatClockTime(startH, startM)} ｜ ⏳ +${duration} minutes later = ?`;
  }

  const story = `The clock shows ${formatClockTime(startH, startM)}. What time will it be ${duration} minutes later?`;
  document.getElementById('clock-prompt-text').textContent =
    `${PET_CONFIG.shannonName}: "${story} (60 minutes = 1 new hour!)"`;

  const opts = [ansStr];
  while (opts.length < 4) {
    const t = endTotal + pickRandom([-15, -10, -5, 5, 10, 15, 20]);
    const cand = formatClockTime(Math.floor(t / 60), ((t % 60) + 60) % 60);
    if (!opts.includes(cand)) opts.push(cand);
  }

  state.currentSpeech = [{ text: story, lang: 'en-US' }];

  container.innerHTML = shuffle(opts)
    .map(
      (t) => `<button class="option-card num-btn" onclick="checkClockAnswer(this, '${t}', '${ansStr}')">${t}</button>`
    )
    .join('');

  repeatClockPrompt();
}

// ---------- Big Stars Lv.3: Set the Clock to the Exact Minute ----------
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
    badge.textContent = `🎯 Goal: ${formatClockTime(targetH, targetM)} (Now: ${formatClockTime(userH, userM)})`;
  }

  document.getElementById('clock-prompt-text').textContent =
    `${PET_CONFIG.shannonName}: "Use the buttons below to set the clock to ${formatClockTime(targetH, targetM)}!"`;

  state.currentSpeech = [
    { text: `Use the buttons to set the clock to ${targetH} ${targetM < 10 ? 'oh ' + targetM : targetM}!`, lang: 'en-US' },
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
    badge.textContent = `🎯 Goal: ${formatClockTime(q.targetH, q.targetM)} (Now: ${formatClockTime(q.userH, q.userM)})`;
  }
}

function checkInteractiveClockAnswer() {
  if (state.isAnswering || !state.currentQuestion) return;
  const q = state.currentQuestion;
  if (q.userH % 12 === q.targetH % 12 && q.userM === q.targetM) {
    const label = formatClockTime(q.targetH, q.targetM);
    onCorrectAnswer('clock', label, [
      { text: `Spot on! You set the clock to ${label}!`, lang: 'en-US' },
    ]);
  } else {
    onWrongAnswer(
      'clock',
      `Your clock shows ${formatClockTime(q.userH, q.userM)}. Move it to ${formatClockTime(q.targetH, q.targetM)}!`
    );
  }
}

function checkClockAnswer(btn, chosen, correct) {
  if (state.isAnswering) return;
  if (chosen === correct) {
    btn.classList.add('correct');
    onCorrectAnswer('clock', correct, [{ text: `Yes! It is ${correct}!`, lang: 'en-US' }]);
  } else {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 500);
    onWrongAnswer('clock', 'Look closely at the red hour hand and blue minute hand!');
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
    promptEl.textContent = `🎉 Great job! (${label}) ⭐+1 · 🪙+${earnedCoins} coins!`;
  }

  if (speechItems) speakSequence(speechItems);

  setTimeout(() => {
    if (state.round >= (state.totalRounds || 8)) {
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
  say(msg);
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
    msgEl.innerHTML = `You finished all ${state.totalRounds || 8} questions! (Wins: ${SAVE_DATA.levelClears[clearKey]} 🏅)<br/>You now have <strong>🪙 ${SAVE_DATA.coins} coins</strong> and <strong>⭐ ${SAVE_DATA.totalStars} stars</strong>. Go visit your pet!`;
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
  say('You did it! Great job! Go feed your pet and buy fun hats!');
}

// ============================================================================
// 📊 Progress Modal, Install Modal & Parent Settings Modal
// ============================================================================
function openProgressModal() {
  playClickTick();
  const grid = document.getElementById('progress-summary-grid');
  const totalClears = Object.values(SAVE_DATA.levelClears).reduce((a, b) => a + b, 0);
  const unlockedStickers = Math.min(STICKERS.length, Math.floor(SAVE_DATA.totalStars / 3));

  if (grid) {
    grid.innerHTML = `
      <div class="prog-stat-card">
        Stars
        <strong>⭐ ${SAVE_DATA.totalStars}</strong>
      </div>
      <div class="prog-stat-card">
        Coins
        <strong>🪙 ${SAVE_DATA.coins}</strong>
      </div>
      <div class="prog-stat-card">
        Levels Won
        <strong>🏅 ${totalClears}</strong>
      </div>
      <div class="prog-stat-card">
        Right Answers
        <strong>✅ ${SAVE_DATA.totalCorrect || 0}</strong>
      </div>
      <div class="prog-stat-card">
        Best Streak
        <strong>🔥 ${SAVE_DATA.bestStreak || 0}</strong>
      </div>
      <div class="prog-stat-card">
        Stickers
        <strong>🎁 ${unlockedStickers} / ${STICKERS.length}</strong>
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
  say('Backup code copied!');
}

function promptImportSaveCode() {
  const raw = window.prompt('Paste your backup code here:');
  if (!raw || !raw.trim()) return;
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(raw.trim())));
    if (parsed && typeof parsed.coins === 'number') {
      SAVE_DATA = normalizeSave(parsed);
      saveProgress();
      updateTopCountersUI();
      renderPetSanctuary();
      openProgressModal();
      playSuccessJingle();
      say('Your progress is back!');
    }
  } catch (e) {
    playTryAgainSound();
    say('That code did not work.');
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
  say(`Hello! I am ${PET_CONFIG.duncanName}, and this is ${PET_CONFIG.corieName}. Let's play and learn together!`);
}

function saveSettings() {
  PET_CONFIG.timeLimitMinutes = parseInt(document.getElementById('select-time-limit').value, 10);
  PET_CONFIG.parentPin = document.getElementById('input-parent-pin').value.trim() || '1234';
  PET_CONFIG.corieName = document.getElementById('input-corie-name').value.trim() || 'Corie';
  PET_CONFIG.duncanName = document.getElementById('input-duncan-name').value.trim() || 'Duncan';
  PET_CONFIG.shannonName = document.getElementById('input-shannon-name').value.trim() || 'Shannon';
  PET_CONFIG.ttsMode = document.getElementById('select-tts-mode').value || 'auto';
  PET_CONFIG.speechRate = parseFloat(document.getElementById('input-speech-rate').value) || 1.0;

  const enSel = document.getElementById('select-en-voice');
  if (enSel && enSel.value) PET_CONFIG.enVoiceURI = enSel.value;

  localStorage.setItem('pet_time_limit_mins', String(PET_CONFIG.timeLimitMinutes));
  localStorage.setItem('pet_parent_pin', PET_CONFIG.parentPin);
  localStorage.setItem('pet_corie_name', PET_CONFIG.corieName);
  localStorage.setItem('pet_duncan_name', PET_CONFIG.duncanName);
  localStorage.setItem('pet_shannon_name', PET_CONFIG.shannonName);
  localStorage.setItem('pet_tts_mode', PET_CONFIG.ttsMode);
  localStorage.setItem('pet_speech_rate', String(PET_CONFIG.speechRate));
  localStorage.setItem('pet_en_voice', PET_CONFIG.enVoiceURI);

  initSpeechVoices();
  applyPetNamesToDOM();
  renderPetSanctuary();
  updateTimerUIAndCheckLock();
  closeSettingsModal();
  playSuccessJingle();
  say('Settings saved!');
}

// ============================================================================
// 🚀 Start App
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
