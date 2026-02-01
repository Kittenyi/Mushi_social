/**
 * Onboarding 连接真实钱包：点击即打开 RainbowKit 弹窗，选 MetaMask/OKX/BN 在扩展内授权
 * 不假装连接，必须 wagmi isConnected 后才算完成
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { OnboardingShell } from './OnboardingShell';

const AUTO_ADVANCE_DELAY_MS = 1200;

/** @param {{ onConnectedNext?: () => void }} props - 若传 onConnectedNext，连接后调用而不跳转（由父组件切到下一步） */
export function ConnectWalletStep({ onConnectedNext }) {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (!isConnected) return;
    if (typeof onConnectedNext === 'function') {
      const t = setTimeout(onConnectedNext, AUTO_ADVANCE_DELAY_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => navigate('/onboarding/soul'), AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [isConnected, navigate, onConnectedNext]);

  // 进入此步时自动打开钱包选择弹窗，直接跳转到 MetaMask/OKX/BN 选择
  useEffect(() => {
    if (isConnected || !openConnectModal) return;
    const t = setTimeout(openConnectModal, 400);
    return () => clearTimeout(t);
  }, [isConnected, openConnectModal]);

  return (
    <OnboardingShell step={2}>
      <div className="flex-1 flex flex-col px-6 pt-4 pb-8 animate-fade-in-up">
        <h2 className="text-2xl font-semibold text-white mb-1">连接钱包</h2>
        <p className="text-white/50 text-sm mb-6">弹窗已打开，选择 MetaMask、OKX 或 BN Wallet 即可跳转到对应扩展完成连接</p>
        <div className="flex flex-col items-center gap-6 mb-10">
          {openConnectModal ? (
            <button
              type="button"
              onClick={openConnectModal}
              className="w-full max-w-xs px-6 py-4 rounded-xl bg-[#F6851B] hover:bg-[#E2761B] text-white font-semibold text-base"
            >
              打开 MetaMask / OKX / BN Wallet
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
