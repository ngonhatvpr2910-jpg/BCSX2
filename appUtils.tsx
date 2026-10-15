import { useState, useEffect } from 'react';
export interface FormModelItem {
  id: string;
  productId: string;
  dailyPlan?: number;
  hourlyActuals: { [slotName: string]: number };
}

export interface YearWeek {
  id: number; // e.g. 1 to 53
  days: { dateStr: string; dayNum: number; monthNum: number }[];
  label: string;
}



// Function to calculate ISO-like weeks but shifted to Friday-Thursday
export function getFridayToThursdayWeeksForMonth(year: number, month: number): string[] {
  let w1Start = new Date(year, 0, 1);
  while (w1Start.getDay() !== 5) {
    w1Start.setDate(w1Start.getDate() - 1);
  }
  
  let weeks: string[] = [];
  for (let i = 1; i <= 53; i++) {
    let weekStart = new Date(w1Start);
    weekStart.setDate(w1Start.getDate() + (i - 1) * 7);
    let weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    let mStart = new Date(year, month - 1, 1);
    let mEnd = new Date(year, month, 0); // Last day of month
    
    // Check overlap
    if (weekStart <= mEnd && weekEnd >= mStart) {
      weeks.push("W" + i);
    }
  }
  return weeks;
}

export function getStandardYearWeeks(year: number): YearWeek[] {
  const weeks: YearWeek[] = [];
  let currentWeekDays: { dateStr: string; dayNum: number; monthNum: number }[] = [];
  let weekIndex = 1;

  for (let m = 1; m <= 12; m++) {
    const daysInMonth = new Date(year, m, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, m - 1, d);
      const dayOfWeek = date.getDay(); // 0: CN, 1: T2, ..., 5: T6, 6: T7
      const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Monday starts a new week!
      if (dayOfWeek === 1 && currentWeekDays.length > 0) {
        weeks.push({
          id: weekIndex,
          days: [...currentWeekDays],
          label: ""
        });
        weekIndex++;
        currentWeekDays = [];
      }

      currentWeekDays.push({ dateStr, dayNum: d, monthNum: m });
    }
  }

  if (currentWeekDays.length > 0) {
    weeks.push({
      id: weekIndex,
      days: [...currentWeekDays],
      label: ""
    });
  }

  const getDayName = (y: number, mon: number, day: number) => {
    const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return dayNames[new Date(y, mon - 1, day).getDay()];
  };

  return weeks.map(w => {
    const first = w.days[0];
    const last = w.days[w.days.length - 1];
    const firstLabel = `${getDayName(year, first.monthNum, first.dayNum)} ${String(first.dayNum).padStart(2, '0')}/${String(first.monthNum).padStart(2, '0')}`;
    const lastLabel = `${getDayName(year, last.monthNum, last.dayNum)} ${String(last.dayNum).padStart(2, '0')}/${String(last.monthNum).padStart(2, '0')}`;
    return {
      ...w,
      label: `Tuần W${w.id} (${firstLabel} - ${lastLabel})`
    };
  });
}

