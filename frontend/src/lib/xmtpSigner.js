/**
 * 为 @xmtp/browser-sdk 创建 EOA Signer（动态加载 SDK）
 * 与 wagmi/viem 的 signMessageAsync 对接：钱包签名返回 hex，需转 Uint8Array
 */
import { hexToBytes } from 'viem';

/**
 * @param {string} address - 0x 地址
 * @param {(message: string) => Promise<string>} signMessageAsync - 如 wagmi 的 signMessageAsync，返回 hex
 * @returns {Promise<import('@xmtp/browser-sdk').Signer>}
 */
export async function createEoaSigner(address, signMessageAsync) {
  const { IdentifierKind } = await import('@xmtp/browser-sdk');
  return {
    type: 'EOA',
    getIdentifier: () => ({
      identifier: address,
      identifierKind: IdentifierKind.Ethereum,
    }),
    signMessage: async (message) => {
      const hex = await signMessageAsync(message);
      return hexToBytes(hex);
    },
  };
}
