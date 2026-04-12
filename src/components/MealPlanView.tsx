import { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import type { DayMealPlan, WeekMealPlan } from '../engine/types';
import { getMealPlanForWeek } from '../engine/meals';

const DAY_NAMES: { key: keyof WeekMealPlan['days']; label: string }[] = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const SEASON_LABELS: Record<string, string> = {
  autumn: 'Otoño 🍂',
  winter: 'Invierno ❄️',
  spring: 'Primavera 🌸',
  summer: 'Verano ☀️',
};

function MealCard({ dayPlan, dayLabel, isToday }: { dayPlan: DayMealPlan; dayLabel: string; isToday: boolean }) {
  return (
    <div className={`rounded-xl border p-5 transition-colors ${
      isToday ? 'border-brand-500/50 bg-brand-500/5' : 'border-slate-800 bg-slate-900/50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          {dayLabel}
          {isToday && <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">Hoy</span>}
        </h3>
        <span className="text-sm text-slate-500">{dayPlan.total_calories} kcal</span>
      </div>

      <div className="space-y-3">
        {dayPlan.meals.map((meal, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brand-400">{meal.time} — {meal.name}</span>
              <span className="text-xs text-slate-500">{meal.calories_est} kcal</span>
            </div>
            <p className="text-sm text-slate-400">{meal.description}</p>
            {meal.macros && (
              <div className="flex gap-3 text-xs text-slate-500">
                <span>P: {meal.macros.protein_g}g</span>
                <span>G: {meal.macros.fat_g}g</span>
                <span>C: {meal.macros.carbs_g}g</span>
                <span>F: {meal.macros.fiber_g}g</span>
              </div>
            )}
          </div>
        ))}

        {dayPlan.snack && (
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">{dayPlan.snack.time} — {dayPlan.snack.name}</span>
              <span className="text-xs text-slate-500">{dayPlan.snack.calories_est} kcal</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{dayPlan.snack.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MealPlanView() {
  const { weekNumber, targetCalories } = useAppData();
  const [selectedWeek, setSelectedWeek] = useState(weekNumber);
  const mealPlan = getMealPlanForWeek(selectedWeek);

  const todayDayIndex = new Date().getDay();
  const todayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][todayDayIndex];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Plan de comidas</h1>
          <p className="text-slate-400 mt-1">
            Dieta mediterránea-keto · IF 16:8 · ~{targetCalories} kcal/día objetivo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedWeek(w => Math.max(1, w - 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            ←
          </button>
          <span className="text-sm text-slate-300 min-w-[120px] text-center">
            Semana {selectedWeek}
            {selectedWeek === weekNumber && <span className="text-brand-400 ml-1">(actual)</span>}
          </span>
          <button
            onClick={() => setSelectedWeek(w => w + 1)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {mealPlan && (
        <>
          {/* Season badge */}
          <div className="flex items-center gap-4">
            <span className="text-sm bg-slate-800 px-3 py-1 rounded-full text-slate-300">
              {SEASON_LABELS[mealPlan.season]}
            </span>
            <span className="text-sm text-slate-500">
              Template semana {mealPlan.week_number}
            </span>
          </div>

          {/* Restrictions reminder */}
          <div className="rounded-lg border border-slate-800 bg-slate-800/30 p-4">
            <p className="text-sm text-slate-400">
              <span className="font-medium text-slate-300">Recordatorio: </span>
              Sin pan · Mínimo arroz · Fuerte en pescado y frutos secos · Sin azúcar agregada · Pimienta en vez de sal · Solo agua (y jugo exprimido 1-2x/sem) · Ventana de alimentación: 12:30 – 19:00
            </p>
          </div>

          {/* Day cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            {DAY_NAMES.map(({ key, label }) => (
              <MealCard
                key={key}
                dayPlan={mealPlan.days[key]}
                dayLabel={label}
                isToday={key === todayKey && selectedWeek === weekNumber}
              />
            ))}
          </div>

          {/* Weekly summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Resumen semanal</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(() => {
                const allDays = DAY_NAMES.map(d => mealPlan.days[d.key]);
                const totalCals = allDays.reduce((s, d) => s + d.total_calories, 0);
                const avgCals = Math.round(totalCals / 7);
                const totalProtein = allDays.reduce((s, d) =>
                  s + d.meals.reduce((ms, m) => ms + (m.macros?.protein_g ?? 0), 0) + (d.snack?.macros?.protein_g ?? 0), 0
                );
                const avgProtein = Math.round(totalProtein / 7);
                return (
                  <>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Cal. promedio/día</p>
                      <p className="text-xl font-bold text-white mt-1">{avgCals} <span className="text-sm font-normal text-slate-500">kcal</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Cal. totales semana</p>
                      <p className="text-xl font-bold text-white mt-1">{totalCals.toLocaleString()} <span className="text-sm font-normal text-slate-500">kcal</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Proteína prom/día</p>
                      <p className="text-xl font-bold text-white mt-1">{avgProtein} <span className="text-sm font-normal text-slate-500">g</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">vs Objetivo</p>
                      <p className={`text-xl font-bold mt-1 ${avgCals <= targetCalories ? 'text-success-400' : 'text-warning-400'}`}>
                        {avgCals <= targetCalories ? '✓ OK' : `+${avgCals - targetCalories}`}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
