
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StoreData, Brand, Category, Product, FlatProduct, Catalogue, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { 
  getKioskId, provisionKioskId, completeKioskSetup, isKioskConfigured, sendHeartbeat, 
  setCustomKioskId, getShopName, getDeviceType, supabase, checkCloudConnection, 
  initSupabase, getCloudProjectName, tryRecoverIdentity
} from '../services/kioskService';
import BrandGrid from './BrandGrid';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Screensaver from './Screensaver';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import TVMode from './TVMode';
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Maximize, FileDown, Grip } from 'lucide-react';
import { jsPDF } from 'jspdf';

const isRecent = (ds?: string) => { if (!ds) return false; const d = new Date(ds); return Math.abs(new Date().getTime() - d.getTime()) <= 30 * 24 * 3600 * 1000; };
const RIcon = ({ size = 24, className = "" }: any) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 5v14" /><path d="M7 5h5.5a4.5(4.5 0 0 1 0 9H7" /><path d="M11.5 14L17 19" /></svg>);

const SetupScreen = ({ storeData, onComplete }: any) => {
    const [step, setStep] = useState(1); const [shopName, setShopName] = useState(''); const [deviceType, setDeviceType] = useState<'kiosk'|'mobile'|'tv'>('kiosk'); const [pin, setPin] = useState(''); const [error, setError] = useState(''); const [proc, setProc] = useState(false);
    const handleNext = async () => {
        setError(''); if (step < 3) return setStep(step + 1);
        if (pin !== (storeData.systemSettings?.setupPin || '0000')) return setError('Invalid PIN');
        setProc(true); try { await provisionKioskId(); await completeKioskSetup(shopName.trim(), deviceType); onComplete(); } catch (e) { setError('Failed'); } finally { setProc(false); }
    };
    return (
        <div className="fixed inset-0 z-[300] bg-slate-900 flex items-center justify-center p-4"><div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in"><div className="bg-slate-900 text-white p-8 text-center relative"><div className="bg-blue-600 p-3 rounded-2xl shadow-xl mb-4 inline-block"><Store size={32} /></div><h1 className="text-2xl font-black uppercase mb-1">Provisioning</h1></div><div className="p-8">{step === 1 && (<div className="animate-fade-in"><h2 className="text-xl font-black mb-4">Location Name?</h2><input className="w-full p-4 bg-slate-50 border-2 rounded-xl outline-none focus:border-blue-500 font-bold uppercase" placeholder="e.g. Waterfront Mall" value={shopName} onChange={(e) => setShopName(e.target.value)} /></div>)}{step === 2 && (<div className="animate-fade-in"><h2 className="text-xl font-black mb-4">Device Type?</h2><div className="grid grid-cols-3 gap-3">{['kiosk', 'mobile', 'tv'].map(t => (<button key={t} onClick={() => setDeviceType(t as any)} className={`p-4 rounded-xl border-2 transition-all font-black uppercase text-[10px] ${deviceType === t ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-white border-slate-200'}`}>{t}</button>))}</div></div>)}{step === 3 && (<div className="animate-fade-in text-center"><h2 className="text-xl font-black mb-4">System PIN</h2><input type="password" maxLength={8} className="w-full p-4 bg-slate-50 border-2 rounded-xl text-center text-2xl font-mono" placeholder="****" value={pin} onChange={(e) => setPin(e.target.value)} /></div>)}{error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase">{error}</div>}<div className="mt-8 flex gap-3">{step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[10px]">Back</button>}<button onClick={handleNext} disabled={proc} className="flex-1 bg-slate-900 text-white p-4 rounded-xl font-black uppercase text-[10px] shadow-lg flex items-center justify-center gap-2">{proc ? <Loader2 className="animate-spin" /> : step === 3 ? 'Finish' : 'Next'}</button></div></div></div></div>
    );
};

const ManualPricelistViewer = ({ pricelist, onClose, companyLogo, brandLogo, brandName }: any) => {
  const isNewlyUpdated = isRecent(pricelist.dateAdded);
  const [zoom, setZoom] = useState(1); const [isExp, setIsExp] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const handleExportPDF = async (e: any) => {
    e.stopPropagation(); setIsExp(true);
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth(), pageHeight = doc.internal.pageSize.getHeight(), margin = 15, innerW = pageWidth - (margin * 2);
        const colW = { sku: 25, norm: 28, promo: 28 }; const descW = innerW - colW.sku - colW.norm - colW.promo;
        const anchors = { sku: margin + 2, desc: margin + colW.sku + 2, norm: margin + colW.sku + descW + colW.norm - 2, promo: margin + innerW - 2 };
        
        const loadImg = async (url: string) => {
            if (!url) return null;
            return new Promise<any>((res) => {
                const img = new Image(); img.crossOrigin = "anonymous";
                img.onload = () => { try { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d')?.drawImage(img,0,0); res({data: c.toDataURL('image/png'), w: img.width, h: img.height}); } catch(e){res(null);} };
                img.onerror = () => res(null); img.src = url;
            });
        };
        const [brandAsset, compAsset] = await Promise.all([loadImg(brandLogo), loadImg(companyLogo)]);
        const drawHeader = () => {
            let y = 15; if (brandAsset) { const h = 18; doc.addImage(brandAsset.data, 'PNG', margin, y, h * (brandAsset.w/brandAsset.h), h); }
            if (compAsset) { const h = 10; doc.addImage(compAsset.data, 'PNG', pageWidth-margin-(h*(compAsset.w/compAsset.h)), y, h*(compAsset.w/compAsset.h), h); }
            doc.setTextColor(0).setFontSize(18).setFont('helvetica', 'bold').text("PRICE LIST", margin, y + 25);
            doc.setFontSize(11).setTextColor(100).text(pricelist.title.toUpperCase(), margin, y + 31);
            doc.setFillColor(30,41,59).rect(pageWidth-margin-45, y+22, 45, 8, 'F');
            doc.setTextColor(255).setFontSize(9).text(`${pricelist.month} ${pricelist.year}`.toUpperCase(), pageWidth-margin-22.5, y+27, {align:'center'});
            doc.setDrawColor(200).setLineWidth(0.2).line(margin, y+38, pageWidth-margin, y+38);
            return y+48;
        };
        const drawTableHeader = (y: number) => {
            doc.setFillColor(100).rect(margin, y-7, innerW, 10, 'F').setTextColor(255).setFontSize(9).setFont('helvetica', 'bold');
            doc.text("SKU", anchors.sku, y); doc.text("DESCRIPTION", anchors.desc, y); doc.text("NORMAL", anchors.norm, y, {align:'right'}); doc.text("PROMO", anchors.promo, y, {align:'right'});
            return y+8;
        };
        let currY = drawHeader(); currY = drawTableHeader(currY);
        (pricelist.items || []).forEach((item: any, idx: number) => {
            const descLines = doc.splitTextToSize(item.description.toUpperCase(), descW - 4);
            const rowH = Math.max(9, descLines.length * 5);
            if (currY + rowH > pageHeight - 20) { doc.addPage(); currY = drawHeader(); currY = drawTableHeader(currY); }
            if (idx % 2 !== 0) { doc.setFillColor(250).rect(margin, currY-6, innerW, rowH, 'F'); }
            doc.setTextColor(50).setFont('helvetica', 'normal').setFontSize(8).text(item.sku || '', anchors.sku, currY);
            doc.setFont('helvetica', 'bold').setFontSize(8.5).text(descLines, anchors.desc, currY);
            doc.setFont('helvetica', 'normal').setTextColor(0).text(item.normalPrice || '', anchors.norm, currY, {align:'right'});
            if (item.promoPrice) doc.setTextColor(239, 68, 68).setFont('helvetica', 'bold').setFontSize(9.5).text(item.promoPrice, anchors.promo, currY, {align:'right'});
            else doc.text(item.normalPrice || '', anchors.promo, currY, {align:'right'});
            doc.setDrawColor(230).setLineWidth(0.1).line(margin, currY+rowH-6, pageWidth-margin, currY+rowH-6);
            currY += rowH;
        });
        doc.save(`${pricelist.title.replace(/\s/g, '_')}.pdf`);
    } catch(err) { alert("PDF Error"); } finally { setIsExp(false); }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 flex flex-col items-center justify-center p-0 md:p-8 animate-fade-in print:bg-white overflow-hidden" onClick={onClose}>
      <div className="relative w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-full flex flex-col print:block" onClick={e => e.stopPropagation()}>
        <div className="p-4 md:p-8 text-white flex justify-between items-center shrink-0 z-20 bg-[#c0810d]">
          <div className="flex items-center gap-6"><RIcon size={36} /><div className="flex flex-col"><div className="flex items-center gap-3"><h2 className="text-lg md:text-3xl font-black uppercase tracking-tight">{pricelist.title}</h2>{isNewlyUpdated && <span className="bg-white text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">NEW</span>}</div><p className="text-yellow-100 font-bold uppercase text-[10px]">{pricelist.month} {pricelist.year}</p></div></div>
          <div className="flex items-center gap-3 md:gap-6"><button onClick={handleExportPDF} disabled={isExp} className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-2xl hover:bg-black transition-all flex items-center gap-2">{isExp ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={22} />} <span>Save PDF</span></button><button onClick={onClose} className="p-3 bg-white/10 rounded-full"><X size={28}/></button></div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-auto bg-slate-100/50 p-4 md:p-12">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }} className="bg-white shadow-xl rounded-xl overflow-hidden max-w-full">
              <table className="w-full text-left border-collapse"><thead className="bg-[#71717a] text-white"><tr><th className="p-4 uppercase text-xs font-black">SKU</th><th className="p-4 uppercase text-xs font-black">Description</th><th className="p-4 uppercase text-xs font-black text-right">Normal</th><th className="p-4 uppercase text-xs font-black text-right">Promo</th></tr></thead><tbody>{(pricelist.items || []).map((item: any) => (<tr key={item.id} className="border-b hover:bg-slate-50 transition-colors"><td className="p-4 font-mono font-bold text-xs uppercase">{item.sku}</td><td className="p-4 font-black text-sm uppercase tracking-tight">{item.description}</td><td className="p-4 text-right font-bold text-slate-500">{item.normalPrice}</td><td className="p-4 text-right font-black text-red-600">{item.promoPrice || item.normalPrice}</td></tr>))}</tbody></table>
            </div>
        </div>
      </div>
    </div>
  );
};

