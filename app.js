// ============================================================================
// 🐾 角色與語音全域設定（可點網頁右上角 ⚙️ 隨時修改並自動儲存）
// ============================================================================
const PET_CONFIG = {
  corieName: localStorage.getItem('pet_corie_name') || 'Corie',
  duncanName: localStorage.getItem('pet_duncan_name') || 'Duncan',
  shannonName: localStorage.getItem('pet_shannon_name') || 'Shannon',
  ttsMode: localStorage.getItem('pet_tts_mode') || 'auto', // 'auto' | 'cloud' | 'native'
  speechRate: parseFloat(localStorage.getItem('pet_speech_rate') || '0.90'),
  zhVoiceURI: localStorage.getItem('pet_zh_voice') || '',
  enVoiceURI: localStorage.getItem('pet_en_voice') || '',
};

// ============================================================================
// 🎁 豪華 120 張獎勵貼紙庫（每 3 顆星解鎖一張，點擊已解鎖貼紙會念出貼紙名稱！）
// ============================================================================
const STICKERS = [
  // 1~20 夢幻公主與魔法
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
  // 21~40 可愛動物夥伴
  { emoji: '🐱', name: '橘貓好朋友' }, { emoji: '🐶', name: '邊牧小狗狗' },
  { emoji: '🐰', name: '長耳小白兔' }, { emoji: '🐼', name: '圓滾滾熊貓' },
  { emoji: '🐨', name: '愛睡覺無尾熊' }, { emoji: '🦊', name: '聰明小狐狸' },
  { emoji: '🦁', name: '勇敢小獅子' }, { emoji: '🐯', name: '威風小老虎' },
  { emoji: '🦒', name: '高個子長頸鹿' }, { emoji: '🐘', name: '長鼻子大象' },
  { emoji: '🐧', name: '搖擺小企鵝' }, { emoji: '🐤', name: '黃色小雞' },
  { emoji: '🦆', name: '游水小鴨子' }, { emoji: '🦉', name: '博士貓頭鷹' },
  { emoji: '🐢', name: '慢吞吞小烏龜' }, { emoji: '🦖', name: '小恐龍' },
  { emoji: '🦕', name: '長頸雷龍' }, { emoji: '🦩', name: '粉紅紅鶴' },
  { emoji: '🦚', name: '開屏孔雀' }, { emoji: '🦜', name: '彩色鸚鵡' },
  // 41~60 比奇堡海洋世界
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
  // 61~80 下午茶甜點派對
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
  // 81~100 水果與大自然花園
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
  // 101~120 音樂、遊樂園與寶藏
  { emoji: '🎡', name: '遊樂園摩天輪' }, { emoji: '🎢', name: '刺激雲霄飛車' },
  { emoji: '🎪', name: '歡樂馬戲團' }, { emoji: '🎈', name: '飛天紅氣球' },
  { emoji: '🎉', name: '派對拉炮' }, { emoji: '🎁', name: '驚喜禮物盒' },
  { emoji: '👑', name: '黃金王冠' }, { emoji: '💍', name: '寶石戒指' },
  { emoji: '🪄', name: '仙女魔法棒' }, { emoji: '🔮', name: '魔法水晶球' },
  { emoji: '🎻', name: '優雅小提琴' }, { emoji: '🎹', name: '黑白鋼琴' },
  { emoji: '🎸', name: '搖滾吉他' }, { emoji: '🎺', name: '黃金小喇叭' },
  { emoji: '🥁', name: '咚咚小鼓' }, { emoji: '🪁', name: '飛高高風箏' },
  { emoji: '🪀', name: '炫彩溜溜球' }, { emoji: '🧩', name: '聰明拼圖' },
  { emoji: '⏰', name: '滴答小鬧鐘' }, { emoji: '🏆', name: '冠軍大獎盃' },
];

// ============================================================================
// 📚 A ~ Z 完整 104 個幼兒高頻單字庫
// ============================================================================
const ENGLISH_BANK = [
  { letter: 'A', word: 'Apple', zh: '蘋果', emoji: '🍎' },
  { letter: 'A', word: 'Ant', zh: '小螞蟻', emoji: '🐜' },
  { letter: 'A', word: 'Airplane', zh: '飛機', emoji: '✈️' },
  { letter: 'A', word: 'Alligator', zh: '鱷魚', emoji: '🐊' },
  { letter: 'B', word: 'Ball', zh: '球球', emoji: '⚽' },
  { letter: 'B', word: 'Banana', zh: '香蕉', emoji: '🍌' },
  { letter: 'B', word: 'Bear', zh: '小熊', emoji: '🐻' },
  { letter: 'B', word: 'Bird', zh: '小鳥', emoji: '🐦' },
  { letter: 'B', word: 'Butterfly', zh: '蝴蝶', emoji: '🦋' },
  { letter: 'B', word: 'Book', zh: '書本', emoji: '📖' },
  { letter: 'C', word: 'Cat', zh: '小貓咪', emoji: '🐱' },
  { letter: 'C', word: 'Cake', zh: '蛋糕', emoji: '🎂' },
  { letter: 'C', word: 'Car', zh: '汽車', emoji: '🚗' },
  { letter: 'C', word: 'Cow', zh: '乳牛', emoji: '🐮' },
  { letter: 'C', word: 'Cookie', zh: '餅乾', emoji: '🍪' },
  { letter: 'C', word: 'Candy', zh: '糖果', emoji: '🍬' },
  { letter: 'D', word: 'Dog', zh: '小狗狗', emoji: '🐶' },
  { letter: 'D', word: 'Duck', zh: '小鴨子', emoji: '🦆' },
  { letter: 'D', word: 'Dinosaur', zh: '恐龍', emoji: '🦖' },
  { letter: 'D', word: 'Dolphin', zh: '海豚', emoji: '🐬' },
  { letter: 'D', word: 'Donut', zh: '甜甜圈', emoji: '🍩' },
  { letter: 'E', word: 'Elephant', zh: '大象', emoji: '🐘' },
  { letter: 'E', word: 'Egg', zh: '雞蛋', emoji: '🥚' },
  { letter: 'E', word: 'Ear', zh: '耳朵', emoji: '👂' },
  { letter: 'E', word: 'Eye', zh: '眼睛', emoji: '👁️' },
  { letter: 'F', word: 'Fish', zh: '小魚', emoji: '🐟' },
  { letter: 'F', word: 'Frog', zh: '青蛙', emoji: '🐸' },
  { letter: 'F', word: 'Flower', zh: '花朵', emoji: '🌸' },
  { letter: 'F', word: 'Fox', zh: '狐狸', emoji: '🦊' },
  { letter: 'G', word: 'Grapes', zh: '葡萄', emoji: '🍇' },
  { letter: 'G', word: 'Giraffe', zh: '長頸鹿', emoji: '🦒' },
  { letter: 'G', word: 'Gift', zh: '禮物', emoji: '🎁' },
  { letter: 'G', word: 'Guitar', zh: '吉他', emoji: '🎸' },
  { letter: 'H', word: 'Hat', zh: '帽子', emoji: '👒' },
  { letter: 'H', word: 'Horse', zh: '小馬', emoji: '🐴' },
  { letter: 'H', word: 'Heart', zh: '愛心', emoji: '❤️' },
  { letter: 'H', word: 'House', zh: '房子', emoji: '🏠' },
  { letter: 'I', word: 'Ice cream', zh: '冰淇淋', emoji: '🍦' },
  { letter: 'I', word: 'Igloo', zh: '冰屋', emoji: '🛖' },
  { letter: 'I', word: 'Island', zh: '小島', emoji: '🏝️' },
  { letter: 'J', word: 'Juice', zh: '果汁', emoji: '🧃' },
  { letter: 'J', word: 'Jellyfish', zh: '水母', emoji: '🪼' },
  { letter: 'J', word: 'Jacket', zh: '外套', emoji: '🧥' },
  { letter: 'K', word: 'Kite', zh: '風箏', emoji: '🪁' },
  { letter: 'K', word: 'Koala', zh: '無尾熊', emoji: '🐨' },
  { letter: 'K', word: 'Kangaroo', zh: '袋鼠', emoji: '🦘' },
  { letter: 'K', word: 'Key', zh: '鑰匙', emoji: '🔑' },
  { letter: 'L', word: 'Lion', zh: '獅子', emoji: '🦁' },
  { letter: 'L', word: 'Lemon', zh: '檸檬', emoji: '🍋' },
  { letter: 'L', word: 'Leaf', zh: '葉子', emoji: '🍃' },
  { letter: 'L', word: 'Lollipop', zh: '棒棒糖', emoji: '🍭' },
  { letter: 'M', word: 'Milk', zh: '牛奶', emoji: '🥛' },
  { letter: 'M', word: 'Monkey', zh: '小猴子', emoji: '🐵' },
  { letter: 'M', word: 'Moon', zh: '月亮', emoji: '🌙' },
  { letter: 'M', word: 'Mouse', zh: '小老鼠', emoji: '🐭' },
  { letter: 'M', word: 'Mushroom', zh: '蘑菇', emoji: '🍄' },
  { letter: 'N', word: 'Nose', zh: '鼻子', emoji: '👃' },
  { letter: 'N', word: 'Nest', zh: '鳥巢', emoji: '🪺' },
  { letter: 'N', word: 'Noodles', zh: '麵條', emoji: '🍜' },
  { letter: 'O', word: 'Orange', zh: '柳丁', emoji: '🍊' },
  { letter: 'O', word: 'Octopus', zh: '章魚', emoji: '🐙' },
  { letter: 'O', word: 'Owl', zh: '貓頭鷹', emoji: '🦉' },
  { letter: 'P', word: 'Pig', zh: '小豬', emoji: '🐷' },
  { letter: 'P', word: 'Panda', zh: '熊貓', emoji: '🐼' },
  { letter: 'P', word: 'Peach', zh: '水蜜桃', emoji: '🍑' },
  { letter: 'P', word: 'Penguin', zh: '企鵝', emoji: '🐧' },
  { letter: 'P', word: 'Pizza', zh: '披薩', emoji: '🍕' },
  { letter: 'Q', word: 'Queen', zh: '皇后', emoji: '👸' },
  { letter: 'Q', word: 'Question', zh: '問號', emoji: '❓' },
  { letter: 'R', word: 'Rabbit', zh: '小兔子', emoji: '🐰' },
  { letter: 'R', word: 'Rainbow', zh: '彩虹', emoji: '🌈' },
  { letter: 'R', word: 'Robot', zh: '機器人', emoji: '🤖' },
  { letter: 'R', word: 'Rocket', zh: '火箭', emoji: '🚀' },
  { letter: 'S', word: 'Star', zh: '星星', emoji: '⭐' },
  { letter: 'S', word: 'Sun', zh: '太陽', emoji: '☀️' },
  { letter: 'S', word: 'Strawberry', zh: '草莓', emoji: '🍓' },
  { letter: 'S', word: 'Sheep', zh: '綿羊', emoji: '🐑' },
  { letter: 'S', word: 'Snake', zh: '小蛇', emoji: '🐍' },
  { letter: 'T', word: 'Tiger', zh: '老虎', emoji: '🐯' },
  { letter: 'T', word: 'Tree', zh: '大樹', emoji: '🌳' },
  { letter: 'T', word: 'Turtle', zh: '烏龜', emoji: '🐢' },
  { letter: 'T', word: 'Train', zh: '火車', emoji: '🚂' },
  { letter: 'U', word: 'Umbrella', zh: '雨傘', emoji: '☂️' },
  { letter: 'U', word: 'Unicorn', zh: '獨角獸', emoji: '🦄' },
  { letter: 'V', word: 'Violin', zh: '小提琴', emoji: '🎻' },
  { letter: 'V', word: 'Vegetable', zh: '蔬菜', emoji: '🥦' },
  { letter: 'V', word: 'Volcano', zh: '火山', emoji: '🌋' },
  { letter: 'W', word: 'Watermelon', zh: '西瓜', emoji: '🍉' },
  { letter: 'W', word: 'Whale', zh: '鯨魚', emoji: '🐳' },
  { letter: 'W', word: 'Watch', zh: '手錶', emoji: '⌚' },
  { letter: 'X', word: 'Xylophone', zh: '木琴', emoji: '🎹' },
  { letter: 'X', word: 'X-ray', zh: 'X光片', emoji: '🩻' },
  { letter: 'Y', word: 'Yo-yo', zh: '溜溜球', emoji: '🪀' },
  { letter: 'Y', word: 'Yacht', zh: '遊艇', emoji: '🛥️' },
  { letter: 'Y', word: 'Yarn', zh: '毛線球', emoji: '🧶' },
  { letter: 'Z', word: 'Zebra', zh: '斑馬', emoji: '🦓' },
  { letter: 'Z', word: 'Zoo', zh: '動物園', emoji: '🎪' },
];

