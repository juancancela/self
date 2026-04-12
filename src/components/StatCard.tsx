interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  accent?: 'brand' | 'success' | 'warning' | 'danger';
}

const ACCENT_STYLES = {
  brand: 'border-brand-500/30 bg-brand-500/5',
  success: 'border-success-500/30 bg-success-500/5',
  warning: 'border-warning-500/30 bg-warning-500/5',
  danger: 'border-danger-500/30 bg-danger-500/5',
};

const ACCENT_TEXT = {
  brand: 'text-brand-400',
  success: 'text-success-400',
  warning: 'text-warning-400',
  danger: 'text-danger-400',
};

export default function StatCard({ label, value, unit, icon, trend, subtitle, accent = 'brand' }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-5 transition-colors ${ACCENT_STYLES[accent]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend === 'down' ? 'bg-success-500/20 text-success-400' :
            trend === 'up' ? 'bg-danger-500/20 text-danger-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {trend === 'down' ? '↓' : trend === 'up' ? '↑' : '→'}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-2xl font-bold ${ACCENT_TEXT[accent]}`}>
          {value}
          {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
        </p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
