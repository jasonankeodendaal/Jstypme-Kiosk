import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, FileDigit, Code2, Workflow, Link2, Eye, MoveHorizontal, AlignLeft, AlignCenter, AlignRight, Type, Lamp, Film
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, ArchivedItem } from '../types';
import { resetStoreData, upsertBrand, upsertCategory, upsertProduct, upsertPricelist, upsertPricelistBrand, deleteItem } from '../services/geminiService';
import { smartUpload, supabase, checkCloudConnection, convertPdfToImages } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

const SignalStrengthBars = ({ strength }: { strength: number }) => {
    return (
        <div className="flex items-end gap-0.5 h-3">
            {[1, 2, 3, 4].map((bar) => {
                const isActive = (strength / 25) >= bar;
                return (
                    <div 
                        key={bar} 
                        className={`w-1 rounded-full transition-all duration-500 ${isActive ? 'bg-blue-500' : 'bg-slate-800'}`} 
                        style={{ height: `${bar * 25}%` }}
                    />
                );
            })}
        </div>
    );
};

const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5(4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

const SystemDocumentation = () => {
    const [activeSection, setActiveSection] = useState('architecture');
    
    const sections = [
        { id: 'architecture', label: '1. Architecture', icon: <Network size={16} />, desc: 'Offline-First Philosophy' },
        { id: 'inventory', label: '2. Data Tree', icon: <Box size={16}/>, desc: 'Relational Structure' },
        { id: 'pricelists', label: '3. Price Logic', icon: <Table size={16}/>, desc: 'Rounding Psychology' },
        { id: 'screensaver', label: '4. Visual Engine', icon: <Zap size={16}/>, desc: 'Double-Buffer Loop' },
        { id: 'fleet', label: '5. Fleet Pulse', icon: <Activity size={16}/>, desc: 'Telemetry Heartbeat' },
        { id: 'tv', label: '6. TV Protocol', icon: <Tv size={16}/>, desc: 'Display Queue' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-fade-in">
            <style>{`
                @keyframes flow-horizontal { 0% { transform: translateX(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(400%); opacity: 0; } }
                .data-flow { animation: flow-horizontal 3s linear infinite; }
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2); opacity: 0; } }
                .pulse-ring { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
            `}</style>

            <div className="w-full md:w-72 bg-slate-900 border-r border-white/5 p-6 shrink-0 overflow-y-auto hidden md:flex flex-col">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Center</span>
                    </div>
                    <h2 className="text-white font-black text-2xl tracking-tighter leading-none">System <span className="text-blue-500">Guides</span></h2>
                    <p className="text-slate-500 text-xs mt-2 font-medium">Deep-dive engineering concepts explained simply.</p>
                </div>

                <div className="space-y-2 flex-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 group relative overflow-hidden ${
                                activeSection === section.id 
                                ? 'bg-blue-600 text-white shadow-xl translate-x-2' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className={`p-2 rounded-xl transition-all duration-500 ${activeSection === section.id ? 'bg-white/20' : 'bg-slate-800'}`}>
                                {React.cloneElement(section.icon as React.ReactElement<any>, { size: 18 })}
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{section.label}</div>
                                <div className={`text-[9px] font-bold uppercase truncate opacity-60 ${activeSection === section.id ? 'text-blue-100' : 'text-slate-500'}`}>{section.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-white relative p-6 md:p-12 lg:p-20 scroll-smooth">
                {activeSection === 'architecture' && <div className="flex flex-col items-center justify-center h-full text-slate-400">Content Loaded</div>}
            </div>
        </div>
    );
};

const HexagonIcon = ({ size, className }: any) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>);
const CalculatorIcon = ({ size, className }: any) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>);
const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!name.trim() || !pin.trim()) { setError('Please enter both Name and PIN.'); return; }
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) { onLogin(admin); } else { setError('Invalid credentials.'); }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in"><div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300"><h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1><p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase tracking-wide">Enter Name & PIN</p><form onSubmit={handleAuth} className="space-y-4"><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">Admin Name</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">PIN Code</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="password" placeholder="####" value={pin} onChange={(e) => setPin(e.target.value)} /></div>{error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}<button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-slate-800 transition-colors shadow-lg">Login</button></form></div></div>
  );
};

