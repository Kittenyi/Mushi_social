/**
 * 欢迎页 - 与 Index.tsx 一致：flex min-h-screen items-center justify-center bg-background + text-center
 */
import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { setOnboardingDone, getOnboardingDone } from '../lib/onboarding';
import { useProfileStore } from '../stores/useProfileStore';

const WELCOME_BACK_FLAG = 'mushi_show_welcome_back';

export function WelcomePage() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  if (!getOnboardingDone()) {
    return <Navigate to="/onboarding" replace />;
  }
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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6">
        <h1 className="mb-4 text-4xl font-bold">Mushi</h1>
        <p className="text-xl text-muted-foreground mb-12">Your soul, grown into a mushroom</p>

        {showEmailForm ? (
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <input
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              placeholder="Enter email"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-center text-base"
              autoFocus
            />
            <button type="button" onClick={handleEmailRegister} className="btn-primary w-full">
              Sign up
            </button>
            <button
              type="button"
              onClick={() => { setShowEmailForm(false); setEmailValue(''); }}
              className="text-muted-foreground text-sm"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
            <p className="text-white/70 text-sm mb-1">连接真实钱包后即可使用地图与聊天</p>
            {openConnectModal ? (
              <button
                type="button"
                onClick={openConnectModal}
                className="w-full px-6 py-4 rounded-xl bg-[#F6851B] hover:bg-[#E2761B] text-white font-semibold text-base shadow-lg"
              >
                连接钱包（MetaMask / OKX / BN Wallet）
              </button>
            ) : null}
            <ConnectButton />
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-base font-medium"
            >
              Sign up with email
            </button>
            <Link to="/onboarding" className="text-muted-foreground text-sm">
              Or try onboarding first
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
