# 🔧 LeaveEasy — ระบบขอลาออนไลน์

**ผู้จัดทำ:** ธนาวรรธน์ กิตติศรญเกียรติ

**ADT-RAISE Non-Degree Batch 2 · Module 2: MVP-Ready** (สัปดาห์ที่ 6–9) · repo ใบงาน LeaveEasy

🌐 **เว็บออนไลน์:** _(จะเติมหลัง deploy ขึ้น Firebase Hosting)_

---

พนักงานยื่นใบลาผ่านหน้าเว็บ หัวหน้าพิจารณาอนุมัติหรือไม่อนุมัติ แล้วผลถูกบันทึกไว้ให้เปิดดูย้อนหลังได้
เขียนด้วย **HTML · CSS · JavaScript ธรรมดา** ไม่มี framework · ฐานข้อมูลและล็อกอินใช้ **Firebase** (Firestore · Authentication · Security Rules · Hosting)

## 📌 ที่มาของโค้ดสัปดาห์ที่ 7

- สัปดาห์ที่ 6 ทำเองตามใบงานที่ 1 · สัปดาห์ที่ 7 ทำ CLAUDE.md และกันไฟล์คีย์ด้วย `.gitignore` เองแล้ว
- ส่วนที่เหลือของสัปดาห์ที่ 7 (CRUD · ล็อกอิน · กฎขั้นต่ำ · Hosting) ใช้โค้ดจากแท็ก `week7-end` ของ repo ต้นแบบ [`cnacha-mfu/leaveeasy`](https://github.com/cnacha-mfu/leaveeasy) ตามที่ใบงานที่ 3 (สัปดาห์ที่ 8) อนุญาตให้ใช้เป็นจุดเริ่มต้น
- งานก่อนรวมโค้ดเก็บไว้ใน branch `backup-before-week7-end` ในเครื่อง

## ▶️ เปิดใช้งาน

ขั้นตอนเตรียมเครื่องทั้งหมดอยู่ใน [`SETUP.md`](SETUP.md) · สรุปสั้น ๆ

```
npm install
cp js/firebase-config.example.js js/firebase-config.js   # แล้วเติมค่า firebaseConfig ของโปรเจกต์ตัวเอง
npm run dev
```

## 📁 ไฟล์สำคัญ

- [`CLAUDE.md`](CLAUDE.md) คู่มือประจำโครงงานสำหรับ Claude Code
- [`leaveeasy-spec.md`](leaveeasy-spec.md) ข้อกำหนดระบบ
- [`firestore.rules`](firestore.rules) กฎขั้นต่ำ "ต้องล็อกอินก่อน"
- `js/firebase-config.js` และ `.firebaserc` อยู่ในเครื่องเท่านั้น `.gitignore` กันไว้
