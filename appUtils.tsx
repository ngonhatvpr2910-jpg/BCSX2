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

export function getProductModelCode(name: string): string {
  if (!name || typeof name !== "string") return "";
  // Extract clean model code (e.g. SHA76222KL, SHA75102LA, SHB2106, MMBB0787B, etc.)
  const words = name.replace(/[()]/g, ' ').split(/\s+/);
  for (const word of words) {
    const cleanWord = word.trim();
    if (/^(SHA|SHB|MMB|BBD)[A-Z0-9-]+$/i.test(cleanWord)) {
      return cleanWord.toUpperCase();
    }
  }
  for (const word of words) {
    const cleanWord = word.trim();
    if (/[A-Z]/.test(cleanWord) && /[0-9]/.test(cleanWord) && cleanWord.length >= 4) {
      return cleanWord;
    }
  }
  return name;
}

export const YAXIS_DOMAIN: [number, "auto"] = [0, "auto"];

export function getModelKeyForItem(productId?: string, prodList: any[] = []): string {
  if (!productId) return '';
  const c = String(productId).trim().toUpperCase();
  const p = prodList.find(x => 
    (x.id && String(x.id).trim().toUpperCase() === c) || 
    (x.code && String(x.code).trim().toUpperCase() === c) || 
    (x.name && getProductModelCode(x.name).trim().toUpperCase() === c)
  );
  if (p) {
    const code = getProductModelCode(p.name);
    if (code) return code.trim().toUpperCase();
    if (p.code) return String(p.code).trim().toUpperCase();
    return String(p.id).trim().toUpperCase();
  }
  const extracted = getProductModelCode(c);
  return extracted ? extracted.trim().toUpperCase() : c;
}

// So khớp sản phẩm thông minh (theo ID, Code hoặc Model name)
export function isSameProduct(id1?: string, id2?: string, prodList: any[] = []): boolean {
  if (!id1 || !id2) return false;
  const c1 = String(id1).trim().toUpperCase();
  const c2 = String(id2).trim().toUpperCase();
  if (c1 === c2) return true;

  const k1 = getModelKeyForItem(id1, prodList);
  const k2 = getModelKeyForItem(id2, prodList);
  if (k1 && k2 && k1 === k2) return true;

  const p1 = prodList.find(p => 
    (p.id && String(p.id).toUpperCase() === c1) || 
    (p.code && String(p.code).toUpperCase() === c1) || 
    (p.name && getProductModelCode(p.name).toUpperCase() === c1)
  );
  const p2 = prodList.find(p => 
    (p.id && String(p.id).toUpperCase() === c2) || 
    (p.code && String(p.code).toUpperCase() === c2) || 
    (p.name && getProductModelCode(p.name).toUpperCase() === c2)
  );

  if (p1 && p2) {
    if (p1.id === p2.id) return true;
    const m1 = getProductModelCode(p1.name).toUpperCase();
    const m2 = getProductModelCode(p2.name).toUpperCase();
    if (m1 && m2 && m1 === m2) return true;
  }
  if (p1 && (
    (p1.id && String(p1.id).toUpperCase() === c2) || 
    (p1.code && String(p1.code).toUpperCase() === c2) || 
    (p1.name && getProductModelCode(p1.name).toUpperCase() === c2)
  )) return true;
  if (p2 && (
    (p2.id && String(p2.id).toUpperCase() === c1) || 
    (p2.code && String(p2.code).toUpperCase() === c1) || 
    (p2.name && getProductModelCode(p2.name).toUpperCase() === c1)
  )) return true;

  return false;
}

// Hàm đảm bảo 1 bảng nhật ký ca KHÔNG BAO GIỜ có 2 model sản xuất trùng nhau
export function deduplicateFormModelItems(items: FormModelItem[], prodList: any[] = []): FormModelItem[] {
  if (!items || items.length === 0) return [];
  const result: FormModelItem[] = [];
  const seenKeys = new Set<string>();

  for (const item of items) {
    if (!item.productId) continue;
    const modelKey = getModelKeyForItem(item.productId, prodList);
    const existingIndex = result.findIndex(r => {
      if (modelKey && getModelKeyForItem(r.productId, prodList) === modelKey) return true;
      return isSameProduct(r.productId, item.productId, prodList);
    });

    if (existingIndex === -1 && !seenKeys.has(modelKey)) {
      if (modelKey) seenKeys.add(modelKey);
      result.push({
        ...item,
        hourlyActuals: { ...(item.hourlyActuals || {}) }
      });
    } else {
      // Gộp sản lượng của model trùng lặp vào dòng đầu tiên
      const targetIndex = existingIndex !== -1 ? existingIndex : result.findIndex(r => getModelKeyForItem(r.productId, prodList) === modelKey);
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

