import {
  RideSession,
  BikeComponentStatus,
  AssistancePoint,
  BikeBrand,
  Achievement,
  SocialPost,
  LeaderboardUser,
  LiveChallenge
} from '../types';
import { SAMPLE_ROUTE_COORDS } from '../utils/geo';

export const INITIAL_BIKE_COMPONENTS: BikeComponentStatus[] = [
  {
    id: 'corrente',
    name: 'Corrente Shimano HG-701 11v',
    category: 'transmissao',
    currentKm: 2180,
    maxRecommendedKm: 2500,
    lastServiceDate: '12/08/2026',
    status: 'atencao',
    tips: 'A corrente atingiu 87% da vida útil estimada. Verifique o alongamento com paquímetro (tolerância 0.75mm). Lubrifique a cada 120km com cera cerâmica.',
    partDetails: 'Shimano HG-701 com Quick-Link SIL-TEC para menor atrito',
    threeDPartKey: 'chain'
  },
  {
    id: 'pastilhas_freio',
    name: 'Pastilhas de Freio a Disco (Resina)',
    category: 'freios',
    currentKm: 1450,
    maxRecommendedKm: 3000,
    lastServiceDate: '04/07/2026',
    status: 'otimo',
    tips: 'Espessura estimada em 2.2mm. Acima do limite crítico de segurança (0.9mm). Sangria do fluído mineral em dia.',
    partDetails: 'Shimano L05A-RF Resina com aletas Ice-Technologies',
    threeDPartKey: 'brakes'
  },
  {
    id: 'pneu_traseiro',
    name: 'Pneu Traseiro 700x28c / 29x2.25',
    category: 'pneus',
    currentKm: 3820,
    maxRecommendedKm: 4000,
    lastServiceDate: '15/05/2026',
    status: 'critico',
    tips: 'Atenção: Banda de rodagem central desgastada. Indicador de TWI quase nivelado. Risco elevado de furos em pisos molhados.',
    partDetails: 'Continental Grand Prix 5000 / Maxxis Ikon Tubeless Ready',
    threeDPartKey: 'tires'
  },
  {
    id: 'calibragem',
    name: 'Pressão dos Pneus (Diant / Tras)',
    category: 'pneus',
    currentKm: 65,
    maxRecommendedKm: 150,
    lastServiceDate: 'Ontem',
    status: 'otimo',
    tips: 'Pressão recomendada para seu peso (72kg): 80 PSI Dianteiro / 85 PSI Traseiro (Estrada) ou 24 PSI Diant / 26 PSI Tras (MTB).',
    partDetails: 'Válvula Presta 60mm com selante tubeless recarregado',
    threeDPartKey: 'tires'
  },
  {
    id: 'suspensao',
    name: 'Suspensão Dianteira (Revisão 50h)',
    category: 'suspensao',
    currentKm: 890,
    maxRecommendedKm: 1200,
    lastServiceDate: '20/06/2026',
    status: 'otimo',
    tips: 'Retentores e raspadores limpos. Troca de óleo da câmara inferior prevista em 310km. SAG ajustado em 20%.',
    partDetails: 'Fox 32 Float SC Factory Kashima 100mm FIT4',
    threeDPartKey: 'fork'
  },
  {
    id: 'cambio_traseiro',
    name: 'Câmbio Traseiro e Roldanas',
    category: 'transmissao',
    currentKm: 3100,
    maxRecommendedKm: 6000,
    lastServiceDate: '01/08/2026',
    status: 'otimo',
    tips: 'Indexação calibrada e gancheira alinhada a laser. Roldanas limpas com rolamentos selados lubrificados.',
    partDetails: 'Shimano Deore XT / Ultegra Shadow RD+ com embreagem',
    threeDPartKey: 'derailleur'
  },
  {
    id: 'quadro_carbono',
    name: 'Quadro & Caixa de Direção',
    category: 'quadro',
    currentKm: 5400,
    maxRecommendedKm: 20000,
    lastServiceDate: '10/06/2026',
    status: 'otimo',
    tips: 'Sem trincas ou fissuras na fibra. Movimento central DUB/PressFit sem estalos. Torque dos parafusos verificado com torquímetro.',
    partDetails: 'Fibra de Carbono Toray T800 / Geometria Endurance Pro',
    threeDPartKey: 'frame'
  }
];

