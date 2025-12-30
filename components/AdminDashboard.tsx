
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

const InputField = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative group">
      {Icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"><Icon size={16}/></div>}
      <input 
        type={type} 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className={`w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 ${Icon ? 'pl-11' : 'pl-4'}`}
      />
    </div>
  </div>
);

const FileUpload = ({ label, value, onUpload, type = "image", icon: Icon = Upload, subLabel }: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFileToStorage(file);
      onUpload(url);
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2 flex-1">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`flex-1 flex items-center justify-between p-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group ${isUploading ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-blue-600">
               {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
             </div>
             <div className="text-left">
                <span className="block text-xs font-black text-slate-900 uppercase">{isUploading ? 'Uploading...' : 'Select File'}</span>
                {subLabel && <span className="block text-[9px] text-slate-400 font-bold uppercase">{subLabel}</span>}
             </div>
          </div>
          <ChevronRight size={16} className="text-slate-300" />
        </button>
        {value && (
            <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 p-1 shrink-0 shadow-sm relative group overflow-hidden">
                {type === 'image' ? <img src={value} className="w-full h-full object-contain" /> : <FileIcon className="w-full h-full p-2 text-slate-300" />}
                <button onClick={() => onUpload('')} className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
            </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" className="hidden" accept={type === 'image' ? "image/*" : "application/pdf,video/*"} onChange={handleFileChange} />
    </div>
  );
};

const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) onLogin(admin); else setError('Invalid credentials.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4 animate-fade-in">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        <div className="text-center mb-10">
            <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"><ShieldCheck size={40} className="text-blue-500" /></div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Admin Hub</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Authorization Required</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-6">
          <InputField label="Admin Name" value={name} onChange={setName} placeholder="Enter Name" icon={UserCog} />
          <InputField label="Security PIN" value={pin} onChange={setPin} placeholder="****" type="password" icon={Key} />
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center border border-red-100">{error}</div>}
          <button type="submit" className="w-full p-5 font-black rounded-2xl bg-slate-900 text-white uppercase hover:bg-blue-600 transition-all shadow-xl hover:-translate-y-1">Log In</button>
        </form>
      </div>
    </div>
  );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [editingPricelist, setEditingPricelist] = useState<Pricelist | null>(null);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => { if (storeData) setLocalData({ ...storeData }); }, [storeData]);

  const handleLocalUpdate = (newData: StoreData) => {
    setLocalData(newData);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!localData) return;
    onUpdateData(localData);
    setHasUnsavedChanges(false);
  };

  const handleItemImageUpload = (itemId: string, url: string) => {
    if (!editingPricelist) return;
    const updatedItems = (editingPricelist.items || []).map(item => 
        item.id === itemId ? { ...item, imageUrl: url } : item
    );
    setEditingPricelist({ ...editingPricelist, items: updatedItems });
  };

  if (!currentUser) return <Auth admins={storeData?.admins || []} onLogin={setCurrentUser} />;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20"><ShieldCheck size={24} /></div>
            <div>
              <h2 className="font-black text-xl tracking-tighter uppercase leading-none">Admin Hub</h2>
              <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">v2.8.5</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">User Profile</div>
            <div className="font-black text-sm truncate">{currentUser.name}</div>
            <div className="text-[10px] text-blue-400 font-bold uppercase mt-1">{currentUser.isSuperAdmin ? 'Super Administrator' : 'Access Restricted'}</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {[
            { id: 'inventory', label: 'Inventory', icon: Box, perm: 'inventory' },
            { id: 'marketing', label: 'Ads & Marketing', icon: Megaphone, perm: 'marketing' },
            { id: 'pricelists', label: 'Pricelists', icon: List, perm: 'pricelists' },
            { id: 'tv', label: 'TV Wall', icon: Tv, perm: 'tv' },
            { id: 'screensaver', label: 'Screensaver', icon: PlayCircle, perm: 'screensaver' },
            { id: 'fleet', label: 'Fleet Control', icon: Tablet, perm: 'fleet' },
            { id: 'settings', label: 'System Settings', icon: Settings, perm: 'settings' }
          ].map(tab => (
            <button
              key={tab.id}
              disabled={!currentUser.isSuperAdmin && !currentUser.permissions[tab.perm as keyof AdminPermissions]}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-20'}`}
            >
              <tab.icon size={20} />
              <span className="font-black uppercase text-xs tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut size={20} />
            <span className="font-black uppercase text-xs tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{activeTab}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Management Portal</p>
          </div>
          <div className="flex items-center gap-4">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl border border-orange-100 animate-pulse">
                <AlertCircle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Unsaved Changes</span>
              </div>
            )}
            <button onClick={handleSave} disabled={!hasUnsavedChanges} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-20 hover:bg-blue-600 transition-all">
              <SaveAll size={18} /> Save Changes
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/50">
          {activeTab === 'pricelists' && localData && (
             <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black uppercase tracking-tight">Manual Pricelist Management</h2>
                    <button onClick={() => {
                        const newPl: Pricelist = { id: generateId('pl'), brandId: '', title: 'New Pricelist', type: 'manual', items: [], url: '', month: 'Jan', year: '2024' };
                        setEditingPricelist(newPl);
                    }} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2"><Plus size={18} /> Add New Table</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {localData.pricelists?.filter(p => p.type === 'manual').map(pl => (
                       <div key={pl.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group">
                          <h3 className="font-black text-slate-900 uppercase mb-4">{pl.title}</h3>
                          <div className="flex gap-2">
                             <button onClick={() => setEditingPricelist(pl)} className="flex-1 p-3 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"><Edit2 size={14} /> Edit Table</button>
                             <button onClick={() => {
                                 if(confirm("Delete this pricelist?")) {
                                     handleLocalUpdate({ ...localData, pricelists: localData.pricelists?.filter(p => p.id !== pl.id) });
                                 }
                             }} className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"><Trash2 size={16} /></button>
                          </div>
                       </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </main>

      {editingPricelist && (
          <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-12 animate-fade-in">
              <div className="bg-white rounded-[3rem] w-full max-w-7xl h-full flex flex-col overflow-hidden shadow-2xl relative">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                      <div className="flex items-center gap-4">
                          <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-xl"><List size={28} /></div>
                          <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">{editingPricelist.id ? 'Edit Manual Pricelist' : 'Create Manual Pricelist'}</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure Data Matrix & Media</p>
                          </div>
                      </div>
                      <button onClick={() => setEditingPricelist(null)} className="p-4 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors"><X size={24} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar bg-slate-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                          <div className="space-y-6">
                             <InputField label="Pricelist Title" value={editingPricelist.title} onChange={(val:any) => setEditingPricelist({...editingPricelist, title: val})} />
                             <div className="grid grid-cols-2 gap-4">
                                <InputField label="Month" value={editingPricelist.month} onChange={(val:any) => setEditingPricelist({...editingPricelist, month: val})} />
                                <InputField label="Year" value={editingPricelist.year} onChange={(val:any) => setEditingPricelist({...editingPricelist, year: val})} />
                             </div>
                          </div>
                          <div className="space-y-6">
                             <div className="space-y-1.5 flex-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Brand Category</label>
                                <select 
                                    value={editingPricelist.brandId} 
                                    onChange={(e) => setEditingPricelist({...editingPricelist, brandId: e.target.value})}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold uppercase text-xs"
                                >
                                    <option value="">Select a Brand</option>
                                    {localData?.pricelistBrands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    <option disabled>--- Inventory Brands ---</option>
                                    {localData?.brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                             </div>
                             <FileUpload label="Cover Image (Optional)" value={editingPricelist.thumbnailUrl} onUpload={(url:string) => setEditingPricelist({...editingPricelist, thumbnailUrl: url})} />
                          </div>
                      </div>

                      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                              <h3 className="font-black uppercase text-sm tracking-widest flex items-center gap-2"><Table size={18} /> Product Matrix</h3>
                              <button onClick={() => {
                                  const newItem: PricelistItem = { id: generateId('it'), sku: '', description: '', normalPrice: '' };
                                  setEditingPricelist({...editingPricelist, items: [...(editingPricelist.items || []), newItem]});
                              }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-lg"><Plus size={14}/> Add Row</button>
                          </div>
                          <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                  <thead className="bg-slate-50 border-b border-slate-200">
                                      <tr>
                                          <th className="p-4 text-[10px] font-black uppercase text-slate-400 w-16 text-center">Img</th>
                                          <th className="p-4 text-[10px] font-black uppercase text-slate-400">SKU</th>
                                          <th className="p-4 text-[10px] font-black uppercase text-slate-400">Description</th>
                                          <th className="p-4 text-[10px] font-black uppercase text-slate-400">Normal Price</th>
                                          <th className="p-4 text-[10px] font-black uppercase text-slate-400">Promo Price</th>
                                          <th className="p-4 text-[10px] font-black uppercase text-slate-400 w-16"></th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {(editingPricelist.items || []).map((item, idx) => (
                                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                              <td className="p-2">
                                                 <div className="flex flex-col items-center gap-1">
                                                     <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group">
                                                         {item.imageUrl ? (
                                                            <img src={item.imageUrl} className="w-full h-full object-contain" />
                                                         ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={16}/></div>
                                                         )}
                                                         <button 
                                                            onClick={() => {
                                                                const input = document.createElement('input');
                                                                input.type = 'file';
                                                                input.accept = 'image/*';
                                                                input.onchange = async (e: any) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const url = await uploadFileToStorage(file);
                                                                        handleItemImageUpload(item.id, url);
                                                                    }
                                                                };
                                                                input.click();
                                                            }}
                                                            className="absolute inset-0 bg-blue-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                          >
                                                            <Camera size={14} />
                                                          </button>
                                                     </div>
                                                 </div>
                                              </td>
                                              <td className="p-2">
                                                  <input className="w-full p-3 bg-transparent font-bold text-slate-900 uppercase text-xs focus:bg-white rounded-lg outline-none" value={item.sku} onChange={(e) => {
                                                      const updatedItems = editingPricelist.items!.map(i => i.id === item.id ? {...i, sku: e.target.value} : i);
                                                      setEditingPricelist({...editingPricelist, items: updatedItems});
                                                  }} placeholder="SKU-123" />
                                              </td>
                                              <td className="p-2">
                                                  <input className="w-full p-3 bg-transparent font-bold text-slate-900 uppercase text-xs focus:bg-white rounded-lg outline-none" value={item.description} onChange={(e) => {
                                                      const updatedItems = editingPricelist.items!.map(i => i.id === item.id ? {...i, description: e.target.value} : i);
                                                      setEditingPricelist({...editingPricelist, items: updatedItems});
                                                  }} placeholder="Product Description..." />
                                              </td>
                                              <td className="p-2">
                                                  <input className="w-full p-3 bg-transparent font-bold text-slate-900 uppercase text-xs focus:bg-white rounded-lg outline-none" value={item.normalPrice} onChange={(e) => {
                                                      const updatedItems = editingPricelist.items!.map(i => i.id === item.id ? {...i, normalPrice: e.target.value} : i);
                                                      setEditingPricelist({...editingPricelist, items: updatedItems});
                                                  }} placeholder="R 000.00" />
                                              </td>
                                              <td className="p-2">
                                                  <input className="w-full p-3 bg-transparent font-bold text-slate-900 uppercase text-xs focus:bg-white rounded-lg outline-none" value={item.promoPrice || ''} onChange={(e) => {
                                                      const updatedItems = editingPricelist.items!.map(i => i.id === item.id ? {...i, promoPrice: e.target.value} : i);
                                                      setEditingPricelist({...editingPricelist, items: updatedItems});
                                                  }} placeholder="R 000.00 (Optional)" />
                                              </td>
                                              <td className="p-2 text-center">
                                                  <button onClick={() => {
                                                      setEditingPricelist({...editingPricelist, items: editingPricelist.items!.filter(i => i.id !== item.id)});
                                                  }} className="text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
                  <div className="p-8 border-t border-slate-100 bg-white flex justify-end gap-4 shrink-0">
                      <button onClick={() => setEditingPricelist(null)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                      <button onClick={() => {
                          if (!editingPricelist.title || !editingPricelist.brandId) return alert("Title and Brand required.");
                          const existingPls = localData?.pricelists || [];
                          const updatedPls = existingPls.some(p => p.id === editingPricelist.id) 
                            ? existingPls.map(p => p.id === editingPricelist.id ? editingPricelist : p)
                            : [...existingPls, {...editingPricelist, dateAdded: new Date().toISOString()}];
                          handleLocalUpdate({ ...localData!, pricelists: updatedPls });
                          setEditingPricelist(null);
                      }} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/20 hover:bg-blue-600 transition-all flex items-center gap-2"><Save size={18} /> Update Table</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
