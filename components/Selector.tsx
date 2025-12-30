import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, Loader2, X, Check, MapPin, AlignLeft } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface SelectorProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export const Selector: React.FC<SelectorProps> = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  loading = false,
  placeholder = "Pilih..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cari nama opsi yang sedang dipilih untuk ditampilkan di trigger button
  const selectedOptionName = useMemo(() => {
    return options.find(opt => opt.id === value)?.name || '';
  }, [value, options]);

  // Reset search term saat modal ditutup/dibuka
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      // Auto focus ke input search saat popup muncul
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(opt => 
      opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label */}
      <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex justify-between items-center">
        <span>{label}</span>
        {value && <span className="text-emerald-600 text-[9px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-bold shadow-sm">Terpilih</span>}
      </label>
      
      {/* Trigger Button (Tampilan di Halaman Utama) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(true)}
        className={`
          relative w-full text-left flex items-center justify-between
          px-4 py-3.5 md:py-4 rounded-xl border transition-all duration-200
          ${disabled 
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
            : 'bg-white border-slate-300 hover:border-indigo-400 hover:shadow-md text-slate-800 cursor-pointer active:scale-[0.99]'}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
           {loading ? (
             <Loader2 className="w-5 h-5 animate-spin text-indigo-600 flex-shrink-0" />
           ) : (
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${value ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                <MapPin className="w-4 h-4" />
             </div>
           )}
           <span className={`truncate text-sm font-medium ${!selectedOptionName && 'text-slate-400'}`}>
             {loading ? 'Memuat data...' : (selectedOptionName || placeholder)}
           </span>
        </div>

        <div className="flex items-center gap-2 pl-2">
           {value && !disabled && !loading && (
              <div 
                role="button"
                onClick={handleClear}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </div>
           )}
           <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </button>

      {/* POPUP MODAL (Overlay) - CENTERED */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          
          {/* Backdrop Blur - Darker for focus */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content Window - Perfectly Centered Card */}
          <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 fade-in duration-200 overflow-hidden ring-1 ring-white/20">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <AlignLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Pilih {label}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Cari dan pilih dari daftar</p>
                  </div>
               </div>
               <button 
                 onClick={() => setIsOpen(false)}
                 className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* Search Bar Area */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 shrink-0">
              <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={`Ketik nama ${label}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm"
                  />
               </div>
            </div>

            {/* List Options - Scrollable */}
            <div className="overflow-y-auto p-2 scroll-smooth bg-white min-h-[200px]">
               {filteredOptions.length > 0 ? (
                 <div className="space-y-1">
                   {filteredOptions.map((opt) => {
                     const isSelected = opt.id === value;
                     return (
                       <button
                         key={opt.id}
                         onClick={() => handleSelect(opt)}
                         className={`
                           w-full px-4 py-3.5 text-left text-sm rounded-xl flex items-center justify-between group transition-all duration-200 border border-transparent
                           ${isSelected 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-100 font-bold' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-slate-100'}
                         `}
                       >
                         <span className="truncate pr-4">{opt.name}</span>
                         {isSelected && (
                           <span className="bg-indigo-600 text-white p-1 rounded-full">
                              <Check className="w-3 h-3" />
                           </span>
                         )}
                       </button>
                     );
                   })}
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                       <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-slate-800 font-semibold">Tidak ditemukan</h4>
                    <p className="text-sm text-slate-400 max-w-[200px]">
                      Data "{searchTerm}" tidak tersedia dalam daftar {label}.
                    </p>
                 </div>
               )}
            </div>
            
            {/* Footer Status */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-center flex justify-between items-center shrink-0">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wilayah Indonesia</span>
               <span className="text-[10px] text-slate-400 font-mono">
                  {filteredOptions.length} Data
               </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};