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
      {/* Top Health Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              Saúde Global da Bicicleta
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
              Manutenção Preventiva & Componentes
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Acompanhamento inteligente de desgaste por quilometragem percorrida. Evite quebras na estrada e economize com trocas no momento exato.
            </p>
          </div>

          {/* Big Circular Score */}
          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${totalScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-lg font-mono text-emerald-400">
                {totalScore}%
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Status da Bike</span>
              <span className="font-bold text-slate-100 text-sm">
                {totalScore >= 80 ? 'Excelente Condição' : totalScore >= 60 ? 'Revisão Recomendada' : 'Atenção Crítica'}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {components.filter((c) => c.status !== 'otimo').length} alertas pendentes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Interactive Tire Pressure Calculator + Lube Alert */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tire Pressure Calculator (2 columns) */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-100 text-sm sm:text-base">
                Calculadora Dinâmica de Pressão (PSI)
              </h4>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
              Baseada em Física do Rolamento
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Peso do Ciclista: <span className="text-cyan-400 font-mono font-bold">{cyclistWeight} kg</span>
              </label>
              <input
                type="range"
                min="45"
                max="120"
                value={cyclistWeight}
                onChange={(e) => setCyclistWeight(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Tipo de Modalidade</label>
              <div className="grid grid-cols-3 gap-1">
                {(['estrada', 'gravel', 'mtb'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTireType(t)}
                    className={`text-[11px] py-1 rounded font-medium capitalize border transition-all ${
                      tireType === t
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Condições</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTubeless(!isTubeless)}
                  className={`text-[11px] px-2 py-1 rounded font-medium border flex-1 transition-all ${
                    isTubeless
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isTubeless ? '✓ Tubeless' : 'Câmara'}
                </button>
                <button
                  onClick={() => setIsWetSurface(!isWetSurface)}
                  className={`text-[11px] px-2 py-1 rounded font-medium border flex-1 transition-all ${
                    isWetSurface
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isWetSurface ? 'Piso Molhado' : 'Piso Seco'}
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Pneu Dianteiro</span>
              <span className="font-mono text-2xl font-black text-cyan-400">
                {recommendedPSI.front}{' '}
                <span className="text-xs font-sans text-slate-400">PSI</span>
              </span>
              <span className="text-[10px] text-slate-500 block">Mais conforto & grip</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Pneu Traseiro</span>
              <span className="font-mono text-2xl font-black text-cyan-400">
                {recommendedPSI.rear}{' '}
                <span className="text-xs font-sans text-slate-400">PSI</span>
              </span>
              <span className="text-[10px] text-slate-500 block">Suporta maior carga</span>
            </div>
          </div>
        </div>

        {/* Quick Lube & Chain Check (1 column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-100 text-sm">
                Lubrificação da Corrente
              </h4>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Última aplicação feita há 65 km. Recomendado reaplicar cera cerâmica a cada 120-150 km.
            </p>
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Autonomia do lubrificante</span>
                <span className="text-amber-400 font-mono">65 / 150 km</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '43%' }} />
              </div>
            </div>
          </div>

          <button
            onClick={() => onResetKm('corrente')}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            Registrar Nova Lubrificação
          </button>
        </div>
      </div>

      {/* Component Wear List with Category Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-slate-100 text-base">
              Monitor de Desgaste dos Componentes
            </h4>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'transmissao', label: 'Transmissão' },
              { key: 'freios', label: 'Freios' },
              { key: 'pneus', label: 'Pneus' },
              { key: 'suspensao', label: 'Suspensão' }
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilterCategory(cat.key)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-all ${
                  filterCategory === cat.key
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredComponents.map((comp) => {
            const usagePercent = Math.min(100, Math.round((comp.currentKm / comp.maxRecommendedKm) * 100));
            const isCritical = comp.status === 'critico' || usagePercent >= 90;
            const isAttention = comp.status === 'atencao' || (usagePercent >= 75 && !isCritical);

            return (
              <div
                key={comp.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-800/60 shadow-lg shadow-rose-950/20'
                    : isAttention
                    ? 'bg-amber-950/20 border-amber-800/60'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <h5 className="font-bold text-slate-100 text-sm">{comp.name}</h5>
                    <span className="text-[11px] text-slate-400">{comp.partDetails}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : isAttention
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isCritical ? 'Troca Urgente' : isAttention ? 'Atenção' : 'Excelente'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      {comp.currentKm} km / {comp.maxRecommendedKm} km
                    </span>
                    <span
                      className={`font-bold ${
                        isCritical ? 'text-rose-400' : isAttention ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {usagePercent}% usado
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical ? 'bg-rose-500' : isAttention ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                {/* Tips and Advice */}
                <p className="text-xs text-slate-300 mb-3 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                  {comp.tips}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-500">
                    Última revisão: {comp.lastServiceDate}
                  </span>
                  <button
                    onClick={() => onResetKm(comp.id)}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 text-emerald-400" />
                    Zerar / Peça Nova
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
