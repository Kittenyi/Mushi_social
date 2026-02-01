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

  const connect = useCallback(async (s) => {
    const signerToUse = s ?? signerRef.current;
    if (!signerToUse) {
      setError('请先连接钱包');
      return;
    }
    if (connectInFlightRef.current) return;
    connectInFlightRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const { Client } = await import('@xmtp/browser-sdk');
      const c = await Client.create(signerToUse, {});
      setClient(c);
      try {
        const id = signerToUse.getIdentifier?.();
        setMyAddress(id?.identifier ?? null);
      } catch {
        setMyAddress(null);
      }
    } catch (e) {
      setError(e?.message ?? 'XMTP 初始化失败');
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

  // 当 signer 从外部传入时自动连接 XMTP；防抖 200ms 避免 signer 引用抖动导致反复 connect、卡死
  useEffect(() => {
    if (!signer) {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      disconnect();
      return;
    }
    if (client || isLoading) return;
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
  }, [signer, client, isLoading, connect, disconnect]);

  const value = {
    client,
    isLoading,
    error,
    connect,
    disconnect,
    isConnected: !!client,
    myAddress,
  };

  return (
    <XmtpContext.Provider value={value}>
      {children}
    </XmtpContext.Provider>
  );
}
