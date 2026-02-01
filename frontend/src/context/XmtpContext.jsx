/**
 * XMTP React 集成：Provider + useXmtpClient
 * 使用 @xmtp/browser-sdk（动态加载），用钱包 signer 创建 Client
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const XmtpContext = createContext(null);

export function useXmtpClient() {
  const ctx = useContext(XmtpContext);
  if (!ctx) throw new Error('useXmtpClient must be used within XmtpProvider');
  return ctx;
}

/** 可选：无 Provider 时返回 null */
export function useOptionalXmtpClient() {
  return useContext(XmtpContext);
}

/**
 * @param {Object} props
 * @param {import('@xmtp/browser-sdk').Signer|null} props.signer - 来自钱包（如 wagmi useWalletClient 转换）
 * @param {React.ReactNode} props.children
 */
export function XmtpProvider({ signer, children }) {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myAddress, setMyAddress] = useState(null);
  const connectInFlightRef = useRef(false);
  const signerRef = useRef(signer);
  const connectTimeoutRef = useRef(null);
  signerRef.current = signer;

  const CONNECT_TIMEOUT_MS = 30000;

  const connect = useCallback(async (s) => {
    const signerToUse = s ?? signerRef.current;
    if (!signerToUse) {
      setError(typeof window !== 'undefined' && typeof window.ethereum === 'undefined' ? 'No Ethereum wallet detected. Install MetaMask and retry.' : 'Connect your wallet first.');
      return;
    }
    if (connectInFlightRef.current) return;
    connectInFlightRef.current = true;
    setIsLoading(true);
    setError(null);
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      setError('XMTP connection timed out. Try again.');
      setClient(null);
      setMyAddress(null);
      setIsLoading(false);
      connectInFlightRef.current = false;
    }, CONNECT_TIMEOUT_MS);
    try {
      const { Client } = await import('@xmtp/browser-sdk');
      const c = await Client.create(signerToUse, {});
      clearTimeout(timeoutId);
      if (timedOut) return;
      setClient(c);
      try {
        const id = signerToUse.getIdentifier?.();
        setMyAddress(id?.identifier ?? null);
      } catch {
        setMyAddress(null);
      }
    } catch (e) {
      clearTimeout(timeoutId);
      setError(e?.message ?? 'XMTP init failed');
      setClient(null);
      setMyAddress(null);
    } finally {
      setIsLoading(false);
      connectInFlightRef.current = false;
    }
  }, []);

  const disconnect = useCallback(() => {
    setClient(null);
    setError(null);
    setMyAddress(null);
  }, []);

  // 当 signer 从外部传入时自动连接 XMTP；防抖 200ms，且失败后不自动重试（避免无限「正在准备 XMTP」）
  useEffect(() => {
    if (!signer) {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      disconnect();
      return;
    }
    if (client || isLoading || error) return;
    if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
    connectTimeoutRef.current = setTimeout(() => {
      connectTimeoutRef.current = null;
      connect(signer);
    }, 200);
    return () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
    };
  }, [signer, client, isLoading, error, connect, disconnect]);

  const value = {
    client,
    isLoading,
    error,
    connect,
    disconnect,
    isConnected: !!client,
    myAddress,
    inboxId: client?.inboxId ?? null,
  };

  return (
    <XmtpContext.Provider value={value}>
      {children}
    </XmtpContext.Provider>
  );
}