const SPELLING_WORDS = ENGLISH_BANK.filter(
  (item) => /^[A-Za-z]{3,5}$/.test(item.word)
);

// 遊戲狀態
let totalStars = parseInt(localStorage.getItem('kids_total_stars') || '0', 10);
let currentGame = null; // 'english' | 'math' | 'clock'
let englishLevel = 1;
let mathLevel = 1;
let clockLevel = 1;
let currentRound = 0;
const TOTAL_ROUNDS = 8;
let isLocked = false;
let currentEnglishQ = null;
let currentMathQ = null;
let currentClockQ = null;
let usedEnglishWords = new Set();

// ============================================================================
// 🔊 雙引擎真人級語音系統（Edge Neural 真人曉臻 + 雲端自然女聲串流）
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
    gain.gain.setValueAtTime(0.16, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }, delay);
}

function playSuccessJingle() {
  playTone(523.25, 0.14, 'triangle', 0);
  playTone(659.25, 0.14, 'triangle', 110);
  playTone(783.99, 0.18, 'triangle', 220);
  playTone(1046.5, 0.32, 'triangle', 340);
}

function playTryAgainSound() {
  playTone(300, 0.18, 'sine', 0);
  playTone(250, 0.22, 'sine', 150);
}

let cachedVoices = [];
let activeAudioEl = null;
let speechCancelToken = 0;

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const latest = window.speechSynthesis.getVoices();
  if (latest && latest.length) {
    cachedVoices = latest;
    populateVoiceSelectors();
  }
}

