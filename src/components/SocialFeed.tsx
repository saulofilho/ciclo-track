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
      {/* Top Nav Sub-Tabs - Variation 3 Space Mono Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#1a1a1a]/10 p-2 sm:p-2.5 rounded-full shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="subtab-feed"
            onClick={() => setActiveSubTab('feed')}
            className={`px-4 py-2 rounded-full text-xs font-mono-numbers uppercase font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'feed'
                ? 'bg-[#2c52a1] text-white shadow-xs'
                : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
            }`}
          >
            <Camera className="w-4 h-4" />
            Feed de Fotos
          </button>

          <button
            id="subtab-desafios"
            onClick={() => setActiveSubTab('desafios')}
            className={`px-4 py-2 rounded-full text-xs font-mono-numbers uppercase font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'desafios'
                ? 'bg-[#2c52a1] text-white shadow-xs'
                : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
            }`}
          >
            <Swords className="w-4 h-4" />
            Duelos ao Vivo
          </button>

          <button
            id="subtab-ranking"
            onClick={() => setActiveSubTab('ranking')}
            className={`px-4 py-2 rounded-full text-xs font-mono-numbers uppercase font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'ranking'
                ? 'bg-[#2c52a1] text-white shadow-xs'
                : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Ranking Mensal
          </button>

          <button
            id="subtab-conquistas"
            onClick={() => setActiveSubTab('conquistas')}
            className={`px-4 py-2 rounded-full text-xs font-mono-numbers uppercase font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'conquistas'
                ? 'bg-[#2c52a1] text-white shadow-xs'
                : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
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
            className="px-4 py-2 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers uppercase text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
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
              className="bg-white border border-[#1a1a1a]/10 rounded-3xl overflow-hidden shadow-xs"
            >
              {/* Post Header */}
              <div className="p-5 sm:p-6 flex items-center justify-between border-b border-[#1a1a1a]/10">
                <div className="flex items-center gap-3.5">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#2c52a1]/30"
                  />
                  <div>
                    <h4 className="font-serif-display text-lg font-bold text-[#1a1a1a]">{post.authorName}</h4>
                    <p className="text-xs text-[#1a1a1a]/60">{post.authorTitle}</p>
                    <span className="meta text-[10px] text-[#1a1a1a]/40">{post.timeAgo}</span>
                  </div>
                </div>

                {/* Geolocated Location Pill */}
                <div className="flex items-center gap-1.5 meta text-[11px] text-[#2c52a1] bg-[#f8f7f4] px-3.5 py-1.5 rounded-full border border-[#1a1a1a]/10 max-w-[220px] truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{post.locationName}</span>
                </div>
              </div>

              {/* Photo Backdrop with Overlay Stats */}
              {post.photoUrl && (
                <div className="relative aspect-video w-full bg-[#f8f7f4] overflow-hidden group">
                  <img
                    src={post.photoUrl}
                    alt="Foto do pedal"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {post.rideSummary && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#1a1a1a]/10 shadow-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="meta text-[9px] text-[#1a1a1a]/50 block">DISTÂNCIA</span>
                        <span className="font-mono-numbers font-bold text-[#1a1a1a] text-sm">
                          {post.rideSummary.distance} km
                        </span>
                      </div>
                      <div>
                        <span className="meta text-[9px] text-[#1a1a1a]/50 block">ELEVAÇÃO</span>
                        <span className="font-mono-numbers font-bold text-[#2c52a1] text-sm">
                          +{post.rideSummary.elevation} m
                        </span>
                      </div>
                      <div>
                        <span className="meta text-[9px] text-[#1a1a1a]/50 block">VEL. MÉDIA</span>
                        <span className="font-mono-numbers font-bold text-[#1a1a1a] text-sm">
                          {post.rideSummary.avgSpeed} km/h
                        </span>
                      </div>
                      <div>
                        <span className="meta text-[9px] text-[#1a1a1a]/50 block">DURAÇÃO</span>
                        <span className="font-mono-numbers font-bold text-[#1a1a1a] text-sm">
                          {post.rideSummary.time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Caption Content */}
              <div className="p-5 sm:p-6 space-y-4">
                <p className="text-[#1a1a1a]/85 text-xs sm:text-sm leading-relaxed">{post.content}</p>

                {/* Like and Comment buttons */}
                <div className="flex items-center gap-4 pt-3 border-t border-[#1a1a1a]/10">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-mono-numbers font-bold transition-colors cursor-pointer ${
                      post.isLiked ? 'text-rose-600' : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes} CURTIDAS</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-mono-numbers text-[#1a1a1a]/60">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentsCount} COMENTÁRIOS</span>
                  </div>
                </div>

                {/* Comments Thread */}
                {post.comments.length > 0 && (
                  <div className="space-y-2 pt-2 bg-[#f8f7f4] p-4 rounded-2xl border border-[#1a1a1a]/10">
                    {post.comments.map((comm) => (
                      <div key={comm.id} className="text-xs">
                        <span className="font-bold text-[#1a1a1a] mr-2">{comm.author}:</span>
                        <span className="text-[#1a1a1a]/80">{comm.text}</span>
                        <span className="meta text-[10px] text-[#1a1a1a]/40 ml-2">({comm.time})</span>
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
                    className="flex-1 px-4 py-2.5 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-xs text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:outline-none focus:border-[#2c52a1]"
                  />
                  <button
                    onClick={() => addComment(post.id)}
                    className="p-2.5 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white transition-colors cursor-pointer"
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
        <div className="space-y-6">
          <div className="bg-white border border-[#1a1a1a]/10 p-6 sm:p-8 rounded-3xl shadow-xs">
            <div className="flex items-center gap-2 meta text-[#2c52a1] font-bold mb-1">
              <Swords className="w-4 h-4" />
              DUELO SINCRONIZADO EM TEMPO REAL
            </div>
            <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Desafios com Amigos & Modo Ghost Rider
            </h3>
            <p className="text-xs sm:text-sm text-[#1a1a1a]/70 max-w-2xl mt-1.5">
              Selecione um segmento ou oponente para duelar. O CicloTrack Pro calcula em tempo real o diferencial de ritmo e posição relativa no mapa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {challenges.map((chal) => {
              const isSelected = activeChallengeId === chal.id;
              return (
                <div
                  key={chal.id}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
                    isSelected
                      ? 'bg-white border-[#2c52a1] ring-1 ring-[#2c52a1]'
                      : 'bg-white border-[#1a1a1a]/10 hover:border-[#2c52a1]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="meta text-[11px] font-bold text-[#2c52a1] bg-[#f8f7f4] px-3 py-1 rounded-full border border-[#1a1a1a]/10">
                        META: {chal.targetDistanceKm} KM
                      </span>
                      {isSelected && (
                        <span className="meta text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 animate-pulse">
                          DUELO ATIVO NO HUD
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a] mb-3">{chal.title}</h4>

                    {/* Opponent Card */}
                    <div className="flex items-center gap-3.5 bg-[#f8f7f4] p-4 rounded-2xl border border-[#1a1a1a]/10 mb-5">
                      <img
                        src={chal.opponentAvatar}
                        alt={chal.opponentName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border border-[#1a1a1a]/20"
                      />
                      <div>
                        <span className="font-bold text-sm text-[#1a1a1a] block">
                          {chal.opponentName}
                        </span>
                        <span className="meta text-[11px] text-[#1a1a1a]/60">
                          RITMO ALVO: <strong className="text-[#2c52a1] font-mono-numbers">{chal.opponentPace}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectChallenge(chal)}
                    className={`w-full py-3 rounded-full font-mono-numbers uppercase text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1a1a] text-white'
                        : 'bg-[#2c52a1] hover:bg-[#234285] text-white'
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
        <div className="space-y-6">
          <div className="bg-white border border-[#1a1a1a]/10 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 meta text-[#2c52a1] font-bold mb-1">
                <Trophy className="w-4 h-4" />
                TABELA GERAL DA TEMPORADA
              </div>
              <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Ranking Mensal Global - Setembro</h3>
              <p className="text-xs sm:text-sm text-[#1a1a1a]/70 mt-1">
                Pontuação auditada com base em distância, elevação e regularidade nos treinos gravados.
              </p>
            </div>
            <div className="text-right bg-[#f8f7f4] px-5 py-3 rounded-2xl border border-[#1a1a1a]/10">
              <span className="meta text-[10px] text-[#1a1a1a]/60 block mb-0.5">SUA POSIÇÃO</span>
              <span className="font-mono-numbers text-2xl font-bold text-[#2c52a1]">4º LUGAR</span>
            </div>
          </div>

          <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl overflow-hidden shadow-xs">
            <div className="divide-y divide-[#1a1a1a]/10">
              {leaderboard.map((user) => {
                const isMe = user.id === 'user-4';
                return (
                  <div
                    key={user.id}
                    className={`p-5 flex items-center justify-between gap-4 transition-colors ${
                      isMe ? 'bg-[#f8f7f4]' : 'hover:bg-[#f8f7f4]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Rank badge */}
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono-numbers font-bold text-xs ${
                          user.rank === 1
                            ? 'bg-amber-400 text-[#1a1a1a] shadow-xs'
                            : user.rank === 2
                            ? 'bg-slate-300 text-[#1a1a1a]'
                            : user.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-[#f8f7f4] text-[#1a1a1a]/60 border border-[#1a1a1a]/10'
                        }`}
                      >
                        {user.rank}
                      </span>

                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-[#1a1a1a]/15"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif-display font-bold text-base text-[#1a1a1a]">{user.name}</span>
                          {isMe && (
                            <span className="meta text-[9px] px-2 py-0.5 rounded-full bg-[#2c52a1] text-white font-bold">
                              VOCÊ
                            </span>
                          )}
                        </div>
                        <span className="meta text-[11px] text-[#1a1a1a]/60">
                          {user.city} • <strong className="text-[#1a1a1a]">{user.category}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-5 text-right">
                      <div className="hidden sm:block">
                        <span className="meta text-[9px] text-[#1a1a1a]/50 block">GANHO ELEV.</span>
                        <span className="font-mono-numbers text-xs font-bold text-[#2c52a1]">
                          +{user.elevationMonthM} m
                        </span>
                      </div>
                      <div>
                        <span className="meta text-[9px] text-[#1a1a1a]/50 block">DISTÂNCIA TOTAL</span>
                        <span className="font-mono-numbers text-base font-bold text-[#1a1a1a]">
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
        <div className="space-y-6">
          <div className="bg-white border border-[#1a1a1a]/10 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 meta text-[#2c52a1] font-bold mb-1">
                <Award className="w-4 h-4" />
                GAMIFICAÇÃO & DISTINÇÕES TÉCNICAS
              </div>
              <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                Sistema de Conquistas & Metas de Rendimento
              </h3>
              <p className="text-xs sm:text-sm text-[#1a1a1a]/70 mt-1">
                Desbloqueie condecorações superando metas de distância, altimetria acumulada e consistência mecânica.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-[#f8f7f4] px-5 py-3 rounded-2xl border border-[#1a1a1a]/10">
              <Sparkles className="w-5 h-5 text-[#2c52a1]" />
              <div>
                <span className="meta text-[10px] text-[#1a1a1a]/60 block">PONTUAÇÃO ACUMULADA</span>
                <span className="font-mono-numbers text-2xl font-bold text-[#2c52a1]">
                  {totalPoints} pts
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                onClick={() => {
                  if (ach.unlocked) {
                    confetti({ particleCount: 50, spread: 50 });
                  }
                }}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                  ach.unlocked
                    ? 'bg-white border-[#2c52a1] ring-1 ring-[#2c52a1]/20'
                    : 'bg-white border-[#1a1a1a]/10 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                        ach.unlocked
                          ? 'bg-[#2c52a1] text-white shadow-xs'
                          : 'bg-[#f8f7f4] text-[#1a1a1a]/40 border border-[#1a1a1a]/10'
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <span
                      className={`meta text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${
                        ach.unlocked
                          ? 'bg-blue-50 text-[#2c52a1] border-blue-200'
                          : 'bg-[#f8f7f4] text-[#1a1a1a]/50 border-[#1a1a1a]/10'
                      }`}
                    >
                      {ach.unlocked ? `+${ach.rewardPoints} PTS` : `${ach.progress}%`}
                    </span>
                  </div>

                  <h4 className="font-serif-display text-lg font-bold text-[#1a1a1a] mb-1">{ach.title}</h4>
                  <p className="text-xs text-[#1a1a1a]/70 leading-relaxed mb-4">
                    {ach.description}
                  </p>
                </div>

                {ach.unlocked ? (
                  <div className="flex items-center gap-1.5 meta text-[11px] text-[#2c52a1] pt-3 border-t border-[#1a1a1a]/10 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Conquistado em {ach.unlockedDate}</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-3 border-t border-[#1a1a1a]/10">
                    <div className="flex justify-between meta text-[10px] text-[#1a1a1a]/60">
                      <span>PROGRESSO</span>
                      <span className="font-mono-numbers">{ach.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#f8f7f4] rounded-full overflow-hidden border border-[#1a1a1a]/10">
                      <div
                        className="h-full bg-[#2c52a1] rounded-full"
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
        <div className="fixed inset-0 z-50 bg-[#1a1a1a]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]/10">
              <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#2c52a1]" />
                Nova Publicação no Feed Social
              </h4>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-[#1a1a1a]/40 hover:text-[#1a1a1a] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="meta text-[10px] text-[#1a1a1a]/60 block mb-1.5 font-bold">
                  LEGENDA / COMO FOI O PEDAL?
                </label>
                <textarea
                  rows={3}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Compartilhe como foi a altimetria, o clima, as condições do piso ou mande um recado para os amigos..."
                  required
                  className="w-full p-3.5 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10 text-xs text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:outline-none focus:border-[#2c52a1]"
                />
              </div>

              <div>
                <label className="meta text-[10px] text-[#1a1a1a]/60 block mb-1.5 font-bold">
                  LOCAL GEOLOCALIZADO
                </label>
                <input
                  type="text"
                  value={newPostLocation}
                  onChange={(e) => setNewPostLocation(e.target.value)}
                  className="w-full p-3 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#2c52a1]"
                />
              </div>

              <div>
                <label className="meta text-[10px] text-[#1a1a1a]/60 block mb-1.5 font-bold">
                  URL DA FOTOGRAFIA
                </label>
                <input
                  type="url"
                  value={newPostPhoto}
                  onChange={(e) => setNewPostPhoto(e.target.value)}
                  className="w-full p-3 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#2c52a1]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1a1a1a]/10">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-mono-numbers font-semibold text-[#1a1a1a]/60 hover:text-[#1a1a1a] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers uppercase font-bold text-xs shadow-xs cursor-pointer"
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
