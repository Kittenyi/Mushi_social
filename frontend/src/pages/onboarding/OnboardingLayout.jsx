/**
 * Onboarding 5 步引导流程（交互式，非「到我页面自己填」）
 * 1 欢迎 → 2 连接钱包 → 3 Soul 形象 → 4 个人资料(昵称+头像) → 5 开启 LBS
 */
import { Routes, Route } from 'react-router-dom';
import { WelcomeStep } from '../../components/onboarding/WelcomeStep';
import { ConnectWalletStep } from '../../components/onboarding/ConnectWalletStep';
import { SoulStep } from '../../components/onboarding/SoulStep';
import { ProfileStep } from '../../components/onboarding/ProfileStep';
import { LBSStep } from '../../components/onboarding/LBSStep';

export function OnboardingLayout() {
  return (
    <Routes>
      <Route index element={<WelcomeStep />} />
      <Route path="wallet" element={<ConnectWalletStep />} />
      <Route path="soul" element={<SoulStep />} />
      <Route path="profile" element={<ProfileStep />} />
      <Route path="lbs" element={<LBSStep />} />
    </Routes>
  );
}
