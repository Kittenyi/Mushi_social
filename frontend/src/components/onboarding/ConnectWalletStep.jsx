/**
 * Onboarding 步骤 2: 连接钱包
 * RainbowKit 钱包选择弹窗，支持 MetaMask、WalletConnect、Coinbase 等；连接成功后自动进入下一步
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { OnboardingShell } from './OnboardingShell';

const AUTO_ADVANCE_DELAY_MS = 1200;

export function ConnectWalletStep() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

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
        <h2 className="text-2xl font-semibold text-white mb-1">Connect wallet</h2>
        <p className="text-white/50 text-sm mb-8">Use your Web3 identity to start Mushi · MetaMask, WalletConnect, Coinbase & more</p>
        <div className="flex flex-col items-center gap-6 mb-10">
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
