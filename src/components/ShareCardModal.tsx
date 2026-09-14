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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-slate-100 text-base">
              Card de Conquista Social
            </h4>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Card (Instagram Story / Feed format) */}
        <div
          id="social-share-card-render"
          className={`bg-gradient-to-b ${backdrops[backdropStyle]} p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between min-h-[380px]`}
        >
          {/* Subtle Glows */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />

          {/* Top Brand & Date */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="font-extrabold text-sm tracking-wider uppercase">
                CicloTrack Pro
              </span>
            </div>
            <span className="text-xs text-slate-300 font-mono">{ride.date}</span>
          </div>

          {/* Center Title & Big Distance */}
          <div className="relative z-10 py-6 text-center">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-1">
              {ride.category === 'estrada'
                ? 'Treino de Estrada'
                : ride.category === 'mtb'
                ? 'Mountain Bike'
                : 'Pedal Urbano'}
            </span>
            <h3 className="text-xl font-black text-white mb-3">{ride.title}</h3>

            <div className="flex items-baseline justify-center gap-2">
              <span className="font-mono text-6xl font-black tracking-tight text-white drop-shadow-md">
                {ride.distance}
              </span>
              <span className="text-xl font-bold text-emerald-300">KM</span>
            </div>
          </div>

          {/* Bottom 4 Key Stats */}
          <div className="relative z-10 grid grid-cols-4 gap-2 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">Tempo</span>
              <span className="font-mono text-xs font-bold">{formatDuration(ride.duration)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Vel. Média</span>
              <span className="font-mono text-xs font-bold text-emerald-300">
                {ride.avgSpeed} km/h
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Elevação</span>
              <span className="font-mono text-xs font-bold text-indigo-300">
                +{ride.elevationGain}m
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Calorias</span>
              <span className="font-mono text-xs font-bold text-amber-300">
                {ride.calories} kcal
              </span>
            </div>
          </div>
        </div>

        {/* Style selection */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400 font-medium">Tema do Card:</span>
          <div className="flex items-center gap-2">
            {(['mountain', 'sunset', 'stealth'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setBackdropStyle(style)}
                className={`text-xs px-2.5 py-1 rounded-lg capitalize border transition-all ${
                  backdropStyle === style
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={handleShareNative}
            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar no Story / WhatsApp
          </button>

          <button
            onClick={copyShareText}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Copiar Texto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
