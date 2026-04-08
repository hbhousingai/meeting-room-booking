// ============================================================
// 會議室預約系統 — Google Apps Script 後端
// 使用說明：
//   1. 開啟您的 Google Sheets
//   2. 點選「擴充功能」→「Apps Script」
//   3. 將此檔案內容貼到 Code.gs
//   4. 執行 initSheet() 以建立工作表及初始資料（只需一次）
//   5. 點選「部署」→「新增部署作業」→ 類型選「網路應用程式」
//      執行身分：我自己 / 存取權：任何人
//   6. 複製部署 URL，設定為 Vercel 環境變數 APPS_SCRIPT_URL
// ============================================================

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    })
    .filter(row => row.id !== '' && row.id !== null && row.id !== undefined);
}

// 移除密碼欄位，安全回傳使用者資料
function stripPassword(user) {
  const { password, ...safe } = user;
  return safe;
}

function doGet(e) {
  const action = e.parameter.action;
  try {

    // ── 登入驗證（在伺服器端比對，不把密碼送往瀏覽器）──
    if (action === 'login') {
      const email = e.parameter.email;
      const pass  = e.parameter.password;
      const users = sheetToObjects(getSheet('Users'));
      const user  = users.find(u => String(u.email) === email && String(u.password) === pass);
      if (!user) return jsonResp({ success: false, error: '帳號或密碼錯誤' });
      return jsonResp({ success: true, user: stripPassword(user) });
    }

    // ── 取得預約＋使用者（不含密碼）──
    if (action === 'getAll') {
      return jsonResp({
        bookings: sheetToObjects(getSheet('Bookings')),
        users:    sheetToObjects(getSheet('Users')).map(stripPassword)
      });
    }

    if (action === 'addBooking') {
      const b = JSON.parse(e.parameter.data);
      getSheet('Bookings').appendRow([
        b.id, b.roomId, b.date, b.startTime, b.endTime,
        b.topic, b.applicant, b.userId, b.note, b.createdAt
      ]);
      return jsonResp({ success: true });
    }

    if (action === 'editBooking') {
      const b = JSON.parse(e.parameter.data);
      const sheet = getSheet('Bookings');
      const vals = sheet.getDataRange().getValues();
      for (let i = 1; i < vals.length; i++) {
        if (String(vals[i][0]) === String(b.id)) {
          sheet.getRange(i + 1, 1, 1, 10).setValues([[
            b.id, b.roomId, b.date, b.startTime, b.endTime,
            b.topic, b.applicant, b.userId, b.note, b.createdAt
          ]]);
          break;
        }
      }
      return jsonResp({ success: true });
    }

    if (action === 'deleteBooking') {
      const id = e.parameter.id;
      const sheet = getSheet('Bookings');
      const vals = sheet.getDataRange().getValues();
      for (let i = 1; i < vals.length; i++) {
        if (String(vals[i][0]) === String(id)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return jsonResp({ success: true });
    }

    if (action === 'addUser') {
      const u = JSON.parse(e.parameter.data);
      getSheet('Users').appendRow([u.id, u.name, u.email, u.password, u.role, u.dept]);
      return jsonResp({ success: true });
    }

    if (action === 'editUser') {
      const u = JSON.parse(e.parameter.data);
      const sheet = getSheet('Users');
      const vals = sheet.getDataRange().getValues();
      for (let i = 1; i < vals.length; i++) {
        if (String(vals[i][0]) === String(u.id)) {
          // keepPassword: true 時保留原本密碼，不覆蓋
          const existingPassword = vals[i][3];
          const newPassword = u.keepPassword ? existingPassword : u.password;
          sheet.getRange(i + 1, 1, 1, 6).setValues([[
            u.id, u.name, u.email, newPassword, u.role, u.dept
          ]]);
          break;
        }
      }
      return jsonResp({ success: true });
    }

    if (action === 'deleteUser') {
      const id = e.parameter.id;
      const sheet = getSheet('Users');
      const vals = sheet.getDataRange().getValues();
      for (let i = 1; i < vals.length; i++) {
        if (String(vals[i][0]) === String(id)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return jsonResp({ success: true });
    }

    return jsonResp({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResp({ error: err.message });
  }
}

function jsonResp(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// 執行此函式以初始化試算表（只需執行一次）
function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let bookSheet = ss.getSheetByName('Bookings');
  if (!bookSheet) bookSheet = ss.insertSheet('Bookings');
  if (bookSheet.getLastRow() === 0) {
    bookSheet.getRange(1, 1, 1, 10).setValues([[
      'id','roomId','date','startTime','endTime','topic','applicant','userId','note','createdAt'
    ]]);
  }

  let userSheet = ss.getSheetByName('Users');
  if (!userSheet) userSheet = ss.insertSheet('Users');
  if (userSheet.getLastRow() === 0) {
    userSheet.getRange(1, 1, 1, 6).setValues([['id','name','email','password','role','dept']]);
    userSheet.appendRow(['u1','系統管理員','admin@org.com','admin123','admin','資訊部']);
    userSheet.appendRow(['u2','一般使用者','user@org.com','user123','user','業務部']);
    userSheet.appendRow(['u3','王小明','wang@org.com','wang123','user','行政部']);
  }

  SpreadsheetApp.getUi().alert('初始化完成！請繼續部署為網路應用程式。');
}
