import React from 'react';
import {
  RefreshCw, Download, Upload, CheckCircle, Info, FileSpreadsheet, FileCode, Layers, Users, Package, Calendar, Database, ShieldCheck, Sparkles, HardDrive, Zap, Check
} from 'lucide-react';
import { motion } from 'motion/react';

export const SystemDataTab = ({
  handleExportFullBackup,
  handleExportJsonBackup,
  handleImportFullBackup,
  restoreMode,
  setRestoreMode,
  syncEntireSystem,
  syncStatus,
  syncMessage,
  isSupabaseConfigured,
  refreshFromCloud,
  productionLogs = [],
  products = [],
  workers = [],
  attendanceLogs = [],
  declaredImeis = [],
  scannedImeis = [],
  storageInfo,
  handleOptimizeStorage,
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
        {/* Header - Đồng bộ & Lấy lại dữ liệu hệ thống */}
        <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <RefreshCw className={`w-7 h-7 text-emerald-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">Cập Nhật & Đồng Bộ Toàn Bộ Dữ Liệu</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    Chỉ lấy dữ liệu • Không lưu file • Tối ưu dung lượng
                  </span>
                </div>
                <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                  Đồng bộ và làm mới trực tiếp toàn bộ dữ liệu từ cơ sở dữ liệu Cloud. <span className="text-slate-200 font-medium">Hoàn toàn không cần lưu trữ lại file tạm</span>, tự động giải phóng các cache thừa giúp tối ưu hóa dung lượng máy và tránh làm nặng ứng dụng.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              {handleOptimizeStorage && (
                <button
                  onClick={handleOptimizeStorage}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-600 shadow-md cursor-pointer text-sm"
                  title="Dọn dẹp các cache rác và bộ đệm cũ để ứng dụng luôn nhẹ"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Tối ưu bộ nhớ
                </button>
              )}

              {syncEntireSystem && (
                <button
                  onClick={syncEntireSystem}
                  disabled={syncStatus === 'syncing'}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  {syncStatus === 'syncing' ? 'Đang lấy lại dữ liệu...' : 'Đồng bộ & Lấy lại dữ liệu'}
                </button>
              )}
            </div>
          </div>

          {/* Hộp thông tin tối ưu hóa dung lượng */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Dung lượng bộ nhớ máy</div>
                  <div className="text-sm font-bold text-white">
                    {storageInfo?.kb || '0.0'} KB <span className="text-xs text-slate-400 font-normal">({storageInfo?.percentage || 0}% hạn mức)</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {storageInfo?.status === 'optimal' ? 'Rất nhẹ & Tối ưu' : 'Ổn định'}
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Cơ chế đồng bộ</div>
                  <div className="text-sm font-bold text-white">Trực tuyến Cloud</div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Không lưu file đệm
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Trạng thái kết nối</div>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {syncMessage || (isSupabaseConfigured ? 'Supabase Ready' : 'Local Storage')}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold">100% Sẵn sàng</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Live Database Statistics */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              Tổng hợp dữ liệu đang hoạt động trên hệ thống
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 flex flex-col">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-sky-400" /> Nhật ký ca</span>
                <span className="text-xl font-black text-white mt-1">{productionLogs.length} <span className="text-xs font-normal text-slate-500">bản ghi</span></span>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 flex flex-col">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-emerald-400" /> Sản phẩm</span>
                <span className="text-xl font-black text-white mt-1">{products.length} <span className="text-xs font-normal text-slate-500">mã SP</span></span>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 flex flex-col">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-400" /> Nhân sự</span>
                <span className="text-xl font-black text-white mt-1">{workers.length} <span className="text-xs font-normal text-slate-500">công nhân</span></span>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 flex flex-col">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-teal-400" /> Điểm danh</span>
                <span className="text-xl font-black text-white mt-1">{attendanceLogs.length} <span className="text-xs font-normal text-slate-500">lượt</span></span>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 flex flex-col">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-indigo-400" /> IMEI Khai báo</span>
                <span className="text-xl font-black text-white mt-1">{declaredImeis.length} <span className="text-xs font-normal text-slate-500">mã</span></span>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 flex flex-col">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Lưu trữ Cloud</span>
                <span className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isSupabaseConfigured ? 'Supabase Ready' : 'Local Storage'}
                </span>
              </div>
            </div>
          </div>

          {/* Tùy chọn sao lưu ngoại tuyến (Offline Backup & Restore) */}
          <div className="pt-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Công Cụ Sao Lưu Ngoại Tuyến (Offline Tools)
                </h3>
              </div>
              <span className="text-xs text-slate-500">Tùy chọn phụ khi cần xuất file mang đi nơi khác</span>
            </div>

            {/* Restore Mode Selection */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    Chế độ khôi phục dữ liệu khi nạp file ngoại tuyến
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lựa chọn cách thức xử lý dữ liệu khi bạn tải lên file backup ngoại tuyến:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label 
                    onClick={() => setRestoreMode?.('overwrite')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      restoreMode === 'overwrite' 
                        ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30' 
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="restoreMode"
                      value="overwrite"
                      checked={restoreMode === 'overwrite'}
                      onChange={() => setRestoreMode?.('overwrite')}
                      className="mt-1 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        Ghi đè hoàn toàn (Khuyên dùng)
                        <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-semibold">Chuẩn xác</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Xóa dữ liệu hiện tại và thay thế hoàn toàn bằng dữ liệu trong file backup. Đảm bảo dữ liệu đồng nhất 100%.
                      </p>
                    </div>
                  </label>

                  <label 
                    onClick={() => setRestoreMode?.('merge')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      restoreMode === 'merge' 
                        ? 'bg-sky-500/10 border-sky-500/40 ring-1 ring-sky-500/30' 
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="restoreMode"
                      value="merge"
                      checked={restoreMode === 'merge'}
                      onChange={() => setRestoreMode?.('merge')}
                      className="mt-1 text-sky-500 focus:ring-sky-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        Hợp nhất dữ liệu (Merge)
                        <span className="px-2 py-0.5 text-[10px] bg-sky-500/20 text-sky-300 rounded font-semibold">Giữ lại</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Giữ lại dữ liệu hiện có và bổ sung các bản ghi mới từ file backup (trùng ID sẽ được cập nhật mới).
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Import / Restore Section */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-400" />
                    Khôi Phục Dữ Liệu Từ File Ngoại Tuyến (.xlsx, .xls, .json)
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                    Tải lên file sao lưu ngoại tuyến để nạp trực tiếp vào cơ sở dữ liệu. Sau khi đọc xong, hệ thống giải phóng ngay lập tức file đệm trong bộ nhớ để đảm bảo ứng dụng luôn nhẹ.
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0 self-start sm:self-auto">
                  <label className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-105">
                    <Upload className="w-5 h-5" />
                    Chọn File Khôi Phục
                    <input
                      type="file"
                      accept=".xlsx, .xls, .json"
                      onChange={handleImportFullBackup}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-center text-slate-500">Chế độ: {restoreMode === 'overwrite' ? 'Ghi đè hoàn toàn' : 'Hợp nhất dữ liệu'}</span>
                </div>
              </div>
            </div>

            {/* Export / Backup Section */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-sky-400" />
                    Xuất File Sao Lưu Ngoại Tuyến (Backup Excel / JSON)
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                    Tải về file Excel (11 Sheet) hoặc file JSON nếu bạn muốn lưu một bản cứng ngoại tuyến để chia sẻ qua email hoặc USB.
                  </p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 self-start sm:self-auto">
                  <button
                    onClick={handleExportFullBackup}
                    className="px-5 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-900/20 flex items-center gap-2 cursor-pointer hover:scale-105"
                    title="Xuất file Excel gồm 11 sheet đầy đủ"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    Xuất Excel (11 Sheet)
                  </button>
                  {handleExportJsonBackup && (
                    <button
                      onClick={handleExportJsonBackup}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 cursor-pointer hover:scale-105"
                      title="Xuất file JSON nguyên bản"
                    >
                      <FileCode className="w-5 h-5" />
                      Xuất JSON
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-200/80 leading-relaxed space-y-1">
                  <span className="font-bold text-emerald-400 block mb-1 uppercase tracking-wider text-[10px]">Cơ chế tối ưu hóa dung lượng & hiệu năng:</span>
                  <div>• Khi nhấn nút <strong className="text-white">"Đồng bộ & Lấy lại dữ liệu"</strong>, hệ thống chỉ kéo dữ liệu mới nhất từ Cloud về trạng thái ứng dụng, hoàn toàn không tạo hoặc lưu file tạm trên máy, giữ bộ nhớ luôn ở mức siêu nhẹ.</div>
                  <div>• Khi nạp file Excel/JSON ngoại tuyến, file chỉ được phân tích trực tiếp trên RAM rồi giải phóng ngay lập tức, không lưu trữ file đệm làm nặng app.</div>
                  <div>• Nút <strong className="text-white">"Tối ưu bộ nhớ"</strong> sẽ tự động quét và dọn sạch các bản nháp ca cũ hoặc khóa đệm dư thừa khỏi LocalStorage bất cứ lúc nào.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
