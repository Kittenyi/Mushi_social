/**
 * Onboarding 入口：必须先真实连接钱包，连接成功后才进入扫码/结果流程
 * 用户看到的「Connect Wallet」即在此步完成，使用 RainbowKit 真实连接
 */
import { useAccount } from 'wagmi';
import { ConnectWalletStep } from '@/components/onboarding/ConnectWalletStep';
import { OnboardingScanPage } from './OnboardingScanPage';

export function OnboardingEntryPage() {
  const { isConnected } = useAccount();

  // 未连接：只显示连接钱包步骤（真实 RainbowKit，点开即弹窗选 MetaMask/OKX/BN）
  if (!isConnected) {
    return (
      <ConnectWalletStep
        onConnectedNext={() => {}}
      />
    );
  }

  // 已连接：进入扫码流程
  return <OnboardingScanPage />;
}
