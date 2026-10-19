// ============================================================================
// 🐾 角色與遊戲全域設定（之後想改名字，可直接改這裡，或點網頁右上角 ⚙️ 修改）
// ============================================================================
const PET_CONFIG = {
  corieName: localStorage.getItem('pet_corie_name') || 'Corie',
  duncanName: localStorage.getItem('pet_duncan_name') || 'Duncan',
};

// 獎勵貼紙庫（每 3 顆星解鎖一個）
const STICKERS = ['🎀', '🦄', '🍓', '👑', '🍭', '🧸', '🌈', '🏰', '🦋', '🍦'];

// 英文題庫（適合 5 歲幼兒的高頻可愛單字）
const ENGLISH_BANK = [
  { letter: 'A', word: 'Apple', zh: '蘋果', emoji: '🍎' },
  { letter: 'B', word: 'Ball', zh: '球球', emoji: '⚽' },
  { letter: 'C', word: 'Cat', zh: '小貓咪', emoji: '🐱' },
  { letter: 'D', word: 'Dog', zh: '小狗狗', emoji: '🐶' },
  { letter: 'E', word: 'Elephant', zh: '大象', emoji: '🐘' },
  { letter: 'F', word: 'Fish', zh: '小魚', emoji: '🐟' },
  { letter: 'M', word: 'Milk', zh: '牛奶', emoji: '🥛' },
  { letter: 'S', word: 'Star', zh: '星星', emoji: '⭐' },
  { letter: 'R', word: 'Rabbit', zh: '小兔子', emoji: '🐰' },
  { letter: 'B', word: 'Banana', zh: '香蕉', emoji: '🍌' },
];

// 遊戲狀態
let totalStars = parseInt(localStorage.getItem('kids_total_stars') || '0', 10);
let currentGame = null; // 'english' | 'math'
let currentRound = 0;
const TOTAL_ROUNDS = 5;
let isLocked = false;
let currentEnglishQ = null;
let currentMathQ = null;

// ============================================================================
// 🔊 音效與語音合成系統 (Web Audio API + Web Speech API)
// ============================================================================
const audioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  ? new (window.AudioContext || window.webkitAudioContext)()
  : null;

function playTone(freq, duration = 0.15, type = 'sine', delay = 0) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  setTimeout(() => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }, delay);
}

function playSuccessJingle() {
  playTone(523.25, 0.14, 'triangle', 0);   // C5
  playTone(659.25, 0.14, 'triangle', 110); // E5
  playTone(783.99, 0.18, 'triangle', 220); // G5
  playTone(1046.5, 0.32, 'triangle', 340); // C6
}

function playTryAgainSound() {
  playTone(300, 0.18, 'sine', 0);
  playTone(250, 0.22, 'sine', 150);
}

function speakText(text, lang = 'zh-TW', rate = 0.95) {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = rate;
  utter.pitch = 1.15;
  window.speechSynthesis.speak(utter);
}

function speakSequence(items) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  items.forEach((item) => {
    const utter = new SpeechSynthesisUtterance(item.text);
    utter.lang = item.lang || 'zh-TW';
    utter.rate = item.rate || 0.92;
    utter.pitch = 1.15;
    window.speechSynthesis.speak(utter);
  });
}

// ============================================================================
// 🏠 畫面切換與初始化
// ============================================================================
function initApp() {
  applyPetNames();
  updateStarsUI();
}

function applyPetNames() {
  document.querySelectorAll('[data-pet-name="corie"]').forEach((el) => {
    el.textContent = PET_CONFIG.corieName;
  });
  document.querySelectorAll('[data-pet-name="duncan"]').forEach((el) => {
    el.textContent = PET_CONFIG.duncanName;
  });
  document.title = `${PET_CONFIG.corieName} & ${PET_CONFIG.duncanName} 的快樂學習樂園`;
}

