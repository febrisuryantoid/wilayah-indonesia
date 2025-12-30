import React from 'react';

const data = [
  { label: 'Provinsi', count: 38, color: 'bg-emerald-500', width: '15%', bg: 'bg-emerald-100' },
  { label: 'Kabupaten/Kota', count: 514, color: 'bg-cyan-500', width: '35%', bg: 'bg-cyan-100' },
  { label: 'Kecamatan', count: 7277, color: 'bg-blue-500', width: '65%', bg: 'bg-blue-100' },
  { label: 'Desa/Kelurahan', count: 83771, color: 'bg-indigo-500', width: '100%', bg: 'bg-indigo-100' },
];

export const StatsChart: React.FC = () => {
  return (
    <div className="w-full p-6 glass-panel rounded-3xl border border-white/60 shadow-lg shadow-slate-200/30">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            Statistik Data
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Cakupan Wilayah</p>
        </div>
        <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
          2024
        </div>
      </div>
      
      <div className="space-y-6">
        {data.map((item, index) => (
          <div key={index} className="relative group">
            <div className="flex justify-between items-end mb-2 relative z-10">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">{item.label}</span>
              <span className="text-xs font-bold font-mono text-slate-700 bg-white/50 px-1.5 py-0.5 rounded border border-slate-200/50">
                {new Intl.NumberFormat('id-ID').format(item.count)}
              </span>
            </div>
            <div className={`w-full ${item.bg} rounded-full h-2.5 overflow-hidden`}>
              <div 
                className={`h-full rounded-full ${item.color} relative overflow-hidden transition-all duration-1000 ease-out`}
                style={{ width: item.width }}
              >
                 <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] -skew-x-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};