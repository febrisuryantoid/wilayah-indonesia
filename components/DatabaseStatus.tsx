import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, Trash2, HardDrive, DownloadCloud, AlertTriangle, Loader2, Check } from 'lucide-react';
import { dbService } from '../services/db';
import { getDatabaseStats as getStats, downloadFullDatabase } from '../services/locationService';

export const DatabaseStatus: React.FC = () => {
  const [stats, setStats] = useState({ provinces: 0, regencies: 0, districts: 0, villages: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState({ message: '', percent: 0 });

  const refreshStats = async () => {
    setIsChecking(true);
    try {
      const s = await getStats();
      setStats(s);
    } finally {
      // Delay sedikit agar animasi loading terlihat (UX)
      setTimeout(() => setIsChecking(false), 500);
    }
  };

  useEffect(() => {
    refreshStats();
    // Auto refresh setiap 10 detik jika tidak sedang download
    const interval = setInterval(() => {
        if (!isDownloading) refreshStats();
    }, 10000);
    return () => clearInterval(interval);
  }, [isDownloading]);

  const totalItems = stats.provinces + stats.regencies + stats.districts + stats.villages;
  const hasData = totalItems > 0;
  // Threshold untuk menganggap database "Lengkap" (Estimasi > 85k record)
  const isComplete = totalItems > 85000; 

  const handleClear = async () => {
      // POPUP KONFIRMASI (Window Confirm)
      const confirmed = window.confirm(
          "⚠️ PERINGATAN PENGHAPUSAN DATA ⚠️\n\n" +
          "Apakah Anda yakin ingin menghapus SELURUH database wilayah offline?\n\n" +
          "• Aplikasi akan kembali mengandalkan koneksi internet.\n" +
          "• Anda perlu mengunduh ulang (~50MB) untuk fitur offline.\n\n" +
          "Tekan OK untuk menghapus."
      );

      if(confirmed) {
          try {
            setIsChecking(true);
            await dbService.clearAll();
            setStats({ provinces: 0, regencies: 0, districts: 0, villages: 0 }); // Optimistic update
            await refreshStats();
            alert("Database lokal berhasil dikosongkan.");
          } catch (e) {
            alert("Gagal menghapus database.");
            console.error(e);
          } finally {
            setIsChecking(false);
          }
      }
  };

  const handleDownloadFull = async () => {
      // Konfirmasi awal
      const confirmed = window.confirm(
          "📥 DOWNLOAD DATABASE OFFLINE\n\n" +
          "Proses ini akan mengunduh data seluruh Indonesia (~8.000 file request).\n" +
          "• Waktu estimasi: 3 - 10 Menit (Tergantung internet)\n" +
          "• Browser jangan ditutup selama proses.\n\n" +
          "Lanjutkan proses download?"
      );

      if (!confirmed) return;

      setIsDownloading(true);
      try {
          await downloadFullDatabase((msg, pct) => {
              setProgress({ message: msg, percent: pct });
          });
          
          await refreshStats();
          alert("✅ SINKRONISASI SELESAI!\n\nAplikasi sekarang dapat berjalan FULL OFFLINE dengan kecepatan maksimal.");
      } catch (e: any) {
          alert("❌ GAGAL: " + e.message + "\n\nSilakan coba lagi atau cek koneksi internet.");
          refreshStats(); // Cek apa yang berhasil tersimpan
      } finally {
          setIsDownloading(false);
          setProgress({ message: '', percent: 0 });
      }
  };

  // Prevent closing modal when downloading
  const toggleModal = () => {
      if (isDownloading) return;
      setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-slate-400/50 border border-white/60 p-5 w-80 animate-in slide-in-from-bottom-5 mb-4 ring-1 ring-slate-900/5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              Manajemen Data
            </h3>
            <button 
                onClick={toggleModal} 
                disabled={isDownloading}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 disabled:opacity-30 cursor-pointer"
            >
              <span className="sr-only">Tutup</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Progress Bar Area (Muncul saat download) */}
          {isDownloading ? (
              <div className="mb-5 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                  <div className="flex justify-between text-xs font-bold text-indigo-700 mb-1">
                      <span>{progress.percent}%</span>
                      <Loader2 className="w-3 h-3 animate-spin" />
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress.percent}%` }}
                      ></div>
                  </div>
                  <p className="text-[10px] text-indigo-600 font-mono leading-tight">{progress.message}</p>
                  <p className="text-[9px] text-indigo-400 mt-2 italic text-center">Jangan tutup browser...</p>
              </div>
          ) : (
            <div className="space-y-2 text-sm text-slate-600 mb-5 select-none">
                <div className="flex justify-between items-center p-1 hover:bg-slate-50 rounded transition-colors">
                    <span className="flex items-center gap-2 text-xs">Provinsi</span>
                    <span className="font-mono font-bold text-slate-800">{stats.provinces}</span>
                </div>
                <div className="flex justify-between items-center p-1 hover:bg-slate-50 rounded transition-colors">
                    <span className="flex items-center gap-2 text-xs">Kab/Kota</span>
                    <span className="font-mono font-bold text-slate-800">{stats.regencies}</span>
                </div>
                <div className="flex justify-between items-center p-1 hover:bg-slate-50 rounded transition-colors">
                    <span className="flex items-center gap-2 text-xs">Kecamatan</span>
                    <span className="font-mono font-bold text-slate-800">{stats.districts}</span>
                </div>
                <div className="flex justify-between items-center p-1 hover:bg-slate-50 rounded transition-colors">
                    <span className="flex items-center gap-2 text-xs">Desa/Kelurahan</span>
                    <span className="font-mono font-bold text-slate-800">{stats.villages}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between font-bold text-indigo-700">
                    <span>Total Record</span>
                    <span>{totalItems.toLocaleString()}</span>
                </div>
            </div>
          )}

          {/* Info Box */}
          {!isComplete && !isDownloading && (
              <div className="flex gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] mb-4 border border-amber-100 items-start leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <p>Database parsial. Fitur offline hanya tersedia untuk wilayah yang sudah pernah dibuka sebelumnya.</p>
              </div>
          )}

          {isComplete && !isDownloading && (
               <div className="flex gap-2 p-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] mb-4 border border-emerald-100 items-start leading-relaxed">
                  <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <p>Database Lengkap. Aplikasi berjalan 100% Offline.</p>
              </div>
          )}

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-2">
             {!isDownloading && (
                <button 
                    onClick={handleDownloadFull}
                    className={`col-span-2 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] ${isComplete 
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'}`}
                    disabled={isComplete}
                >
                    {isComplete ? (
                        <>Semua Data Terunduh <Check className="w-3 h-3" /></>
                    ) : (
                        <><DownloadCloud className="w-4 h-4" /> Download Semua Data</>
                    )}
                </button>
             )}

             <button 
                onClick={refreshStats}
                disabled={isDownloading || isChecking}
                className="bg-white hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-slate-200 shadow-sm active:bg-slate-100"
            >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-indigo-500' : ''}`} /> 
                {isChecking ? 'Mengecek...' : 'Cek Status'}
            </button>
            
            <button 
                onClick={handleClear}
                disabled={!hasData || isDownloading}
                className="bg-white hover:bg-red-50 text-red-500 hover:text-red-600 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-slate-200 hover:border-red-100 shadow-sm disabled:opacity-50 active:bg-red-50"
            >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Data
            </button>
          </div>
        </div>
      ) : null}

      {/* Trigger Button */}
      <button
        onClick={toggleModal}
        className={`group flex items-center gap-2 backdrop-blur-md border px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 z-50 
            ${isComplete 
                ? 'bg-emerald-500/90 border-emerald-400 text-white shadow-emerald-500/30' 
                : 'bg-slate-800/90 border-slate-700 text-white shadow-slate-900/30'
            }`}
      >
        <Database className={`w-5 h-5 ${isComplete ? 'text-white' : 'text-slate-300'}`} />
        <span className="text-xs font-bold pr-1 hidden sm:inline">
            {isDownloading ? 'Downloading...' : (isComplete ? 'Offline Ready' : 'Database')}
        </span>
        
        {/* Status Indicator Dot */}
        {isDownloading ? (
            <span className="relative flex h-2.5 w-2.5 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
            </span>
        ) : hasData ? (
             <span className={`w-2.5 h-2.5 rounded-full ml-1 ${isComplete ? 'bg-white' : 'bg-green-400'}`}></span>
        ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 ml-1"></span>
        )}
      </button>
    </div>
  );
};