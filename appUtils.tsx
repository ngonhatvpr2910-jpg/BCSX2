import { useState, useEffect } from 'react';
export interface FormModelItem {
  id: string;
  productId: string;
  dailyPlan?: number;
  delayedWeeklyQty?: number;
  note?: string;
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

export const EXCEL_STANDARD_SLOTS = [
  "6h-7h", "7h-8h", "8h-9h", "9h-10h", "10h-11h", "11h-12h",
  "13h-14h", "14h-15h", "15h-16h", "16h-17h", "17h-18h",
  "18h-19h", "19h-20h", "20h-21h", "21h-21h30"
];

export function getShiftSlots(_shift?: string): string[] {
  return [
    "6h-7h", "7h-8h", "8h-9h", "9h-10h", "10h-11h", "11h-12h",
    "13h-14h", "14h-15h", "15h-16h", "16h-17h", "17h-18h",
    "18h-19h", "19h-20h", "20h-21h", "21h-21h30"
  ];
}

// Phân tích thành phần thời gian (ví dụ: '6', '6h', '6h30', '06:00', '21h30') thành số phút tính từ 00:00
export function parseSlotTimePart(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const clean = timeStr.trim().toLowerCase().replace(/\s+/g, '');
  const match = clean.match(/^(\d{1,2})(?:[h:.](\d{1,2})?|h)?$/);
  if (!match) return null;

  const hour = parseInt(match[1], 10);
  const min = match[2] ? parseInt(match[2], 10) : 0;
  if (isNaN(hour) || isNaN(min) || hour < 0 || hour > 24 || min < 0 || min >= 60) {
    return null;
  }
  return hour * 60 + min;
}

// Chuyển đổi số phút thành chuỗi chuẩn Excel (ví dụ: 360 -> '6h', 1290 -> '21h30')
export function formatMinutesToSlotTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const min = minutes % 60;
  if (min === 0) return `${hour}h`;
  return `${hour}h${String(min).padStart(2, '0')}`;
}

// Phân tích khung giờ thành khoảng thời gian [startMin, endMin) và chuỗi hiển thị chuẩn tắc
export function parseSlotRange(slot: string): { startMin: number; endMin: number; canonical: string } | null {
  if (!slot || typeof slot !== 'string') return null;
  const s = slot.trim().toLowerCase().replace(/–/g, '-').replace(/\s+/g, '');
  if (s.startsWith('ca') || s.includes('08:00-17:00') || s.includes('cahc')) return null;

  const parts = s.split('-');
  if (parts.length === 2) {
    const startMin = parseSlotTimePart(parts[0]);
    const endMin = parseSlotTimePart(parts[1]);
    if (startMin === null || endMin === null || startMin >= endMin) {
      return null;
    }
    const canonical = `${formatMinutesToSlotTime(startMin)}-${formatMinutesToSlotTime(endMin)}`;
    return { startMin, endMin, canonical };
  } else if (parts.length === 1) {
    // Xử lý các khung giờ biểu diễn đơn lẻ (ví dụ: '7h', '8h', '07:00', '7')
    const startMin = parseSlotTimePart(parts[0]);
    if (startMin !== null && startMin >= 0 && startMin < 24 * 60) {
      let endMin = startMin + 60;
      if (startMin === 21 * 60) {
        endMin = 21 * 60 + 30; // 21h - 21h30
      }
      const canonical = `${formatMinutesToSlotTime(startMin)}-${formatMinutesToSlotTime(endMin)}`;
      return { startMin, endMin, canonical };
    }
  }

  return null;
}

// Kiểm tra 2 khung giờ có bị trùng lặp hoặc giao thoa thời gian với nhau không
export function areSlotsOverlapping(slotA: string, slotB: string): boolean {
  if (!slotA || !slotB) return false;
  const rangeA = parseSlotRange(slotA);
  const rangeB = parseSlotRange(slotB);

  if (rangeA && rangeB) {
    // Hai khoảng [S1, E1) và [S2, E2) giao nhau khi và chỉ khi: max(S1, S2) < min(E1, E2)
    return Math.max(rangeA.startMin, rangeB.startMin) < Math.min(rangeA.endMin, rangeB.endMin);
  }

  // Fallback so sánh chuỗi nếu định dạng đặc biệt
  const normA = slotA.toLowerCase().replace(/\s+/g, '');
  const normB = slotB.toLowerCase().replace(/\s+/g, '');
  return normA === normB;
}

