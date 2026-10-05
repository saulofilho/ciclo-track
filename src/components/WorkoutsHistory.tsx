import React, { useState, useMemo } from 'react';
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
  ArrowUpRight,
  Filter,
  X,
  CalendarDays
} from 'lucide-react';
import { WorkoutPerformanceCharts } from './WorkoutPerformanceCharts';
import { WorkoutsCalendar } from './WorkoutsCalendar';

interface WorkoutsHistoryProps {
  rides: RideSession[];
  onOpenShareModal: (ride: RideSession) => void;
}

export const WorkoutsHistory: React.FC<WorkoutsHistoryProps> = ({
  rides,
  onOpenShareModal
}) => {
  // Annual Filter State
  const [selectedYear, setSelectedYear] = useState<string>('all');
  // Calendar month viewport state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date(2026, 8, 1)); // September 2026 default based on data
  // Specific day filter (when clicked in calendar)
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

  // Helper to extract year from ride
  const getRideYear = (ride: RideSession): string => {
    if (ride.startTime && !isNaN(ride.startTime)) {
      return String(new Date(ride.startTime).getFullYear());
    }
    if (ride.date) {
      const parts = ride.date.split('/');
      if (parts.length === 3) return parts[2];
    }
    return '2026';
  };

  // Helper to format ride to YYYY-MM-DD
  const getRideDayKey = (ride: RideSession): string => {
    if (ride.startTime && !isNaN(ride.startTime)) {
      const d = new Date(ride.startTime);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    if (ride.date) {
      const parts = ride.date.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return '';
  };

  // List of distinct years available in data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    rides.forEach((r) => years.add(getRideYear(r)));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [rides]);

  // Filtered rides according to Year and Day filters
  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      // Annual filter
      if (selectedYear !== 'all') {
        const rideYear = getRideYear(ride);
        if (rideYear !== selectedYear) return false;
      }
      // Day filter
      if (selectedDayFilter) {
        const rideDay = getRideDayKey(ride);
        if (rideDay !== selectedDayFilter) return false;
      }
      return true;
    });
  }, [rides, selectedYear, selectedDayFilter]);

  const [selectedRide, setSelectedRide] = useState<RideSession | null>(rides[0] || null);

  // Auto-sync selectedRide if current selection is filtered out
  React.useEffect(() => {
    if (filteredRides.length > 0) {
      if (!selectedRide || !filteredRides.some((r) => r.id === selectedRide.id)) {
        setSelectedRide(filteredRides[0]);
      }
    } else {
      setSelectedRide(null);
    }
  }, [filteredRides, selectedRide]);

  // Calendar month navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  // When changing year from the filter, also align calendar month if applicable
  const handleChangeYear = (year: string) => {
    setSelectedYear(year);
    setSelectedDayFilter(null);
    if (year !== 'all') {
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedYear)) {
        setCurrentMonthDate((prev) => new Date(parsedYear, prev.getMonth(), 1));
      }
    }
  };

  // Totals for filtered summary banner
  const totalKm = filteredRides.reduce((acc, r) => acc + r.distance, 0);
  const totalHours = Math.round(filteredRides.reduce((acc, r) => acc + r.duration, 0) / 3600);
  const totalCalories = filteredRides.reduce((acc, r) => acc + r.calories, 0);
  const totalElevation = filteredRides.reduce((acc, r) => acc + r.elevationGain, 0);

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
      {/* Calendar View Component: Highlights workout days & enables annual periods */}
      <WorkoutsCalendar
        rides={rides}
        selectedRide={selectedRide}
        onSelectRide={(r) => setSelectedRide(r)}
        selectedYear={selectedYear}
        onChangeYear={handleChangeYear}
        availableYears={availableYears}
        currentMonthDate={currentMonthDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onGoToCurrentMonth={handleGoToCurrentMonth}
        selectedDayFilter={selectedDayFilter}
        onSelectDayFilter={(day) => setSelectedDayFilter(day)}
      />

      {/* Historic Totals Banner - Variation 3 Space Mono & Editorial Neutral */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#1a1a1a]/10 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="meta text-[#1a1a1a]/60">DISTÂNCIA TOTAL</span>
            {selectedYear !== 'all' && (
              <span className="meta text-[10px] text-[#2c52a1] font-bold font-mono-numbers">
                {selectedYear}
              </span>
            )}
          </div>
          <span className="font-mono-numbers text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
            {totalKm.toFixed(1)} <span className="text-xs text-[#1a1a1a]/60 font-sans">km</span>
          </span>
        </div>

        <div className="bg-white border border-[#1a1a1a]/10 p-5 rounded-3xl shadow-xs">
          <span className="meta text-[#1a1a1a]/60 block mb-1">TEMPO NO SELIM</span>
          <span className="font-mono-numbers text-2xl sm:text-3xl font-bold text-[#2c52a1]">
            {totalHours}h <span className="text-xs text-[#1a1a1a]/60 font-sans">pedaladas</span>
          </span>
        </div>

        <div className="bg-white border border-[#1a1a1a]/10 p-5 rounded-3xl shadow-xs">
          <span className="meta text-[#1a1a1a]/60 block mb-1">ENERGIA CONSUMIDA</span>
          <span className="font-mono-numbers text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
            {totalCalories.toLocaleString()} <span className="text-xs text-[#1a1a1a]/60 font-sans">kcal</span>
          </span>
        </div>

        <div className="bg-white border border-[#1a1a1a]/10 p-5 rounded-3xl shadow-xs">
          <span className="meta text-[#1a1a1a]/60 block mb-1">GANHO VERTICAL</span>
          <span className="font-mono-numbers text-2xl sm:text-3xl font-bold text-[#2c52a1]">
            +{totalElevation.toLocaleString()} <span className="text-xs text-[#1a1a1a]/60 font-sans">m</span>
          </span>
        </div>
      </div>

      {/* Main Container: Left Ride List + Right Comprehensive Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Rides (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="meta text-[#1a1a1a]/70 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-[#2c52a1]" />
              <span>
                ATIVIDADES ({filteredRides.length}
                {filteredRides.length !== rides.length ? ` de ${rides.length}` : ''})
              </span>
            </h4>
            <div className="flex items-center gap-2">
              {(selectedYear !== 'all' || selectedDayFilter) && (
                <button
                  id="btn-clear-all-history-filters"
                  onClick={() => {
                    setSelectedYear('all');
                    setSelectedDayFilter(null);
                  }}
                  className="text-[11px] font-mono-numbers font-bold text-[#2c52a1] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Limpar Filtros
                </button>
              )}
              <span className="text-[#2c52a1] font-bold text-xs font-mono-numbers hidden sm:inline">
                CRONOLÓGICO
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
            {filteredRides.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#1a1a1a]/10 rounded-2xl space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-[#1a1a1a]/30" />
                <p className="text-sm font-bold text-[#1a1a1a]">Nenhum treino gravado neste filtro</p>
                <p className="text-xs text-[#1a1a1a]/60">
                  Experimente selecionar "Todos" os anos ou limpar o filtro do dia.
                </p>
                <button
                  onClick={() => {
                    setSelectedYear('all');
                    setSelectedDayFilter(null);
                  }}
                  className="mt-2 px-3 py-1.5 rounded-full bg-[#2c52a1] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Ver Todos os Treinos
                </button>
              </div>
            ) : (
              filteredRides.map((ride) => {
                const isSelected = selectedRide?.id === ride.id;
                return (
                  <div
                    key={ride.id}
                    onClick={() => setSelectedRide(ride)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#2c52a1] shadow-md ring-1 ring-[#2c52a1]'
                      : 'bg-white border-[#1a1a1a]/10 hover:border-[#2c52a1]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h5 className="font-serif-display text-lg font-bold text-[#1a1a1a]">{ride.title}</h5>
                      <span className="meta text-[#1a1a1a]/60 flex items-center gap-1.5 mt-1 text-[11px]">
                        <Calendar className="w-3 h-3" />
                        {ride.date}
                        <span>•</span>
                        <span className="uppercase text-[#2c52a1] font-bold">{ride.category}</span>
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-[#2c52a1] rotate-90' : 'text-[#1a1a1a]/30'
                      }`}
                    />
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 bg-[#f8f7f4] p-3 rounded-xl border border-[#1a1a1a]/10 text-center">
                    <div>
                      <span className="meta text-[#1a1a1a]/50 block text-[9px]">DISTÂNCIA</span>
                      <span className="font-mono-numbers text-xs font-bold text-[#1a1a1a]">
                        {ride.distance} km
                      </span>
                    </div>
                    <div>
                      <span className="meta text-[#1a1a1a]/50 block text-[9px]">DURAÇÃO</span>
                      <span className="font-mono-numbers text-xs font-bold text-[#1a1a1a]">
                        {formatDuration(ride.duration)}
                      </span>
                    </div>
                    <div>
                      <span className="meta text-[#1a1a1a]/50 block text-[9px]">VEL. MÉDIA</span>
                      <span className="font-mono-numbers text-xs font-bold text-[#2c52a1]">
                        {ride.avgSpeed} km/h
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>

        {/* Right Detail & Performance Report (7 cols) */}
        {selectedRide ? (
          <div className="lg:col-span-7 bg-white border border-[#1a1a1a]/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Header with Title and Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1a1a1a]/10">
              <div>
                <span className="meta text-[#2c52a1] block font-bold">
                  RELATÓRIO BIOMÉTRICO PÓS-TREINO
                </span>
                <h3 className="font-serif-display text-2xl font-bold text-[#1a1a1a] mt-1">
                  {selectedRide.title}
                </h3>
                <span className="meta text-[#1a1a1a]/60 text-[11px] mt-0.5 block">{selectedRide.date}</span>
              </div>

              {/* Share & Export Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-share-ride-card"
                  onClick={() => onOpenShareModal(selectedRide)}
                  className="px-4 py-2 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer uppercase tracking-wider"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Compartilhar Card
                </button>

                <div className="flex items-center gap-1 bg-[#f8f7f4] p-1 rounded-full border border-[#1a1a1a]/10">
                  <button
                    onClick={() => exportToGPX(selectedRide)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono-numbers font-bold text-[#1a1a1a]/70 hover:text-white hover:bg-[#2c52a1] transition-colors cursor-pointer"
                    title="Exportar formato GPX (Strava / Garmin)"
                  >
                    .GPX
                  </button>
                  <button
                    onClick={() => exportToTCX(selectedRide)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono-numbers font-bold text-[#1a1a1a]/70 hover:text-white hover:bg-[#2c52a1] transition-colors cursor-pointer"
                    title="Exportar formato TCX (Apple Health / Wahoo)"
                  >
                    .TCX
                  </button>
                  <button
                    onClick={() => exportToJSON(selectedRide)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono-numbers font-bold text-[#1a1a1a]/70 hover:text-white hover:bg-[#2c52a1] transition-colors cursor-pointer"
                    title="Exportar JSON Completo"
                  >
                    .JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Analytics: TSS, Watts, Recovery Advisor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#f8f7f4] p-4 rounded-2xl border border-[#1a1a1a]/10">
                <span className="meta text-[#1a1a1a]/60 block mb-1">CARGA TSS</span>
                <span className="font-mono-numbers text-3xl font-bold text-[#1a1a1a]">
                  {calculateTSS(selectedRide)}
                </span>
                <span className="text-[11px] text-[#1a1a1a]/60 block mt-1">Intensidade calculada</span>
              </div>

              <div className="bg-[#f8f7f4] p-4 rounded-2xl border border-[#1a1a1a]/10">
                <span className="meta text-[#1a1a1a]/60 block mb-1">POTÊNCIA ESTIMADA</span>
                <span className="font-mono-numbers text-3xl font-bold text-[#2c52a1]">
                  {calculateWatts(selectedRide)}{' '}
                  <span className="text-xs font-sans text-[#1a1a1a]/60">W</span>
                </span>
                <span className="text-[11px] text-[#1a1a1a]/60 block mt-1">Potência média mecânica</span>
              </div>

              <div className="bg-[#f8f7f4] p-4 rounded-2xl border border-[#1a1a1a]/10">
                <span className="meta text-[#1a1a1a]/60 block mb-1">RECUPERAÇÃO</span>
                <span className="font-serif-display text-xl font-bold text-[#1a1a1a] block mt-1">
                  {getRecoveryHours(calculateTSS(selectedRide))}
                </span>
                <span className="text-[11px] text-[#1a1a1a]/60 block mt-1">Descanso fisiológico</span>
              </div>
            </div>

            {/* Complete Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8f7f4] p-4 rounded-2xl border border-[#1a1a1a]/10">
              <div>
                <span className="meta text-[#1a1a1a]/60 block text-[10px]">VELOCIDADE MÁX</span>
                <span className="font-mono-numbers text-base font-bold text-[#1a1a1a]">
                  {selectedRide.maxSpeed} km/h
                </span>
              </div>
              <div>
                <span className="meta text-[#1a1a1a]/60 block text-[10px]">RITMO MÉDIO</span>
                <span className="font-mono-numbers text-base font-bold text-[#1a1a1a]">
                  {formatPace(selectedRide.avgSpeed)}
                </span>
              </div>
              <div>
                <span className="meta text-[#1a1a1a]/60 block text-[10px]">ELEVAÇÃO</span>
                <span className="font-mono-numbers text-base font-bold text-[#2c52a1]">
                  +{selectedRide.elevationGain} m
                </span>
              </div>
              <div>
                <span className="meta text-[#1a1a1a]/60 block text-[10px]">CADÊNCIA MÉDIA</span>
                <span className="font-mono-numbers text-base font-bold text-[#1a1a1a]">
                  {selectedRide.avgCadence || 82} RPM
                </span>
              </div>
            </div>

            {/* Performance Analytics & Interactive Charts (Recharts) */}
            <WorkoutPerformanceCharts ride={selectedRide} />

            {/* Heart Rate Zones Distribution Bar */}
            {selectedRide.avgHeartRate && (
              <div className="space-y-3 bg-[#f8f7f4] p-5 rounded-2xl border border-[#1a1a1a]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    <span className="meta text-[#1a1a1a] font-bold">
                      ZONAS CARDÍACAS (BPM)
                    </span>
                  </div>
                  <span className="font-mono-numbers text-xs text-[#1a1a1a]/80 font-bold">
                    MÉDIA: {selectedRide.avgHeartRate} BPM • MÁX: {selectedRide.maxHeartRate} BPM
                  </span>
                </div>

                {/* Stacked colored zones bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#1a1a1a]/10">
                  <div style={{ width: '15%' }} className="bg-sky-400" title="Z1 Recuperação: 15%" />
                  <div style={{ width: '45%' }} className="bg-emerald-500" title="Z2 Aeróbica: 45%" />
                  <div style={{ width: '25%' }} className="bg-amber-400" title="Z3 Tempo: 25%" />
                  <div style={{ width: '12%' }} className="bg-orange-500" title="Z4 Limiar: 12%" />
                  <div style={{ width: '3%' }} className="bg-rose-500" title="Z5 Anaeróbica: 3%" />
                </div>

                <div className="flex flex-wrap items-center justify-between meta text-[10px] text-[#1a1a1a]/60 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400" /> Z1 (15%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Z2 (45%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Z3 (25%)
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
              <div className="p-4 rounded-2xl bg-white border border-[#1a1a1a]/10 text-xs text-[#1a1a1a]/80">
                <span className="meta text-[#1a1a1a]/50 block mb-1">ANOTAÇÕES DO CICLISTA</span>
                "{selectedRide.notes}"
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
