// ─────────────────────────────────────────────────────────────
// js/data.js — อ่านข้อมูลจริงจาก Firestore (สัปดาห์ที่ 6: อ่านอย่างเดียว)
//
// โครงสร้างตรงตาม leaveeasy-spec.md หัวข้อ 5.2:
//   📁 users/{id}            { name, email, role }
//   📁 leaveTypes/{id}       { name }
//   📁 leaveRequests/{id}    { title, reason, status, requesterId, requesterName,
//                              approverId, approverName, leaveTypeId, leaveTypeName,
//                              startDate, endDate, createdAt }
//      📁 approvals/{id}     { authorId, authorName, message, createdAt }   ← subcollection
//
// การเขียน (ยื่นใบลาใหม่, เปลี่ยนสถานะ, เขียนความเห็น, จัดการประเภทการลา)
// ยังไม่บันทึกลง Firestore จริง — เป็นงานของสัปดาห์ที่ 7 ตามสเปกหัวข้อ 3 (US-02 ถึง US-07)
//
// ⚠️ ชื่อคนทุกชื่อเป็นชื่อสมมติ · อีเมลทุกตัวเป็นอีเมลตัวอย่าง
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase-config.js";
import { collection, doc, getDocs, setDoc, query, limit, orderBy } from "firebase/firestore";

// ข้อมูลตัวอย่าง (seed) ตรงตาม leaveeasy-spec.md หัวข้อ 7 — ใส่ลง Firestore ครั้งแรกที่ยังว่างอยู่
const ข้อมูลตั้งต้น = {
  users: [
    { id: "u001", name: "สมชาย ใจดี",   email: "somchai@example.com", role: "employee" },
    { id: "u002", name: "สมหญิง รักงาน", email: "somying@example.com", role: "manager" },
    { id: "u003", name: "สมศรี ตั้งใจ",  email: "somsri@example.com",  role: "hr" }
  ],

  leaveTypes: [
    { id: "lt001", name: "ลาพักร้อน" },
    { id: "lt002", name: "ลาป่วย" },
    { id: "lt003", name: "ลากิจ" }
  ],

  leaveRequests: [
    {
      id: "lr001",
      title: "ลาพักร้อนไปเที่ยวกับครอบครัว",
      reason: "วางแผนเดินทางไปต่างจังหวัดกับครอบครัว จองที่พักไว้ล่วงหน้าแล้ว",
      status: "รอพิจารณา",
      requesterId: "u001", requesterName: "สมชาย ใจดี",
      approverId: "u002",  approverName: "สมหญิง รักงาน",
      leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
      startDate: "2026-09-07", endDate: "2026-09-09",
      createdAt: "2026-09-01 09:15",
      approvals: [
        { id: "ap001", authorId: "u002", authorName: "สมหญิง รักงาน",
          message: "รับเรื่องแล้ว ขอดูตารางงานของทีมช่วงนั้นก่อนนะครับ",
          createdAt: "2026-09-01 13:40" },
        { id: "ap002", authorId: "u003", authorName: "สมศรี ตั้งใจ",
          message: "ตรวจแล้ว วันลาพักร้อนคงเหลือครอบคลุมช่วงที่ขอ ไม่ติดขัดฝั่งฝ่ายบุคคล",
          createdAt: "2026-09-02 10:05" }
      ]
    },
    {
      id: "lr002",
      title: "ลาป่วยไข้หวัดใหญ่",
      reason: "มีไข้สูงและไอมาก แพทย์แนะนำให้พักอยู่บ้าน 2 วัน",
      status: "อนุมัติ",
      requesterId: "u001", requesterName: "สมชาย ใจดี",
      approverId: "u002",  approverName: "สมหญิง รักงาน",
      leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
      startDate: "2026-08-24", endDate: "2026-08-25",
      createdAt: "2026-08-24 08:05",
      approvals: [
        { id: "ap003", authorId: "u002", authorName: "สมหญิง รักงาน",
          message: "อนุมัติแล้ว พักผ่อนให้เต็มที่ งานที่ค้างไว้เดี๋ยวทีมช่วยดูให้",
          createdAt: "2026-08-24 09:20" }
      ]
    },
    {
      id: "lr003",
      title: "ลากิจไปทำบัตรประชาชน",
      reason: "บัตรประชาชนหมดอายุ ต้องไปทำที่สำนักงานเขตในวันทำการ",
      status: "รอพิจารณา",
      requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
      approverId: "",      approverName: "",
      leaveTypeId: "lt003", leaveTypeName: "ลากิจ",
      startDate: "2026-09-15", endDate: "2026-09-15",
      createdAt: "2026-09-10 16:30",
      approvals: []
    },
    {
      id: "lr004",
      title: "ลาพักร้อนช่วงวันหยุดยาว",
      reason: "อยากต่อวันหยุดยาวไปพักผ่อนกับครอบครัวอีก 3 วัน",
      status: "ไม่อนุมัติ",
      requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
      approverId: "u002",  approverName: "สมหญิง รักงาน",
      leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
      startDate: "2026-10-12", endDate: "2026-10-16",
      createdAt: "2026-09-20 11:00",
      approvals: [
        { id: "ap004", authorId: "u002", authorName: "สมหญิง รักงาน",
          message: "ช่วงนั้นทีมมีงานส่งมอบพอดี ขอเลื่อนเป็นสัปดาห์ถัดไปได้ไหมครับ",
          createdAt: "2026-09-20 15:10" }
      ]
    },
    {
      id: "lr005",
      title: "ลาป่วยไปพบแพทย์ตามนัด",
      reason: "มีนัดตรวจติดตามอาการกับแพทย์ในช่วงเช้า",
      status: "รอพิจารณา",
      requesterId: "u001", requesterName: "สมชาย ใจดี",
      approverId: "u002",  approverName: "สมหญิง รักงาน",
      leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
      startDate: "2026-09-22", endDate: "2026-09-22",
      createdAt: "2026-09-18 14:45",
      approvals: []
    }
  ]
};