// Loại bỏ hoàn toàn các khung giờ trùng lặp hoặc giao thoa nhau, sắp xếp tăng dần theo thời gian
export function deduplicateAndSortSlots(slots: string[]): string[] {
  if (!slots || !Array.isArray(slots) || slots.length === 0) {
    return [...EXCEL_STANDARD_SLOTS];
  }

  const validParsed: { startMin: number; endMin: number; canonical: string }[] = [];

  for (const s of slots) {
    if (!s || typeof s !== 'string') continue;
    const parsed = parseSlotRange(s);
    if (!parsed) continue;

    // Kiểm tra xem đã có slot nào giao thoa thời gian với slot này chưa
    const isConflict = validParsed.some(existing =>
      Math.max(existing.startMin, parsed.startMin) < Math.min(existing.endMin, parsed.endMin)
    );

    if (!isConflict) {
      validParsed.push(parsed);
    }
  }

  if (validParsed.length === 0) {
    return [...EXCEL_STANDARD_SLOTS];
  }

  // Sắp xếp thứ tự thời gian tăng dần từ sớm đến muộn
  validParsed.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  return validParsed.map(p => p.canonical);
}

export function isValidHourlySlot(slot: string): boolean {
  if (!slot || typeof slot !== 'string') return false;
  const s = slot.trim().toUpperCase();
  if (
    s.startsWith("CA ") ||
    s.startsWith("CA_") ||
    s.includes("08:00 - 17:00") ||
    s.includes("08:00-17:00") ||
    s.includes("CA HC") ||
    s.includes("CA 1") ||
    s.includes("CA 2") ||
    s.includes("CA 3")
  ) {
    return false;
  }
  return parseSlotRange(slot) !== null;
}

