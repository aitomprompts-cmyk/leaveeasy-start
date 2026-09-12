// ─────────────────────────────────────────────────────────────
// js/new-leave-request.js — หน้าที่ 2 ยื่นใบลาใหม่
// สัปดาห์ที่ 7: บันทึกลง Firestore จริง (ตัว C ของ CRUD)
// ─────────────────────────────────────────────────────────────

import { db, hasConfig, collection, getDocs, addDoc } from "./firebase.js";
import { requireLogin } from "./auth.js";

const ฟอร์ม = document.getElementById("ฟอร์มใบลา");
const ช่องประเภท = document.getElementById("leaveTypeId");
const กล่องเตือน = document.getElementById("ข้อความเตือน");
const ปุ่มบันทึก = document.getElementById("ปุ่มบันทึก");
const ช่องเหตุผล = document.getElementById("reason");
const ปุ่มAI = document.getElementById("ปุ่มAI");
const ป้ายAI = document.getElementById("ป้ายAI");

// ผู้ยื่นใบลา = คนที่ล็อกอินอยู่จริง (เติมค่าตอนเริ่มทำงาน)
let ผู้ใช้ปัจจุบัน = null;

let ประเภททั้งหมด = [];

เริ่มทำงาน();

async function เริ่มทำงาน() {
  if (!hasConfig) {
    showConfigWarning("จึงยังบันทึกใบลาลงฐานข้อมูลไม่ได้");
    ปุ่มบันทึก.disabled = true;
    return;
  }
  // ⏳ ต้องรอให้รู้สถานะล็อกอินก่อน แล้วค่อยอ่านข้อมูลจากฐานข้อมูล
  ผู้ใช้ปัจจุบัน = await requireLogin();
  if (!ผู้ใช้ปัจจุบัน) return;

  await โหลดประเภทการลา();
  ฟอร์ม.addEventListener("submit", บันทึกใบลา);
  ปุ่มAI.addEventListener("click", ให้AIเลือกประเภท);
}

// ── อ่านประเภทการลาจากโฟลเดอร์ leaveTypes มาใส่รายการเลื่อนลง ──
async function โหลดประเภทการลา() {
  try {
    const ผล = await getDocs(collection(db, "leaveTypes"));
    ประเภททั้งหมด = ผล.docs.map((ไฟล์) => ({ id: ไฟล์.id, ...ไฟล์.data() }));

    ประเภททั้งหมด.forEach((ประเภท) => {
      const ตัวเลือก = document.createElement("option");
      ตัวเลือก.value = ประเภท.id;
      ตัวเลือก.textContent = ประเภท.name;
      ช่องประเภท.appendChild(ตัวเลือก);
    });

    if (ประเภททั้งหมด.length === 0) {
      เตือน("ยังไม่มีประเภทการลาในระบบ — ไปเพิ่มที่หน้าจัดการประเภทการลาก่อน");
    }
  } catch (e) {
    เตือน("อ่านประเภทการลาไม่สำเร็จ — " + แปลข้อผิดพลาด(e));
  }
}

// ── บันทึกใบลาใหม่ลง Firestore ──
async function บันทึกใบลา(e) {
  e.preventDefault();

  const ค่า = {
    title: document.getElementById("title").value.trim(),
    reason: document.getElementById("reason").value.trim(),
    leaveTypeId: ช่องประเภท.value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value
  };

  // ตรวจว่ากรอกครบก่อนบันทึก
  if (!ค่า.title || !ค่า.reason || !ค่า.leaveTypeId || !ค่า.startDate || !ค่า.endDate) {
    เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดบันทึก");
    return;
  }
  if (ค่า.endDate < ค่า.startDate) {
    เตือน("วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มลา");
    return;
  }

  const ประเภท = ประเภททั้งหมด.find((t) => t.id === ค่า.leaveTypeId);

  ปุ่มบันทึก.disabled = true;
  ปุ่มบันทึก.textContent = "กำลังบันทึก…";

  try {
    await addDoc(collection(db, "leaveRequests"), {
      title: ค่า.title,
      reason: ค่า.reason,
      status: "รอพิจารณา",                    // ใบใหม่เริ่มที่ รอพิจารณา เสมอ
      requesterId: ผู้ใช้ปัจจุบัน.uid,
      requesterName: ผู้ใช้ปัจจุบัน.name,      // 🔁 จดชื่อซ้ำไว้ เพราะ Firestore ไม่มี JOIN
      approverId: "",                          // ยังไม่ได้กำหนดผู้อนุมัติ
      approverName: "",
      leaveTypeId: ประเภท.id,
      leaveTypeName: ประเภท.name,              // 🔁 จดชื่อซ้ำไว้เช่นกัน
      startDate: ค่า.startDate,
      endDate: ค่า.endDate,
      createdAt: เวลาตอนนี้()
    });
    location.href = "leave-requests.html";
  } catch (err) {
    เตือน("บันทึกไม่สำเร็จ — " + แปลข้อผิดพลาด(err));
    ปุ่มบันทึก.disabled = false;
    ปุ่มบันทึก.textContent = "บันทึก";
  }
}

