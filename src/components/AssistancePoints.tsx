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
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4" />
            Rede Credenciada & Emergência
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
            Points de Assistência Técnica & Apoio
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Encontre oficinas especializadas Shimano Service Center, bike shops com mecânicos certificados, pontos com bomba de ar e água gratuita, e socorro móvel para resgate no pedal.
          </p>
        </div>

        {/* SOS Emergency Hotline Pill */}
        <a
          href="tel:11977554433"
          className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-rose-900/30 transition-all shrink-0 active:scale-95"
        >
          <AlertOctagon className="w-4 h-4 animate-bounce" />
          Acionar SOS Pedal Móvel
        </a>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, serviço (ex: tubeless, suspensão) ou endereço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'todos', label: 'Todos os Pontos' },
            { key: 'oficina_especializada', label: 'Oficina Certificada' },
            { key: 'bike_shop', label: 'Bike Shop' },
            { key: 'ponto_apoio', label: 'Bomba & Água 24h' },
            { key: 'socorro_movel', label: 'Socorro Móvel' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilterType(cat.key)}
              className={`text-xs px-3 py-2 rounded-xl font-medium whitespace-nowrap border transition-all ${
                filterType === cat.key
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPoints.map((pt) => {
          const isSelected = selectedPoint?.id === pt.id;
          return (
            <div
              key={pt.id}
              onClick={() => setSelectedPoint(pt)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500/80 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Type Badge & Rating */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                      pt.type === 'oficina_especializada'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : pt.type === 'socorro_movel'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : pt.type === 'ponto_apoio'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {pt.type === 'oficina_especializada'
                      ? 'Oficina Especializada'
                      : pt.type === 'socorro_movel'
                      ? 'Socorro Móvel SOS'
                      : pt.type === 'ponto_apoio'
                      ? 'Ponto Público de Apoio'
                      : 'Bike Shop & Café'}
                  </span>

                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{pt.rating}</span>
                    <span className="text-slate-400 font-normal">({pt.reviewCount})</span>
                  </div>
                </div>

                {/* Name & Address */}
                <h4 className="font-bold text-slate-100 text-base mb-1">{pt.name}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {pt.address}, {pt.city}
                </p>

                {/* Quick Amenities Icons: Pump, Water, Open Hours */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {pt.hasAirPump && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                      <Wind className="w-3 h-3" /> Bomba com Manômetro
                    </span>
                  )}
                  {pt.hasWaterPoint && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-800/60 flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> Água Potável
                    </span>
                  )}
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {pt.openingHours}
                  </span>
                </div>

                {/* Services list tags */}
                <div className="mb-4">
                  <span className="text-[10px] text-slate-500 block mb-1 font-semibold uppercase">
                    Serviços Disponíveis:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {pt.services.map((svc, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: WhatsApp, Call, Navigate */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                {pt.whatsapp && (
                  <a
                    href={`https://wa.me/${pt.whatsapp}?text=Olá! Encontrei sua oficina no aplicativo CicloTrack Pro e gostaria de agendar uma manutenção.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                )}

                <a
                  href={`tel:${pt.phone}`}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
                  title="Ligar"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Ligar
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${pt.lat},${pt.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
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
