
import React, { useState, useMemo } from 'react';
import { StoreData, Product } from '../types';
import { X, Search, Filter, LayoutGrid, Package } from 'lucide-react';

const SearchModal = ({ storeData, onClose, onSelectProduct }: { storeData: StoreData, onClose: () => void, onSelectProduct: (p: Product) => void }) => {
    const [query, setQuery] = useState('');
    const [filterBrand, setFilterBrand] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterHasVideo, setFilterHasVideo] = useState(false);
    
    const allFlattenedProducts = useMemo(() => storeData.brands.flatMap(b => b.categories.flatMap(c => c.products.map(p => ({...p, brandName: b.name, brandId: b.id, categoryName: c.name, categoryId: c.id})))), [storeData]);
    
    const results = useMemo(() => {
        const lower = query.toLowerCase().trim();
        return allFlattenedProducts.filter(p => {
            const matchesQuery = !lower || p.name.toLowerCase().includes(lower) || (p.sku && p.sku.toLowerCase().includes(lower)) || p.description.toLowerCase().includes(lower);
            const matchesBrand = filterBrand === 'all' || p.brandId === filterBrand;
            const matchesCat = filterCategory === 'all' || p.categoryName === filterCategory;
            const matchesVideo = !filterHasVideo || (p.videoUrl || (p.videoUrls && p.videoUrls.length > 0));
            return matchesQuery && matchesBrand && matchesCat && matchesVideo;
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [query, filterBrand, filterCategory, filterHasVideo, allFlattenedProducts]);

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-fade-in" onClick={onClose} style={{ transform: 'translate3d(0,0,0)' }}>
            <div className="p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col h-full" onClick={e => e.stopPropagation()}>
                <div className="shrink-0 mb-8"><div className="relative group"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-8 h-8 group-focus-within:scale-110 transition-transform" /><input autoFocus type="text" placeholder="Find any product, SKU, or feature..." className="w-full bg-white/10 text-white placeholder:text-slate-500 text-3xl md:text-5xl font-black uppercase tracking-tight py-6 pl-20 pr-20 border-b-4 border-white/10 outline-none focus:border-blue-500 transition-all rounded-t-3xl" value={query} onChange={(e) => setQuery(e.target.value)} /><button onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-2"><X size={40} /></button></div></div>
                <div className="shrink-0 flex wrap gap-4 mb-8"><div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10"><div className="p-2 bg-blue-600 rounded-lg text-white"><Filter size={16} /></div><select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="bg-transparent text-white font-black uppercase text-xs outline-none cursor-pointer pr-4"><option value="all" className="bg-slate-900">All Brands</option>{storeData.brands.map(b => <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>)}</select></div><div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10"><div className="p-2 bg-purple-600 rounded-lg text-white"><LayoutGrid size={16} /></div><select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-transparent text-white font-black uppercase text-xs outline-none cursor-pointer pr-4"><option value="all" className="bg-slate-900">All Categories</option>{Array.from(new Set(allFlattenedProducts.map(p => p.categoryName))).sort().map(c => (<option key={c} value={c} className="bg-slate-900">{c}</option>))}</select></div></div>
                <div className="flex-1 overflow-y-auto no-scrollbar pb-20"><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{results.map(p => (<button key={p.id} onClick={() => { onSelectProduct(p); onClose(); }} className="group bg-white rounded-3xl overflow-hidden flex flex-col text-left transition-all hover:scale-105 active:scale-95 shadow-xl border-4 border-transparent hover:border-blue-500"><div className="aspect-square bg-white relative flex items-center justify-center p-4">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-100" />}</div><div className="p-4 bg-slate-50/50 flex-1 flex flex-col"><h4 className="font-black text-slate-900 uppercase text-xs leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{p.name}</h4><div className="mt-auto text-[9px] font-mono font-bold text-slate-400">{p.sku || 'N/A'}</div></div></button>))}</div></div>
            </div>
        </div>
    );
};

export default SearchModal;
