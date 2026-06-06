# 今晚吃命

用一點命運感決定今天吃什麼的手機 PWA。這個 App 可以匯入 Google Maps 匯出的地點 / 評論紀錄，把可能是餐廳的地點整理成清單，再用骰子、拉霸、抽卡等遊戲方式隨機選出晚餐或午餐。

目前 baseline 來自既有可用原型 `晚餐選擇.zip`，已改名為「今晚吃命」並整理成可延續開發的專案根目錄。

`data.js` 只保留可公開的 demo 餐廳資料。自己的 Google Maps 匯出檔、匯入樣本、評論紀錄與地點歷史不要提交到 repo。

## 功能現況

- 探索餐廳：搜尋、距離排序、半徑滑桿、料理篩選、一鍵開 Google Maps
- 隨機決定：骰子、拉霸、抽卡三種玩法
- 用餐紀錄：記錄日期、心情、花費、備註，並累加吃過次數
- 統計：本月常吃 / 少吃、花費、口味與心情分布、最久沒光顧
- 匯入：支援 Google Maps GeoJSON 類型資料，可同時選取「評論」與「已儲存的地點」檔案，保留完整評論與 Google Maps 連結，並讓使用者檢查被排除的非餐廳項目
- PWA：可用手機瀏覽器加入主畫面，以 standalone 模式使用

## 本機執行

```bash
npm run start
```

開啟指令輸出的網址，預設是 `http://localhost:4173`。

> 不建議直接用 `file://` 開啟，因為 Service Worker 與離線快取需要本機伺服器或 HTTPS。

## 驗證

```bash
npm run test
```

目前 smoke test 會確認主要 PWA 檔案存在、`index.html` 有載入核心腳本、Service Worker 快取清單沒有指向不存在的檔案，以及 manifest 名稱和 standalone 設定正確。

## 部署

GitHub Pages 目前由 `gh-pages` branch 發布。更新靜態 artifact 前先執行：

```bash
npm run build:pages
```

再將 `dist/` 內容發布到 `gh-pages` branch。

正式網址：

```text
https://yoyocadence.github.io/Dinner-by-Destiny/
```

## 架構

這是一個無打包工具的 React PWA 原型：

- `index.html`：入口；載入 React / ReactDOM / Babel、所有元件、註冊 Service Worker
- `manifest.webmanifest`：PWA 名稱、圖示、standalone 設定
- `sw.js`：離線快取 App shell
- `data.js`：種子餐廳資料、料理類型、預設位置
- `import-util.js`：Google Maps 匯入解析與分類規則
- `store.jsx`：全域狀態與 localStorage persistence
- `App.jsx`：手機外殼、底部分頁、設定面板與彈層
- `screens/`：探索、骰子、紀錄、統計、群組、匯入等畫面

重要跨檔慣例請看 `CLAUDE.md`；協作與任務規則請看 `AGENTS.md` 和 `tasks.md`。

## 後端方向

目前資料仍以瀏覽器 localStorage 為主。下一步需要決定是否使用 Supabase 或其他後端來處理：

- 使用者登入與資料歸屬
- 匯入資料保存與同步
- 餐廳分類結果與用餐紀錄
- 隱私與 row-level access policy

Supabase 是已知候選，但正式接後端前要先完成資料模型與安全規則規劃。

目前建議方向記錄在 `docs/backend-direction.md`，Google Maps 匯入資料模型記錄在 `docs/google-maps-import-data-model.md`。
