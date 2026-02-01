/**
 * Blink/Zenly 风格步骤指示器：圆点
 */
const TOTAL = 5;

export function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: TOTAL }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i + 1 === current
              ? 'w-6 bg-white'
              : i + 1 < current
                ? 'w-1.5 bg-white/60'
                : 'w-1.5 bg-white/20'
          }`}
        />
      ))}
    </div>
  );
}
