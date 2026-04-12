import { parseISO, differenceInDays } from 'date-fns';
import type { Achievement, WeightEntry, ExerciseEntry, Profile } from './types';

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlocked_date'>[] = [
  // Weight milestones
  { id: 'w-110', category: 'weight', name: 'Sub 110', description: 'Bajaste de 110 kg', icon: '⚖️', condition_value: 110 },
  { id: 'w-105', category: 'weight', name: 'Sub 105', description: 'Bajaste de 105 kg', icon: '⚖️', condition_value: 105 },
  { id: 'w-100', category: 'weight', name: 'Doble dígito', description: 'Bajaste de 100 kg', icon: '🎯', condition_value: 100 },
  { id: 'w-95', category: 'weight', name: 'Sub 95', description: 'Bajaste de 95 kg', icon: '⚖️', condition_value: 95 },
  { id: 'w-90', category: 'weight', name: 'Sub 90', description: 'Bajaste de 90 kg', icon: '🔥', condition_value: 90 },
  { id: 'w-85', category: 'weight', name: 'Sub 85', description: 'Bajaste de 85 kg', icon: '💪', condition_value: 85 },
  { id: 'w-80', category: 'weight', name: 'Objetivo alcanzado', description: 'Llegaste a 80 kg', icon: '🏆', condition_value: 80 },

  // Streaks (consecutive days with diet_adherence > 0 AND at least one exercise)
  { id: 's-3', category: 'streak', name: 'Triple combo', description: '3 días consecutivos en plan', icon: '🔗', condition_value: 3 },
  { id: 's-7', category: 'streak', name: 'Semana perfecta', description: '7 días consecutivos en plan', icon: '📅', condition_value: 7 },
  { id: 's-14', category: 'streak', name: 'Dos semanas fuerte', description: '14 días consecutivos en plan', icon: '💎', condition_value: 14 },
  { id: 's-30', category: 'streak', name: 'Mes inquebrantable', description: '30 días consecutivos en plan', icon: '🛡️', condition_value: 30 },
  { id: 's-60', category: 'streak', name: 'Dos meses de acero', description: '60 días consecutivos en plan', icon: '⚔️', condition_value: 60 },
  { id: 's-100', category: 'streak', name: 'Centurión', description: '100 días consecutivos en plan', icon: '👑', condition_value: 100 },

  // Exercise milestones (total hours)
  { id: 'e-first', category: 'exercise', name: 'Primer paso', description: 'Primera sesión de ejercicio registrada', icon: '👟', condition_value: 1 },
  { id: 'e-10h', category: 'exercise', name: '10 horas activo', description: '10 horas totales de ejercicio', icon: '🏃', condition_value: 10 },
  { id: 'e-50h', category: 'exercise', name: 'Máquina de movimiento', description: '50 horas totales de ejercicio', icon: '🚀', condition_value: 50 },
  { id: 'e-100h', category: 'exercise', name: 'Centenario fitness', description: '100 horas totales de ejercicio', icon: '🏅', condition_value: 100 },

  // Special milestones
  { id: 'sp-1kg', category: 'special', name: 'Primer kilo', description: 'Perdiste tu primer kilo', icon: '⭐', condition_value: 1 },
  { id: 'sp-5kg', category: 'special', name: '5 kg menos', description: 'Perdiste 5 kg desde el inicio', icon: '🌟', condition_value: 5 },
  { id: 'sp-10kg', category: 'special', name: 'Decena perdida', description: 'Perdiste 10 kg desde el inicio', icon: '✨', condition_value: 10 },
  { id: 'sp-20kg', category: 'special', name: 'Transformación', description: 'Perdiste 20 kg desde el inicio', icon: '🦋', condition_value: 20 },
  { id: 'sp-30kg', category: 'special', name: 'Nueva persona', description: 'Perdiste 30 kg desde el inicio', icon: '🎖️', condition_value: 30 },
  { id: 'sp-bmi30', category: 'special', name: 'Adiós obesidad', description: 'BMI bajo 30', icon: '🎉', condition_value: 30 },
  { id: 'sp-bmi25', category: 'special', name: 'Peso normal', description: 'BMI bajo 25', icon: '🏆', condition_value: 25 },
];

