
import React, { useMemo, useState } from 'react';
import { Brand, Category, Catalogue, Pricelist } from '../types';
import { Smartphone, Laptop, Watch, Headphones, Monitor, Tablet, Box, ChevronLeft, ArrowRight, BookOpen, MonitorPlay, MonitorStop, Calendar, DollarSign, X, FileText } from 'lucide-react';
import { StoreData } from '../types'; 

interface CategoryGridProps {
  brand: Brand;
  storeCatalogs?: Catalogue[]; 
  pricelists?: Pricelist[];
  onSelectCategory: (category: Category) => void;
  onViewDocument?: (document: Catalogue | Pricelist) => void; 
  onBack: () => void;
  screensaverEnabled: boolean;
  onToggleScreensaver: () => void;
  showScreensaverButton?: boolean;
}

const IconMap: Record<string, React.ReactNode> = {
  'Smartphone': <Smartphone className="w-5 h-5 md:w-12 md:h-12" strokeWidth={1.5} />,
  'Laptop': <Laptop className="w-5 h-5 md:w-12 md:h-12" strokeWidth={1.5} />,
  'Watch': <Watch className="w-5 h-5 md:w-12 md:h-12" strokeWidth={1.5} />,
  'Headphones': <Headphones className="w-5 h-5 md:w-12 md:h-12" strokeWidth={1.5} />,
  'Monitor': <Monitor className="w-5 h-5 md:w-12 md:h-12" strokeWidth={1.5} />,
  'Tablet': <Tablet className="w-5 h-5 md:w-12 md:h-12" strokeWidth={1.5} />,
};

const CategoryGrid: React.FC<CategoryGridProps> = ({ brand, storeCatalogs, onSelectCategory, onViewDocument, onBack, screensaverEnabled, onToggleScreensaver, showScreensaverButton = true }) => {
  // Filter catalogs for this brand ONLY
  const brandCatalogs = storeCatalogs?.filter(c => c.brandId === brand.id).sort((a, b) => {
      if (a.year && b.year && a.year !== b.year) return b.year - a.year; // Recent first
      return 0;
  }) || [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Sort categories alphabetically
  const sortedCategories = useMemo(() => {
    return [...brand.categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [brand.categories]);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 md:p-6 shadow-sm flex items-center justify-between shrink-0 relative z-50">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button 
                onClick={onBack}
                className="flex items-center text-slate-500 hover:text-slate-800 font-bold transition-colors text-xs uppercase tracking-wide bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
            >
                <ChevronLeft size={16} className="mr-1" /> Back to Brands
            </button>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mt-2">{brand.name}</h1>
        </div>
        <div className="hidden md:block">
           <div className="bg-white border border-slate-200 rounded-xl w-20 h-20 flex items-center justify-center p-2 shadow-sm">
             {brand.logoUrl ? (
                 <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
             ) : (
                 <span className="text-2xl font-black text-slate-300">{brand.name.charAt(0)}</span>
             )}
           </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col pb-40 md:pb-8">
        
        {/* Categories Grid - Portrait Mode (3:5 aspect ratio) to fit all text */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-6 mb-12">
          {sortedCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category)}
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-slate-200 hover:border-blue-500 transition-all duration-300 p-2 md:p-3 flex flex-col items-center text-center gap-2 relative overflow-hidden aspect-[3/5] h-full w-full"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              
              {/* Flexible Image Container - Shrinks to fit text */}
              <div className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden transition-all duration-300">
                {category.imageUrl ? (
                    <img 
                        src={category.imageUrl} 
                        alt={category.name} 
                        className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500" 
                    />
                ) : (
                    <div className="w-auto h-full aspect-square max-h-full bg-slate-50 text-slate-400 p-3 md:p-5 rounded-full border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center">
                        {IconMap[category.name] || <Box className="w-full h-full" strokeWidth={1.5} />}
                    </div>
                )}
              </div>
              
              {/* Fixed/Shrinkable Text Container */}
              <div className="w-full px-1 shrink-0 flex flex-col justify-end pb-1">
                <h3 className="text-[9px] md:text-xs font-black text-slate-900 uppercase tracking-tight w-full group-hover:text-blue-600 transition-colors leading-tight break-words whitespace-normal line-clamp-3">
                  {category.name}
                </h3>
                <div className="text-[8px] md:text-[10px] font-bold text-slate-400 mt-1">{category.products.length} Products</div>
              </div>
            </button>
          ))}
        </div>

        {/* Brand Catalogues Section */}
        {brandCatalogs.length > 0 && (
            <div className="mt-auto pt-8 border-t border-slate-200">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                    <BookOpen className="text-blue-600" /> Catalogues & Pamphlets
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {brandCatalogs.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => onViewDocument && onViewDocument(cat)}
                            className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-slate-200 hover:border-blue-500 transition-all group overflow-hidden text-left flex flex-col h-full"
                        >
                            <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                {cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? (
                                    <img 
                                        src={cat.thumbnailUrl || cat.pages[0]} 
                                        alt={cat.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="text-slate-300 flex flex-col items-center">
                                        <BookOpen size={40} strokeWidth={1} />
                                    </div>
                                )}
                                {cat.pdfUrl && (
                                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded shadow-md flex items-center gap-1">
                                        <FileText size={10} /> PDF
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h4 className="font-black text-slate-900 uppercase text-xs md:text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {cat.title}
                                </h4>
                                <div className="mt-auto flex items-center justify-between text-[10px] md:text-xs font-bold text-slate-500 uppercase">
                                    <span>{cat.year || new Date().getFullYear()}</span>
                                    {cat.startDate && <span className="flex items-center gap-1"><Calendar size={10} /> Promo</span>}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CategoryGrid;
