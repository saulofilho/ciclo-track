import React, { useState, useMemo } from 'react';
import {
  Cog,
  Gauge,
  Zap,
  Activity,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  Disc,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface WheelSizePreset {
  label: string;
  diameterMm: number; // circumference in mm
  type: string;
}

const WHEEL_PRESETS: WheelSizePreset[] = [
  { label: '700x25c (Speed / Road)', diameterMm: 2105, type: 'Estrada' },
  { label: '700x28c (Endurance)', diameterMm: 2136, type: 'Estrada' },
  { label: '700x38c (Gravel)', diameterMm: 2180, type: 'Gravel' },
  { label: '29" x 2.20" (MTB XC)', diameterMm: 2280, type: 'Mountain Bike' },
  { label: '29" x 2.40" (MTB Trail)', diameterMm: 2330, type: 'Mountain Bike' }
];

interface CassettePreset {
  name: string;
  type: string;
  cogs: number[];
}

const CASSETTE_PRESETS: CassettePreset[] = [
  {
    name: '11-30T Road Shimano 12v',
    type: 'Speed',
    cogs: [11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 27, 30]
  },
  {
    name: '11-34T All-Road / Endurance',
    type: 'Speed / All-Road',
    cogs: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34]
  },
  {
    name: '11-28T Clássico Escalador',
    type: 'Speed',
    cogs: [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28]
  },
  {
    name: '10-44T XPLR Gravel 12v',
    type: 'Gravel',
    cogs: [10, 11, 13, 15, 17, 19, 21, 24, 28, 32, 38, 44]
  },
  {
    name: '10-52T Eagle MTB 12v',
    type: 'Mountain Bike',
    cogs: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 52]
  }
];

const CHAINRING_PRESETS = [
  { teeth: 34, label: '34T (Subida Compact)' },
  { teeth: 36, label: '36T (Semi-compact)' },
  { teeth: 40, label: '40T (1x Gravel)' },
  { teeth: 50, label: '50T (Compact Road)' },
  { teeth: 52, label: '52T (Semi-compact Road)' },
  { teeth: 54, label: '54T (Aero / Pro)' }
];

