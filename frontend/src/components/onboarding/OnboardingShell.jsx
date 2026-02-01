/**
 * Onboarding 统一外壳：渐变背景 + 步骤指示（可选）
 */
import { StepIndicator } from './StepIndicator';

export function OnboardingShell({ step, showSteps = true, children }) {
  return (
    <div
      className="min-h-screen w-full flex flex-col bg-mush-night"
      style={{
        background: 'linear-gradient(165deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)',
      }}
    >
      {showSteps && step != null && (
        <div className="pt-12 pb-4 px-6">
          <StepIndicator current={step} />
        </div>
      )}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
