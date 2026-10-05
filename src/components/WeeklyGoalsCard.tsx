import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  Clock,
  Bike,
  Trophy,
  Flame,
  Mountain,
  Calendar,
  Sparkles,
  TrendingUp,
  Edit3,
  Check,
  RotateCcw,
  Plus,
  Minus,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RideSession, WeeklyGoal } from '../types';

interface WeeklyGoalsCardProps {
  rides: RideSession[];
  batterySaver?: boolean;
  onGoalCompleted?: (type: 'distance' | 'time' | 'both') => void;
}

const DEFAULT_GOAL: WeeklyGoal = {
  targetDistanceKm: 120,
  targetTimeHours: 5.5
};

const PRESETS = [
  { label: 'Iniciante', distance: 50, hours: 2.5, desc: '3 treinos curtos' },
  { label: 'Intermediário', distance: 100, hours: 4.5, desc: 'Foco em ritmo' },
  { label: 'Avançado', distance: 150, hours: 6.5, desc: 'Resistência aeróbica' },
  { label: 'Gran Fondo', distance: 220, hours: 9.0, desc: 'Volume de prova' }
];

export const WeeklyGoalsCard: React.FC<WeeklyGoalsCardProps> = ({
  rides,
  batterySaver = false,
  onGoalCompleted
}) => {
  // Saved goal state
  const [goal, setGoal] = useState<WeeklyGoal>(() => {
    try {
      const saved = localStorage.getItem('ciclotrack_weekly_goals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.targetDistanceKm === 'number' && typeof parsed.targetTimeHours === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      // Fallback
    }
    return DEFAULT_GOAL;
  });

  // Editing mode toggle
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempDistance, setTempDistance] = useState<number>(goal.targetDistanceKm);
  const [tempHours, setTempHours] = useState<number>(goal.targetTimeHours);
  const [celebrated, setCelebrated] = useState<boolean>(false);

  // Save changes to localStorage
  const handleSaveGoal = () => {
    const newGoal: WeeklyGoal = {
      targetDistanceKm: Math.max(5, Math.round(tempDistance)),
      targetTimeHours: Math.max(0.5, parseFloat(tempHours.toFixed(1)))
    };
    setGoal(newGoal);
    try {
      localStorage.setItem('ciclotrack_weekly_goals', JSON.stringify(newGoal));
    } catch (e) {}
    setIsEditing(false);
  };

  const handleApplyPreset = (dist: number, hours: number) => {
    setTempDistance(dist);
    setTempHours(hours);
  };

  // Calculate current week's metrics from rides
  const weekStats = useMemo(() => {
    const now = new Date();
    // Monday of current week
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Filter rides within current week or rolling 7 days (whichever captures active sessions)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const mondayTimestamp = monday.getTime();

    // Use Monday start, but if today is Monday and user has rides from last 7 days, include them so it's not empty
    const cutoff = Math.min(mondayTimestamp, sevenDaysAgo);

    const weekRides = rides.filter((r) => {
      const rTime = r.startTime || (r.date ? new Date(r.date).getTime() : 0);
      return rTime >= cutoff;
    });

    const totalDistance = weekRides.reduce((acc, r) => acc + (r.distance || 0), 0);
    const totalDurationSecs = weekRides.reduce((acc, r) => acc + (r.duration || 0), 0);
    const totalElevation = weekRides.reduce((acc, r) => acc + (r.elevationGain || 0), 0);
    const totalCalories = weekRides.reduce((acc, r) => acc + (r.calories || 0), 0);

    const totalHours = totalDurationSecs / 3600;

    // Days remaining in the week (including today)
    const daysRemaining = Math.max(1, 7 - distanceToMonday);

    // Format week date range
    const formatRange = `${monday.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })} a ${sunday.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })}`;

    return {
      ridesCount: weekRides.length,
      totalDistance: parseFloat(totalDistance.toFixed(1)),
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalDurationSecs,
      totalElevation: Math.round(totalElevation),
      totalCalories: Math.round(totalCalories),
      daysRemaining,
      weekRange: formatRange
    };
  }, [rides]);

  // Progress percentages
  const distanceProgress = Math.min(100, Math.round((weekStats.totalDistance / goal.targetDistanceKm) * 100));
  const rawDistanceProgress = Math.round((weekStats.totalDistance / goal.targetDistanceKm) * 100);

  const timeProgress = Math.min(100, Math.round((weekStats.totalHours / goal.targetTimeHours) * 100));
  const rawTimeProgress = Math.round((weekStats.totalHours / goal.targetTimeHours) * 100);

  const overallProgress = Math.round((distanceProgress + timeProgress) / 2);
  const isGoalAccomplished = distanceProgress >= 100 && timeProgress >= 100;
  const isDistanceMet = distanceProgress >= 100;
  const isTimeMet = timeProgress >= 100;

  // Trigger celebratory confetti once goal is met
  useEffect(() => {
    if ((isDistanceMet || isTimeMet) && !celebrated) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 }
        });
        setCelebrated(true);
      } catch (e) {}
    }
  }, [isDistanceMet, isTimeMet, celebrated]);

  // Daily target pace recommendations
  const remainingDistance = Math.max(0, goal.targetDistanceKm - weekStats.totalDistance);
  const remainingHours = Math.max(0, goal.targetTimeHours - weekStats.totalHours);

  const dailyDistanceNeeded = (remainingDistance / weekStats.daysRemaining).toFixed(1);
  const dailyMinutesNeeded = Math.round((remainingHours * 60) / weekStats.daysRemaining);

  // Helper formatting for hours and minutes
  const formatHoursMin = (decimalHours: number) => {
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    return `${h}h ${m < 10 ? '0' : ''}${m}m`;
  };

  return (
    <section
      id="weekly-goals-section"
      className={`rounded-3xl border transition-all ${
        batterySaver
          ? 'bg-black border-slate-800 text-white shadow-xl'
          : 'bg-white border-[#1a1a1a]/10 text-[#1a1a1a] shadow-xs'
      }`}
    >
      {/* Header Container */}
      <div className="p-6 sm:p-7 border-b border-[#1a1a1a]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="meta text-[#2c52a1] font-bold text-xs flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#2c52a1]" />
              PLANO DE TREINAMENTO • METAS DA SEMANA
            </span>
            <span className="text-[10px] font-mono-numbers px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#1a1a1a]/70">
              {weekStats.weekRange}
            </span>
          </div>
          <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
            Metas Semanais de Ciclismo
          </h3>
          <p className="text-xs text-[#1a1a1a]/60 mt-1 max-w-xl">
            Acompanhe a evolução de volume, tempo no selim e ritmo diário sugerido para fechar a semana dentro do planejado.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-edit-weekly-goals"
            onClick={() => {
              if (!isEditing) {
                setTempDistance(goal.targetDistanceKm);
                setTempHours(goal.targetTimeHours);
              }
              setIsEditing(!isEditing);
            }}
            className={`px-4 py-2 rounded-full border text-xs font-bold font-mono-numbers flex items-center gap-2 transition-all cursor-pointer ${
              isEditing
                ? 'bg-[#2c52a1] text-white border-[#2c52a1] shadow-xs'
                : 'bg-[#f8f7f4] hover:bg-[#1a1a1a]/5 text-[#1a1a1a] border-[#1a1a1a]/15'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Fechar Configuração' : 'Definir Metas'}
          </button>
        </div>
      </div>

      {/* Interactive Goal Setting Panel (Expandable) */}
      {isEditing && (
        <div className="p-6 bg-[#f8f7f4] border-b border-[#1a1a1a]/10 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="meta text-xs font-bold text-[#1a1a1a]">
              CONFIGURAR ALVOS DE DISTÂNCIA E TEMPO
            </span>
            <span className="text-[11px] text-[#1a1a1a]/60">
              Ajuste fino com botões ou selecione um preset
            </span>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-bold text-[#1a1a1a]/70 block mb-2 uppercase tracking-wide">
              Presets de Volume:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESETS.map((p) => {
                const isSelected = tempDistance === p.distance && tempHours === p.hours;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplyPreset(p.distance, p.hours)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2c52a1] text-white border-[#2c52a1] shadow-xs'
                        : 'bg-white hover:bg-white/80 text-[#1a1a1a] border-[#1a1a1a]/10'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className={`font-mono-numbers text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-blue-100' : 'text-[#2c52a1]'}`}>
                      {p.distance} km • {p.hours}h
                    </div>
                    <div className={`text-[10px] mt-1 ${isSelected ? 'text-blue-200' : 'text-[#1a1a1a]/50'}`}>
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Distance & Time Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Distance Target Input */}
            <div className="p-4 rounded-2xl bg-white border border-[#1a1a1a]/10 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1a1a1a] flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-[#2c52a1]" />
                  Distância Alvo (Quilômetros)
                </label>
                <span className="font-mono-numbers font-bold text-lg text-[#2c52a1]">
                  {tempDistance} km
                </span>
              </div>

              {/* Increments */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTempDistance((d) => Math.max(10, d - 10))}
                  className="px-2.5 py-1.5 rounded-lg border border-[#1a1a1a]/10 bg-[#f8f7f4] hover:bg-[#1a1a1a]/5 text-xs font-bold font-mono-numbers cursor-pointer"
                >
                  -10 km
                </button>
                <button
                  type="button"
                  onClick={() => setTempDistance((d) => Math.max(5, d - 5))}
                  className="px-2.5 py-1.5 rounded-lg border border-[#1a1a1a]/10 bg-[#f8f7f4] hover:bg-[#1a1a1a]/5 text-xs font-bold font-mono-numbers cursor-pointer"
                >
                  -5 km
                </button>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  step="5"
                  value={tempDistance}
                  onChange={(e) => setTempDistance(Math.max(1, Number(e.target.value) || 0))}
                  className="flex-1 py-1 px-3 text-center border border-[#1a1a1a]/15 rounded-lg font-mono-numbers font-bold text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => setTempDistance((d) => d + 5)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#1a1a1a]/10 bg-[#f8f7f4] hover:bg-[#1a1a1a]/5 text-xs font-bold font-mono-numbers cursor-pointer"
                >
                  +5 km
                </button>
                <button
                  type="button"
                  onClick={() => setTempDistance((d) => d + 10)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#1a1a1a]/10 bg-[#f8f7f4] hover:bg-[#1a1a1a]/5 text-xs font-bold font-mono-numbers cursor-pointer"
                >
                  +10 km
                </button>
              </div>
            </div>

            {/* Time Target Input */}
            <div className="p-4 rounded-2xl bg-white border border-[#1a1a1a]/10 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1a1a1a] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#2c52a1]" />
                  Tempo de Pedal Alvo (Horas)
                </label>
                <span className="font-mono-numbers font-bold text-lg text-[#2c52a1]">
                  {formatHoursMin(tempHours)}
                </span>
              </div>

              {/* Increments */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTempHours((h) => Math.max(0.5, parseFloat((h - 1).toFixed(1))))}
                  className="px-2.5 py-1.5 rounded-lg border border-[#1a1a1a]/10 bg-[#f8f7f4] hover:bg-[#1a1a1a]/5 text-xs font-bold font-mono-numbers cursor-pointer"
                >
                  -1h
                </button>
                <button
                  type="button"
                  onClick={() => setTempHours((h) => Math.max(0.5, parseFloat((h - 0.5).toFixed(1))))}
                  className="px-2.5 py-1.5 rounded-lg border border-[#1a1a1a]/10 bg-[#f8f7f4] hover:bg-[#1a1a1a]/5 text-xs font-bold font-mono-numbers cursor-pointer"
                >
                  -30m
                </button>
                <input
                  type="number"
                  min="0.5"
                  max="40"
                  step="0.5"
                  value={tempHours}
                  onChange={(e) => setTempHours(Math.max(0.5, Number(e.target.value) || 0))}
                  className="flex-1 py-1 px-3 text-center border border-[#1a1a1a]/15 rounded-lg font-mono-numbers font-bold text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => setTempHours((h) => parseFloat((h + 0.5).toFixed(1)))}
                  className="px-2.5 py-1.5 rounded-lg border border-[#1a1a1a]/10 bg-[#f8f7f4] hover:bg-[#1a1a1a]/5 text-xs font-bold font-mono-numbers cursor-pointer"
                >
                  +30m
                </button>
                <button
                  type="button"
                  onClick={() => setTempHours((h) => parseFloat((h + 1).toFixed(1)))}
                  className="px-2.5 py-1.5 rounded-lg border border-[#1a1a1a]/10 bg-[#f8f7f4] hover:bg-[#1a1a1a]/5 text-xs font-bold font-mono-numbers cursor-pointer"
                >
                  +1h
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setTempDistance(DEFAULT_GOAL.targetDistanceKm);
                setTempHours(DEFAULT_GOAL.targetTimeHours);
              }}
              className="px-4 py-2 rounded-full border border-[#1a1a1a]/15 text-xs font-bold text-[#1a1a1a]/70 hover:text-[#1a1a1a] flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar Padrão
            </button>
            <button
              id="btn-save-weekly-goals"
              type="button"
              onClick={handleSaveGoal}
              className="px-6 py-2.5 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white text-xs font-bold font-mono-numbers flex items-center gap-2 shadow-sm cursor-pointer uppercase tracking-wider"
            >
              <Check className="w-4 h-4" />
              Salvar Metas
            </button>
          </div>
        </div>
      )}

      {/* Main Goal Progress Dashboard Grid */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* Top Highlight Banner if completed or on track */}
        {isGoalAccomplished ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 block">
                  PARABÉNS! METAS SEMANAIS SUPERADAS 🏆
                </span>
                <span className="text-[11px] text-emerald-700 block">
                  Você cumpriu o volume de distância e tempo estipulados para esta semana com excelente consistência.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                try {
                  confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
                } catch (e) {}
              }}
              className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono-numbers shrink-0 cursor-pointer shadow-xs"
            >
              Comemorar 🎉
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#1a1a1a]/70 bg-[#f8f7f4] px-4 py-3 rounded-2xl border border-[#1a1a1a]/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2c52a1]" />
              <span>
                Faltam <strong>{weekStats.daysRemaining} {weekStats.daysRemaining === 1 ? 'dia' : 'dias'}</strong> no ciclo semanal.
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              {remainingDistance > 0 ? (
                <span>
                  Sugestão diária: <strong className="text-[#2c52a1] font-mono-numbers">{dailyDistanceNeeded} km/dia</strong>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">✓ Distância semanal concluída</span>
              )}
              {remainingHours > 0 ? (
                <span>
                  Tempo diário: <strong className="text-[#2c52a1] font-mono-numbers">{dailyMinutesNeeded} min/dia</strong>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">✓ Tempo semanal concluído</span>
              )}
            </div>
          </div>
        )}

        {/* The Two Main Progress Visualizers (Distance & Time) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PROGRESS 1: DISTÂNCIA ALVO */}
          <div className="p-5 rounded-2xl border border-[#1a1a1a]/10 bg-white space-y-4 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#2c52a1]">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <span className="meta text-[10px] text-[#1a1a1a]/60 block font-bold">
                    VOLUME DE RODAGEM
                  </span>
                  <h4 className="font-serif-display text-lg font-bold text-[#1a1a1a]">
                    Distância Semanal
                  </h4>
                </div>
              </div>

              {/* Progress Percentage Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-mono-numbers font-bold border ${
                isDistanceMet
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-blue-50 text-[#2c52a1] border-blue-200'
              }`}>
                {rawDistanceProgress}%
              </div>
            </div>

            {/* Numbers Display */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="font-mono-numbers text-3xl sm:text-4xl font-bold text-[#1a1a1a]">
                  {weekStats.totalDistance}
                </span>
                <span className="meta text-xs text-[#1a1a1a]/60 ml-1.5 font-bold">KM REALIZADOS</span>
              </div>
              <div className="text-right">
                <span className="meta text-[10px] text-[#1a1a1a]/50 block">ALVO DEFINIDO</span>
                <span className="font-mono-numbers text-lg font-bold text-[#2c52a1]">
                  {goal.targetDistanceKm} <span className="text-xs">km</span>
                </span>
              </div>
            </div>

            {/* VISUAL LOADING PROGRESS BAR */}
            <div className="space-y-1.5">
              <div className="h-4 w-full rounded-full bg-[#1a1a1a]/8 overflow-hidden p-0.5 border border-[#1a1a1a]/10 relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                    isDistanceMet
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm'
                      : 'bg-gradient-to-r from-[#2c52a1] to-blue-500 shadow-sm'
                  }`}
                  style={{ width: `${distanceProgress}%` }}
                >
                  {/* Subtle shine / pulse animation inside bar */}
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse opacity-50" />
                </div>
              </div>

              {/* Milestone Markers */}
              <div className="flex justify-between text-[10px] font-mono-numbers text-[#1a1a1a]/40 px-1 pt-0.5">
                <span>0 km</span>
                <span>{(goal.targetDistanceKm * 0.25).toFixed(0)} km</span>
                <span>{(goal.targetDistanceKm * 0.5).toFixed(0)} km (50%)</span>
                <span>{(goal.targetDistanceKm * 0.75).toFixed(0)} km</span>
                <span className="font-bold text-[#1a1a1a]/70">{goal.targetDistanceKm} km (100%)</span>
              </div>
            </div>

            {/* Status explanation */}
            <div className="pt-1 text-xs flex items-center justify-between border-t border-[#1a1a1a]/5">
              {isDistanceMet ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Meta superada em +{(weekStats.totalDistance - goal.targetDistanceKm).toFixed(1)} km!
                </span>
              ) : (
                <span className="text-[#1a1a1a]/60 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#2c52a1]" />
                  Faltam <strong>{remainingDistance.toFixed(1)} km</strong> para atingir 100%
                </span>
              )}
              <span className="meta text-[10px] text-[#1a1a1a]/50">
                {weekStats.ridesCount} {weekStats.ridesCount === 1 ? 'pedal registrado' : 'pedais registrados'}
              </span>
            </div>
          </div>

          {/* PROGRESS 2: TEMPO ALVO */}
          <div className="p-5 rounded-2xl border border-[#1a1a1a]/10 bg-white space-y-4 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="meta text-[10px] text-[#1a1a1a]/60 block font-bold">
                    TEMPO NO SELIM
                  </span>
                  <h4 className="font-serif-display text-lg font-bold text-[#1a1a1a]">
                    Duração Acumulada
                  </h4>
                </div>
              </div>

              {/* Progress Percentage Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-mono-numbers font-bold border ${
                isTimeMet
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {rawTimeProgress}%
              </div>
            </div>

            {/* Numbers Display */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="font-mono-numbers text-3xl sm:text-4xl font-bold text-[#1a1a1a]">
                  {formatHoursMin(weekStats.totalHours)}
                </span>
                <span className="meta text-xs text-[#1a1a1a]/60 ml-1.5 font-bold">EM ATIVIDADE</span>
              </div>
              <div className="text-right">
                <span className="meta text-[10px] text-[#1a1a1a]/50 block">ALVO DEFINIDO</span>
                <span className="font-mono-numbers text-lg font-bold text-amber-700">
                  {formatHoursMin(goal.targetTimeHours)}
                </span>
              </div>
            </div>

            {/* VISUAL LOADING PROGRESS BAR */}
            <div className="space-y-1.5">
              <div className="h-4 w-full rounded-full bg-[#1a1a1a]/8 overflow-hidden p-0.5 border border-[#1a1a1a]/10 relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                    isTimeMet
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm'
                  }`}
                  style={{ width: `${timeProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse opacity-50" />
                </div>
              </div>

              {/* Milestone Markers */}
              <div className="flex justify-between text-[10px] font-mono-numbers text-[#1a1a1a]/40 px-1 pt-0.5">
                <span>0h</span>
                <span>{(goal.targetTimeHours * 0.25).toFixed(1)}h</span>
                <span>{(goal.targetTimeHours * 0.5).toFixed(1)}h (50%)</span>
                <span>{(goal.targetTimeHours * 0.75).toFixed(1)}h</span>
                <span className="font-bold text-[#1a1a1a]/70">{goal.targetTimeHours}h (100%)</span>
              </div>
            </div>

            {/* Status explanation */}
            <div className="pt-1 text-xs flex items-center justify-between border-t border-[#1a1a1a]/5">
              {isTimeMet ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Meta de tempo concluída com sucesso!
                </span>
              ) : (
                <span className="text-[#1a1a1a]/60 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Restam <strong>{formatHoursMin(remainingHours)}</strong> de pedal
                </span>
              )}
              <span className="meta text-[10px] text-[#1a1a1a]/50">
                Média de {(weekStats.totalDistance / Math.max(0.1, weekStats.totalHours)).toFixed(1)} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Auxiliary Metrics Bar: Elevation, Calories, Average Speed */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10">
            <div className="flex items-center gap-1.5 meta text-[10px] text-[#1a1a1a]/60 mb-1">
              <Mountain className="w-3 h-3 text-[#2c52a1]" />
              ALTIMETRIA DA SEMANA
            </div>
            <div className="font-mono-numbers text-xl font-bold text-[#1a1a1a]">
              +{weekStats.totalElevation} <span className="meta text-xs">M</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10">
            <div className="flex items-center gap-1.5 meta text-[10px] text-[#1a1a1a]/60 mb-1">
              <Flame className="w-3 h-3 text-orange-600" />
              GASTO CALÓRICO
            </div>
            <div className="font-mono-numbers text-xl font-bold text-[#1a1a1a]">
              {weekStats.totalCalories} <span className="meta text-xs">KCAL</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10">
            <div className="flex items-center gap-1.5 meta text-[10px] text-[#1a1a1a]/60 mb-1">
              <Bike className="w-3 h-3 text-[#2c52a1]" />
              SESSÕES GRAVADAS
            </div>
            <div className="font-mono-numbers text-xl font-bold text-[#1a1a1a]">
              {weekStats.ridesCount} <span className="meta text-xs">TREINOS</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10">
            <div className="flex items-center gap-1.5 meta text-[10px] text-[#1a1a1a]/60 mb-1">
              <Award className="w-3 h-3 text-emerald-600" />
              ÍNDICE DE CONQUISTA
            </div>
            <div className="font-mono-numbers text-xl font-bold text-[#1a1a1a]">
              {overallProgress}% <span className="meta text-xs">CONCLUÍDO</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
