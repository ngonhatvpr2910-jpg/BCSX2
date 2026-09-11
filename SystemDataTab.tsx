import { YAXIS_DOMAIN, getProductModelCode, getWeeksInMonth, getYearWeeks, getStandardYearWeeks } from "./appUtils";
import * as XLSX from "xlsx";
import { SUNHOUSE_LINES, INDUSTRIAL_STANDARDS } from "./data";
import React, { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ReferenceLine, LabelList
} from 'recharts';
import {
  TrendingUp, Users, Award, Calendar, Layers, ChevronRight, Database, PlusCircle, Clock, Sparkles, Info, CheckCircle, RotateCcw, Sliders, Flame, Droplet, FileText, FileCheck, Building, ArrowRight, Calculator, FileSpreadsheet, Trash2, Edit, Pencil, X, Upload, Download, Check, AlertCircle, Zap, DollarSign, Activity, Lock, Unlock, History, ScanBarcode, Barcode, List, Search, Filter, Eye, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// Types might be needed, let's just use any for now or import from types
import { ProductGroup, MonthlyMetric } from './types';

export const SystemDataTab = ({
  handleExportFullBackup,
  handleImportFullBackup,
  syncEntireSystem,
  syncStatus,
  syncMessage,
  isSupabaseConfigured,
  refreshFromCloud
}: any) => {
  return (
    <motion.div
      key="system-data"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <RefreshCw className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Quản Lý & Đồng Bộ Hệ Thống</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Đồng bộ dữ liệu liên kết thời gian thực, sao lưu và khôi phục toàn bộ cơ sở dữ liệu báo cáo.
                </p>
              </div>
            </div>

            {syncEntireSystem && (
              <button
                onClick={syncEntireSystem}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-950/40 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                Đồng bộ toàn hệ thống
              </button>
            )}
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Master Sync Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-300">Nhật ký ca ↔ Lịch sử & Báo cáo</div>
                <div className="text-[11px] text-emerald-400 font-medium">Tự động liên kết 100%</div>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-300">Kế hoạch tháng ↔ Thực tế ca</div>
                <div className="text-[11px] text-emerald-400 font-medium">Tiến độ phản hồi tức thì</div>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-300">Điểm danh nhân sự ↔ Công theo ca</div>
                <div className="text-[11px] text-emerald-400 font-medium">Đồng bộ tự động theo ngày</div>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-sky-400" />
                  Xuất Toàn Bộ Dữ Liệu (Backup 11 Bảng)
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                  Hệ thống sẽ tổng hợp tất cả Nhật ký sản xuất, Nhân sự & Điểm danh, Danh mục sản phẩm, 
                  Kế hoạch tháng, Mục tiêu NSLĐ, Mã IMEI và Báo cáo chất lượng vào một file Excel duy nhất có 11 sheet.
                </p>
              </div>
              <button
                onClick={handleExportFullBackup}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-900/20 flex items-center gap-2 shrink-0 group-hover:scale-105 cursor-pointer self-start sm:self-auto"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Xuất Excel
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  Khôi Phục Dữ Liệu (Restore & Auto-Sync)
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                  Tải lên file Excel backup đã xuất trước đó để khôi phục toàn bộ trạng thái hệ thống. 
                  Hệ thống sẽ tự động liên kết và tính toán lại toàn bộ chỉ số sau khi nạp.
                  <span className="text-amber-400 font-semibold block mt-1">⚠️ Cảnh báo: Dữ liệu hiện tại trên trình duyệt sẽ được cập nhật/thay thế theo file backup.</span>
                </p>
              </div>
              <label className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 shrink-0 cursor-pointer group-hover:scale-105 self-start sm:self-auto">
                <RefreshCw className="w-5 h-5" />
                Chọn File Backup
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleImportFullBackup}
                />
              </label>
            </div>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-200/70 leading-relaxed">
                <span className="font-bold text-amber-400 block mb-1 uppercase tracking-wider text-[10px]">Cơ chế đồng bộ & bảo toàn dữ liệu:</span>
                - Mọi thao tác thêm/sửa/xóa nhật ký ca, kế hoạch, điểm danh, sản phẩm đều được phản ánh lập tức tới các biểu đồ và báo cáo tương ứng.<br/>
                - Dữ liệu được bảo toàn qua bộ nhớ cục bộ tốc độ cao và tự động đẩy lên Supabase Cloud khi có kết nối.<br/>
                - File Excel backup chứa đầy đủ tất cả bảng dữ liệu để bạn có thể lưu trữ ngoại tuyến bất kỳ lúc nào.
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
