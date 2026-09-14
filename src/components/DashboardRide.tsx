import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Compass,
  Zap,
  Flame,
  Heart,
  Activity,
  Mountain,
  BatteryCharging,
  Layers,
  Volume2,
  VolumeX,
  Radio,
  Download,
  AlertCircle,
  Bluetooth,
  Gauge,
  Navigation as NavIcon,
  Crosshair,
  UserCheck,
  Sparkles,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  GPSPoint,
  HeartRateSensor,
  RideSession,
  LiveChallenge
} from '../types';
import {
  calculateDistanceKm,
  calculateCalories,
  formatDuration,
  formatPace,
  getHRZone,
  SAMPLE_ROUTE_COORDS
} from '../utils/geo';
import { playMilestoneChime, playHeartRateWarning } from '../utils/audio';

interface DashboardRideProps {
  sensor: HeartRateSensor;
  onOpenBluetoothModal: () => void;
  onFinishRide: (ride: RideSession) => void;
  batterySaver: boolean;
  onToggleBatterySaver: () => void;
  offlineMapReady: boolean;
  onOpenOfflineManager: () => void;
  activeChallenge?: LiveChallenge;
}

export const DashboardRide: React.FC<DashboardRideProps> = ({
  sensor,
  onOpenBluetoothModal,
  onFinishRide,
  batterySaver,
  onToggleBatterySaver,
  offlineMapReady,
  onOpenOfflineManager,
  activeChallenge
}) => {
  // Riding state
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [durationSecs, setDurationSecs] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  const [elevationGain, setElevationGain] = useState<number>(0);
  const [cadenceRpm, setCadenceRpm] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [useSimulator, setUseSimulator] = useState<boolean>(true); // default true for preview
  const [routePoints, setRoutePoints] = useState<GPSPoint[]>([]);

  // Simulation index tracker
  const simStepRef = useRef<number>(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Milestone alerts check
  const lastMilestoneKmRef = useRef<number>(0);

  // Initialize Leaflet Map safely (dynamic import or window.L)
  useEffect(() => {
    let mapInstance: any = null;

    const initMap = async () => {
      if (!mapContainerRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      const initialCenter = [-23.561684, -46.655981];

      // Check if map already exists
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      mapInstance = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // Dark Mode Tile layer (with fallback for offline)
      const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(mapInstance);

      // Route polyline
      const polyline = L.polyline([], {
        color: '#10b981',
        weight: 5,
        opacity: 0.9,
        smoothFactor: 1
      }).addTo(mapInstance);

      // Pulse Rider Marker
      const pulseIcon = L.divIcon({
        className: 'custom-bike-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: #10b981; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background: #10b981; border: 3px solid #0f172a; box-shadow: 0 0 10px #10b981;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(initialCenter, { icon: pulseIcon }).addTo(mapInstance);

      leafletMapRef.current = mapInstance;
      polylineRef.current = polyline;
      markerRef.current = marker;

      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 250);
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Timer interval for duration
  useEffect(() => {
    let timer: any;
    if (isActive && !isPaused) {
      timer = setInterval(() => {
        setDurationSecs((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, isPaused]);

  // GPS Simulator / Watcher loop
  useEffect(() => {
    let interval: any;

    if (isActive && !isPaused) {
      if (useSimulator) {
        // High fidelity cycling simulator along scenic coordinates
        interval = setInterval(() => {
          const step = simStepRef.current % SAMPLE_ROUTE_COORDS.length;
          const coord = SAMPLE_ROUTE_COORDS[step];
          const nextCoord = SAMPLE_ROUTE_COORDS[(step + 1) % SAMPLE_ROUTE_COORDS.length];

          // Introduce realistic speed variations (22 - 36 km/h)
          const simulatedSpeed = Number((24 + Math.sin(step * 0.5) * 8 + Math.random() * 3).toFixed(1));
          const simulatedCadence = Math.round(75 + (simulatedSpeed / 30) * 15 + Math.random() * 5);
          const simulatedAltitude = coord.altitude + Math.round(Math.sin(step) * 5);

          setCurrentSpeed(simulatedSpeed);
          setMaxSpeed((prev) => Math.max(prev, simulatedSpeed));
          setCadenceRpm(simulatedCadence);

          // Calculate step distance
          const addedKm = calculateDistanceKm(coord.lat, coord.lng, nextCoord.lat, nextCoord.lng);
          setDistanceKm((prev) => {
            const newDist = Number((prev + addedKm * 0.25).toFixed(2));
            // Check km milestones
            if (Math.floor(newDist) > lastMilestoneKmRef.current) {
              lastMilestoneKmRef.current = Math.floor(newDist);
              if (soundEnabled) playMilestoneChime();
            }
            return newDist;
          });

          // Add elevation gain
          if (nextCoord.altitude > coord.altitude) {
            setElevationGain((prev) => prev + (nextCoord.altitude - coord.altitude) * 0.3);
          }

          const newPoint: GPSPoint = {
            lat: coord.lat,
            lng: coord.lng,
            altitude: simulatedAltitude,
            speed: simulatedSpeed,
            timestamp: Date.now(),
            heartRate: sensor.connected ? sensor.bpm : Math.round(135 + simulatedSpeed * 1.1),
            cadence: simulatedCadence
          };

          setRoutePoints((prev) => [...prev, newPoint]);

          // Update Leaflet map smoothly
          if (leafletMapRef.current && polylineRef.current && markerRef.current) {
            const latLng = [coord.lat, coord.lng];
            polylineRef.current.addLatLng(latLng);
            markerRef.current.setLatLng(latLng);

            // In battery saver, only pan occasionally
            if (!batterySaver || step % 4 === 0) {
              leafletMapRef.current.panTo(latLng, { animate: true, duration: 0.5 });
            }
          }

          simStepRef.current += 1;
        }, 1500);
      } else {
        // Real HTML5 Geolocation API
        if ('geolocation' in navigator) {
          const watchId = navigator.geolocation.watchPosition(
            (pos) => {
              const { latitude, longitude, speed, altitude } = pos.coords;
              const spdKmH = speed ? Number((speed * 3.6).toFixed(1)) : 0;
              setCurrentSpeed(spdKmH);
              setMaxSpeed((prev) => Math.max(prev, spdKmH));

              const pt: GPSPoint = {
                lat: latitude,
                lng: longitude,
                altitude: altitude || 750,
                speed: spdKmH,
                timestamp: pos.timestamp,
                heartRate: sensor.bpm,
                cadence: cadenceRpm
              };

              setRoutePoints((prev) => {
                if (prev.length > 0) {
                  const last = prev[prev.length - 1];
                  const dist = calculateDistanceKm(last.lat, last.lng, latitude, longitude);
                  setDistanceKm((d) => Number((d + dist).toFixed(2)));
                  if (altitude && last.altitude && altitude > last.altitude) {
                    setElevationGain((e) => e + (altitude - last.altitude));
                  }
                }
                return [...prev, pt];
              });

              if (leafletMapRef.current && markerRef.current && polylineRef.current) {
                polylineRef.current.addLatLng([latitude, longitude]);
                markerRef.current.setLatLng([latitude, longitude]);
                leafletMapRef.current.panTo([latitude, longitude]);
              }
            },
            (err) => {
              console.warn('GPS watch error, falling back to simulator', err);
              setUseSimulator(true);
            },
            { enableHighAccuracy: true, maximumAge: 1000 }
          );

          return () => navigator.geolocation.clearWatch(watchId);
        }
      }
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, useSimulator, sensor.connected, sensor.bpm, batterySaver, soundEnabled]);

  // Derived calculations
  const avgSpeed = durationSecs > 0 ? Number(((distanceKm / (durationSecs / 3600))).toFixed(1)) : 0;
  const currentHR = sensor.connected ? sensor.bpm : (isActive ? Math.round(138 + currentSpeed * 0.9) : 72);
  const caloriesBurned = calculateCalories(avgSpeed || currentSpeed, durationSecs);
  const hrZoneInfo = getHRZone(currentHR);

  const startRide = () => {
    setIsActive(true);
    setIsPaused(false);
    if (soundEnabled) playMilestoneChime();
  };

  const pauseRide = () => {
    setIsPaused(true);
  };

  const resumeRide = () => {
    setIsPaused(false);
    if (soundEnabled) playMilestoneChime();
  };

  const finishAndSaveRide = () => {
    if (distanceKm < 0.1 && durationSecs < 10) {
      setIsActive(false);
      setIsPaused(false);
      return;
    }

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    const session: RideSession = {
      id: `ride-${Date.now()}`,
      title: `Pedal ${new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}`,
      date: new Date().toLocaleDateString('pt-BR'),
      startTime: Date.now() - durationSecs * 1000,
      endTime: Date.now(),
      duration: durationSecs,
      distance: distanceKm,
      avgSpeed: avgSpeed || currentSpeed,
      maxSpeed: maxSpeed || currentSpeed,
      calories: caloriesBurned,
      elevationGain: Math.round(elevationGain),
      avgHeartRate: currentHR,
      maxHeartRate: Math.round(currentHR * 1.15),
      avgCadence: cadenceRpm || 82,
      route: routePoints.length > 0 ? routePoints : SAMPLE_ROUTE_COORDS.map((c, i) => ({
        lat: c.lat,
        lng: c.lng,
        altitude: c.altitude,
        speed: avgSpeed,
        timestamp: Date.now() - i * 20000,
        heartRate: currentHR,
        cadence: cadenceRpm
      })),
      category: 'estrada'
    };

    onFinishRide(session);

    // Reset ride
    setIsActive(false);
    setIsPaused(false);
    setDurationSecs(0);
    setDistanceKm(0);
    setCurrentSpeed(0);
    setMaxSpeed(0);
    setElevationGain(0);
    setRoutePoints([]);
  };

  return (
    <div
      id="dashboard-ride-container"
      className={`relative rounded-3xl overflow-hidden border transition-colors ${
        batterySaver
          ? 'bg-black border-slate-900 text-white'
          : 'bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-md'
      }`}
    >
      {/* Top Banner Toolbar: Status, Battery Saver, Bluetooth, Sound, Offline Map */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`relative flex h-3 w-3`}>
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isActive && !isPaused ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isActive && !isPaused ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              />
            </span>
            <span className="font-bold text-xs sm:text-sm tracking-wide text-slate-200 uppercase">
              {isActive ? (isPaused ? 'Em Pausa' : 'Gravando Pedal') : 'Pronto para Iniciar'}
            </span>
          </div>

          {/* GPS Simulation Pill */}
          <button
            onClick={() => setUseSimulator(!useSimulator)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition-all font-medium flex items-center gap-1 ${
              useSimulator
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Alternar entre GPS Real e Simulador de Percurso"
          >
            <Radio className="w-3 h-3" />
            {useSimulator ? 'Simulador Cênico Ativo' : 'GPS do Dispositivo'}
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Offline Map Status */}
          <button
            id="btn-offline-map-toggle"
            onClick={onOpenOfflineManager}
            className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
              offlineMapReady
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Gerenciador de Mapas Offline"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mapa Offline</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>

          {/* Heart Rate Bluetooth Sensor button */}
          <button
            id="btn-bluetooth-sensor-connect"
            onClick={onOpenBluetoothModal}
            className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
              sensor.connected
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Conectar Sensor de Frequência Cardíaca BLE"
          >
            <Bluetooth className={`w-3.5 h-3.5 ${sensor.connected ? 'text-rose-400' : ''}`} />
            <span className="hidden sm:inline">
              {sensor.connected ? `${sensor.bpm} BPM` : 'Sensor BLE'}
            </span>
          </button>

          {/* Battery Saver Mode Toggle */}
          <button
            id="btn-battery-saver-toggle"
            onClick={onToggleBatterySaver}
            className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
              batterySaver
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Modo Bateria Ultra (AMOLED)"
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Modo Bateria</span>
          </button>

          {/* Sound Mute */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
            title="Alertas Sonoros"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Ghost Rider / Live Challenge Progress Bar (if active) */}
      {activeChallenge && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-900 px-4 sm:px-6 py-2.5 border-b border-indigo-900/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-slate-200 truncate">
              {activeChallenge.title}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <span className="text-slate-400">vs {activeChallenge.opponentName.split(' ')[0]}</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded ${
                distanceKm >= activeChallenge.opponentDistanceKm
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {distanceKm >= activeChallenge.opponentDistanceKm
                ? `+${Math.round((distanceKm - activeChallenge.opponentDistanceKm) * 1000)}m à frente`
                : `-${Math.round((activeChallenge.opponentDistanceKm - distanceKm) * 1000)}m atrás`}
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Map + Real-time Big HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Big Metrics Display (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 space-y-6">
          {/* Main Giant Metric: CURRENT SPEED */}
          <div className="text-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800/70 relative">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 block mb-1">
              Velocidade Atual
            </span>
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-mono text-6xl sm:text-7xl font-black text-emerald-400 tracking-tight">
                {currentSpeed.toFixed(1)}
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-400">km/h</span>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400">
              <span>Méd: <strong className="text-slate-200 font-mono">{avgSpeed}</strong></span>
              <span>•</span>
              <span>Máx: <strong className="text-slate-200 font-mono">{maxSpeed.toFixed(1)}</strong></span>
            </div>
          </div>

          {/* Secondary 4-Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Distance */}
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1 font-medium">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Distância
              </div>
              <div className="font-mono text-2xl font-bold text-slate-100">
                {distanceKm.toFixed(2)}{' '}
                <span className="text-xs font-sans text-slate-400">km</span>
              </div>
            </div>

            {/* Time */}
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1 font-medium">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Tempo Ativo
              </div>
              <div className="font-mono text-2xl font-bold text-slate-100">
                {formatDuration(durationSecs)}
              </div>
            </div>

            {/* Calories */}
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Queima Calórica
              </div>
              <div className="font-mono text-2xl font-bold text-amber-400">
                {caloriesBurned}{' '}
                <span className="text-xs font-sans text-slate-400">kcal</span>
              </div>
            </div>

            {/* Elevation */}
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1 font-medium">
                <Mountain className="w-3.5 h-3.5 text-indigo-400" />
                Elevação
              </div>
              <div className="font-mono text-2xl font-bold text-indigo-300">
                +{Math.round(elevationGain)}{' '}
                <span className="text-xs font-sans text-slate-400">m</span>
              </div>
            </div>
          </div>

          {/* Heart Rate Live Zone Bar */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart
                  className={`w-4 h-4 text-rose-500 ${
                    isActive && !isPaused ? 'animate-pulse' : ''
                  }`}
                />
                <span className="text-xs font-bold text-slate-200">Frequência Cardíaca</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-xl font-bold text-rose-400">{currentHR}</span>
                <span className="text-[11px] text-slate-400">BPM</span>
              </div>
            </div>

            <div className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold flex items-center justify-between ${hrZoneInfo.color}`}>
              <span>{hrZoneInfo.name}</span>
              <span>Zona {hrZoneInfo.zone}/5</span>
            </div>
          </div>

          {/* Ride Main Controls */}
          <div className="flex items-center gap-3 pt-2">
            {!isActive ? (
              <button
                id="btn-start-ride"
                onClick={startRide}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                INICIAR PEDAL
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    id="btn-resume-ride"
                    onClick={resumeRide}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    RETOMAR
                  </button>
                ) : (
                  <button
                    id="btn-pause-ride"
                    onClick={pauseRide}
                    className="flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    PAUSAR
                  </button>
                )}

                <button
                  id="btn-finish-ride"
                  onClick={finishAndSaveRide}
                  className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-900/30 transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  CONCLUIR
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Leaflet Map (7 cols) */}
        <div className="lg:col-span-7 relative min-h-[360px] sm:min-h-[460px] w-full bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '360px' }} />

          {/* Map Overlay Badges */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
            <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-200 shadow-xl flex items-center gap-2">
              <NavIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rota Ativa: Circuito da Cidade</span>
            </div>

            {offlineMapReady && (
              <div className="bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-800/80 text-[11px] font-semibold text-emerald-300 shadow-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Navegação Offline Garantida
              </div>
            )}
          </div>

          {/* Recenter Map Floating Button */}
          <div className="absolute bottom-4 right-4 z-[400]">
            <button
              onClick={() => {
                if (leafletMapRef.current && markerRef.current) {
                  leafletMapRef.current.panTo(markerRef.current.getLatLng());
                }
              }}
              className="p-3 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700 shadow-xl hover:bg-slate-800 transition-colors"
              title="Centralizar na Minha Posição"
            >
              <Crosshair className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
