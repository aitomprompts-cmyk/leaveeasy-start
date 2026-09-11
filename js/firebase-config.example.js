// ตั้งค่าการเชื่อมต่อ Firebase — ไฟล์ตัวอย่าง ไม่มีค่าจริง
// วิธีใช้: คัดลอกไฟล์นี้เป็นชื่อ js/firebase-config.js แล้ววางค่าจาก Firebase Console
//          (⚙️ Project settings → Your apps → firebaseConfig)
// ไฟล์ js/firebase-config.js ถูก .gitignore กันไว้ ห้าม commit ขึ้น GitHub
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "วางค่า-apiKey-ที่นี่",
  authDomain: "วางค่า-authDomain-ที่นี่",
  projectId: "วางค่า-projectId-ที่นี่",
  storageBucket: "วางค่า-storageBucket-ที่นี่",
  messagingSenderId: "วางค่า-messagingSenderId-ที่นี่",
  appId: "วางค่า-appId-ที่นี่"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