// ใส่ข้อมูลตั้งต้นลง Firestore แค่ครั้งเดียว — เช็กจาก leaveRequests ว่ายังว่างอยู่ไหมก่อน
let สัญญาเตรียมข้อมูล = null;
function เตรียมข้อมูลถ้าว่าง() {
  if (!สัญญาเตรียมข้อมูล) สัญญาเตรียมข้อมูล = ใส่ข้อมูลตั้งต้น();
  return สัญญาเตรียมข้อมูล;
}

async function ใส่ข้อมูลตั้งต้น() {
  const มีอยู่แล้ว = await getDocs(query(collection(db, "leaveRequests"), limit(1)));
  if (!มีอยู่แล้ว.empty) return;

  for (const u of ข้อมูลตั้งต้น.users) {
    const { id, ...ข้อมูล } = u;
    await setDoc(doc(db, "users", id), ข้อมูล);
  }
  for (const t of ข้อมูลตั้งต้น.leaveTypes) {
    const { id, ...ข้อมูล } = t;
    await setDoc(doc(db, "leaveTypes", id), ข้อมูล);
  }
  for (const r of ข้อมูลตั้งต้น.leaveRequests) {
    const { id, approvals, ...ข้อมูล } = r;
    await setDoc(doc(db, "leaveRequests", id), ข้อมูล);
    for (const a of approvals) {
      const { id: idความเห็น, ...ข้อมูลความเห็น } = a;
      await setDoc(doc(db, "leaveRequests", id, "approvals", idความเห็น), ข้อมูลความเห็น);
    }
  }
}

export async function getUsers() {
  await เตรียมข้อมูลถ้าว่าง();
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(function (d) { return { id: d.id, ...d.data() }; });
}

export async function getLeaveTypes() {
  await เตรียมข้อมูลถ้าว่าง();
  const snap = await getDocs(collection(db, "leaveTypes"));
  return snap.docs.map(function (d) { return { id: d.id, ...d.data() }; });
}

// เรียงจากใหม่ไปเก่าตาม createdAt (เก็บเป็นข้อความ "YYYY-MM-DD HH:mm" จึงเรียงตามตัวอักษรได้ถูกต้อง)
export async function getLeaveRequests() {
  await เตรียมข้อมูลถ้าว่าง();
  const snap = await getDocs(query(collection(db, "leaveRequests"), orderBy("createdAt", "desc")));
  return snap.docs.map(function (d) { return { id: d.id, ...d.data() }; });
}

export async function getApprovals(requestId) {
  await เตรียมข้อมูลถ้าว่าง();
  const snap = await getDocs(collection(db, "leaveRequests", requestId, "approvals"));
  return snap.docs.map(function (d) { return { id: d.id, ...d.data() }; });
}
