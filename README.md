# 🌈 Corie、Duncan、Shannon & 鐵牛 的快樂學習樂園 (kids-pet-games)

專為 5 歲小女孩設計的互動教育小遊戲網站（支援電腦、平板 iPad、手機觸控與自然語音發音）。

## 📍 專案位置與線上網址
- **本機專案路徑**：`D:\kids-pet-games`
- **GitHub 專案庫**：`https://github.com/Linch0421/kids-pet-games`
- **GitHub Upload 快速上傳頁**：`https://github.com/Linch0421/kids-pet-games/upload/main`
- **GitHub Pages 線上遊玩網址**：`https://linch0421.github.io/kids-pet-games/`

## 🐾 四大主角與遊戲關卡
所有角色名字皆可在網頁右上角「⚙️ 設定」或 `app.js` 的 `PET_CONFIG` 中隨時修改：
1. **🐶 黑白邊境牧羊犬 `Duncan`（英文探險）**：
   - A~Z 104 個高頻單字庫
   - Lv.1 幼幼認字、Lv.2 純聽音找圖＆首字母填空、Lv.3 大小寫配對＆單字拼拼樂
2. **🤖 機器人 `鐵牛`（注音符號樂園）**：
   - 台灣標準 37 個注音符號（`ㄅ~ㄦ`）與幼稚園標準讀音對照（`ZHUYIN_SOUND_MAP`）
   - Lv.1 認識 ㄅㄆㄇ、Lv.2 聽音選注音＆聲母填空、Lv.3 注音順序火車接龍＆拼音組合
3. **🐱 橘貓 `Corie`（數學冒險）**：
   - 點擊圖案自動亮燈報數
   - Lv.1 10 以內視覺化加法與吃點心減法、Lv.2 20 以內加減＆比大小 (`>`, `=`, `<`)、Lv.3 未知數虛線框填空 (`A + ? = B`) ＆三數連加
4. **🐟 比奇堡醜萌魚姊姊 `Shannon`（時鐘教室）**：
   - 互動式 SVG 圓形時鐘（紅短針看幾點、藍長針看幾分）
   - Lv.1 整點報時、Lv.2 半點 (`:30`) 與一刻鐘 (`:15/:45`)、Lv.3 5 分鐘刻度與「親手按鈕撥針調鬧鐘」

## 🎁 獎勵與語音系統
- **120 張豪華貼紙簿 (`STICKERS`)**：每得 3 顆星星解鎖一張貼紙，點擊已解鎖貼紙會念出貼紙專屬名稱。
- **雙語音引擎 (`speakSequence`)**：
  - 自動偵測微軟 Edge 自然神經網路語音（如 `Microsoft HsiaoChen Online (Natural)` 台灣曉臻）與雲端自然女聲串流（適合 Chrome）。
  - 支援 `0.75x ~ 1.50x` 語速滑桿與快速切換按鈕（`0.8x`、`1.0x`、`1.25x`、`1.5x`）。
