import { useState, useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { useAppData } from '../hooks/useAppData';

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function WeightChart() {
  const { weightLog, forecast, movingAvg, profile, currentWeight, totalLost, estimatedDate } = useAppData();
  const [range, setRange] = useState<TimeRange>('all');

  const chartData = useMemo(() => {
    const weightByDate = new Map(weightLog.map(w => [w.date, w.weight_kg]));
    const avgByDate = new Map(movingAvg.map(m => [m.date, m.avg_kg]));

    let data = forecast.map(f => ({
      date: f.date,
      expected: f.expected_kg,
      upper: f.upper_band_kg,
      lower: f.lower_band_kg,
      actual: weightByDate.get(f.date) ?? null,
      movingAvg: avgByDate.get(f.date) ?? null,
    }));

    if (range !== 'all') {
      const now = new Date();
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];
      data = data.filter(d => d.date >= cutoff && d.date <= today);
    }

    return data;
  }, [forecast, weightLog, movingAvg, range]);

  const yDomain = useMemo(() => {
    const allValues = chartData.flatMap(d => [d.expected, d.actual, d.upper, d.lower].filter(Boolean) as number[]);
    if (allValues.length === 0) return [70, 120];
    const min = Math.floor(Math.min(...allValues) - 2);
    const max = Math.ceil(Math.max(...allValues) + 2);
    return [min, max];
  }, [chartData]);

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Progreso de peso</h1>
          <p className="text-slate-400 mt-1">Peso real vs forecast con media móvil de 7 días</p>
        </div>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                range === r ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === 'all' ? 'Todo' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Inicio</p>
          <p className="text-xl font-bold text-white mt-1">{profile.start_weight_kg} <span className="text-sm font-normal text-slate-500">kg</span></p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Actual</p>
          <p className="text-xl font-bold text-brand-400 mt-1">{currentWeight} <span className="text-sm font-normal text-slate-500">kg</span></p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Perdido</p>
          <p className="text-xl font-bold text-success-400 mt-1">{totalLost.toFixed(1)} <span className="text-sm font-normal text-slate-500">kg</span></p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Fecha estimada</p>
          <p className="text-xl font-bold text-warning-400 mt-1">
            {estimatedDate
              ? new Date(estimatedDate).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
              : '—'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:p-6">
        <div className="h-[400px] sm:h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: '#64748b', fontSize: 11 }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={v => `${v}`}
                width={45}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
                labelFormatter={(label) => formatDate(String(label))}
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    expected: 'Esperado',
                    actual: 'Real',
                    movingAvg: 'Media móvil 7d',
                    upper: 'Banda superior',
                    lower: 'Banda inferior',
                  };
                  return [`${value} kg`, labels[String(name)] || String(name)];
                }}
              />
              <Legend
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    expected: 'Esperado',
                    actual: 'Peso real',
                    movingAvg: 'Media móvil 7d',
                  };
                  return labels[value] || value;
                }}
              />

              {/* Tolerance band */}
              <Area dataKey="upper" stroke="none" fill="#3b82f6" fillOpacity={0.05} name="upper" legendType="none" />
              <Area dataKey="lower" stroke="none" fill="#0f172a" fillOpacity={1} name="lower" legendType="none" />

              {/* Forecast line */}
              <Line
                dataKey="expected"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                name="expected"
              />

              {/* Moving average */}
              <Line
                dataKey="movingAvg"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="movingAvg"
                connectNulls
              />

              {/* Actual weight */}
              <Line
                dataKey="actual"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#22c55e' }}
                name="actual"
                connectNulls
              />

              {/* Target line */}
              <ReferenceLine
                y={profile.target_weight_kg}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: `Objetivo: ${profile.target_weight_kg}kg`, position: 'right', fill: '#ef4444', fontSize: 11 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight log table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Registro de peso</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-6 py-3">Fecha</th>
                <th className="text-right text-xs text-slate-500 uppercase tracking-wider px-6 py-3">Peso</th>
                <th className="text-right text-xs text-slate-500 uppercase tracking-wider px-6 py-3">Cambio</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-6 py-3">Notas</th>
              </tr>
            </thead>
            <tbody>
              {[...weightLog].reverse().map((entry, idx, arr) => {
                const prev = arr[idx + 1];
                const diff = prev ? entry.weight_kg - prev.weight_kg : null;
                return (
                  <tr key={entry.date} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-6 py-3 text-sm text-slate-300">
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-semibold text-white">{entry.weight_kg} kg</td>
                    <td className="px-6 py-3 text-sm text-right">
                      {diff !== null ? (
                        <span className={diff < 0 ? 'text-success-400' : diff > 0 ? 'text-danger-400' : 'text-slate-400'}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-400">{entry.notes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
