import { Link } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import StatCard from './StatCard';

const MODE_LABELS = {
  moderado: 'Moderado',
  decidido: 'Decidido',
  intensivo: 'Intensivo',
};

export default function Dashboard() {
  const data = useAppData();
  const {
    profile, plan, currentWeight, currentBMI, currentBMR, targetCalories,
    daysOnPlan, totalLost, weeklyRate, streak, estimatedDate,
    todaysMeals, todayForecast, yesterdayWeight,
    nextAchievement, unlockedCount, achievements, totalExerciseHours,
  } = data;

  const dailyDiff = yesterdayWeight ? currentWeight - yesterdayWeight.weight_kg : null;
  const forecastDiff = todayForecast ? currentWeight - todayForecast.expected_kg : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Día {Math.max(daysOnPlan, 1)} · Modo {MODE_LABELS[plan.mode]} · IF 16:8
        </p>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Peso actual"
          value={currentWeight}
          unit="kg"
          icon="⚖️"
          trend={dailyDiff !== null ? (dailyDiff < 0 ? 'down' : dailyDiff > 0 ? 'up' : 'neutral') : undefined}
          subtitle={dailyDiff !== null ? `${dailyDiff > 0 ? '+' : ''}${dailyDiff.toFixed(1)} kg vs ayer` : 'Sin dato previo'}
          accent="brand"
        />
        <StatCard
          label="Perdido total"
          value={totalLost > 0 ? totalLost.toFixed(1) : '0'}
          unit="kg"
          icon="📉"
          subtitle={`De ${profile.start_weight_kg} a ${currentWeight} kg`}
          accent="success"
        />
        <StatCard
          label="Racha actual"
          value={streak}
          unit="días"
          icon="🔥"
          subtitle={streak >= 7 ? '¡Gran racha!' : streak >= 3 ? '¡Seguí así!' : 'A construir hábito'}
          accent={streak >= 7 ? 'success' : streak >= 3 ? 'warning' : 'brand'}
        />
        <StatCard
          label="BMI"
          value={currentBMI}
          icon="📊"
          subtitle={currentBMI >= 30 ? 'Obesidad' : currentBMI >= 25 ? 'Sobrepeso' : 'Normal'}
          accent={currentBMI >= 30 ? 'danger' : currentBMI >= 25 ? 'warning' : 'success'}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Objetivo"
          value={profile.target_weight_kg}
          unit="kg"
          icon="🎯"
          subtitle={`Faltan ${(currentWeight - profile.target_weight_kg).toFixed(1)} kg`}
          accent="brand"
        />
        <StatCard
          label="Ritmo semanal"
          value={weeklyRate !== null ? weeklyRate.toFixed(2) : '—'}
          unit="kg/sem"
          icon="📈"
          subtitle={weeklyRate !== null && weeklyRate > 0 ? 'Bajando' : 'Sin datos suficientes'}
          accent="success"
        />
        <StatCard
          label="Calorías objetivo"
          value={targetCalories}
          unit="kcal"
          icon="🔋"
          subtitle={`BMR: ${currentBMR} kcal`}
          accent="warning"
        />
        <StatCard
          label="Horas ejercicio"
          value={totalExerciseHours}
          unit="hrs"
          icon="💪"
          subtitle={`${data.exerciseLog.length} sesiones registradas`}
          accent="brand"
        />
      </div>

      {/* Today section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's meals */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🥗</span> Comidas de hoy
            </h2>
            <Link to="/comidas" className="text-sm text-brand-400 hover:text-brand-300">
              Ver plan completo →
            </Link>
          </div>
          {todaysMeals ? (
            <div className="space-y-3">
              {todaysMeals.meals.map((meal, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                  <span className="text-xs text-slate-500 font-mono mt-0.5 w-12 shrink-0">{meal.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{meal.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{meal.description}</p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{meal.calories_est} kcal</span>
                </div>
              ))}
              {todaysMeals.snack && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-dashed border-slate-700">
                  <span className="text-xs text-slate-500 font-mono mt-0.5 w-12 shrink-0">{todaysMeals.snack.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-300 text-sm">{todaysMeals.snack.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{todaysMeals.snack.description}</p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{todaysMeals.snack.calories_est} kcal</span>
                </div>
              )}
              <div className="text-right text-sm text-slate-400 pt-2 border-t border-slate-800">
                Total estimado: <span className="font-semibold text-white">{todaysMeals.total_calories} kcal</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No hay plan de comidas para hoy.</p>
          )}
        </div>

        {/* Forecast & next achievement */}
        <div className="space-y-6">
          {/* Forecast snapshot */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>🔮</span> Forecast
              </h2>
              <Link to="/peso" className="text-sm text-brand-400 hover:text-brand-300">
                Ver gráfico →
              </Link>
            </div>
            <div className="space-y-3">
              {todayForecast && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Peso esperado hoy</span>
                  <span className="font-semibold text-white">{todayForecast.expected_kg} kg</span>
                </div>
              )}
              {forecastDiff !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Diferencia vs forecast</span>
                  <span className={`font-semibold ${forecastDiff <= 0 ? 'text-success-400' : forecastDiff <= 1 ? 'text-warning-400' : 'text-danger-400'}`}>
                    {forecastDiff > 0 ? '+' : ''}{forecastDiff.toFixed(1)} kg
                  </span>
                </div>
              )}
              {estimatedDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Fecha estimada objetivo</span>
                  <span className="font-semibold text-brand-400">
                    {new Date(estimatedDate).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Next achievement */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>🏆</span> Logros
              </h2>
              <Link to="/logros" className="text-sm text-brand-400 hover:text-brand-300">
                Ver todos →
              </Link>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
              <span>{unlockedCount} de {achievements.length} desbloqueados</span>
              <span className="font-semibold text-brand-400">
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all"
                style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              />
            </div>
            {nextAchievement && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-dashed border-slate-700">
                <span className="text-2xl opacity-40">{nextAchievement.icon}</span>
                <div>
                  <p className="font-medium text-slate-300 text-sm">{nextAchievement.name}</p>
                  <p className="text-xs text-slate-500">{nextAchievement.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
