import React, { useState, useEffect } from 'react';
import { fetchProvinces, fetchRegencies, fetchDistricts, fetchVillages } from './services/locationService';
import { Province, Regency, District, Village, APP_VERSION, LAST_UPDATED } from './types';
import { Selector } from './components/Selector';
import { StatsChart } from './components/StatsChart';
import { DatabaseStatus } from './components/DatabaseStatus';
import { OpenApiDocs } from './components/OpenApiDocs';
import { Map, MapPin, Navigation, Hash, ExternalLink, Globe, Sparkles, ChevronRight, Home, Code2, LayoutGrid, GitBranch } from 'lucide-react';

type ViewMode = 'explorer' | 'openapi';

const App: React.FC = () => {
  // View State
  const [currentView, setCurrentView] = useState<ViewMode>('explorer');

  // Data State
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  // Selection State
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedRegencyId, setSelectedRegencyId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');

  // Loading State
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Derived Selection Objects
  const currentProvince = provinces.find(p => p.id === selectedProvinceId);
  const currentRegency = regencies.find(r => r.id === selectedRegencyId);
  const currentDistrict = districts.find(d => d.id === selectedDistrictId);
  const currentVillage = villages.find(v => v.id === selectedVillageId);

  // Initial Load
  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      const data = await fetchProvinces();
      setProvinces(data);
      setLoadingProvinces(false);
    };
    loadProvinces();
  }, []);

  // Cascading Loads
  useEffect(() => {
    if (selectedProvinceId) {
      const loadRegencies = async () => {
        setLoadingRegencies(true);
        const data = await fetchRegencies(selectedProvinceId);
        setRegencies(data);
        setLoadingRegencies(false);
      };
      loadRegencies();
    } else {
      setRegencies([]);
    }
    // Reset children
    setSelectedRegencyId('');
    setSelectedDistrictId('');
    setSelectedVillageId('');
  }, [selectedProvinceId]);

  useEffect(() => {
    if (selectedRegencyId) {
      const loadDistricts = async () => {
        setLoadingDistricts(true);
        const data = await fetchDistricts(selectedRegencyId);
        setDistricts(data);
        setLoadingDistricts(false);
      };
      loadDistricts();
    } else {
      setDistricts([]);
    }
    setSelectedDistrictId('');
    setSelectedVillageId('');
  }, [selectedRegencyId]);

  useEffect(() => {
    if (selectedDistrictId) {
      const loadVillages = async () => {
        setLoadingVillages(true);
        const data = await fetchVillages(selectedDistrictId);
        setVillages(data);
        setLoadingVillages(false);
      };
      loadVillages();
    } else {
      setVillages([]);
    }
    setSelectedVillageId('');
  }, [selectedDistrictId]);


  // Determine what to display in Info Panel
  const getActiveLocation = () => {
    if (currentVillage) return { 
      name: currentVillage.name, 
      parent: `${currentDistrict?.name}, ${currentRegency?.name}`,
      full_location: `${currentVillage.name}, ${currentDistrict?.name}, ${currentRegency?.name}, ${currentProvince?.name}`,
      level: 'Desa/Kelurahan',
      id: currentVillage.id,
      zoom: 16
    };
    if (currentDistrict) return { 
      name: currentDistrict.name, 
      parent: `${currentRegency?.name}, ${currentProvince?.name}`,
      full_location: `${currentDistrict.name}, ${currentRegency?.name}, ${currentProvince?.name}`,
      level: 'Kecamatan',
      id: currentDistrict.id,
      zoom: 13
    };
    if (currentRegency) return { 
      name: currentRegency.name, 
      parent: `${currentProvince?.name}`, 
      full_location: `${currentRegency.name}, ${currentProvince?.name}`,
      level: 'Kabupaten/Kota',
      id: currentRegency.id,
      zoom: 11
    };
    if (currentProvince) return { 
      name: currentProvince.name, 
      parent: 'Indonesia', 
      full_location: `${currentProvince.name}, Indonesia`,
      level: 'Provinsi',
      id: currentProvince.id,
      zoom: 9
    };
    return null;
  };

  const activeInfo = getActiveLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden relative bg-slate-50/50">
      
      {/* Decorative Background Elements (Light Mode) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-0 right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-100/60 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[100px] opacity-70 animate-blob"></div>
         <div className="absolute top-[20%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-fuchsia-100/60 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-[20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-100/60 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Glass Navigation Bar - Optimized for Mobile */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-white/60 shadow-sm transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative bg-white p-2 rounded-xl border border-white shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-300">
                <Map className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl font-extrabold tracking-tight text-slate-800 leading-none">
                Wilayah<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Indonesia</span>
              </h1>
              <span className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Open Data Platform</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-white/60 backdrop-blur-md shadow-inner">
            <button 
              onClick={() => setCurrentView('explorer')}
              className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold transition-all duration-300 ${currentView === 'explorer' ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Explorer</span>
            </button>
            <button 
              onClick={() => setCurrentView('openapi')}
              className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold transition-all duration-300 ${currentView === 'openapi' ? 'bg-white text-fuchsia-600 shadow-sm shadow-fuchsia-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              <Code2 className="w-3.5 h-3.5" /> <span className="hidden xs:inline">API</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area - Optimized Padding for Mobile */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-12 relative z-10">
        
        {currentView === 'openapi' ? (
          <OpenApiDocs />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[calc(100vh-160px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Left Panel: Controls - Z-INDEX 40 to be higher than Right Panel */}
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 order-1 relative z-40">
              <div className="glass-card rounded-[2rem] p-5 md:p-6 relative overflow-visible group shadow-xl shadow-slate-200/40 border border-white/80">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-800">Filter Lokasi</h2>
                    <p className="text-xs text-slate-500">Pilih hierarki wilayah</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-5">
                  <Selector
                    label="Provinsi"
                    placeholder="Pilih Provinsi..."
                    options={provinces}
                    value={selectedProvinceId}
                    onChange={setSelectedProvinceId}
                    loading={loadingProvinces}
                  />
                  
                  <Selector
                    label="Kabupaten / Kota"
                    placeholder="Pilih Kabupaten/Kota..."
                    options={regencies}
                    value={selectedRegencyId}
                    onChange={setSelectedRegencyId}
                    loading={loadingRegencies}
                    disabled={!selectedProvinceId}
                  />
                  
                  <Selector
                    label="Kecamatan"
                    placeholder="Pilih Kecamatan..."
                    options={districts}
                    value={selectedDistrictId}
                    onChange={setSelectedDistrictId}
                    loading={loadingDistricts}
                    disabled={!selectedRegencyId}
                  />
                  
                  <Selector
                    label="Desa / Kelurahan"
                    placeholder="Pilih Desa/Kelurahan..."
                    options={villages}
                    value={selectedVillageId}
                    onChange={setSelectedVillageId}
                    loading={loadingVillages}
                    disabled={!selectedDistrictId}
                  />
                </div>
              </div>
              
              <div className="hidden lg:block">
                <StatsChart />
              </div>
            </div>

            {/* Right Panel: Content Display - Z-INDEX 10 */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full order-2 relative z-10">
              {activeInfo ? (
                <div className="glass-card h-full rounded-[2.5rem] p-6 md:p-10 flex flex-col animate-in fade-in zoom-in-95 duration-500 relative border border-white/60 shadow-2xl shadow-slate-200/50">
                  
                  {/* Header */}
                  <div className="mb-6 md:mb-8 relative z-10">
                    <nav className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-500 mb-4 font-medium">
                        <span className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-default"><Home className="w-3.5 h-3.5" /> Indo</span>
                        {activeInfo.level !== 'Provinsi' && <ChevronRight className="w-3 h-3 text-slate-300" />}
                        <span className="text-slate-400 truncate max-w-[200px] md:max-w-none">{activeInfo.level === 'Provinsi' ? 'Pencarian' : activeInfo.parent}</span>
                    </nav>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
                        <div className="flex-1">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            {activeInfo.level}
                          </div>
                          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight break-words">
                            {activeInfo.name}
                          </h2>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-left md:text-right">
                              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">ID Wilayah</div>
                              <div className="font-mono text-xl md:text-2xl font-bold text-slate-700">{activeInfo.id}</div>
                          </div>
                        </div>
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 flex-1 relative z-10">
                      {/* Main Map */}
                      <div className="xl:col-span-2 bg-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 relative group min-h-[280px] md:min-h-[400px] border-4 border-white order-2 xl:order-1">
                          <iframe 
                              width="100%" 
                              height="100%" 
                              frameBorder="0" 
                              scrolling="no" 
                              marginHeight={0} 
                              marginWidth={0} 
                              title="Google Maps"
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(activeInfo.full_location)}&t=&z=${activeInfo.zoom}&ie=UTF8&iwloc=&output=embed`}
                              className="w-full h-full grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 scale-[1.01]"
                          ></iframe>
                          <div className="absolute top-4 right-4 pointer-events-none">
                            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-lg border border-white/50 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-500"/> Peta Interaktif
                            </div>
                          </div>
                      </div>

                      {/* Side Details */}
                      <div className="flex flex-col gap-5 order-1 xl:order-2">
                          <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 flex items-center gap-5 hover:border-indigo-100 hover:shadow-indigo-100/50 transition-all duration-300">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Hash className="w-6 h-6 md:w-7 md:h-7" />
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Kode Kemendagri</div>
                                <div className="text-xl md:text-2xl font-bold text-slate-800 font-mono tracking-tight">{activeInfo.id}</div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between flex-1 relative overflow-hidden group min-h-[160px]">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-500"></div>
                            
                            <div className="relative z-10">
                                <h4 className="font-bold text-lg md:text-xl mb-2">Navigasi Langsung</h4>
                                <p className="text-indigo-100 text-xs md:text-sm leading-relaxed opacity-90">
                                  Lihat rute, fasilitas umum, dan tempat sekitar lokasi ini.
                                </p>
                            </div>
                            
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeInfo.full_location)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="relative z-10 mt-6 bg-white text-indigo-600 px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg"
                            >
                                <MapPin className="w-4 h-4" /> Buka Google Maps
                            </a>
                          </div>
                      </div>
                  </div>
                  
                  {/* Footer Actions */}
                  <div className="mt-auto pt-6 border-t border-slate-100 relative z-10">
                      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-center sm:text-left">
                          <p className="text-xs text-slate-400 italic">
                            Data Geografis API & Google Maps Platform
                          </p>
                          <a 
                            href={`https://www.google.com/search?q=${encodeURIComponent(activeInfo.full_location)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-colors px-4 py-2 hover:bg-slate-50 rounded-full"
                          >
                            Cari Informasi di Web <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                      </div>
                  </div>

                </div>
              ) : (
                // Empty State
                <div className="h-full w-full flex flex-col items-center justify-center p-8 md:p-12 text-center glass-card rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-100 min-h-[400px]">
                  <div className="max-w-lg w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
                    
                    <div className="relative bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-white shadow-2xl mb-8 transform rotate-1 transition-transform duration-500 hover:rotate-0">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-6 text-white">
                          <Map className="w-10 h-10 md:w-12 md:h-12" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Mulai Penjelajahan</h3>
                        <p className="text-slate-500 leading-relaxed text-base md:text-lg">
                          Pilih provinsi pada panel di atas/kiri untuk mulai menampilkan detail wilayah administratif Indonesia.
                        </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Stats Chart - Only visible on mobile/tablet at bottom */}
            <div className="lg:hidden block order-3">
               <StatsChart />
            </div>

          </div>
        )}
      </main>

      <DatabaseStatus />

      <footer className="w-full max-w-[1600px] mx-auto px-4 py-8 text-center relative z-10 space-y-2">
         <div className="glass-panel inline-block px-6 py-3 rounded-full border border-white/50 shadow-sm">
            <p className="text-xs font-medium text-slate-500">
              © {new Date().getFullYear()} Wilayah Indonesia. <span className="text-slate-300 mx-2">|</span> Data untuk Semua.
            </p>
         </div>
         
         {/* Version Indicator */}
         <div className="flex justify-center items-center gap-3 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200/50">
              <GitBranch className="w-3 h-3" />
              <span className="font-mono">v{APP_VERSION}</span>
            </div>
            <span>Updated: {LAST_UPDATED}</span>
         </div>
      </footer>
    </div>
  );
};

export default App;