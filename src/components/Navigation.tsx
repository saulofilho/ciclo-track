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
  Trophy,
  Award
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
    { key: 'bike3d', label: 'Bicicleta 3D', icon: Layers },
    { key: 'cuidados', label: 'Cuidados & Oficina', icon: Wrench },
    { key: 'historico', label: 'Histórico & Relatórios', icon: History },
    { key: 'oficinas', label: 'Assistência Técnica', icon: MapPin },
    { key: 'marcas', label: 'Marcas & Specs', icon: Tag },
    { key: 'comunidade', label: 'Social & Desafios', icon: Users }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => onSelectTab('pedal')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Bike className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  CicloTrack
                </span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 tracking-wider">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
                GPS • Sensor BLE • Oficina 3D
              </span>
            </div>
          </div>

          {/* Desktop Tab Bar */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  id={`nav-tab-${item.key}`}
                  onClick={() => onSelectTab(item.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Heart Rate quick status */}
            <button
              onClick={onOpenBluetoothModal}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                sensor.connected
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Sensor Bluetooth"
            >
              <Bluetooth className={`w-4 h-4 ${sensor.connected ? 'text-rose-400' : ''}`} />
              <span className="hidden sm:inline font-mono">
                {sensor.connected ? `${sensor.bpm} BPM` : 'BLE'}
              </span>
            </button>

            {/* Battery Saver Mode */}
            <button
              onClick={onToggleBatterySaver}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                batterySaver
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Modo Economia de Bateria"
            >
              <BatteryCharging className="w-4 h-4" />
            </button>

            {/* Settings Trigger */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
              title="Configurações e Temas"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Scrollable Tab Bar */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-900">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
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