function calculateCurrentStreak(exerciseLog: ExerciseEntry[]): { streak: number; streakDates: string[] } {
  if (exerciseLog.length === 0) return { streak: 0, streakDates: [] };

  const sorted = [...exerciseLog].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime(),
  );

  const adherentDates = new Set(
    sorted
      .filter(e => e.activities.length > 0 && (e.diet_adherence === undefined || e.diet_adherence >= 50))
      .map(e => e.date),
  );

  if (adherentDates.size === 0) return { streak: 0, streakDates: [] };

  const allDates = Array.from(adherentDates).sort().reverse();
  const streakDates: string[] = [];

  let current = parseISO(allDates[0]);
  for (const dateStr of allDates) {
    const date = parseISO(dateStr);
    const diff = differenceInDays(current, date);

    if (diff <= 1) {
      streakDates.push(dateStr);
      current = date;
    } else {
      break;
    }
  }

  return { streak: streakDates.length, streakDates };
}

function calculateLongestStreak(exerciseLog: ExerciseEntry[]): number {
  if (exerciseLog.length === 0) return 0;

  const adherentDates = exerciseLog
    .filter(e => e.activities.length > 0 && (e.diet_adherence === undefined || e.diet_adherence >= 50))
    .map(e => e.date)
    .sort();

  if (adherentDates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < adherentDates.length; i++) {
    const diff = differenceInDays(parseISO(adherentDates[i]), parseISO(adherentDates[i - 1]));
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }

  return longest;
}

function getTotalExerciseHours(exerciseLog: ExerciseEntry[]): number {
  return exerciseLog.reduce(
    (total, entry) =>
      total + entry.activities.reduce((sum, act) => sum + act.duration_min, 0),
    0,
  ) / 60;
}

function getTotalExerciseSessions(exerciseLog: ExerciseEntry[]): number {
  return exerciseLog.filter(e => e.activities.length > 0).length;
}

export function evaluateAchievements(
  profile: Profile,
  weightLog: WeightEntry[],
  exerciseLog: ExerciseEntry[],
): Achievement[] {
  const heightM = profile.height_cm / 100;
  const sorted = [...weightLog].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
  );

  const currentWeight = sorted.length > 0 ? sorted[sorted.length - 1].weight_kg : profile.start_weight_kg;
  const minWeight = sorted.length > 0 ? Math.min(...sorted.map(e => e.weight_kg)) : profile.start_weight_kg;
  const totalLost = profile.start_weight_kg - minWeight;
  const currentBMI = currentWeight / (heightM * heightM);
  const longestStreak = calculateLongestStreak(exerciseLog);
  const totalHours = getTotalExerciseHours(exerciseLog);
  const totalSessions = getTotalExerciseSessions(exerciseLog);

  return ACHIEVEMENT_DEFINITIONS.map(def => {
    let unlocked = false;
    let unlocked_date: string | undefined;

    switch (def.category) {
      case 'weight':
        unlocked = minWeight <= def.condition_value;
        if (unlocked) {
          const entry = sorted.find(e => e.weight_kg <= def.condition_value);
          unlocked_date = entry?.date;
        }
        break;

      case 'streak':
        unlocked = longestStreak >= def.condition_value;
        break;

      case 'exercise':
        if (def.id === 'e-first') {
          unlocked = totalSessions >= 1;
          if (unlocked && exerciseLog.length > 0) {
            const firstExercise = [...exerciseLog]
              .filter(e => e.activities.length > 0)
              .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
            unlocked_date = firstExercise[0]?.date;
          }
        } else {
          unlocked = totalHours >= def.condition_value;
        }
        break;

      case 'special':
        if (def.id === 'sp-bmi30') {
          unlocked = currentBMI < 30;
        } else if (def.id === 'sp-bmi25') {
          unlocked = currentBMI < 25;
        } else {
          unlocked = totalLost >= def.condition_value;
          if (unlocked) {
            const target = profile.start_weight_kg - def.condition_value;
            const entry = sorted.find(e => e.weight_kg <= target);
            unlocked_date = entry?.date;
          }
        }
        break;
    }

    return { ...def, unlocked, unlocked_date };
  });
}

export function getNextAchievement(achievements: Achievement[]): Achievement | null {
  const locked = achievements.filter(a => !a.unlocked);
  if (locked.length === 0) return null;

  const priority: Record<string, number> = { weight: 1, special: 2, streak: 3, exercise: 4 };
  locked.sort((a, b) => (priority[a.category] ?? 5) - (priority[b.category] ?? 5));

  return locked[0];
}

export { calculateCurrentStreak, calculateLongestStreak, getTotalExerciseHours };
