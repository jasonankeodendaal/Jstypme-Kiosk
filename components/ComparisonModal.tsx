
import React, { useMemo } from 'react';
import { Product } from '../types';
import { Layers, X, Package, Check } from 'lucide-react';

const ComparisonModal = ({ products, onClose, onShowDetail }: { products: Product[], onClose: () => void, onShowDetail: (p: Product) => void }) => {
    const specKeys = useMemo(() => {
        const keys = new Set<string>();
        products.forEach(p => Object.keys(p.specs).forEach(k => keys.add(k)));
        return Array.from(keys).sort();
    }, [products]);

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-fade-in p-2 md:p-12" onClick={onClose} style={{ transform: 'translate3d(0,0,0)' }}>
            <div className="relative w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-slate-900 flex items-center gap-3"><Layers className="text-blue-600" /> Product Comparison</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase">Side-by-side Technical Analysis</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full transition-colors"><X size={24} /></button>
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
                                                {p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-100" />}
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
                            <tr className="hover:bg-slate-50/50"><td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">Description</td>{products.map(p => (<td key={p.id} className="p-6 text-sm font-medium text-slate-600 leading-relaxed italic border-r border-slate-100">{p.description ? p.description.substring(0, 150) + '...' : 'No description provided.'}</td>))}</tr>
                            {specKeys.map(key => (<tr key={key} className="hover:bg-slate-50/50"><td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">{key}</td>{products.map(p => (<td key={p.id} className="p-6 text-sm font-black text-slate-900 border-r border-slate-100">{p.specs[key] || <span className="text-slate-200">—</span>}</td>))}</tr>))}
                            <tr className="hover:bg-slate-50/50"><td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">Key Features</td>{products.map(p => (<td key={p.id} className="p-6 border-r border-slate-100"><ul className="space-y-2">{p.features.slice(0, 5).map((f, i) => (<li key={i} className="flex items-start gap-3 text-[11px] font-bold text-slate-700"><Check size={12} className="text-green-500 shrink-0 mt-0.5" /> {f}</li>))}{p.features.length > 5 && <li className="text-[10px] font-black text-blue-500 uppercase tracking-widest pl-5">+{p.features.length - 5} more</li>}</ul></td>))}</tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComparisonModal;
