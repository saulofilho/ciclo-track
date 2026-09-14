/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  HeartRateSensor,
  RideSession,
  BikeComponentStatus,
  LiveChallenge,
  UserPreferences,
  SocialPost,
  Achievement
} from './types';
import {
  HISTORIC_RIDES,
  INITIAL_BIKE_COMPONENTS,
  INITIAL_ASSISTANCE_POINTS,
  BIKE_BRANDS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_SOCIAL_POSTS,
  INITIAL_LEADERBOARD,
  INITIAL_LIVE_CHALLENGES
} from './data/mockData';
import { Navigation, MainTab } from './components/Navigation';
import { DashboardRide } from './components/DashboardRide';
import { Bike3DViewer } from './components/Bike3DViewer';
import { BikeCare } from './components/BikeCare';
import { WorkoutsHistory } from './components/WorkoutsHistory';
import { AssistancePoints } from './components/AssistancePoints';
import { BrandsCatalog } from './components/BrandsCatalog';
import { SocialFeed } from './components/SocialFeed';
import { BluetoothSensorModal } from './components/BluetoothSensorModal';
import { OfflineMapModal } from './components/OfflineMapModal';
import { ShareCardModal } from './components/ShareCardModal';
import { SettingsModal } from './components/SettingsModal';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('pedal');

  // Heart Rate Sensor State
  const [sensor, setSensor] = useState<HeartRateSensor>({
    connected: false,
    bpm: 74,
    isSimulated: false
  });

  // Data collections with local state
  const [rides, setRides] = useState<RideSession[]>(HISTORIC_RIDES);
  const [components, setComponents] = useState<BikeComponentStatus[]>(INITIAL_BIKE_COMPONENTS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_SOCIAL_POSTS);
  const [challenges, setChallenges] = useState<LiveChallenge[]>(INITIAL_LIVE_CHALLENGES);
  const [activeChallenge, setActiveChallenge] = useState<LiveChallenge | undefined>(undefined);

  // Settings & Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'stealth',
    batterySaver: false,
    soundAlerts: true,
    pushNotifications: false,
    userWeightKg: 72,
    bikeWeightKg: 8.5,
    dashboardMetrics: ['speed', 'distance', 'time', 'calories', 'elevation', 'hr'],
    activeWearables: {
      strava: true,
      garmin: true,
      appleHealth: false,
      wahoo: false,
      polar: false
    },
    offlineMapDownloaded: true
  });

  // Modals
  const [showBluetoothModal, setShowBluetoothModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [shareRideTarget, setShareRideTarget] = useState<RideSession | null>(null);

  // Reset Component Mileage when serviced
  const handleResetComponentKm = (id: string) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              currentKm: 0,
              status: 'otimo',
              lastServiceDate: 'Hoje'
            }
          : c
      )
    );

    confetti({
      particleCount: 50,
      spread: 50
    });
  };

  // Add new completed ride
  const handleFinishRide = (newRide: RideSession) => {
    setRides((prev) => [newRide, ...prev]);

    // Update bike components mileage with the new ride distance
    setComponents((prev) =>
      prev.map((c) => {
        const nextKm = Math.round(c.currentKm + newRide.distance);
        const ratio = nextKm / c.maxRecommendedKm;
        const status = ratio >= 0.95 ? 'critico' : ratio >= 0.75 ? 'atencao' : 'otimo';
        return {
          ...c,
          currentKm: nextKm,
          status
        };
      })
    );

    // Check achievement unlock: 50k or KOM
    if (newRide.distance >= 50) {
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === 'ach-2'
            ? { ...a, unlocked: true, progress: 100, unlockedDate: 'Hoje' }
            : a
        )
      );
    }

    // Navigate to history to show post-activity report
    setActiveTab('historico');
  };

  // Add new social feed post
  const handleAddPost = (newPost: SocialPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Select live challenge duel
  const handleSelectChallenge = (chal: LiveChallenge) => {
    setActiveChallenge(chal);
    setActiveTab('pedal');
  };

  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  // Theme wrapper styling
  const getThemeClass = () => {
    if (preferences.batterySaver) return 'bg-black text-white';
    switch (preferences.theme) {
      case 'amoled':
        return 'bg-black text-white';
      case 'neon':
        return 'bg-slate-950 text-cyan-50';
      case 'forest':
        return 'bg-stone-950 text-stone-100';
      case 'sunset':
        return 'bg-slate-950 text-amber-50';
      case 'stealth':
      default:
        return 'bg-slate-950 text-slate-100';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeClass()} flex flex-col font-sans transition-colors duration-300`}>
      {/* Navigation Header */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        sensor={sensor}
        onOpenBluetoothModal={() => setShowBluetoothModal(true)}
        batterySaver={preferences.batterySaver}
        onToggleBatterySaver={() =>
          setPreferences((p) => ({ ...p, batterySaver: !p.batterySaver }))
        }
        onOpenSettings={() => setShowSettingsModal(true)}
        unlockedAchievementsCount={unlockedAchievementsCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'pedal' && (
          <div className="space-y-6">
            <DashboardRide
              sensor={sensor}
              onOpenBluetoothModal={() => setShowBluetoothModal(true)}
              onFinishRide={handleFinishRide}
              batterySaver={preferences.batterySaver}
              onToggleBatterySaver={() =>
                setPreferences((p) => ({ ...p, batterySaver: !p.batterySaver }))
              }
              offlineMapReady={preferences.offlineMapDownloaded}
              onOpenOfflineManager={() => setShowOfflineModal(true)}
              activeChallenge={activeChallenge}
            />

            {/* Quick Link to 3D Bike and Maintenance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setActiveTab('bike3d')}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-0.5">
                    Inspeção Digital 3D
                  </span>
                  <h4 className="font-bold text-slate-100 text-base group-hover:text-emerald-400 transition-colors">
                    Examinar Componentes em 3D
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Giro livre, raio-X e diagnóstico em tempo real das peças da sua bike.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  →
                </div>
              </div>

              <div
                onClick={() => setActiveTab('oficinas')}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-0.5">
                    Apoio & Emergência
                  </span>
                  <h4 className="font-bold text-slate-100 text-base group-hover:text-cyan-400 transition-colors">
                    Oficinas & Points de Apoio
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Encontre bombas de ar 24h, água potável e mecânicos credenciados por perto.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  →
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bike3d' && (
          <div className="space-y-6">
            <Bike3DViewer
              components={components}
              onSelectComponent={() => {
                const careEl = document.getElementById('bike-care-section');
                if (careEl) careEl.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <BikeCare
              components={components}
              onResetKm={handleResetComponentKm}
              userWeightKg={preferences.userWeightKg}
            />
          </div>
        )}

        {activeTab === 'cuidados' && (
          <div className="space-y-6">
            <BikeCare
              components={components}
              onResetKm={handleResetComponentKm}
              userWeightKg={preferences.userWeightKg}
            />
            {/* Quick 3D Preview Anchor */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-100 text-sm sm:text-base">
                  Deseja visualizar esses componentes na bicicleta 3D?
                </h4>
                <p className="text-xs text-slate-400">
                  Gire o modelo tridimensional e inspecione o quadro, transmissão e garfo.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('bike3d')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
              >
                Abrir Visualizador 3D
              </button>
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <WorkoutsHistory
            rides={rides}
            onOpenShareModal={(ride) => setShareRideTarget(ride)}
          />
        )}

        {activeTab === 'oficinas' && (
          <AssistancePoints points={INITIAL_ASSISTANCE_POINTS} />
        )}

        {activeTab === 'marcas' && (
          <BrandsCatalog brands={BIKE_BRANDS} />
        )}

        {activeTab === 'comunidade' && (
          <SocialFeed
            posts={posts}
            onAddPost={handleAddPost}
            leaderboard={INITIAL_LEADERBOARD}
            challenges={challenges}
            onSelectChallenge={handleSelectChallenge}
            achievements={achievements}
            activeChallengeId={activeChallenge?.id}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 CicloTrack Pro — Rastreamento GPS, Mapas Offline, Sensores BLE e Oficina 3D</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Strava Sync: Ativo</span>
            <span>•</span>
            <span>Garmin Connect: Conectado</span>
            <span>•</span>
            <span>GPS: 10Hz Lock</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {showBluetoothModal && (
        <BluetoothSensorModal
          sensor={sensor}
          onUpdateSensor={setSensor}
          onClose={() => setShowBluetoothModal(false)}
        />
      )}

      {showOfflineModal && (
        <OfflineMapModal
          onClose={() => setShowOfflineModal(false)}
          offlineReady={preferences.offlineMapDownloaded}
          onSetOfflineReady={(ready) =>
            setPreferences((p) => ({ ...p, offlineMapDownloaded: ready }))
          }
        />
      )}

      {shareRideTarget && (
        <ShareCardModal
          ride={shareRideTarget}
          onClose={() => setShareRideTarget(null)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          preferences={preferences}
          onUpdatePreferences={(newPref) =>
            setPreferences((p) => ({ ...p, ...newPref }))
          }
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
