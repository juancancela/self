export interface Profile {
  height_cm: number;
  age: number;
  gender: 'male' | 'female';
  start_date: string;
  start_weight_kg: number;
  target_weight_kg: number;
}

export type PlanMode = 'moderado' | 'decidido' | 'intensivo';

export interface DietRestrictions {
  no_bread: boolean;
  minimal_rice: boolean;
  reduced_legumes: boolean;
  high_fish: boolean;
  high_nuts: boolean;
  no_added_sugar: boolean;
  no_salt_use_pepper: boolean;
  no_ultra_processed: boolean;
  beverages: string[];
}

export interface Plan {
  mode: PlanMode;
  diet_type: string;
  fasting: string;
  restrictions: DietRestrictions;
}

export interface AppConfig {
  profile: Profile;
  plan: Plan;
  forecast_end_date: string;
}

export interface WeightEntry {
  date: string;
  weight_kg: number;
  notes?: string;
}

export interface ExerciseActivity {
  type: 'walking' | 'running' | 'gym' | 'cycling' | 'swimming' | 'other';
  duration_min: number;
  intensity: 'light' | 'standard' | 'intense';
  location?: string;
  notes?: string;
}

export interface ExerciseEntry {
  date: string;
  activities: ExerciseActivity[];
  diet_adherence?: number; // 0-100
}

export interface ForecastPoint {
  date: string;
  expected_kg: number;
  upper_band_kg: number;
  lower_band_kg: number;
}

export interface Meal {
  time: string;
  name: string;
  description: string;
  calories_est: number;
  macros?: {
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
}

export interface DayMealPlan {
  meals: Meal[];
  total_calories: number;
  snack?: Meal;
}

export interface WeekMealPlan {
  week_number: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  days: {
    monday: DayMealPlan;
    tuesday: DayMealPlan;
    wednesday: DayMealPlan;
    thursday: DayMealPlan;
    friday: DayMealPlan;
    saturday: DayMealPlan;
    sunday: DayMealPlan;
  };
}

export type AchievementCategory = 'weight' | 'streak' | 'exercise' | 'special';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  name: string;
  description: string;
  icon: string;
  condition_value: number;
  unlocked: boolean;
  unlocked_date?: string;
}
