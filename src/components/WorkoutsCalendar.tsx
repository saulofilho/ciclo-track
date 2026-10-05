import React, { useMemo } from 'react';
import { RideSession } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Flame,
  Zap,
  TrendingUp,
  X
} from 'lucide-react';

interface WorkoutsCalendarProps {
  rides: RideSession[];
  selectedRide: RideSession | null;
  onSelectRide: (ride: RideSession) => void;
  selectedYear: string; // 'all' | '2026' | '2025' etc.
  onChangeYear: (year: string) => void;
  availableYears: string[];
  currentMonthDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToCurrentMonth: () => void;
  selectedDayFilter: string | null; // 'YYYY-MM-DD' | null
  onSelectDayFilter: (dayKey: string | null) => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const WorkoutsCalendar: React.FC<WorkoutsCalendarProps> = ({
  rides,
  selectedRide,
  onSelectRide,
  selectedYear,
  onChangeYear,
  availableYears,
  currentMonthDate,
  onPrevMonth,
  onNextMonth,
  onGoToCurrentMonth,
  selectedDayFilter,
  onSelectDayFilter
}) => {
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth(); // 0 - 11

  // Today marker
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Map rides by normalized YYYY-MM-DD date key
  const ridesByDate = useMemo(() => {
    const map = new Map<string, RideSession[]>();

    rides.forEach((ride) => {
      let d: Date | null = null;

      if (ride.startTime && !isNaN(ride.startTime)) {
        d = new Date(ride.startTime);
      } else if (ride.date) {
        // Parse 'DD/MM/YYYY'
        const parts = ride.date.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          d = new Date(year, month, day);
        }
      }

      if (d && !isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const existing = map.get(key) || [];
        existing.push(ride);
        map.set(key, existing);
      }
    });

    return map;
  }, [rides]);

