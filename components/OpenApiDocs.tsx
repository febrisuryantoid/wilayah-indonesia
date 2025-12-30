import React from 'react';
import { Copy, Terminal, CheckCircle2, Globe, Database, Server } from 'lucide-react';

export const OpenApiDocs: React.FC = () => {
  const [copied, setCopied] = React.useState<string | null>(null);

  // Gunakan window.location.origin agar dinamis mengikuti domain Vercel saat dideploy
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpoints = [
    {
      title: "Data Provinsi",
      desc: "Ambil seluruh data provinsi di Indonesia.",
      method: "GET",
      url: `${baseUrl}/api/provinces.json`,
      example: `fetch('${baseUrl}/api/provinces.json')
  .then(response => response.json())
  .then(data => console.log(data));`
    },
    {
      title: "Data Kabupaten/Kota",
      desc: "Ambil data kabupaten berdasarkan ID Provinsi.",
      method: "GET",
      url: `${baseUrl}/api/regencies/{province_id}.json`,
      example: `// Contoh: Jawa Barat (32)
fetch('${baseUrl}/api/regencies/32.json')
  .then(response => response.json())
  .then(data => console.log(data));`
    },
    {
      title: "Data Kecamatan",
      desc: "Ambil data kecamatan berdasarkan ID Kabupaten.",
      method: "GET",
      url: `${baseUrl}/api/districts/{regency_id}.json`,
      example: `// Contoh: Bandung (3273)
fetch('${baseUrl}/api/districts/3273.json')
  .then(response => response.json())
  .then(data => console.log(data));`
    },
     {
      title: "Data Desa/Kelurahan",
      desc: "Ambil data desa berdasarkan ID Kecamatan.",
      method: "GET",
      url: `${baseUrl}/api/villages/{district_id}.json`,
      example: `// Contoh: Coblong (3273060)
fetch('${baseUrl}/api/villages/3273060.json')
  .then(response => response.json())
  .then(data => console.log(data));`
    }
  ];

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hero Section Docs */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
            <CheckCircle2 className="w-3 h-3" /> Self Hosted API
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-800">
            Open API Dokumentasi
          </h2>
          <p className="text-slate-600 max-w-2xl leading-relaxed">
            Platform ini dirancang sebagai <strong>Static API Server</strong> yang berjalan di atas Vercel. 
            Anda dapat mengakses raw JSON data langsung dari domain aplikasi ini.
          </p>
          <div className="flex gap-4 mt-6">
             <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Server className="w-4 h-4 text-indigo-500" /> Vercel Hosted
             </div>
             <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Database className="w-4 h-4 text-fuchsia-500" /> Static JSON
             </div>
          </div>
        </div>
      </div>

      {/* Endpoints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {endpoints.map((ep, idx) => (
          <div key={idx} className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6 hover:bg-white/60 transition-all duration-300 group shadow-sm hover:shadow-md">
             <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-slate-800">{ep.title}</h3>
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-mono rounded-md font-bold border border-indigo-100">{ep.method}</span>
             </div>
             <p className="text-slate-500 text-sm mb-4">{ep.desc}</p>
             
             <div className="bg-slate-100 rounded-lg p-3 border border-slate-200 mb-4 font-mono text-xs text-slate-600 break-all flex items-center gap-2">
                <Globe className="w-3 h-3 flex-shrink-0 text-slate-400" />
                {ep.url}
             </div>

             <div className="relative">
                <div className="absolute right-2 top-2">
                   <button 
                      onClick={() => copyToClipboard(ep.example, `code-${idx}`)}
                      className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-100 shadow-sm"
                   >
                      {copied === `code-${idx}` ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                   </button>
                </div>
                <pre className="bg-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-slate-700 shadow-inner">
                   <code>{ep.example}</code>
                </pre>
             </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center text-slate-400 text-sm">
         Powered by Vercel Static Generation
      </div>
    </div>
  );
};