export const KioskApp = ({ storeData, lastSyncTime, onSyncRequest }: any) => {
  const [isSetup, setIsSetup] = useState(isKioskConfigured());
  const [kId, setKId] = useState(getKioskId());
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const [screensaverEnabled, setScreensaverEnabled] = useState(true);
  const [showPricelistModal, setShowPricelistModal] = useState(false);
  const [viewingManualList, setViewingManualList] = useState<Pricelist | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [selectedBrandForPricelist, setSelectedBrandForPricelist] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const deviceType = getDeviceType();

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false); if (timerRef.current) clearTimeout(timerRef.current);
    if (screensaverEnabled && deviceType === 'kiosk' && isSetup) {
      timerRef.current = window.setTimeout(() => { setIsIdle(true); setActiveProduct(null); setActiveCategory(null); setActiveBrand(null); setViewingManualList(null); setShowPricelistModal(false); }, (storeData?.screensaverSettings?.idleTimeout || 60) * 1000);
    }
  }, [screensaverEnabled, deviceType, isSetup, storeData]);

  useEffect(() => {
    window.addEventListener('touchstart', resetIdleTimer); window.addEventListener('click', resetIdleTimer);
    checkCloudConnection().then(setIsCloudConnected);
    if (isSetup) {
      const cycle = async () => { const sr = await sendHeartbeat(); if (sr?.deleted) { localStorage.clear(); window.location.reload(); } else if (sr?.restart) { window.location.reload(); } };
      cycle(); const intv = setInterval(cycle, 30000); return () => { clearInterval(intv); };
    }
  }, [resetIdleTimer, isSetup]);

  const allFlat = useMemo(() => storeData?.brands?.flatMap((b: any) => b.categories.flatMap((c: any) => c.products.map((p: any) => ({...p, brandName: b.name})))) || [], [storeData]);
  const pBrands = useMemo(() => (storeData?.pricelistBrands || []).sort((a: any,b: any)=>a.name.localeCompare(b.name)), [storeData]);

  if (!storeData) return null;
  if (!isSetup) return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;
  
  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && <Screensaver products={allFlat} ads={storeData.ads?.screensaver || []} pamphlets={storeData.catalogues || []} onWake={resetIdleTimer} settings={storeData.screensaverSettings} />}
       <header className="shrink-0 h-12 bg-slate-900 text-white flex items-center justify-between px-4 z-50 shadow-md">
           <div className="flex items-center gap-4">{storeData.companyLogoUrl ? <img src={storeData.companyLogoUrl} className="h-6 object-contain" /> : <Store size={20} className="text-blue-500" />}</div>
           <div className="flex items-center gap-4">
               <button onClick={() => setScreensaverEnabled(!screensaverEnabled)} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase ${screensaverEnabled ? 'bg-green-900/40 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>{screensaverEnabled ? <MonitorPlay size={14} /> : <MonitorStop size={14} />} <span>{screensaverEnabled ? 'On' : 'Off'}</span></button>
               <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'}`}>{isCloudConnected ? <Cloud size={10} /> : <HardDrive size={10} />}</div>
           </div>
       </header>
       <div className="flex-1 relative flex flex-col min-h-0">
         {!activeBrand ? <BrandGrid brands={storeData.brands} heroConfig={storeData.hero} allCatalogs={storeData.catalogues} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={()=>{}} onExport={()=>{}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={()=>{}} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={storeData.catalogues} onSelectCategory={setActiveCategory} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={()=>{}} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={()=>{}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={()=>{}} selectedForCompare={[]} onToggleCompare={()=>{}} onStartCompare={()=>{}} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={()=>{}} />}
       </div>
       <footer className="shrink-0 bg-white border-t text-slate-500 h-10 flex items-center justify-between px-6 z-50 text-[10px]">
          <div className="flex items-center gap-4">
              <span className="font-mono font-bold">{kId}</span>
              <span className="font-bold uppercase text-slate-400">Sync: {lastSyncTime || '--'}</span>
          </div>
          <div className="flex items-center gap-4">
              {pBrands.length > 0 && <button onClick={() => { setSelectedBrandForPricelist(pBrands[0]?.id); setShowPricelistModal(true); }} className="bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center shadow-sm"><RIcon size={12} /></button>}
              <span className="font-black uppercase tracking-widest text-[9px]">JSTYP</span>
          </div>
       </footer>
       {showPricelistModal && (
           <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in" onClick={() => setShowPricelistModal(false)}>
               <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                   <div className="p-4 bg-slate-50 border-b flex justify-between items-center shrink-0"><h2 className="text-xl font-black uppercase text-slate-900 flex items-center gap-2"><RIcon size={24} className="text-green-600" /> Pricelists</h2><button onClick={() => setShowPricelistModal(false)}><X size={24} className="text-slate-500" /></button></div>
                   <div className="flex-1 flex overflow-hidden flex-col md:flex-row"><div className="shrink-0 w-full md:w-1/3 bg-slate-50 border-r border-slate-200 overflow-y-auto">{pBrands.map((b: any) => (<button key={b.id} onClick={() => setSelectedBrandForPricelist(b.id)} className={`w-full text-left p-4 flex items-center gap-3 border-b border-slate-100 ${selectedBrandForPricelist === b.id ? 'bg-white border-l-4 border-green-500' : 'hover:bg-white'}`}><div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center shrink-0 overflow-hidden">{b.logoUrl ? <img src={b.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300">{b.name.charAt(0)}</span>}</div><span className={`font-black text-sm uppercase ${selectedBrandForPricelist === b.id ? 'text-green-600' : 'text-slate-400'}`}>{b.name}</span></button>))}</div><div className="flex-1 overflow-y-auto p-6 bg-slate-100/50"><div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).map(pl => (<button key={pl.id} onClick={() => setViewingManualList(pl)} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border-2 border-white flex flex-col h-full"><div className="aspect-[3/4] bg-slate-50 relative p-3">{pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain rounded" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><List size={32}/></div>}<div className="absolute top-2 right-2 text-white text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-600">TABLE</div></div><div className="p-3 flex-1 flex flex-col justify-between bg-white"><h3 className="font-black text-slate-900 text-xs uppercase leading-tight line-clamp-2">{pl.title}</h3><div className="text-[10px] font-black text-slate-400 uppercase mt-2">{pl.month} {pl.year}</div></div></button>))}</div></div></div>
               </div>
           </div>
       )}
       {viewingManualList && <ManualPricelistViewer pricelist={viewingManualList} onClose={() => setViewingManualList(null)} companyLogo={storeData.companyLogoUrl} brandLogo={pBrands.find((b:any)=>b.id===viewingManualList.brandId)?.logoUrl} brandName={pBrands.find((b:any)=>b.id===viewingManualList.brandId)?.name} />}
    </div>
  );
};

export default KioskApp;
