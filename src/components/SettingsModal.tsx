import React, { useState } from 'react';
import { AppTheme, UserPreferences } from '../types';
import {
  Settings,
  Palette,
  Watch,
  Bell,
  Volume2,
  BatteryCharging,
  Scale,
  Bike,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Moon,
  Sun,
  Eye,
  Sparkles
} from 'lucide-react';

interface SettingsModalProps {
  preferences: UserPreferences;
  onUpdatePreferences: (pref: Partial<UserPreferences>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  preferences,
  onUpdatePreferences,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'interface' | 'vestiveis' | 'perfil'>('interface');
  const [notificationGranted, setNotificationGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationGranted(true);
        onUpdatePreferences({ pushNotifications: true });
        new Notification('CicloTrack Pro', {
          body: 'Notificações de progresso ativadas com sucesso!'
        });
      }
    }
  };

  const themes: { key: AppTheme; name: string; bg: string; accent: string }[] = [
    { key: 'stealth', name: 'Stealth Escuro (Padrão)', bg: 'bg-slate-950', accent: 'border-emerald-500' },
    { key: 'neon', name: 'Neon Cyberpunk', bg: 'bg-slate-950', accent: 'border-cyan-400' },
    { key: 'forest', name: 'Forest Gravel', bg: 'bg-stone-950', accent: 'border-emerald-600' },
    { key: 'sunset', name: 'Sunset Endurance', bg: 'bg-slate-950', accent: 'border-orange-500' },
    { key: 'amoled', name: 'OLED Pure Black (Ultra Economia)', bg: 'bg-black', accent: 'border-white' }
  ];

  const wearables = [
    {
      key: 'strava',
      name: 'Strava',
      desc: 'Sincronização automática de segmentos, KOMs e postagem direta no feed.',
      icon: '🟠',
      connected: preferences.activeWearables.strava
    },
    {
      key: 'garmin',
      name: 'Garmin Connect (Edge / Forerunner)',
      desc: 'Importação e exportação de treinos estruturados via API Connect.',
      icon: '🔵',
      connected: preferences.activeWearables.garmin
    },
    {
      key: 'appleHealth',
      name: 'Apple Health (Apple Watch)',
      desc: 'Sincronização de anéis de atividade, FC basal e calorias ativas.',
      icon: '🔴',
      connected: preferences.activeWearables.appleHealth
    },
    {
      key: 'wahoo',
      name: 'Wahoo Fitness (ELEMNT)',
      desc: 'Transferência de rotas GPX e dados de rolo inteligente KICKR.',
      icon: '🟡',
      connected: preferences.activeWearables.wahoo
    },
    {
      key: 'polar',
      name: 'Polar Flow',
      desc: 'Cálculo de Training Load Pro e variabilidade de FC (HRV).',
      icon: '⚪',
      connected: preferences.activeWearables.polar
    }
  ];

  const toggleWearable = (key: string) => {
    const updated = {
      ...preferences.activeWearables,
      [key]: !preferences.activeWearables[key as keyof typeof preferences.activeWearables]
    };
    onUpdatePreferences({ activeWearables: updated });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a1a]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#2c52a1] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a]">
                Configurações & Ajustes
              </h4>
              <p className="meta text-[10px] text-[#1a1a1a]/50">
                PARÂMETROS DA CONTA & TELEMETRIA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#1a1a1a]/40 hover:text-[#1a1a1a] text-lg font-bold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 bg-[#f8f7f4] p-1 rounded-full border border-[#1a1a1a]/10">
          <button
            onClick={() => setActiveTab('interface')}
            className={`flex-1 py-2 rounded-full text-xs font-mono-numbers uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'interface'
                ? 'bg-[#2c52a1] text-white shadow-xs'
                : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
            }`}
          >
            Interface
          </button>
          <button
            onClick={() => setActiveTab('vestiveis')}
            className={`flex-1 py-2 rounded-full text-xs font-mono-numbers uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'vestiveis'
                ? 'bg-[#2c52a1] text-white shadow-xs'
                : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
            }`}
          >
            Dispositivos
          </button>
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex-1 py-2 rounded-full text-xs font-mono-numbers uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'perfil'
                ? 'bg-[#2c52a1] text-white shadow-xs'
                : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
            }`}
          >
            Perfil & Peso
          </button>
        </div>

        {/* TAB 1: INTERFACE & THEMES */}
        {activeTab === 'interface' && (
          <div className="space-y-4">
            {/* DARK MODE HIGH CONTRAST TOGGLE */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#101520] to-[#1a2333] border border-blue-500/30 text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                    {preferences.darkMode ? (
                      <Moon className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white block">
                        Modo Noturno (Dark Mode)
                      </span>
                      <span className="text-[9px] font-mono-numbers px-2 py-0.5 rounded-full font-bold uppercase bg-blue-500/30 text-blue-300 border border-blue-400/30">
                        {preferences.darkMode ? 'Ativado' : 'Desativado'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-300 block mt-0.5">
                      Paleta de alto contraste para pedais noturnos e rotas sob baixa luminosidade.
                    </span>
                  </div>
                </div>

                {/* Switch button */}
                <button
                  id="toggle-dark-mode-settings"
                  type="button"
                  onClick={() => onUpdatePreferences({ darkMode: !preferences.darkMode })}
                  className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0 ${
                    preferences.darkMode ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                  aria-label="Alternar Modo Noturno"
                >
                  <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 transition-transform">
                    {preferences.darkMode ? (
                      <Moon className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                </button>
              </div>

              {/* Sub-features: OLED Pure Black & Benefits */}
              <div className="pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={preferences.theme === 'amoled'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onUpdatePreferences({ theme: 'amoled', darkMode: true });
                      } else {
                        onUpdatePreferences({ theme: 'stealth' });
                      }
                    }}
                    className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer"
                  />
                  <span>Preto Absoluto AMOLED (Pixel OFF)</span>
                </label>
                <span className="text-[10px] text-blue-300 font-mono-numbers">
                  ✓ Altera CSS Global, Telas & Mapas
                </span>
              </div>
            </div>

            <div>
              <label className="meta text-[10px] text-[#1a1a1a]/60 block mb-2 font-bold">
                TEMA VISUAL DA INTERFACE:
              </label>
              <div className="space-y-2">
                {themes.map((th) => (
                  <button
                    key={th.key}
                    onClick={() => {
                      const willBeDark = th.key === 'amoled' ? true : preferences.darkMode;
                      onUpdatePreferences({ theme: th.key, darkMode: willBeDark });
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      preferences.theme === th.key
                        ? 'bg-[#f8f7f4] border-[#2c52a1] shadow-xs'
                        : 'bg-white border-[#1a1a1a]/10 hover:bg-[#f8f7f4]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full border-2 ${th.accent} ${th.bg}`} />
                      <span className="text-xs font-bold text-[#1a1a1a]">{th.name}</span>
                    </div>
                    {preferences.theme === th.key && (
                      <CheckCircle2 className="w-4 h-4 text-[#2c52a1]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick toggles */}
            <div className="space-y-2.5 pt-2 border-t border-[#1a1a1a]/10">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10">
                <div className="flex items-center gap-3">
                  <BatteryCharging className="w-5 h-5 text-[#2c52a1]" />
                  <div>
                    <span className="text-xs font-bold text-[#1a1a1a] block">
                      Modo Economia Extrema (Audax)
                    </span>
                    <span className="meta text-[10px] text-[#1a1a1a]/60">
                      Reduz taxa de atualização e aplica paleta OLED de baixo consumo
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.batterySaver}
                  onChange={(e) => onUpdatePreferences({ batterySaver: e.target.checked })}
                  className="w-4 h-4 accent-[#2c52a1] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#2c52a1]" />
                  <div>
                    <span className="text-xs font-bold text-[#1a1a1a] block">
                      Notificações Push de Progresso
                    </span>
                    <span className="meta text-[10px] text-[#1a1a1a]/60">
                      Alertas a cada quilômetro e parciais de segmento
                    </span>
                  </div>
                </div>
                <button
                  onClick={requestPushPermission}
                  className={`meta text-[10px] px-3 py-1.5 rounded-full font-bold border cursor-pointer ${
                    notificationGranted
                      ? 'bg-blue-50 text-[#2c52a1] border-blue-200'
                      : 'bg-white text-[#1a1a1a]/70 border-[#1a1a1a]/20'
                  }`}
                >
                  {notificationGranted ? 'ATIVADAS' : 'PERMITIR'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEARABLE INTEGRATIONS */}
        {activeTab === 'vestiveis' && (
          <div className="space-y-3">
            <span className="meta text-[10px] text-[#1a1a1a]/60 block">
              SINCRONIZAÇÃO AUTOMÁTICA COM PLATAFORMAS EXTERNAS:
            </span>

            <div className="space-y-2.5">
              {wearables.map((w) => (
                <div
                  key={w.key}
                  className="p-4 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{w.icon}</span>
                    <div>
                      <h5 className="font-bold text-[#1a1a1a] text-xs sm:text-sm">{w.name}</h5>
                      <p className="text-[11px] text-[#1a1a1a]/60">{w.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleWearable(w.key)}
                    className={`meta text-[10px] px-3.5 py-1.5 rounded-full font-bold border transition-all shrink-0 cursor-pointer ${
                      w.connected
                        ? 'bg-[#2c52a1] text-white border-[#2c52a1]'
                        : 'bg-white text-[#1a1a1a]/70 border-[#1a1a1a]/20 hover:border-[#2c52a1]'
                    }`}
                  >
                    {w.connected ? '✓ CONECTADO' : 'CONECTAR'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE & CALORIE CALCULATIONS */}
        {activeTab === 'perfil' && (
          <div className="space-y-4">
            <div>
              <label className="meta text-[10px] text-[#1a1a1a]/60 block mb-1 font-bold">
                PESO DO CICLISTA (KG)
              </label>
              <p className="text-xs text-[#1a1a1a]/60 mb-2">
                Usado para o cálculo fisiológico de calorias (METs) e calibragem de pneus.
              </p>
              <input
                type="number"
                value={preferences.userWeightKg}
                onChange={(e) => onUpdatePreferences({ userWeightKg: Number(e.target.value) })}
                className="w-full p-3 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10 text-sm font-mono-numbers text-[#1a1a1a] focus:outline-none focus:border-[#2c52a1]"
              />
            </div>

            <div>
              <label className="meta text-[10px] text-[#1a1a1a]/60 block mb-1 font-bold">
                PESO DA BICICLETA COM ACESSÓRIOS (KG)
              </label>
              <input
                type="number"
                value={preferences.bikeWeightKg}
                onChange={(e) => onUpdatePreferences({ bikeWeightKg: Number(e.target.value) })}
                className="w-full p-3 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10 text-sm font-mono-numbers text-[#1a1a1a] focus:outline-none focus:border-[#2c52a1]"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers uppercase text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};
