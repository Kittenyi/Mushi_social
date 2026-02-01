/**
 * 引导门：必须真实连接钱包才能进入应用；未完成引导时先走引导流程
 */
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { getOnboardingDone } from '../lib/onboarding';

const APP_ROUTES_PREFIX = ['/map', '/chat', '/friends', '/notifications', '/settings'];
const PROFILE_PREFIX = '/profile/';

export function OnboardingGate() {
  const location = useLocation();
  const pathname = location.pathname || '';
  const { isConnected } = useAccount();
  const done = getOnboardingDone();
  const isAppRoute =
    APP_ROUTES_PREFIX.some((p) => pathname === p) ||
    pathname.startsWith(PROFILE_PREFIX);

  // 未连接真实钱包：只有应用页（地图/聊天/设置等）需先连接，引导页 /onboarding 内可连接
  if (isAppRoute && !isConnected) {
    return <Navigate to="/" replace />;
  }
  // 已连接但未完成引导 → 走引导流程
  if (isAppRoute && !done) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}
