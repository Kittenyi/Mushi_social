/**
 * Onboarding 入口：必须先真实连接钱包，连接成功后才进入扫码/结果流程
 * 未连接时重定向到首页（绿色 Connect Wallet），连接弹窗仅在首页点击时弹出
 */
import { Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { OnboardingScanPage } from './OnboardingScanPage';

export function OnboardingEntryPage() {
  const { isConnected } = useAccount();

  // 未连接：重定向到首页，由欢迎页绿色「Connect Wallet」点击后弹出连接弹窗
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  // 已连接：进入扫码流程
  return <OnboardingScanPage />;
}
