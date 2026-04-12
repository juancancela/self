import { addDays, differenceInDays, parseISO, format, isBefore, isEqual } from 'date-fns';
import type { AppConfig, WeightEntry, ExerciseEntry, ForecastPoint } from './types';
import { getDailyDeficit, estimateCaloriesBurned } from './bmr';

const CALORIES_PER_KG_FAT = 7700;
const TOLERANCE_BAND_KG = 1.0;

export function generateForecast(
  config: AppConfig,
  weightLog: WeightEntry[],
  exerciseLog: ExerciseEntry[],
): ForecastPoint[] {
  const { profile, plan, forecast_end_date } = config;
  const endDate = parseISO(forecast_end_date);
  const baseDeficit = getDailyDeficit(plan.mode);

  const sortedWeightLog = [...weightLog].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
  );

  const exerciseByDate = new Map<string, ExerciseEntry>();
  for (const entry of exerciseLog) {
    exerciseByDate.set(entry.date, entry);
  }

  const weightByDate = new Map<string, number>();
  for (const entry of sortedWeightLog) {
    weightByDate.set(entry.date, entry.weight_kg);
  }

  const lastRealEntry = sortedWeightLog[sortedWeightLog.length - 1];
  const anchorDate = lastRealEntry ? parseISO(lastRealEntry.date) : parseISO(profile.start_date);

  const forecast: ForecastPoint[] = [];
  const startDate = parseISO(profile.start_date);
  const totalDays = differenceInDays(endDate, startDate);

  let projectedWeight = profile.start_weight_kg;

  for (let day = 0; day <= totalDays; day++) {
    const currentDate = addDays(startDate, day);
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    if (isBefore(currentDate, anchorDate) || isEqual(currentDate, anchorDate)) {
      const realWeight = weightByDate.get(dateStr);
      if (realWeight !== undefined) {
        projectedWeight = realWeight;
      }
    } else {
      let totalDeficit = baseDeficit;

      const exercise = exerciseByDate.get(dateStr);
      if (exercise) {
        const exerciseCals = exercise.activities.reduce(
          (sum, act) => sum + estimateCaloriesBurned(act, projectedWeight),
          0,
        );
        totalDeficit += exerciseCals;
      }

      const dailyLoss = totalDeficit / CALORIES_PER_KG_FAT;
      projectedWeight = Math.max(projectedWeight - dailyLoss, profile.target_weight_kg);
    }

    forecast.push({
      date: dateStr,
      expected_kg: Math.round(projectedWeight * 100) / 100,
      upper_band_kg: Math.round((projectedWeight + TOLERANCE_BAND_KG) * 100) / 100,
      lower_band_kg: Math.round((projectedWeight - TOLERANCE_BAND_KG) * 100) / 100,
    });
  }

  return forecast;
}

export function getMovingAverage(weightLog: WeightEntry[], windowDays: number = 7): { date: string; avg_kg: number }[] {
  const sorted = [...weightLog].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
  );

  return sorted.map((entry, index) => {
    const windowStart = Math.max(0, index - windowDays + 1);
    const window = sorted.slice(windowStart, index + 1);
    const avg = window.reduce((sum, e) => sum + e.weight_kg, 0) / window.length;
    return {
      date: entry.date,
      avg_kg: Math.round(avg * 100) / 100,
    };
  });
}

export function estimateTargetDate(
  config: AppConfig,
  weightLog: WeightEntry[],
  exerciseLog: ExerciseEntry[],
): string | null {
  const forecast = generateForecast(config, weightLog, exerciseLog);
  const target = config.profile.target_weight_kg;

  for (const point of forecast) {
    if (point.expected_kg <= target) {
      return point.date;
    }
  }

  return null;
}

export function getDaysOnPlan(startDate: string): number {
  return differenceInDays(new Date(), parseISO(startDate));
}

export function getTotalWeightLost(startWeight: number, currentWeight: number): number {
  return Math.round((startWeight - currentWeight) * 100) / 100;
}

export function getWeeklyRate(weightLog: WeightEntry[]): number | null {
  if (weightLog.length < 2) return null;

  const sorted = [...weightLog].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const days = differenceInDays(parseISO(last.date), parseISO(first.date));

  if (days === 0) return null;

  const totalLoss = first.weight_kg - last.weight_kg;
  const weeklyRate = (totalLoss / days) * 7;

  return Math.round(weeklyRate * 100) / 100;
}
