/**
 * Onboarding 步骤 1: 欢迎页
 * Mushi Logo + 3D 蘑菇动画展示 + Connect Wallet（弹性点击）
 */
import { useNavigate } from 'react-router-dom';
import { OnboardingShell } from './OnboardingShell';

export function WelcomeStep() {
  const navigate = useNavigate();
  return (
    <OnboardingShell step={1}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
        {/* 3D 蘑菇：透视 + 轻微旋转感 */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 text-5xl select-none"
          style={{
            perspective: '200px',
            transformStyle: 'preserve-3d',
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          <div
            className="w-full h-full rounded-3xl bg-white/10 flex items-center justify-center shadow-lg"
            style={{
              transform: 'rotateY(-8deg) rotateX(5deg)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 60px rgba(167,139,250,0.15)',
            }}
          >
            🍄
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-2">
          Mushi
        </h1>
        <p className="text-white/50 text-lg mb-12">你的灵魂，长成蘑菇</p>
        <button
          type="button"
          onClick={() => navigate('/onboarding/wallet')}
          className="btn-primary btn-elastic"
        >
          Connect Wallet
        </button>
      </div>
    </OnboardingShell>
  );
}