export function getYearWeeks(year: number): YearWeek[] {
  const weeks: YearWeek[] = [];
  let currentWeekDays: { dateStr: string; dayNum: number; monthNum: number }[] = [];
  let weekIndex = 1;

  for (let m = 1; m <= 12; m++) {
    const daysInMonth = new Date(year, m, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, m - 1, d);
      const dayOfWeek = date.getDay(); // 0: CN, 1: T2, ..., 5: T6, 6: T7
      const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Friday starts a new week!
      if (dayOfWeek === 5 && currentWeekDays.length > 0) {
        weeks.push({
          id: weekIndex,
          days: [...currentWeekDays],
          label: ""
        });
        weekIndex++;
        currentWeekDays = [];
      }

      currentWeekDays.push({ dateStr, dayNum: d, monthNum: m });
    }
  }

  if (currentWeekDays.length > 0) {
    weeks.push({
      id: weekIndex,
      days: [...currentWeekDays],
      label: ""
    });
  }

  const getDayName = (y: number, mon: number, day: number) => {
    const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return dayNames[new Date(y, mon - 1, day).getDay()];
  };

  return weeks.map(w => {
    const first = w.days[0];
    const last = w.days[w.days.length - 1];
    const firstLabel = `${getDayName(year, first.monthNum, first.dayNum)} ${String(first.dayNum).padStart(2, '0')}/${String(first.monthNum).padStart(2, '0')}`;
    const lastLabel = `${getDayName(year, last.monthNum, last.dayNum)} ${String(last.dayNum).padStart(2, '0')}/${String(last.monthNum).padStart(2, '0')}`;
    return {
      ...w,
      label: `Tuần W${w.id} (${firstLabel} - ${lastLabel})`
    };
  });
}

export function getWeeksInMonth(year: number, month: number): YearWeek[] {
  const allWeeks = getYearWeeks(year);
  return allWeeks.filter(w => w.days.some(d => d.monthNum === month));
}

export function getShiftSlots(shift: string): string[] {
  if (shift.includes("17:00")) {
    return [
      "8H - 9H", "9H - 10H", "10H - 11H", "11H - 12H",
      "13H - 14H", "14H - 15H", "15H - 16H", "16H - 17H"
    ];
  } else if (shift.includes("19h")) {
    return [
      "8H - 9H", "9H - 10H", "10H - 11H", "11H - 12H",
      "13H - 14H", "14H - 15H", "15H - 16H", "16H - 17H",
      "17H - 18H", "18H - 19H"
    ];
  } else if (shift.includes("20h00")) {
    return [
      "8H - 9H", "9H - 10H", "10H - 11H", "11H - 12H",
      "13H - 14H", "14H - 15H", "15H - 16H", "16H - 17H",
      "17H - 18H", "18H - 19H", "19H - 20H"
    ];
  }
  return [
    "8H - 9H", "9H - 10H", "10H - 11H", "11H - 12H",
    "13H - 14H", "14H - 15H", "15H - 16H", "16H - 17H"
  ];
}

export function isValidHourlySlot(slot: string): boolean {
  if (!slot || typeof slot !== "string") return false;
  const s = slot.trim().toUpperCase();
  if (s.startsWith("CA ") || s.startsWith("CA_") || s.includes("08:00") || s.includes("17:00") || s.includes("CA HC") || s.includes("CA 1") || s.includes("CA 2") || s.includes("CA 3")) {
    return false;
  }
  return /\d+\s*H/i.test(s) && (s.includes("-") || s.includes("–"));
}

export function formatSlotLabel(slot: string): string {
  if (!slot || typeof slot !== "string") return "";
  let clean = slot.trim().toUpperCase().replace(/:00/g, "").replace(/\s+/g, "");
  const match = clean.match(/^(\d+)(H|H-)?-?(\d+)(H)?$/);
  if (match) {
    const start = parseInt(match[1]);
    const end = parseInt(match[3]);
    return `${start}H - ${end}H`;
  }
  return slot.trim();
}

export function cleanModelCode(str: string): string {
  if (!str || typeof str !== "string") return "";
  let s = str.trim().toUpperCase();
  // Loại bỏ các tiền tố quản lý nội bộ nhà máy (BBDK2, BBDK, BBD, RMV, RRO1, MMKRO, MMLN)
  s = s.replace(/^(BBDK2|BBDK|BBD|RMV|RRO1|MMKRO|MMLN)/i, "");
  return s;
}

