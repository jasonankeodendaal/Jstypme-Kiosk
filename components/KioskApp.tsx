
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StoreData, Brand, Category, Product, FlatProduct, Catalogue, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { 
  getKioskId, 
  provisionKioskId, 
  completeKioskSetup, 
  isKioskConfigured, 
  sendHeartbeat, 
  setCustomKioskId, 
  getShopName, 
  getDeviceType,
  supabase,
  checkCloudConnection,
  initSupabase,
  getCloudProjectName,
  tryRecoverIdentity
} from '../services/kioskService';
import BrandGrid from './BrandGrid';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Screensaver from './Screensaver';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import TVMode from './TVMode';
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Activity, Signal, Maximize } from 'lucide-react';

const isRecent = (dateString?: string) => {
    if (!dateString) return false;
    const addedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 30;
};

const RIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

const SetupScreen = ({ storeData, onComplete }: { storeData: StoreData, onComplete: () => void }) => {
    const [step, setStep] = useState(1);
    const [shopName, setShopName] = useState('');
    const [deviceType, setDeviceType] = useState<'kiosk' | 'mobile' | 'tv'>('kiosk');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleNext = async () => {
        setError('');
        if (step === 1) {
            if (!shopName.trim()) return setError('Please enter a name for this location.');
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            const systemPin = storeData.systemSettings?.setupPin || '0000';
            if (pin !== systemPin) return setError('Invalid Setup PIN. Check Admin Hub.');
            
            setIsProcessing(true);
            try {
                await provisionKioskId();
                const success = await completeKioskSetup(shopName.trim(), deviceType);
                if (success) onComplete();
                else setError('Local storage write error.');
            } catch (e) {
                setError('Registration failed. Check connection.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-slate-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950 opacity-100"></div>

            <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)] animate-fade-in border border-white/10 relative z-10">
                <div className="bg-slate-900 text-white p-5 text-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] scale-125"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg mb-2">
                            <Store size={20} />
                        </div>
                        <h1 className="text-lg font-black uppercase tracking-tight">System Activation</h1>
                        <p className="text-blue-400 font-bold uppercase text-[7px] tracking-[0.2em] opacity-80">v2.8 • Provisioning Protocol</p>
                    </div>
                </div>

                <div className="p-5 md:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex gap-1">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-6 bg-blue-600' : step > s ? 'w-3 bg-green-500' : 'w-1.5 bg-slate-100'}`}></div>
                            ))}
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Step {step} of 3</span>
                    </div>

                    <div className="min-h-[190px] flex flex-col">
                        {step === 1 && (
                            <div className="animate-fade-in space-y-3">
                                <div>
                                    <h2 className="text-md font-black text-slate-900 leading-none uppercase mb-1">Identity</h2>
                                    <p className="text-[10px] text-slate-500 leading-snug font-medium">
                                        Assign a unit name for remote tracking in the Admin Hub.
                                    </p>
                                </div>
                                <div className="space-y-1.5 pt-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Device Name</label>
                                    <input 
                                        autoFocus
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold text-sm text-slate-900 transition-all uppercase shadow-inner"
                                        placeholder="e.g. Shop A - Unit 1"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                    />
                                    <p className="text-[8px] text-slate-400 font-bold uppercase italic px-1">Tip: Use location-specific names.</p>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade-in space-y-3">
                                <div>
                                    <h2 className="text-md font-black text-slate-900 leading-none uppercase mb-1">Logic Mode</h2>
                                    <p className="text-[10px] text-slate-500 leading-snug font-medium">
                                        Choose a mode to optimize the UI for your specific use-case.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {[
                                        { id: 'kiosk', icon: <Tablet size={16}/>, label: 'Kiosk', desc: 'Interactive with idle screensaver' },
                                        { id: 'mobile', icon: <Smartphone size={16}/>, label: 'Handheld', desc: 'Staff tool, no screensaver' },
                                        { id: 'tv', icon: <Tv size={16}/>, label: 'Media Wall', desc: 'Auto-looping video player' }
                                    ].map(type => (
                                        <button 
                                            key={type.id}
                                            onClick={() => setDeviceType(type.id as any)}
                                            className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-3 text-left group ${deviceType === type.id ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                                        >
                                            <div className={`p-1.5 rounded-lg transition-colors ${deviceType === type.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                                                {type.icon}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className={`font-black uppercase text-[9px] leading-none mb-0.5 ${deviceType === type.id ? 'text-blue-600' : 'text-slate-900'}`}>{type.label}</div>
                                                <div className="text-[8px] font-bold text-slate-400 leading-tight truncate">{type.desc}</div>
                                            </div>
                                            {deviceType === type.id && <CheckCircle2 size={14} className="text-blue-600 shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-fade-in space-y-4 pt-2">
                                <div className="text-center">
                                    <h2 className="text-md font-black text-slate-900 leading-none uppercase mb-1">Authorization</h2>
                                    <p className="text-[10px] text-slate-500 leading-snug font-medium">
                                        Enter the global PIN found in Admin Settings to activate.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <div className="max-w-[150px] mx-auto">
                                        <input 
                                            autoFocus
                                            type="password"
                                            maxLength={8}
                                            className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-mono font-black text-xl text-center tracking-[0.4em] text-slate-900 shadow-inner"
                                            placeholder="••••"
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                        />
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Network Access Required</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-3 p-2 bg-red-50 text-red-600 rounded-lg text-[9px] font-bold uppercase flex items-center gap-2 border border-red-100 animate-pulse">
                            <ShieldCheck size={12} /> {error}
                        </div>
                    )}

                    <div className="mt-6 flex gap-2">
                        {step > 1 && (
                            <button 
                                onClick={() => setStep(step - 1)} 
                                className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Back
                            </button>
                        )}
                        <button 
                            onClick={handleNext}
                            disabled={isProcessing}
                            className={`flex-1 p-3 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 ${step === 3 ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
                        >
                            {isProcessing ? (
                                <><Loader2 className="animate-spin" size={12} /> Syncing...</>
                            ) : (
                                <>{step === 3 ? 'Complete' : 'Continue'} <ChevronRight size={12} /></>
                            )}
                        </button>
                    </div>
                </div>
                
                <div className="bg-slate-50 border-t border-slate-100 p-3 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-1.5">
                        <Signal size={10} className="text-green-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Network Ready</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Activity size={10} className="text-blue-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">v1.0.5 Patch</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ManualPricelistViewer = ({ pricelist, onClose, companyLogo, brandLogo }: { pricelist: Pricelist, onClose: () => void, companyLogo?: string, brandLogo?: string }) => {
  const isNewlyUpdated = isRecent(pricelist.dateAdded);
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return pricelist.items || [];
    const q = searchQuery.toLowerCase();
    return (pricelist.items || []).filter(item => 
      item.sku.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q)
    );
  }, [pricelist.items, searchQuery]);
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-8 animate-fade-in print:bg-white print:p-0 print:block" onClick={onClose}>
      <style>{`
        @media print {
          @page { size: auto; margin: 10mm; }
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            margin: 0 !important; 
            padding: 0 !important;
            font-family: 'Inter', sans-serif !important;
          }
          .print-hidden { display: none !important; }
          .print-only { display: block !important; }
          .viewer-container { 
            position: relative !important; 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            max-width: none !important; 
            margin: 0 !important; 
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            top: 0 !important;
            transform: none !important;
            outline: none !important;
          }
          .table-scroll { overflow: visible !important; height: auto !important; padding: 0 !important; }
          .spreadsheet-table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            margin-top: 10px !important;
            border: none !important;
          }
          .spreadsheet-table th { 
            background: #f1f5f9 !important; 
            color: #0f172a !important; 
            border: 1px solid #cbd5e1 !important; 
            font-weight: 900 !important;
            text-transform: uppercase !important;
            padding: 10px !important;
            font-size: 11px !important;
            text-align: left !important;
          }
          .spreadsheet-table td { 
            border: 1px solid #e2e8f0 !important; 
            color: #1e293b !important; 
            padding: 8px 10px !important;
            font-weight: 600 !important;
            font-size: 11px !important;
          }
          .spreadsheet-table tr:nth-child(even) { background-color: #f8fafc !important; }
          .promo-text { color: #dc2626 !important; font-weight: 900 !important; }
        }
        
        .spreadsheet-table {
          border-collapse: separate;
          border-spacing: 0;
          table-layout: auto;
        }
        .spreadsheet-table th {
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: #f8fafc;
          color: #475569;
          box-shadow: inset 0 -1px 0 #e2e8f0;
        }
        .excel-row:nth-child(even) {
          background-color: #f8fafc;
        }
        .excel-row:hover {
          background-color: #f1f5f9;
        }
        .sku-font { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        
        /* Column shrink logic */
        .col-code { width: 1%; white-space: nowrap; }
        .col-group { width: auto; }
        .col-price { width: 1%; white-space: nowrap; text-align: right; }
      `}</style>

      <div className={`viewer-container relative w-full h-full md:h-auto md:max-w-7xl bg-white md:rounded-3xl shadow-2xl overflow-hidden md:max-h-full flex flex-col transition-all print:rounded-none print:shadow-none print:max-h-none print:border-none print:ring-0 ${isNewlyUpdated ? 'ring-4 ring-yellow-400 md:ring-4 print:ring-0' : ''}`} onClick={e => e.stopPropagation()}>
        
        <div className={`print-hidden p-3 md:p-6 text-white flex flex-col md:flex-row justify-between items-center shrink-0 border-b border-white/5 gap-4 ${isNewlyUpdated ? 'bg-yellow-600 shadow-yellow-600/20' : 'bg-slate-900 shadow-xl'}`}>
          <div className="flex items-center gap-2 md:gap-5 w-full md:w-auto">
             <div className="bg-white p-1 md:p-2 rounded-lg md:rounded-2xl shadow-xl flex items-center justify-center shrink-0 w-8 h-8 md:w-16 md:h-16 overflow-hidden">
                {brandLogo ? (
                    <img src={brandLogo} alt="Brand Logo" className="w-full h-full object-contain" />
                ) : (
                    <RIcon size={20} className={isNewlyUpdated ? 'text-yellow-600' : 'text-green-600'} />
                )}
             </div>
             <div className="min-w-0">
                <div className="flex items-center gap-1.5 md:gap-3 flex-wrap">
                  <h2 className="text-xs md:text-2xl font-black uppercase tracking-tight truncate max-w-[120px] md:max-w-none">{pricelist.title}</h2>
                  {isNewlyUpdated && <span className="bg-white text-yellow-700 px-1.5 py-0.5 rounded-full text-[6px] md:text-[10px] font-black uppercase flex items-center gap-1 shadow-lg shrink-0 animate-pulse"><Sparkles size={8} /> NEW</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <p className={`${isNewlyUpdated ? 'text-yellow-100' : 'text-slate-400'} font-bold uppercase tracking-widest text-[7px] md:text-xs`}>{pricelist.month} {pricelist.year}</p>
                   <div className={`w-0.5 h-0.5 rounded-full ${isNewlyUpdated ? 'bg-yellow-200' : 'bg-slate-700'}`}></div>
                   <p className={`${isNewlyUpdated ? 'text-yellow-100' : 'text-slate-400'} font-bold uppercase tracking-widest text-[7px] md:text-xs`}>Sheet</p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1 border border-white/10">
                  <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-1 hover:bg-white/10 rounded text-white" title="Zoom Out"><ZoomOut size={16} /></button>
                  <span className="text-[10px] font-black w-8 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-1 hover:bg-white/10 rounded text-white" title="Zoom In"><ZoomIn size={16} /></button>
                  <button onClick={() => setZoom(1)} className="p-1 hover:bg-white/10 rounded text-white ml-1 border-l border-white/10" title="Reset"><Maximize size={16} /></button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 md:flex-none md:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50" size={12} />
                  <input 
                      type="text" 
                      placeholder="Search SKU..." 
                      className="w-full bg-white/10 border-white/20 border rounded-lg pl-8 pr-3 py-1.5 text-[10px] md:text-xs font-bold text-white outline-none focus:bg-white/20 focus:border-blue-500 transition-all placeholder:text-white/30 uppercase"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"><X size={10} /></button>}
              </div>

              <div className="flex items-center gap-1.5 md:gap-3">
                 <button 
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 bg-white text-slate-900 px-2.5 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl font-black text-[7px] md:text-xs uppercase shadow-lg hover:bg-blue-50 transition-all active:scale-95 group shrink-0"
                 >
                    <Printer size={12} className="group-hover:scale-110 transition-transform md:size-[16px]" /> <span className="hidden sm:inline">Print List</span>
                 </button>
                 <button onClick={onClose} className="p-1.5 md:p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/5"><X size={16} className="md:size-[20px]"/></button>
              </div>
          </div>
        </div>

        <div className="hidden print-only w-full px-8 pt-6 pb-2">
            <div className="flex items-center justify-between gap-6">
                <div className="w-1/4 flex justify-start">
                    {companyLogo ? (
                        <img src={companyLogo} alt="Company Logo" className="h-16 md:h-24 object-contain" />
                    ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-300">
                             <Store size={24} className="text-slate-400" />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center border-x border-slate-100 px-4">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none mb-1">{pricelist.title}</h1>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">{pricelist.month} {pricelist.year}</span>
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ADMIN AUTHORIZED</span>
                    </div>
                    <div className="mt-2 inline-block bg-slate-900 text-white px-3 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                         OFFICIAL PRICELIST
                    </div>
                </div>

                <div className="w-1/4 flex justify-end">
                    {brandLogo ? (
                        <img src={brandLogo} alt="Brand Logo" className="h-16 md:h-24 object-contain" />
                    ) : (
                        <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 border-dashed">
                             <RIcon size={24} className="text-slate-200" />
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 mb-4 h-0.5 w-full bg-slate-900"></div>
            <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                <span>Code / SKU</span>
                <span>Product Description</span>
                <span>Retail Pricing</span>
            </div>
        </div>

        <div className="table-scroll flex-1 overflow-auto bg-white p-0 md:p-4 print:px-8 print:py-0">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%` }} className="transition-transform duration-200">
            <table className="spreadsheet-table w-full text-left border-collapse">
              <thead>
                <tr className="print:bg-[#f1f5f9]">
                  <th className="p-2 md:p-4 text-[7px] md:text-[14px] font-black uppercase tracking-tight border border-slate-200 col-code print:border-slate-300">CODE</th>
                  <th className="p-2 md:p-4 text-[7px] md:text-[14px] font-black uppercase tracking-tight border border-slate-200 col-group print:border-slate-300">PRODUCT GROUP</th>
                  <th className="p-2 md:p-4 text-[7px] md:text-[14px] font-black uppercase tracking-tight border border-slate-200 col-price print:border-slate-300">NORMAL</th>
                  <th className="p-2 md:p-4 text-[7px] md:text-[14px] font-black uppercase tracking-tight border border-slate-200 col-price print:border-slate-300">PROMO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="excel-row transition-colors group print:break-inside-avoid">
                    <td className="p-1.5 md:p-3 border border-slate-200 print:border-slate-200 col-code">
                      <span className="sku-font font-bold text-[7px] md:text-sm text-slate-900 uppercase tracking-tighter">
                        {item.sku || '—'}
                      </span>
                    </td>
                    <td className="p-1.5 md:p-3 border border-slate-200 print:border-slate-200 col-group min-w-0">
                      <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-[8px] md:text-sm uppercase tracking-tighter leading-none line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {item.description}
                          </span>
                      </div>
                    </td>
                    <td className="p-1.5 md:p-3 border border-slate-200 print:border-slate-200 col-price">
                      <span className="font-black text-[8px] md:text-base tracking-tighter text-slate-900">
                        {item.normalPrice || 'POA'}
                      </span>
                    </td>
                    <td className="p-1.5 md:p-3 border border-slate-200 print:border-slate-200 col-price bg-slate-50/10">
                      {item.promoPrice ? (
                         <span className="promo-text font-black text-[9px] md:text-xl text-red-600 tracking-tighter">
                             {item.promoPrice}
                         </span>
                      ) : (
                         <span className="font-bold text-[8px] md:text-base text-slate-300 tracking-tighter">
                             —
                         </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 md:py-24 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-300">
                          <FileText size={40} className="opacity-10 md:size-[64px]" />
                          <span className="font-black uppercase tracking-[0.3em] text-[7px] md:text-xs">No Items Matches</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-2 md:p-5 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 shrink-0 print:border-none print:bg-white print:px-8">
          <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[6px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Total: {filteredItems.length} {searchQuery ? '(Filtered)' : ''}</span>
              </div>
          </div>
          <p className="text-[6px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-right leading-tight print:hidden">
            Document generated for viewing purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export const CreatorPopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose}>
    <div className="relative w-full max-w-xs md:max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/5] flex flex-col items-center justify-center text-center p-6 bg-slate-900" onClick={e => e.stopPropagation()}>
      <div className="absolute inset-0 bg-[url('https://i.ibb.co/dsh2c2hp/unnamed.jpg')] bg-cover bg-center opacity-30"></div>
      <div className="relative z-10">
        <img src="https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-4" />
        <h2 className="text-white font-black text-2xl mb-1">JSTYP.me</h2>
        <p className="text-white/70 text-xs italic mb-8">Digital Retail Specialist</p>
        <div className="flex gap-4 justify-center">
           <a href="https://wa.me/27695989427" target="_blank" className="bg-green-600 p-3 rounded-full"><img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" className="w-6 h-6" /></a>
           <a href="mailto:jstypme@gmail.com" className="bg-white p-3 rounded-full"><img src="https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png" className="w-6 h-6" /></a>
        </div>
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20} /></button>
    </div>
  </div>
);

const ComparisonModal = ({ products, onClose, onShowDetail }: { products: Product[], onClose: () => void, onShowDetail: (p: Product) => void }) => {
    const specKeys = useMemo(() => {
        const keys = new Set<string>();
        products.forEach(p => Object.keys(p.specs).forEach(k => keys.add(k)));
        return Array.from(keys).sort();
    }, [products]);

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-fade-in p-2 md:p-12" onClick={onClose}>
            <div className="relative w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-slate-900 flex items-center gap-3">
                            <Layers className="text-blue-600" /> Product Comparison
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase">Side-by-side Technical Analysis</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-x-auto overflow-y-auto">
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead className="sticky top-0 z-20 bg-white shadow-sm">
                            <tr>
                                <th className="p-6 bg-slate-50 w-64 border-r border-slate-100 shrink-0"></th>
                                {products.map(p => (
                                    <th key={p.id} className="p-6 border-r border-slate-100 text-center min-w-[300px]">
                                        <div className="flex flex-col items-center">
                                            <div className="w-40 h-40 bg-white p-2 rounded-2xl mb-4 flex items-center justify-center shadow-sm border border-slate-100">
                                                {p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-200" />}
                                            </div>
                                            <h3 className="font-black text-lg text-slate-900 uppercase leading-tight mb-1">{p.name}</h3>
                                            <div className="text-[10px] font-mono font-bold text-slate-400 mb-4">{p.sku || 'NO SKU'}</div>
                                            <button onClick={() => { onShowDetail(p); onClose(); }} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">View Details</button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50/50">
                                <td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">Description</td>
                                {products.map(p => (
                                    <td key={p.id} className="p-6 text-sm font-medium text-slate-600 leading-relaxed italic border-r border-slate-100">
                                        {p.description ? p.description.substring(0, 150) + '...' : 'No description provided.'}
                                    </td>
                                ))}
                            </tr>
                            
                            {specKeys.map(key => (
                                <tr key={key} className="hover:bg-slate-50/50">
                                    <td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">{key}</td>
                                    {products.map(p => (
                                        <td key={p.id} className="p-6 text-sm font-black text-slate-900 border-r border-slate-100">
                                            {p.specs[key] || <span className="text-slate-200">—</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            <tr className="hover:bg-slate-50/50">
                                <td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">Key Features</td>
                                {products.map(p => (
                                    <td key={p.id} className="p-6 border-r border-slate-100">
                                        <ul className="space-y-2">
                                            {p.features.slice(0, 5).map((f, i) => (
                                                <li key={i} className="flex items-start gap-2 text-[11px] font-bold text-slate-700">
                                                    <Check size={12} className="text-green-500 shrink-0 mt-0.5" /> {f}
                                                </li>
                                            ))}
                                            {p.features.length > 5 && <li className="text-[10px] font-black text-blue-500 uppercase tracking-widest pl-5">+{p.features.length - 5} more</li>}
                                        </ul>
                                    </td>
                                ))}
                            </tr>

                            <tr className="hover:bg-slate-50/50">
                                <td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">Video Content</td>
                                {products.map(p => (
                                    <td key={p.id} className="p-6 border-r border-slate-100 text-center">
                                        {(p.videoUrl || (p.videoUrls && p.videoUrls.length > 0)) ? (
                                            <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-full font-black text-[10px] uppercase">
                                                <Video size={14} /> Available
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 font-bold uppercase text-[10px]">None</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-slate-50 text-center shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Technical specification data provided by brand manufacturer guidelines</p>
                </div>
            </div>
        </div>
    );
};

const SearchModal = ({ storeData, onClose, onSelectProduct }: { storeData: StoreData, onClose: () => void, onSelectProduct: (p: Product) => void }) => {
    const [query, setQuery] = useState('');
    const [filterBrand, setFilterBrand] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterHasVideo, setFilterHasVideo] = useState(false);

    const allFlattenedProducts = useMemo(() => {
        return storeData.brands.flatMap(b => 
            b.categories.flatMap(c => 
                c.products.map(p => ({
                    ...p,
                    brandName: b.name,
                    brandId: b.id,
                    categoryName: c.name,
                    categoryId: c.id
                }))
            )
        );
    }, [storeData]);

    const results = useMemo(() => {
        const lower = query.toLowerCase().trim();
        return allFlattenedProducts.filter(p => {
            const matchesQuery = !lower || 
                p.name.toLowerCase().includes(lower) || 
                (p.sku && p.sku.toLowerCase().includes(lower)) ||
                p.description.toLowerCase().includes(lower);
            
            const matchesBrand = filterBrand === 'all' || p.brandId === filterBrand;
            const matchesCat = filterCategory === 'all' || p.categoryName === filterCategory;
            const matchesVideo = !filterHasVideo || (p.videoUrl || (p.videoUrls && p.videoUrls.length > 0));

            return matchesQuery && matchesBrand && matchesCat && matchesVideo;
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [query, filterBrand, filterCategory, filterHasVideo, allFlattenedProducts]);

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-fade-in" onClick={onClose}>
            <div className="p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col h-full" onClick={e => e.stopPropagation()}>
                <div className="shrink-0 mb-8">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-8 h-8 group-focus-within:scale-110 transition-transform" />
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Find any product, SKU, or feature..." 
                            className="w-full bg-white/10 text-white placeholder:text-slate-500 text-3xl md:text-5xl font-black uppercase tracking-tight py-6 pl-20 pr-20 border-b-4 border-white/10 outline-none focus:border-blue-500 transition-all rounded-t-3xl"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-2">
                            <X size={40} />
                        </button>
                    </div>
                </div>

                <div className="shrink-0 flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                        <div className="p-2 bg-blue-600 rounded-lg text-white"><Filter size={16} /></div>
                        <select 
                            value={filterBrand} 
                            onChange={e => setFilterBrand(e.target.value)}
                            className="bg-transparent text-white font-black uppercase text-xs outline-none cursor-pointer pr-4"
                        >
                            <option value="all" className="bg-slate-900">All Brands</option>
                            {storeData.brands.map(b => <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                        <div className="p-2 bg-purple-600 rounded-lg text-white"><LayoutGrid size={16} /></div>
                        <select 
                            value={filterCategory} 
                            onChange={e => setFilterCategory(e.target.value)}
                            className="bg-transparent text-white font-black uppercase text-xs outline-none cursor-pointer pr-4"
                        >
                            <option value="all" className="bg-slate-900">All Categories</option>
                            {Array.from(new Set(allFlattenedProducts.map(p => p.categoryName))).sort().map(c => (
                                <option key={c} value={c} className="bg-slate-900">{c}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={() => setFilterHasVideo(!filterHasVideo)}
                        className={`flex items-center gap-3 p-2 rounded-2xl border transition-all ${filterHasVideo ? 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-600/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                    >
                        <div className={`p-2 rounded-lg ${filterHasVideo ? 'bg-white/20' : 'bg-slate-800'}`}><Video size={16} /></div>
                        <span className="font-black uppercase text-xs pr-2">Has Video</span>
                    </button>

                    <div className="ml-auto flex items-center text-slate-500 font-black uppercase text-xs tracking-widest gap-2">
                        <Sparkles size={16} className="text-yellow-500" /> {results.length} Matches
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                    {results.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {results.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => { onSelectProduct(p); onClose(); }}
                                    className="group bg-white rounded-3xl overflow-hidden flex flex-col text-left transition-all hover:scale-105 active:scale-95 shadow-xl border-4 border-transparent hover:border-blue-500"
                                >
                                    <div className="aspect-square bg-white relative flex items-center justify-center p-4">
                                        {p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-100" />}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                                            <span className="bg-slate-900 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">{p.brandName}</span>
                                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">{p.categoryName}</span>
                                        </div>
                                        {(p.videoUrl || (p.videoUrls && p.videoUrls.length > 0)) && (
                                            <div className="absolute bottom-3 right-3 text-blue-500"><Video size={16} strokeWidth={3} /></div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-slate-50/50 flex-1 flex flex-col">
                                        <h4 className="font-black text-slate-900 uppercase text-xs leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{p.name}</h4>
                                        <div className="mt-auto text-[9px] font-mono font-bold text-slate-400">{p.sku || 'N/A'}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                             <Search size={80} className="mb-6 opacity-10" />
                             <p className="text-2xl font-black uppercase tracking-widest opacity-30">No matches found</p>
                             <button onClick={() => { setQuery(''); setFilterBrand('all'); setFilterCategory('all'); setFilterHasVideo(false); }} className="mt-4 text-blue-500 font-black uppercase text-xs hover:underline">Clear all filters</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const KioskApp = ({ storeData, lastSyncTime, onSyncRequest }: { storeData: StoreData | null, lastSyncTime?: string, onSyncRequest?: () => void }) => {
  const [isSetup, setIsSetup] = useState(isKioskConfigured());
  const [kioskId, setKioskId] = useState(getKioskId());
  
  const myFleetEntry = useMemo(() => storeData?.fleet?.find(f => f.id === kioskId), [storeData?.fleet, kioskId]);
  
  const currentShopName = myFleetEntry?.name || getShopName() || "New Device";
  const deviceType = myFleetEntry?.deviceType || getDeviceType() || 'kiosk';

  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const [screensaverEnabled, setScreensaverEnabled] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [showPricelistModal, setShowPricelistModal] = useState(false);
  const [showFlipbook, setShowFlipbook] = useState(false);
  const [flipbookPages, setFlipbookPages] = useState<string[]>([]);
  const [flipbookTitle, setFlipbookTitle] = useState<string | undefined>(undefined); 
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [viewingManualList, setViewingManualList] = useState<Pricelist | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedBrandForPricelist, setSelectedBrandForPricelist] = useState<string | null>(null);
  
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [compareProductIds, setCompareProductIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const timerRef = useRef<number | null>(null);
  const idleTimeout = (storeData?.screensaverSettings?.idleTimeout || 60) * 1000;

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (screensaverEnabled && deviceType === 'kiosk' && isSetup) {
      timerRef.current = window.setTimeout(() => {
        setIsIdle(true);
        setActiveProduct(null);
        setActiveCategory(null);
        setActiveBrand(null);
        setShowFlipbook(false);
        setViewingPdf(null);
        setViewingManualList(null);
        setShowPricelistModal(false);
        setShowGlobalSearch(false);
        setShowCompareModal(false);
        setCompareProductIds([]);
      }, idleTimeout);
    }
  }, [screensaverEnabled, idleTimeout, deviceType, isSetup]);

  const resetDeviceIdentity = useCallback(() => {
      localStorage.clear();
      window.location.reload();
  }, []);

  useEffect(() => {
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    checkCloudConnection().then(setIsCloudConnected);
    
    if (isSetup) {
      const syncCycle = async () => {
         const syncResult = await sendHeartbeat();
         if (syncResult?.deleted) {
             resetDeviceIdentity();
         } else if (syncResult?.restart) {
             window.location.reload();
         }
      };
      syncCycle();
      const interval = setInterval(syncCycle, 30000); 
      return () => { clearInterval(interval); clearInterval(clockInterval); };
    }
    return () => { clearInterval(clockInterval); };
  }, [resetIdleTimer, isSetup, resetDeviceIdentity]);

  const filteredCatalogs = useMemo(() => {
      if(!storeData?.catalogues) return [];
      const now = new Date();
      return storeData.catalogues.filter(c => !c.endDate || new Date(c.endDate) >= now);
  }, [storeData?.catalogues]);

  const allProductsFlat = useMemo(() => {
      if (!storeData?.brands) return [];
      return storeData.brands.flatMap(b => (b.categories || []).flatMap(c => (c.products || []).map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct))));
  }, [storeData?.brands]);
  
  const pricelistBrands = useMemo(() => {
      return (storeData?.pricelistBrands || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [storeData?.pricelistBrands]);

  const toggleCompareProduct = (product: Product) => {
    setCompareProductIds(prev => 
        prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id].slice(-5) 
    );
  };

  const productsToCompare = useMemo(() => {
    return allProductsFlat.filter(p => compareProductIds.includes(p.id));
  }, [allProductsFlat, compareProductIds]);

  if (!storeData) return null;

  if (!isSetup) {
      return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  }

  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;

  const getActiveBrandLogo = () => {
      if (!viewingManualList) return undefined;
      return pricelistBrands.find(b => b.id === viewingManualList.brandId)?.logoUrl;
  };

  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProductsFlat} ads={storeData.ads?.screensaver || []} pamphlets={filteredCatalogs} onWake={resetIdleTimer} settings={storeData.screensaverSettings} />}
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md print:hidden">
           <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
               {storeData.companyLogoUrl ? <img src={storeData.companyLogoUrl} className="h-4 md:h-6 object-contain" alt="" /> : <Store size={16} className="text-blue-500" />}
               <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-bold text-slate-300">
                  {deviceType === 'mobile' ? <Smartphone size={10} className="text-purple-500" /> : <ShieldCheck size={10} className="text-blue-500" />}
                  <span className="font-mono text-white tracking-wider truncate max-w-[60px]">{kioskId}</span>
               </div>
               <button 
                  onClick={() => setShowGlobalSearch(true)}
                  className="bg-white/10 hover:bg-blue-600 transition-colors px-2 py-1 rounded-md flex items-center gap-1.5 md:ml-4 group"
               >
                   <Search size={12} className="text-blue-400 group-hover:text-white" />
                   <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest hidden md:inline">Universal Search</span>
               </button>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
                <div className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}>
                    {isCloudConnected ? <Cloud size={8} /> : <HardDrive size={8} />}
                    <span className="text-[7px] md:text-[9px] font-black uppercase hidden sm:inline">{isCloudConnected ? getCloudProjectName() : 'Offline'}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700 pl-2">
                    {deviceType === 'kiosk' && <button onClick={() => setScreensaverEnabled(!screensaverEnabled)} className={`p-1 rounded ${screensaverEnabled ? 'text-green-400 bg-green-900/30' : 'text-slate-500 bg-slate-800'}`}>{screensaverEnabled ? <MonitorPlay size={12} /> : <MonitorStop size={12} />}</button>}
                    <button onClick={() => setZoomLevel(zoomLevel === 1 ? 0.75 : 1)} className={`p-1 rounded flex items-center gap-1 text-[8px] md:text-[10px] font-bold transition-colors ${zoomLevel === 1 ? 'text-blue-400 bg-blue-900/30' : 'text-purple-400 bg-purple-900/30'}`}><ZoomOut size={12} /></button>
                </div>
           </div>
       </header>
       <div className="flex-1 relative flex flex-col min-h-0 print:overflow-visible" style={{ zoom: zoomLevel }}>
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={filteredCatalogs} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={filteredCatalogs} onSelectCategory={setActiveCategory} onViewCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={filteredCatalogs} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} selectedForCompare={compareProductIds} onToggleCompare={toggleCompareProduct} onStartCompare={() => setShowCompareModal(true)} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} />}
       </div>
       <footer className="shrink-0 bg-white border-t border-slate-200 text-slate-500 h-8 flex items-center justify-between px-2 md:px-6 z-50 text-[8px] md:text-[10px] print:hidden">
          <div className="flex items-center gap-1"><div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold uppercase">{isOnline ? 'Connected' : 'Offline'}</span></div>
          <div className="flex items-center gap-4">
              <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter hidden md:inline">{currentShopName}</span>
              {pricelistBrands.length > 0 && <button onClick={() => { setSelectedBrandForPricelist(pricelistBrands[0]?.id || null); setShowPricelistModal(true); }} className="text-blue-600 hover:text-blue-800"><RIcon size={12} /></button>}
              {lastSyncTime && <div className="flex items-center gap-1 font-bold"><RefreshCw size={8} /><span>{lastSyncTime}</span></div>}
              <button onClick={() => setShowCreator(true)} className="flex items-center gap-1 font-black uppercase tracking-widest"><span>JSTYP</span></button>
          </div>
       </footer>
       <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />
       
       {showGlobalSearch && <SearchModal storeData={storeData} onSelectProduct={(p) => { setActiveBrand(storeData.brands.find(b => b.id === (p as any).brandId)!); setActiveCategory(storeData.brands.find(b => b.id === (p as any).brandId)!.categories.find(c => c.id === (p as any).categoryId)!); setActiveProduct(p); }} onClose={() => setShowGlobalSearch(false)} />}
       
       {showCompareModal && <ComparisonModal products={productsToCompare} onClose={() => setShowCompareModal(false)} onShowDetail={setActiveProduct} />}

       {showPricelistModal && (
           <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-4 animate-fade-in print:hidden" onClick={() => setShowPricelistModal(false)}>
               <div className="relative w-full h-full md:h-auto md:max-w-5xl bg-white md:rounded-2xl shadow-2xl overflow-hidden md:max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                   <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                      <h2 className="text-base md:text-xl font-black uppercase text-slate-900 flex items-center gap-2"><RIcon size={24} className="text-green-600" /> Pricelists</h2>
                      <button onClick={() => setShowPricelistModal(false)} className="p-2 rounded-full transition-colors hover:bg-slate-200"><X size={24} className="text-slate-500" /></button>
                   </div>

                   <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                       <div className="shrink-0 w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden flex flex-col">
                           <div className="md:hidden">
                               <div className="p-2 bg-slate-100/50 border-b border-slate-200 flex items-center justify-between">
                                   <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest px-2">Select Brand Channel</span>
                                   <div className="flex gap-1 pr-2">
                                       <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                       <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                       <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                   </div>
                               </div>
                               <div className="overflow-x-auto no-scrollbar py-2">
                                   <div className="grid grid-rows-2 grid-flow-col gap-2 px-2 min-w-max">
                                       {pricelistBrands.map(brand => (
                                           <button 
                                               key={brand.id} 
                                               onClick={() => setSelectedBrandForPricelist(brand.id)} 
                                               className={`flex items-center gap-2 p-2 rounded-xl border transition-all min-w-[120px] ${selectedBrandForPricelist === brand.id ? 'bg-white border-green-500 shadow-sm ring-1 ring-green-500/20' : 'bg-slate-100 border-transparent hover:bg-white'}`}
                                           >
                                               <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                                  {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-[10px]">{brand.name.charAt(0)}</span>}
                                               </div>
                                               <span className={`font-black text-[9px] uppercase leading-tight truncate flex-1 text-left ${selectedBrandForPricelist === brand.id ? 'text-green-600' : 'text-slate-500'}`}>{brand.name}</span>
                                           </button>
                                       ))}
                                   </div>
                               </div>
                           </div>

                           <div className="hidden md:flex flex-1 flex-col overflow-y-auto no-scrollbar">
                               {pricelistBrands.map(brand => (
                                   <button key={brand.id} onClick={() => setSelectedBrandForPricelist(brand.id)} className={`w-full text-left p-4 transition-colors flex items-center gap-3 border-b border-slate-100 ${selectedBrandForPricelist === brand.id ? 'bg-white border-l-4 border-green-500' : 'hover:bg-white'}`}>
                                       <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                          {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm">{brand.name.charAt(0)}</span>}
                                       </div>
                                       <span className={`font-black text-sm uppercase leading-tight ${selectedBrandForPricelist === brand.id ? 'text-green-600' : 'text-slate-400'}`}>{brand.name}</span>
                                   </button>
                               ))}
                           </div>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/50 relative">
                           {selectedBrandForPricelist ? (
                               <div className="animate-fade-in">
                                   <div className="mb-4 flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                           <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                                           <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Available Pricelists</h3>
                                       </div>
                                       <span className="text-[8px] font-bold text-slate-400 uppercase bg-white px-2 py-1 rounded shadow-xs border border-slate-100">
                                           {storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).length} Documents
                                       </span>
                                   </div>
                                   <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                       {storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).map(pl => (
                                           <button 
                                                key={pl.id} 
                                                onClick={() => { if(pl.type === 'manual') setViewingManualList(pl); else setViewingPdf({url: pl.url, title: pl.title}); }} 
                                                className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border-2 flex flex-col h-full relative transition-all active:scale-95 ${isRecent(pl.dateAdded) ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-white hover:border-green-400'}`}
                                            >
                                                <div className="aspect-[3/4] bg-slate-50 relative p-2 md:p-3 overflow-hidden">
                                                    {pl.thumbnailUrl ? (
                                                        <img src={pl.thumbnailUrl} className="w-full h-full object-contain rounded shadow-sm group-hover:scale-105 transition-transform" /> 
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                                            {pl.type === 'manual' ? <List size={32}/> : <FileText size={32} />}
                                                        </div>
                                                    )}
                                                    <div className={`absolute top-2 right-2 text-white text-[7px] md:text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm z-10 ${pl.type === 'manual' ? 'bg-blue-600' : 'bg-red-500'}`}>
                                                        {pl.type === 'manual' ? 'TABLE' : 'PDF'}
                                                    </div>
                                                    {isRecent(pl.dateAdded) && (
                                                        <div className="absolute bottom-2 left-2 bg-yellow-400 text-yellow-900 text-[6px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm uppercase animate-pulse">
                                                            <Sparkles size={8} /> New
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3 flex-1 flex flex-col justify-between bg-white">
                                                    <h3 className="font-black text-slate-900 text-[10px] md:text-sm uppercase leading-tight line-clamp-2 group-hover:text-green-600 transition-colors mb-2">{pl.title}</h3>
                                                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                                       <div className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">{pl.month} {pl.year}</div>
                                                       <div className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={14} /></div>
                                                    </div>
                                                </div>
                                           </button>
                                       ))}
                                   </div>
                               </div>
                           ) : (
                               <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                                   <div className="relative">
                                       <RIcon size={64} className="opacity-10" />
                                       <Search className="absolute -bottom-2 -right-2 text-slate-200" size={24} />
                                   </div>
                                   <div className="text-center">
                                       <p className="uppercase font-black text-xs tracking-[0.3em] opacity-40">Awaiting Channel</p>
                                       <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Select a brand from the {window.innerWidth < 768 ? 'top rows' : 'sidebar'} to view listings</p>
                                   </div>
                               </div>
                           )}
                       </div>
                   </div>
               </div>
           </div>
       )}
       {showFlipbook && <Flipbook pages={flipbookPages} onClose={() => setShowFlipbook(false)} catalogueTitle={flipbookTitle} />}
       {viewingPdf && <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}
       {viewingManualList && (
          <ManualPricelistViewer 
            pricelist={viewingManualList} 
            onClose={() => setViewingManualList(null)} 
            companyLogo={storeData.hero.logoUrl || storeData.companyLogoUrl}
            brandLogo={getActiveBrandLogo()}
          />
       )}
    </div>
  );
};