export const INITIAL_ASSISTANCE_POINTS: AssistancePoint[] = [
  {
    id: 'pt-1',
    name: 'Ciclo Oficina Especializada Shimano Service Center',
    type: 'oficina_especializada',
    address: 'Av. Paulista, 1842 - Bela Vista',
    city: 'São Paulo - SP',
    lat: -23.5587,
    lng: -46.6598,
    phone: '(11) 3288-4411',
    whatsapp: '5511998765432',
    rating: 4.9,
    reviewCount: 148,
    services: [
      'Revisão Geral Completa',
      'Sangria de Freios Hidráulicos',
      'Instalação de Tubeless',
      'Ajuste Eletrônico Di2 / AXS',
      'Bike Fit Dinâmico 3D'
    ],
    openNow: true,
    openingHours: '08:00 - 19:30',
    hasAirPump: true,
    hasWaterPoint: true,
    emergencyAvailable: true
  },
  {
    id: 'pt-2',
    name: 'Bike House Garage & Coffee',
    type: 'bike_shop',
    address: 'Rua Fradique Coutinho, 920 - Pinheiros',
    city: 'São Paulo - SP',
    lat: -23.5642,
    lng: -46.6912,
    phone: '(11) 3031-9988',
    whatsapp: '5511988112233',
    rating: 4.8,
    reviewCount: 96,
    services: [
      'Manutenção Expressa',
      'Troca de Corrente e Cassete',
      'Regulagem de Câmbio',
      'Boutique de Acessórios & Capacetes',
      'Café Especial e Ponto de Encontro de Grupos'
    ],
    openNow: true,
    openingHours: '07:30 - 20:00',
    hasAirPump: true,
    hasWaterPoint: true,
    emergencyAvailable: false
  },
  {
    id: 'pt-3',
    name: 'Ponto de Apoio 24h & Bomba Pública Ciclovia',
    type: 'ponto_apoio',
    address: 'Parque Ibirapuera - Portão 7 (Próximo à Ciclovia)',
    city: 'São Paulo - SP',
    lat: -23.5874,
    lng: -46.6576,
    phone: '(11) 3887-2525',
    whatsapp: '',
    rating: 4.7,
    reviewCount: 312,
    services: [
      'Bomba de Ar com Manômetro Gratuita (Presta e Schrader)',
      'Totem de Ferramentas Chaves Allen e Torx',
      'Bebedouro de Água Gelada',
      'Espátulas para Pneu'
    ],
    openNow: true,
    openingHours: '24 Horas',
    hasAirPump: true,
    hasWaterPoint: true,
    emergencyAvailable: true
  },
  {
    id: 'pt-4',
    name: 'Resgate & Mecânico Móvel Pedal SOS',
    type: 'socorro_movel',
    address: 'Atendimento Móvel em Toda Região Metropolitana',
    city: 'São Paulo e Região',
    lat: -23.5670,
    lng: -46.6500,
    phone: '(11) 97755-4433',
    whatsapp: '5511977554433',
    rating: 5.0,
    reviewCount: 82,
    services: [
      'Socorro no Meio do Pedal (Furo, Corrente Quebrada)',
      'Van com Oficina Completa a Bordo',
      'Reboque para Casa ou Oficina',
      'Venda de Câmaras, Selante e Peças Emergenciais'
    ],
    openNow: true,
    openingHours: 'Plantão das 06:00 às 22:00',
    hasAirPump: true,
    hasWaterPoint: true,
    emergencyAvailable: true
  }
];