function updateStarsUI() {
  document.getElementById('star-count').textContent = totalStars;
  localStorage.setItem('kids_total_stars', String(totalStars));

  const stickerList = document.getElementById('sticker-list');
  stickerList.innerHTML = '';
  const unlockedCount = Math.floor(totalStars / 3);

  STICKERS.forEach((emoji, idx) => {
    const div = document.createElement('div');
    if (idx < unlockedCount) {
      div.className = 'sticker-slot unlocked';
      div.textContent = emoji;
      div.title = '點擊聽音效！';
      div.onclick = () => {
        playSuccessJingle();
        speakSequence([{ text: '好可愛的貼紙！', lang: 'zh-TW' }]);
      };
    } else {
      div.className = 'sticker-slot locked';
      div.textContent = '🔒';
      div.title = `再收集星星即可解鎖！`;
    }
    stickerList.appendChild(div);
  });
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
  const homeBtn = document.getElementById('btn-home');
  if (name === 'home') {
    homeBtn.classList.add('hidden');
  } else {
    homeBtn.classList.remove('hidden');
  }
}

function petSpeak(which) {
  playSuccessJingle();
  if (which === 'corie') {
    speakSequence([
      { text: `喵～我是橘貓 ${PET_CONFIG.corieName}，我們一起來算數學吧！`, lang: 'zh-TW' },
    ]);
  } else {
    speakSequence([
      { text: `汪汪！我是 ${PET_CONFIG.duncanName}，我們一起來玩英文單字吧！`, lang: 'zh-TW' },
    ]);
  }
}

// ============================================================================
// 🔤 英文遊戲：Duncan 的字母尋寶
// ============================================================================
function startEnglishGame() {
  currentGame = 'english';
  currentRound = 1;
  showScreen('english');
  nextEnglishRound();
}

function nextEnglishRound() {
  isLocked = false;
  document.getElementById('en-round-text').textContent = `第 ${currentRound} / ${TOTAL_ROUNDS} 題`;
  document.getElementById('en-progress-fill').style.width = `${(currentRound / TOTAL_ROUNDS) * 100}%`;

  // 隨機挑一題正解 + 兩個干擾項
  const shuffled = [...ENGLISH_BANK].sort(() => Math.random() - 0.5);
  const target = shuffled[0];
  const distractors = shuffled.filter((item) => item.letter !== target.letter).slice(0, 2);
  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);

  currentEnglishQ = { target, choices };

  document.getElementById('en-target-letter').textContent = `${target.letter} ${target.letter.toLowerCase()}`;
  document.getElementById('en-prompt-text').innerHTML =
    `${PET_CONFIG.duncanName} 說：請找出 <b>${target.letter}</b> 開頭的「<b>${target.word} (${target.zh})</b>」！`;

  const container = document.getElementById('en-options-container');
  container.innerHTML = '';

  choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.className = 'option-card';
    btn.innerHTML = `
      <div class="option-emoji">${choice.emoji}</div>
      <div class="option-word">${choice.word}</div>
      <div class="option-zh">${choice.zh}</div>
    `;
    btn.onclick = () => handleEnglishAnswer(choice, btn);
    container.appendChild(btn);
  });

  repeatEnglishPrompt();
}

function repeatEnglishPrompt() {
  if (!currentEnglishQ) return;
  const { target } = currentEnglishQ;
  speakSequence([
    { text: `${target.letter}. ${target.word}`, lang: 'en-US', rate: 0.82 },
    { text: `請找出 ${target.zh}`, lang: 'zh-TW', rate: 0.95 },
  ]);
}

function handleEnglishAnswer(choice, btnEl) {
  if (isLocked) return;
  const { target } = currentEnglishQ;

  if (choice.word === target.word) {
    isLocked = true;
    btnEl.classList.add('correct');
    playSuccessJingle();
    spawnConfetti(18);
    totalStars += 1;
    updateStarsUI();

    speakSequence([
      { text: `${target.word}!`, lang: 'en-US', rate: 0.85 },
      { text: '太棒了！答對囉！', lang: 'zh-TW', rate: 1.0 },
    ]);

    setTimeout(() => {
      if (currentRound < TOTAL_ROUNDS) {
        currentRound += 1;
        nextEnglishRound();
      } else {
        finishGame();
      }
    }, 1700);
  } else {
    btnEl.classList.add('wrong');
    playTryAgainSound();
    speakSequence([
      { text: choice.word, lang: 'en-US', rate: 0.85 },
      { text: `這是${choice.zh}，再試一次喔！`, lang: 'zh-TW', rate: 0.98 },
    ]);
    setTimeout(() => btnEl.classList.remove('wrong'), 600);
  }
}