export function getProductModelCode(name: string, fallbackCode?: string): string {
  if (!name && !fallbackCode) return "";
  const text = ((name || "") + " " + (fallbackCode || "")).normalize("NFC");
  const words = text.replace(/[\(\)\[\],\-_\/]/g, " ").split(/\s+/);
  
  // Ưu tiên các họ model chuẩn của Sunhouse: SHA, SHB, SHD, MMB, MMBB, APB, MH
  for (const word of words) {
    const cleanWord = cleanModelCode(word);
    if (/^(SHA|SHB|SHD|MMB|MMBB|APB|MH)[A-Z0-9-]+$/i.test(cleanWord)) {
      return cleanWord.toUpperCase();
    }
  }
  
  // Nhận diện mã có cả chữ cái và số độ dài >= 4
  for (const word of words) {
    const cleanWord = cleanModelCode(word);
    if (/[A-Z]/.test(cleanWord) && /[0-9]/.test(cleanWord) && cleanWord.length >= 4) {
      return cleanWord.toUpperCase();
    }
  }
  
  if (fallbackCode) return cleanModelCode(fallbackCode);
  return cleanModelCode(name);
}

export const YAXIS_DOMAIN: [number, "auto"] = [0, "auto"];

// Lấy Canonical Key đại diện duy nhất cho một Model
export function getCanonicalProductKey(prodOrId: any, prodList: any[] = []): string {
  if (!prodOrId) return "";
  if (typeof prodOrId === "object") {
    const extracted = getProductModelCode(prodOrId.name, prodOrId.code);
    if (extracted) return extracted.toUpperCase();
    if (prodOrId.code) return cleanModelCode(prodOrId.code);
    return String(prodOrId.id || "").trim().toUpperCase();
  }

  const c = String(prodOrId).trim().toUpperCase();
  const found = prodList.find(x => 
    (x.id && String(x.id).trim().toUpperCase() === c) || 
    (x.code && String(x.code).trim().toUpperCase() === c) || 
    (x.code && cleanModelCode(x.code) === cleanModelCode(c)) ||
    (x.name && getProductModelCode(x.name, x.code) === c)
  );

  if (found) {
    const code = getProductModelCode(found.name, found.code);
    if (code) return code.toUpperCase();
    if (found.code) return cleanModelCode(found.code);
    return String(found.id).trim().toUpperCase();
  }

  const directExtracted = getProductModelCode(c);
  return directExtracted ? directExtracted.toUpperCase() : cleanModelCode(c);
}

export function getModelKeyForItem(productId?: string, prodList: any[] = []): string {
  return getCanonicalProductKey(productId, prodList);
}

// So khớp sản phẩm thông minh chuẩn hóa 100% (theo ID, Code hoặc Canonical Model key)
export function isSameProduct(id1?: string, id2?: string, prodList: any[] = []): boolean {
  if (!id1 || !id2) return false;
  const c1 = String(id1).trim().toUpperCase();
  const c2 = String(id2).trim().toUpperCase();
  if (c1 === c2) return true;

  const k1 = getCanonicalProductKey(id1, prodList);
  const k2 = getCanonicalProductKey(id2, prodList);
  if (k1 && k2 && k1 === k2) return true;

  const p1 = prodList.find(p => 
    (p.id && String(p.id).toUpperCase() === c1) || 
    (p.code && String(p.code).toUpperCase() === c1) ||
    (p.code && cleanModelCode(p.code) === cleanModelCode(c1)) ||
    (p.name && getProductModelCode(p.name, p.code).toUpperCase() === c1)
  );
  const p2 = prodList.find(p => 
    (p.id && String(p.id).toUpperCase() === c2) || 
    (p.code && String(p.code).toUpperCase() === c2) || 
    (p.code && cleanModelCode(p.code) === cleanModelCode(c2)) ||
    (p.name && getProductModelCode(p.name, p.code).toUpperCase() === c2)
  );

  if (p1 && p2) {
    if (p1.id === p2.id) return true;
    const m1 = getProductModelCode(p1.name, p1.code).toUpperCase();
    const m2 = getProductModelCode(p2.name, p2.code).toUpperCase();
    if (m1 && m2 && m1 === m2) return true;
  }
  if (p1 && (
    (p1.id && String(p1.id).toUpperCase() === c2) || 
    (p1.code && String(p1.code).toUpperCase() === c2) || 
    (p1.name && getProductModelCode(p1.name, p1.code).toUpperCase() === c2)
  )) return true;
  if (p2 && (
    (p2.id && String(p2.id).toUpperCase() === c1) || 
    (p2.code && String(p2.code).toUpperCase() === c1) || 
    (p2.name && getProductModelCode(p2.name, p2.code).toUpperCase() === c1)
  )) return true;

  return false;
}

