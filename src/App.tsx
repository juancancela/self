import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import WeightChart from './components/WeightChart'
import ExerciseTracker from './components/ExerciseTracker'
import MealPlanView from './components/MealPlanView'
import Achievements from './components/Achievements'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/peso" element={<WeightChart />} />
        <Route path="/ejercicio" element={<ExerciseTracker />} />
        <Route path="/comidas" element={<MealPlanView />} />
        <Route path="/logros" element={<Achievements />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
