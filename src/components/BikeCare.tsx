import React, { useState } from 'react';
import { BikeComponentStatus } from '../types';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Droplets,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

interface BikeCareProps {
  components: BikeComponentStatus[];
  onResetKm: (id: string) => void;
  userWeightKg: number;
}

export const BikeCare: React.FC<BikeCareProps> = ({
  components,
  onResetKm,
  userWeightKg
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('todos');

  // Tire Pressure PSI Calculator State
  const [cyclistWeight, setCyclistWeight] = useState<number>(userWeightKg || 72);
  const [tireType, setTireType] = useState<'estrada' | 'mtb' | 'gravel'>('estrada');
  const [isTubeless, setIsTubeless] = useState<boolean>(true);
  const [isWetSurface, setIsWetSurface] = useState<boolean>(false);

  // Calculate recommended PSI dynamically
  const calculatePSI = () => {
    let front = 80;
    let rear = 85;

    if (tireType === 'estrada') {
      // 700x28c baseline for 70kg
      const base = 75 + (cyclistWeight - 70) * 0.7;
      front = Math.round(base * 0.95);
      rear = Math.round(base * 1.05);
      if (isTubeless) {
        front -= 8;
        rear -= 8;
      }
      if (isWetSurface) {
        front -= 5;
        rear -= 5;
      }
    } else if (tireType === 'gravel') {
      // 700x40c baseline
      const base = 35 + (cyclistWeight - 70) * 0.35;
      front = Math.round(base * 0.95);
      rear = Math.round(base * 1.05);
      if (isTubeless) {
        front -= 4;
        rear -= 4;
      }
      if (isWetSurface) {
        front -= 3;
        rear -= 3;
      }
    } else {
      // MTB 29x2.25
      const base = 24 + (cyclistWeight - 70) * 0.2;
      front = Math.round(base * 0.95);
      rear = Math.round(base * 1.05);
      if (isTubeless) {
        front -= 2;
        rear -= 2;
      }
      if (isWetSurface) {
        front -= 2;
        rear -= 2;
      }
    }

    return { front: Math.max(18, front), rear: Math.max(20, rear) };
  };

  const recommendedPSI = calculatePSI();

  // Overall bike health score
  const totalScore = Math.round(
    components.reduce((acc, c) => {
      const remainingPct = Math.max(0, 1 - c.currentKm / c.maxRecommendedKm);
      return acc + remainingPct * 100;
    }, 0) / components.length
  );

  const filteredComponents = components.filter((c) => {
    if (filterCategory === 'todos') return true;
    return c.category === filterCategory;
  });

  return (
    <div id="bike-care-section" className="space-y-6">
      {/* Top Health Overview Card - Variation 3 */}
      <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 meta text-[#2c52a1] font-bold">
              <ShieldCheck className="w-4 h-4" />
              SAÚDE GLOBAL DA BICICLETA • MANUTENÇÃO PREVENTIVA
            </div>
            <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Diagnóstico de Desgaste & Revisões
            </h3>
            <p className="text-[#1a1a1a]/70 text-xs sm:text-sm max-w-xl">
              Acompanhamento métrico de fadiga material baseado na quilometragem percorrida e torque registrado. Previna avarias em rota e maximize a durabilidade.
            </p>
          </div>

          {/* Big Circular Score */}
          <div className="flex items-center gap-5 bg-[#f8f7f4] p-5 rounded-2xl border border-[#1a1a1a]/10 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#1a1a1a]/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#2c52a1]"
                  strokeDasharray={`${totalScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-lg font-mono-numbers text-[#1a1a1a]">
                {totalScore}%
              </span>
            </div>
            <div>
              <span className="meta text-[#1a1a1a]/60 block text-[10px]">CONDIÇÃO GLOBAL</span>
              <span className="font-serif-display text-base font-bold text-[#1a1a1a]">
                {totalScore >= 80 ? 'Excelente Condição' : totalScore >= 60 ? 'Revisão Recomendada' : 'Atenção Crítica'}
              </span>
              <span className="meta text-[#2c52a1] block text-[11px] mt-0.5 font-bold">
                {components.filter((c) => c.status !== 'otimo').length} alertas técnicos pendentes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Interactive Tire Pressure Calculator + Lube Alert */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tire Pressure Calculator (2 columns) */}
        <div className="md:col-span-2 bg-white border border-[#1a1a1a]/10 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#2c52a1] flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
              <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a]">
                Calculadora Dinâmica de Pressão (PSI)
              </h4>
            </div>
            <span className="meta px-3 py-1 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#2c52a1] font-bold">
              DINÂMICA DE ROLAMENTO
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="meta text-[#1a1a1a]/70 block mb-1.5">
                PESO DO CICLISTA: <span className="text-[#2c52a1] font-bold">{cyclistWeight} KG</span>
              </label>
              <input
                type="range"
                min="45"
                max="120"
                value={cyclistWeight}
                onChange={(e) => setCyclistWeight(Number(e.target.value))}
                className="w-full accent-[#2c52a1] cursor-pointer"
              />
            </div>

            <div>
              <label className="meta text-[#1a1a1a]/70 block mb-1.5">MODALIDADE</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['estrada', 'gravel', 'mtb'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTireType(t)}
                    className={`text-xs py-1.5 rounded-full font-mono-numbers uppercase font-medium border transition-all cursor-pointer ${
                      tireType === t
                        ? 'bg-[#2c52a1] text-white font-bold border-[#2c52a1]'
                        : 'bg-[#f8f7f4] text-[#1a1a1a]/70 border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="meta text-[#1a1a1a]/70 block mb-1.5">CONFIGURAÇÃO</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTubeless(!isTubeless)}
                  className={`text-xs py-1.5 px-3 rounded-full font-mono-numbers uppercase font-medium border flex-1 transition-all cursor-pointer ${
                    isTubeless
                      ? 'bg-[#2c52a1] text-white border-[#2c52a1]'
                      : 'bg-[#f8f7f4] text-[#1a1a1a]/70 border-[#1a1a1a]/10'
                  }`}
                >
                  {isTubeless ? '✓ TUBELESS' : 'CÂMARA'}
                </button>
                <button
                  onClick={() => setIsWetSurface(!isWetSurface)}
                  className={`text-xs py-1.5 px-3 rounded-full font-mono-numbers uppercase font-medium border flex-1 transition-all cursor-pointer ${
                    isWetSurface
                      ? 'bg-[#2c52a1] text-white border-[#2c52a1]'
                      : 'bg-[#f8f7f4] text-[#1a1a1a]/70 border-[#1a1a1a]/10'
                  }`}
                >
                  {isWetSurface ? 'MOLHADO' : 'SECO'}
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="grid grid-cols-2 gap-4 bg-[#f8f7f4] p-4 rounded-2xl border border-[#1a1a1a]/10">
            <div className="text-center p-3 rounded-xl bg-white border border-[#1a1a1a]/10">
              <span className="meta text-[#1a1a1a]/60 block text-[10px]">PNEU DIANTEIRO</span>
              <span className="font-mono-numbers text-3xl font-bold text-[#2c52a1]">
                {recommendedPSI.front}{' '}
                <span className="text-xs font-sans text-[#1a1a1a]/60">PSI</span>
              </span>
              <span className="text-[11px] text-[#1a1a1a]/60 block mt-0.5">Aderência e absorção</span>
            </div>
            <div className="text-center p-3 rounded-xl bg-white border border-[#1a1a1a]/10">
              <span className="meta text-[#1a1a1a]/60 block text-[10px]">PNEU TRASEIRO</span>
              <span className="font-mono-numbers text-3xl font-bold text-[#2c52a1]">
                {recommendedPSI.rear}{' '}
                <span className="text-xs font-sans text-[#1a1a1a]/60">PSI</span>
              </span>
              <span className="text-[11px] text-[#1a1a1a]/60 block mt-0.5">Suporte de tração e carga</span>
            </div>
          </div>
        </div>

        {/* Quick Lube & Chain Check (1 column) */}
        <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#2c52a1] flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a]">
                Lubrificação da Corrente
              </h4>
            </div>
            <p className="text-xs text-[#1a1a1a]/70 mb-4">
              Última aplicação registrada há 65 km. Cera cerâmica recomendada a cada 120–150 km em piso seco.
            </p>
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-xs font-mono-numbers">
                <span className="meta text-[#1a1a1a]/60">AUTONOMIA CERA</span>
                <span className="text-[#2c52a1] font-bold">65 / 150 KM</span>
              </div>
              <div className="w-full h-2 bg-[#1a1a1a]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#2c52a1] rounded-full" style={{ width: '43%' }} />
              </div>
            </div>
          </div>

          <button
            onClick={() => onResetKm('corrente')}
            className="w-full py-2.5 px-4 rounded-full bg-[#f8f7f4] hover:bg-[#2c52a1] text-[#1a1a1a] hover:text-white border border-[#1a1a1a]/10 text-xs font-mono-numbers uppercase font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Registrar Nova Lubrificação
          </button>
        </div>
      </div>

      {/* Component Wear List with Category Filter */}
      <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#2c52a1] flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h4 className="font-serif-display text-2xl font-bold text-[#1a1a1a]">
              Monitor de Desgaste dos Componentes
            </h4>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'todos', label: 'TODOS' },
              { key: 'transmissao', label: 'TRANSMISSÃO' },
              { key: 'freios', label: 'FREIOS' },
              { key: 'pneus', label: 'PNEUS' },
              { key: 'suspensao', label: 'SUSPENSÃO' }
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilterCategory(cat.key)}
                className={`text-xs px-3.5 py-1 rounded-full font-mono-numbers transition-all cursor-pointer border ${
                  filterCategory === cat.key
                    ? 'bg-[#2c52a1] text-white font-bold border-[#2c52a1]'
                    : 'bg-[#f8f7f4] text-[#1a1a1a]/70 border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComponents.map((comp) => {
            const usagePercent = Math.min(100, Math.round((comp.currentKm / comp.maxRecommendedKm) * 100));
            const isCritical = comp.status === 'critico' || usagePercent >= 90;
            const isAttention = comp.status === 'atencao' || (usagePercent >= 75 && !isCritical);

            return (
              <div
                key={comp.id}
                className="p-5 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10 hover:border-[#2c52a1]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h5 className="font-serif-display text-lg font-bold text-[#1a1a1a]">{comp.name}</h5>
                    <span className="meta text-[#1a1a1a]/60 block text-[11px] mt-0.5">{comp.partDetails}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono-numbers uppercase font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                      isCritical
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : isAttention
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {isCritical ? 'TROCA URGENTE' : isAttention ? 'ATENÇÃO' : 'EXCELENTE'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-3.5">
                  <div className="flex justify-between text-xs font-mono-numbers">
                    <span className="text-[#1a1a1a]/60">
                      {comp.currentKm} KM / {comp.maxRecommendedKm} KM
                    </span>
                    <span
                      className={`font-bold ${
                        isCritical ? 'text-rose-600' : isAttention ? 'text-amber-600' : 'text-[#2c52a1]'
                      }`}
                    >
                      {usagePercent}% USADO
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1a1a1a]/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical ? 'bg-rose-600' : isAttention ? 'bg-amber-500' : 'bg-[#2c52a1]'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                {/* Tips and Advice */}
                <p className="text-xs text-[#1a1a1a]/70 mb-4 bg-white p-3 rounded-xl border border-[#1a1a1a]/10">
                  {comp.tips}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]/10">
                  <span className="meta text-[#1a1a1a]/50 text-[10px]">
                    ÚLTIMA REVISÃO: {comp.lastServiceDate}
                  </span>
                  <button
                    onClick={() => onResetKm(comp.id)}
                    className="text-xs font-mono-numbers uppercase font-bold px-3 py-1.5 rounded-full bg-white hover:bg-[#2c52a1] text-[#1a1a1a] hover:text-white border border-[#1a1a1a]/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Zerar / Nova Peça
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
