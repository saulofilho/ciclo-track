import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Heart, Activity, Radio, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getHRZone } from '../utils/geo';

export interface HeartRateDataPoint {
  time: string;
  bpm: number;
  speed?: number;
  timestamp: number;
  zone?: number;
}

interface HeartRateLiveChartProps {
  data: HeartRateDataPoint[];
  currentBpm: number;
  sensorConnected: boolean;
  sensorName?: string;
  batterySaver: boolean;
  isActive: boolean;
  isPaused: boolean;
}

export const HeartRateLiveChart: React.FC<HeartRateLiveChartProps> = ({
  data,
  currentBpm,
  sensorConnected,
  sensorName,
  batterySaver,
  isActive,
  isPaused
}) => {
  const hrZoneInfo = getHRZone(currentBpm);

  // Statistics calculation
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        min: currentBpm,
        max: currentBpm,
        avg: currentBpm,
        count: 0
      };
    }
    const bpmValues = data.map((d) => d.bpm).filter((b) => b > 30);
    if (bpmValues.length === 0) {
      return { min: currentBpm, max: currentBpm, avg: currentBpm, count: 0 };
    }
    const min = Math.min(...bpmValues);
    const max = Math.max(...bpmValues);
    const sum = bpmValues.reduce((acc, val) => acc + val, 0);
    const avg = Math.round(sum / bpmValues.length);
    return { min, max, avg, count: bpmValues.length };
  }, [data, currentBpm]);

  // Zone breakdown percentage
  const zoneSummary = useMemo(() => {
    if (!data || data.length === 0) return { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 };
    const counts = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 };
    data.forEach((p) => {
      const z = getHRZone(p.bpm).zone;
      if (z === 1) counts.z1 += 1;
      else if (z === 2) counts.z2 += 1;
      else if (z === 3) counts.z3 += 1;
      else if (z === 4) counts.z4 += 1;
      else if (z === 5) counts.z5 += 1;
    });
    const total = data.length || 1;
    return {
      z1: Math.round((counts.z1 / total) * 100),
      z2: Math.round((counts.z2 / total) * 100),
      z3: Math.round((counts.z3 / total) * 100),
      z4: Math.round((counts.z4 / total) * 100),
      z5: Math.round((counts.z5 / total) * 100)
    };
  }, [data]);

  // Styling based on mode
  const strokeColor = batterySaver ? '#10b981' : '#e11d48';
  const gradientStart = batterySaver ? '#10b981' : '#e11d48';
  const gridStroke = batterySaver ? '#27272a' : '#1a1a1a0f';
  const textColor = batterySaver ? '#a1a1aa' : '#1a1a1a80';

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as HeartRateDataPoint;
      const zone = getHRZone(item.bpm);
      return (
        <div
          className={`p-3 rounded-2xl border text-xs shadow-xl space-y-1.5 ${
            batterySaver
              ? 'bg-zinc-950/95 border-zinc-800 text-white'
              : 'bg-white/95 border-[#1a1a1a]/15 text-[#1a1a1a] backdrop-blur-md'
          }`}
        >
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-inherit/20">
            <span className="font-mono-numbers text-[11px] text-opacity-70">
              Tempo: {label || item.time}
            </span>
            <span className="meta text-[9px] px-2 py-0.5 rounded-full bg-[#f8f7f4] text-[#1a1a1a] border border-[#1a1a1a]/10 font-bold">
              ZONA {zone.zone}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
            <span className="font-mono-numbers text-base font-bold">
              {item.bpm}{' '}
              <span className="text-[10px] font-normal text-opacity-60">BPM</span>
            </span>
          </div>
          <div className="text-[11px] opacity-80 font-medium">
            {zone.name}
          </div>
          {item.speed !== undefined && (
            <div className="text-[10px] font-mono-numbers opacity-70">
              Velocidade: {item.speed.toFixed(1)} km/h
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="heart-rate-live-telemetry"
      className={`p-5 sm:p-6 rounded-3xl border transition-all ${
        batterySaver
          ? 'bg-zinc-950 border-zinc-800 text-white'
          : 'bg-white border-[#1a1a1a]/10 text-[#1a1a1a] shadow-xs'
      }`}
    >
      {/* Header with Live Status & Pulsing BPM */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1a1a1a]/10">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isActive && !isPaused
                ? 'bg-rose-50 border border-rose-200 text-rose-600'
                : 'bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#1a1a1a]/40'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${
                isActive && !isPaused
                  ? 'animate-pulse text-rose-600 fill-rose-600'
                  : ''
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif-display text-lg sm:text-xl font-bold tracking-tight">
                Tendência Cardíaca em Tempo Real
              </h4>
              <span
                className={`meta text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  isActive && !isPaused
                    ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                    : 'bg-[#f8f7f4] text-[#1a1a1a]/50 border border-[#1a1a1a]/10'
                }`}
              >
                {isActive ? (isPaused ? 'Pausado' : 'Gravando Live') : 'Aguardando Início'}
              </span>
            </div>
            <p className="meta text-[10px] text-[#1a1a1a]/50">
              {sensorConnected
                ? `DISPOSITIVO: ${sensorName || 'CINTA BLE'} (SINCRONIZAÇÃO DIRETA)`
                : 'TELEMETRIA CARREGADA VIA SIMULADOR BIOMECÂNICO METs'}
            </p>
          </div>
        </div>

        {/* Current BPM & Zone Badge */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="font-mono-numbers text-3xl sm:text-4xl font-black text-rose-600">
                {currentBpm}
              </span>
              <span className="meta text-xs text-[#1a1a1a]/60">BPM</span>
            </div>
            <span className="meta text-[10px] font-bold text-[#1a1a1a]/70 block">
              {hrZoneInfo.name}
            </span>
          </div>
        </div>
      </div>

      {/* 3-Stat Summary Pills */}
      <div className="grid grid-cols-3 gap-2.5 my-4">
        <div
          className={`p-3 rounded-2xl border text-center ${
            batterySaver
              ? 'bg-zinc-900/60 border-zinc-800'
              : 'bg-[#f8f7f4] border-[#1a1a1a]/10'
          }`}
        >
          <span className="meta text-[9px] text-[#1a1a1a]/50 block">MÍNIMO</span>
          <span className="font-mono-numbers text-base font-bold text-[#1a1a1a]">
            {stats.min}{' '}
            <span className="meta text-[9px] text-[#1a1a1a]/40">BPM</span>
          </span>
        </div>

        <div
          className={`p-3 rounded-2xl border text-center ${
            batterySaver
              ? 'bg-zinc-900/60 border-zinc-800'
              : 'bg-[#f8f7f4] border-[#1a1a1a]/10'
          }`}
        >
          <span className="meta text-[9px] text-[#1a1a1a]/50 block">MÉDIA ATIVA</span>
          <span className="font-mono-numbers text-base font-bold text-[#2c52a1]">
            {stats.avg}{' '}
            <span className="meta text-[9px] text-[#1a1a1a]/40">BPM</span>
          </span>
        </div>

        <div
          className={`p-3 rounded-2xl border text-center ${
            batterySaver
              ? 'bg-zinc-900/60 border-zinc-800'
              : 'bg-[#f8f7f4] border-[#1a1a1a]/10'
          }`}
        >
          <span className="meta text-[9px] text-[#1a1a1a]/50 block">PICO MÁXIMO</span>
          <span className="font-mono-numbers text-base font-bold text-rose-600">
            {stats.max}{' '}
            <span className="meta text-[9px] text-[#1a1a1a]/40">BPM</span>
          </span>
        </div>
      </div>

      {/* Recharts Area Graph Container */}
      <div className="w-full h-48 sm:h-56 mt-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 12, left: -22, bottom: 0 }}
          >
            <defs>
              <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientStart} stopOpacity={0.4} />
                <stop offset="95%" stopColor={gradientStart} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridStroke}
            />

            <XAxis
              dataKey="time"
              tick={{
                fontSize: 10,
                fontFamily: 'Space Mono, monospace',
                fill: textColor
              }}
              tickLine={false}
              axisLine={{ stroke: batterySaver ? '#27272a' : '#1a1a1a15' }}
              minTickGap={25}
            />

            <YAxis
              domain={[
                (dataMin: number) => Math.max(50, Math.floor((dataMin - 8) / 5) * 5),
                (dataMax: number) => Math.min(210, Math.ceil((dataMax + 8) / 5) * 5)
              ]}
              tick={{
                fontSize: 10,
                fontFamily: 'Space Mono, monospace',
                fill: textColor
              }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Physiological Zone Threshold Lines */}
            <ReferenceLine
              y={140}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
              label={{
                value: 'Z3 Tempo (140)',
                position: 'insideTopRight',
                fill: '#b45309',
                fontSize: 9,
                fontFamily: 'Space Mono, monospace'
              }}
            />

            <ReferenceLine
              y={165}
              stroke="#e11d48"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
              label={{
                value: 'Z5 Pico (165)',
                position: 'insideTopRight',
                fill: '#be123c',
                fontSize: 9,
                fontFamily: 'Space Mono, monospace'
              }}
            />

            <Area
              type="monotone"
              dataKey="bpm"
              name="BPM"
              stroke={strokeColor}
              strokeWidth={2.5}
              fill="url(#hrGradient)"
              isAnimationActive={false}
              dot={false}
              activeDot={{
                r: 5,
                fill: strokeColor,
                stroke: '#ffffff',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Zone Distribution Bar */}
      <div className="pt-4 mt-2 border-t border-[#1a1a1a]/10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="meta text-[10px] text-[#1a1a1a]/60 font-bold">
            DISTRIBUIÇÃO DE ESFORÇO POR ZONAS (METs)
          </span>
          <span className="meta text-[10px] text-[#2c52a1] font-bold font-mono-numbers">
            {stats.count} LEITURAS COLETADAS
          </span>
        </div>

        {/* Stacked colored zone bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden bg-[#1a1a1a]/10 flex">
          <div
            className="h-full bg-sky-400 transition-all"
            style={{ width: `${zoneSummary.z1}%` }}
            title={`Z1 Recuperação: ${zoneSummary.z1}%`}
          />
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${zoneSummary.z2}%` }}
            title={`Z2 Aeróbico: ${zoneSummary.z2}%`}
          />
          <div
            className="h-full bg-amber-400 transition-all"
            style={{ width: `${zoneSummary.z3}%` }}
            title={`Z3 Ritmo: ${zoneSummary.z3}%`}
          />
          <div
            className="h-full bg-orange-500 transition-all"
            style={{ width: `${zoneSummary.z4}%` }}
            title={`Z4 Limiar: ${zoneSummary.z4}%`}
          />
          <div
            className="h-full bg-rose-600 transition-all"
            style={{ width: `${zoneSummary.z5}%` }}
            title={`Z5 Anaeróbico: ${zoneSummary.z5}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] font-mono-numbers text-[#1a1a1a]/70">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Z1: {zoneSummary.z1}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Z2: {zoneSummary.z2}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Z3: {zoneSummary.z3}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Z4: {zoneSummary.z4}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>Z5: {zoneSummary.z5}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
