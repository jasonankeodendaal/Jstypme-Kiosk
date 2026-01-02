
import React, { useState, useMemo } from 'react';
import { Category, Product, Brand, Catalogue } from '../types';
import { ChevronLeft, Search, X, Tag, Package, Plus, Check, Layers, LayoutList, LayoutGrid, Grid3X3 } from 'lucide-react';

interface ProductListProps {
  category: Category;
  brand: Brand;
  storeCatalogs: Catalogue[];
  onSelectProduct: (product: Product) => void;
  onBack: () => void;
  onViewCatalog: (pages: string[]) => void;
  screensaverEnabled: boolean;
  onToggleScreensaver: () => void;
  showScreensaverButton?: boolean;
  selectedForCompare: string[];
  onToggleCompare: (product: Product) => void;
  onStartCompare: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
  category, 
  onSelectProduct, 
  onBack, 
  screensaverEnabled, 
  onToggleScreensaver, 
  showScreensaverButton = true,
  selectedForCompare,
  onToggleCompare,
  onStartCompare
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewCols, setViewCols] = useState<1 | 2 | 3>(3);

  // Search & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = category.products;
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = category.products.filter(p => 
         p.name.toLowerCase().includes(lowerQuery) || 
         (p.sku && p.sku.toLowerCase().includes(lowerQuery))
      );
    }
    // Sort alphabetically by name
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [category.products, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in relative">
      {/* Header with Search & Layout Toggle */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 shadow-sm sticky top-0 z-40 shrink-0 flex flex-col gap-4">
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-700 shadow-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">{category.name}</h2>
                    <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wide">Available Models</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                <button 
                    onClick={() => setViewCols(1)}
                    className={`p-2 rounded-lg transition-all ${viewCols === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}
                    title="1 Column Stack"
                >
                    <LayoutList size={20} />
                </button>
                <button 
                    onClick={() => setViewCols(2)}
                    className={`p-2 rounded-lg transition-all ${viewCols === 2 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}
                    title="2 Column Grid"
                >
                    <LayoutGrid size={20} />
                </button>
                <button 
                    onClick={() => setViewCols(3)}
                    className={`p-2 rounded-lg transition-all ${viewCols === 3 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}
                    title="Compact Grid"
                >
                    <Grid3X3 size={20} />
                </button>
            </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={20} />
            </div>
            <input 
                type="text" 
                placeholder="Search Product Name or SKU Code..." 
                className="w-full pl-10 pr-10 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 border-2 rounded-xl outline-none font-bold text-slate-900 transition-all uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                >
                    <X size={20} />
                </button>
            )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 md:p-8 bg-slate-50 pb-40 md:pb-8">
        <div className={`grid gap-2 md:gap-6 pb-12 transition-all duration-500 ${
            viewCols === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 
            viewCols === 2 ? 'grid-cols-2' : 
            'grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        }`}>
          {filteredProducts.map((product) => {
            const isSelected = selectedForCompare.includes(product.id);
            return (
              <div key={product.id} className="relative group">
                <button
                  onClick={() => onSelectProduct(product)}
                  className={`w-full bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border flex h-full ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-400'
                  } ${viewCols === 1 ? 'flex-row items-center p-2' : 'flex-col text-left'}`}
                >
                  {/* Image Container */}
                  <div className={`bg-white flex items-center justify-center relative overflow-hidden shrink-0 ${
                      viewCols === 1 ? 'w-24 h-24 md:w-40 md:h-40 p-2' : 'aspect-square border-b border-slate-50 p-2 md:p-4'
                  }`}>
                    {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 flex-col">
                            <Package size={24} className="mb-2 md:w-8 md:h-8" />
                            <span className="font-bold text-[8px] md:text-[10px] uppercase">No Image</span>
                        </div>
                    )}
                  </div>
                  
                  {/* Card Content */}
                  <div className={`flex flex-col flex-1 bg-white ${viewCols === 1 ? 'pl-4 pr-12 text-left py-2' : 'p-2 md:p-4'}`}>
                    <h3 className={`font-black text-slate-900 mb-1 group-hover:text-blue-700 transition-colors uppercase leading-tight ${
                        viewCols === 1 ? 'text-sm md:text-xl' : 'text-[10px] md:text-sm line-clamp-2'
                    }`}>
                      {product.name}
                    </h3>
                    
                    {viewCols === 1 && product.description && (
                        <p className="text-slate-500 text-xs line-clamp-2 mb-2 hidden md:block">{product.description}</p>
                    )}

                    {product.sku ? (
                        <div className="flex items-center gap-1 md:gap-1.5 text-slate-500 mt-auto">
                            <Tag size={10} className="md:w-3 md:h-3" />
                            <span className="text-[8px] md:text-[10px] font-mono font-bold uppercase tracking-wide truncate">
                                {product.sku}
                            </span>
                        </div>
                    ) : (
                        <div className="mt-auto text-[8px] md:text-[10px] font-mono font-bold text-slate-300 uppercase">NO SKU</div>
                    )}
                  </div>
                </button>

                {/* Compare Selection Bubble */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleCompare(product); }}
                    className={`absolute rounded-full border-2 shadow-lg flex items-center justify-center transition-all z-10 ${
                        isSelected ? 'bg-blue-600 border-white text-white' : 'bg-white/80 border-slate-200 text-slate-400 hover:bg-white'
                    } ${viewCols === 1 ? 'right-4 top-1/2 -translate-y-1/2 w-10 h-10' : 'top-2 right-2 w-6 h-6 md:w-8 md:h-8'}`}
                >
                    {isSelected ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
                </button>
              </div>
            );
          })}
          
          {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-slate-400">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p className="font-bold text-lg uppercase tracking-wide">No products found</p>
                  <p className="text-sm">We couldn't find anything matching "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery('')} className="mt-6 text-blue-600 font-bold uppercase text-xs border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50">Clear Search Filter</button>
              </div>
          )}
        </div>
      </div>

      {/* Comparison Drawer */}
      {selectedForCompare.length > 0 && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-fade-in w-full max-w-lg px-4">
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                      <div className="bg-blue-600 p-2 rounded-lg">
                          <Layers size={20} />
                      </div>
                      <div>
                          <span className="block font-black uppercase text-xs tracking-tight">{selectedForCompare.length} Product{selectedForCompare.length > 1 ? 's' : ''} Selected</span>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Ready to compare</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <button 
                        onClick={onStartCompare}
                        disabled={selectedForCompare.length < 2}
                        className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 transition-all hover:scale-105 active:scale-95 shadow-lg"
                      >
                          Compare Now
                      </button>
                      <button 
                        onClick={() => selectedForCompare.forEach(id => {
                            const p = category.products.find(x => x.id === id);
                            if(p) onToggleCompare(p);
                        })}
                        className="p-2 text-slate-400 hover:text-white"
                      >
                          <X size={20} />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ProductList;
