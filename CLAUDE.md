# CLAUDE.md — LeaveEasy ระบบขอลาออนไลน์

คู่มือประจำโปรเจกต์สำหรับ Claude Code · อ่านไฟล์นี้ก่อนแก้โค้ดทุกครั้ง · สเปกฉบับเต็มอยู่ใน `leaveeasy-spec.md`

## 1. โครงงานนี้คืออะไร

- ระบบขอลาออนไลน์ ของ ADT-RAISE Batch 2 · Module 2 (สัปดาห์ที่ 6–9)
- พนักงานยื่นใบลา · หัวหน้าอนุมัติ · ฝ่ายบุคคลดูแลประเภทการลา
- ตอนนี้อยู่สัปดาห์ที่ 7: CRUD ครบ 4 ตัว · ล็อกอิน · กฎขั้นต่ำ "ต้องล็อกอินก่อน" · ขึ้น Firebase Hosting

## 2. เครื่องมือที่ใช้ ห้ามเปลี่ยน

- HTML · CSS · JavaScript ธรรมดา ไม่มี framework ไม่มีขั้นตอน build
- Firebase SDK 12.18.0 ผ่าน CDN ด้วย import map ใน `<head>` ของแต่ละหน้า
- ฐานข้อมูล Firestore · ล็อกอิน Firebase Authentication · ขึ้นออนไลน์ Firebase Hosting
- เปิดในเครื่อง: `npm install` แล้ว `npm run dev` · ถ้าพอร์ต 3000 ไม่ว่าง serve จะเลือกพอร์ตอื่นให้

## 3. ไฟล์หลัก

| หน้าจอ | ไฟล์หน้า | ไฟล์การทำงาน |
|---|---|---|
| หน้าแรก | `index.html` | — |
| รายการใบลา | `leave-requests.html` | `js/leave-requests.js` |
| ยื่นใบลาใหม่ | `new-leave-request.html` | `js/new-leave-request.js` |
| รายละเอียดใบลา + ความเห็น | `leave-request-detail.html` | `js/leave-request-detail.js` |
| ประเภทการลา | `leave-types.html` | `js/leave-types.js` |

- `js/firebase-config.js` ค่าเชื่อมต่อ Firebase
- `js/data.js` ฟังก์ชันอ่านและเขียน Firestore ทั้งหมด หน้าอื่นเรียกผ่านไฟล์นี้
- `js/nav.js` แถบเมนู · `js/util.js` ตัวช่วยเล็ก ๆ

## 4. โครงสร้างข้อมูลบน Firestore

```
📁 users/{id}           name · email · role
📁 leaveTypes/{id}      name
📁 leaveRequests/{id}   title · reason · status · startDate · endDate · createdAt
                        requesterId · requesterName
                        approverId · approverName
                        leaveTypeId · leaveTypeName
   └ 📁 approvals/{id}  authorId · authorName · message · createdAt
```

- ไม่มี JOIN จึงจดชื่อซ้ำ: `requesterName` · `approverName` · `leaveTypeName` · `authorName` ต้องบันทึกคู่กับรหัสเสมอ
- ชื่อ field ต้องสะกดตรงตามนี้เป๊ะ · Firestore แยกตัวพิมพ์เล็กใหญ่
- `createdAt` เก็บเป็นข้อความรูปแบบ `YYYY-MM-DD HH:mm` · หน้ารายการเรียงจากใหม่ไปเก่า
- `role` ใช้รหัสอังกฤษ `employee` · `manager` · `hr` · บนหน้าจอแสดงเป็น ผู้ขอลา · ผู้อนุมัติ · ฝ่ายบุคคล

## 5. ข้อตกลง

- ข้อความบนหน้าจอเป็นภาษาไทยทั้งหมด
- สถานะใบลาใช้ได้ 3 ค่าเท่านั้น: `รอพิจารณา` · `อนุมัติ` · `ไม่อนุมัติ`
- ใบลาใหม่ตั้งเป็น `รอพิจารณา` อัตโนมัติ · `อนุมัติ` และ `ไม่อนุมัติ` เป็นปลายทาง เปลี่ยนต่อไม่ได้
- เปลี่ยนสถานะให้แก้เฉพาะช่อง `status` ห้ามเขียนทับช่องอื่น
- เปลี่ยนเป็น `ไม่อนุมัติ` ต้องมีความเห็นใน `approvals` อย่างน้อย 1 รายการก่อน
- ลบได้เฉพาะใบที่ยังเป็น `รอพิจารณา` และต้องถามยืนยันก่อนทุกครั้ง
- ทำงานทีละข้อ · ขอแผนก่อนลงมือ · ทำเสร็จหนึ่งอย่าง commit ทันที

## 6. สิ่งที่ห้ามทำ

- ห้ามใส่คีย์ รหัสผ่าน หรือค่า `firebaseConfig` จริงลงไฟล์ที่ commit และ push ขึ้น GitHub
- ห้ามเปลี่ยนไปใช้ framework หรือเขียนเซิร์ฟเวอร์เอง
- ห้ามใช้ข้อมูลส่วนบุคคลจริงของใคร · ใช้ชื่อสมมติ สมชาย สมหญิง สมศรี และอีเมล `@example.com`
- ห้ามทำงานของสัปดาห์ที่ 8 ล่วงหน้า: Security Rules รายห้อง · ปุ่มผู้ช่วย AI · Reviewer
