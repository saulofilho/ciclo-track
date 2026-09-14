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
import { HeartRateLiveChart, HeartRateDataPoint } from './HeartRateLiveChart';

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

  // Real-time Heart Rate Graph data points for Recharts
  const [hrDataPoints, setHrDataPoints] = useState<HeartRateDataPoint[]>(() => {
    const now = Date.now();
    return [
      { time: '00:00', bpm: 72, timestamp: now - 25000, speed: 0, zone: 1 },
      { time: '00:05', bpm: 74, timestamp: now - 20000, speed: 0, zone: 1 },
      { time: '00:10', bpm: 73, timestamp: now - 15000, speed: 0, zone: 1 },
      { time: '00:15', bpm: 75, timestamp: now - 10000, speed: 0, zone: 1 },
      { time: '00:20', bpm: 76, timestamp: now - 5000, speed: 0, zone: 1 }
    ];
  });

  const durationSecsRef = useRef<number>(0);
  durationSecsRef.current = durationSecs;

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

      // Map tile layer: Clean light map for Variation 3 (with dark fallback if batterySaver)
      const tileUrl = batterySaver
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(mapInstance);

      // Route polyline with cobalt blue (#2c52a1)
      const polyline = L.polyline([], {
        color: batterySaver ? '#10b981' : '#2c52a1',
        weight: 5,
        opacity: 0.9,
        smoothFactor: 1
      }).addTo(mapInstance);

      // Pulse Rider Marker in cobalt blue
      const pulseColor = batterySaver ? '#10b981' : '#2c52a1';
      const pulseIcon = L.divIcon({
        className: 'custom-bike-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: ${pulseColor}; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background: ${pulseColor}; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
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

          const simulatedHR = sensor.connected
            ? sensor.bpm
            : Math.round(135 + simulatedSpeed * 1.05 + Math.sin(step) * 4);

          const newPoint: GPSPoint = {
            lat: coord.lat,
            lng: coord.lng,
            altitude: simulatedAltitude,
            speed: simulatedSpeed,
            timestamp: Date.now(),
            heartRate: simulatedHR,
            cadence: simulatedCadence
          };

          setRoutePoints((prev) => [...prev, newPoint]);

          // Append to Recharts real-time heart rate graph buffer
          setHrDataPoints((prev) => {
            const newHrPoint: HeartRateDataPoint = {
              time: formatDuration(durationSecsRef.current),
              bpm: simulatedHR,
              speed: simulatedSpeed,
              timestamp: Date.now(),
              zone: getHRZone(simulatedHR).zone
            };
            const updated = [...prev, newHrPoint];
            return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
          });

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

              const currentHrVal = sensor.connected ? sensor.bpm : Math.round(135 + spdKmH * 0.9);

              const pt: GPSPoint = {
                lat: latitude,
                lng: longitude,
                altitude: altitude || 750,
                speed: spdKmH,
                timestamp: pos.timestamp,
                heartRate: currentHrVal,
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

              setHrDataPoints((prev) => {
                const newHrPoint: HeartRateDataPoint = {
                  time: formatDuration(durationSecsRef.current),
                  bpm: currentHrVal,
                  speed: spdKmH,
                  timestamp: Date.now(),
                  zone: getHRZone(currentHrVal).zone
                };
                const updated = [...prev, newHrPoint];
                return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
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

    const startHr = sensor.connected ? sensor.bpm : 136;
    setHrDataPoints((prev) => [
      ...prev,
      {
        time: '00:00',
        bpm: startHr,
        speed: 0,
        timestamp: Date.now(),
        zone: getHRZone(startHr).zone
      }
    ]);
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
    setHrDataPoints([
      { time: '00:00', bpm: 72, timestamp: Date.now() - 25000, speed: 0, zone: 1 },
      { time: '00:05', bpm: 74, timestamp: Date.now() - 20000, speed: 0, zone: 1 },
      { time: '00:10', bpm: 73, timestamp: Date.now() - 15000, speed: 0, zone: 1 },
      { time: '00:15', bpm: 75, timestamp: Date.now() - 10000, speed: 0, zone: 1 },
      { time: '00:20', bpm: 76, timestamp: Date.now() - 5000, speed: 0, zone: 1 }
    ]);
  };

  return (
    <div
      id="dashboard-ride-container"
      className={`relative rounded-3xl overflow-hidden border transition-all ${
        batterySaver
          ? 'bg-black border-slate-900 text-white shadow-2xl'
          : 'bg-white border-[#1a1a1a]/10 text-[#1a1a1a] shadow-sm'
      }`}
    >
      {/* Top Banner Toolbar: Status, GPS Mode, Offline Map, BLE & Battery */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-b transition-colors ${
          batterySaver
            ? 'border-slate-900 bg-black/90'
            : 'border-[#1a1a1a]/10 bg-[#f8f7f4]/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isActive && !isPaused ? 'bg-[#2c52a1]' : 'bg-[#1a1a1a]/30'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isActive && !isPaused ? 'bg-[#2c52a1]' : 'bg-[#1a1a1a]/50'
                }`}
              />
            </span>
            <span className="meta-dark font-bold text-xs tracking-wider">
              {isActive ? (isPaused ? 'STATUS: EM PAUSA' : 'STATUS: GRAVANDO PEDAL') : 'STATUS: SISTEMA PRONTO'}
            </span>
          </div>

          {/* GPS Simulation Pill */}
          <button
            onClick={() => setUseSimulator(!useSimulator)}
            className={`meta px-3 py-1 rounded-full border transition-all font-medium flex items-center gap-1.5 ${
              useSimulator
                ? 'bg-white text-[#2c52a1] border-[#2c52a1]/30 font-semibold shadow-xs'
                : 'bg-transparent text-[#1a1a1a]/60 border-[#1a1a1a]/15 hover:text-[#1a1a1a]'
            }`}
            title="Alternar entre GPS Real e Simulador de Percurso"
          >
            <Radio className="w-3 h-3" />
            {useSimulator ? 'SIMULADOR ATIVO' : 'GPS REAL'}
          </button>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          {/* Offline Map Status */}
          <button
            id="btn-offline-map-toggle"
            onClick={onOpenOfflineManager}
            className={`meta px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all ${
              offlineMapReady
                ? 'bg-white text-[#2c52a1] border-[#2c52a1]/25 font-bold'
                : 'bg-transparent text-[#1a1a1a]/60 border-[#1a1a1a]/15 hover:text-[#1a1a1a]'
            }`}
            title="Gerenciador de Mapas Offline"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OFFLINE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          {/* Heart Rate Bluetooth Sensor button */}
          <button
            id="btn-bluetooth-sensor-connect"
            onClick={onOpenBluetoothModal}
            className={`meta px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all ${
              sensor.connected
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-transparent text-[#1a1a1a]/60 border-[#1a1a1a]/15 hover:text-[#1a1a1a]'
            }`}
            title="Conectar Sensor de Frequência Cardíaca BLE"
          >
            <Bluetooth className={`w-3.5 h-3.5 ${sensor.connected ? 'text-rose-600' : ''}`} />
            <span className="hidden sm:inline">
              {sensor.connected ? `${sensor.bpm} BPM` : 'BLE SENSOR'}
            </span>
          </button>

          {/* Battery Saver Mode Toggle */}
          <button
            id="btn-battery-saver-toggle"
            onClick={onToggleBatterySaver}
            className={`meta px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all ${
              batterySaver
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                : 'bg-transparent text-[#1a1a1a]/60 border-[#1a1a1a]/15 hover:text-[#1a1a1a]'
            }`}
            title="Modo Bateria Ultra (AMOLED)"
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BATERIA</span>
          </button>

          {/* Sound Mute */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full border border-[#1a1a1a]/15 text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:bg-white transition-colors"
            title="Alertas Sonoros"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Live Challenge Progress Bar (if active) */}
      {activeChallenge && (
        <div className="bg-[#2c52a1]/10 px-5 sm:px-6 py-2.5 border-b border-[#2c52a1]/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#2c52a1] shrink-0" />
            <span className="font-serif-display italic font-semibold text-sm text-[#1a1a1a] truncate">
              {activeChallenge.title}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <span className="meta text-[#1a1a1a]/60">vs {activeChallenge.opponentName.split(' ')[0]}</span>
            <span
              className={`meta px-2.5 py-1 rounded-full font-bold ${
                distanceKm >= activeChallenge.opponentDistanceKm
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {distanceKm >= activeChallenge.opponentDistanceKm
                ? `+${Math.round((distanceKm - activeChallenge.opponentDistanceKm) * 1000)}M À FRENTE`
                : `-${Math.round((activeChallenge.opponentDistanceKm - distanceKm) * 1000)}M ATRÁS`}
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Map + Real-time Big HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Big Metrics Display (5 cols) */}
        <div
          className={`lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r space-y-6 ${
            batterySaver
              ? 'bg-black border-slate-900 text-white'
              : 'bg-white border-[#1a1a1a]/10 text-[#1a1a1a]'
          }`}
        >
          {/* Main Giant Metric: CURRENT SPEED */}
          <div
            className={`text-center py-6 px-4 rounded-2xl border relative ${
              batterySaver
                ? 'bg-zinc-950 border-zinc-800'
                : 'bg-[#f8f7f4] border-[#1a1a1a]/10'
            }`}
          >
            <span className="meta block mb-1">
              VELOCIDADE KM/H
            </span>
            <div className="flex items-baseline justify-center gap-2 my-1">
              <span className="font-mono-numbers text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tight text-[#1a1a1a] leading-none">
                {currentSpeed.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs">
              <span className="meta">MÉD: <strong className="meta-dark">{avgSpeed} KM/H</strong></span>
              <span className="text-[#1a1a1a]/20">•</span>
              <span className="meta">MÁX: <strong className="meta-dark">{maxSpeed.toFixed(1)} KM/H</strong></span>
            </div>
          </div>

          {/* Secondary 4-Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Distance */}
            <div
              className={`p-4 rounded-2xl border ${
                batterySaver ? 'bg-zinc-950 border-zinc-800' : 'bg-[#f8f7f4] border-[#1a1a1a]/10'
              }`}
            >
              <div className="meta mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#2c52a1]" />
                DISTÂNCIA
              </div>
              <div className="font-mono-numbers text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                {distanceKm.toFixed(2)}{' '}
                <span className="meta text-xs">KM</span>
              </div>
            </div>

            {/* Time */}
            <div
              className={`p-4 rounded-2xl border ${
                batterySaver ? 'bg-zinc-950 border-zinc-800' : 'bg-[#f8f7f4] border-[#1a1a1a]/10'
              }`}
            >
              <div className="meta mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#2c52a1]" />
                TEMPO ATIVO
              </div>
              <div className="font-mono-numbers text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                {formatDuration(durationSecs)}
              </div>
            </div>

            {/* Calories */}
            <div
              className={`p-4 rounded-2xl border ${
                batterySaver ? 'bg-zinc-950 border-zinc-800' : 'bg-[#f8f7f4] border-[#1a1a1a]/10'
              }`}
            >
              <div className="meta mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#2c52a1]" />
                CALORIAS
              </div>
              <div className="font-mono-numbers text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                {caloriesBurned}{' '}
                <span className="meta text-xs">KCAL</span>
              </div>
            </div>

            {/* Elevation */}
            <div
              className={`p-4 rounded-2xl border ${
                batterySaver ? 'bg-zinc-950 border-zinc-800' : 'bg-[#f8f7f4] border-[#1a1a1a]/10'
              }`}
            >
              <div className="meta mb-1.5 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-[#2c52a1]" />
                ELEVAÇÃO
              </div>
              <div className="font-mono-numbers text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                +{Math.round(elevationGain)}{' '}
                <span className="meta text-xs">M</span>
              </div>
            </div>
          </div>

          {/* Heart Rate Live Zone Bar */}
          <div
            className={`p-4 rounded-2xl border space-y-2.5 ${
              batterySaver ? 'bg-zinc-950 border-zinc-800' : 'bg-[#f8f7f4] border-[#1a1a1a]/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart
                  className={`w-4 h-4 text-rose-600 ${
                    isActive && !isPaused ? 'animate-pulse' : ''
                  }`}
                />
                <span className="meta-dark font-bold">FREQUÊNCIA CARDÍACA</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono-numbers text-2xl font-bold text-rose-600">{currentHR}</span>
                <span className="meta text-[10px]">BPM</span>
              </div>
            </div>

            <div className={`text-xs px-3 py-1.5 rounded-full border font-mono-numbers flex items-center justify-between bg-white border-[#1a1a1a]/10`}>
              <span className="font-bold text-[#1a1a1a]">{hrZoneInfo.name}</span>
              <span className="meta text-[10px]">ZONA {hrZoneInfo.zone} / 5</span>
            </div>

            <a
              href="#heart-rate-live-telemetry"
              className="meta text-[10px] text-[#2c52a1] hover:underline flex items-center justify-center gap-1 font-bold pt-0.5 block text-center"
            >
              Visualizar Gráfico em Tempo Real ↓
            </a>
          </div>

          {/* Ride Main Controls - Styled according to Variation 3 */}
          <div className="flex items-center gap-3 pt-2">
            {!isActive ? (
              <button
                id="btn-start-ride"
                onClick={startRide}
                className="w-full py-4 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers font-bold text-base flex items-center justify-center gap-3 shadow-md transition-all active:scale-[0.98] uppercase tracking-wider cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                INICIAR PEDAL
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    id="btn-resume-ride"
                    onClick={resumeRide}
                    className="flex-1 py-4 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all uppercase tracking-wider cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    RETOMAR
                  </button>
                ) : (
                  <button
                    id="btn-pause-ride"
                    onClick={pauseRide}
                    className="flex-1 py-4 rounded-full bg-[#1a1a1a] hover:bg-[#333333] text-white font-mono-numbers font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all uppercase tracking-wider cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    PAUSAR
                  </button>
                )}

                <button
                  id="btn-finish-ride"
                  onClick={finishAndSaveRide}
                  className="flex-1 py-4 rounded-full bg-rose-700 hover:bg-rose-800 text-white font-mono-numbers font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all uppercase tracking-wider cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  CONCLUIR
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Clean Leaflet Map (7 cols) */}
        <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[500px] w-full bg-[#f1f0ec]">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '380px' }} />

          {/* Map Overlay Badges in Variation 3 Style */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#1a1a1a]/10 text-xs shadow-sm flex items-center gap-2.5">
              <NavIcon className="w-3.5 h-3.5 text-[#2c52a1]" />
              <span className="font-serif-display text-sm font-semibold text-[#1a1a1a]">
                Circuito da Cidade • São Paulo
              </span>
            </div>

            {offlineMapReady && (
              <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#1a1a1a]/10 text-[11px] shadow-xs flex items-center gap-1.5 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="meta text-[10px] text-[#1a1a1a]">MAPA OFFLINE BAIXADO</span>
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
              className="p-3 rounded-full bg-white text-[#1a1a1a] border border-[#1a1a1a]/15 shadow-md hover:bg-[#f8f7f4] transition-colors cursor-pointer"
              title="Centralizar na Minha Posição"
            >
              <Crosshair className="w-4 h-4 text-[#2c52a1]" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Heart Rate Graph Section with Recharts */}
      <div className="border-t border-[#1a1a1a]/10 p-4 sm:p-6 bg-[#faf9f6]">
        <HeartRateLiveChart
          data={hrDataPoints}
          currentBpm={currentHR}
          sensorConnected={sensor.connected}
          sensorName={sensor.deviceName}
          batterySaver={batterySaver}
          isActive={isActive}
          isPaused={isPaused}
        />
      </div>
    </div>
  );
};
