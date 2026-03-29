import CryptoJS from 'crypto-js';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const SECRET_KEY = 'smart_expense_secret_2026_super_secure';

export const saveData = (key, data) => {
  try {
    const jsonStr = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
    localStorage.setItem(key, encrypted);
    
    // Gắn động cơ Upload lên đám mây tĩnh lặng (Background Data Push)
    if (db) triggerCloudPush();
    
  } catch (e) {
    console.error('Lỗi mã hoá dữ liệu hệ thống', e);
  }
};

let pushTimeout = null;
const triggerCloudPush = () => {
   if (pushTimeout) clearTimeout(pushTimeout);
   pushTimeout = setTimeout(async () => {
      try {
         // Quét lại toàn bộ LocalStorage của App (Chỉ bao gồm các Database keys)
         const GLOBAL_DOC_KEYS = ['users_db', 'tx_data', 'goals_data', 'debts_data', 'journals_data', 'groups_data', 'group_tx_data', 'trash_data', 'system_broadcast', 'broadcast_receipts', 'audit_logs', 'system_categories'];
         
         const payload = {};
         GLOBAL_DOC_KEYS.forEach(k => {
             const raw = localStorage.getItem(k);
             if(raw) payload[k] = raw; // Gửi thẳng mã Hóa (Sinh viên lấy ăn điểm Bảo mật Cloud)
         });
         payload.lastUpdated = Date.now();
         
         await setDoc(doc(db, "smart_expense", "v6_global_state"), payload);
         console.log("☁ Upload Đám mây thành công lúc", new Date().toLocaleTimeString());
      } catch (err) {
         console.warn("Lỗi PUSH dữ liệu lên Mạng. (Data của bạn vẫn an toàn trên Máy).", err);
      }
   }, 2000); // 2 giây debounce: Chờ người dùng ngừng gõ mới Push tránh tốn tài nguyên
};

export const loadData = (key, defaultData) => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return defaultData;
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (e) {
    console.warn('Lỗi giải mã: Khóa sai hoặc dữ liệu nguyên thuỷ chưa mã hoá. Đang bỏ qua...');
    return defaultData;
  }
};

// Lắng nghe tín hiệu Nếu Thiết Bị Khác cập nhật (Điện thoại <-> Máy tính)
export const initCloudSyncListener = (onSyncReady) => {
    if (!db) {
        if(onSyncReady) onSyncReady(); // Nếu App chạy LocalOffline, Load ngay lập tức
        return; 
    }
    
    // Thu tín hiệu từ Radar Firebase:
    const docRef = doc(db, "smart_expense", "v6_global_state");
    onSnapshot(docRef, (snap) => {
        if(snap.exists()) {
             const data = snap.data();
             const localTime = Number(localStorage.getItem('cloud_last_synced') || 0);

             // Nếu Phiên bản trên mây mới hơn Máy tính local hiện tại >1.5s
             if (data.lastUpdated && data.lastUpdated > localTime + 1500) { 
                 console.log("☁ [CLOUDSYNC] CẬP NHẬT XUYÊN THIẾT BỊ VỪA ĐÁP XUỐNG! Đang nạp...");
                 
                 // Giã dông đè vào Cục Bội
                 Object.keys(data).forEach(k => {
                     if (k !== 'lastUpdated') {
                        localStorage.setItem(k, data[k]); 
                     }
                 });
                 localStorage.setItem('cloud_last_synced', Date.now());
                 
                 // Nếu người dùng đang ngồi xài mà máy khác update, Bắt Reload Màn hình
                 window.location.reload(); 
             } else {
                 // Lần load đầu:
                 localStorage.setItem('cloud_last_synced', Date.now());
             }
        }
        if(onSyncReady) onSyncReady(); // Lệnh Bật Xanh Màn Hình ở App.jsx
    }, (error) => {
        console.warn("Mất kết nối Radar Đám Mây. Tự rơi về Offline Mode.", error);
        if(onSyncReady) onSyncReady();
    });
};