  // Generate matrix for current calendar month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const key = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNum,
        isCurrentMonth: false,
        dateKey: key,
        rides: ridesByDate.get(key) || []
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        isCurrentMonth: true,
        dateKey: key,
        rides: ridesByDate.get(key) || []
      });
    }

    // Next month filler days (fill up to multiples of 7, 35 or 42 cells)
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const key = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({
          dayNum: i,
          isCurrentMonth: false,
          dateKey: key,
          rides: ridesByDate.get(key) || []
        });
      }
    }

    return days;
  }, [currentYear, currentMonth, ridesByDate]);

  // Metrics for current active month
  const monthStats = useMemo(() => {
    let count = 0;
    let distance = 0;
    let elevation = 0;
    let durationSec = 0;

    calendarDays.forEach((day) => {
      if (day.isCurrentMonth && day.rides.length > 0) {
        count += day.rides.length;
        day.rides.forEach((r) => {
          distance += r.distance;
          elevation += r.elevationGain;
          durationSec += r.duration;
        });
      }
    });

    return {
      count,
      distance: Math.round(distance * 10) / 10,
      elevation: Math.round(elevation),
      hours: Math.round((durationSec / 3600) * 10) / 10
    };
  }, [calendarDays]);

  const isViewingCurrentCalendarMonth =
    today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  return (
    <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header bar: Title + Annual Filter + Month Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1a1a1a]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2c52a1]/10 border border-[#2c52a1]/20 flex items-center justify-center text-[#2c52a1]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              {isViewingCurrentCalendarMonth && (
                <span className="px-2 py-0.5 rounded-full bg-[#2c52a1]/10 text-[#2c52a1] text-[10px] font-mono-numbers font-bold uppercase tracking-wider">
                  Mês Atual
                </span>
              )}
            </div>
            <span className="meta text-[#1a1a1a]/60 text-xs block mt-0.5">
              Dias com treinos gravados em destaque visual
            </span>
          </div>
        </div>

        {/* Action Controls: Annual Filter + Month Navigator */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Annual Filter Dropdown / Pills */}
          <div className="flex items-center gap-1.5 bg-[#f8f7f4] px-3 py-1.5 rounded-2xl border border-[#1a1a1a]/10">
            <Filter className="w-3.5 h-3.5 text-[#2c52a1]" />
            <span className="meta text-[10px] text-[#1a1a1a]/60 mr-1 font-bold">ANO:</span>
            <div className="flex items-center gap-1">
              <button
                id="btn-filter-year-all"
                onClick={() => onChangeYear('all')}
                className={`px-2 py-0.5 rounded-lg text-xs font-mono-numbers font-bold transition-all cursor-pointer ${
                  selectedYear === 'all'
                    ? 'bg-[#2c52a1] text-white shadow-2xs'
                    : 'text-[#1a1a1a]/70 hover:bg-white'
                }`}
              >
                Todos
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  id={`btn-filter-year-${yr}`}
                  onClick={() => onChangeYear(yr)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono-numbers font-bold transition-all cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-[#2c52a1] text-white shadow-2xs'
                      : 'text-[#1a1a1a]/70 hover:bg-white'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Month Steppers */}
          <div className="flex items-center gap-1 bg-[#f8f7f4] p-1 rounded-2xl border border-[#1a1a1a]/10">
            <button
              id="btn-calendar-prev-month"
              onClick={onPrevMonth}
              className="p-1.5 rounded-xl hover:bg-white text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors cursor-pointer"
              title="Mês Anterior"
              aria-label="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-calendar-today"
              onClick={onGoToCurrentMonth}
              className="px-2.5 py-1 text-xs font-mono-numbers font-bold text-[#2c52a1] hover:bg-white rounded-xl transition-colors cursor-pointer"
              title="Ir para o mês atual"
            >
              Hoje
            </button>
            <button
              id="btn-calendar-next-month"
              onClick={onNextMonth}
              className="p-1.5 rounded-xl hover:bg-white text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors cursor-pointer"
              title="Próximo Mês"
              aria-label="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8f7f4] p-3.5 rounded-2xl border border-[#1a1a1a]/10">
        <div>
          <span className="meta text-[#1a1a1a]/50 text-[10px] block">TREINOS NO MÊS</span>
          <span className="font-mono-numbers text-lg sm:text-xl font-bold text-[#1a1a1a]">
            {monthStats.count}{' '}
            <span className="text-xs font-sans text-[#1a1a1a]/60">atividades</span>
          </span>
        </div>
        <div>
          <span className="meta text-[#1a1a1a]/50 text-[10px] block">VOLUME MENSAL</span>
          <span className="font-mono-numbers text-lg sm:text-xl font-bold text-[#2c52a1]">
            {monthStats.distance}{' '}
            <span className="text-xs font-sans text-[#1a1a1a]/60">km</span>
          </span>
        </div>
        <div>
          <span className="meta text-[#1a1a1a]/50 text-[10px] block">TEMPO DE PEDAL</span>
          <span className="font-mono-numbers text-lg sm:text-xl font-bold text-[#1a1a1a]">
            {monthStats.hours}h{' '}
            <span className="text-xs font-sans text-[#1a1a1a]/60">selim</span>
          </span>
        </div>
        <div>
          <span className="meta text-[#1a1a1a]/50 text-[10px] block">GANHO VERTICAL</span>
          <span className="font-mono-numbers text-lg sm:text-xl font-bold text-[#2c52a1]">
            +{monthStats.elevation.toLocaleString()}{' '}
            <span className="text-xs font-sans text-[#1a1a1a]/60">m</span>
          </span>
        </div>
      </div>

      {/* Active Day Filter Notification Banner */}
      {selectedDayFilter && (
        <div className="flex items-center justify-between bg-[#2c52a1]/10 border border-[#2c52a1]/20 px-4 py-2.5 rounded-2xl text-xs">
          <div className="flex items-center gap-2 text-[#2c52a1] font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>
              Filtrando atividades do dia: {selectedDayFilter.split('-').reverse().join('/')}
            </span>
          </div>
          <button
            onClick={() => onSelectDayFilter(null)}
            className="flex items-center gap-1 text-[#2c52a1] hover:text-[#1a1a1a] font-mono-numbers font-bold cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar Filtro de Dia
          </button>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="space-y-1.5">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center pb-1">
          {WEEKDAY_NAMES.map((wd, i) => (
            <div
              key={wd}
              className={`meta text-[11px] font-bold py-1 ${
                i === 0 || i === 6 ? 'text-[#2c52a1]/80' : 'text-[#1a1a1a]/60'
              }`}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((day, idx) => {
            const hasWorkout = day.rides.length > 0;
            const isToday = day.dateKey === todayKey;
            const isDaySelected = selectedDayFilter === day.dateKey;
            const isRideSelected =
              selectedRide &&
              day.rides.some((r) => r.id === selectedRide.id);

            const dayDistance = day.rides.reduce((acc, r) => acc + r.distance, 0);

            return (
              <div
                key={`${day.dateKey}-${idx}`}
                onClick={() => {
                  if (hasWorkout) {
                    // If multiple rides, select first ride or toggle day filter
                    onSelectRide(day.rides[0]);
                    onSelectDayFilter(isDaySelected ? null : day.dateKey);
                  } else if (day.isCurrentMonth) {
                    onSelectDayFilter(isDaySelected ? null : day.dateKey);
                  }
                }}
                className={`min-h-[64px] sm:min-h-[82px] p-1.5 sm:p-2 rounded-2xl border transition-all relative flex flex-col justify-between ${
                  !day.isCurrentMonth
                    ? 'opacity-35 bg-white/40 border-dashed border-[#1a1a1a]/10 cursor-default'
                    : hasWorkout
                    ? isRideSelected || isDaySelected
                      ? 'bg-[#2c52a1]/10 border-[#2c52a1] shadow-sm ring-2 ring-[#2c52a1] cursor-pointer'
                      : 'bg-white border-[#2c52a1]/30 hover:border-[#2c52a1] hover:shadow-xs cursor-pointer'
                    : 'bg-[#faf9f6] border-[#1a1a1a]/10 hover:border-[#1a1a1a]/20 cursor-pointer'
                }`}
              >
                {/* Day Number Header + Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono-numbers text-xs sm:text-sm font-bold ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-[#2c52a1] text-white flex items-center justify-center -ml-0.5 -mt-0.5 shadow-xs'
                        : hasWorkout
                        ? 'text-[#2c52a1]'
                        : day.isCurrentMonth
                        ? 'text-[#1a1a1a]'
                        : 'text-[#1a1a1a]/40'
                    }`}
                  >
                    {day.dayNum}
                  </span>

                  {/* Workout count pill */}
                  {hasWorkout && (
                    <span
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                        day.rides.length > 1 ? 'bg-amber-500' : 'bg-[#2c52a1]'
                      }`}
                      title={`${day.rides.length} pedalada(s)`}
                    />
                  )}
                </div>

                {/* Workout Highlights for the day */}
                {hasWorkout ? (
                  <div className="mt-1 space-y-0.5">
                    <div className="bg-[#2c52a1]/10 text-[#2c52a1] rounded-md px-1 py-0.5 text-[9px] sm:text-[10px] font-mono-numbers font-bold truncate">
                      {Math.round(dayDistance * 10) / 10} km
                    </div>
                    <div className="hidden sm:block text-[9px] text-[#1a1a1a]/60 truncate font-sans">
                      {day.rides[0].title}
                    </div>
                  </div>
                ) : (
                  <div className="h-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-[#1a1a1a]/60 border-t border-[#1a1a1a]/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2c52a1]" />
            <span>Dia com Treino</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Treino Múltiplo (&gt;1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#2c52a1] text-white text-[9px] font-bold flex items-center justify-center">
              ●
            </span>
            <span>Dia Atual</span>
          </div>
        </div>

        <span className="text-[11px] text-[#1a1a1a]/50">
          Clique no dia para inspecionar os treinos correspondentes
        </span>
      </div>
    </div>
  );
};
