export interface GPSPoint {
  lat: number;
  lng: number;
  altitude: number; // in meters
  speed: number; // in km/h
  timestamp: number;
  heartRate?: number;
  cadence?: number;
}

export interface RideSession {
  id: string;
  title: string;
  date: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  distance: number; // in km
  avgSpeed: number; // in km/h
  maxSpeed: number; // in km/h
  calories: number; // in kcal
  elevationGain: number; // in meters
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgCadence?: number;
  route: GPSPoint[];
  category: 'estrada' | 'mtb' | 'gravel' | 'urbano';
  notes?: string;
  weather?: {
    temp: number;
    condition: string;
    windSpeed: number;
  };
}

export interface HeartRateSensor {
  connected: boolean;
  deviceName?: string;
  bpm: number;
  batteryLevel?: number;
  isSimulated: boolean;
}

export interface BikeComponentStatus {
  id: string;
  name: string;
  category: 'transmissao' | 'freios' | 'pneus' | 'suspensao' | 'quadro' | 'cockpit';
  currentKm: number;
  maxRecommendedKm: number;
  lastServiceDate: string;
  status: 'otimo' | 'atencao' | 'critico';
  tips: string;
  partDetails?: string;
  threeDPartKey?: string; // Links to 3D hotspot
}

export interface AssistancePoint {
  id: string;
  name: string;
  type: 'oficina_especializada' | 'bike_shop' | 'ponto_apoio' | 'socorro_movel';
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  whatsapp: string;
  rating: number;
  reviewCount: number;
  services: string[];
  openNow: boolean;
  openingHours: string;
  hasAirPump: boolean;
  hasWaterPoint: boolean;
  emergencyAvailable: boolean;
}

export interface BikeBrand {
  id: string;
  name: string;
  origin: string;
  founded: number;
  category: 'bicicletas' | 'componentes' | 'suspensao' | 'pneus' | 'acessorios';
  description: string;
  popularModels: string[];
  logoUrl?: string;
  website: string;
  specialty: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'distancia' | 'velocidade' | 'altimetria' | 'consistencia' | 'social';
  icon: string;
  unlocked: boolean;
  progress: number; // 0 to 100
  unlockedDate?: string;
  rewardPoints: number;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorTitle: string;
  date: string;
  timeAgo: string;
  content: string;
  photoUrl?: string;
  locationName: string;
  coords: { lat: number; lng: number };
  rideSummary?: {
    distance: number;
    elevation: number;
    avgSpeed: number;
    time: string;
  };
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  comments: {
    id: string;
    author: string;
    text: string;
    time: string;
  }[];
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  distanceMonthKm: number;
  elevationMonthM: number;
  ridesCount: number;
  points: number;
  badge: 'ouro' | 'prata' | 'bronze' | 'top10' | 'pelotao';
  city: string;
  category: 'Geral' | 'Estrada' | 'MTB' | 'Gravel';
}

export interface LiveChallenge {
  id: string;
  title: string;
  opponentName: string;
  opponentAvatar: string;
  opponentDistanceKm: number;
  targetDistanceKm: number;
  opponentPace: string;
  myDistanceKm: number;
  status: 'ativo' | 'venceu' | 'perdeu';
  distanceDifferenceMeters: number;
}

export type AppTheme = 'stealth' | 'neon' | 'forest' | 'sunset' | 'amoled';

export interface UserPreferences {
  theme: AppTheme;
  darkMode: boolean;
  highContrastDark?: boolean;
  batterySaver: boolean;
  soundAlerts: boolean;
  pushNotifications: boolean;
  userWeightKg: number;
  bikeWeightKg: number;
  dashboardMetrics: string[]; // e.g. ['speed', 'distance', 'time', 'calories', 'hr', 'cadence', 'elevation']
  activeWearables: {
    strava: boolean;
    garmin: boolean;
    appleHealth: boolean;
    wahoo: boolean;
    polar: boolean;
  };
  offlineMapDownloaded: boolean;
}
