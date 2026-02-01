import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAccount, useWalletClient } from 'wagmi';
import { XmtpProvider } from './context/XmtpContext';
import { ThemeProvider } from './context/ThemeContext';
import { RealtimeChatProvider } from './context/RealtimeChatContext';
import { createEoaSigner } from './lib/xmtpSigner';
import { OnboardingGate } from './components/OnboardingGate';
import { WelcomePage } from './pages/WelcomePage';
import { OnboardingScanPage } from './pages/OnboardingScanPage';
import { OnboardingResultPage } from './pages/OnboardingResultPage';
import { MapPage } from './pages/MapPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChatListPage } from './pages/ChatListPage';
import { ChatDetailPage } from './pages/ChatDetailPage';
import { FriendsPage } from './pages/FriendsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';


const WALLET_RETRY_MS = 400;
const WALLET_RETRY_MAX = 15;

function AppWithWallet() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const walletClientRef = useRef(walletClient);
  walletClientRef.current = walletClient;
  const [signer, setSigner] = useState(null);
  const [walletRetry, setWalletRetry] = useState(0);

  // 仅依赖 address / isConnected；walletClient 用 ref 读，避免引用抖动导致 effect 反复跑、Chrome 卡死
  useEffect(() => {
    if (!isConnected || !address) {
      setSigner(null);
      setWalletRetry(0);
      return;
    }
    const wc = walletClientRef.current;
    if (!wc) {
      if (walletRetry >= WALLET_RETRY_MAX) {
        setSigner(null);
        return;
      }
      const t = setTimeout(() => setWalletRetry((r) => r + 1), WALLET_RETRY_MS);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    const signMessageAsync = (msg) => wc.signMessage({ message: msg });
    createEoaSigner(address, signMessageAsync)
      .then((s) => { if (!cancelled) setSigner(s); })
      .catch((e) => {
        if (!cancelled) setSigner(null);
        console.error('[XMTP] createEoaSigner failed:', e);
      });
    return () => { cancelled = true; };
  }, [address, isConnected, walletRetry]);

  return (
    <ThemeProvider>
      <RealtimeChatProvider myAddress={address || null}>
        <XmtpProvider signer={signer}>
          <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/onboarding" element={<OnboardingScanPage />} />
        <Route path="/onboarding/result" element={<OnboardingResultPage />} />
        <Route element={<OnboardingGate />}>
          <Route path="/map" element={<MapPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatListPage />} />
          <Route path="/chat/:id" element={<ChatDetailPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </XmtpProvider>
      </RealtimeChatProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return <AppWithWallet />;
}