// ── ปุ่ม AI: อ่านเหตุผล + รายชื่อประเภทที่มีจริง แล้วให้ AI เลือกให้ ──
async function ให้AIเลือกประเภท() {
  const เหตุผล = ช่องเหตุผล.value.trim();
  ป้ายAI.classList.add("hidden");

  if (!เหตุผล) {
    เตือน("กรอกเหตุผลการลาก่อน แล้วค่อยกดให้ AI ช่วยจัดประเภท");
    return;
  }
  if (ประเภททั้งหมด.length === 0) {
    เตือน("ยังไม่มีประเภทการลาในระบบให้ AI เลือก");
    return;
  }

  const ข้อความเดิม = ปุ่มAI.textContent;
  ปุ่มAI.disabled = true;
  ปุ่มAI.textContent = "กำลังคิด…";

  const ตัวยกเลิก = new AbortController();
  const ตัวจับเวลา = setTimeout(() => ตัวยกเลิก.abort(), 15000);

  try {
    const { aiConfig } = await import("./config.js");
    if (!aiConfig.apiKey || aiConfig.apiKey.startsWith("ใส่")) {
      เตือน("ยังไม่ได้ตั้งค่าคีย์ AI — ดู js/config.js");
      return;
    }

    const รายชื่อประเภท = ประเภททั้งหมด
      .map((t) => `id: ${t.id} · ชื่อ: ${t.name}`)
      .join("\n");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: ตัวยกเลิก.signal,
      headers: {
        "Authorization": `Bearer ${aiConfig.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [{
          role: "user",
          content: `นี่คือรายชื่อประเภทการลาที่มีอยู่จริงในระบบ:\n${รายชื่อประเภท}\n\nเหตุผลการลาของพนักงาน: "${เหตุผล}"\n\nเลือกประเภทการลาที่ตรงที่สุดจากรายการด้านบนเท่านั้น ตอบกลับมาแค่ id ของประเภทนั้น ห้ามมีข้อความอื่นปน`
        }]
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);

    const คำตอบ = (data.choices?.[0]?.message?.content || "").trim();
    const ประเภทที่เลือก = ประเภททั้งหมด.find((t) => คำตอบ.includes(t.id));

    if (!ประเภทที่เลือก) {
      เตือน("AI จัดประเภทให้ไม่ได้ — โปรดเลือกเอง");
      return;
    }

    ช่องประเภท.value = ประเภทที่เลือก.id;
    ป้ายAI.classList.remove("hidden");
  } catch (err) {
    if (err.name === "AbortError") {
      เตือน("AI ตอบช้าเกินไป (เกิน 15 วินาที) — โปรดเลือกเอง");
    } else {
      เตือน("เรียก AI ไม่สำเร็จ — " + err.message);
    }
  } finally {
    clearTimeout(ตัวจับเวลา);
    ปุ่มAI.disabled = false;
    ปุ่มAI.textContent = ข้อความเดิม;
  }
}

function เตือน(ข้อความ) {
  กล่องเตือน.textContent = "⚠️ " + ข้อความ;
  กล่องเตือน.classList.remove("hidden");
}

function แปลข้อผิดพลาด(e) {
  if (String(e && e.code).includes("permission-denied")) {
    return "ฐานข้อมูลปฏิเสธ · ตรวจว่าล็อกอินแล้วหรือยัง และกฎใน firestore.rules deploy ขึ้นไปแล้วหรือยัง";
  }
  return (e && e.message) || String(e);
}
