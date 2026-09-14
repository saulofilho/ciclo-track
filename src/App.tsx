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

  // Theme wrapper styling - Variation 3 architectural linen
  const getThemeClass = () => {
    if (preferences.batterySaver) return 'bg-black text-white';
    switch (preferences.theme) {
      case 'amoled':
        return 'bg-black text-white';
      case 'neon':
        return 'bg-slate-950 text-cyan-50';
      case 'forest':
        return 'bg-[#f4f6f0] text-stone-900';
      case 'sunset':
        return 'bg-[#faf6f0] text-stone-900';
      case 'stealth':
      default:
        return 'bg-[#f8f7f4] text-[#1a1a1a]';
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

            {/* Quick Link Cards - Variation 3 Aesthetic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setActiveTab('bike3d')}
                className="p-6 rounded-3xl bg-white border border-[#1a1a1a]/10 hover:border-[#2c52a1]/40 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <span className="meta text-[#2c52a1] block mb-1 font-bold">
                    OFICINA 3D • DIAGNÓSTICO
                  </span>
                  <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a] group-hover:text-[#2c52a1] transition-colors">
                    Examinar Componentes em 3D
                  </h4>
                  <p className="text-xs text-[#1a1a1a]/60 mt-1 max-w-md">
                    Giro livre 360°, modo raio-X e telemetria de desgaste de transmissão, freios e pneus.
                  </p>
                </div>
                <div className="w-11 h-11 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#2c52a1] flex items-center justify-center font-bold text-lg group-hover:bg-[#2c52a1] group-hover:text-white transition-all shrink-0 ml-4">
                  →
                </div>
              </div>

              <div
                onClick={() => setActiveTab('oficinas')}
                className="p-6 rounded-3xl bg-white border border-[#1a1a1a]/10 hover:border-[#2c52a1]/40 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <span className="meta text-[#2c52a1] block mb-1 font-bold">
                    SUPORTE & EMERGÊNCIA
                  </span>
                  <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a] group-hover:text-[#2c52a1] transition-colors">
                    Oficinas & Points de Apoio
                  </h4>
                  <p className="text-xs text-[#1a1a1a]/60 mt-1 max-w-md">
                    Localize bombas de alta pressão 24h, água potável, chaves allen e mecânicos credenciados.
                  </p>
                </div>
                <div className="w-11 h-11 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#2c52a1] flex items-center justify-center font-bold text-lg group-hover:bg-[#2c52a1] group-hover:text-white transition-all shrink-0 ml-4">
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
            <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a]">
                  Deseja visualizar esses componentes na bicicleta 3D?
                </h4>
                <p className="text-xs text-[#1a1a1a]/60 mt-1">
                  Gire o modelo tridimensional e inspecione a geometria do quadro, corrente e grupo de marchas.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('bike3d')}
                className="px-5 py-2.5 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers uppercase text-xs font-bold shrink-0 transition-colors cursor-pointer"
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

      {/* Footer - Variation 3 Space Mono & Editorial Note */}
      <footer className="border-t border-[#1a1a1a]/10 bg-[#f8f7f4] py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="meta text-[#1a1a1a]/60">
            © 2026 CICLOTRACK SOFTWARE • GPS DE ALTA PRECISÃO • OFICINA 3D
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="meta px-2.5 py-1 rounded-full bg-white border border-[#1a1a1a]/10 text-[#1a1a1a]/70">
              STRAVA SYNC: ATIVO
            </span>
            <span className="meta px-2.5 py-1 rounded-full bg-white border border-[#1a1a1a]/10 text-[#1a1a1a]/70">
              GARMIN CONNECT: CONECTADO
            </span>
            <span className="meta px-2.5 py-1 rounded-full bg-white border border-[#1a1a1a]/10 text-[#2c52a1] font-bold">
              GPS LOCK: 10HZ
            </span>
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
