/**
 * 引导门：未完成引导时访问地图/聊天/设置等会重定向到欢迎页
 */
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { getOnboardingDone } from '../lib/onboarding';

const APP_ROUTES_PREFIX = ['/map', '/chat', '/notifications', '/settings'];
const PROFILE_PREFIX = '/profile/';

export function OnboardingGate() {
  const location = useLocation();
  const pathname = location.pathname || '';
  const isAppRoute =
    APP_ROUTES_PREFIX.some((p) => pathname === p) ||
    pathname.startsWith(PROFILE_PREFIX);
  const done = getOnboardingDone();

  if (isAppRoute && !done) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}