export const GearCadenceCalculator: React.FC = () => {
  // State for user configuration
  const [selectedChainring, setSelectedChainring] = useState<number>(50);
  const [selectedCassetteIndex, setSelectedCassetteIndex] = useState<number>(0);
  const currentCassette = CASSETTE_PRESETS[selectedCassetteIndex];
  const [selectedCog, setSelectedCog] = useState<number>(17);
  const [selectedWheelIndex, setSelectedWheelIndex] = useState<number>(1); // 700x28c
  const currentWheel = WHEEL_PRESETS[selectedWheelIndex];

  // Simulation controls
  const [targetCadence, setTargetCadence] = useState<number>(90); // RPM
  const [targetSpeedKmh, setTargetSpeedKmh] = useState<number>(30); // km/h
  const [simulationMode, setSimulationMode] = useState<'cadence_to_speed' | 'speed_to_cadence'>('cadence_to_speed');

  // Math Calculations
  const calculations = useMemo(() => {
    const ratio = selectedChainring / selectedCog;
    const wheelCircumferenceMeters = currentWheel.diameterMm / 1000;
    const metersPerPedalStroke = ratio * wheelCircumferenceMeters; // Rollout (desenvolvimento)

    // Calculate speed based on targetCadence
    // speed (km/h) = (cadence * metersPerStroke * 60) / 1000
    const calculatedSpeed = (targetCadence * metersPerPedalStroke * 60) / 1000;

    // Calculate cadence required for targetSpeedKmh
    // cadence = (targetSpeed * 1000) / (metersPerStroke * 60)
    const calculatedCadence = metersPerPedalStroke > 0 ? (targetSpeedKmh * 1000) / (metersPerPedalStroke * 60) : 0;

    // Ideal cadence zone recommendation for this gear ratio:
    // Climbing gear (< 1.6): 78 - 88 RPM
    // Flat / Rolling gear (1.6 - 3.2): 86 - 96 RPM (Sweet Spot)
    // Heavy / Sprint gear (> 3.2): 92 - 102 RPM
    let idealRange = { min: 85, max: 95, label: 'Faixa de Cruzeiro (85 - 95 RPM)' };
    let gearType = 'Mista / Rolamento';
    let efficiencyNote = 'Relação balanceada para manutenção de ritmo aeróbico com baixo desgaste articular.';
    let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

    if (ratio < 1.6) {
      idealRange = { min: 80, max: 90, label: 'Faixa de Subida / Giro (80 - 90 RPM)' };
      gearType = 'Subida Íngreme / Escalada';
      efficiencyNote = 'Priorize cadência alta e constante para evitar travar as pernas ou sobrecarregar joelhos.';
      statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
    } else if (ratio > 3.2) {
      idealRange = { min: 90, max: 100, label: 'Alta Velocidade / Sprint (90 - 100 RPM)' };
      gearType = 'Sprint / Descida / Falso Plano';
      efficiencyNote = 'Relação muito pesada. Mantenha giro fluido acima de 90 RPM para evitar estagnação láctica muscular.';
      statusColor = 'text-amber-800 bg-amber-50 border-amber-200';
    }

    // Determine if current simulated cadence is in optimal zone
    const currentSimCadence = simulationMode === 'cadence_to_speed' ? targetCadence : calculatedCadence;
    let cadenceStatus = 'Ótima (Sweet Spot)';
    let cadenceBadge = 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (currentSimCadence < 75) {
      cadenceStatus = 'Cadência Baixa (Grinding / Sobrecarga)';
      cadenceBadge = 'bg-rose-50 text-rose-700 border-rose-300';
    } else if (currentSimCadence > 105) {
      cadenceStatus = 'Cadência Alta (Spinning / Fôlego)';
      cadenceBadge = 'bg-amber-50 text-amber-800 border-amber-300';
    }

    // Speeds for all cogs in the current cassette at 90 RPM
    const cassetteSpeeds = currentCassette.cogs.map((cog) => {
      const r = selectedChainring / cog;
      const speedAt90 = (90 * r * wheelCircumferenceMeters * 60) / 1000;
      return {
        cog,
        ratio: r,
        speedAt90: parseFloat(speedAt90.toFixed(1)),
        rollout: parseFloat((r * wheelCircumferenceMeters).toFixed(2))
      };
    });

    return {
      ratio: parseFloat(ratio.toFixed(2)),
      metersPerPedalStroke: parseFloat(metersPerPedalStroke.toFixed(2)),
      calculatedSpeed: parseFloat(calculatedSpeed.toFixed(1)),
      calculatedCadence: Math.round(calculatedCadence),
      idealRange,
      gearType,
      efficiencyNote,
      statusColor,
      cadenceStatus,
      cadenceBadge,
      cassetteSpeeds
    };
  }, [selectedChainring, selectedCog, currentWheel, targetCadence, targetSpeedKmh, simulationMode, currentCassette]);

  return (
    <div
      id="gear-cadence-calculator-section"
      className="rounded-3xl border border-[#1a1a1a]/10 bg-white shadow-xs overflow-hidden transition-all"
    >
      {/* Header Container */}
      <div className="p-6 sm:p-7 border-b border-[#1a1a1a]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="meta text-[#2c52a1] font-bold text-xs flex items-center gap-1.5">
              <Cog className="w-3.5 h-3.5 text-[#2c52a1] animate-[spin_10s_linear_infinite]" />
              BIOMETRIA & TRANSMISSÃO • CALCULADORA MECÂNICA
            </span>
            <span className="text-[10px] font-mono-numbers px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#1a1a1a]/70">
              Relação & Giro Ideal
            </span>
          </div>
          <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
            Calculadora de Cadência e Relação de Marchas
          </h3>
          <p className="text-xs text-[#1a1a1a]/60 mt-1 max-w-xl">
            Descubra o rendimento de cada combinação de coroa e cassete. Calcule o desenvolvimento por pedalada (metros) e identifique a cadência ideal para não travar os joelhos nem desperdiçar watts.
          </p>
        </div>

        {/* Quick Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedChainring(50);
              setSelectedCog(17);
              setTargetCadence(90);
              setTargetSpeedKmh(30);
            }}
            className="px-4 py-2 rounded-full border border-[#1a1a1a]/15 text-xs font-bold text-[#1a1a1a]/70 hover:text-[#1a1a1a] bg-[#f8f7f4] hover:bg-[#1a1a1a]/5 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Configuração Padrão
          </button>
        </div>
      </div>

      {/* Main Interactive Controls Grid */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* ROW 1: Coroa (Chainring) + Cassete + Roda Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. SELEÇÃO DA COROA DIANTEIRA */}
          <div className="p-5 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1a1a1a] flex items-center gap-1.5">
                <Disc className="w-4 h-4 text-[#2c52a1]" />
                Coroa Dianteira (Chainring)
              </label>
              <span className="font-mono-numbers text-xl font-bold text-[#2c52a1]">
                {selectedChainring}T
              </span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-1.5">
              {CHAINRING_PRESETS.map((p) => (
                <button
                  key={p.teeth}
                  type="button"
                  onClick={() => setSelectedChainring(p.teeth)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-mono-numbers font-bold border transition-all cursor-pointer ${
                    selectedChainring === p.teeth
                      ? 'bg-[#2c52a1] text-white border-[#2c52a1] shadow-xs'
                      : 'bg-white text-[#1a1a1a] border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30'
                  }`}
                >
                  {p.teeth}T
                </button>
              ))}
            </div>

            {/* Manual Fine Tuning */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedChainring((t) => Math.max(26, t - 2))}
                className="px-3 py-1.5 rounded-lg border border-[#1a1a1a]/10 bg-white hover:bg-white/80 text-xs font-bold font-mono-numbers cursor-pointer"
              >
                -2T
              </button>
              <input
                type="range"
                min="28"
                max="56"
                step="1"
                value={selectedChainring}
                onChange={(e) => setSelectedChainring(Number(e.target.value))}
                className="flex-1 accent-[#2c52a1] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setSelectedChainring((t) => Math.min(60, t + 2))}
                className="px-3 py-1.5 rounded-lg border border-[#1a1a1a]/10 bg-white hover:bg-white/80 text-xs font-bold font-mono-numbers cursor-pointer"
              >
                +2T
              </button>
            </div>
          </div>

          {/* 2. SELEÇÃO DO CASSETE TRASEIRO */}
          <div className="p-5 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10 space-y-3 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-[#1a1a1a] flex items-center gap-1.5">
                <Cog className="w-4 h-4 text-[#2c52a1]" />
                Pinhão do Cassete (Cog Selecionado: {selectedCog}T)
              </label>

              {/* Cassette model selector */}
              <select
                value={selectedCassetteIndex}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSelectedCassetteIndex(idx);
                  const newCassette = CASSETTE_PRESETS[idx];
                  if (!newCassette.cogs.includes(selectedCog)) {
                    setSelectedCog(newCassette.cogs[Math.floor(newCassette.cogs.length / 2)]);
                  }
                }}
                className="text-xs font-medium bg-white border border-[#1a1a1a]/15 rounded-lg px-2.5 py-1 text-[#1a1a1a] cursor-pointer"
              >
                {CASSETTE_PRESETS.map((c, i) => (
                  <option key={c.name} value={i}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Cog Buttons (Visual Cassette) */}
            <div>
              <span className="text-[10px] font-mono-numbers text-[#1a1a1a]/50 uppercase tracking-wide block mb-1.5">
                Pinhões disponíveis (clique para engatar a marcha):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {currentCassette.cogs.map((cog) => {
                  const isSelected = selectedCog === cog;
                  const ratio = (selectedChainring / cog).toFixed(2);
                  return (
                    <button
                      key={cog}
                      type="button"
                      onClick={() => setSelectedCog(cog)}
                      className={`flex-1 min-w-[42px] py-2 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2c52a1] text-white border-[#2c52a1] shadow-xs scale-105 font-bold'
                          : 'bg-white hover:bg-white/80 text-[#1a1a1a] border-[#1a1a1a]/10'
                      }`}
                    >
                      <div className="font-mono-numbers text-xs">{cog}T</div>
                      <div className={`text-[9px] font-mono-numbers ${isSelected ? 'text-blue-100' : 'text-[#1a1a1a]/50'}`}>
                        {ratio}x
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wheel Tire Dimension selector */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-[#1a1a1a]/10">
              <span className="text-[#1a1a1a]/70 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#2c52a1]" />
                Perímetro do Pneu:
              </span>
              <select
                value={selectedWheelIndex}
                onChange={(e) => setSelectedWheelIndex(Number(e.target.value))}
                className="text-xs bg-white border border-[#1a1a1a]/15 rounded-lg px-2 py-1 text-[#1a1a1a] cursor-pointer"
              >
                {WHEEL_PRESETS.map((w, i) => (
                  <option key={w.label} value={i}>
                    {w.label} ({w.diameterMm} mm)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ROW 2: Primary Results Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Relação de Marcha */}
          <div className="p-5 rounded-2xl bg-white border border-[#1a1a1a]/10 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="meta text-[10px] text-[#1a1a1a]/60 font-bold block">
                RELAÇÃO DE MARCHA
              </span>
              <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded-full font-bold bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#2c52a1]">
                {selectedChainring} ÷ {selectedCog}
              </span>
            </div>
            <div className="font-mono-numbers text-3xl font-bold text-[#1a1a1a]">
              {calculations.ratio} <span className="meta text-xs">: 1</span>
            </div>
            <p className="text-[11px] text-[#1a1a1a]/60">
              Cada 1 volta no pedal faz a roda girar <strong>{calculations.ratio} voltas</strong>.
            </p>
          </div>

          {/* Card 2: Desenvolvimento (Rollout) */}
          <div className="p-5 rounded-2xl bg-white border border-[#1a1a1a]/10 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="meta text-[10px] text-[#1a1a1a]/60 font-bold block">
                DESENVOLVIMENTO (ROLLOUT)
              </span>
              <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded-full font-bold bg-blue-50 border border-blue-200 text-[#2c52a1]">
                {currentWheel.diameterMm}mm
              </span>
            </div>
            <div className="font-mono-numbers text-3xl font-bold text-[#2c52a1]">
              {calculations.metersPerPedalStroke} <span className="meta text-xs">METROS</span>
            </div>
            <p className="text-[11px] text-[#1a1a1a]/60">
              Distância percorrida no asfalto com uma rotação completa de 360° do pedivela.
            </p>
          </div>

          {/* Card 3: Cadência Ideal Sugerida */}
          <div className="p-5 rounded-2xl bg-white border border-[#1a1a1a]/10 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="meta text-[10px] text-[#1a1a1a]/60 font-bold block">
                CADÊNCIA RECOMENDADA
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="font-mono-numbers text-2xl font-bold text-emerald-800">
              {calculations.idealRange.min} - {calculations.idealRange.max} <span className="meta text-xs">RPM</span>
            </div>
            <p className="text-[11px] text-[#1a1a1a]/60">
              {calculations.idealRange.label}. Previne queima prematura de glicogênio.
            </p>
          </div>

          {/* Card 4: Perfil do Terreno */}
          <div className="p-5 rounded-2xl bg-white border border-[#1a1a1a]/10 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="meta text-[10px] text-[#1a1a1a]/60 font-bold block">
                PERFIL DE TERRENO
              </span>
              <Activity className="w-4 h-4 text-[#2c52a1]" />
            </div>
            <div className="font-serif-display text-lg font-bold text-[#1a1a1a]">
              {calculations.gearType}
            </div>
            <p className="text-[11px] text-[#1a1a1a]/60 line-clamp-2">
              {calculations.efficiencyNote}
            </p>
          </div>
        </div>

        {/* ROW 3: Interactive Simulation Playground (Velocidade x Cadência) */}
        <div className="p-6 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="meta text-xs font-bold text-[#2c52a1] flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#2c52a1]" />
                SIMULADOR INTERATIVO DE DESEMPENHO
              </span>
              <h4 className="font-serif-display text-lg font-bold text-[#1a1a1a] mt-0.5">
                Relação Dinâmica entre Cadência (RPM) e Velocidade (km/h)
              </h4>
            </div>

            {/* Mode switch */}
            <div className="inline-flex rounded-full p-1 bg-white border border-[#1a1a1a]/15 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSimulationMode('cadence_to_speed')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  simulationMode === 'cadence_to_speed'
                    ? 'bg-[#2c52a1] text-white shadow-xs'
                    : 'text-[#1a1a1a]/70 hover:text-[#1a1a1a]'
                }`}
              >
                Definir Cadência → Ver Velocidade
              </button>
              <button
                type="button"
                onClick={() => setSimulationMode('speed_to_cadence')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  simulationMode === 'speed_to_cadence'
                    ? 'bg-[#2c52a1] text-white shadow-xs'
                    : 'text-[#1a1a1a]/70 hover:text-[#1a1a1a]'
                }`}
              >
                Definir Velocidade → Ver Cadência
              </button>
            </div>
          </div>

          {/* Interactive Sliders and Output Gauges */}
          {simulationMode === 'cadence_to_speed' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Cadence Input Slider */}
              <div className="p-5 rounded-2xl bg-white border border-[#1a1a1a]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1a1a1a]">
                    Cadência no Pedal (RPM)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-numbers text-2xl font-bold text-[#2c52a1]">
                      {targetCadence} <span className="text-xs font-normal text-[#1a1a1a]/60">RPM</span>
                    </span>
                    <span className={`text-[10px] font-mono-numbers px-2 py-0.5 rounded-full font-bold border ${calculations.cadenceBadge}`}>
                      {calculations.cadenceStatus.split(' ')[0]}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="55"
                  max="125"
                  step="1"
                  value={targetCadence}
                  onChange={(e) => setTargetCadence(Number(e.target.value))}
                  className="w-full accent-[#2c52a1] cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono-numbers text-[#1a1a1a]/50">
                  <span>60 RPM (Pesado)</span>
                  <span className="text-emerald-700 font-bold">90 RPM (Ideal)</span>
                  <span>120 RPM (Giro Alto)</span>
                </div>
              </div>

              {/* Resulting Speed Display */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-[#2c52a1]/20 space-y-1">
                <span className="meta text-[10px] text-[#2c52a1] font-bold block">
                  VELOCIDADE FINAL ESTIMADA NA MARCHA {selectedChainring}x{selectedCog}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-numbers text-4xl sm:text-5xl font-bold text-[#1a1a1a]">
                    {calculations.calculatedSpeed}
                  </span>
                  <span className="font-serif-display text-lg font-bold text-[#2c52a1]">
                    KM/H
                  </span>
                </div>
                <p className="text-xs text-[#1a1a1a]/70 pt-1">
                  Girando a <strong>{targetCadence} RPM</strong> na relação {selectedChainring}T x {selectedCog}T você percorrerá <strong>{(calculations.calculatedSpeed / 3.6).toFixed(1)} metros por segundo</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Target Speed Input Slider */}
              <div className="p-5 rounded-2xl bg-white border border-[#1a1a1a]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1a1a1a]">
                    Velocidade Desejada na Estrada (km/h)
                  </span>
                  <span className="font-mono-numbers text-2xl font-bold text-[#2c52a1]">
                    {targetSpeedKmh} <span className="text-xs font-normal text-[#1a1a1a]/60">km/h</span>
                  </span>
                </div>

                <input
                  type="range"
                  min="12"
                  max="60"
                  step="0.5"
                  value={targetSpeedKmh}
                  onChange={(e) => setTargetSpeedKmh(Number(e.target.value))}
                  className="w-full accent-[#2c52a1] cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono-numbers text-[#1a1a1a]/50">
                  <span>15 km/h</span>
                  <span>30 km/h (Médio)</span>
                  <span>50 km/h (Pelotão)</span>
                </div>
              </div>

              {/* Required Cadence Output */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 space-y-1">
                <span className="meta text-[10px] text-emerald-800 font-bold block">
                  CADÊNCIA NECESSÁRIA PARA SUSTENTAR {targetSpeedKmh} KM/H
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-numbers text-4xl sm:text-5xl font-bold text-[#1a1a1a]">
                    {calculations.calculatedCadence}
                  </span>
                  <span className="font-serif-display text-lg font-bold text-emerald-700">
                    RPM
                  </span>
                </div>
                <p className="text-xs text-[#1a1a1a]/70 pt-1">
                  Para manter <strong>{targetSpeedKmh} km/h</strong> com a coroa {selectedChainring}T e cog {selectedCog}T, suas pernas precisam girar exatamente a <strong>{calculations.calculatedCadence} rotações por minuto</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ROW 4: Mapa Completo de Velocidades do Cassete a 90 RPM */}
        <div className="p-5 rounded-2xl bg-white border border-[#1a1a1a]/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h5 className="font-serif-display text-base font-bold text-[#1a1a1a] flex items-center gap-2">
                Mapa Completo do Cassete a 90 RPM (Cadência de Ouro)
              </h5>
              <p className="text-xs text-[#1a1a1a]/60">
                Velocidade desenvolvida em cada marcha mantendo a cadência de eficiência energética com a coroa de {selectedChainring}T:
              </p>
            </div>
            <span className="text-[11px] font-mono-numbers text-[#2c52a1] font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Coroa Ativa: {selectedChainring}T
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2">
            {calculations.cassetteSpeeds.map((item) => {
              const isCurrent = item.cog === selectedCog;
              return (
                <div
                  key={item.cog}
                  onClick={() => setSelectedCog(item.cog)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#2c52a1] text-white border-[#2c52a1] shadow-xs scale-105'
                      : 'bg-[#f8f7f4] hover:bg-[#1a1a1a]/5 text-[#1a1a1a] border-[#1a1a1a]/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-numbers text-xs font-bold">
                      {item.cog}T
                    </span>
                    <span className={`text-[9px] font-mono-numbers ${isCurrent ? 'text-blue-100' : 'text-[#1a1a1a]/50'}`}>
                      {item.ratio.toFixed(2)}:1
                    </span>
                  </div>
                  <div className={`font-mono-numbers text-base font-bold mt-1 ${isCurrent ? 'text-white' : 'text-[#2c52a1]'}`}>
                    {item.speedAt90} <span className="text-[10px] font-normal">km/h</span>
                  </div>
                  <div className={`text-[9px] mt-0.5 ${isCurrent ? 'text-blue-200' : 'text-[#1a1a1a]/50'}`}>
                    {item.rollout}m / giro
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guia Biomecânico de Cadência */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/20 text-xs text-[#1a1a1a]/80 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Dica do Fisiologista CicloTrack: Por que a Cadência Importa?</span>
          </div>
          <p className="leading-relaxed">
            Pedalar abaixo de <strong>75 RPM</strong> força excessivamente os ligamentos patelares e exige maior contração de fibras musculares do tipo II (anaeróbicas), acelerando o acúmulo de ácido lático. Já a faixa entre <strong>85 e 95 RPM</strong> utiliza a bomba muscular para auxiliar o retorno venoso, economizando energia e permitindo sustentar treinos de 2 a 4 horas com menor fadiga neuromuscular.
          </p>
        </div>
      </div>
    </div>
  );
};
