import React, { useState, useEffect, useRef } from 'react';
import { StoreData, Catalogue, Brand, Product, Category, Pricelist, AdItem, ScreensaverSettings, AdminUser } from '../types';
import { 
    LayoutDashboard, Save, LogOut, Plus, Trash2, Edit2, Image as ImageIcon, 
    FileText, Check, X, Settings, ShoppingBag, Users, Monitor, List, Upload,
    ChevronDown, ChevronRight, Search, Menu, Eye, BookOpen, Smartphone
} from 'lucide-react';
import { smartUpload, convertPdfToImages } from '../services/kioskService';

// Utility
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// FileUpload Component
const FileUpload = ({ label, accept, currentUrl, icon, onUpload, onRasterize }: { label: string, accept: string, currentUrl?: string, icon?: React.ReactNode, onUpload: (url: string) => void, onRasterize?: (urls: string[]) => void }) => {
    const [uploading, setUploading] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const file = e.target.files[0];
                const url = await smartUpload(file);
                onUpload(url);
                
                if (onRasterize && file.type === 'application/pdf') {
                    // Convert PDF to images for flipbook
                    const images = await convertPdfToImages(file);
                    const imageUrls = [];
                    for (const img of images) {
                        const imgUrl = await smartUpload(img);
                        imageUrls.push(imgUrl);
                    }
                    onRasterize(imageUrls);
                }
            } catch (err) {
                console.error(err);
                alert("Upload failed");
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => fileInput.current?.click()}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold transition-colors w-full justify-center disabled:opacity-50"
                    disabled={uploading}
                >
                    {uploading ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : (icon || <Upload size={14} />)}
                    {uploading ? 'Uploading...' : (currentUrl ? 'Change File' : 'Select File')}
                </button>
                {currentUrl && (
                    <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        <Eye size={14} />
                    </a>
                )}
            </div>
            <input type="file" ref={fileInput} className="hidden" accept={accept} onChange={handleFile} />
        </div>
    );
};

// CatalogueManager
const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[], immediate: boolean) => void, brandId?: string }) => { 
    const [localList, setLocalList] = useState(catalogues || []); 
    
    useEffect(() => setLocalList(catalogues || []), [catalogues]); 
    
    const handleUpdate = (newList: Catalogue[], immediate = false) => { 
        setLocalList(newList); 
        onSave(newList, immediate); 
    }; 
    
    const addCatalogue = () => { 
        setLocalList(prev => {
            const newItem: Catalogue = { 
                id: generateId('cat'), 
                title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', 
                brandId: brandId, 
                type: brandId ? 'catalogue' : 'pamphlet', 
                pages: [], 
                year: new Date().getFullYear(), 
                startDate: '', 
                endDate: '' 
            };
            const newList = [...prev, newItem];
            handleUpdate(newList, true);
            return newList;
        });
    }; 
    
    const updateCatalogue = (id: string, updates: Partial<Catalogue>, immediate = false) => { 
        setLocalList(prev => {
            const newList = prev.map(c => c.id === id ? { ...c, ...updates } : c);
            if (immediate) onSave(newList, true);
            else handleUpdate(newList, false); 
            return newList;
        });
    }; 
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3>
                <button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2">
                    <Plus size={14} /> Add New
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localList.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                        <div className="h-40 bg-slate-100 relative group flex items-center justify-center overflow-hidden">
                            {cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? (
                                <img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-contain" />
                            ) : (
                                <BookOpen size={32} className="text-slate-300" />
                            )}
                            {cat.pdfUrl && (<div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded shadow-sm">PDF</div>)}
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                            <input 
                                value={cat.title} 
                                onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} 
                                className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" 
                                placeholder="Title" 
                            />
                            {cat.type === 'catalogue' || brandId ? (
                                <div>
                                    <label className="text-[8px] font-bold text-slate-400 uppercase">Catalogue Year</label>
                                    <input 
                                        type="number" 
                                        value={cat.year || new Date().getFullYear()} 
                                        onChange={(e) => updateCatalogue(cat.id, { year: parseInt(e.target.value) })} 
                                        className="w-full text-xs border border-slate-200 rounded p-1" 
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[8px] font-bold text-slate-400 uppercase">Start Date</label>
                                            <input 
                                                type="date" 
                                                value={cat.startDate || ''} 
                                                onChange={(e) => updateCatalogue(cat.id, { startDate: e.target.value })} 
                                                className="w-full text-xs border border-slate-200 rounded p-1" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-bold text-slate-400 uppercase">End Date</label>
                                            <input 
                                                type="date" 
                                                value={cat.endDate || ''} 
                                                onChange={(e) => updateCatalogue(cat.id, { endDate: e.target.value })} 
                                                className="w-full text-xs border border-slate-200 rounded p-1" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-bold text-slate-400 uppercase">Promotional Sub-Header</label>
                                        <textarea 
                                            value={cat.promoText || ''} 
                                            onChange={(e) => updateCatalogue(cat.id, { promoText: e.target.value })} 
                                            className="w-full text-xs border border-slate-200 rounded p-1 resize-none h-12" 
                                            placeholder="Enter promo text..." 
                                        />
                                    </div>
                                </>
                            )}
                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                                <FileUpload 
                                    label="Thumbnail (Image)" 
                                    accept="image/*" 
                                    currentUrl={cat.thumbnailUrl || (cat.pages?.[0])} 
                                    onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url }, true)} 
                                />
                                <FileUpload 
                                    label="Document (PDF)" 
                                    accept="application/pdf" 
                                    currentUrl={cat.pdfUrl} 
                                    icon={<FileText size={14} />} 
                                    onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url }, true)} 
                                    onRasterize={(urls: string[]) => updateCatalogue(cat.id, { pages: urls }, true)} 
                                />
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                                <button 
                                    onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id), true)} 
                                    className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase"
                                >
                                    <Trash2 size={12} /> Delete Catalogue
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ); 
};

