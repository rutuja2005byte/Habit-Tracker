import { motion } from "framer-motion";

export function ProgressRing({ value, color = "#0ea5e9", label, size = 116 }: { value: number; color?: string; label: string; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="grid place-items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-zinc-200 dark:text-white/10" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-xl font-semibold text-zinc-950 dark:text-zinc-50">{value}%</div>
      </div>
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}
