import { useAppData } from '../hooks/useAppData';
import type { Achievement, AchievementCategory } from '../engine/types';

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  weight: 'Peso',
  streak: 'Rachas',
  exercise: 'Ejercicio',
  special: 'Especiales',
};

const CATEGORY_ICONS: Record<AchievementCategory, string> = {
  weight: '⚖️',
  streak: '🔥',
  exercise: '💪',
  special: '⭐',
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div className={`rounded-xl border p-5 transition-all ${
      achievement.unlocked
        ? 'border-gold/30 bg-gold/5'
        : 'border-slate-800 bg-slate-900/30 opacity-50'
    }`}>
      <div className="flex items-start gap-3">
        <span className={`text-3xl ${achievement.unlocked ? '' : 'grayscale'}`}>
          {achievement.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-sm ${achievement.unlocked ? 'text-gold' : 'text-slate-500'}`}>
              {achievement.name}
            </h3>
            {achievement.unlocked && (
              <span className="text-xs bg-gold/20 text-gold px-1.5 py-0.5 rounded">✓</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{achievement.description}</p>
          {achievement.unlocked && achievement.unlocked_date && (
            <p className="text-xs text-slate-500 mt-1">
              Desbloqueado: {new Date(achievement.unlocked_date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Achievements() {
  const { achievements, unlockedCount, profile, currentWeight } = useAppData();

  const categories: AchievementCategory[] = ['weight', 'streak', 'exercise', 'special'];
  const byCategory = categories.map(cat => ({
    category: cat,
    items: achievements.filter(a => a.category === cat),
    unlocked: achievements.filter(a => a.category === cat && a.unlocked).length,
    total: achievements.filter(a => a.category === cat).length,
  }));

  const progressPercent = Math.round((unlockedCount / achievements.length) * 100);
  const totalLost = profile.start_weight_kg - currentWeight;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Logros</h1>
        <p className="text-slate-400 mt-1">Tu camino de transformación, paso a paso</p>
      </div>

      {/* Overall progress */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-400">Progreso general</p>
            <p className="text-3xl font-bold text-white mt-1">{unlockedCount} <span className="text-lg text-slate-500">/ {achievements.length}</span></p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-gold">{progressPercent}%</p>
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-gold/80 to-gold h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>{profile.start_weight_kg} kg</span>
          <span>-{totalLost.toFixed(1)} kg perdidos</span>
          <span>{profile.target_weight_kg} kg</span>
        </div>
      </div>

      {/* Categories */}
      {byCategory.map(({ category, items, unlocked, total }) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{CATEGORY_ICONS[category]}</span>
            <h2 className="text-xl font-semibold text-white">{CATEGORY_LABELS[category]}</h2>
            <span className="text-sm text-slate-500 ml-auto">{unlocked}/{total}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