export function formatSlotLabel(slot: string): string {
  if (!slot || typeof slot !== 'string') return "";
  const parsed = parseSlotRange(slot);
  if (parsed) return parsed.canonical;
  return slot.trim().toLowerCase();
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

// Bộ nhớ đệm O(1) tăng tốc độ nhận diện Canonical Key cho Model
const canonicalKeyCache = new Map<string, string>();

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
  if (canonicalKeyCache.has(c)) {
    return canonicalKeyCache.get(c)!;
  }

  let resolvedKey = "";
  const found = prodList.find(x => 
    (x.id && String(x.id).trim().toUpperCase() === c) || 
    (x.code && String(x.code).trim().toUpperCase() === c) || 
    (x.code && cleanModelCode(x.code) === cleanModelCode(c)) ||
    (x.name && getProductModelCode(x.name, x.code) === c)
  );

  if (found) {
    const code = getProductModelCode(found.name, found.code);
    resolvedKey = code ? code.toUpperCase() : (found.code ? cleanModelCode(found.code) : String(found.id).trim().toUpperCase());
  } else {
    const directExtracted = getProductModelCode(c);
    resolvedKey = directExtracted ? directExtracted.toUpperCase() : cleanModelCode(c);
  }

  if (c && resolvedKey) {
    canonicalKeyCache.set(c, resolvedKey);
  }
  return resolvedKey;
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
  return Boolean(k1 && k2 && k1 === k2);
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

// Lấy sản lượng khung giờ chuẩn hóa (chống lệch chữ hoa/thường hoặc khoảng trắng hoặc biến thể cú pháp)
export function getModelSlotActual(hourlyActuals?: { [k: string]: number }, slotName?: string): number {
  if (!hourlyActuals || !slotName) return 0;
  if (hourlyActuals[slotName] !== undefined && hourlyActuals[slotName] !== null) {
    return Number(hourlyActuals[slotName]) || 0;
  }
  const normTarget = slotName.toLowerCase().replace(/\s+/g, '');
  const parsedTarget = parseSlotRange(slotName);
  const targetCanonical = parsedTarget ? parsedTarget.canonical : normTarget;

  for (const [k, v] of Object.entries(hourlyActuals)) {
    const normK = k.toLowerCase().replace(/\s+/g, '');
    if (normK === normTarget) {
      return Number(v) || 0;
    }
    const parsedK = parseSlotRange(k);
    if (parsedK && parsedK.canonical === targetCanonical) {
      return Number(v) || 0;
    }
  }
  return 0;
}

// Chuẩn hóa và gộp sạch các khung giờ trùng lặp (ví dụ: '7h', '7h-8h', '7h - 8h') về dạng canonical duy nhất
export function canonicalizeHourlyActuals(hourlyActuals?: { [k: string]: number } | null): { [k: string]: number } {
  if (!hourlyActuals || typeof hourlyActuals !== 'object') return {};
  const result: { [k: string]: number } = {};

  for (const [k, v] of Object.entries(hourlyActuals)) {
    if (!k) continue;
    const num = Number(v) || 0;
    if (num <= 0) continue;

    const parsed = parseSlotRange(k);
    const canonicalKey = parsed ? parsed.canonical : k.trim().toLowerCase();

    // Lấy giá trị lớn nhất (thay vì cộng dồn làm sai lệch sản lượng)
    result[canonicalKey] = Math.max(result[canonicalKey] || 0, num);
  }

  return result;
}

// Tính tổng sản lượng thực tế theo danh sách khung giờ hợp lệ không trùng lặp
export function calculateModelTotalActual(hourlyActuals?: { [k: string]: number }, activeSlots?: string[]): number {
  if (!hourlyActuals) return 0;
  if (activeSlots && activeSlots.length > 0) {
    const uniqueSlots = deduplicateAndSortSlots(activeSlots);
    return uniqueSlots.reduce((sum, slot) => sum + getModelSlotActual(hourlyActuals, slot), 0);
  }
  // Nếu không truyền activeSlots, tính tổng các khung giờ duy nhất (chống cộng lặp các biến thể)
  const canonical = canonicalizeHourlyActuals(hourlyActuals);
  return Object.values(canonical).reduce((sum, val) => sum + val, 0);
}

// Hàm đảm bảo 1 bảng nhật ký ca KHÔNG BAO GIỜ có 2 model sản xuất trùng nhau, giữ thứ tự ổn định không nhảy
export function deduplicateFormModelItems(items: FormModelItem[], prodList: any[] = []): FormModelItem[] {
  if (!items || items.length === 0) return [];
  const result: FormModelItem[] = [];
  const keyToIndex = new Map<string, number>();

  for (const item of items) {
    if (!item.productId) continue;
    const modelKey = getCanonicalProductKey(item.productId, prodList) || String(item.productId).trim().toUpperCase();
    const existingIndex = keyToIndex.get(modelKey);

    // Chuẩn hóa slot keys sạch hoàn toàn
    const cleanActuals = canonicalizeHourlyActuals(item.hourlyActuals);

    if (existingIndex === undefined) {
      const newIndex = result.length;
      keyToIndex.set(modelKey, newIndex);
      result.push({
        ...item,
        id: item.id || `item_${item.productId}`,
        hourlyActuals: cleanActuals
      });
    } else {
      // Khi model bị trùng lặp trong mảng, gộp giá trị lớn nhất của từng khung giờ (chống cộng dồn gấp đôi số lượng)
      const existing = result[existingIndex];
      const mergedActuals: { [k: string]: number } = { ...existing.hourlyActuals };
      Object.entries(cleanActuals).forEach(([k, v]) => {
        mergedActuals[k] = Math.max(mergedActuals[k] || 0, v);
      });
      result[existingIndex] = {
        ...existing,
        dailyPlan: Math.max(existing.dailyPlan || 0, item.dailyPlan || 0),
        delayedWeeklyQty: existing.delayedWeeklyQty !== undefined ? existing.delayedWeeklyQty : item.delayedWeeklyQty,
        note: existing.note || item.note,
        hourlyActuals: canonicalizeHourlyActuals(mergedActuals),
      };
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

