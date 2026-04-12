import { useMemo } from 'react';
import configData from '../data/config.json';
import weightLogData from '../data/weight-log.json';
import exerciseLogData from '../data/exercise-log.json';
import type { AppConfig, WeightEntry, ExerciseEntry } from '../engine/types';
import { computeMetrics, getTargetCalories, calculateBMR, calculateTDEE } from '../engine/bmr';
import { generateForecast, getMovingAverage, estimateTargetDate, getDaysOnPlan, getTotalWeightLost, getWeeklyRate } from '../engine/forecast';
import { evaluateAchievements, getNextAchievement, calculateCurrentStreak, getTotalExerciseHours } from '../engine/achievements';
import { getMealPlanForWeek, getCurrentWeekNumber, getTodaysMeals } from '../engine/meals';

const config = configData as AppConfig;
const weightLog = weightLogData as WeightEntry[];
const exerciseLog = exerciseLogData as ExerciseEntry[];

export function useAppData() {
  return useMemo(() => {
    const { profile, plan } = config;
    const metrics = computeMetrics(profile);

    const sortedWeight = [...weightLog].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const currentWeight = sortedWeight.length > 0
      ? sortedWeight[sortedWeight.length - 1].weight_kg
      : profile.start_weight_kg;

    const currentBMR = Math.round(calculateBMR(currentWeight, profile.height_cm, profile.age, profile.gender));
    const currentTDEE = Math.round(calculateTDEE(currentBMR, 'light'));
    const targetCalories = getTargetCalories(currentTDEE, plan.mode);
    const currentBMI = Math.round((currentWeight / Math.pow(profile.height_cm / 100, 2)) * 10) / 10;

    const forecast = generateForecast(config, weightLog, exerciseLog);
    const movingAvg = getMovingAverage(weightLog);
    const estimatedDate = estimateTargetDate(config, weightLog, exerciseLog);
    const daysOnPlan = getDaysOnPlan(profile.start_date);
    const totalLost = getTotalWeightLost(profile.start_weight_kg, currentWeight);
    const weeklyRate = getWeeklyRate(weightLog);

    const achievements = evaluateAchievements(profile, weightLog, exerciseLog);
    const nextAchievement = getNextAchievement(achievements);
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const { streak } = calculateCurrentStreak(exerciseLog);
    const totalExerciseHours = Math.round(getTotalExerciseHours(exerciseLog) * 10) / 10;

    const weekNumber = getCurrentWeekNumber(profile.start_date);
    const currentMealPlan = getMealPlanForWeek(weekNumber);
    const todaysMeals = getTodaysMeals(profile.start_date);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayForecast = forecast.find(f => f.date === todayStr);
    const todayWeight = sortedWeight.find(w => w.date === todayStr);
    const yesterdayWeight = sortedWeight.length >= 2 ? sortedWeight[sortedWeight.length - 2] : null;

    return {
      config,
      profile,
      plan,
      weightLog: sortedWeight,
      exerciseLog,

      metrics,
      currentWeight,
      currentBMR,
      currentTDEE,
      targetCalories,
      currentBMI,

      forecast,
      movingAvg,
      estimatedDate,
      daysOnPlan,
      totalLost,
      weeklyRate,

      achievements,
      nextAchievement,
      unlockedCount,
      streak,
      totalExerciseHours,

      weekNumber,
      currentMealPlan,
      todaysMeals,
      todayForecast,
      todayWeight,
      yesterdayWeight,
    };
  }, []);
}