// Main Dashboard
export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
    // Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

    // Dashboard State
    const [activeTab, setActiveTab] = useState('overview');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Check standard admins or use a fallback master pin if admins array is broken
        const user = storeData.admins.find(a => a.pin === pin);
        if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
        } else if (pin === '1723') { // Fallback Master Pin
             setCurrentUser({ id: 'master', name: 'Master', pin: '1723', isSuperAdmin: true, permissions: { inventory: true, marketing: true, tv: true, screensaver: true, fleet: true, history: true, settings: true, pricelists: true } });
             setIsAuthenticated(true);
        } else {
            alert('Invalid PIN');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                        <Settings className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-black uppercase text-slate-900 mb-2">Admin Access</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Enter Security PIN</p>
                    <input 
                        type="password" 
                        value={pin} 
                        onChange={e => setPin(e.target.value)}
                        className="w-full text-center text-3xl font-mono font-bold border-2 border-slate-200 rounded-xl p-4 mb-6 focus:border-blue-600 outline-none transition-colors text-slate-900"
                        maxLength={6}
                        autoFocus
                    />
                    <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">
                        Unlock Dashboard
                    </button>
                    <button type="button" onClick={() => window.location.href = '/'} className="mt-4 text-xs font-bold text-slate-400 uppercase hover:text-slate-600">
                        Back to Kiosk
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="bg-slate-900 text-white w-full md:w-64 shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-50">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black">KP</div>
                    <div>
                        <div className="font-bold text-sm">Kiosk Pro</div>
                        <div className="text-[10px] text-slate-500 font-mono">v3.0.1 Admin</div>
                    </div>
                </div>
                
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'inventory', icon: ShoppingBag, label: 'Inventory' },
                        { id: 'marketing', icon: BookOpen, label: 'Pamphlets' },
                        // Add more tabs as needed based on logic
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <tab.icon size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={() => { setIsAuthenticated(false); setPin(''); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/5 rounded-xl transition-colors">
                        <LogOut size={18} />
                        <span className="text-xs font-bold uppercase tracking-wide">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{activeTab}</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase">Manage your store configuration</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={onRefresh} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 shadow-sm">
                                <Settings size={20} />
                            </button>
                        </div>
                    </header>

                    {/* Tab Content */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        {activeTab === 'overview' && (
                            <div className="text-center py-20 text-slate-400">
                                <LayoutDashboard size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-bold uppercase tracking-widest">Dashboard Overview</p>
                                <p className="text-sm">Select a module from the sidebar to begin editing.</p>
                            </div>
                        )}
                        
                        {activeTab === 'marketing' && (
                            <CatalogueManager 
                                catalogues={storeData.catalogues || []} 
                                onSave={(newList, immediate) => {
                                    const newData = { ...storeData, catalogues: newList };
                                    onUpdateData(newData);
                                }} 
                            />
                        )}

                        {activeTab === 'inventory' && (
                            <div className="text-center py-20 text-slate-400">
                                <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-bold uppercase tracking-widest">Inventory Management</p>
                                <p className="text-sm">Placeholder for Brands/Products management interface.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};