// ============================================================================
// 🔢 數學遊戲：Corie 的加法冒險
// ============================================================================
const MATH_THEMES = [
  { name: '小貓與小狗', leftType: 'corie', rightType: 'duncan', unit: '隻好朋友' },
  { name: '美味小魚乾', leftEmoji: '🐟', rightEmoji: '🐟', unit: '條小魚' },
  { name: '香甜草莓', leftEmoji: '🍓', rightEmoji: '🍓', unit: '顆草莓' },
  { name: '閃亮星星', leftEmoji: '⭐', rightEmoji: '⭐', unit: '顆星星' },
];

function startMathGame() {
  currentGame = 'math';
  currentRound = 1;
  showScreen('math');
  nextMathRound();
}

function nextMathRound() {
  isLocked = false;
  document.getElementById('math-round-text').textContent = `第 ${currentRound} / ${TOTAL_ROUNDS} 題`;
  document.getElementById('math-progress-fill').style.width = `${(currentRound / TOTAL_ROUNDS) * 100}%`;

  // 適合 5 歲的加法：兩數各 1~5，總和 2~8
  const a = Math.floor(Math.random() * 4) + 1; // 1..4
  const b = Math.floor(Math.random() * 4) + 1; // 1..4
  const sum = a + b;
  const theme = MATH_THEMES[Math.floor(Math.random() * MATH_THEMES.length)];

  currentMathQ = { a, b, sum, theme, countSoFar: 0 };

  document.getElementById('math-num-left').textContent = a;
  document.getElementById('math-num-right').textContent = b;
  document.getElementById('math-num-result').textContent = '?';
  document.getElementById('math-answer-slot').textContent = '?';

  if (theme.leftType === 'corie') {
    document.getElementById('math-prompt-text').innerHTML =
      `${a} 隻 <b>${PET_CONFIG.corieName}</b> 加 ${b} 隻 <b>${PET_CONFIG.duncanName}</b>，合起來有幾${theme.unit}？（可以點圖案數數看喔！）`;
  } else {
    document.getElementById('math-prompt-text').innerHTML =
      `幫 <b>${PET_CONFIG.corieName}</b> 數一數：${a} 加 ${b} 等於多少？（點一點圖案會幫你報數喔！）`;
  }

  renderCountableGroup('math-group-left', a, theme, 'left');
  renderCountableGroup('math-group-right', b, theme, 'right');

  // 產生 3 個數字選項
  const optionSet = new Set([sum]);
  while (optionSet.size < 3) {
    const candidate = Math.max(2, sum + (Math.floor(Math.random() * 5) - 2));
    optionSet.add(candidate);
  }
  const choices = [...optionSet].sort((x, y) => x - y);

  const container = document.getElementById('math-options-container');
  container.innerHTML = '';
  choices.forEach((num) => {
    const btn = document.createElement('button');
    btn.className = 'option-card num-btn';
    btn.textContent = num;
    btn.onclick = () => handleMathAnswer(num, btn);
    container.appendChild(btn);
  });

  repeatMathPrompt();
}

function renderCountableGroup(containerId, count, theme, side) {
  const box = document.getElementById(containerId);
  box.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const item = document.createElement('div');
    item.className = 'countable-item';
    if (theme.leftType === 'corie') {
      const imgSrc = side === 'left' ? 'assets/corie.png' : 'assets/duncan.png';
      const fallbackEmoji = side === 'left' ? '🐱' : '🐶';
      item.innerHTML = `<img src="${imgSrc}" alt="" onerror="this.style.display='none'; this.parentElement.textContent='${fallbackEmoji}';" />`;
    } else {
      item.textContent = side === 'left' ? theme.leftEmoji : theme.rightEmoji;
    }
    item.onclick = () => {
      item.classList.add('counted');
      currentMathQ.countSoFar += 1;
      playTone(400 + currentMathQ.countSoFar * 60, 0.12, 'triangle');
      speakSequence([{ text: String(currentMathQ.countSoFar), lang: 'zh-TW', rate: 1.05 }]);
    };
    box.appendChild(item);
  }
}