// Khử trùng lặp danh mục sản phẩm hoàn toàn (chỉ giữ 1 bản ghi duy nhất cho mỗi model)
export function deduplicateProductDefinitions<T extends { id?: string; name?: string; code?: string; group?: string; factor?: number; price?: number; description?: string }>(prods: T[]): T[] {
  if (!prods || prods.length === 0) return [];
  const groups = new Map<string, T[]>();

  for (const p of prods) {
    const key = getProductModelCode(p.name || "", p.code || "").toUpperCase() || cleanModelCode(p.code || "").toUpperCase() || (p.id || "");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  const result: T[] = [];
  for (const [, items] of groups.entries()) {
    // Ưu tiên chọn ID chuẩn tiêu chuẩn (mln-, bg-, rma-) hoặc ID ngắn gọn
    items.sort((a, b) => {
      const aStd = /^(mln|bg|rma)-/i.test(a.id || "");
      const bStd = /^(mln|bg|rma)-/i.test(b.id || "");
      if (aStd && !bStd) return -1;
      if (!aStd && bStd) return 1;
      return (a.id || "").localeCompare(b.id || "");
    });
    const canonical = items[0];
    result.push(canonical);
  }

  return result;
}

// Hàm đảm bảo 1 bảng nhật ký ca KHÔNG BAO GIỜ có 2 model sản xuất trùng nhau, giữ thứ tự ổn định không nhảy
export function deduplicateFormModelItems(items: FormModelItem[], prodList: any[] = []): FormModelItem[] {
  if (!items || items.length === 0) return [];
  const result: FormModelItem[] = [];
  const seenKeys = new Set<string>();

  for (const item of items) {
    if (!item.productId) continue;
    const modelKey = getCanonicalProductKey(item.productId, prodList);
    const existingIndex = result.findIndex(r => {
      if (modelKey && getCanonicalProductKey(r.productId, prodList) === modelKey) return true;
      return isSameProduct(r.productId, item.productId, prodList);
    });

    if (existingIndex === -1 && (!modelKey || !seenKeys.has(modelKey))) {
      if (modelKey) seenKeys.add(modelKey);
      result.push({
        ...item,
        id: item.id || `item_${item.productId}`,
        hourlyActuals: { ...(item.hourlyActuals || {}) }
      });
    } else {
      // Gộp sản lượng của model trùng lặp vào dòng đầu tiên
      const targetIndex = existingIndex !== -1 ? existingIndex : result.findIndex(r => getCanonicalProductKey(r.productId, prodList) === modelKey);
      if (targetIndex !== -1) {
        const existing = result[targetIndex];
        const mergedActuals: { [k: string]: number } = { ...existing.hourlyActuals };
        Object.entries(item.hourlyActuals || {}).forEach(([k, v]) => {
          mergedActuals[k] = (mergedActuals[k] || 0) + (Number(v) || 0);
        });
        result[targetIndex] = {
          ...existing,
          dailyPlan: Math.max(existing.dailyPlan || 0, item.dailyPlan || 0),
          hourlyActuals: mergedActuals,
        };
      }
    }
  }

  return result;
}

export const DigitalClock = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString("vi-VN", { hour12: false }));
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("vi-VN", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="text-rose-500 font-bold ml-1">{time}</span>;
};

