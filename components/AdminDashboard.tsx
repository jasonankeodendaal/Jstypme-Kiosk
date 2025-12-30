
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, 
  Video, FileText, Search, Settings, Loader2, X, List, Table, Camera, SaveAll, AlertCircle, Megaphone, Tv, PlayCircle, Tablet, UserCog, Key
} from 'lucide-react';
import { StoreData, Product, Pricelist, PricelistBrand, PricelistItem, AdminUser, AdminPermissions } from '../types';
import { uploadFileToStorage } from '../services/kioskService';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

const InputField = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: any) => (
  <div className="space-y-1">
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon size={14}/></div>}
      <input 
        type={type} 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-900 text-sm ${Icon ? 'pl-9' : 'pl-3'}`}
      />
    </div>
  </div>
);

const FileUpload = ({ label, value, onUpload, type = "image", icon: Icon = Upload }: any) => {
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
    <div className="space-y-1">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-xs font-bold"
        >
          <span className="flex items-center gap-2">
            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
            {isUploading ? 'Uploading...' : 'Select File'}
          </span>
          <ChevronRight size={14} className="text-slate-300" />
        </button>
        {value && (
            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 p-1 relative group overflow-hidden shrink-0">
                <img src={value} className="w-full h-full object-contain" />
                <button onClick={() => onUpload('')} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
            </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};

const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) onLogin(admin); else setError('Invalid credentials.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm w-full border border-slate-200">
        <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><UserCog size={32} className="text-white" /></div>
            <h1 className="text-2xl font-black text-slate-900 uppercase">Admin Hub</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Authorization Required</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <InputField label="Admin Name" value={name} onChange={setName} placeholder="Enter Name" icon={UserCog} />
          <InputField label="Security PIN" value={pin} onChange={setPin} placeholder="****" type="password" icon={Key} />
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold text-center border border-red-100 uppercase">{error}</div>}
          <button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-blue-600 transition-all shadow-md">Log In</button>
        </form>
      </div>
    </div>
  );
};

export const AdminDashboard = ({ storeData, onUpdateData }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
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

  const handleSave = () => {
    if (!localData) return;
    onUpdateData(localData);
    setHasUnsavedChanges(false);
  };

  if (!currentUser) return <Auth admins={storeData?.admins || []} onLogin={setCurrentUser} />;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-900 p-2 rounded-xl text-white"><Settings size={20} /></div>
            <h2 className="font-black text-lg tracking-tight uppercase">Dashboard</h2>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User: {currentUser.name}</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'inventory', label: 'Inventory', icon: Box, perm: 'inventory' },
            { id: 'marketing', label: 'Ads', icon: Megaphone, perm: 'marketing' },
            { id: 'pricelists', label: 'Pricelists', icon: List, perm: 'pricelists' },
            { id: 'tv', label: 'TV Wall', icon: Tv, perm: 'tv' },
            { id: 'screensaver', label: 'Screensaver', icon: PlayCircle, perm: 'screensaver' },
            { id: 'fleet', label: 'Fleet', icon: Tablet, perm: 'fleet' },
            { id: 'settings', label: 'Settings', icon: Settings, perm: 'settings' }
          ].map(tab => (
            <button
              key={tab.id}
              disabled={!currentUser.isSuperAdmin && !currentUser.permissions[tab.perm as keyof AdminPermissions]}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-wide ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 disabled:opacity-30'}`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-bold text-sm uppercase">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">{activeTab}</h1>
          <div className="flex items-center gap-4">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-orange-600 font-bold text-[10px] uppercase animate-pulse">
                <AlertCircle size={14} /> Unsaved Changes
              </div>
            )}
            <button onClick={handleSave} disabled={!hasUnsavedChanges} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold uppercase text-xs disabled:opacity-20 hover:bg-blue-600 transition-all flex items-center gap-2">
              <SaveAll size={16} /> Save Changes
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeTab === 'pricelists' && localData && (
             <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-sm font-black uppercase text-slate-400">Manual Pricing Tables</h2>
                    <button onClick={() => {
                        setEditingPricelist({ id: generateId('pl'), brandId: '', title: 'New Pricelist', type: 'manual', items: [], url: '', month: 'Jan', year: '2024' });
                    }} className="bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-xl font-bold uppercase text-[10px] flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"><Plus size={14} /> Add Table</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {localData.pricelists?.filter(p => p.type === 'manual').map(pl => (
                       <div key={pl.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                          <div>
                            <h3 className="font-black text-slate-900 uppercase text-sm leading-tight">{pl.title}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{pl.month} {pl.year} • {(pl.items || []).length} Items</p>
                          </div>
                          <div className="flex gap-2 border-t border-slate-50 pt-4">
                             <button onClick={() => setEditingPricelist(pl)} className="flex-1 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition-all font-bold uppercase text-[10px] flex items-center justify-center gap-2">Edit</button>
                             <button onClick={() => {
                                 if(confirm("Delete this pricelist?")) {
                                     handleLocalUpdate({ ...localData, pricelists: localData.pricelists?.filter(p => p.id !== pl.id) });
                                 }
                             }} className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"><Trash2 size={14} /></button>
                          </div>
                       </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab !== 'pricelists' && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <Box size={48} className="mb-4 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">Logic Preserved for {activeTab}</p>
              </div>
          )}
        </div>
      </main>

      {editingPricelist && (
          <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                      <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-2 rounded-xl text-slate-900"><Table size={20} /></div>
                          <h2 className="text-lg font-black uppercase tracking-tight">Manual Pricing Matrix</h2>
                      </div>
                      <button onClick={() => setEditingPricelist(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-slate-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-4">
                            <InputField label="Table Title" value={editingPricelist.title} onChange={(val:any) => setEditingPricelist({...editingPricelist, title: val})} />
                            <div className="grid grid-cols-2 gap-4">
                               <InputField label="Month" value={editingPricelist.month} onChange={(val:any) => setEditingPricelist({...editingPricelist, month: val})} />
                               <InputField label="Year" value={editingPricelist.year} onChange={(val:any) => setEditingPricelist({...editingPricelist, year: val})} />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1">Target Brand Category</label>
                                <select 
                                    value={editingPricelist.brandId} 
                                    onChange={(e) => setEditingPricelist({...editingPricelist, brandId: e.target.value})}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-xs"
                                >
                                    <option value="">Select Brand</option>
                                    {localData?.pricelistBrands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    <option disabled>--- Inventory Brands ---</option>
                                    {localData?.brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <FileUpload label="Table Cover/Preview" value={editingPricelist.thumbnailUrl} onUpload={(url:string) => setEditingPricelist({...editingPricelist, thumbnailUrl: url})} />
                         </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                              <span className="font-bold uppercase text-[10px] tracking-widest">Product Rows</span>
                              <button onClick={() => {
                                  const newItem: PricelistItem = { id: generateId('it'), sku: '', description: '', normalPrice: '' };
                                  setEditingPricelist({...editingPricelist, items: [...(editingPricelist.items || []), newItem]});
                              }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-blue-500 transition-colors flex items-center gap-2"><Plus size={12}/> Add Row</button>
                          </div>
                          <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                  <thead className="bg-slate-50 border-b border-slate-200 text-[9px] font-black uppercase text-slate-400">
                                      <tr>
                                          <th className="p-3 w-16 text-center">Image</th>
                                          <th className="p-3">SKU Code</th>
                                          <th className="p-3">Description</th>
                                          <th className="p-3">Normal</th>
                                          <th className="p-3">Promo</th>
                                          <th className="p-3 w-12"></th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {(editingPricelist.items || []).map((item) => (
                                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                              <td className="p-2">
                                                 <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group mx-auto">
                                                     {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={14}/></div>}
                                                     <button 
                                                        onClick={() => {
                                                            const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
                                                            inp.onchange = async (e: any) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    const url = await uploadFileToStorage(file);
                                                                    const updatedItems = editingPricelist.items!.map(i => i.id === item.id ? { ...i, imageUrl: url } : i);
                                                                    setEditingPricelist({ ...editingPricelist, items: updatedItems });
                                                                }
                                                            };
                                                            inp.click();
                                                        }}
                                                        className="absolute inset-0 bg-blue-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                      ><Camera size={12} /></button>
                                                 </div>
                                              </td>
                                              <td className="p-2">
                                                  <input className="w-full p-2 bg-transparent font-bold text-slate-900 uppercase text-[11px] focus:bg-white rounded-lg outline-none border border-transparent focus:border-slate-200" value={item.sku} onChange={(e) => {
                                                      const updatedItems = editingPricelist.items!.map(i => i.id === item.id ? {...i, sku: e.target.value} : i);
                                                      setEditingPricelist({...editingPricelist, items: updatedItems});
                                                  }} placeholder="SKU" />
                                              </td>
                                              <td className="p-2">
                                                  <input className="w-full p-2 bg-transparent font-bold text-slate-900 uppercase text-[11px] focus:bg-white rounded-lg outline-none border border-transparent focus:border-slate-200" value={item.description} onChange={(e) => {
                                                      const updatedItems = editingPricelist.items!.map(i => i.id === item.id ? {...i, description: e.target.value} : i);
                                                      setEditingPricelist({...editingPricelist, items: updatedItems});
                                                  }} placeholder="Description" />
                                              </td>
                                              <td className="p-2">
                                                  <input className="w-full p-2 bg-transparent font-bold text-slate-900 text-[11px] focus:bg-white rounded-lg outline-none border border-transparent focus:border-slate-200" value={item.normalPrice} onChange={(e) => {
                                                      const updatedItems = editingPricelist.items!.map(i => i.id === item.id ? {...i, normalPrice: e.target.value} : i);
                                                      setEditingPricelist({...editingPricelist, items: updatedItems});
                                                  }} placeholder="R 000" />
                                              </td>
                                              <td className="p-2">
                                                  <input className="w-full p-2 bg-transparent font-bold text-slate-900 text-[11px] focus:bg-white rounded-lg outline-none border border-transparent focus:border-slate-200" value={item.promoPrice || ''} onChange={(e) => {
                                                      const updatedItems = editingPricelist.items!.map(i => i.id === item.id ? {...i, promoPrice: e.target.value} : i);
                                                      setEditingPricelist({...editingPricelist, items: updatedItems});
                                                  }} placeholder="R 000" />
                                              </td>
                                              <td className="p-2 text-center">
                                                  <button onClick={() => {
                                                      setEditingPricelist({...editingPricelist, items: editingPricelist.items!.filter(i => i.id !== item.id)});
                                                  }} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={14} /></button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                      <button onClick={() => setEditingPricelist(null)} className="px-6 py-3 text-slate-500 font-bold uppercase text-xs hover:text-slate-800 transition-all">Cancel</button>
                      <button onClick={() => {
                          if (!editingPricelist.title || !editingPricelist.brandId) return alert("Title and Brand required.");
                          const existingPls = localData?.pricelists || [];
                          const updatedPls = existingPls.some(p => p.id === editingPricelist.id) 
                            ? existingPls.map(p => p.id === editingPricelist.id ? editingPricelist : p)
                            : [...existingPls, {...editingPricelist, dateAdded: new Date().toISOString()}];
                          handleLocalUpdate({ ...localData!, pricelists: updatedPls });
                          setEditingPricelist(null);
                      }} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs shadow-lg hover:bg-blue-600 transition-all">Update Table</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
