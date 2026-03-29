import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// CHÚ Ý DÀNH CHO BẠN (SINH VIÊN ĐANG LÀM ĐỒ ÁN):
// Hãy xóa bảng firebaseConfig giả dưới đây, dán bảng Thật của bạn lấy từ Google Firebase vào vị trí này.
// Vị trí: console.firebase.google.com -> Web App.
// Nếu cài chuẩn, App TỰ ĐỘNG nâng cấp thành App Cloud (Tạo nick trên máy này, máy khác đăng nhập được).
// Nếu chưa dán hoặc dán sai, App vẫn tiếp tục chạy hoàn hảo dưới dạng Local Offline thông thường.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:123456"
};

let app, db = null;

try {
  // Chỉ cài đặt Đám mây khi sinh viên đã dán API Key thật:
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.apiKey.length > 20) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log("🟢 FIREBASE CLOUD SYSTEM: KẾT NỐI THÀNH CÔNG");
  } else {
      console.warn("🟡 FIREBASE CLOUD SYSTEM: Tắt (Đang chạy ở chế độ Cục Bộ LocalStorage)");
  }
} catch (error) {
  console.error("Lỗi Khởi tạo Cầu Ghép Firebase: ", error);
}

export { db };
