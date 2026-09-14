import React, { useState } from 'react';
import {
  RideSession
} from '../types';
import {
  formatDuration,
  formatPace,
  getHRZone
} from '../utils/geo';
import {
  exportToGPX,
  exportToTCX,
  exportToJSON
} from '../utils/export';
import {
  Calendar,
  Clock,
  Compass,
  Zap,
  Flame,
  Mountain,
  Heart,
  Download,
  Share2,
  FileCode,
  FileSpreadsheet,
  Award,
  ChevronRight,
  TrendingUp,
  Activity,
  ArrowUpRight
} from 'lucide-react';

interface WorkoutsHistoryProps {
  rides: RideSession[];
  onOpenShareModal: (ride: RideSession) => void;
}

export const WorkoutsHistory: React.FC<WorkoutsHistoryProps> = ({
  rides,
  onOpenShareModal
}) => {
  const [selectedRide, setSelectedRide] = useState<RideSession | null>(rides[0] || null);

  // Totals for header summary
  const totalKm = rides.reduce((acc, r) => acc + r.distance, 0);
  const totalHours = Math.round(rides.reduce((acc, r) => acc + r.duration, 0) / 3600);
  const totalCalories = rides.reduce((acc, r) => acc + r.calories, 0);
  const totalElevation = rides.reduce((acc, r) => acc + r.elevationGain, 0);

  // Performance Report Analytics
  const calculateTSS = (ride: RideSession) => {
    // Training Stress Score approximation
    const intensityFactor = Math.min(1.1, (ride.avgSpeed / 32));
    const hours = ride.duration / 3600;
    return Math.round(hours * Math.pow(intensityFactor, 2) * 100);
  };

  const calculateWatts = (ride: RideSession) => {
    // Estimated average watts
    return Math.round(130 + (ride.avgSpeed - 18) * 6.5 + (ride.elevationGain / (ride.distance || 1)) * 3);
  };

  const getRecoveryHours = (tss: number) => {
    if (tss > 150) return '36 a 48 horas';
    if (tss > 100) return '24 a 36 horas';
    if (tss > 60) return '18 a 24 horas';
    return '12 a 18 horas';
  };

  return (
    <div id="workouts-history-section" className="space-y-6">
      {/* Historic Totals Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Distância Total</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400">
            {totalKm.toFixed(1)} <span className="text-xs text-slate-400 font-sans">km</span>
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Horas no Selim</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-cyan-400">
            {totalHours}h <span className="text-xs text-slate-400 font-sans">pedaladas</span>
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Calorias Queimadas</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-amber-400">
            {totalCalories.toLocaleString()} <span className="text-xs text-slate-400 font-sans">kcal</span>
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Ganho Vertical</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-indigo-400">
            +{totalElevation.toLocaleString()} <span className="text-xs text-slate-400 font-sans">m</span>
          </span>
        </div>
      </div>

      {/* Main Container: Left Ride List + Right Comprehensive Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Rides (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="font-bold text-slate-100 text-sm flex items-center justify-between">
            <span>Histórico de Atividades Gravadas ({rides.length})</span>
            <span className="text-xs text-emerald-400 font-medium">Mais recentes primeiro</span>
          </h4>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {rides.map((ride) => {
              const isSelected = selectedRide?.id === ride.id;
              return (
                <div
                  key={ride.id}
                  onClick={() => setSelectedRide(ride)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h5 className="font-bold text-slate-100 text-sm">{ride.title}</h5>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {ride.date}
                        <span>•</span>
                        <span className="capitalize text-emerald-400">{ride.category}</span>
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-emerald-400 rotate-90' : 'text-slate-500'
                      }`}
                    />
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Distância</span>
                      <span className="font-mono text-xs font-bold text-slate-100">
                        {ride.distance} km
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tempo</span>
                      <span className="font-mono text-xs font-bold text-slate-100">
                        {formatDuration(ride.duration)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Velocidade Média</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {ride.avgSpeed} km/h
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail & Performance Report (7 cols) */}
        {selectedRide ? (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
            {/* Header with Title and Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  Relatório Pós-Atividade
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-0.5">{selectedRide.title}</h3>
                <span className="text-xs text-slate-400">{selectedRide.date}</span>
              </div>

              {/* Share & Export Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-share-ride-card"
                  onClick={() => onOpenShareModal(selectedRide)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Compartilhar Card
                </button>

                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                  <button
                    onClick={() => exportToGPX(selectedRide)}
                    className="px-2 py-1 rounded text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Exportar formato GPX (Strava / Garmin)"
                  >
                    .GPX
                  </button>
                  <button
                    onClick={() => exportToTCX(selectedRide)}
                    className="px-2 py-1 rounded text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Exportar formato TCX (Apple Health / Wahoo)"
                  >
                    .TCX
                  </button>
                  <button
                    onClick={() => exportToJSON(selectedRide)}
                    className="px-2 py-1 rounded text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Exportar JSON Completo"
                  >
                    .JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Analytics: TSS, Watts, Recovery Advisor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Carga de Estresse (TSS)</span>
                <span className="font-mono text-2xl font-black text-amber-400">
                  {calculateTSS(selectedRide)}
                </span>
                <span className="text-[10px] text-slate-500 block">Treino Moderado/Intenso</span>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Potência Média Estimada</span>
                <span className="font-mono text-2xl font-black text-cyan-400">
                  {calculateWatts(selectedRide)}{' '}
                  <span className="text-xs font-sans text-slate-400">W</span>
                </span>
                <span className="text-[10px] text-slate-500 block">Eficiência de pedalada</span>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Tempo de Recuperação</span>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  {getRecoveryHours(calculateTSS(selectedRide))}
                </span>
                <span className="text-[10px] text-slate-500 block">Sono e hidratação recomendados</span>
              </div>
            </div>

            {/* Complete Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 block">Velocidade Máxima</span>
                <span className="font-mono text-base font-bold text-slate-100">
                  {selectedRide.maxSpeed} km/h
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Ritmo Médio</span>
                <span className="font-mono text-base font-bold text-slate-100">
                  {formatPace(selectedRide.avgSpeed)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Ganho de Elevação</span>
                <span className="font-mono text-base font-bold text-indigo-400">
                  +{selectedRide.elevationGain} m
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Cadência Média</span>
                <span className="font-mono text-base font-bold text-slate-100">
                  {selectedRide.avgCadence || 82} RPM
                </span>
              </div>
            </div>

            {/* Heart Rate Zones Distribution Bar */}
            {selectedRide.avgHeartRate && (
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-slate-200">
                      Distribuição em Zonas de Frequência Cardíaca
                    </span>
                  </div>
                  <span className="font-mono text-xs text-rose-400">
                    Média: {selectedRide.avgHeartRate} BPM (Máx: {selectedRide.maxHeartRate} BPM)
                  </span>
                </div>

                {/* Stacked colored zones bar */}
                <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-800">
                  <div style={{ width: '15%' }} className="bg-sky-500" title="Z1 Recuperação: 15%" />
                  <div style={{ width: '45%' }} className="bg-emerald-500" title="Z2 Aeróbica: 45%" />
                  <div style={{ width: '25%' }} className="bg-amber-500" title="Z3 Tempo: 25%" />
                  <div style={{ width: '12%' }} className="bg-orange-500" title="Z4 Limiar: 12%" />
                  <div style={{ width: '3%' }} className="bg-rose-500" title="Z5 Anaeróbica: 3%" />
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500" /> Z1 (15%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Z2 (45%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Z3 (25%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> Z4 (12%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Z5 (3%)
                  </span>
                </div>
              </div>
            )}

            {/* Notes / Weather */}
            {selectedRide.notes && (
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-300">
                <span className="text-slate-500 block mb-0.5 font-semibold">Anotações do Ciclista:</span>
                "{selectedRide.notes}"
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
