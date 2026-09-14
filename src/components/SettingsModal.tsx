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
  ShieldCheck
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-100 text-base">
              Configurações & Personalização
            </h4>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('interface')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'interface'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aparência & Tema
          </button>
          <button
            onClick={() => setActiveTab('vestiveis')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'vestiveis'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dispositivos & Wearables
          </button>
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'perfil'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Métricas & Peso
          </button>
        </div>

        {/* TAB 1: INTERFACE & THEMES */}
        {activeTab === 'interface' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                Tema Visual da Interface:
              </label>
              <div className="space-y-2">
                {themes.map((th) => (
                  <button
                    key={th.key}
                    onClick={() => onUpdatePreferences({ theme: th.key })}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      preferences.theme === th.key
                        ? 'bg-slate-800/90 border-emerald-500 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full border-2 ${th.accent} ${th.bg}`} />
                      <span className="text-xs font-bold text-slate-100">{th.name}</span>
                    </div>
                    {preferences.theme === th.key && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <BatteryCharging className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">
                      Modo Economia Extrema (Audax)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Reduz taxa de atualização e desliga efeitos 3D
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.batterySaver}
                  onChange={(e) => onUpdatePreferences({ batterySaver: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">
                      Notificações Push de Progresso
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Alertas a cada quilômetro e metas atingidas
                    </span>
                  </div>
                </div>
                <button
                  onClick={requestPushPermission}
                  className={`text-xs px-2.5 py-1 rounded font-semibold border ${
                    notificationGranted
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {notificationGranted ? 'Ativadas' : 'Permitir'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEARABLE INTEGRATIONS */}
        {activeTab === 'vestiveis' && (
          <div className="space-y-3">
            <span className="text-xs text-slate-400 block">
              Conecte suas contas de saúde e ciclocomputadores para exportação automática:
            </span>

            <div className="space-y-2.5">
              {wearables.map((w) => (
                <div
                  key={w.key}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{w.icon}</span>
                    <div>
                      <h5 className="font-bold text-slate-100 text-xs sm:text-sm">{w.name}</h5>
                      <p className="text-[11px] text-slate-400">{w.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleWearable(w.key)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all shrink-0 ${
                      w.connected
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {w.connected ? '✓ Conectado' : 'Conectar'}
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
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Peso do Ciclista (kg)
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Usado para o cálculo preciso de gasto calórico (METs) e pressão de pneus.
              </p>
              <input
                type="number"
                value={preferences.userWeightKg}
                onChange={(e) => onUpdatePreferences({ userWeightKg: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Peso da Bicicleta (kg)
              </label>
              <input
                type="number"
                value={preferences.bikeWeightKg}
                onChange={(e) => onUpdatePreferences({ bikeWeightKg: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
        >
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};