export const BIKE_BRANDS: BikeBrand[] = [
  {
    id: 'shimano',
    name: 'Shimano',
    origin: 'Japão',
    founded: 1921,
    category: 'componentes',
    description: 'Líder global absoluta em transmissões, grupos de marcha mecânicos e eletrônicos Di2, freios hidráulicos Ice-Tech e pedais SPD.',
    popularModels: ['Dura-Ace Di2 R9200', 'Ultegra Di2', '105 12v', 'XTR M9100', 'Deore XT M8100', 'GRX Gravel'],
    website: 'https://bike.shimano.com',
    specialty: 'Transmissões de alta precisão, freios hidráulicos e tecnologia Di2 sem fio'
  },
  {
    id: 'sram',
    name: 'SRAM',
    origin: 'Estados Unidos',
    founded: 1987,
    category: 'componentes',
    description: 'Pioneira no ecossistema 1x (coroa única) e grupos eletrônicos 100% wireless AXS com comunicação sem fio criptografada.',
    popularModels: ['RED AXS', 'Force AXS', 'Rival eTap', 'XX SL Eagle Transmission', 'GX Eagle AXS'],
    website: 'https://www.sram.com',
    specialty: 'Transmissões sem fio AXS, montagem direta T-Type e integração total'
  },
  {
    id: 'specialized',
    name: 'Specialized Bicycle Components',
    origin: 'Estados Unidos (Morgan Hill, CA)',
    founded: 1974,
    category: 'bicicletas',
    description: 'Uma das marcas mais inovadoras do ciclismo mundial. Famosa pelos testes em túnel de vento próprio "Win Tunnel" e suspensão Brain/Future Shock.',
    popularModels: ['Tarmac SL8', 'Roubaix SL8', 'Epic World Cup', 'Stumpjumper 15', 'Diverge STR Gravel'],
    website: 'https://www.specialized.com',
    specialty: 'Quadros de carbono FACT, geometria Rider-First Engineered e aerodinâmica'
  },
  {
    id: 'trek',
    name: 'Trek Bicycles',
    origin: 'Estados Unidos (Waterloo, WI)',
    founded: 1976,
    category: 'bicicletas',
    description: 'Referência mundial em durabilidade, engenharia de carbono OCLV, sistema de desacoplamento IsoSpeed e proteção estrutural vitalícia.',
    popularModels: ['Madone SLR Gen 8', 'Émonda SLR', 'Domane SLR', 'Supercaliber SLR', 'Top Fuel', 'Checkpoint SLR'],
    website: 'https://www.trekbikes.com',
    specialty: 'Carbono OCLV, tecnologia IsoFlow aero e integração Bontrager'
  },
  {
    id: 'caloi',
    name: 'Caloi',
    origin: 'Brasil',
    founded: 1898,
    category: 'bicicletas',
    description: 'Maior e mais tradicional fabricante de bicicletas do Brasil, com fábrica em Manaus e linha de alta performance Caloi Racing Team (CRT).',
    popularModels: ['Caloi Elite Carbon Team', 'Caloi Explorer Pro SL', 'Caloi Strada Racing', 'Caloi Moab'],
    website: 'https://caloi.com',
    specialty: 'Modelos para terrenos brasileiros e equipe oficial de Copa do Mundo de MTB'
  },
  {
    id: 'cannondale',
    name: 'Cannondale',
    origin: 'Estados Unidos (Bethel, CT)',
    founded: 1971,
    category: 'bicicletas',
    description: 'Conhecida pela icônica suspensão monobraço Lefty Ocho, tubos de alumínio hidroformado CAAD e conforto SAVE.',
    popularModels: ['SuperSix EVO Hi-MOD', 'SystemSix Hi-MOD', 'Scalpel Hi-MOD', 'Topstone Carbon Lefty', 'CAAD13'],
    website: 'https://www.cannondale.com',
    specialty: 'Suspensão Lefty Ocho monobraço e alumínio superleve CAAD'
  },
  {
    id: 'scott',
    name: 'Scott Sports',
    origin: 'Suíça',
    founded: 1958,
    category: 'bicicletas',
    description: 'Potência suíça nas provas de XC e Estrada, dona de dezenas de títulos mundiais com Nino Schurter. Pioneira em amortecedores integrados.',
    popularModels: ['Spark RC World Cup', 'Addict RC Ultimate', 'Foil RC Pro', 'Scale RC World Cup'],
    website: 'https://www.scott-sports.com',
    specialty: 'Suspensão oculta integrada ao quadro (Internal Suspension) e controle TwinLoc'
  },
  {
    id: 'fox',
    name: 'Fox Racing Shox',
    origin: 'Estados Unidos',
    founded: 1974,
    category: 'suspensao',
    description: 'Padrão ouro em amortecimento para Mountain Bike, com acabamento Kashima Coat de ultra baixo atrito e cartuchos FIT4 e GRIP2.',
    popularModels: ['Fox 32 Step-Cast Factory', 'Fox 34 SC', 'Fox 36 Float Factory', 'Float SL Shock'],
    website: 'https://www.ridefox.com',
    specialty: 'Tratamento de câmara Kashima dourado e ajuste fino de compressão de alta/baixa'
  },
  {
    id: 'continental',
    name: 'Continental Tires',
    origin: 'Alemanha',
    founded: 1871,
    category: 'pneus',
    description: 'Fabricante alemã do composto BlackChili, famoso por oferecer aderência lendária em pista molhada sem comprometer a resistência ao rolamento.',
    popularModels: ['Grand Prix 5000 S TR', 'GatorSkin', 'Race King Protection', 'Cross King ProTection', 'Terra Speed Gravel'],
    website: 'https://www.continental-tires.com',
    specialty: 'Composto BlackChili e proteção anti-furo Vectran Breaker'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Primeiro Giro',
    description: 'Complete seu primeiro treino gravado com o CicloTrack Pro.',
    category: 'consistencia',
    icon: 'Bike',
    unlocked: true,
    progress: 100,
    unlockedDate: '10/08/2026',
    rewardPoints: 50
  },
  {
    id: 'ach-2',
    title: 'Clube dos 50k',
    description: 'Pedale 50 quilômetros ou mais em uma única atividade.',
    category: 'distancia',
    icon: 'Compass',
    unlocked: true,
    progress: 100,
    unlockedDate: '24/08/2026',
    rewardPoints: 150
  },
  {
    id: 'ach-3',
    title: 'Centurião (100 km)',
    description: 'Supere a mítica marca de 100 km em uma única pedalada.',
    category: 'distancia',
    icon: 'Award',
    unlocked: false,
    progress: 74,
    rewardPoints: 300
  },
  {
    id: 'ach-4',
    title: 'Rei da Montanha (KOM)',
    description: 'Acumule mais de 1.000 metros de ganho de elevação em um pedal.',
    category: 'altimetria',
    icon: 'Mountain',
    unlocked: true,
    progress: 100,
    unlockedDate: '02/09/2026',
    rewardPoints: 250
  },
  {
    id: 'ach-5',
    title: 'Velocidade Relâmpago (>50 km/h)',
    description: 'Atinja uma velocidade máxima superior a 50 km/h com segurança.',
    category: 'velocidade',
    icon: 'Zap',
    unlocked: true,
    progress: 100,
    unlockedDate: '28/08/2026',
    rewardPoints: 120
  },
  {
    id: 'ach-6',
    title: 'Cavaleiro Noturno',
    description: 'Conclua um treino noturno entre as 20h e as 05h da manhã.',
    category: 'consistencia',
    icon: 'Moon',
    unlocked: true,
    progress: 100,
    unlockedDate: '05/09/2026',
    rewardPoints: 80
  },
  {
    id: 'ach-7',
    title: 'Oficina Nota 10',
    description: 'Cadastre e acompanhe os componentes no módulo de cuidados da bike.',
    category: 'social',
    icon: 'Wrench',
    unlocked: true,
    progress: 100,
    unlockedDate: '12/08/2026',
    rewardPoints: 100
  },
  {
    id: 'ach-8',
    title: 'Desafiador em Tempo Real',
    description: 'Vença um duelo contra um amigo ou Ghost Rider em tempo real.',
    category: 'social',
    icon: 'Swords',
    unlocked: false,
    progress: 60,
    rewardPoints: 200
  }
];

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    authorName: 'Camila Rodriguez',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorTitle: 'Atleta Amadora | MTB & Gravel',
    date: '14 de Setembro de 2026',
    timeAgo: 'Há 2 horas',
    content: 'Manhã mágica na Trilha dos Eucaliptos! O nascer do sol entre as montanhas fez valer cada metro dos 840m de altimetria acumulada. A bike respondeu perfeitamente com a pressão a 24 PSI. Quem mais aproveitou o domingo cedo? 🚵‍♀️☀️',
    photoUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&auto=format&fit=crop&q=80',
    locationName: 'Serra da Cantareira - Trilha dos Eucaliptos',
    coords: { lat: -23.4182, lng: -46.6210 },
    rideSummary: {
      distance: 46.8,
      elevation: 842,
      avgSpeed: 21.4,
      time: '02h 11m'
    },
    likes: 42,
    isLiked: false,
    commentsCount: 6,
    comments: [
      {
        id: 'c1',
        author: 'Felipe Alencar',
        text: 'Visual espetacular Camila! Como estava o piso depois da chuva de sexta?',
        time: '1h atrás'
      },
      {
        id: 'c2',
        author: 'Camila Rodriguez',
        text: 'Alguns trechos com cascalho solto perto da curva 4, mas tubeless segurou demais!',
        time: '45min atrás'
      }
    ]
  },
  {
    id: 'post-2',
    authorName: 'Lucas Santoro',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorTitle: 'Estradeiro | Pelotão Zona Sul',
    date: '13 de Setembro de 2026',
    timeAgo: 'Ontem',
    content: 'Treino de tiro e ritmo sustentado na Rodovia dos Romeiros. Bati meu recorde pessoal no segmento da subida principal: velocidade média de 34.2 km/h no plano e FC mantida em Zona 4 por 35 minutos! 🚀⚡',
    photoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=900&auto=format&fit=crop&q=80',
    locationName: 'Estrada Parque dos Romeiros',
    coords: { lat: -23.4831, lng: -46.9124 },
    rideSummary: {
      distance: 72.4,
      elevation: 610,
      avgSpeed: 31.8,
      time: '02h 16m'
    },
    likes: 67,
    isLiked: true,
    commentsCount: 4,
    comments: [
      {
        id: 'c3',
        author: 'Juliana Paes',
        text: 'Média de 31.8 nessa rodovia é ritmo de prova! Parabéns monstro!',
        time: 'Ontem'
      }
    ]
  },
  {
    id: 'post-3',
    authorName: 'Thiago Neves',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authorTitle: 'Bikepacker & Aventureiro',
    date: '12 de Setembro de 2026',
    timeAgo: '2 dias atrás',
    content: 'Revisão na oficina credenciada antes da expedição de 300km no feriado. Troquei a corrente e calibrei as suspensões Fox. Bike limpa e lubrificada com cera cerâmica, pronta para a poeira e o asfalto!',
    photoUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&auto=format&fit=crop&q=80',
    locationName: 'Ciclo Oficina Especializada Shimano SC',
    coords: { lat: -23.5587, lng: -46.6598 },
    rideSummary: {
      distance: 18.2,
      elevation: 110,
      avgSpeed: 23.1,
      time: '47m'
    },
    likes: 38,
    isLiked: false,
    commentsCount: 2,
    comments: [
      {
        id: 'c4',
        author: 'Oficina Shimano SC',
        text: 'Obrigado pela confiança Thiago! Boa expedição, qualquer coisa acione o SOS móvel.',
        time: '2 dias atrás'
      }
    ]
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  {
    rank: 1,
    id: 'user-1',
    name: 'Gabriel Martins',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    distanceMonthKm: 1420.5,
    elevationMonthM: 14850,
    ridesCount: 26,
    points: 4890,
    badge: 'ouro',
    city: 'Curitiba - PR',
    category: 'Geral'
  },
  {
    rank: 2,
    id: 'user-2',
    name: 'Renata Vasconcelos',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    distanceMonthKm: 1284.0,
    elevationMonthM: 18200,
    ridesCount: 22,
    points: 4620,
    badge: 'prata',
    city: 'Belo Horizonte - MG',
    category: 'MTB'
  },
  {
    rank: 3,
    id: 'user-3',
    name: 'Lucas Santoro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    distanceMonthKm: 1195.2,
    elevationMonthM: 9400,
    ridesCount: 24,
    points: 4180,
    badge: 'bronze',
    city: 'São Paulo - SP',
    category: 'Estrada'
  },
  {
    rank: 4,
    id: 'user-4',
    name: 'Você (Ciclista)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    distanceMonthKm: 684.3,
    elevationMonthM: 6120,
    ridesCount: 16,
    points: 2750,
    badge: 'top10',
    city: 'São Paulo - SP',
    category: 'Geral'
  },
  {
    rank: 5,
    id: 'user-5',
    name: 'Beatriz Lima',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    distanceMonthKm: 640.8,
    elevationMonthM: 5890,
    ridesCount: 14,
    points: 2430,
    badge: 'top10',
    city: 'Florianópolis - SC',
    category: 'Gravel'
  },
  {
    rank: 6,
    id: 'user-6',
    name: 'Eduardo Silveira',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    distanceMonthKm: 592.1,
    elevationMonthM: 4200,
    ridesCount: 12,
    points: 2190,
    badge: 'pelotao',
    city: 'Porto Alegre - RS',
    category: 'Estrada'
  }
];

