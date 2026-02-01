/**
 * Onboarding 步骤 2: 连接真实钱包
 * 点击按钮打开弹窗，选择 MetaMask / OKX / BN Wallet 后会跳转到对应扩展
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { OnboardingShell } from './OnboardingShell';

const AUTO_ADVANCE_DELAY_MS = 1200;

export function ConnectWalletStep() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (!isConnected) return;
    const t = setTimeout(() => {
      navigate('/onboarding/soul');
    }, AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [isConnected, navigate]);

  return (
    <OnboardingShell step={2}>
      <div className="flex-1 flex flex-col px-6 pt-4 pb-8 animate-fade-in-up">
        <h2 className="text-2xl font-semibold text-white mb-1">连接钱包</h2>
        <p className="text-white/50 text-sm mb-6">在弹窗中选择 MetaMask、OKX 或 BN Wallet，会跳转到对应扩展完成连接</p>
        <div className="flex flex-col items-center gap-6 mb-10">
          {openConnectModal ? (
            <button
              type="button"
              onClick={openConnectModal}
              className="w-full max-w-xs px-6 py-4 rounded-xl bg-[#F6851B] hover:bg-[#E2761B] text-white font-semibold text-base"
            >
              连接钱包（MetaMask / OKX / BN Wallet）
            </button>
          ) : null}
          <ConnectButton />
          {isConnected && (
            <p className="text-emerald-400/90 text-sm">Connected — taking you to the next step…</p>
          )}
        </div>
        <p className="text-white/40 text-xs text-center">
          Connecting means you agree to our terms and privacy policy
        </p>
      </div>
    </OnboardingShell>
  );
}
