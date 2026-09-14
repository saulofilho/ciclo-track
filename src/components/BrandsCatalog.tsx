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
      {/* Header - Variation 3 */}
      <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 meta text-[#2c52a1] font-bold mb-1">
          <Tag className="w-4 h-4" />
          CATÁLOGO DE FABRICANTES & ENGENHARIA TÉCNICA
        </div>
        <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
          Marcas Globais & Fabricantes de Alta Performance
        </h3>
        <p className="text-xs sm:text-sm text-[#1a1a1a]/70 max-w-2xl mt-1.5">
          Fichas técnicas de montagem, grupos de transmissão mecânicos e eletrônicos (Di2 / AXS), laminagem de fibra de carbono e amortecimento de alto rendimento.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#1a1a1a]/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar marca ou modelo (ex: Shimano, Tarmac, AXS, Fox)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-5 py-3 rounded-full bg-white border border-[#1a1a1a]/10 text-[#1a1a1a] text-xs sm:text-sm placeholder:text-[#1a1a1a]/40 focus:outline-none focus:border-[#2c52a1] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'todos', label: 'TODAS' },
            { key: 'bicicletas', label: 'BICICLETAS' },
            { key: 'componentes', label: 'COMPONENTES' },
            { key: 'suspensao', label: 'SUSPENSÃO' },
            { key: 'pneus', label: 'PNEUS' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`text-xs px-4 py-2.5 rounded-full font-mono-numbers font-medium whitespace-nowrap border transition-all cursor-pointer ${
                categoryFilter === cat.key
                  ? 'bg-[#2c52a1] text-white font-bold border-[#2c52a1] shadow-xs'
                  : 'bg-white text-[#1a1a1a]/70 border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Brand Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white border border-[#1a1a1a]/10 hover:border-[#2c52a1]/40 p-6 rounded-3xl flex flex-col justify-between transition-all group shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="meta text-[10px] font-bold px-3 py-1 rounded-full bg-[#f8f7f4] text-[#1a1a1a]/80 uppercase border border-[#1a1a1a]/10">
                  {brand.category}
                </span>
                <span className="meta text-[11px] text-[#1a1a1a]/60 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#1a1a1a]/40" />
                  {brand.origin} ({brand.founded})
                </span>
              </div>

              <h4 className="font-serif-display text-2xl font-bold text-[#1a1a1a] group-hover:text-[#2c52a1] transition-colors">
                {brand.name}
              </h4>

              <p className="text-xs text-[#1a1a1a]/70 mt-2 mb-4 leading-relaxed">
                {brand.description}
              </p>

              {/* Specialty Highlight */}
              <div className="bg-[#f8f7f4] p-4 rounded-2xl border border-[#1a1a1a]/10 mb-4">
                <div className="flex items-center gap-1.5 meta text-[#2c52a1] font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  DESTAQUE TECNOLÓGICO:
                </div>
                <p className="text-xs text-[#1a1a1a]/80">{brand.specialty}</p>
              </div>

              {/* Popular Models */}
              <div className="space-y-1.5 mb-5">
                <span className="meta text-[#1a1a1a]/50 block font-bold text-[10px]">
                  MODELOS & TECNOLOGIAS EM DESTAQUE:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {brand.popularModels.map((mod, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-3 py-1 rounded-full bg-[#f8f7f4] text-[#1a1a1a]/80 border border-[#1a1a1a]/10 font-mono-numbers"
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
              className="w-full py-2.5 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers uppercase text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2 shadow-xs cursor-pointer"
            >
              <span>Catálogo Técnico & Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
