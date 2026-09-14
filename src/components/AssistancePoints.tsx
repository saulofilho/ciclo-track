import React, { useState } from 'react';
import { AssistancePoint } from '../types';
import {
  Wrench,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  Clock,
  Droplets,
  Wind,
  AlertOctagon,
  Navigation,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface AssistancePointsProps {
  points: AssistancePoint[];
}

export const AssistancePoints: React.FC<AssistancePointsProps> = ({ points }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [selectedPoint, setSelectedPoint] = useState<AssistancePoint | null>(points[0] || null);

  const filteredPoints = points.filter((pt) => {
    const matchesSearch =
      pt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'todos' || pt.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div id="assistance-points-section" className="space-y-6">
      {/* Header Banner - Variation 3 */}
      <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 meta text-[#2c52a1] font-bold mb-1">
            <Wrench className="w-4 h-4" />
            REDE CREDENCIADA & OFICINAS HOMOLOGADAS
          </div>
          <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
            Points de Assistência Técnica & Apoio
          </h3>
          <p className="text-xs sm:text-sm text-[#1a1a1a]/70 max-w-2xl mt-1.5">
            Localize oficinas credenciadas Shimano Service Center, bike shops com mecânicos especializados, totens públicos com bomba de alta pressão 24h e resgate motorizado.
          </p>
        </div>

        {/* SOS Emergency Hotline Pill */}
        <a
          href="tel:11977554433"
          className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-mono-numbers uppercase text-xs font-bold flex items-center justify-center gap-2.5 shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <AlertOctagon className="w-4 h-4 animate-pulse" />
          Acionar Resgate SOS
        </a>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#1a1a1a]/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, serviço (ex: tubeless, suspensão) ou endereço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-5 py-3 rounded-full bg-white border border-[#1a1a1a]/10 text-[#1a1a1a] text-xs sm:text-sm placeholder:text-[#1a1a1a]/40 focus:outline-none focus:border-[#2c52a1] shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'todos', label: 'TODOS' },
            { key: 'oficina_especializada', label: 'OFICINAS' },
            { key: 'bike_shop', label: 'BIKE SHOPS' },
            { key: 'ponto_apoio', label: 'BOMBA & ÁGUA 24H' },
            { key: 'socorro_movel', label: 'SOCORRO MÓVEL' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilterType(cat.key)}
              className={`text-xs px-4 py-2.5 rounded-full font-mono-numbers font-medium whitespace-nowrap border transition-all cursor-pointer ${
                filterType === cat.key
                  ? 'bg-[#2c52a1] text-white font-bold border-[#2c52a1] shadow-xs'
                  : 'bg-white text-[#1a1a1a]/70 border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPoints.map((pt) => {
          const isSelected = selectedPoint?.id === pt.id;
          return (
            <div
              key={pt.id}
              onClick={() => setSelectedPoint(pt)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                isSelected
                  ? 'bg-white border-[#2c52a1] ring-1 ring-[#2c52a1]'
                  : 'bg-white border-[#1a1a1a]/10 hover:border-[#2c52a1]/40'
              }`}
            >
              <div>
                {/* Type Badge & Rating */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-mono-numbers uppercase font-bold px-3 py-1 rounded-full border ${
                      pt.type === 'oficina_especializada'
                        ? 'bg-blue-50 text-[#2c52a1] border-blue-200'
                        : pt.type === 'socorro_movel'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : pt.type === 'ponto_apoio'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {pt.type === 'oficina_especializada'
                      ? 'OFICINA ESPECIALIZADA'
                      : pt.type === 'socorro_movel'
                      ? 'SOCORRO MÓVEL SOS'
                      : pt.type === 'ponto_apoio'
                      ? 'PONTO PÚBLICO DE APOIO'
                      : 'BIKE SHOP & CAFÉ'}
                  </span>

                  <div className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{pt.rating}</span>
                    <span className="text-[#1a1a1a]/50 font-normal">({pt.reviewCount})</span>
                  </div>
                </div>

                {/* Name & Address */}
                <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a] mb-1">{pt.name}</h4>
                <p className="text-xs text-[#1a1a1a]/70 flex items-center gap-1.5 mb-3.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2c52a1] shrink-0" />
                  {pt.address}, {pt.city}
                </p>

                {/* Quick Amenities Icons: Pump, Water, Open Hours */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {pt.hasAirPump && (
                    <span className="meta text-[10px] px-2.5 py-1 rounded-full bg-[#f8f7f4] text-[#1a1a1a]/80 border border-[#1a1a1a]/10 flex items-center gap-1">
                      <Wind className="w-3 h-3 text-[#2c52a1]" /> BOMBA COM MANÔMETRO
                    </span>
                  )}
                  {pt.hasWaterPoint && (
                    <span className="meta text-[10px] px-2.5 py-1 rounded-full bg-[#f8f7f4] text-[#1a1a1a]/80 border border-[#1a1a1a]/10 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-[#2c52a1]" /> ÁGUA POTÁVEL
                    </span>
                  )}
                  <span className="meta text-[10px] px-2.5 py-1 rounded-full bg-[#f8f7f4] text-[#1a1a1a]/80 border border-[#1a1a1a]/10 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#1a1a1a]/60" /> {pt.openingHours}
                  </span>
                </div>

                {/* Services list tags */}
                <div className="mb-5">
                  <span className="meta text-[#1a1a1a]/50 block mb-1.5 font-bold text-[10px]">
                    SERVIÇOS DISPONÍVEIS:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pt.services.map((svc, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono-numbers px-2.5 py-0.5 rounded-full bg-[#f8f7f4] text-[#1a1a1a]/80 border border-[#1a1a1a]/10"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: WhatsApp, Call, Navigate */}
              <div className="flex items-center gap-2 pt-4 border-t border-[#1a1a1a]/10">
                {pt.whatsapp && (
                  <a
                    href={`https://wa.me/${pt.whatsapp}?text=Olá! Encontrei sua oficina no aplicativo CicloTrack Pro e gostaria de agendar uma manutenção.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers uppercase text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                )}

                <a
                  href={`tel:${pt.phone}`}
                  className="py-2.5 px-4 rounded-full bg-[#f8f7f4] hover:bg-white text-[#1a1a1a] border border-[#1a1a1a]/10 font-mono-numbers uppercase text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Ligar"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Ligar
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${pt.lat},${pt.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 rounded-full bg-[#f8f7f4] hover:bg-white text-[#2c52a1] border border-[#1a1a1a]/10 font-mono-numbers uppercase text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Traçar rota no GPS"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Rota
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
