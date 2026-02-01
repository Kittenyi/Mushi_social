/**
 * 欢迎页：必须真实连接钱包（MetaMask/OKX/BN）才能进入，不提供“仅邮箱”跳过
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

  if (isConnected) {
    try {
      sessionStorage.setItem(WELCOME_BACK_FLAG, '1');
    } catch {}
    return <Navigate to={getOnboardingDone() ? '/map' : '/onboarding'} replace />;
  }

  const { setEmail } = useProfileStore();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailValue, setEmailValue] = useState('');

  const handleEmailSave = () => {
    const trimmed = emailValue.trim();
    if (!trimmed) return;
    setEmail(trimmed);
    setShowEmailForm(false);
    setEmailValue('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6">
        <h1 className="mb-4 text-4xl font-bold">Mushi</h1>
        <p className="text-xl text-muted-foreground mb-12">Your soul, grown into a mushroom</p>

        {showEmailForm ? (
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <p className="text-white/50 text-sm">仅用于接收通知，保存后仍需连接钱包才能进入应用</p>
            <input
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              placeholder="Enter email (optional)"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-center text-base"
              autoFocus
            />
            <button type="button" onClick={handleEmailSave} className="btn-primary w-full">
              Save
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
            <p className="text-white/70 text-sm mb-1">必须连接真实钱包才能进入地图与聊天</p>
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
              仅保存邮箱（可选，不代替钱包）
            </button>
            <Link to="/onboarding" className="text-muted-foreground text-sm">
              先走引导流程
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
