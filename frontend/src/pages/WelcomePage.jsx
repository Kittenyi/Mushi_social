/**
 * 欢迎页（图二）：Mushi 品牌 + 「Connect Wallet」入口，点击后弹出连接钱包
 * 连接后 → 弹出 MetaMask 签名认证 → 签名成功后再进入 onboarding
 */
import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { getOnboardingDone } from '../lib/onboarding';

const WELCOME_BACK_FLAG = 'mushi_show_welcome_back';
const AUTH_SIGNED_KEY = 'mushi_auth_signed';

function getSignMessage() {
  const timestamp = new Date().toISOString();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `Sign in to Mushi\n\nOrigin: ${origin}\nTimestamp: ${timestamp}`;
}

export function WelcomePage() {
  const { isConnected, address } = useAccount();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();
  const [signError, setSignError] = useState(null);
  const [authSigned, setAuthSigned] = useState(false);
  const hasRequestedSign = useRef(false);

  const hasSigned = () => {
    if (authSigned) return true;
    try {
      return sessionStorage.getItem(AUTH_SIGNED_KEY) === '1';
    } catch {
      return false;
    }
  };

  // 连接钱包后，稍等再弹出 MetaMask 签名认证，避免钱包未就绪
  useEffect(() => {
    if (!isConnected || !address || hasRequestedSign.current || hasSigned()) return;
    const t = setTimeout(() => {
      hasRequestedSign.current = true;
      setSignError(null);
      const message = getSignMessage();
      signMessageAsync({ message })
        .then(() => {
          try {
            sessionStorage.setItem(AUTH_SIGNED_KEY, '1');
          } catch {}
          setAuthSigned(true);
          hasRequestedSign.current = false;
        })
        .catch((err) => {
          hasRequestedSign.current = false;
          setSignError(err?.message || 'Signature rejected');
        });
    }, 400);
    return () => clearTimeout(t);
  }, [isConnected, address, signMessageAsync]);

  if (isConnected && hasSigned()) {
    try {
      sessionStorage.setItem(WELCOME_BACK_FLAG, '1');
    } catch {}
    return <Navigate to={getOnboardingDone() ? '/map' : '/onboarding'} replace />;
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-background px-6 pb-20"
      style={{
        background: 'linear-gradient(180deg, #0a0a12 0%, #0f0f1a 40%, #12122a 100%)',
      }}
    >
      {/* 星空/粒子感：小点装饰 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(163,255,18,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139,92,246,0.06) 0%, transparent 50%)',
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20" style={{
          backgroundImage: 'linear-gradient(180deg, transparent 0%, rgba(163,255,18,0.03) 100%)',
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center pointer-events-auto">
        <p className="text-xs uppercase tracking-[0.35em] text-white/40 mb-2">
          WEB3 SO<span className="text-white/60">UL</span> IDENTITY
        </p>
        <h1 className="text-4xl md:text-5xl font-serif font-light text-white tracking-tight mb-4">
          Mushi
        </h1>
        <p className="text-sm text-white/60 max-w-xs mb-1">
          Discover your on-chain identity.
        </p>
        <p className="text-sm text-white/50 max-w-xs mb-12">
          Connect. Evolve. Belong.
        </p>

        {isConnected && !hasSigned() ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Step 2: Sign to continue</p>
            {isSigning && (
              <p className="text-sm text-white/70">Please sign the message in your wallet (MetaMask) to continue.</p>
            )}
            {signError && (
              <>
                <p className="text-sm text-amber-400/90">{signError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSignError(null);
                    hasRequestedSign.current = false;
                    signMessageAsync({ message: getSignMessage() })
                      .then(() => {
                        try {
                          sessionStorage.setItem(AUTH_SIGNED_KEY, '1');
                        } catch {}
                        setAuthSigned(true);
                      })
                      .catch((e) => setSignError(e?.message || 'Signature rejected'));
                  }}
                  className="text-sm text-white/80 underline hover:text-white"
                >
                  Retry sign
                </button>
              </>
            )}
            {!signError && !isSigning && (
              <p className="text-sm text-white/50">Waiting for signature…</p>
            )}
          </div>
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal: openModal }) => (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Step 1: Connect wallet</p>
                <button
                  type="button"
                  onClick={() => typeof openModal === 'function' && openModal()}
                  className="welcome-connect-btn"
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </ConnectButton.Custom>
        )}
      </div>

      {/* 底部钱包提示：仅作说明，不直接弹窗 */}
      <p className="pointer-events-none absolute bottom-8 left-0 right-0 text-center text-[10px] uppercase tracking-widest text-white/25">
        MetaMask · OKX · BN Wallet
      </p>
    </div>
  );
}
