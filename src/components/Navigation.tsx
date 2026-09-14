import React from 'react';
import {
  Bike,
  Gauge,
  Layers,
  Wrench,
  History,
  MapPin,
  Tag,
  Users,
  Settings,
  Bluetooth,
  BatteryCharging,
  Trophy
} from 'lucide-react';
import { HeartRateSensor } from '../types';

export type MainTab =
  | 'pedal'
  | 'bike3d'
  | 'cuidados'
  | 'historico'
  | 'oficinas'
  | 'marcas'
  | 'comunidade';

interface NavigationProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  sensor: HeartRateSensor;
  onOpenBluetoothModal: () => void;
  batterySaver: boolean;
  onToggleBatterySaver: () => void;
  onOpenSettings: () => void;
  unlockedAchievementsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  sensor,
  onOpenBluetoothModal,
  batterySaver,
  onToggleBatterySaver,
  onOpenSettings,
  unlockedAchievementsCount
}) => {
  const navItems: { key: MainTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'pedal', label: 'Pedalar (GPS)', icon: Gauge },
    { key: 'bike3d', label: 'Oficina 3D', icon: Layers },
    { key: 'cuidados', label: 'Cuidados & Peças', icon: Wrench },
    { key: 'historico', label: 'Histórico & Relatórios', icon: History },
    { key: 'oficinas', label: 'Assistência Técnica', icon: MapPin },
    { key: 'marcas', label: 'Marcas & Specs', icon: Tag },
    { key: 'comunidade', label: 'Social & Desafios', icon: Users }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#f8f7f4]/95 backdrop-blur-md border-b border-[#1a1a1a]/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Brand Logo - Variation 3 Style */}
          <div
            onClick={() => onSelectTab('pedal')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 rounded-full bg-[#2c52a1] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Bike className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-display text-2xl font-bold tracking-tight text-[#1a1a1a]">
                  CicloTrack
                </span>
                <span className="font-serif-display italic text-lg font-semibold text-[#2c52a1]">
                  Pro
                </span>
              </div>
              <span className="meta block -mt-1 text-[#1a1a1a]/50 text-[10px]">
                TELEMETRIA & OFICINA 3D
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  id={`nav-tab-${item.key}`}
                  onClick={() => onSelectTab(item.key)}
                  className={`px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#2c52a1] text-white shadow-sm font-semibold'
                      : 'text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#1a1a1a]/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Technical Controls - Variation 3 Pill Style */}
          <div className="flex items-center gap-2">
            {/* Heart Rate quick status */}
            <button
              onClick={onOpenBluetoothModal}
              className={`px-3 py-1.5 rounded-full border text-xs font-mono-numbers flex items-center gap-1.5 transition-all ${
                sensor.connected
                  ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
                  : 'bg-white text-[#1a1a1a]/70 border-[#1a1a1a]/10 hover:border-[#1a1a1a]/20'
              }`}
              title="Sensor Bluetooth"
            >
              <Bluetooth className={`w-3.5 h-3.5 ${sensor.connected ? 'text-rose-600 animate-pulse' : 'text-[#1a1a1a]/40'}`} />
              <span className="meta-dark">
                {sensor.connected ? `${sensor.bpm} BPM` : 'BLE: OFF'}
              </span>
            </button>

            {/* Battery Saver Mode Toggle */}
            <button
              onClick={onToggleBatterySaver}
              className={`p-2 rounded-full border transition-all ${
                batterySaver
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                  : 'bg-white text-[#1a1a1a]/70 border-[#1a1a1a]/10 hover:border-[#1a1a1a]/20'
              }`}
              title="Modo Economia de Bateria"
            >
              <BatteryCharging className="w-3.5 h-3.5" />
            </button>

            {/* Settings Trigger */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              className="p-2 rounded-full bg-white text-[#1a1a1a]/70 hover:text-[#1a1a1a] border border-[#1a1a1a]/10 hover:border-[#1a1a1a]/20 transition-colors"
              title="Configurações e Perfil"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Scrollable Tab Bar */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none border-t border-[#1a1a1a]/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-[#2c52a1] text-white font-semibold'
                    : 'text-[#1a1a1a]/70 bg-white border border-[#1a1a1a]/10 hover:bg-[#1a1a1a]/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