export const INITIAL_LIVE_CHALLENGES: LiveChallenge[] = [
  {
    id: 'chal-1',
    title: 'Desafio Subida da Serra (Segmento 5km)',
    opponentName: 'Lucas Santoro (Ghost Pessoal)',
    opponentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    opponentDistanceKm: 3.4,
    targetDistanceKm: 5.0,
    opponentPace: '26.8 km/h',
    myDistanceKm: 3.6,
    status: 'ativo',
    distanceDifferenceMeters: 200 // Ahead
  },
  {
    id: 'chal-2',
    title: 'Sprint da Marginal (3.0 km)',
    opponentName: 'Camila Rodriguez',
    opponentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    opponentDistanceKm: 2.1,
    targetDistanceKm: 3.0,
    opponentPace: '33.5 km/h',
    myDistanceKm: 1.9,
    status: 'ativo',
    distanceDifferenceMeters: -200 // Behind
  }
];

export const HISTORIC_RIDES: RideSession[] = [
  {
    id: 'ride-101',
    title: 'Volta Noturna da Paulista & Ibirapuera',
    date: '12/09/2026',
    startTime: Date.now() - 1000 * 60 * 60 * 48,
    duration: 5120, // ~1h 25m
    distance: 34.6,
    avgSpeed: 24.3,
    maxSpeed: 48.7,
    calories: 785,
    elevationGain: 340,
    avgHeartRate: 142,
    maxHeartRate: 174,
    avgCadence: 86,
    category: 'urbano',
    route: SAMPLE_ROUTE_COORDS.map((c, i) => ({
      lat: c.lat,
      lng: c.lng,
      altitude: c.altitude,
      speed: 20 + Math.sin(i) * 8,
      timestamp: Date.now() - 1000 * 60 * 60 * 48 + i * 300000,
      heartRate: 135 + Math.floor(Math.sin(i) * 25),
      cadence: 82 + Math.floor(Math.cos(i) * 10)
    })),
    weather: {
      temp: 21,
      condition: 'Noite Estrelada',
      windSpeed: 11
    },
    notes: 'Sensação ótima nas pernas, pouquíssimo trânsito. Testando luz de 1200 lúmens.'
  },
  {
    id: 'ride-102',
    title: 'Longão de Fim de Semana - Rota da Serra',
    date: '08/09/2026',
    startTime: Date.now() - 1000 * 60 * 60 * 144,
    duration: 8640, // 2h 24m
    distance: 61.2,
    avgSpeed: 25.5,
    maxSpeed: 56.2,
    calories: 1420,
    elevationGain: 910,
    avgHeartRate: 154,
    maxHeartRate: 182,
    avgCadence: 88,
    category: 'estrada',
    route: SAMPLE_ROUTE_COORDS.map((c, i) => ({
      lat: c.lat + 0.01 * i,
      lng: c.lng - 0.005 * i,
      altitude: c.altitude + i * 15,
      speed: 24 + Math.cos(i) * 10,
      timestamp: Date.now() - 1000 * 60 * 60 * 144 + i * 500000,
      heartRate: 148 + Math.floor(Math.sin(i) * 30),
      cadence: 85 + Math.floor(Math.sin(i) * 8)
    })),
    weather: {
      temp: 24,
      condition: 'Ensolarado',
      windSpeed: 9
    },
    notes: 'Subida dura no km 42, mas a descida compensou tudo! Zona 4 sustentada por 40min.'
  }
];

export const OFFLINE_REGIONS = [
  {
    id: 'reg-1',
    name: 'Região Metropolitana & Ciclovias Principais',
    sizeMb: 24.5,
    downloaded: true,
    lastUpdate: 'Hoje, 06:00',
    zoomLevels: '10 - 17',
    coverage: 'Raio de 45 km'
  },
  {
    id: 'reg-2',
    name: 'Serra da Cantareira & Circuitos de Trilha MTB',
    sizeMb: 48.2,
    downloaded: true,
    lastUpdate: 'Ontem',
    zoomLevels: '11 - 18',
    coverage: 'Topografia Curvas de Nível 10m'
  },
  {
    id: 'reg-3',
    name: 'Estrada Parque & Rota dos Romeiros',
    sizeMb: 36.8,
    downloaded: false,
    lastUpdate: 'Disponível para download',
    zoomLevels: '10 - 17',
    coverage: 'Extensão de 95 km'
  }
];
