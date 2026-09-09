import React, { useState, useEffect, useRef } from 'react';
import { Worker, AttendanceRecord, WorkerDivision, WorkerType } from './types';
import { INITIAL_WORKERS } from './data';
import { Plus, Trash2, Edit2, QrCode, User, ScanLine, X, CheckCircle, FileText, Download, RefreshCw, Upload, AlertCircle, Camera } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import * as storage from './storage';

interface PersonnelTabProps {
  workers: Worker[];
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
  fetchWorkers?: () => Promise<void>;
  attendanceLogs: AttendanceRecord[];
  setAttendanceLogs: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

export const PersonnelTab: React.FC<PersonnelTabProps> = ({
  workers,
  setWorkers,
  fetchWorkers,
  attendanceLogs,
  setAttendanceLogs
}) => {
  const [activeView, setActiveView] = useState<'LIST' | 'SCAN' | 'REPORT'>('LIST');

  // FORM STATE
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");
  const [formName, setFormName] = useState("");
  const [formDivision, setFormDivision] = useState<WorkerDivision>("RO");
  const [formCode, setFormCode] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ASYNC & NOTIFICATION STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getWorkerTypeFromId = (id: string): WorkerType => {
    const upper = id.toUpperCase();
    if (upper.includes("THUVIEC")) return "PROBATION";
    if (upper.includes("TV") || upper.includes("THOIVU") || upper.includes("SEASONAL")) return "SEASONAL";
    return "OFFICIAL";
  };

  // 2. SỬA / CẬP NHẬT (UPDATE) & 3. THÊM MỚI (INSERT)
  const handleSave = async () => {
    if (!formName.trim()) {
      showToast("Vui lòng nhập họ và tên nhân viên!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editId) {
        // 2. SỬA / CẬP NHẬT (UPDATE):
        const targetId = formCode.trim() || editId;
        const derivedType = getWorkerTypeFromId(targetId);

        const updatedData: Record<string, any> = {
          name: formName.trim(),
          division: formDivision,
          type: derivedType,
          qr_code: targetId,
          updated_at: new Date().toISOString()
        };

        if (targetId !== editId) {
          updatedData.id = targetId;
        }

        if (supabase && isSupabaseConfigured) {
          const { error } = await supabase
            .from('workers')
            .update(updatedData)
            .eq('id', editId);

          if (error) {
            throw new Error(error.message || 'Lỗi khi cập nhật nhân viên trên Supabase');
          }
        }

        // Chỉ cập nhật State trên giao diện sau khi Supabase trả về kết quả thành công
        setWorkers(prev => prev.map(w => w.id === editId ? {
          ...w,
          id: targetId,
          name: formName.trim(),
          division: formDivision,
          type: derivedType,
          qrCode: targetId
        } : w));

        showToast(`Cập nhật nhân viên "${formName.trim()}" thành công!`, "success");
        setIsEditing(false);
        setEditId("");
        setFormName("");
        setFormCode("");
      } else {
        // 3. THÊM MỚI (INSERT):
        const workerId = formCode.trim() || `60000${Math.floor(1000 + Math.random() * 9000)}`;
        const derivedType = getWorkerTypeFromId(workerId);

        const exists = workers.find(w => w.id === workerId);
        if (exists) {
          showToast(`Mã nhân viên "${workerId}" đã tồn tại trên hệ thống!`, "error");
          setIsSubmitting(false);
          return;
        }

        const newData = {
          id: workerId,
          name: formName.trim(),
          division: formDivision,
          type: derivedType,
          qr_code: workerId,
          image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (supabase && isSupabaseConfigured) {
          const { error } = await supabase
            .from('workers')
            .insert([newData]);

          if (error) {
            throw new Error(error.message || 'Lỗi khi thêm mới nhân viên trên Supabase');
          }
        }

        // Chỉ cập nhật State trên giao diện sau khi Supabase trả về kết quả thành công
        const newWorkerItem: Worker = {
          id: workerId,
          name: formName.trim(),
          division: formDivision,
          type: derivedType,
          qrCode: workerId
        };
        setWorkers(prev => [newWorkerItem, ...prev]);

        showToast(`Đã thêm nhân viên "${formName.trim()}" (${workerId}) thành công!`, "success");
        setIsEditing(false);
        setEditId("");
        setFormName("");
        setFormCode("");
      }
    } catch (err: any) {
      console.error('Lỗi khi lưu nhân viên:', err);
      const msg = err?.message || JSON.stringify(err);
      showToast(`Lưu nhân viên thất bại: ${msg}`, "error");
      alert(`Lưu nhân viên thất bại: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (w: Worker) => {
    setIsEditing(true);
    setEditId(w.id);
    setFormName(w.name);
    setFormDivision(w.division);
    setFormCode(w.qrCode);
  };

  // 1. XÓA (DELETE)
  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async (workerId: string) => {
    if (!workerId) return;
    setIsDeleting(true);
    try {
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase
          .from('workers')
          .delete()
          .eq('id', workerId);

        if (error) {
          throw new Error(error.message || 'Lỗi khi xóa nhân viên trên Supabase');
        }
      }

      // Chỉ cập nhật State trên giao diện sau khi Supabase trả về kết quả xóa thành công
      setWorkers(prev => prev.filter(w => w.id !== workerId));
      setDeleteConfirmId(null);
      showToast(`Đã xóa nhân viên có mã "${workerId}" thành công!`, "success");
    } catch (err: any) {
      console.error('Lỗi khi xóa nhân viên:', err);
      const msg = err?.message || JSON.stringify(err);
      showToast(`Xóa nhân viên thất bại: ${msg}`, "error");
      alert(`Xóa nhân viên thất bại: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReloadFromCloud = async () => {
    setIsRefreshing(true);
    try {
      if (fetchWorkers) {
        await fetchWorkers();
      } else {
        const fresh = await storage.getWorkers();
        if (fresh) setWorkers(fresh);
      }
      showToast("Đã đồng bộ lại danh sách nhân sự mới nhất từ Supabase Cloud!", "success");
    } catch (err: any) {
      showToast(`Lỗi đồng bộ: ${err?.message || err}`, "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetData = () => {
    if (confirm("Hành động này sẽ tải lại danh sách gốc từ hệ thống. Bạn có chắc chắn không?")) {
      handleReloadFromCloud();
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      ["Mã NV", "Họ và Tên", "Bộ phận (RO/BG/RMA)"],
      ["60000001", "Nguyễn Văn A", "RO"],
      ["60000002TH", "Trần Thị B", "BG"],
      ["60000003TV", "Lê Văn C", "RMA"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    // Auto-size columns
    ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 20 }];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachNhanSu");
    
    XLSX.writeFile(wb, "FileMau_DanhSachNhanSu.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Parse under assumption: Row 1 = headers (Mã NV, Tên NV, ...), Data starts from Row 2
        // Or if data is raw array of arrays
        const data = XLSX.utils.sheet_to_json<any[][]>(ws, { header: 1 });
        
        if (data.length <= 1) {
          alert("File excel trống hoặc không đúng định dạng!");
          return;
        }

        const importedWorkers: Worker[] = [];
        // Bỏ qua dòng đầu tiên (header)
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length < 2 || !row[0]) continue;
          
          const maNV = String(row[0]).trim();
          const tenNV = String(row[1]).trim();
          const boPhanRaw = row.length >= 3 && row[2] ? String(row[2]).trim().toUpperCase() : "BG";
          
          let boPhan: WorkerDivision = "BG";
          if (boPhanRaw === "RO" || boPhanRaw === "BG" || boPhanRaw === "RMA") {
            boPhan = boPhanRaw as WorkerDivision;
          }
          
          if (maNV && tenNV) {
            importedWorkers.push({
              id: maNV,
              qrCode: maNV,
              name: tenNV,
              division: boPhan,
              type: getWorkerTypeFromId(maNV)
            });
          }
        }

        if (importedWorkers.length > 0) {
          setIsSubmitting(true);
          storage.saveAllWorkers(importedWorkers).then(() => {
            setWorkers(importedWorkers);
            showToast(`Đã import và đồng bộ ${importedWorkers.length} nhân viên lên Supabase thành công!`, "success");
          }).catch((err: any) => {
            setWorkers(importedWorkers);
            showToast(`Import hoàn tất, đang lưu vào bộ nhớ tạm (${err?.message || err})`, "error");
          }).finally(() => {
            setIsSubmitting(false);
          });
        } else {
          showToast("Không tìm thấy dữ liệu hợp lệ trong file Excel. Vui lòng đảm bảo Cột 1 là Mã NV, Cột 2 là Họ Tên, Cột 3 là Bộ Phận.", "error");
        }
      } catch (err: any) {
        console.error(err);
        showToast(`Lỗi khi đọc file Excel: ${err?.message || err}`, "error");
      }
      
      // Reset input
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="w-full relative">
      {/* Thông báo Toast trực quan */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium border backdrop-blur-md transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/50 shadow-emerald-950/50'
              : 'bg-rose-950/95 text-rose-200 border-rose-500/50 shadow-rose-950/50'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="mb-6 flex gap-4 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveView('LIST')}
          className={`px-4 py-2 rounded-lg font-medium transition ${activeView === 'LIST' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          <User className="w-4 h-4 inline-block mr-2" />
          Danh sách nhân sự
        </button>
        <button
          onClick={() => setActiveView('SCAN')}
          className={`px-4 py-2 rounded-lg font-medium transition ${activeView === 'SCAN' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          <ScanLine className="w-4 h-4 inline-block mr-2" />
          Quét QR Điểm danh
        </button>
        <button
          onClick={() => setActiveView('REPORT')}
          className={`px-4 py-2 rounded-lg font-medium transition ${activeView === 'REPORT' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          Bảng chấm công
        </button>
      </div>

      {activeView === 'LIST' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">
              {isEditing ? "Cập nhật thông tin nhân viên" : "Thêm mới nhân viên"}
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-400">Mã NV / QR Code</label>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setFormCode(`60000${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                      title="Tự động tạo mã nhân viên mới"
                    >
                      + Tạo mã tự động
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Ví dụ: 600001001 (để trống để tự tạo)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Nhập tên nhân viên"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Bộ phận</label>
                <select
                  value={formDivision}
                  onChange={(e) => setFormDivision(e.target.value as WorkerDivision)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="RO">Lắp ráp (RO)</option>
                  <option value="BG">Bếp Gas (BG)</option>
                  <option value="RMA">RMA</option>
                </select>
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleSave}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 mt-4 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {isEditing ? "Đang cập nhật..." : "Đang lưu lên Supabase..."}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {isEditing ? "Cập nhật nhân viên" : "Thêm mới nhân viên"}
                  </>
                )}
              </button>

              {isEditing && (
                <button
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsEditing(false);
                    setEditId("");
                    setFormCode("");
                    setFormName("");
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-lg mt-2 transition"
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-white">Danh sách ({workers.length})</h3>
              <div className="flex gap-2 items-center flex-wrap">
                <button 
                  onClick={handleDownloadTemplate}
                  className="text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                  title="Tải file Excel mẫu"
                >
                  <Download className="w-3.5 h-3.5" />
                  File Mẫu
                </button>
                <label className="text-xs bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Import Excel
                  <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
                </label>
                <button 
                  disabled={isRefreshing}
                  onClick={handleReloadFromCloud}
                  className="text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                  title="Đồng bộ lại dữ liệu mới nhất từ Supabase Cloud"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
                  {isRefreshing ? "Đang tải..." : "Tải lại từ Cloud"}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-950 z-10 text-[11px] uppercase text-slate-400 font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-800">Mã NV</th>
                    <th className="px-4 py-3 border-b border-slate-800">Họ và tên</th>
                    <th className="px-4 py-3 border-b border-slate-800">Bộ phận</th>
                    <th className="px-4 py-3 border-b border-slate-800">Loại LĐ</th>
                    <th className="px-4 py-3 border-b border-slate-800 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {workers.map((w) => (
                    <tr key={w.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-mono text-indigo-400">{w.qrCode}</td>
                      <td className="px-4 py-3 text-slate-200 font-medium">{w.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          w.division === 'RO' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50' :
                          w.division === 'BG' ? 'bg-blue-950/50 text-blue-400 border border-blue-800/50' :
                          'bg-amber-950/50 text-amber-400 border border-amber-800/50'
                        }`}>
                          {w.division}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          w.type === 'OFFICIAL' ? 'bg-slate-800 text-slate-300' : 
                          w.type === 'SEASONAL' ? 'bg-purple-950/50 text-purple-400 border border-purple-800/50' : 
                          'bg-amber-950/50 text-amber-400 border border-amber-800/50'
                        }`}>
                          {w.type === 'OFFICIAL' ? 'Chính thức' : w.type === 'SEASONAL' ? 'Thời vụ' : 'Thử việc'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(w)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 transition"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition ml-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {workers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Chưa có nhân viên nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === 'SCAN' && (
        <ScannerView 
          workers={workers} 
          attendanceLogs={attendanceLogs} 
          setAttendanceLogs={setAttendanceLogs} 
        />
      )}

      {activeView === 'REPORT' && (
        <ReportView 
          workers={workers} 
          attendanceLogs={attendanceLogs} 
        />
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Xác nhận xóa nhân viên</h3>
            <p className="text-slate-400 text-sm mb-6">
              Bạn có chắc chắn muốn xóa nhân viên <span className="text-rose-400 font-mono font-semibold">{deleteConfirmId}</span> khỏi hệ thống và Supabase Cloud? Thao tác này sẽ đồng bộ trực tiếp tới cơ sở dữ liệu.
            </p>
            <div className="flex justify-end gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                Hủy
              </button>
              <button
                disabled={isDeleting}
                onClick={() => confirmDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang xóa trên Supabase...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Xác nhận Xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted Scanner View to manage its own effect lifecycle cleanly
const ScannerView = ({ workers, attendanceLogs, setAttendanceLogs }: { workers: Worker[], attendanceLogs: AttendanceRecord[], setAttendanceLogs: any }) => {
  const [scanDate, setScanDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [codeRO, setCodeRO] = useState("");
  const [codeBG, setCodeBG] = useState("");
  const [codeRMA, setCodeRMA] = useState("");
  const [cameraTargetDivision, setCameraTargetDivision] = useState<WorkerDivision>("RO");
  const [lastScanned, setLastScanned] = useState<{ worker: Worker, time: string, action: "IN" | "OUT" | "DONE" } | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<{ log: AttendanceRecord, field: 'checkInTime' | 'checkOutTime' } | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editTimeValue, setEditTimeValue] = useState("");
  const [editError, setEditError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanSuccess(decodedText);
          // Optional: stop after scan if desired, but usually we want continuous
        },
        (errorMessage) => {
          // ignore scan frame errors
        }
      );
      setCameraActive(true);
    } catch (err: any) {
      console.error(err);
      setCameraError(err?.message || "Không thể truy cập camera. Vui lòng mở ứng dụng trong thẻ mới (New Tab) và cấp quyền truy cập máy ảnh.");
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setCameraActive(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const configRef = useRef({ scanDate, cameraTargetDivision });
  useEffect(() => {
    configRef.current = { scanDate, cameraTargetDivision };
  }, [scanDate, cameraTargetDivision]);

  const handleScanSuccess = (decodedText: string) => {
    processAttendance(decodedText, configRef.current.cameraTargetDivision);
  };

  const handleManualSubmit = (division: WorkerDivision, code: string, setter: (val: string) => void) => (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      processAttendance(code.trim(), division);
      setter("");
    }
  };

  const processAttendance = (code: string, targetDivision?: WorkerDivision) => {
    const worker = workers.find(w => w.qrCode === code || w.id === code);
    if (!worker) {
      alert(`Mã không hợp lệ: ${code}`);
      return;
    }

    const { scanDate: cd } = configRef.current;
    const finalDivision = targetDivision || worker.division;
    
    // Check if there is an active record (not checked out) for today
    const activeRecord = attendanceLogs.find(a => a.workerId === worker.id && a.date === cd && !a.checkOutTime);

    if (activeRecord) {
      if (activeRecord.scannedDivision === finalDivision) {
        // Checking out of the current division
        const updatedRecord = { ...activeRecord, checkOutTime: new Date().toISOString() };
        setAttendanceLogs((prev: AttendanceRecord[]) => prev.map(a => 
          a.id === activeRecord.id ? updatedRecord : a
        ));
        storage.saveAttendanceLog(updatedRecord);
        setLastScanned({ worker, action: "OUT", time: new Date().toLocaleTimeString() });
      } else {
        // Scanning into a NEW division without explicitly checking out of the old one
        // Case 2 Logic: If time spent in the previous division (activeRecord) is < 30 mins,
        // we merge it into the new division (delete the old record, start the new record from the old check-in time).
        // If >= 30 mins, we check out the old normally and start the new one now.
        const now = new Date();
        const prevCheckInTime = new Date(activeRecord.checkInTime);
        const diffMs = now.getTime() - prevCheckInTime.getTime();
        const diffMins = diffMs / 60000;

        if (diffMins < 30) {
          // Less than 30 mins: Delete old record, start new record using old check-in time
          const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            workerId: worker.id,
            date: cd,
            checkInTime: activeRecord.checkInTime, // keep the old start time
            scannedDivision: finalDivision
          };
          storage.deleteAttendanceLog(activeRecord.id);
          storage.saveAttendanceLog(newRecord);
          setAttendanceLogs((prev: AttendanceRecord[]) => {
            const filteredPrev = prev.filter(a => a.id !== activeRecord.id);
            return [...filteredPrev, newRecord];
          });
        } else {
          // 30 mins or more: Auto-checkout old record normally, start new record now
          const updatedOld: AttendanceRecord = { ...activeRecord, checkOutTime: now.toISOString() };
          const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            workerId: worker.id,
            date: cd,
            checkInTime: now.toISOString(),
            scannedDivision: finalDivision
          };
          storage.saveAttendanceLog(updatedOld);
          storage.saveAttendanceLog(newRecord);
          setAttendanceLogs((prev: AttendanceRecord[]) => {
            const updatedPrev = prev.map(a => 
              a.id === activeRecord.id ? updatedOld : a
            );
            return [...updatedPrev, newRecord];
          });
        }
        setLastScanned({ worker, action: "IN", time: now.toLocaleTimeString() });
      }
    } else {
      // Check in
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        workerId: worker.id,
        date: cd,
        checkInTime: new Date().toISOString(),
        scannedDivision: finalDivision
      };
      storage.saveAttendanceLog(newRecord);
      setAttendanceLogs((prev: AttendanceRecord[]) => [...prev, newRecord]);
      setLastScanned({ worker, action: "IN", time: new Date().toLocaleTimeString() });
    }
  };

  const openEditModal = (log: AttendanceRecord, field: 'checkInTime' | 'checkOutTime') => {
    setEditingLog({ log, field });
    const currentValue = log[field];
    const baseDate = currentValue ? new Date(currentValue) : new Date();
    setEditTimeValue(currentValue ? baseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "");
    setEditPassword("");
    setEditError("");
    setEditModalOpen(true);
  };

  const handleConfirmEdit = () => {
    if (editPassword !== "RO2026") {
      setEditError("Mật khẩu không đúng!");
      return;
    }
    
    if (!editTimeValue.trim()) {
       setEditError("Vui lòng nhập giờ!");
       return;
    }
    
    const match = editTimeValue.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      setEditError("Định dạng giờ không hợp lệ. Vui lòng nhập HH:mm (VD: 08:30)");
      return;
    }
    
    if (editingLog) {
      const { log, field } = editingLog;
      const currentValue = log[field];
      const baseDate = currentValue ? new Date(currentValue) : new Date();
      baseDate.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
      
      const updatedLog: AttendanceRecord = { ...log, [field]: baseDate.toISOString() };
      setAttendanceLogs((prev: AttendanceRecord[]) => 
        prev.map(a => a.id === log.id ? updatedLog : a)
      );
      storage.saveAttendanceLog(updatedLog);
    }
    
    setEditModalOpen(false);
    setEditingLog(null);
  };

  const currentLogs = attendanceLogs.filter(a => a.date === scanDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Quét QR Code</h3>
        
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1">Ngày làm việc</label>
          <input 
            type="date"
            value={scanDate}
            onChange={e => setScanDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="bg-black rounded-lg overflow-hidden border border-slate-800 min-h-[300px] relative flex flex-col items-center justify-center p-4">
          <div className="absolute top-2 right-2 z-10 bg-slate-900/80 px-3 py-1 rounded-full text-xs flex items-center gap-2 border border-slate-700 backdrop-blur">
            <span className="text-slate-400">Cam:</span>
            <select 
              value={cameraTargetDivision}
              onChange={e => setCameraTargetDivision(e.target.value as WorkerDivision)}
              className="bg-transparent text-emerald-400 font-bold outline-none cursor-pointer"
            >
              <option value="RO">RO</option>
              <option value="BG">BG</option>
              <option value="RMA">RMA</option>
            </select>
          </div>
          
          <div id="reader" className="w-full max-w-[400px]"></div>

          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20 p-6 text-center">
              <Camera className="w-12 h-12 text-slate-500 mb-4" />
              {cameraError ? (
                <div className="text-red-400 text-sm mb-4 max-w-sm">
                  {cameraError}
                  <p className="mt-2 text-slate-400 text-xs">Hãy mở ứng dụng bằng trình duyệt Safari/Chrome, hoặc mở trong Tab mới (New Tab) để cấp quyền Camera.</p>
                </div>
              ) : (
                <p className="text-slate-400 mb-4">Camera đang tắt. Nhấn nút bên dưới để bắt đầu quét QR.</p>
              )}
              <button 
                onClick={startCamera}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4" /> Bật Camera (Sau)
              </button>
            </div>
          )}

          {cameraActive && (
            <button 
              onClick={stopCamera}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-red-500/90 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-full flex items-center gap-2 transition-colors backdrop-blur"
            >
              Dừng Camera
            </button>
          )}
        </div>

        <div className="mt-6 border-t border-slate-800 pt-6">
          <label className="block text-sm font-bold text-emerald-400 mb-4 uppercase tracking-wide">
            ĐẶT CON TRỎ VÀO Ô ĐỂ DÙNG MÁY QUÉT (HOẶC NHẬP TAY)
          </label>
          <div className="flex flex-col gap-3">
            <form onSubmit={handleManualSubmit("RO", codeRO, setCodeRO)} className="flex items-center gap-3">
              <div className="w-16 text-center font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">RO</div>
              <input 
                autoFocus
                type="text"
                value={codeRO}
                onChange={e => setCodeRO(e.target.value)}
                placeholder="Quét thẻ RO..."
                className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-xl px-4 py-2.5 text-lg font-mono text-slate-200 outline-none transition-all shadow-inner"
              />
              <button type="submit" className="hidden">Quét</button>
            </form>

            <form onSubmit={handleManualSubmit("BG", codeBG, setCodeBG)} className="flex items-center gap-3">
              <div className="w-16 text-center font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20 py-2 rounded-lg">BG</div>
              <input 
                type="text"
                value={codeBG}
                onChange={e => setCodeBG(e.target.value)}
                placeholder="Quét thẻ BG..."
                className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-lg font-mono text-slate-200 outline-none transition-all shadow-inner"
              />
              <button type="submit" className="hidden">Quét</button>
            </form>

            <form onSubmit={handleManualSubmit("RMA", codeRMA, setCodeRMA)} className="flex items-center gap-3">
              <div className="w-16 text-center font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 py-2 rounded-lg">RMA</div>
              <input 
                type="text"
                value={codeRMA}
                onChange={e => setCodeRMA(e.target.value)}
                placeholder="Quét thẻ RMA..."
                className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 rounded-xl px-4 py-2.5 text-lg font-mono text-slate-200 outline-none transition-all shadow-inner"
              />
              <button type="submit" className="hidden">Quét</button>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4 flex justify-between items-center">
          <span>Trạng thái điểm danh</span>
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md">
            Đã điểm danh: <strong className="text-emerald-400">{new Set(currentLogs.map(a => a.workerId)).size}</strong> người <span className="text-slate-500 opacity-80 font-normal">({currentLogs.length} lượt)</span>
          </span>
        </h3>

        {lastScanned && (
          <div className={`mb-4 p-4 border rounded-lg flex items-start gap-4 ${
            lastScanned.action === 'IN' ? 'bg-emerald-950/30 border-emerald-900' :
            lastScanned.action === 'OUT' ? 'bg-rose-950/30 border-rose-900' : 'bg-slate-800/50 border-slate-700'
          }`}>
            <div className="w-16 h-16 shrink-0 bg-slate-800 rounded overflow-hidden flex items-center justify-center border border-slate-700">
              {lastScanned.worker.imageUrl ? (
                <img src={lastScanned.worker.imageUrl} alt={lastScanned.worker.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-500" />
              )}
            </div>
            <div>
              <div className={`text-sm font-bold mb-1 ${
                lastScanned.action === 'IN' ? 'text-emerald-400' :
                lastScanned.action === 'OUT' ? 'text-rose-400' : 'text-slate-400'
              }`}>
                {lastScanned.action === 'IN' ? 'Vào ca thành công' :
                 lastScanned.action === 'OUT' ? 'Ra ca thành công' : 'Đã kết thúc ca làm việc'}
              </div>
              <div className="text-slate-200 font-medium text-lg">
                {lastScanned.worker.name}
              </div>
              <div className="text-slate-400 text-xs mt-1">
                Mã NV: {lastScanned.worker.id} • Thời gian: {lastScanned.time}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-950 sticky top-0">
              <tr>
                <th className="px-3 py-2 border-b border-slate-800 text-slate-400 font-medium">Nhân viên</th>
                <th className="px-3 py-2 border-b border-slate-800 text-slate-400 font-medium">Giờ vào</th>
                <th className="px-3 py-2 border-b border-slate-800 text-slate-400 font-medium">Giờ ra</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map(log => {
                const w = workers.find(x => x.id === log.workerId);
                const scannedDiv = log.scannedDivision || w?.division;
                return (
                  <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-800 overflow-hidden flex-shrink-0">
                          {w?.imageUrl ? (
                            <img src={w.imageUrl} alt={w.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 m-1 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white text-xs">
                            {w?.name}
                            {scannedDiv && (
                              <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                scannedDiv === 'RO' ? 'bg-emerald-500/20 text-emerald-400' :
                                scannedDiv === 'BG' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {scannedDiv}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{w?.id}</div>
                        </div>
                      </div>
                    </td>
                    <td 
                      className="px-3 py-2 text-emerald-400/80 text-xs font-mono cursor-pointer hover:bg-slate-800/40 hover:text-emerald-300 transition-colors"
                      onClick={() => openEditModal(log, 'checkInTime')}
                      title="Nhấn để sửa giờ vào"
                    >
                      {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td 
                      className="px-3 py-2 text-rose-400/80 text-xs font-mono cursor-pointer hover:bg-slate-800/40 hover:text-rose-300 transition-colors"
                      onClick={() => openEditModal(log, 'checkOutTime')}
                      title="Nhấn để sửa giờ ra"
                    >
                      {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                );
              })}
              {currentLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-slate-500">
                    Chưa có người điểm danh ngày này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Time Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={() => setEditModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
              <span className="text-amber-400">🕒</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Sửa {editingLog?.field === 'checkInTime' ? 'Giờ Vào' : 'Giờ Ra'}
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Giờ mới (HH:mm)</label>
                <input
                  type="time"
                  value={editTimeValue}
                  onChange={(e) => setEditTimeValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Mật khẩu xác nhận</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                />
              </div>
              
              {editError && (
                <p className="text-rose-400 text-xs italic">{editError}</p>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <button 
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmEdit}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs transition cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const ReportView = ({ workers, attendanceLogs }: { workers: Worker[], attendanceLogs: AttendanceRecord[] }) => {
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split("T")[0]);

  const handleExport = () => {
    const dailyLogs = attendanceLogs.filter(a => a.date === reportDate);
    if (dailyLogs.length === 0) {
      alert("Không có dữ liệu cho ngày này!");
      return;
    }

    // Nhóm theo nhân viên: lấy giờ vào sớm nhất và giờ ra trễ nhất
    const logsByWorker = dailyLogs.reduce((acc, log) => {
      if (!acc[log.workerId]) {
        acc[log.workerId] = {
          workerId: log.workerId,
          checkInTime: log.checkInTime,
          checkOutTime: log.checkOutTime,
          date: log.date,
          scannedDivision: log.scannedDivision
        };
      } else {
        // Tìm giờ vào sớm nhất
        if (new Date(log.checkInTime) < new Date(acc[log.workerId].checkInTime)) {
          acc[log.workerId].checkInTime = log.checkInTime;
        }
        // Cập nhật giờ ra và bộ phận cuối cùng
        if (!log.checkOutTime) {
          acc[log.workerId].checkOutTime = undefined;
          acc[log.workerId].scannedDivision = log.scannedDivision;
        } else if (acc[log.workerId].checkOutTime !== undefined) {
          if (new Date(log.checkOutTime) > new Date(acc[log.workerId].checkOutTime!)) {
            acc[log.workerId].checkOutTime = log.checkOutTime;
            acc[log.workerId].scannedDivision = log.scannedDivision;
          }
        }
      }
      return acc;
    }, {} as Record<string, { workerId: string, checkInTime: string, checkOutTime?: string, date: string, scannedDivision?: string }>);

    const exportData = Object.values(logsByWorker).map((log, index) => {
      const w = workers.find(x => x.id === log.workerId);
      const checkInTime = new Date(log.checkInTime).toLocaleTimeString();
      const checkOutTime = log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : "";
      
      let workDurationStr = "";
      let workHoursNum = 0;
      if (log.checkOutTime) {
        const diffMs = new Date(log.checkOutTime).getTime() - new Date(log.checkInTime).getTime();
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.round((diffMs % 3600000) / 60000);
        workDurationStr = `${diffHrs}h ${diffMins}m`;
        workHoursNum = Number((diffMs / 3600000).toFixed(2));
      }

      return {
        "STT": index + 1,
        "Ngày": log.date,
        "Mã Nhân Viên": log.workerId,
        "Tên Nhân Viên": w?.name || "N/A",
        "Bộ Phận Gốc": w?.division || "N/A",
        "Loại Nhân Sự": w?.type === 'OFFICIAL' ? 'Chính thức' : w?.type === 'SEASONAL' ? 'Thời vụ' : 'Thử việc',
        "Vị Trí Làm Việc": log.scannedDivision || w?.division || "N/A",
        "Giờ Vào": checkInTime,
        "Giờ Ra": checkOutTime,
        "Số giờ làm": workHoursNum,
        "Thời gian làm": workDurationStr,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const wscols = [
      {wch: 5}, {wch: 12}, {wch: 15}, {wch: 25}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 12}, {wch: 12}, {wch: 10}, {wch: 15}
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bang_Cham_Cong");
    XLSX.writeFile(wb, `Bang_Cham_Cong_${reportDate}.xlsx`);
  };

  const rawDailyLogs = attendanceLogs.filter(a => a.date === reportDate);
  const logsByWorkerForDisplay = rawDailyLogs.reduce((acc, log) => {
    if (!acc[log.workerId]) {
      acc[log.workerId] = {
        id: log.workerId, // Dùng làm key duy nhất trên UI
        workerId: log.workerId,
        checkInTime: log.checkInTime,
        checkOutTime: log.checkOutTime,
        date: log.date,
        scannedDivision: log.scannedDivision
      };
    } else {
      if (new Date(log.checkInTime) < new Date(acc[log.workerId].checkInTime)) {
        acc[log.workerId].checkInTime = log.checkInTime;
      }
      if (!log.checkOutTime) {
        acc[log.workerId].checkOutTime = undefined;
        acc[log.workerId].scannedDivision = log.scannedDivision;
      } else if (acc[log.workerId].checkOutTime !== undefined) {
        if (new Date(log.checkOutTime) > new Date(acc[log.workerId].checkOutTime!)) {
          acc[log.workerId].checkOutTime = log.checkOutTime;
          acc[log.workerId].scannedDivision = log.scannedDivision;
        }
      }
    }
    return acc;
  }, {} as Record<string, { id: string, workerId: string, checkInTime: string, checkOutTime?: string, date: string, scannedDivision?: string }>);
  
  const dailyLogs = Object.values(logsByWorkerForDisplay);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Bảng chấm công ngày</h3>
          <p className="text-sm text-slate-400 mt-1">Ghi nhận dữ liệu ra vào và số giờ làm việc thực tế của nhân sự</p>
        </div>
        <div className="flex gap-4 items-center">
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-indigo-500 outline-none"
          />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Download className="w-4 h-4" />
            Xuất Excel (Chấm công)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Mã NV</th>
              <th className="px-4 py-3 font-medium">Tên NV</th>
              <th className="px-4 py-3 font-medium text-center">Bộ phận làm việc</th>
              <th className="px-4 py-3 font-medium text-center">Giờ vào</th>
              <th className="px-4 py-3 font-medium text-center">Giờ ra</th>
              <th className="px-4 py-3 font-medium text-center">Thời gian làm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {dailyLogs.map((log) => {
              const w = workers.find(x => x.id === log.workerId);
              let workDurationStr = "-";
              if (log.checkOutTime) {
                const diffMs = new Date(log.checkOutTime).getTime() - new Date(log.checkInTime).getTime();
                const diffHrs = Math.floor(diffMs / 3600000);
                const diffMins = Math.round((diffMs % 3600000) / 60000);
                workDurationStr = `${diffHrs}h ${diffMins}m`;
              }
              return (
                <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3 text-slate-300 font-mono text-sm">{log.workerId}</td>
                  <td className="px-4 py-3 text-white font-medium">{w?.name || "N/A"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      (log.scannedDivision || w?.division) === 'RO' ? 'bg-emerald-950/50 text-emerald-400' :
                      (log.scannedDivision || w?.division) === 'BG' ? 'bg-sky-950/50 text-sky-400' :
                      'bg-amber-950/50 text-amber-400'
                    }`}>
                      {log.scannedDivision || w?.division}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-mono text-sm">
                    {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-center text-rose-400 font-mono text-sm">
                    {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-amber-300 font-mono text-sm">
                    {workDurationStr}
                  </td>
                </tr>
              );
            })}
            {dailyLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  Không có dữ liệu điểm danh trong ngày này
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
