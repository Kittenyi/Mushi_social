/**
 * 欢迎页 - 仅当「已完成引导」时显示（快捷入口：进入地图 / 邮箱注册）
 * 未完成引导时由 App 重定向到 /onboarding，走 5 步引导流程
 */
import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { setOnboardingDone, getOnboardingDone } from '../lib/onboarding';
import { useProfileStore } from '../stores/useProfileStore';

const WELCOME_BACK_FLAG = 'mushi_show_welcome_back';

export function WelcomePage() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  if (!getOnboardingDone()) {
    return <Navigate to="/onboarding" replace />;
  }
  // 已连接钱包时直接进地图，并在地图页显示「欢迎回来」
  if (isConnected) {
    try {
      sessionStorage.setItem(WELCOME_BACK_FLAG, '1');
    } catch {}
    return <Navigate to="/map" replace />;
  }
  const { setEmail } = useProfileStore();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailValue, setEmailValue] = useState('');

  const handleEmailRegister = () => {
    const trimmed = emailValue.trim();
    if (!trimmed) return;
    setEmail(trimmed);
    setOnboardingDone();
    navigate('/map');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white px-6"
      style={{
        background: 'linear-gradient(165deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)',
      }}
    >
      <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mb-8 text-4xl animate-float">
        🍄
      </div>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-2">Mushi</h1>
      <p className="text-white/50 text-lg mb-12">你的灵魂，长成蘑菇</p>

      {showEmailForm ? (
        <div className="w-full max-w-sm flex flex-col gap-4 mb-4">
          <input
            type="email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            placeholder="输入邮箱"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-center"
            autoFocus
          />
          <button
            type="button"
            onClick={handleEmailRegister}
            className="btn-primary w-full"
          >
            注册
          </button>
          <button
            type="button"
            onClick={() => { setShowEmailForm(false); setEmailValue(''); }}
            className="text-white/50 text-sm hover:text-white/70"
          >
            返回
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <ConnectButton />
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            邮箱注册
          </button>
          <Link to="/onboarding" className="text-white/50 text-sm hover:text-white/70">
            {isConnected ? '重新体验 5 步引导' : '或先体验引导流程'}
          </Link>
        </div>
      )}
    </div>
  );
}