const FileUpload = ({ currentUrl, onUpload, label, accept = "image/*", icon = <ImageIcon />, allowMultiple = false, onRasterize }: any) => {
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('Uploading...');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { 
      if (e.target.files && e.target.files.length > 0) { 
          setIsProcessing(true); 
          setUploadProgress(10); 
          const files = Array.from(e.target.files) as File[]; 
          let fileType = files[0].type.startsWith('video') ? 'video' : files[0].type === 'application/pdf' ? 'pdf' : files[0].type.startsWith('audio') ? 'audio' : 'image'; 
          
          const uploadSingle = async (file: File) => { 
              try { 
                  const url = await smartUpload(file); 
                  return url; 
              } catch (e: any) { 
                  const msg = e.message || "Storage Access Error"; 
                  alert(`Upload Failed: ${msg}\n\nPlease ensure your device is online and has access to Cloud Storage.`); 
                  throw e; 
              } 
          }; 

          try { 
              if (allowMultiple) { 
                  const results: string[] = []; 
                  for(let i=0; i<files.length; i++) { 
                      try { 
                          const url = await uploadSingle(files[i]); 
                          results.push(url); 
                      } catch (e) {} 
                      setUploadProgress(((i+1)/files.length)*100); 
                  } 
                  if (results.length > 0) { onUpload(results, fileType); } 
              } else { 
                  try { 
                      const file = files[0];
                      const url = await uploadSingle(file); 
                      if (fileType === 'pdf' && onRasterize) {
                          setStatusText("Processing Visuals...");
                          setUploadProgress(50);
                          try {
                              const images = await convertPdfToImages(file, (curr, total) => {
                                  setStatusText(`Rasterizing Pg ${curr}/${total}`);
                                  setUploadProgress(50 + ((curr/total) * 40));
                              });
                              if (images.length > 0) {
                                  setStatusText("Uploading Pages...");
                                  const imageUrls: string[] = [];
                                  for (let i=0; i<images.length; i++) {
                                      const pageUrl = await uploadSingle(images[i]);
                                      imageUrls.push(pageUrl);
                                  }
                                  onRasterize(imageUrls);
                              }
                          } catch (err) {
                              console.warn("Rasterization failed, defaulting to PDF only", err);
                              alert("Visual conversion failed. The PDF will still be available for download.");
                          }
                      }
                      setUploadProgress(100); 
                      onUpload(url, fileType); 
                  } catch (e) {} 
              } 
          } catch (err) { 
              console.error(err); 
          } finally { 
              setTimeout(() => { 
                  setIsProcessing(false); 
                  setUploadProgress(0); 
                  setStatusText("Uploading...");
              }, 500); 
              e.target.value = ''; 
          } 
      } 
  };

  return (<div className="mb-4"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label><div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">{isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>}<div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0 text-slate-400">{isProcessing ? (<Loader2 className="animate-spin text-blue-500" />) : currentUrl && !allowMultiple ? (accept.includes('video') ? <Video className="text-blue-500" size={16} /> : accept.includes('pdf') ? <FileText className="text-red-500" size={16} /> : accept.includes('audio') ? (<div className="flex flex-col items-center justify-center bg-green-50 w-full h-full text-green-600"><Music size={16} /></div>) : <img src={currentUrl} className="w-full h-full object-contain" />) : React.cloneElement(icon, { size: 16 })}</div><label className={`flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase whitespace-nowrap overflow-hidden text-ellipsis ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}><Upload size={10} className="inline mr-1" /> {isProcessing ? statusText : 'Select File'}<input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/></label></div></div>);
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text' }: any) => (<div className={`mb-4 ${half ? 'w-full' : ''}`}><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>{isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />}</div>);

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[], immediate: boolean) => void, brandId?: string }) => { 
    const [localList, setLocalList] = useState(catalogues || []); 
    useEffect(() => setLocalList(catalogues || []), [catalogues]); 
    const handleUpdate = (newList: Catalogue[], immediate = false) => { setLocalList(newList); onSave(newList, immediate); }; 
    const addCatalogue = () => { setLocalList(prev => { const newItem: Catalogue = { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId: brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear(), startDate: '', endDate: '' }; const newList = [...prev, newItem]; onSave(newList, true); return newList; }); }; 
    const updateCatalogue = (id: string, updates: Partial<Catalogue>, immediate = false) => { setLocalList(prev => { const newList = prev.map(c => c.id === id ? { ...c, ...updates } : c); onSave(newList, immediate); return newList; }); }; 
    return (<div className="space-y-6"><div className="flex justify-between items-center mb-4"><h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3><button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold textxs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{localList.map((cat) => (<div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"><div className="h-40 bg-slate-100 relative group flex items-center justify-center overflow-hidden">{cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? (<img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-contain" />) : (<BookOpen size={32} className="text-slate-300" />)}{cat.pdfUrl && (<div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded shadow-sm">PDF</div>)}</div><div className="p-4 space-y-3 flex-1 flex flex-col"><input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Title" />{cat.type === 'catalogue' || brandId ? (<div><label className="text-[8px] font-bold text-slate-400 uppercase">Catalogue Year</label><input type="number" value={cat.year || new Date().getFullYear()} onChange={(e) => updateCatalogue(cat.id, { year: parseInt(e.target.value) })} className="w-full text-xs border border-slate-200 rounded p-1" /></div>) : (<><div className="grid grid-cols-2 gap-2"><div><label className="text-[8px] font-bold text-slate-400 uppercase">Start Date</label><input type="date" value={cat.startDate || ''} onChange={(e) => updateCatalogue(cat.id, { startDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" /></div><div><label className="text-[8px] font-bold text-slate-400 uppercase">End Date</label><input type="date" value={cat.endDate || ''} onChange={(e) => updateCatalogue(cat.id, { endDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" /></div></div><div><label className="text-[8px] font-bold text-slate-400 uppercase">Promotional Sub-Header</label><textarea value={cat.promoText || ''} onChange={(e) => updateCatalogue(cat.id, { promoText: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1 resize-none h-12" placeholder="Enter promo text..." /></div></>)}<div className="grid grid-cols-2 gap-2 mt-auto pt-2"><FileUpload label="Thumbnail (Image)" accept="image/*" currentUrl={cat.thumbnailUrl || (cat.pages?.[0])} onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url }, true)} /><FileUpload label="Document (PDF)" accept="application/pdf" currentUrl={cat.pdfUrl} icon={<FileText />} onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url }, true)} onRasterize={(urls: string[]) => updateCatalogue(cat.id, { pages: urls }, true)} /></div><div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2"><button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id), true)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete Catalogue</button></div></div></div>))}</div></div>); };
const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => { const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []); const [title, setTitle] = useState(pricelist.title || ''); const [isImporting, setIsImporting] = useState(false); const [headers, setHeaders] = useState(pricelist.headers || { sku: 'SKU', description: 'Description', normalPrice: 'Normal Price', promoPrice: 'Promo Price' }); const [showHeaderConfig, setShowHeaderConfig] = useState(false); const addItem = () => { setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '', imageUrl: '' }]); }; const updateItem = (id: string, field: keyof PricelistItem, val: string) => { const finalVal = field === 'description' ? val.toUpperCase() : val; setItems(items.map(item => item.id === id ? { ...item, [field]: finalVal } : item)); }; const handlePriceBlur = (id: string, field: 'normalPrice' | 'promoPrice', value: string) => { if (!value) return; const numericPart = value.replace(/[^0-9.]/g, ''); if (!numericPart) { if (value && !value.startsWith('R ')) updateItem(id, field, `R ${value}`); return; } let num = parseFloat(numericPart); if (num % 1 !== 0) num = Math.ceil(num); if (Math.floor(num) % 10 === 9) num += 1; const formatted = `R ${num.toLocaleString()}`; updateItem(id, field, formatted); }; const removeItem = (id: string) => { setItems(items.filter(item => item.id !== id)); }; const handleSpreadsheetImport = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setIsImporting(true); try { const data = await file.arrayBuffer(); const workbook = XLSX.read(data, { type: 'array' }); const firstSheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[firstSheetName]; const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]; if (jsonData.length === 0) { alert("The selected file appears to be empty."); return; } const validRows = jsonData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')); if (validRows.length === 0) { alert("No data rows found in the file."); return; } const firstRow = validRows[0].map(c => String(c || '').toLowerCase().trim()); const findIdx = (keywords: string[]) => firstRow.findIndex(h => keywords.some(k => h.includes(k))); const skuIdx = findIdx(['sku', 'code', 'part', 'model']); const descIdx = findIdx(['desc', 'name', 'product', 'item', 'title']); const normalIdx = findIdx(['normal', 'retail', 'price', 'standard', 'cost']); const promoIdx = findIdx(['promo', 'special', 'sale', 'discount', 'deal']); const hasHeader = skuIdx !== -1 || descIdx !== -1 || normalIdx !== -1; const dataRows = hasHeader ? validRows.slice(1) : validRows; const sIdx = skuIdx !== -1 ? skuIdx : 0; const dIdx = descIdx !== -1 ? descIdx : 1; const nIdx = normalIdx !== -1 ? normalIdx : 2; const pIdx = promoIdx !== -1 ? promoIdx : 3; const newImportedItems: PricelistItem[] = dataRows.map(row => { const formatImported = (val: string) => { if (!val) return ''; const numeric = String(val).replace(/[^0-9.]/g, ''); if (!numeric) return String(val); let n = parseFloat(numeric); if (n % 1 !== 0) n = Math.ceil(n); if (Math.floor(n) % 10 === 9) n += 1; return `R ${n.toLocaleString()}`; }; return { id: generateId('imp'), sku: String(row[sIdx] || '').trim().toUpperCase(), description: String(row[dIdx] || '').trim().toUpperCase(), normalPrice: formatImported(row[nIdx]), promoPrice: row[pIdx] ? formatImported(row[pIdx]) : '', imageUrl: '' }; }); if (newImportedItems.length > 0) { const userChoice = confirm(`Parsed ${newImportedItems.length} items.\n\nOK -> UPDATE existing SKUs and ADD new ones (Merge).\nCANCEL -> REPLACE entire current list.`); if (userChoice) { const merged = [...items]; const onlyNew: PricelistItem[] = []; newImportedItems.forEach(newItem => { const existingIdx = merged.findIndex(curr => curr.sku && newItem.sku && curr.sku.trim().toUpperCase() === newItem.sku.trim().toUpperCase()); if (existingIdx > -1) { merged[existingIdx] = { ...merged[existingIdx], description: newItem.description || merged[existingIdx].description, normalPrice: newItem.normalPrice || merged[existingIdx].normalPrice, promoPrice: newItem.promoPrice || merged[existingIdx].promoPrice }; } else { onlyNew.push(newItem); } }); setItems([...merged, ...onlyNew]); alert(`Merge Complete: Updated existing SKUs and added ${onlyNew.length} new items.`); } else { setItems(newImportedItems); alert("Pricelist replaced with imported data."); } } else { alert("Could not extract any valid items. Ensure the sheet follows the format: SKU, Description, Normal Price, Promo Price."); } } catch (err) { console.error("Spreadsheet Import Error:", err); alert("Error parsing file. Ensure it is a valid .xlsx or .csv file."); } finally { setIsImporting(false); e.target.value = ''; } }; return (<div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"><div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 shrink-0"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><Table className="text-blue-600" size={24} /><input value={title} onChange={(e) => setTitle(e.target.value)} className="font-black text-slate-900 uppercase text-lg bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none w-full transition-colors placeholder:text-slate-300" placeholder="ENTER LIST TITLE..." /></div><div className="flex items-center gap-4"><p className="text-xs text-slate-500 font-bold uppercase ml-8">{pricelist.month} {pricelist.year}</p><button onClick={() => setShowHeaderConfig(!showHeaderConfig)} className="text-[10px] font-bold uppercase text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><Settings size={12}/> Table Settings</button></div></div><div className="flex flex-wrap gap-2 items-center"><label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg cursor-pointer">{isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />} Import Excel/CSV<input type="file" className="hidden" accept=".csv,.tsv,.txt,.xlsx,.xls" onChange={handleSpreadsheetImport} disabled={isImporting} /></label><button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-900/10"><Plus size={16} /> Add Row</button><button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button></div></div>{showHeaderConfig && (<div className="bg-slate-100 p-4 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in"><div><label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">SKU Header</label><input value={headers.sku} onChange={(e) => setHeaders({...headers, sku: e.target.value})} className="w-full text-xs font-bold p-2 rounded border border-slate-300 uppercase" /></div><div><label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Description Header</label><input value={headers.description} onChange={(e) => setHeaders({...headers, description: e.target.value})} className="w-full text-xs font-bold p-2 rounded border border-slate-300 uppercase" /></div><div><label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Normal Price Header</label><input value={headers.normalPrice} onChange={(e) => setHeaders({...headers, normalPrice: e.target.value})} className="w-full text-xs font-bold p-2 rounded border border-slate-300 uppercase" /></div><div><label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Promo Price Header</label><input value={headers.promoPrice} onChange={(e) => setHeaders({...headers, promoPrice: e.target.value})} className="w-full text-xs font-bold p-2 rounded border border-slate-300 uppercase" /></div></div>)}<div className="flex-1 overflow-auto p-6"><div className="mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3"><Info size={18} className="text-blue-500 shrink-0" /><p className="text-[10px] text-blue-800 font-bold uppercase leading-tight">Price Strategy: Decimals are rounded UP (129.99 → 130). Values ending in 9 are pushed to the next round number (799 → 800). Whole numbers like 122 are kept.</p></div><table className="w-full text-left border-collapse"><thead className="bg-slate-50 sticky top-0 z-10"><tr><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-16">Visual</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">{headers.sku || 'SKU'}</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">{headers.description || 'Description'}</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">{headers.normalPrice || 'Normal Price'}</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">{headers.promoPrice || 'Promo Price'}</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-10 text-center">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => (<tr key={item.id} className="hover:bg-slate-50/50 transition-colors"><td className="p-2"><div className="w-12 h-12 relative group/item-img">{item.imageUrl ? (<><img src={item.imageUrl} className="w-full h-full object-contain rounded bg-white border border-slate-100" /><button onClick={(e) => { e.stopPropagation(); if(confirm("Remove this image?")) updateItem(item.id, 'imageUrl', ''); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/item-img:opacity-100 transition-opacity z-10 hover:bg-red-600"><X size={10} strokeWidth={3} /></button></>) : (<div className="w-full h-full bg-slate-50 border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300"><ImageIcon size={14} /></div>)}{!item.imageUrl && (<label className="absolute inset-0 bg-black/40 opacity-0 group-hover/item-img:opacity-100 flex items-center justify-center cursor-pointer rounded transition-opacity"><Upload size={12} className="text-white" /><input type="file" className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) { try { const url = await smartUpload(e.target.files[0]); updateItem(item.id, 'imageUrl', url); } catch (err) { alert("Upload failed"); } } }} /></label>)}</div></td><td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm" placeholder="SKU-123" /></td><td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm uppercase" placeholder="PRODUCT DETAILS..." /></td><td className="p-2"><input value={item.normalPrice} onBlur={(e) => handlePriceBlur(item.id, 'normalPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-black text-sm" placeholder="R 999" /></td><td className="p-2"><input value={item.promoPrice} onBlur={(e) => handlePriceBlur(item.id, 'promoPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-red-500 outline-none font-black text-sm text-red-600" placeholder="R 799" /></td><td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button></td></tr>))}{items.length === 0 && (<tr><td colSpan={6} className="py-20 text-center text-slate-400 text-sm font-bold uppercase italic">No items yet. Click "Add Row" or "Import" to start.</td></tr>)}</tbody></table></div><div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0"><button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => { onSave({ ...pricelist, title, items, headers, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Save size={16} /> Save Pricelist Table</button></div></div></div>); };
const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: { pricelists: Pricelist[], pricelistBrands: PricelistBrand[], onSavePricelists: (p: Pricelist[], immediate?: boolean) => void, onSaveBrands: (b: PricelistBrand[], immediate?: boolean) => void, onDeletePricelist: (id: string) => void }) => { const sortedBrands = useMemo(() => { return [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)); }, [pricelistBrands]); const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands.length > 0 ? sortedBrands[0] : null); const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null); const latestBrandId = useMemo(() => { if (!pricelists.length) return null; const sortedByDate = [...pricelists].sort((a, b) => { const da = a.dateAdded ? new Date(a.dateAdded).getTime() : 0; const db = b.dateAdded ? new Date(b.dateAdded).getTime() : 0; return db - da; }); return sortedByDate[0]?.brandId || null; }, [pricelists]); useEffect(() => { if (selectedBrand && !sortedBrands.find(b => b.id === selectedBrand.id)) { setSelectedBrand(sortedBrands.length > 0 ? sortedBrands[0] : null); } }, [sortedBrands]); const filteredLists = selectedBrand ? pricelists.filter(p => p.brandId === selectedBrand.id) : []; const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; const sortedLists = [...filteredLists].sort((a, b) => { const yearA = parseInt(a.year) || 0; const yearB = parseInt(b.year) || 0; if (yearA !== yearB) return yearB - yearA; return months.indexOf(b.month) - months.indexOf(a.month); }); const addBrand = () => { const name = prompt("Enter Brand Name for Pricelists:"); if (!name) return; const newBrand: PricelistBrand = { id: generateId('plb'), name: name, logoUrl: '' }; upsertPricelistBrand(newBrand); onSaveBrands([...pricelistBrands, newBrand], true); setSelectedBrand(newBrand); }; const updateBrand = (id: string, updates: Partial<PricelistBrand>, immediate = false) => { const updatedBrands = pricelistBrands.map(b => b.id === id ? { ...b, ...updates } : b); const updatedBrand = updatedBrands.find(b => b.id === id); if(updatedBrand) upsertPricelistBrand(updatedBrand); onSaveBrands(updatedBrands, immediate); if (selectedBrand?.id === id) { setSelectedBrand({ ...selectedBrand, ...updates }); } }; const deleteBrand = (id: string) => { if (confirm("Delete this brand? This will also hide associated pricelists.")) { deleteItem('PRICELIST_BRAND', id); onSaveBrands(pricelistBrands.filter(b => b.id !== id), true); } }; const addPricelist = () => { if (!selectedBrand) return; const newItem: Pricelist = { id: generateId('pl'), brandId: selectedBrand.id, title: 'New Pricelist', url: '', type: 'pdf', month: 'January', year: new Date().getFullYear().toString(), dateAdded: new Date().toISOString(), kind: 'standard' }; upsertPricelist(newItem); onSavePricelists([...pricelists, newItem], true); }; const updatePricelist = (id: string, updates: Partial<Pricelist>, immediate = false) => { const updatedLists = pricelists.map(p => p.id === id ? { ...p, ...updates } : p); const updatedItem = updatedLists.find(p => p.id === id); if(updatedItem) upsertPricelist(updatedItem); onSavePricelists(updatedLists, immediate); }; const handleDeletePricelist = (id: string) => { if(confirm("Delete this pricelist? It will be moved to Archive.")) { deleteItem('PRICELIST', id); onDeletePricelist(id); } }; const isNewlyUpdated = (dateStr?: string) => { if (!dateStr) return false; const date = new Date(dateStr); const now = new Date(); const diff = Math.abs(now.getTime() - date.getTime()); return Math.ceil(diff / (1000 * 60 * 60 * 24)) <= 30; }; return (<div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]"><div className="w-full md:w-1/3 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0"><div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0"><div><h2 className="font-black text-slate-900 uppercase text-xs md:text-sm">Pricelist Brands</h2><p className="text-[10px] text-slate-400 font-bold uppercase hidden md:block">Independent List</p></div><button onClick={addBrand} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Plus size={12} /> Add</button></div><div className="flex-1 overflow-y-auto p-2 space-y-2">{sortedBrands.map(brand => { const isLatest = latestBrandId === brand.id; return (<div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-2 md:p-3 rounded-xl border transition-all cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}>{isLatest && <div className="absolute -top-1.5 -right-1.5 z-10 bg-orange-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg border border-white animate-bounce"><span className="flex items-center gap-1"><Sparkles size={8} /> Just Updated</span></div>}<div className="flex items-center gap-2 md:gap-3"><div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm md:text-lg">{brand.name.charAt(0)}</span>}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><div className="font-bold text-slate-900 text-[10px] md:text-xs uppercase truncate">{brand.name}</div>{isLatest && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>}</div><div className="text-[9px] md:text-[10px] text-slate-400 font-mono truncate">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div></div></div>{selectedBrand?.id === brand.id && (<div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-200/50 space-y-2" onClick={e => e.stopPropagation()}><input value={brand.name} onChange={(e) => updateBrand(brand.id, { name: e.target.value })} className="w-full text-[10px] md:text-xs font-bold p-1 border-b border-slate-200 focus:border-blue-500 outline-none bg-transparent" placeholder="Brand Name" /><FileUpload label="Brand Logo" currentUrl={brand.logoUrl} onUpload={(url: any) => updateBrand(brand.id, { logoUrl: url }, true)} /><button onClick={(e) => { e.stopPropagation(); deleteBrand(brand.id); }} className="w-full text-center text-[10px] text-red-500 font-bold uppercase hover:bg-red-50 py-1 rounded">Delete Brand</button></div>)}</div>);})}{sortedBrands.length === 0 && <div className="p-8 text-center text-slate-400 text-xs italic">No brands. Click "Add" to start.</div>}</div></div><div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0"><div className="flex justify-between items-center mb-4 shrink-0"><div className="flex items-center gap-3 truncate mr-2"><h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider truncate">{selectedBrand ? selectedBrand.name : 'Select Brand'}</h3>{selectedBrand && latestBrandId === selectedBrand.id && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1 border border-orange-200"><Activity size={10} /> Active Refresh</span>}</div><button onClick={addPricelist} disabled={!selectedBrand} className="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"><Plus size={12} /> Add <span className="hidden md:inline">Pricelist</span></button></div><div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 content-start pb-10">{sortedLists.map((item) => { const recent = isNewlyUpdated(item.dateAdded); return (<div key={item.id} className={`rounded-xl border shadow-sm overflow-hidden flex flex-col p-3 md:p-4 gap-2 md:gap-3 h-fit relative group transition-all ${recent ? 'bg-yellow-50 border-yellow-300 ring-1 ring-yellow-200' : 'bg-white border-slate-200'}`}>{recent && <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm animate-pulse z-10"><Sparkles size={10} /> Recently Edited</div>}<div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label><input value={item.title} onChange={(e) => updatePricelist(item.id, { title: e.target.value, dateAdded: new Date().toISOString() })} className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-xs md:text-sm bg-transparent" placeholder="e.g. Retail Price List" /></div><div className="flex bg-slate-100 p-1 rounded-lg mb-1"><button onClick={() => updatePricelist(item.id, { kind: 'standard' })} className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${!item.kind || item.kind === 'standard' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Standard</button><button onClick={() => updatePricelist(item.id, { kind: 'promotion' })} className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${item.kind === 'promotion' ? 'bg-purple-600 shadow text-white' : 'text-slate-400 hover:text-slate-600'}`}>Promotion</button></div>{item.kind === 'promotion' ? (<div className="flex flex-col gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100"><div className="grid grid-cols-2 gap-2"><div><label className="block text-[8px] font-bold text-purple-800 uppercase mb-1">Start</label><input type="date" value={item.startDate || ''} onChange={(e) => updatePricelist(item.id, { startDate: e.target.value, dateAdded: new Date().toISOString() })} className="w-full text-[9px] font-bold p-1 bg-white border border-purple-200 rounded text-purple-900 outline-none focus:border-purple-500" /></div><div><label className="block text-[8px] font-bold text-purple-800 uppercase mb-1">End</label><input type="date" value={item.endDate || ''} onChange={(e) => updatePricelist(item.id, { endDate: e.target.value, dateAdded: new Date().toISOString() })} className="w-full text-[9px] font-bold p-1 bg-white border border-purple-200 rounded text-purple-900 outline-none focus:border-purple-500" /></div></div><div><label className="block text-[8px] font-bold text-purple-800 uppercase mb-1">Promotional Sub-Header</label><textarea value={item.promoText || ''} onChange={(e) => updatePricelist(item.id, { promoText: e.target.value, dateAdded: new Date().toISOString() })} className="w-full text-[9px] font-bold p-1.5 bg-white border border-purple-200 rounded text-purple-900 outline-none focus:border-purple-500 resize-none h-12 placeholder:text-purple-300" placeholder="Enter promotional text..." /></div></div>) : (<div className="grid grid-cols-2 gap-2"><div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Month</label><select value={item.month} onChange={(e) => updatePricelist(item.id, { month: e.target.value, dateAdded: new Date().toISOString() })} className="w-full text-[10px] md:text-xs font-bold p-1 bg-white/50 rounded border border-slate-200">{months.map(m => <option key={m} value={m}>{m}</option>)}</select></div><div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Year</label><input type="number" value={item.year} onChange={(e) => updatePricelist(item.id, { year: e.target.value, dateAdded: new Date().toISOString() })} className="w-full text-[10px] md:text-xs font-bold p-1 bg-white/50 rounded border border-slate-200" /></div></div>)}<div className="bg-white/40 p-2 rounded-lg border border-slate-100 mt-2"><label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Pricelist Mode</label><div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-md border border-slate-200"><button onClick={() => updatePricelist(item.id, { type: 'pdf', dateAdded: new Date().toISOString() }, true)} className={`py-1 text-[9px] font-black uppercase rounded items-center justify-center gap-1 transition-all ${item.type !== 'manual' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><FileText size={10}/> PDF</button><button onClick={() => updatePricelist(item.id, { type: 'manual', dateAdded: new Date().toISOString() }, true)} className={`py-1 text-[9px] font-black uppercase rounded items-center justify-center gap-1 transition-all ${item.type === 'manual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={10}/> Manual</button></div></div>{item.type === 'manual' ? (<div className="mt-1 space-y-2"><button onClick={() => setEditingManualList(item)} className="w-full py-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"><Edit2 size={12}/> {item.items?.length || 0} Items - Open Builder</button><FileUpload label="Thumbnail Image" accept="image/*" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url, dateAdded: new Date().toISOString() }, true)} /></div>) : (<div className="mt-1 md:mt-2 grid grid-cols-2 gap-2"><FileUpload label="Thumbnail" accept="image/*" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url, dateAdded: new Date().toISOString() }, true)} /><FileUpload label="Upload PDF" accept="application/pdf" icon={<FileText />} currentUrl={item.url} onUpload={(url: any) => updatePricelist(item.id, { url: url, dateAdded: new Date().toISOString() }, true)} /></div>)}<button onClick={() => handleDeletePricelist(item.id)} className="mt-auto pt-2 md:pt-3 border-t border-slate-100 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1"><Trash2 size={12} /> Delete</button></div>);})} {sortedLists.length === 0 && selectedBrand && <div className="col-span-full py-8 md:py-12 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-xl">No pricelists found for this brand.</div>}</div></div>{editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => updatePricelist(pl.id, { ...pl }, true)} onClose={() => setEditingManualList(null)} />}</div>); };

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => { 
  const [draft, setDraft] = useState<Product>({ ...product, dimensions: Array.isArray(product.dimensions) ? product.dimensions : (product.dimensions ? [{label: "Device", ...(product.dimensions as any)}] : []), features: Array.isArray(product.features) ? product.features : [], boxContents: Array.isArray(product.boxContents) ? product.boxContents : [], specs: product.specs || {}, videoUrls: product.videoUrls || (product.videoUrl ? [product.videoUrl] : []), manuals: product.manuals || (product.manualUrl || (product.manualImages && product.manualImages.length > 0) ? [{ id: generateId('man'), title: "User Manual", images: product.manualImages || [], pdfUrl: product.manualUrl }] : []), dateAdded: product.dateAdded || new Date().toISOString() }); 
  const [newFeature, setNewFeature] = useState(''); 
  const [newBoxItem, setNewBoxItem] = useState(''); 
  const [newSpecKey, setNewSpecKey] = useState(''); 
  const [newSpecValue, setNewSpecValue] = useState(''); 
  
  const addFeature = () => { if (newFeature.trim()) { setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }); setNewFeature(''); } }; 
  const addBoxItem = () => { if(newBoxItem.trim()) { setDraft({ ...draft, boxContents: [...(draft.boxContents || []), newBoxItem.trim()] }); setNewBoxItem(''); } }; 
  const addSpec = () => { if (newSpecKey.trim() && newSpecValue.trim()) { setDraft({ ...draft, specs: { ...draft.specs, [newSpecKey.trim()]: newSpecValue.trim() } }); setNewSpecKey(''); setNewSpecValue(''); } }; 
  
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
        <h3 className="font-bold uppercase tracking-wide">Edit Product: {draft.name || 'New Product'}</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({...draft, name: e.target.value})} placeholder="e.g. iPhone 15 Pro" />
            <InputField label="SKU Code" val={draft.sku || ''} onChange={(e: any) => setDraft({...draft, sku: e.target.value})} placeholder="e.g. APL-15P-256" />
          </div>
          <div className="space-y-4">
            <InputField label="Description" val={draft.description} onChange={(e: any) => setDraft({...draft, description: e.target.value})} placeholder="Product marketing copy..." isArea />
            <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({...draft, imageUrl: url})} />
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-8">
          <h4 className="font-bold text-slate-500 uppercase text-xs mb-4">Key Features</h4>
          <div className="flex gap-2 mb-4">
            <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="flex-1 border p-2 rounded-lg text-sm" placeholder="Add feature..." />
            <button onClick={addFeature} className="bg-blue-600 text-white px-4 rounded-lg font-bold text-xs">ADD</button>
          </div>
          <div className="space-y-2">
            {draft.features.map((f, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                <span className="text-sm">{f}</span>
                <button onClick={() => setDraft({...draft, features: draft.features.filter((_, idx) => idx !== i)})} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-8">
          <h4 className="font-bold text-slate-500 uppercase text-xs mb-4">Technical Specs</h4>
          <div className="flex gap-2 mb-4">
            <input value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} className="w-1/3 border p-2 rounded-lg text-sm" placeholder="Spec Name (e.g. Processor)" />
            <input value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} className="flex-1 border p-2 rounded-lg text-sm" placeholder="Value (e.g. A17 Pro)" />
            <button onClick={addSpec} className="bg-blue-600 text-white px-4 rounded-lg font-bold text-xs">ADD</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(draft.specs).map(([k, v], i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{k}</div>
                  <div className="text-sm font-bold">{v}</div>
                </div>
                <button onClick={() => { const s = {...draft.specs}; delete s[k]; setDraft({...draft, specs: s}); }} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-slate-100 pt-8">
          <button onClick={onCancel} className="px-6 py-3 rounded-xl font-bold uppercase text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={() => onSave(draft)} className="px-6 py-3 rounded-xl font-bold uppercase bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"><Save size={18}/> Save Product</button>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState('inventory');
  
  if (!admin) {
      return <Auth admins={storeData.admins} onLogin={setAdmin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
       <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-800">
             <h1 className="text-xl font-black uppercase tracking-widest">Kiosk<span className="text-blue-500">Admin</span></h1>
             <p className="text-xs text-slate-500 mt-1">v3.0.1 • {admin.name}</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
             {[
               { id: 'inventory', icon: Box, label: 'Inventory' },
               { id: 'marketing', icon: Megaphone, label: 'Marketing' },
               { id: 'pricelists', icon: Table, label: 'Pricelists' },
               { id: 'tv', icon: Tv, label: 'TV Mode' },
               { id: 'settings', icon: Settings, label: 'Settings' },
               { id: 'guide', icon: Book, label: 'System Guide' }
             ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <item.icon size={18} />
                    <span className="font-bold text-xs uppercase tracking-wide">{item.label}</span>
                </button>
             ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
             <button onClick={() => setAdmin(null)} className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase w-full p-2">
                <LogOut size={14} /> Logout
             </button>
          </div>
       </aside>
       
       <main className="flex-1 overflow-hidden relative">
           {activeTab === 'inventory' && (
              <div className="h-full p-8 overflow-y-auto">
                  <h2 className="text-2xl font-black uppercase text-slate-800 mb-6">Inventory Management</h2>
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 min-h-[400px]">
                      <p>Inventory Module Loaded. Select a Brand to edit.</p>
                  </div>
              </div>
           )}
           
           {activeTab === 'pricelists' && (
              <PricelistManager 
                 pricelists={storeData.pricelists || []} 
                 pricelistBrands={storeData.pricelistBrands || []}
                 onSavePricelists={(pl, imm) => {
                     const newData = { ...storeData, pricelists: pl };
                     if (imm) onUpdateData(newData);
                 }}
                 onSaveBrands={(brands, imm) => {
                     const newData = { ...storeData, pricelistBrands: brands };
                     if (imm) onUpdateData(newData);
                 }}
                 onDeletePricelist={() => {}} 
              />
           )}
           
           {activeTab === 'marketing' && (
               <div className="h-full p-8 overflow-y-auto">
                  <h2 className="text-2xl font-black uppercase text-slate-800 mb-6">Marketing Assets</h2>
                  <CatalogueManager 
                      catalogues={storeData.catalogues || []} 
                      onSave={(cats, imm) => {
                          const newData = { ...storeData, catalogues: cats };
                          if (imm) onUpdateData(newData);
                      }} 
                  />
               </div>
           )}
           
           {activeTab === 'guide' && <SetupGuide onClose={() => setActiveTab('inventory')} />}
           
           {activeTab !== 'inventory' && activeTab !== 'pricelists' && activeTab !== 'marketing' && activeTab !== 'guide' && (
               <div className="h-full flex items-center justify-center text-slate-400">
                   <p className="font-bold uppercase">Module Under Construction</p>
               </div>
           )}
       </main>
    </div>
  );
};
