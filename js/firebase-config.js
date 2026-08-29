// ตั้งค่าการเชื่อมต่อ Firebase — ใช้ import map (ดู <head> ของแต่ละหน้า) แทน npm bundler
// เพราะโปรเจกต์นี้ไม่มีขั้นตอน build
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiW81VNEEYSM8Y_brmWN8bqcFrYHcq7yk",
  authDomain: "test-5f6dd.firebaseapp.com",
  projectId: "test-5f6dd",
  storageBucket: "test-5f6dd.firebasestorage.app",
  messagingSenderId: "998068396310",
  appId: "1:998068396310:web:9b6e3d71ec563fcf753037"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
