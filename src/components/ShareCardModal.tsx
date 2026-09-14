import React, { useState } from 'react';
import { RideSession } from '../types';
import { formatDuration } from '../utils/geo';
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Mountain,
  Compass,
  Activity,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShareCardModalProps {
  ride: RideSession;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  ride,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [backdropStyle, setBackdropStyle] = useState<'mountain' | 'sunset' | 'stealth'>('mountain');

  const backdrops = {
    mountain: 'from-emerald-900 via-slate-900 to-indigo-950',
    sunset: 'from-orange-900 via-amber-950 to-slate-950',
    stealth: 'from-slate-900 via-slate-950 to-black'
  };

  const copyShareText = () => {
    const text = `🚴‍♂️ Concluí ${ride.distance}km com o CicloTrack Pro! ⚡ Média: ${ride.avgSpeed}km/h | ⛰️ +${ride.elevationGain}m | 🔥 ${ride.calories}kcal. Confira minha rota!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({ particleCount: 50, spread: 50 });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ride.title,
          text: `Pedalada no CicloTrack Pro: ${ride.distance} km a ${ride.avgSpeed} km/h`,
          url: window.location.href
        });
      } catch (e) {
        copyShareText();
      }
    } else {
      copyShareText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a1a]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]/10">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-[#2c52a1]" />
            <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a]">
              Card de Conquista Social
            </h4>
          </div>
          <button
            onClick={onClose}
            className="text-[#1a1a1a]/40 hover:text-[#1a1a1a] text-lg font-bold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Card (Instagram Story / Feed format) */}
        <div
          id="social-share-card-render"
          className={`bg-gradient-to-b ${backdrops[backdropStyle]} p-6 sm:p-7 rounded-3xl border border-white/15 shadow-xl relative overflow-hidden text-white flex flex-col justify-between min-h-[380px]`}
        >
          {/* Subtle Glows */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#2c52a1]/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />

          {/* Top Brand & Date */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span className="font-serif-display font-bold text-sm tracking-wider uppercase">
                CicloTrack Pro
              </span>
            </div>
            <span className="text-xs text-white/70 font-mono-numbers">{ride.date}</span>
          </div>

          {/* Center Title & Big Distance */}
          <div className="relative z-10 py-6 text-center">
            <span className="meta text-[10px] text-white/80 font-bold block mb-1">
              {ride.category === 'estrada'
                ? 'TREINO DE ESTRADA'
                : ride.category === 'mtb'
                ? 'MOUNTAIN BIKE'
                : 'PEDAL URBANO'}
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-white mb-3">{ride.title}</h3>

            <div className="flex items-baseline justify-center gap-2">
              <span className="font-mono-numbers text-6xl font-black tracking-tight text-white drop-shadow-md">
                {ride.distance}
              </span>
              <span className="font-mono-numbers text-xl font-bold text-white/90">KM</span>
            </div>
          </div>

          {/* Bottom 4 Key Stats */}
          <div className="relative z-10 grid grid-cols-4 gap-2 bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
            <div>
              <span className="meta text-[9px] text-white/60 block">TEMPO</span>
              <span className="font-mono-numbers text-xs font-bold">{formatDuration(ride.duration)}</span>
            </div>
            <div>
              <span className="meta text-[9px] text-white/60 block">MÉDIA</span>
              <span className="font-mono-numbers text-xs font-bold text-blue-200">
                {ride.avgSpeed} km/h
              </span>
            </div>
            <div>
              <span className="meta text-[9px] text-white/60 block">ELEVAÇÃO</span>
              <span className="font-mono-numbers text-xs font-bold text-indigo-200">
                +{ride.elevationGain}m
              </span>
            </div>
            <div>
              <span className="meta text-[9px] text-white/60 block">CALORIAS</span>
              <span className="font-mono-numbers text-xs font-bold text-amber-200">
                {ride.calories} kcal
              </span>
            </div>
          </div>
        </div>

        {/* Style selection */}
        <div className="flex items-center justify-between gap-2">
          <span className="meta text-[10px] text-[#1a1a1a]/60 font-bold">TEMA DO CARD:</span>
          <div className="flex items-center gap-1.5">
            {(['mountain', 'sunset', 'stealth'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setBackdropStyle(style)}
                className={`meta text-[10px] px-3 py-1 rounded-full uppercase border transition-all cursor-pointer ${
                  backdropStyle === style
                    ? 'bg-[#2c52a1] text-white font-bold border-[#2c52a1]'
                    : 'bg-[#f8f7f4] text-[#1a1a1a]/70 border-[#1a1a1a]/15 hover:border-[#2c52a1]'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="flex items-center gap-2.5 pt-3 border-t border-[#1a1a1a]/10">
          <button
            onClick={handleShareNative}
            className="flex-1 py-3 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers uppercase font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar no Story / WhatsApp
          </button>

          <button
            onClick={copyShareText}
            className="p-3 rounded-full bg-[#f8f7f4] hover:bg-[#eae8e3] text-[#1a1a1a] border border-[#1a1a1a]/10 transition-colors cursor-pointer"
            title="Copiar Texto"
          >
            {copied ? <Check className="w-4 h-4 text-[#2c52a1]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
