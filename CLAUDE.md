# CLAUDE.md — 給 Claude Code 的專案須知

這是一個**無打包工具**的 React 原型：`index.html` 用 `<script type="text/babel">` 在瀏覽器即時編譯 JSX。沒有 npm build、沒有 bundler。修改後直接重新整理瀏覽器即可（用本機伺服器，見 README）。

## 最重要的幾條慣例（違反會直接壞掉）

1. **每個 `.jsx` 檔是獨立的 Babel 編譯範圍**，彼此不共用 scope。跨檔分享元件一律掛到 `window`：
   - 檔案結尾用 `window.Explore = Explore;`（或 `Object.assign(window, {...})`）匯出。
   - 別的檔案使用時透過 `window.Explore` 或在 JSX 寫 `<window.Explore .../>`。

2. **React hooks 要在每個用到的檔案頂部各自解構**，因為 scope 不共用：
   ```js
   const { useState, useEffect, useMemo, useRef } = React;
   ```
   忘了加會出現「useState is not defined」。

3. **不要用 `const styles = {...}` 這種通用名稱**當共用樣式物件——多檔同名會在全域衝突。要嘛用行內樣式，要嘛取獨特名稱（如 `btnGhost`、`secTitle`）。

4. **載入順序固定在 `index.html`**：純 JS（`data.js`、`theme.js`）→ `tweaks-panel.jsx` → `store.jsx` → `icons.jsx` → `bits.jsx` → `screens/*.jsx` → `App.jsx` → 掛載。新增元件檔記得在這裡加 `<script>`，**也要加進 `sw.js` 的 `APP_SHELL`**（否則離線時抓不到）。

5. 改了 `sw.js` 的快取內容，記得把 `const CACHE = 'dinner-by-destiny-vN'` 版號 +1，使用者下次開啟才會更新。

## 資料流

- **狀態來源**：`store.jsx` 的 `useStore()`（單一 hook），整包存在 `localStorage['dinner_by_destiny_v1']`。
- `App.jsx` 呼叫一次 `useStore()`，把 `store` 往下傳給每個畫面。
- `store` 提供：`state`、`setSetting(k,v)`、`logMeal(entry)`、`deleteDiary(id)`、`snooze(id,days)`、`unsnooze(id)`、`setRating(id,n)`、`resetAll()`。
- `state` 形狀：`{ restaurants[], diary[], settings{theme,radius,layout,diceStyle}, friends[] }`。
- `store.jsx` 有 `migrate()`：載入舊 localStorage 時，會用 `data.js` 最新的靜態欄位（座標、店名…）覆寫 demo seed 餐廳，但保留使用者資料（eatCount、rating、lastEaten、diary）與使用者匯入的非 seed 餐廳。**改了 `data.js` 的座標/店名後**靠這個生效。

## 主題

- `theme.js` 的 `window.THEMES` 定義 4 組 CSS 變數（warm / minimal / dark / playful）。
- `App.jsx` 用 `window.applyTheme(rootEl, key)` 把變數塞到手機容器的 inline style。
- 所有元件**只用 CSS 變數**上色（`var(--accent)`、`var(--ink)`、`var(--surface)`、`var(--line)`、`var(--shadow)`、`var(--radius)`、`var(--font)`、`var(--font-display)` 等）。新增 UI 請沿用這些變數，切換主題才會跟著變。

## Tweaks 面板

- 用 starter `tweaks-panel.jsx`。`App.jsx` 裡用 `ReactDOM.createPortal(..., document.body)` 把面板掛到 body，**不能掛在手機容器內**（容器有 scale + overflow:hidden 會把面板裁掉）。
- 控制項直接讀寫 `store.settings`（不是用 starter 的 `useTweaks`）。

## 手機外殼與縮放

- `index.html` 把 `#phone-wrap`（390×844）用 `transform: scale()` 縮放置中。因為有 transform，**position:fixed 的東西會以這個容器為基準**——這就是 Tweaks 要 portal 出去的原因。

## 常見修改入口

- 換餐廳 / 改所在位置 → `data.js`
- 改配色 / 新主題 → `theme.js` 的 `THEMES`
- 探索頁版型 → `screens/Explore.jsx`（`CardRow` / `CompactRow` / `MagCard`）
- 骰子動畫 → `screens/Dice.jsx`（拉霸 `SlotReel` 用 `@keyframes slotspin`，定義在 `index.html`；抽卡 `FlipCard`）
- 記錄表單欄位 → `screens/Diary.jsx` 的 `LogSheet`
- 統計指標 → `screens/Stats.jsx`
