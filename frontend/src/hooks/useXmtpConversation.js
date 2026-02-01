/**
 * XMTP 会话与消息 hooks（基于 @xmtp/browser-sdk，动态加载）
 * useConversation(peerAddress), useMessages(dm), useSendMessage(dm)
 */
import { useState, useEffect, useCallback } from 'react';
import { useOptionalXmtpClient } from '../context/XmtpContext';

/**
 * 获取或创建与某地址的 DM
 * @param {string} peerAddress - 对方 0x 地址
 * @returns { { dm: import('@xmtp/browser-sdk').Dm | null, isLoading: boolean, error: string | null } }
 */
export function useConversation(peerAddress) {
  const ctx = useOptionalXmtpClient();
  const client = ctx?.client ?? null;
  const [dm, setDm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!client || !peerAddress || !peerAddress.startsWith('0x')) {
      setDm(null);
      return;
    }
    let cancelled = false;
    setError(null);
    setIsLoading(true);
    (async () => {
      try {
        const { IdentifierKind } = await import('@xmtp/browser-sdk');
        const conversation = await client.conversations.fetchDmByIdentifier({
          identifier: peerAddress.toLowerCase(),
          identifierKind: IdentifierKind.Ethereum,
        });
        if (!cancelled) setDm(conversation);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message ?? '获取会话失败');
          setDm(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [client, peerAddress]);

  return { dm, isLoading, error };
}

/**
 * 拉取并订阅某 DM 的消息列表
 * @param {import('@xmtp/browser-sdk').Dm | null} dm
 * @returns { { messages: Array<{ id: string, content: string, senderAddress: string, sentAt: Date }>, isLoading: boolean } }
 */
export function useMessages(dm) {
  const ctx = useOptionalXmtpClient();
  const client = ctx?.client ?? null;
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client || !dm) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    const load = async () => {
      try {
        const list = await (typeof dm.messages === 'function' ? dm.messages() : dm.messages) ?? [];
        const arr = Array.isArray(list) ? list : [];
        if (!cancelled) {
          setMessages(
            arr.map((m) => ({
              id: m.id ?? m.messageId ?? Math.random().toString(36),
              content: m.content ?? m.text ?? '',
              senderAddress: m.senderAddress ?? m.sender ?? '',
              sentAt: m.sentAt ? new Date(m.sentAt) : new Date(),
            }))
          );
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [client, dm]);

  return { messages, isLoading };
}

/**
 * 发送文本消息（支持乐观更新）
 * @param {import('@xmtp/browser-sdk').Dm | null} dm
 */
export function useSendMessage(dm) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (text) => {
      if (!dm || !text?.trim()) return false;
      setError(null);
      setSending(true);
      try {
        await dm.sendText(text.trim(), true);
        await dm.publishMessages?.();
        return true;
      } catch (e) {
        setError(e?.message ?? '发送失败');
        return false;
      } finally {
        setSending(false);
      }
    },
    [dm]
  );

  return { sendMessage, sending, error };
}
