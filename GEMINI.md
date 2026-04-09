# 🏠 住商總部會議室預約系統 (Meeting Room Booking) - GEMINI Context

> 本文件為 Gemini CLI 的專案上下文指引，定義了專案結構、技術規格與開發規範。

---

## 📖 專案概述 (Project Overview)
一個基於 Google Sheets 作為後端資料庫的輕量化會議室預約系統。提供視覺化的時間格點界面，支援實體會議室（3F, 13F, 15F）與 ZOOM 線上會議室的預約管理。

### 核心架構
- **Frontend**: Vanilla HTML/JS + Tailwind CSS (via CDN)。採用單檔案 SPA 架構 (`index.html`)。
- **Backend/DB**: Google Apps Script (GAS) + Google Sheets。
- **Hosting**: GitHub Pages (由 Vercel 遷移而來)。
- **Data Flow**: 瀏覽器直接透過 `fetch` 呼叫 GAS URL（已啟動 CORS）。

---

## 🛠️ 技術規格 (Technical Specs)

### 1. 部署與環境變數
- **Secret Injection**: `APPS_SCRIPT_URL` 透過 GitHub Actions 在部署時注入到 `index.html` 的預留位。
- **Deployment**: 任何推送到 `main` 分支的變更都會觸發 `.github/workflows/deploy.yml`。

### 2. 時區與時間處理
- **時區**: 預設為台灣時間 (GMT+8)。
- **正規化邏輯**: 位於 `index.html` 的 `normalizeRow` 函數中。務必使用本地時間方法（如 `getHours()`, `getDate()`）而非 UTC 方法，以避免日期偏移。
- **時間格**: 08:30 ~ 17:30，每 30 分鐘為一格。

### 3. API 動作 (GAS Actions)
透過 `apiCall({ action: '...' })` 呼叫，支援以下動作：
- `getAll`: 取得所有預約與使用者資料。
- `login`: 驗證使用者身分。
- `addBooking` / `editBooking` / `deleteBooking`: 預約增刪修。
- `addUser` / `editUser` / `deleteUser`: 使用者管理（限管理員）。

---

## 📂 目錄結構 (Directory Structure)
- `index.html`: **核心檔案**。包含所有 UI 結構、CSS 樣式與 JS 業務邏輯。
- `api/sheets.js`: (已廢棄) 原 Vercel Serverless Function 代理腳本，目前僅供邏輯參考。
- `.planning/`: 專案規劃文件，包含 `PROJECT.md` (願景), `CONTEXT.md` (技術決策), `STATE.md` (開發進度)。
- `vercel.json`: Vercel 遺留設定檔。

---

## ⌨️ 開發規範 (Development Conventions)

### 1. 修改 `index.html`
由於所有邏輯都在單一檔案中，修改時請保持代碼塊的組織清晰：
- `CONSTANTS & DATA`: 會議室配置與時間格。
- `STATE`: 前端狀態管理。
- `API`: 與 GAS 的通訊邏輯。
- `VIEW RENDERERS`: 各頁面 (Book, Overview, MyBookings) 的渲染函數。
- `MODALS`: 預約視窗與詳情視窗的邏輯。

### 2. 測試與驗證
- **手動測試**: 修改後須驗證預約是否會產生「時間衝突」。
- **時區驗證**: 確保在 00:00 ~ 08:00 之間操作時，日期不會因 UTC 轉換而跳至前一天。

### 3. 提交規範
遵循原子化提交 (Atomic Commits)，例如：
- `feat(grid): add drag and drop support`
- `fix(timezone): solve 8-hour offset in row normalization`

---

## 🚀 常用指令 (Key Commands)
本專案為純靜態網頁，無須編譯步驟。
- **本地預覽**: 使用 `npx serve .` 或 Live Server 擴充功能開啟 `index.html`。
- **部署**: `git push origin main`。

---

## ⚠️ 隱私與安全
- **敏感資訊**: 嚴禁將真實的 `APPS_SCRIPT_URL` 硬編碼進原始碼並提交。請確保它僅透過環境變數注入。
- **存取控制**: 雖然 GAS URL 在前端可見，但後端 GAS 應實施基本的身分校驗。
