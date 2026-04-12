import type { Profile, PlanMode, ExerciseActivity } from './types';

/**
 * Mifflin-St Jeor equation — the most accurate for overweight individuals.
 * Returns kcal/day at complete rest.
 */
export function calculateBMR(weight_kg: number, height_cm: number, age: number, gender: 'male' | 'female'): number {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS;

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel = 'light'): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

const DEFICIT_BY_MODE: Record<PlanMode, number> = {
  moderado: 500,
  decidido: 750,
  intensivo: 1000,
};

export function getDailyDeficit(mode: PlanMode): number {
  return DEFICIT_BY_MODE[mode];
}

export function getTargetCalories(tdee: number, mode: PlanMode): number {
  return Math.round(tdee - DEFICIT_BY_MODE[mode]);
}

const CALORIES_PER_KG_FAT = 7700;

export function weightLossPerDay(deficit: number): number {
  return deficit / CALORIES_PER_KG_FAT;
}

const EXERCISE_CALORIES: Record<ExerciseActivity['type'], Record<ExerciseActivity['intensity'], number>> = {
  walking:  { light: 3.5, standard: 5.0, intense: 6.5 },
  running:  { light: 8.0, standard: 10.0, intense: 12.0 },
  gym:      { light: 4.0, standard: 6.0, intense: 8.0 },
  cycling:  { light: 5.0, standard: 7.0, intense: 10.0 },
  swimming: { light: 6.0, standard: 8.0, intense: 11.0 },
  other:    { light: 3.0, standard: 5.0, intense: 7.0 },
};

/**
 * Estimate calories burned for a single activity.
 * Uses rough MET-based kcal/min values scaled by body weight.
 * Weight factor: heavier people burn more per minute.
 */
export function estimateCaloriesBurned(activity: ExerciseActivity, weight_kg: number): number {
  const baseRate = EXERCISE_CALORIES[activity.type]?.[activity.intensity] ?? 5.0;
  const weightFactor = weight_kg / 80;
  return Math.round(baseRate * activity.duration_min * weightFactor);
}

export function computeMetrics(profile: Profile) {
  const bmi = profile.start_weight_kg / Math.pow(profile.height_cm / 100, 2);
  const bmr = calculateBMR(profile.start_weight_kg, profile.height_cm, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, 'light');

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}