if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function scoreVoice(v, targetLangPrefix) {
  const lang = (v.lang || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  let score = 0;

  if (targetLangPrefix === 'zh') {
    if (!lang.includes('zh') && !lang.includes('cmn')) return -999;
    if (lang.includes('tw') || lang.includes('hant')) score += 60;
    if (name.includes('hsiaochen') || name.includes('曉臻')) score += 200;
    if (name.includes('hsiaoyu') || name.includes('曉雨')) score += 190;
    if (name.includes('natural') || name.includes('online')) score += 150;
    if (name.includes('meijia') || name.includes('美佳') || name.includes('premium') || name.includes('enhanced')) score += 130;
    if (name.includes('google')) score += 70;
    if (name.includes('desktop') || name.includes('hanhan') || name.includes('yating')) score -= 80;
  } else {
    if (!lang.startsWith('en')) return -999;
    if (lang.includes('us')) score += 50;
    if (name.includes('ana')) score += 200;
    if (name.includes('jenny') || name.includes('aria') || name.includes('emma') || name.includes('ava')) score += 185;
    if (name.includes('natural') || name.includes('online')) score += 150;
    if (name.includes('samantha') || name.includes('allison')) score += 120;
    if (name.includes('google us english')) score += 90;
    if (name.includes('desktop') || name.includes('david') || name.includes('zira')) score -= 60;
  }
  return score;
}

function getBestVoice(langType) {
  if ('speechSynthesis' in window) {
    const fresh = window.speechSynthesis.getVoices();
    if (fresh && fresh.length) cachedVoices = fresh;
  }
  if (!cachedVoices.length) return null;

  const preferredURI = langType === 'zh' ? PET_CONFIG.zhVoiceURI : PET_CONFIG.enVoiceURI;
  if (preferredURI) {
    const found = cachedVoices.find((v) => v.voiceURI === preferredURI);
    if (found) return found;
  }

  let best = null;
  let bestScore = -999;
  for (const v of cachedVoices) {
    const s = scoreVoice(v, langType);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best;
}

function hasHighQualityNativeChineseVoice() {
  const bestZh = getBestVoice('zh');
  if (!bestZh) return false;
  return scoreVoice(bestZh, 'zh') >= 160;
}

function clearPendingSpeech() {
  speechCancelToken += 1;
  if (activeAudioEl) {
    try {
      activeAudioEl.pause();
      activeAudioEl.src = '';
    } catch (e) {}
    activeAudioEl = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function playCloudTTSItem(item, token) {
  return new Promise((resolve) => {
    if (token !== speechCancelToken) return resolve();

    const isEn = (item.lang || '').toLowerCase().startsWith('en');
    const tl = isEn ? 'en' : 'zh-TW';
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${tl}&ttsspeed=0.8&q=${encodeURIComponent(item.text)}`;

    const audio = new Audio();
    activeAudioEl = audio;
    audio.preload = 'auto';
    audio.playbackRate = Math.max(0.88, Math.min(1.05, PET_CONFIG.speechRate || 0.92));

    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      if (!ok && token === speechCancelToken) {
        playNativeTTSItem(item, token).then(resolve);
      } else {
        setTimeout(resolve, item.pauseAfter || 320);
      }
    };

    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);
    audio.src = url;
    audio.play().catch(() => finish(false));
  });
}

function playNativeTTSItem(item, token) {
  return new Promise((resolve) => {
    if (token !== speechCancelToken || !('speechSynthesis' in window)) return resolve();

    const isEn = (item.lang || '').toLowerCase().startsWith('en');
    const utter = new SpeechSynthesisUtterance(item.text);
    const voice = getBestVoice(isEn ? 'en' : 'zh');
    if (voice) utter.voice = voice;
    utter.lang = item.lang || (isEn ? 'en-US' : 'zh-TW');

    const userRate = PET_CONFIG.speechRate || 0.90;
    utter.rate = item.rate || (isEn ? Math.max(0.78, userRate - 0.06) : Math.max(0.86, userRate));
    utter.pitch = 1.0;

    let done = false;
    const complete = () => {
      if (done) return;
      done = true;
      setTimeout(resolve, item.pauseAfter || 300);
    };

    utter.onend = complete;
    utter.onerror = complete;
    setTimeout(complete, Math.max(2500, item.text.length * 380));

    window.speechSynthesis.speak(utter);
  });
}

async function speakSequence(items) {
  clearPendingSpeech();
  const myToken = speechCancelToken;

  const useCloud =
    PET_CONFIG.ttsMode === 'cloud' ||
    (PET_CONFIG.ttsMode === 'auto' && !hasHighQualityNativeChineseVoice() && !PET_CONFIG.zhVoiceURI);

  for (const item of items) {
    if (myToken !== speechCancelToken) break;
    if (useCloud) {
      await playCloudTTSItem(item, myToken);
    } else {
      await playNativeTTSItem(item, myToken);
    }
  }
}

// ============================================================================
// 🏠 畫面切換與初始化
// ============================================================================
function initApp() {
  applyPetNames();
  updateStarsUI();
  updateSpeedLabel(PET_CONFIG.speechRate);
}

function applyPetNames() {
  document.querySelectorAll('[data-pet-name="corie"]').forEach((el) => {
    el.textContent = PET_CONFIG.corieName;
  });
  document.querySelectorAll('[data-pet-name="duncan"]').forEach((el) => {
    el.textContent = PET_CONFIG.duncanName;
  });
  document.querySelectorAll('[data-pet-name="shannon"]').forEach((el) => {
    el.textContent = PET_CONFIG.shannonName;
  });
  document.title = `${PET_CONFIG.corieName}、${PET_CONFIG.duncanName} & ${PET_CONFIG.shannonName} 的快樂學習樂園`;
}

function updateStarsUI() {
  document.getElementById('star-count').textContent = totalStars;
  localStorage.setItem('kids_total_stars', String(totalStars));

  const stickerList = document.getElementById('sticker-list');
  stickerList.innerHTML = '';
  const unlockedCount = Math.min(STICKERS.length, Math.floor(totalStars / 3));

  const progEl = document.getElementById('sticker-progress-text');
  if (progEl) {
    progEl.textContent = `已解鎖 ${unlockedCount} / ${STICKERS.length} 張`;
  }

  STICKERS.forEach((stk, idx) => {
    const div = document.createElement('div');
    if (idx < unlockedCount) {
      div.className = 'sticker-slot unlocked';
      div.textContent = stk.emoji;
      div.title = `${stk.name}（點擊聽聲音！）`;
      div.onclick = () => {
        playSuccessJingle();
        speakSequence([{ text: `哇，是${stk.name}貼紙！`, lang: 'zh-TW' }]);
      };
    } else {
      div.className = 'sticker-slot locked';
      div.textContent = `${idx + 1}`;
      div.title = `第 ${idx + 1} 號貼紙：收集滿 ${(idx + 1) * 3} 顆星星即可解鎖！`;
    }
    stickerList.appendChild(div);
  });
}

function showScreen(name) {
  clearPendingSpeech();
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
      { text: `嗨，我是橘貓 ${PET_CONFIG.corieName}，`, lang: 'zh-TW', pauseAfter: 250 },
      { text: '我們一起來玩數學冒險吧！', lang: 'zh-TW' },
    ]);
  } else if (which === 'duncan') {
    speakSequence([
      { text: `哈囉，我是 ${PET_CONFIG.duncanName}，`, lang: 'zh-TW', pauseAfter: 250 },
      { text: '我們一起來認識英文單字吧！', lang: 'zh-TW' },
    ]);
  } else {
    speakSequence([
      { text: `咕嚕咕嚕，我是比奇堡來的魚姊姊 ${PET_CONFIG.shannonName}，`, lang: 'zh-TW', pauseAfter: 250 },
      { text: '我們一起來學看時鐘吧！', lang: 'zh-TW' },
    ]);
  }
}

// ============================================================================
// 🔤 英文遊戲：Duncan 的英文探險
// ============================================================================
function startEnglishGame(lvl = 1) {
  currentGame = 'english';
  englishLevel = lvl;
  currentRound = 1;
  usedEnglishWords.clear();
  updateEnglishLevelChips();
  showScreen('english');
  nextEnglishRound();
}

function switchEnglishLevel(lvl) {
  englishLevel = lvl;
  currentRound = 1;
  usedEnglishWords.clear();
  updateEnglishLevelChips();
  nextEnglishRound();
}

function updateEnglishLevelChips() {
  [1, 2, 3].forEach((n) => {
    const chip = document.getElementById(`en-lvl-chip-${n}`);
    if (chip) chip.classList.toggle('active', n === englishLevel);
  });
}

function pickUnusedWord(pool = ENGLISH_BANK) {
  let available = pool.filter((w) => !usedEnglishWords.has(w.word));
  if (available.length < 4) {
    usedEnglishWords.clear();
    available = [...pool];
  }
  const target = available[Math.floor(Math.random() * available.length)];
  usedEnglishWords.add(target.word);
  return target;
}

function nextEnglishRound() {
  isLocked = false;
  document.getElementById('en-round-text').textContent = `第 ${currentRound} / ${TOTAL_ROUNDS} 題`;
  document.getElementById('en-progress-fill').style.width = `${(currentRound / TOTAL_ROUNDS) * 100}%`;

  const spellingSlots = document.getElementById('en-spelling-slots');
  spellingSlots.classList.add('hidden');
  spellingSlots.innerHTML = '';

  const subwordEl = document.getElementById('en-target-subword');
  subwordEl.textContent = '';

  if (englishLevel === 1) {
    setupEnglishLevel1();
  } else if (englishLevel === 2) {
    if (Math.random() < 0.5) {
      setupEnglishListeningBlind();
    } else {
      setupEnglishMissingFirstLetter();
    }
  } else {
    if (Math.random() < 0.45) {
      setupEnglishCaseMatch();
    } else {
      setupEnglishSpelling();
    }
  }
}

function setupEnglishLevel1() {
  const target = pickUnusedWord();
  const distractors = ENGLISH_BANK
    .filter((item) => item.letter !== target.letter)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);

  currentEnglishQ = { mode: 'lvl1', target, choices };

  document.getElementById('en-target-letter').textContent = `${target.letter} ${target.letter.toLowerCase()}`;
  document.getElementById('en-target-subword').textContent = target.word;
  document.getElementById('en-prompt-text').innerHTML =
    `${PET_CONFIG.duncanName} 說：請找出 <b>${target.letter}</b> 開頭的「<b>${target.word}</b>」！`;

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
    btn.onclick = () => verifyEnglishChoice(choice.word === target.word, choice, btn);
    container.appendChild(btn);
  });

  repeatEnglishPrompt();
}

function setupEnglishListeningBlind() {
  const target = pickUnusedWord();
  const distractors = ENGLISH_BANK
    .filter((item) => item.word !== target.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);

  currentEnglishQ = { mode: 'listen', target, choices };

  document.getElementById('en-target-letter').textContent = '🎧 仔細聽';
  document.getElementById('en-target-subword').textContent = '點我再聽一次單字';
  document.getElementById('en-prompt-text').innerHTML =
    `耳朵聽聽看，${PET_CONFIG.duncanName} 念的是哪一個圖案呢？`;

  const container = document.getElementById('en-options-container');
  container.innerHTML = '';
  choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.className = 'option-card';
    btn.innerHTML = `
      <div class="option-emoji">${choice.emoji}</div>
      <div class="option-zh">${choice.zh}</div>
    `;
    btn.onclick = () => verifyEnglishChoice(choice.word === target.word, choice, btn);
    container.appendChild(btn);
  });

  repeatEnglishPrompt();
}

function setupEnglishMissingFirstLetter() {
  const target = pickUnusedWord();
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const wrongLetters = allLetters
    .filter((l) => l !== target.letter)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const letterChoices = [target.letter, ...wrongLetters].sort(() => Math.random() - 0.5);

  currentEnglishQ = { mode: 'missing_letter', target, letterChoices };

  const maskedWord = `＿${target.word.slice(1)}`;
  document.getElementById('en-target-letter').textContent = target.emoji;
  document.getElementById('en-target-subword').textContent = `${maskedWord} (${target.zh})`;
  document.getElementById('en-prompt-text').innerHTML =
    `「<b>${target.zh}</b>」的英文是 <b>${maskedWord}</b>，請問第一個字母是什麼呢？`;

  const container = document.getElementById('en-options-container');
  container.innerHTML = '';
  letterChoices.forEach((ltr) => {
    const btn = document.createElement('button');
    btn.className = 'option-card';
    btn.innerHTML = `
      <div class="option-word" style="font-size:2.8rem; color:#1d4ed8;">${ltr} ${ltr.toLowerCase()}</div>
    `;
    btn.onclick = () => {
      if (ltr === target.letter) {
        document.getElementById('en-target-subword').textContent = `${target.word} (${target.zh})`;
      }
      verifyEnglishChoice(ltr === target.letter, { word: ltr, zh: `字母 ${ltr}` }, btn);
    };
    container.appendChild(btn);
  });

  repeatEnglishPrompt();
}

function setupEnglishCaseMatch() {
  const target = pickUnusedWord();
  const askLower = Math.random() < 0.5;
  const shownLetter = askLower ? target.letter : target.letter.toLowerCase();
  const answerLetter = askLower ? target.letter.toLowerCase() : target.letter;

  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const distractors = allLetters
    .filter((l) => l !== target.letter)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((l) => (askLower ? l.toLowerCase() : l));

  const choices = [answerLetter, ...distractors].sort(() => Math.random() - 0.5);

  currentEnglishQ = { mode: 'case_match', target, shownLetter, answerLetter, askLower };

  document.getElementById('en-target-letter').textContent = shownLetter;
  document.getElementById('en-target-subword').textContent = `${target.emoji} ${target.word}`;
  document.getElementById('en-prompt-text').innerHTML = askLower
    ? `大寫 <b>${shownLetter}</b> 的「小寫好朋友」是哪一個呢？`
    : `小寫 <b>${shownLetter}</b> 的「大寫好朋友」是哪一個呢？`;

  const container = document.getElementById('en-options-container');
  container.innerHTML = '';
  choices.forEach((ltr) => {
    const btn = document.createElement('button');
    btn.className = 'option-card';
    btn.innerHTML = `<div class="option-word" style="font-size:3.2rem; color:#7e22ce;">${ltr}</div>`;
    btn.onclick = () => verifyEnglishChoice(ltr === answerLetter, { word: ltr, zh: `字母 ${ltr}` }, btn);
    container.appendChild(btn);
  });

  repeatEnglishPrompt();
}

function setupEnglishSpelling() {
  const target = pickUnusedWord(SPELLING_WORDS);
  const upperWord = target.word.toUpperCase();
  const letters = upperWord.split('');

  const extraPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((c) => !letters.includes(c));
  const extraLetter = extraPool[Math.floor(Math.random() * extraPool.length)];
  const scrambled = [...letters, extraLetter].sort(() => Math.random() - 0.5);

  currentEnglishQ = {
    mode: 'spelling',
    target,
    upperWord,
    currentIndex: 0,
  };

  document.getElementById('en-target-letter').textContent = target.emoji;
  document.getElementById('en-target-subword').textContent = target.zh;
  document.getElementById('en-prompt-text').innerHTML =
    `請按照順序點選字母，幫 ${PET_CONFIG.duncanName} 拼出「<b>${target.word} (${target.zh})</b>」！`;

  const slotsWrap = document.getElementById('en-spelling-slots');
  slotsWrap.classList.remove('hidden');
  slotsWrap.innerHTML = '';
  letters.forEach((_, idx) => {
    const slot = document.createElement('div');
    slot.className = 'spell-slot';
    slot.id = `spell-slot-${idx}`;
    slot.textContent = '';
    slotsWrap.appendChild(slot);
  });

  const container = document.getElementById('en-options-container');
  container.innerHTML = '';
  scrambled.forEach((ltr) => {
    const btn = document.createElement('button');
    btn.className = 'option-card';
    btn.innerHTML = `<div class="option-word" style="font-size:2.6rem;">${ltr}</div>`;
    btn.onclick = () => handleSpellingLetterClick(ltr, btn);
    container.appendChild(btn);
  });

  repeatEnglishPrompt();
}

function handleSpellingLetterClick(ltr, btnEl) {
  if (isLocked) return;
  const q = currentEnglishQ;
  const expected = q.upperWord[q.currentIndex];

  if (ltr === expected) {
    btnEl.classList.add('used-letter');
    const slot = document.getElementById(`spell-slot-${q.currentIndex}`);
    if (slot) {
      slot.textContent = ltr;
      slot.classList.add('filled');
    }
    q.currentIndex += 1;
    playTone(500 + q.currentIndex * 80, 0.12, 'triangle');
    speakSequence([{ text: ltr.toLowerCase(), lang: 'en-US' }]);

    if (q.currentIndex === q.upperWord.length) {
      isLocked = true;
      setTimeout(() => {
        playSuccessJingle();
        spawnConfetti(22);
        totalStars += 1;
        updateStarsUI();
        speakSequence([
          { text: q.target.word, lang: 'en-US', pauseAfter: 450 },
          { text: `太厲害了，你成功拼出，${q.target.zh}，了喔！`, lang: 'zh-TW' },
        ]);
        advanceOrFinishEnglish();
      }, 500);
    }
  } else {
    btnEl.classList.add('wrong');
    playTryAgainSound();
    speakSequence([
      { text: `下一個字母是，${expected}，再找找看喔！`, lang: 'zh-TW' },
    ]);
    setTimeout(() => btnEl.classList.remove('wrong'), 600);
  }
}

function repeatEnglishPrompt() {
  if (!currentEnglishQ) return;
  const { mode, target } = currentEnglishQ;

  if (mode === 'listen') {
    speakSequence([
      { text: target.word, lang: 'en-US', pauseAfter: 550 },
      { text: target.word, lang: 'en-US', pauseAfter: 450 },
      { text: '請問，這是哪一個圖案呢？', lang: 'zh-TW' },
    ]);
  } else if (mode === 'missing_letter') {
    speakSequence([
      { text: target.word, lang: 'en-US', pauseAfter: 450 },
      { text: `${target.zh}，的第一個字母是什麼呢？`, lang: 'zh-TW' },
    ]);
  } else if (mode === 'case_match') {
    speakSequence([
      { text: target.letter, lang: 'en-US', pauseAfter: 450 },
      { text: `請找出字母，${target.letter}，的好朋友`, lang: 'zh-TW' },
    ]);
  } else if (mode === 'spelling') {
    speakSequence([
      { text: target.word, lang: 'en-US', pauseAfter: 450 },
      { text: `我們一起把，${target.zh}，拼出來吧！`, lang: 'zh-TW' },
    ]);
  } else {
    speakSequence([
      { text: target.letter, lang: 'en-US', pauseAfter: 400 },
      { text: target.word, lang: 'en-US', pauseAfter: 450 },
      { text: `請找出，${target.zh}`, lang: 'zh-TW' },
    ]);
  }
}

function verifyEnglishChoice(isCorrect, chosenItem, btnEl) {
  if (isLocked) return;
  const { target } = currentEnglishQ;

  if (isCorrect) {
    isLocked = true;
    btnEl.classList.add('correct');
    playSuccessJingle();
    spawnConfetti(18);
    totalStars += 1;
    updateStarsUI();

    speakSequence([
      { text: target.word, lang: 'en-US', pauseAfter: 400 },
      { text: `答對了，是${target.zh}，你好棒喔！`, lang: 'zh-TW' },
    ]);

    advanceOrFinishEnglish();
  } else {
    btnEl.classList.add('wrong');
    playTryAgainSound();
    speakSequence([
      { text: chosenItem.word, lang: 'en-US', pauseAfter: 380 },
      { text: `這是，${chosenItem.zh}，我們再試一次喔！`, lang: 'zh-TW' },
    ]);
    setTimeout(() => btnEl.classList.remove('wrong'), 650);
  }
}

function advanceOrFinishEnglish() {
  setTimeout(() => {
    if (currentRound < TOTAL_ROUNDS) {
      currentRound += 1;
      nextEnglishRound();
    } else {
      finishGame();
    }
  }, 2300);
}

// ============================================================================
// 🔢 數學遊戲：Corie 的數學冒險
// ============================================================================
const MATH_ITEMS = [
  { type: 'pets', leftImg: 'assets/corie.png', rightImg: 'assets/duncan.png', leftFallback: '🐱', rightFallback: '🐶', unit: '隻好朋友' },
  { type: 'emoji', emoji: '🐟', unit: '條小魚乾' },
  { type: 'emoji', emoji: '🍓', unit: '顆草莓' },
  { type: 'emoji', emoji: '⭐', unit: '顆星星' },
  { type: 'emoji', emoji: '🍪', unit: '塊餅乾' },
  { type: 'emoji', emoji: '🍎', unit: '顆蘋果' },
  { type: 'emoji', emoji: '🎈', unit: '顆氣球' },
];

function startMathGame(lvl = 1) {
  currentGame = 'math';
  mathLevel = lvl;
  currentRound = 1;
  updateMathLevelChips();
  showScreen('math');
  nextMathRound();
}

function switchMathLevel(lvl) {
  mathLevel = lvl;
  currentRound = 1;
  updateMathLevelChips();
  nextMathRound();
}

function updateMathLevelChips() {
  [1, 2, 3].forEach((n) => {
    const chip = document.getElementById(`math-lvl-chip-${n}`);
    if (chip) chip.classList.toggle('active', n === mathLevel);
  });
}

function nextMathRound() {
  isLocked = false;
  document.getElementById('math-round-text').textContent = `第 ${currentRound} / ${TOTAL_ROUNDS} 題`;
  document.getElementById('math-progress-fill').style.width = `${(currentRound / TOTAL_ROUNDS) * 100}%`;

  const theme = MATH_ITEMS[Math.floor(Math.random() * MATH_ITEMS.length)];

  if (mathLevel === 1) {
    if (Math.random() < 0.55) {
      setupMathAddition(1, 5, 1, 5, theme);
    } else {
      setupMathSubtraction(3, 9, theme);
    }
  } else if (mathLevel === 2) {
    const roll = Math.random();
    if (roll < 0.4) {
      setupMathAddition(5, 9, 4, 8, theme);
    } else if (roll < 0.7) {
      setupMathSubtraction(8, 15, theme);
    } else {
      setupMathComparison(theme);
    }
  } else {
    if (Math.random() < 0.55) {
      setupMathMissingAddend(theme);
    } else {
      setupMathTripleAddition(theme);
    }
  }
}

function setupMathAddition(minA, maxA, minB, maxB, theme) {
  const a = randInt(minA, maxA);
  const b = randInt(minB, maxB);
  const answer = a + b;

  currentMathQ = {
    mode: 'add',
    a, b, answer,
    countSoFar: 0,
    spokenChunks: [
      { text: `${a}，加 ${b}，等於多少呢？`, lang: 'zh-TW', pauseAfter: 300 },
      { text: '可以點點看圖案，幫你數喔！', lang: 'zh-TW' },
    ],
  };

  document.getElementById('math-prompt-text').innerHTML =
    `幫 <b>${PET_CONFIG.corieName}</b> 算算看：<b>${a} 加 ${b}</b> 合起來總共有幾個？（點圖案會幫你報數喔！）`;

  const stage = document.getElementById('math-visual-stage');
  stage.innerHTML = `
    <div class="math-group" id="m-grp-1"></div>
    <div class="math-operator">+</div>
    <div class="math-group" id="m-grp-2"></div>
    <div class="math-operator">=</div>
    <div class="math-question-box" id="math-answer-slot">?</div>
  `;
  populateCountableItems('m-grp-1', a, theme, 'left');
  populateCountableItems('m-grp-2', b, theme, 'right');

  document.getElementById('math-equation-bar').innerHTML = `
    <span>${a}</span> <span>+</span> <span>${b}</span> <span>=</span>
    <span id="math-eq-ans" class="question-mark-pill">?</span>
  `;

  renderMathNumberOptions(answer, 4);
  repeatMathPrompt();
}

function setupMathSubtraction(minTotal, maxTotal, theme) {
  const total = randInt(minTotal, maxTotal);
  const minus = randInt(1, Math.min(6, total - 1));
  const answer = total - minus;

  currentMathQ = {
    mode: 'sub',
    total, minus, answer,
    countSoFar: 0,
    spokenChunks: [
      { text: `原本有 ${total} 個，`, lang: 'zh-TW', pauseAfter: 250 },
      { text: `拿走了 ${minus} 個，還剩下幾個呢？`, lang: 'zh-TW' },
    ],
  };

  document.getElementById('math-prompt-text').innerHTML =
    `原本有 <b>${total}</b> ${theme.unit}，<b>${PET_CONFIG.corieName}</b> 拿走了 <b>${minus}</b> 個（打 ✖ 的部分），數數看還剩下幾個？`;

  const stage = document.getElementById('math-visual-stage');
  stage.innerHTML = `
    <div class="math-group" id="m-grp-sub" style="max-width:440px;"></div>
    <div class="math-operator">=</div>
    <div class="math-question-box" id="math-answer-slot">?</div>
  `;

  const grp = document.getElementById('m-grp-sub');
  for (let i = 0; i < total; i++) {
    const isCrossed = i >= answer;
    const item = createVisualToken(theme, 'left');
    if (isCrossed) {
      item.classList.add('crossed-out');
      item.title = '已經被拿走囉';
    } else {
      item.onclick = () => triggerCountClick(item);
    }
    grp.appendChild(item);
  }

  document.getElementById('math-equation-bar').innerHTML = `
    <span>${total}</span> <span>−</span> <span>${minus}</span> <span>=</span>
    <span id="math-eq-ans" class="question-mark-pill">?</span>
  `;

  renderMathNumberOptions(answer, 4);
  repeatMathPrompt();
}

function setupMathComparison(theme) {
  const leftVal = randInt(2, 10);
  let rightVal = randInt(2, 10);
  if (Math.random() < 0.25) rightVal = leftVal;

  const answer = leftVal > rightVal ? '>' : (leftVal < rightVal ? '<' : '=');

  currentMathQ = {
    mode: 'compare',
    leftVal, rightVal, answer,
    countSoFar: 0,
    spokenChunks: [
      { text: `左邊有 ${leftVal} 個，右邊有 ${rightVal} 個，`, lang: 'zh-TW', pauseAfter: 280 },
      { text: '哪一邊比較多，還是一樣多呢？', lang: 'zh-TW' },
    ],
  };

  document.getElementById('math-prompt-text').innerHTML =
    `比一比：左邊有 <b>${leftVal}</b> 個，右邊有 <b>${rightVal}</b> 個，中間要放哪個符號呢？（大嘴巴喜歡吃比較多的那邊喔！）`;

  const stage = document.getElementById('math-visual-stage');
  stage.innerHTML = `
    <div class="math-group" id="m-grp-left"></div>
    <div class="math-question-box" id="math-answer-slot">?</div>
    <div class="math-group" id="m-grp-right"></div>
  `;
  populateCountableItems('m-grp-left', leftVal, theme, 'left');
  populateCountableItems('m-grp-right', rightVal, theme, 'right');

  document.getElementById('math-equation-bar').innerHTML = `
    <span>${leftVal}</span>
    <span id="math-eq-ans" class="question-mark-pill">?</span>
    <span>${rightVal}</span>
  `;

  const container = document.getElementById('math-options-container');
  container.innerHTML = '';
  [
    { sym: '>', label: '左邊比較多' },
    { sym: '=', label: '兩邊一樣多' },
    { sym: '<', label: '右邊比較多' },
  ].forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'option-card num-btn';
    btn.innerHTML = `
      <div style="font-size:2.8rem; line-height:1;">${opt.sym}</div>
      <div class="option-zh">${opt.label}</div>
    `;
    btn.onclick = () => verifyMathAnswer(opt.sym, btn);
    container.appendChild(btn);
  });

  repeatMathPrompt();
}

function setupMathMissingAddend(theme) {
  const a = randInt(2, 6);
  const answer = randInt(2, 6);
  const total = a + answer;

  currentMathQ = {
    mode: 'missing',
    a, answer, total,
    countSoFar: 0,
    spokenChunks: [
      { text: `已經有 ${a} 個了，`, lang: 'zh-TW', pauseAfter: 250 },
      { text: `還要再加幾個，才會變成 ${total} 個呢？`, lang: 'zh-TW' },
    ],
  };

  document.getElementById('math-prompt-text').innerHTML =
    `<b>${PET_CONFIG.corieName}</b> 已經有 <b>${a}</b> 個，還要再加幾個才會湊滿 <b>${total}</b> 個呢？（點點看紫色虛線框數一數！）`;

  const stage = document.getElementById('math-visual-stage');
  stage.innerHTML = `
    <div class="math-group" id="m-grp-known"></div>
    <div class="math-operator">+</div>
    <div class="math-group" id="m-grp-mystery"></div>
    <div class="math-operator">=</div>
    <div class="math-question-box">${total}</div>
  `;
  populateCountableItems('m-grp-known', a, theme, 'left');

  const mysGrp = document.getElementById('m-grp-mystery');
  for (let i = 0; i < answer; i++) {
    const slot = document.createElement('div');
    slot.className = 'countable-item mystery-slot';
    slot.textContent = '?';
    slot.onclick = () => {
      triggerCountClick(slot);
      slot.textContent = currentMathQ.countSoFar;
    };
    mysGrp.appendChild(slot);
  }

  document.getElementById('math-equation-bar').innerHTML = `
    <span>${a}</span> <span>+</span>
    <span id="math-eq-ans" class="question-mark-pill">?</span>
    <span>=</span> <span>${total}</span>
  `;

  renderMathNumberOptions(answer, 4);
  repeatMathPrompt();
}

function setupMathTripleAddition(theme) {
  const a = randInt(1, 4);
  const b = randInt(1, 4);
  const c = randInt(1, 4);
  const answer = a + b + c;

  currentMathQ = {
    mode: 'triple',
    a, b, c, answer,
    countSoFar: 0,
    spokenChunks: [
      { text: `超級挑戰！${a} 加 ${b}，再加 ${c}，`, lang: 'zh-TW', pauseAfter: 280 },
      { text: '合起來總共是多少呢？', lang: 'zh-TW' },
    ],
  };

  document.getElementById('math-prompt-text').innerHTML =
    `超級連加挑戰：<b>${a} + ${b} + ${c}</b> 合起來總共有幾個呢？`;

  const stage = document.getElementById('math-visual-stage');
  stage.innerHTML = `
    <div class="math-group" id="m-grp-1"></div>
    <div class="math-operator">+</div>
    <div class="math-group" id="m-grp-2"></div>
    <div class="math-operator">+</div>
    <div class="math-group" id="m-grp-3"></div>
    <div class="math-operator">=</div>
    <div class="math-question-box" id="math-answer-slot">?</div>
  `;
  populateCountableItems('m-grp-1', a, theme, 'left');
  populateCountableItems('m-grp-2', b, theme, 'right');
  populateCountableItems('m-grp-3', c, theme, 'left');

  document.getElementById('math-equation-bar').innerHTML = `
    <span>${a}</span> <span>+</span> <span>${b}</span> <span>+</span> <span>${c}</span>
    <span>=</span> <span id="math-eq-ans" class="question-mark-pill">?</span>
  `;

  renderMathNumberOptions(answer, 4);
  repeatMathPrompt();
}

function createVisualToken(theme, side) {
  const item = document.createElement('div');
  item.className = 'countable-item';
  if (theme.type === 'pets') {
    const imgSrc = side === 'left' ? theme.leftImg : theme.rightImg;
    const fallback = side === 'left' ? theme.leftFallback : theme.rightFallback;
    item.innerHTML = `<img src="${imgSrc}" alt="" onerror="this.style.display='none'; this.parentElement.textContent='${fallback}';" />`;
  } else {
    item.textContent = theme.emoji;
  }
  return item;
}

function populateCountableItems(containerId, count, theme, side) {
  const box = document.getElementById(containerId);
  if (!box) return;
  box.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const item = createVisualToken(theme, side);
    item.onclick = () => triggerCountClick(item);
    box.appendChild(item);
  }
}

function triggerCountClick(itemEl) {
  if (!itemEl.classList.contains('counted')) {
    itemEl.classList.add('counted');
    currentMathQ.countSoFar += 1;
  }
  playTone(400 + currentMathQ.countSoFar * 50, 0.12, 'triangle');
  speakSequence([{ text: String(currentMathQ.countSoFar), lang: 'zh-TW' }]);
}

function renderMathNumberOptions(correctNum, totalOptions = 4) {
  const optionSet = new Set([correctNum]);
  const offsetPool = [-3, -2, -1, 1, 2, 3, 4];
  while (optionSet.size < totalOptions) {
    const delta = offsetPool[Math.floor(Math.random() * offsetPool.length)];
    const candidate = Math.max(0, correctNum + delta);
    optionSet.add(candidate);
  }
  const choices = [...optionSet].sort((x, y) => x - y);

  const container = document.getElementById('math-options-container');
  container.innerHTML = '';
  choices.forEach((num) => {
    const btn = document.createElement('button');
    btn.className = 'option-card num-btn';
    btn.textContent = num;
    btn.onclick = () => verifyMathAnswer(num, btn);
    container.appendChild(btn);
  });
}

function repeatMathPrompt() {
  if (!currentMathQ || !currentMathQ.spokenChunks) return;
  speakSequence(currentMathQ.spokenChunks);
}

function verifyMathAnswer(chosenVal, btnEl) {
  if (isLocked) return;
  const { answer } = currentMathQ;

  if (chosenVal === answer) {
    isLocked = true;
    btnEl.classList.add('correct');

    const eqAns = document.getElementById('math-eq-ans');
    if (eqAns) eqAns.textContent = answer;
    const slotAns = document.getElementById('math-answer-slot');
    if (slotAns) slotAns.textContent = answer;

    playSuccessJingle();
    spawnConfetti(18);
    totalStars += 1;
    updateStarsUI();

    const ansText = answer === '>' ? '左邊比較多' : answer === '<' ? '右邊比較多' : answer === '=' ? '兩邊一樣多' : String(answer);
    speakSequence([
      { text: `答對了，答案就是 ${ansText}，你好棒喔！`, lang: 'zh-TW' },
    ]);

    setTimeout(() => {
      if (currentRound < TOTAL_ROUNDS) {
        currentRound += 1;
        nextMathRound();
      } else {
        finishGame();
      }
    }, 2200);
  } else {
    btnEl.classList.add('wrong');
    playTryAgainSound();
    speakSequence([
      { text: '差一點點，可以點點看上面的圖案，再數一次喔！', lang: 'zh-TW' },
    ]);
    setTimeout(() => btnEl.classList.remove('wrong'), 650);
  }
}

// ============================================================================
// ⏰ 時鐘遊戲：Shannon 的時鐘教室（整點、半點、15分、5分刻度與動手撥針）
// ============================================================================
const DAILY_ROUTINES = {
  1: '🌙 半夜 1 點（睡香香）',
  2: '🌠 半夜 2 點（做美夢）',
  3: '下午 3 點（吃點心時間🍪）',
  4: '下午 4 點（公園溜滑梯🛝）',
  5: '下午 5 點（準備回家🏠）',
  6: '晚上 6 點（吃美味晚餐🍜）',
  7: '早上 7 點（太陽起床囉☀️）',
  8: '早上 8 點（吃營養早餐🥛）',
  9: '早上 9 點（快樂學才藝🎨）',
  10: '早上 10 點（喝水休息🍎）',
  11: '中午 11 點（準備吃午餐🍱）',
  12: '中午 12 點（太陽在正中間☀️）',
};

function startClockGame(lvl = 1) {
  currentGame = 'clock';
  clockLevel = lvl;
  currentRound = 1;
  updateClockLevelChips();
  showScreen('clock');
  nextClockRound();
}

function switchClockLevel(lvl) {
  clockLevel = lvl;
  currentRound = 1;
  updateClockLevelChips();
  nextClockRound();
}

function updateClockLevelChips() {
  [1, 2, 3].forEach((n) => {
    const chip = document.getElementById(`clock-lvl-chip-${n}`);
    if (chip) chip.classList.toggle('active', n === clockLevel);
  });
}

function formatTimeDigital(h, m) {
  return `${h}:${m < 10 ? '0' + m : m}`;
}

function formatTimeSpokenZh(h, m) {
  if (m === 0) return `${h} 點整`;
  if (m === 30) return `${h} 點半（${h} 點 30 分）`;
  return `${h} 點 ${m < 10 ? '零 ' + m : m} 分`;
}

function nextClockRound() {
  isLocked = false;
  document.getElementById('clock-round-text').textContent = `第 ${currentRound} / ${TOTAL_ROUNDS} 題`;
  document.getElementById('clock-progress-fill').style.width = `${(currentRound / TOTAL_ROUNDS) * 100}%`;

  const setControls = document.getElementById('clock-set-controls');
  const optionsContainer = document.getElementById('clock-options-container');
  setControls.classList.add('hidden');
  optionsContainer.classList.remove('hidden');

  if (clockLevel === 1) {
    // 🌱 Lv.1：整點報時 (1:00 ~ 12:00)
    const hour = randInt(1, 12);
    setupClockReadQuestion(hour, 0, false);
  } else if (clockLevel === 2) {
    // 🌟 Lv.2：半點 (:30) 與 一刻鐘 (:15 / :45)
    const hour = randInt(1, 12);
    const minPool = [15, 30, 30, 45];
    const minute = minPool[Math.floor(Math.random() * minPool.length)];
    setupClockReadQuestion(hour, minute, true);
  } else {
    // 🏆 Lv.3：5 分鐘刻度認時鐘 (55%) 或 親手幫 Shannon 撥時鐘調鬧鐘 (45%)
    if (Math.random() < 0.55) {
      const hour = randInt(1, 12);
      const minPool = [5, 10, 20, 25, 35, 40, 50, 55];
      const minute = minPool[Math.floor(Math.random() * minPool.length)];
      setupClockReadQuestion(hour, minute, true);
    } else {
      setupInteractiveSetClockQuestion();
    }
  }
}

function setupClockReadQuestion(hour, minute, showOuterFiveMarks) {
  const answerStr = formatTimeDigital(hour, minute);
  const spokenTime = formatTimeSpokenZh(hour, minute);

  currentClockQ = {
    mode: 'read',
    hour,
    minute,
    answerStr,
    spokenTime,
    showOuterFiveMarks,
    spokenChunks: [
      { text: `看看 ${PET_CONFIG.shannonName} 的時鐘，`, lang: 'zh-TW', pauseAfter: 250 },
      { text: minute === 0
        ? `藍長針指在 12，紅短針指在 ${hour}，現在是幾點呢？`
        : '紅短針看幾點，藍長針看幾分，現在是幾點幾分呢？', lang: 'zh-TW' },
    ],
  };

  document.getElementById('clock-prompt-text').innerHTML = minute === 0
    ? `<b>${PET_CONFIG.shannonName}</b> 問：🔵 藍長針指在 12，🔴 紅短針指著幾，就是幾點鐘喔！現在是幾點？`
    : `<b>${PET_CONFIG.shannonName}</b> 問：先看 🔴 紅短針在幾點，再數 🔵 藍長針走到幾分，現在是幾點幾分呢？`;

  document.getElementById('clock-activity-badge').textContent = DAILY_ROUTINES[hour] || '⏰ 滴答滴答看時間';

  drawAnalogClockSVG(hour, minute, showOuterFiveMarks);

  // 產生 4 個時間選項
  const choiceMap = new Map();
  choiceMap.set(answerStr, { h: hour, m: minute, str: answerStr, zh: formatTimeSpokenZh(hour, minute) });

  while (choiceMap.size < 4) {
    let fakeH = randInt(1, 12);
    let fakeM = minute;
    if (clockLevel === 2) {
      const p = [0, 15, 30, 45];
      fakeM = p[Math.floor(Math.random() * p.length)];
    } else if (clockLevel === 3) {
      fakeM = randInt(0, 11) * 5;
    }
    const key = formatTimeDigital(fakeH, fakeM);
    if (!choiceMap.has(key)) {
      choiceMap.set(key, { h: fakeH, m: fakeM, str: key, zh: formatTimeSpokenZh(fakeH, fakeM) });
    }
  }

  const choices = [...choiceMap.values()].sort((a, b) => (a.h * 60 + a.m) - (b.h * 60 + b.m));
  const container = document.getElementById('clock-options-container');
  container.innerHTML = '';

  choices.forEach((c) => {
    const btn = document.createElement('button');
    btn.className = 'option-card';
    btn.innerHTML = `
      <div class="clock-digital-time">${c.str}</div>
      <div class="option-zh">${c.zh}</div>
    `;
    btn.onclick = () => verifyClockChoice(c, btn);
    container.appendChild(btn);
  });

  repeatClockPrompt();
}

// 🏆 Lv.3 互動撥針模式：幫 Shannon 調鬧鐘！
function setupInteractiveSetClockQuestion() {
  const targetH = randInt(1, 12);
  const minOptions = [0, 15, 30, 45];
  const targetM = minOptions[Math.floor(Math.random() * minOptions.length)];

  // 初始時間故意跟目標不同
  let curH = (targetH % 12) + 1;
  let curM = 0;

  currentClockQ = {
    mode: 'set',
    targetH,
    targetM,
    curH,
    curM,
    spokenChunks: [
      { text: `請幫 ${PET_CONFIG.shannonName} 把鬧鐘，`, lang: 'zh-TW', pauseAfter: 250 },
      { text: `調到 ${formatTimeSpokenZh(targetH, targetM)} 吧！`, lang: 'zh-TW' },
    ],
  };

  document.getElementById('clock-prompt-text').innerHTML =
    `請點下面的紅藍按鈕，幫 <b>${PET_CONFIG.shannonName}</b> 把時鐘調到「<b>${formatTimeDigital(targetH, targetM)}（${formatTimeSpokenZh(targetH, targetM)}）</b>」！`;

  document.getElementById('clock-activity-badge').textContent =
    `🎯 目標時間：${formatTimeDigital(targetH, targetM)} (${formatTimeSpokenZh(targetH, targetM)})`;

  document.getElementById('clock-options-container').classList.add('hidden');
  document.getElementById('clock-set-controls').classList.remove('hidden');

  drawAnalogClockSVG(curH, curM, true);
  repeatClockPrompt();
}

function adjustInteractiveClock(deltaH, deltaM) {
  if (isLocked || !currentClockQ || currentClockQ.mode !== 'set') return;
  let totalMins = (currentClockQ.curH % 12) * 60 + currentClockQ.curM + deltaH * 60 + deltaM;
  totalMins = ((totalMins % 720) + 720) % 720;
  let newH = Math.floor(totalMins / 60);
  if (newH === 0) newH = 12;
  const newM = totalMins % 60;

  currentClockQ.curH = newH;
  currentClockQ.curM = newM;
  playTone(440 + newM * 4, 0.08, 'triangle');
  drawAnalogClockSVG(newH, newM, true);
}

function checkInteractiveClockAnswer() {
  if (isLocked || !currentClockQ || currentClockQ.mode !== 'set') return;
  const { curH, curM, targetH, targetM } = currentClockQ;

  if (curH === targetH && curM === targetM) {
    isLocked = true;
    playSuccessJingle();
    spawnConfetti(22);
    totalStars += 1;
    updateStarsUI();

    speakSequence([
      { text: `叮咚叮咚！太厲害了，你成功調到 ${formatTimeSpokenZh(targetH, targetM)} 了！`, lang: 'zh-TW' },
    ]);

    setTimeout(() => {
      if (currentRound < TOTAL_ROUNDS) {
        currentRound += 1;
        nextClockRound();
      } else {
        finishGame();
      }
    }, 2200);
  } else {
    playTryAgainSound();
    speakSequence([
      { text: `現在指針是 ${formatTimeSpokenZh(curH, curM)}，目標是 ${formatTimeSpokenZh(targetH, targetM)} 喔，再轉轉看！`, lang: 'zh-TW' },
    ]);
  }
}

function drawAnalogClockSVG(hour, minute, showFiveMarks = false) {
  const svg = document.getElementById('analog-clock-svg');
  if (!svg) return;

  const cx = 130;
  const cy = 130;
  const r = 104;

  let html = `
    <!-- 鐘面外框與底色 -->
    <circle cx="${cx}" cy="${cy}" r="${r + 12}" fill="#34d399" />
    <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="#ffffff" stroke="#10b981" stroke-width="4" />
    <circle cx="${cx}" cy="${cy}" r="${r - 2}" fill="#f0fdf4" />
  `;

  // 繪製 60 個分鐘刻度
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const isHourTick = i % 5 === 0;
    const rOuter = r - 4;
    const rInner = isHourTick ? r - 13 : r - 8;
    const x1 = cx + rInner * Math.cos(angle);
    const y1 = cy + rInner * Math.sin(angle);
    const x2 = cx + rOuter * Math.cos(angle);
    const y2 = cy + rOuter * Math.sin(angle);
    html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isHourTick ? '#0f766e' : '#99f6e4'}" stroke-width="${isHourTick ? 3.5 : 1.5}" stroke-linecap="round" />`;
  }

  // 繪製 1 ~ 12 數字（以及進階模式外圈的 5, 10, 15... 分鐘提示）
  for (let n = 1; n <= 12; n++) {
    const angle = (n * 30 - 90) * (Math.PI / 180);
    const numR = r - 28;
    const nx = cx + numR * Math.cos(angle);
    const ny = cy + numR * Math.sin(angle);
    html += `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="central" font-size="21" font-weight="900" fill="#1e293b">${n}</text>`;

    if (showFiveMarks) {
      const fiveVal = (n * 5) % 60;
      const fiveLabel = fiveVal === 0 ? '00' : String(fiveVal);
      const outerR = r + 18;
      const fx = cx + outerR * Math.cos(angle);
      const fy = cy + outerR * Math.sin(angle);
      html += `<text x="${fx}" y="${fy}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="900" fill="#0369a1">${fiveLabel}</text>`;
    }
  }

  // 計算時針與分針角度
  const minuteAngleDeg = minute * 6;
  const hourAngleDeg = ((hour % 12) + minute / 60) * 30;

  const hRad = (hourAngleDeg - 90) * (Math.PI / 180);
  const mRad = (minuteAngleDeg - 90) * (Math.PI / 180);

  const hLen = 54; // 紅短針
  const mLen = 80; // 藍長針

  const hx = cx + hLen * Math.cos(hRad);
  const hy = cy + hLen * Math.sin(hRad);
  const mx = cx + mLen * Math.cos(mRad);
  const my = cy + mLen * Math.sin(mRad);

  // 分針（藍長針）
  html += `<line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="#2563eb" stroke-width="6.5" stroke-linecap="round" />`;
  // 時針（紅短針）
  html += `<line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="#ef4444" stroke-width="9" stroke-linecap="round" />`;
  // 中心圓扣
  html += `<circle cx="${cx}" cy="${cy}" r="8" fill="#fbbf24" stroke="#d97706" stroke-width="3" />`;

  svg.innerHTML = html;
}

function repeatClockPrompt() {
  if (!currentClockQ || !currentClockQ.spokenChunks) return;
  speakSequence(currentClockQ.spokenChunks);
}

function verifyClockChoice(choice, btnEl) {
  if (isLocked) return;
  const { answerStr, spokenTime } = currentClockQ;

  if (choice.str === answerStr) {
    isLocked = true;
    btnEl.classList.add('correct');
    playSuccessJingle();
    spawnConfetti(18);
    totalStars += 1;
    updateStarsUI();

    speakSequence([
      { text: `答對了！現在是 ${spokenTime}，你超會看時鐘的！`, lang: 'zh-TW' },
    ]);

    setTimeout(() => {
      if (currentRound < TOTAL_ROUNDS) {
        currentRound += 1;
        nextClockRound();
      } else {
        finishGame();
      }
    }, 2200);
  } else {
    btnEl.classList.add('wrong');
    playTryAgainSound();
    speakSequence([
      { text: `這是 ${choice.zh}，再仔細看看紅短針跟藍長針指在哪裡喔！`, lang: 'zh-TW' },
    ]);
    setTimeout(() => btnEl.classList.remove('wrong'), 650);
  }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// 🎉 過關慶祝與灑花特效
// ============================================================================
function finishGame() {
  showScreen('celebrate');
  spawnConfetti(45);
  playSuccessJingle();

  const msg = `${PET_CONFIG.corieName}、${PET_CONFIG.duncanName} 和 ${PET_CONFIG.shannonName} 替你拍拍手！你完成了 ${TOTAL_ROUNDS} 道挑戰，獲得滿滿的星星！`;
  document.getElementById('celebrate-message').textContent = msg;
  speakSequence([
    { text: '太棒了，全部過關！', lang: 'zh-TW', pauseAfter: 300 },
    { text: msg, lang: 'zh-TW' },
  ]);

  const againBtn = document.getElementById('btn-play-again');
  againBtn.onclick = () => {
    if (currentGame === 'english') startEnglishGame(englishLevel);
    else if (currentGame === 'math') startMathGame(mathLevel);
    else startClockGame(clockLevel);
  };
}

function spawnConfetti(count = 25) {
  const container = document.getElementById('confetti-container');
  const icons = ['⭐', '🌸', '✨', '🎀', '🐾', '🫧', '🎉'];
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
// ⚙️ 家長設定（3位主角名字、雙語音引擎切換、語速與試聽）
// ============================================================================
function populateVoiceSelectors() {
  const zhSelect = document.getElementById('select-zh-voice');
  const enSelect = document.getElementById('select-en-voice');
  if (!zhSelect || !enSelect || !cachedVoices.length) return;

  const zhVoices = cachedVoices
    .filter((v) => scoreVoice(v, 'zh') > -500)
    .sort((a, b) => scoreVoice(b, 'zh') - scoreVoice(a, 'zh'));

  const enVoices = cachedVoices
    .filter((v) => scoreVoice(v, 'en') > -500)
    .sort((a, b) => scoreVoice(b, 'en') - scoreVoice(a, 'en'));

  zhSelect.innerHTML = '<option value="">✨ 自動挑選最自然中文語音</option>';
  zhVoices.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.voiceURI;
    opt.textContent = `${v.name} (${v.lang})`;
    if (v.voiceURI === PET_CONFIG.zhVoiceURI) opt.selected = true;
    zhSelect.appendChild(opt);
  });

  enSelect.innerHTML = '<option value="">✨ 自動挑選最自然美式英語</option>';
  enVoices.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.voiceURI;
    opt.textContent = `${v.name} (${v.lang})`;
    if (v.voiceURI === PET_CONFIG.enVoiceURI) opt.selected = true;
    enSelect.appendChild(opt);
  });
}

function updateSpeedLabel(val) {
  const num = parseFloat(val);
  let desc = '溫柔適中';
  if (num <= 0.8) desc = '慢速清晰';
  else if (num <= 0.92) desc = '溫柔適中（推薦）';
  else desc = '自然輕快';
  const lbl = document.getElementById('speed-label-val');
  if (lbl) lbl.textContent = `${desc} (${num.toFixed(2)}x)`;
}

function openSettingsModal() {
  loadVoices();
  document.getElementById('input-corie-name').value = PET_CONFIG.corieName;
  document.getElementById('input-duncan-name').value = PET_CONFIG.duncanName;
  document.getElementById('input-shannon-name').value = PET_CONFIG.shannonName;
  document.getElementById('select-tts-mode').value = PET_CONFIG.ttsMode;
  document.getElementById('input-speech-rate').value = PET_CONFIG.speechRate;
  updateSpeedLabel(PET_CONFIG.speechRate);
  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.add('hidden');
}

function testVoicePreview() {
  PET_CONFIG.ttsMode = document.getElementById('select-tts-mode').value;
  PET_CONFIG.speechRate = parseFloat(document.getElementById('input-speech-rate').value || '0.90');
  PET_CONFIG.zhVoiceURI = document.getElementById('select-zh-voice').value;
  PET_CONFIG.enVoiceURI = document.getElementById('select-en-voice').value;

  speakSequence([
    { text: 'Apple. Strawberry.', lang: 'en-US', pauseAfter: 450 },
    { text: `嗨，我是比奇堡的 ${PET_CONFIG.shannonName}，`, lang: 'zh-TW', pauseAfter: 280 },
    { text: '我們一起來學看時鐘吧！', lang: 'zh-TW' },
  ]);
}

function saveSettings() {
  const newCorie = document.getElementById('input-corie-name').value.trim() || 'Corie';
  const newDuncan = document.getElementById('input-duncan-name').value.trim() || 'Duncan';
  const newShannon = document.getElementById('input-shannon-name').value.trim() || 'Shannon';
  const newMode = document.getElementById('select-tts-mode').value || 'auto';
  const newRate = parseFloat(document.getElementById('input-speech-rate').value || '0.90');
  const newZh = document.getElementById('select-zh-voice').value;
  const newEn = document.getElementById('select-en-voice').value;

  PET_CONFIG.corieName = newCorie;
  PET_CONFIG.duncanName = newDuncan;
  PET_CONFIG.shannonName = newShannon;
  PET_CONFIG.ttsMode = newMode;
  PET_CONFIG.speechRate = newRate;
  PET_CONFIG.zhVoiceURI = newZh;
  PET_CONFIG.enVoiceURI = newEn;

  localStorage.setItem('pet_corie_name', newCorie);
  localStorage.setItem('pet_duncan_name', newDuncan);
  localStorage.setItem('pet_shannon_name', newShannon);
  localStorage.setItem('pet_tts_mode', newMode);
  localStorage.setItem('pet_speech_rate', String(newRate));
  localStorage.setItem('pet_zh_voice', newZh);
  localStorage.setItem('pet_en_voice', newEn);

  applyPetNames();
  closeSettingsModal();
  playSuccessJingle();
}

window.addEventListener('DOMContentLoaded', initApp);
