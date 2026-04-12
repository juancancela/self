import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useAppData } from '../hooks/useAppData';
import { estimateCaloriesBurned } from '../engine/bmr';
import StatCard from './StatCard';

const TYPE_LABELS: Record<string, string> = {
  walking: 'Caminata',
  running: 'Correr',
  gym: 'Gimnasio',
  cycling: 'Ciclismo',
  swimming: 'Natación',
  other: 'Otro',
};

const INTENSITY_LABELS: Record<string, string> = {
  light: 'Ligera',
  standard: 'Estándar',
  intense: 'Intensa',
};

export default function ExerciseTracker() {
  const { exerciseLog, currentWeight, streak, totalExerciseHours } = useAppData();

  const stats = useMemo(() => {
    const totalSessions = exerciseLog.filter(e => e.activities.length > 0).length;
    const totalMinutes = exerciseLog.reduce(
      (sum, e) => sum + e.activities.reduce((s, a) => s + a.duration_min, 0), 0
    );
    const totalCalories = exerciseLog.reduce(
      (sum, e) => sum + e.activities.reduce((s, a) => s + estimateCaloriesBurned(a, currentWeight), 0), 0
    );
    const avgAdherence = exerciseLog.length > 0
      ? exerciseLog.reduce((sum, e) => sum + (e.diet_adherence ?? 0), 0) / exerciseLog.length
      : 0;

    return { totalSessions, totalMinutes, totalCalories, avgAdherence };
  }, [exerciseLog, currentWeight]);

  const chartData = useMemo(() => {
    return [...exerciseLog]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => {
        const minutes = entry.activities.reduce((s, a) => s + a.duration_min, 0);
        const calories = entry.activities.reduce((s, a) => s + estimateCaloriesBurned(a, currentWeight), 0);
        return {
          date: entry.date,
          minutes,
          calories,
          adherence: entry.diet_adherence ?? 0,
        };
      });
  }, [exerciseLog, currentWeight]);

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Ejercicio</h1>
        <p className="text-slate-400 mt-1">Registro de actividad física y calorías quemadas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Sesiones totales"
          value={stats.totalSessions}
          icon="📋"
          accent="brand"
        />
        <StatCard
          label="Horas totales"
          value={totalExerciseHours}
          unit="hrs"
          icon="⏱️"
          accent="success"
        />
        <StatCard
          label="Calorías quemadas"
          value={stats.totalCalories.toLocaleString()}
          unit="kcal"
          icon="🔥"
          accent="warning"
        />
        <StatCard
          label="Racha actual"
          value={streak}
          unit="días"
          icon="⚡"
          accent={streak >= 7 ? 'success' : 'brand'}
        />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Actividad diaria</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} width={45} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  labelFormatter={(label) => formatDate(String(label))}
                  formatter={(value, name) => {
                    const labels: Record<string, string> = { minutes: 'Minutos', calories: 'Calorías' };
                    const units: Record<string, string> = { minutes: ' min', calories: ' kcal' };
                    return [`${value}${units[String(name)] || ''}`, labels[String(name)] || String(name)];
                  }}
                />
                <Legend formatter={(v: string) => v === 'minutes' ? 'Minutos' : 'Calorías (kcal)'} />
                <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="calories" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Exercise log */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Historial de ejercicios</h2>
        </div>
        <div className="divide-y divide-slate-800/50">
          {[...exerciseLog].reverse().map(entry => {
            const totalMin = entry.activities.reduce((s, a) => s + a.duration_min, 0);
            const totalCals = entry.activities.reduce((s, a) => s + estimateCaloriesBurned(a, currentWeight), 0);
            return (
              <div key={entry.date} className="p-4 sm:p-6 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    {entry.diet_adherence !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.diet_adherence >= 80 ? 'bg-success-500/20 text-success-400' :
                        entry.diet_adherence >= 50 ? 'bg-warning-500/20 text-warning-400' :
                        'bg-danger-500/20 text-danger-400'
                      }`}>
                        Dieta: {entry.diet_adherence}%
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    {totalMin} min · {totalCals} kcal
                  </div>
                </div>
                <div className="space-y-2">
                  {entry.activities.map((act, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-lg">
                        {act.type === 'walking' ? '🚶' : act.type === 'running' ? '🏃' : act.type === 'gym' ? '🏋️' : act.type === 'cycling' ? '🚴' : act.type === 'swimming' ? '🏊' : '⚡'}
                      </span>
                      <span className="text-slate-300">{TYPE_LABELS[act.type] || act.type}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{act.duration_min} min</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{INTENSITY_LABELS[act.intensity]}</span>
                      {act.location && (
                        <>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-500">{act.location}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
