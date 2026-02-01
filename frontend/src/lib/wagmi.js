/**
 * Wagmi + RainbowKit 配置：链、真实钱包（MetaMask / OKX / BN Wallet 等）
 * 需要 WalletConnect Cloud projectId: https://cloud.walletconnect.com/
 */
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  okxWallet,
  binanceWallet,
  walletConnectWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const wagmiConfig = getDefaultConfig({
  appName: 'Mushi',
  projectId,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  // 显式接入真实钱包：MetaMask、OKX、BN Wallet，以及 WalletConnect / 其他注入钱包
  wallets: [
    {
      groupName: '常用钱包',
      wallets: [
        metaMaskWallet,
        okxWallet,
        binanceWallet,
        walletConnectWallet,
        injectedWallet,
      ],
    },
  ],
});