function repeatMathPrompt() {
  if (!currentMathQ) return;
  const { a, b } = currentMathQ;
  speakSequence([
    { text: `${a} 加 ${b} 等於多少呢？點點看上面的圖案數一數吧！`, lang: 'zh-TW', rate: 0.95 },
  ]);
}

function handleMathAnswer(num, btnEl) {
  if (isLocked) return;
  const { a, b, sum } = currentMathQ;

  if (num === sum) {
    isLocked = true;
    btnEl.classList.add('correct');
    document.getElementById('math-num-result').textContent = sum;
    document.getElementById('math-answer-slot').textContent = sum;
    playSuccessJingle();
    spawnConfetti(18);
    totalStars += 1;
    updateStarsUI();

    speakSequence([
      { text: `答對了！${a} 加 ${b} 等於 ${sum}！你好聰明喔！`, lang: 'zh-TW', rate: 0.98 },
    ]);

    setTimeout(() => {
      if (currentRound < TOTAL_ROUNDS) {
        currentRound += 1;
        nextMathRound();
      } else {
        finishGame();
      }
    }, 1800);
  } else {
    btnEl.classList.add('wrong');
    playTryAgainSound();
    speakSequence([
      { text: '差一點點，我們再數一次看看喔！', lang: 'zh-TW', rate: 0.98 },
    ]);
    setTimeout(() => btnEl.classList.remove('wrong'), 600);
  }
}

// ============================================================================
// 🎉 過關慶祝與灑花特效
// ============================================================================
function finishGame() {
  showScreen('celebrate');
  spawnConfetti(45);
  playSuccessJingle();

  const msg = `${PET_CONFIG.corieName} 和 ${PET_CONFIG.duncanName} 替你拍拍手！你又收集到 5 顆閃亮星星囉！`;
  document.getElementById('celebrate-message').textContent = msg;
  speakSequence([{ text: `哇！全部過關了！${msg}`, lang: 'zh-TW' }]);

  const againBtn = document.getElementById('btn-play-again');
  againBtn.onclick = () => {
    if (currentGame === 'english') startEnglishGame();
    else startMathGame();
  };
}

function spawnConfetti(count = 25) {
  const container = document.getElementById('confetti-container');
  const icons = ['⭐', '🌸', '✨', '🎀', '🐾', '💖', '🎉'];
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'confetti-piece';
    span.textContent = icons[Math.floor(Math.random() * icons.length)];
    span.style.left = `${Math.random() * 96}vw`;
    span.style.animationDuration = `${1.4 + Math.random() * 1.2}s`;
    container.appendChild(span);
    setTimeout(() => span.remove(), 2600);
  }
}

// ============================================================================
// ⚙️ 家長設定（隨時修改 Corie & Duncan 的名字）
// ============================================================================
function openSettingsModal() {
  document.getElementById('input-corie-name').value = PET_CONFIG.corieName;
  document.getElementById('input-duncan-name').value = PET_CONFIG.duncanName;
  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.add('hidden');
}

function saveSettings() {
  const newCorie = document.getElementById('input-corie-name').value.trim() || 'Corie';
  const newDuncan = document.getElementById('input-duncan-name').value.trim() || 'Duncan';
  PET_CONFIG.corieName = newCorie;
  PET_CONFIG.duncanName = newDuncan;
  localStorage.setItem('pet_corie_name', newCorie);
  localStorage.setItem('pet_duncan_name', newDuncan);
  applyPetNames();
  closeSettingsModal();
  playSuccessJingle();
}

window.addEventListener('DOMContentLoaded', initApp);
