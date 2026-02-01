/**
 * 为 @xmtp/browser-sdk 创建 EOA Signer（动态加载 SDK）
 * 与 wagmi/viem 的 signMessageAsync 对接：钱包签名返回 hex，需转 Uint8Array
 * 注意：IdentifierKind 在 browser-sdk 中为 type-only 导出，运行时为 undefined，需从 wasm-bindings 取枚举值
 */
import { hexToBytes } from 'viem';

/** 从 wasm-bindings 取 IdentifierKind.Ethereum；browser-sdk 仅导出类型，运行时为 undefined */
async function getIdentifierKindEthereum() {
  try {
    const w = await import('@xmtp/wasm-bindings');
    if (w?.IdentifierKind?.Ethereum !== undefined) return w.IdentifierKind.Ethereum;
  } catch {
    // wasm-bindings 可能未加载或未导出
  }
  return 0; // Rust enum 首项通常为 0
}

/**
 * @param {string} address - 0x 地址
 * @param {(message: string) => Promise<string>} signMessageAsync - 如 wagmi 的 signMessageAsync，返回 hex
 * @returns {Promise<import('@xmtp/browser-sdk').Signer>}
 */
export async function createEoaSigner(address, signMessageAsync) {
  const identifierKindEthereum = await getIdentifierKindEthereum();
  return {
    type: 'EOA',
    getIdentifier: () => ({
      identifier: address,
      identifierKind: identifierKindEthereum,
    }),
    signMessage: async (message) => {
      const hex = await signMessageAsync(message);
      return hexToBytes(hex);
    },
  };
}
