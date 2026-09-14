import React, { useState } from 'react';
import {
  SocialPost,
  LeaderboardUser,
  LiveChallenge,
  Achievement
} from '../types';
import {
  Heart,
  MessageSquare,
  Share2,
  MapPin,
  Trophy,
  Swords,
  Award,
  Medal,
  Users,
  PlusCircle,
  Sparkles,
  Send,
  Compass,
  CheckCircle2,
  Calendar,
  Camera,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SocialFeedProps {
  posts: SocialPost[];
  onAddPost: (post: SocialPost) => void;
  leaderboard: LeaderboardUser[];
  challenges: LiveChallenge[];
  onSelectChallenge: (chal: LiveChallenge) => void;
  achievements: Achievement[];
  activeChallengeId?: string;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  posts,
  onAddPost,
  leaderboard,
  challenges,
  onSelectChallenge,
  achievements,
  activeChallengeId
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'feed' | 'desafios' | 'ranking' | 'conquistas'
  >('feed');

  // Create post modal / form state
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostLocation, setNewPostLocation] = useState('Parque Estadual da Cantareira');
  const [newPostPhoto, setNewPostPhoto] = useState('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&auto=format&fit=crop&q=80');

  // Like toggle in local state
  const [localPosts, setLocalPosts] = useState<SocialPost[]>(posts);
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  const toggleLike = (postId: string) => {
    setLocalPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1
          };
        }
        return p;
      })
    );
  };

  const addComment = (postId: string) => {
    const text = commentInput[postId];
    if (!text?.trim()) return;

    setLocalPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [
              ...p.comments,
              {
                id: `comm-${Date.now()}`,
                author: 'Você (Ciclista)',
                text: text.trim(),
                time: 'Agora'
              }
            ]
          };
        }
        return p;
      })
    );

    setCommentInput((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      authorName: 'Você (Ciclista)',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      authorTitle: 'Ciclista Amador | Speed & Gravel',
      date: 'Hoje',
      timeAgo: 'Agora mesmo',
      content: newPostContent.trim(),
      photoUrl: newPostPhoto,
      locationName: newPostLocation,
      coords: { lat: -23.5587, lng: -46.6598 },
      rideSummary: {
        distance: 38.4,
        elevation: 490,
        avgSpeed: 26.2,
        time: '01h 28m'
      },
      likes: 1,
      isLiked: true,
      commentsCount: 0,
      comments: []
    };

    setLocalPosts([newPost, ...localPosts]);
    onAddPost(newPost);
    setNewPostContent('');
    setShowNewPostModal(false);

    confetti({
      particleCount: 80,
      spread: 60
    });
  };

  // Badges count
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements.filter((a) => a.unlocked).reduce((acc, a) => acc + a.rewardPoints, 0);

  return (
    <div id="social-community-section" className="space-y-6">
      {/* Top Nav Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-lg">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            id="subtab-feed"
            onClick={() => setActiveSubTab('feed')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'feed'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            Feed com Fotos Geo
          </button>

          <button
            id="subtab-desafios"
            onClick={() => setActiveSubTab('desafios')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'desafios'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-4 h-4" />
            Desafios em Tempo Real
          </button>

          <button
            id="subtab-ranking"
            onClick={() => setActiveSubTab('ranking')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'ranking'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Ranking Mensal
          </button>

          <button
            id="subtab-conquistas"
            onClick={() => setActiveSubTab('conquistas')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'conquistas'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            Conquistas ({unlockedCount}/{achievements.length})
          </button>
        </div>

        {activeSubTab === 'feed' && (
          <button
            id="btn-new-social-post"
            onClick={() => setShowNewPostModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Publicar Pedal
          </button>
        )}
      </div>

      {/* TAB 1: SOCIAL FEED */}
      {activeSubTab === 'feed' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {localPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Post Header */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/40"
                  />
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{post.authorName}</h4>
                    <p className="text-[11px] text-slate-400">{post.authorTitle}</p>
                    <span className="text-[10px] text-slate-500">{post.timeAgo}</span>
                  </div>
                </div>

                {/* Geolocated Location Pill */}
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/60 max-w-[200px] truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{post.locationName}</span>
                </div>
              </div>

              {/* Photo Backdrop with Overlay Stats */}
              {post.photoUrl && (
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden group">
                  <img
                    src={post.photoUrl}
                    alt="Foto do pedal"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {post.rideSummary && (
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md rounded-xl p-3 border border-slate-800/80 shadow-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Distância</span>
                        <span className="font-mono font-bold text-slate-100 text-sm">
                          {post.rideSummary.distance} km
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Elevação</span>
                        <span className="font-mono font-bold text-indigo-400 text-sm">
                          +{post.rideSummary.elevation} m
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Vel. Média</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {post.rideSummary.avgSpeed} km/h
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Duração</span>
                        <span className="font-mono font-bold text-slate-100 text-sm">
                          {post.rideSummary.time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Caption Content */}
              <div className="p-4 sm:p-5 space-y-4">
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">{post.content}</p>

                {/* Like and Comment buttons */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                      post.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentsCount} comentários</span>
                  </div>
                </div>

                {/* Comments Thread */}
                {post.comments.length > 0 && (
                  <div className="space-y-2 pt-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    {post.comments.map((comm) => (
                      <div key={comm.id} className="text-xs">
                        <span className="font-bold text-slate-200 mr-2">{comm.author}:</span>
                        <span className="text-slate-300">{comm.text}</span>
                        <span className="text-[10px] text-slate-500 ml-2">({comm.time})</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Adicionar um comentário ou incentivo..."
                    value={commentInput[post.id] || ''}
                    onChange={(e) =>
                      setCommentInput({ ...commentInput, [post.id]: e.target.value })
                    }
                    onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => addComment(post.id)}
                    className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIVE CHALLENGES & GHOST RIDER */}
      {activeSubTab === 'desafios' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase mb-1">
              <Swords className="w-4 h-4" />
              Duelo em Tempo Real
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              Desafios com Amigos & Modo Ghost Rider
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Escolha um segmento ou oponente para duelar. O CicloTrack Pro exibe ao vivo se você está na frente ou atrás com base no ritmo e distância percorrida no mapa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((chal) => {
              const isSelected = activeChallengeId === chal.id;
              return (
                <div
                  key={chal.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-xl ring-1 ring-indigo-500/50'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        Meta: {chal.targetDistanceKm} km
                      </span>
                      {isSelected && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 animate-pulse">
                          Duelo Ativo no Painel
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-100 text-base mb-2">{chal.title}</h4>

                    {/* Opponent Card */}
                    <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-4">
                      <img
                        src={chal.opponentAvatar}
                        alt={chal.opponentName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">
                          {chal.opponentName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Ritmo Alvo: <strong className="text-indigo-300">{chal.opponentPace}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectChallenge(chal)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    <Swords className="w-4 h-4" />
                    {isSelected ? 'Duelo em Andamento (No HUD)' : 'Desafiar Este Piloto'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MONTHLY GLOBAL RANKING */}
      {activeSubTab === 'ranking' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase mb-1">
                <Trophy className="w-4 h-4" />
                Classificação da Temporada
              </div>
              <h3 className="text-xl font-bold text-slate-100">Ranking Mensal Global - Setembro</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pontuação calculada com base em distância, elevação e regularidade de treinos.
              </p>
            </div>
            <div className="text-right bg-slate-950/70 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Sua Posição</span>
              <span className="font-mono text-xl font-bold text-emerald-400">4º Lugar</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800">
              {leaderboard.map((user) => {
                const isMe = user.id === 'user-4';
                return (
                  <div
                    key={user.id}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      isMe ? 'bg-emerald-950/20' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          user.rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                            : user.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : user.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {user.rank}
                      </span>

                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{user.name}</span>
                          {isMe && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-bold">
                              VOCÊ
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {user.city} • <strong className="text-slate-300">{user.category}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block">
                        <span className="text-[10px] text-slate-400 block">Ganho Elev.</span>
                        <span className="font-mono text-xs font-bold text-indigo-300">
                          +{user.elevationMonthM} m
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Distância Total</span>
                        <span className="font-mono text-sm font-black text-emerald-400">
                          {user.distanceMonthKm} km
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACHIEVEMENTS & BADGES */}
      {activeSubTab === 'conquistas' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase mb-1">
                <Award className="w-4 h-4" />
                Gamificação & Medalhas
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                Sistema de Conquistas & Metas de Pedal
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Desbloqueie troféus superando metas de distância, altimetria, velocidade e manutenção.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-800">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-[11px] text-slate-400 block">Pontos Acumulados</span>
                <span className="font-mono text-xl font-black text-amber-400">
                  {totalPoints} pts
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                onClick={() => {
                  if (ach.unlocked) {
                    confetti({ particleCount: 50, spread: 50 });
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  ach.unlocked
                    ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        ach.unlocked
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        ach.unlocked
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {ach.unlocked ? `+${ach.rewardPoints} pts` : `${ach.progress}%`}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-sm mb-1">{ach.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {ach.description}
                  </p>
                </div>

                {ach.unlocked ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-2 border-t border-slate-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Conquistado em {ach.unlockedDate}</span>
                  </div>
                ) : (
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Progresso</span>
                      <span>{ach.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-600 rounded-full"
                        style={{ width: `${ach.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW POST MODAL */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Nova Publicação no Feed Social
              </h4>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Legenda / Como foi o pedal?
                </label>
                <textarea
                  rows={3}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Compartilhe como foi a altimetria, o clima, as condições do piso ou mande um recado para os amigos..."
                  required
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Local Geolocalizado</label>
                <input
                  type="text"
                  value={newPostLocation}
                  onChange={(e) => setNewPostLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">URL da Foto</label>
                <input
                  type="url"
                  value={newPostPhoto}
                  onChange={(e) => setNewPostPhoto(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Publicar Agora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
