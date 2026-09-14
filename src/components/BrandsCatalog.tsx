import React, { useState } from 'react';
import { BikeBrand } from '../types';
import {
  Tag,
  ExternalLink,
  Search,
  Globe,
  Award,
  Sparkles,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface BrandsCatalogProps {
  brands: BikeBrand[];
}

export const BrandsCatalog: React.FC<BrandsCatalogProps> = ({ brands }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  const filteredBrands = brands.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase()) ||
      b.popularModels.some((m) => m.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = categoryFilter === 'todos' || b.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div id="brands-catalog-section" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
          <Tag className="w-4 h-4" />
          Guia de Equipamentos & Fabricantes
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
          Marcas Líderes do Ciclismo Mundial
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
          Especificações técnicas, compatibilidade de grupos de marcha mecânicos e eletrônicos (Di2 / AXS), tecnologias de carbono e amortecimento.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar marca ou modelo (ex: Shimano, Tarmac, AXS, Fox)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'todos', label: 'Todas as Marcas' },
            { key: 'bicicletas', label: 'Bicicletas' },
            { key: 'componentes', label: 'Componentes' },
            { key: 'suspensao', label: 'Suspensão' },
            { key: 'pneus', label: 'Pneus' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`text-xs px-3 py-2 rounded-xl font-medium whitespace-nowrap border transition-all ${
                categoryFilter === cat.key
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Brand Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase border border-slate-700">
                  {brand.category}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-500" />
                  {brand.origin} ({brand.founded})
                </span>
              </div>

              <h4 className="font-bold text-slate-100 text-lg group-hover:text-emerald-400 transition-colors">
                {brand.name}
              </h4>

              <p className="text-xs text-slate-300 mt-2 mb-4 leading-relaxed">
                {brand.description}
              </p>

              {/* Specialty Highlight */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Destaque Tecnológico:
                </div>
                <p className="text-xs text-slate-300">{brand.specialty}</p>
              </div>

              {/* Popular Models */}
              <div className="space-y-1.5 mb-4">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                  Modelos & Tecnologias de Destaque:
                </span>
                <div className="flex flex-wrap gap-1">
                  {brand.popularModels.map((mod, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-200 border border-slate-700/60 font-mono"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Website External Link */}
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <span>Site Oficial & Catálogo Técnico</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
