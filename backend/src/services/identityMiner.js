/**
 * 身份矿工 (The Miner) - 多源数据聚合
 * 参考：Web3.bio / Debank / Hoot 等，根据链上交互行为生成画像
 * 核心：Web3.bio 一键聚合 ENS / Farcaster / Lens 等
 * 补充：Snapshot 投票、Alchemy 链上数据、Tally 提案（可选）
 * API：https://api.web3.bio/profile/{address|ens}
 */
import axios from 'axios';

const WEB3_BIO_BASE = 'https://api.web3.bio/profile';
const SNAPSHOT_GRAPHQL = 'https://hub.snapshot.org/graphql';
const ALCHEMY_ETH_MAINNET = (key) => `https://eth-mainnet.g.alchemy.com/v2/${key}`;

/**
 * 抓取全维度原始数据（连接钱包后按地址分析）
 * @param {string} address - 0x 地址或 ENS (e.g. vitalik.eth)
 * @returns {Promise<Object|null>} { address, social, txCount, nfts, voteCount, proposalCount, accountAgeDays, isDeployer, ... }
 */
export async function getRawIdentityData(address) {
  if (!address || typeof address !== 'string') return null;

  const normalizedAddress = address.trim();
  const is0x = normalizedAddress.toLowerCase().startsWith('0x');
  const ethAddress = is0x ? normalizedAddress.toLowerCase() : null;

  try {
    const [web3BioRes, snapshotRes, alchemyData, tallyData] = await Promise.all([
      // 1. Web3.bio：多平台身份聚合（ENS / Farcaster / Lens / Basenames / Linea / Solana）
      axios
        .get(`${WEB3_BIO_BASE}/${encodeURIComponent(normalizedAddress)}`, {
          timeout: 10000,
          headers: process.env.WEB3_BIO_API_KEY
            ? { 'X-API-KEY': `Bearer ${process.env.WEB3_BIO_API_KEY}` }
            : {},
        })
        .then((res) => res.data)
        .catch(() => null),

      // 2. Snapshot：近 6 月内投票记录（仅 0x）
      ethAddress
        ? axios
            .post(SNAPSHOT_GRAPHQL, {
              query: `query { votes(first: 50, where: {voter: "${ethAddress}"}) { id, created } }`,
            }, { timeout: 8000 })
            .then((res) => res.data?.data?.votes ?? [])
            .catch(() => [])
        : Promise.resolve([]),

      // 3. Alchemy：交易数、NFT、是否部署过合约、账户年龄（仅 0x，需 ALCHEMY_API_KEY）
      is0x ? fetchAlchemyData(ethAddress) : Promise.resolve({ txCount: 0, nfts: [], isDeployer: false, accountAgeDays: null }),

      // 4. Tally：治理提案数（可选，需 TALLY_API_KEY）
      ethAddress ? fetchTallyProposalCount(ethAddress) : Promise.resolve(0),
    ]);

    // Web3.bio 返回数组：每项为 { platform, displayName, avatar, social: { follower, following, uid }, ... }
    const social = normalizeWeb3BioSocial(web3BioRes);
    const voteCount = Array.isArray(snapshotRes) ? snapshotRes.length : 0;
    const proposalCount = typeof tallyData === 'number' ? tallyData : 0;

    return {
      address: ethAddress || normalizedAddress,
      social,
      txCount: alchemyData?.txCount ?? 0,
      nfts: alchemyData?.nfts ?? [],
      voteCount,
      proposalCount,
      accountAgeDays: alchemyData?.accountAgeDays ?? null,
      isDeployer: alchemyData?.isDeployer ?? false,
      hasAirdropNFT: alchemyData?.hasAirdropNFT ?? false,
    };
  } catch (err) {
    console.error('[identityMiner]', err.message);
    const normalizedAddress = (address || '').trim();
    const ethAddress = normalizedAddress.toLowerCase().startsWith('0x') ? normalizedAddress.toLowerCase() : normalizedAddress;
    return {
      address: ethAddress || normalizedAddress,
      social: [],
      txCount: 0,
      nfts: [],
      voteCount: 0,
      proposalCount: 0,
      accountAgeDays: null,
      isDeployer: false,
      hasAirdropNFT: false,
    };
  }
}

/** 统一 Web3.bio 响应为数组，并保留 social.follower 等字段 */
function normalizeWeb3BioSocial(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res?.list && Array.isArray(res.list)) return res.list;
  return [res].filter(Boolean);
}

/** Alchemy：交易数、NFT、是否部署合约、账户年龄（首笔交易距今天数） */
async function fetchAlchemyData(address) {
  const key = process.env.ALCHEMY_API_KEY;
  if (!key) return { txCount: 0, nfts: [], isDeployer: false, accountAgeDays: null };

  const base = ALCHEMY_ETH_MAINNET(key);

  try {
    const [txCountRes, nftsRes, transfersRes] = await Promise.all([
      axios.post(base, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
      }, { timeout: 6000 }),
      axios.post(base, {
        jsonrpc: '2.0',
        id: 2,
        method: 'alchemy_getNFTs',
        params: [{ owner: address, pageSize: 50 }],
      }, { timeout: 8000 }).catch(() => ({ data: { result: { ownedNfts: [] } } })),
      // 用于判断是否部署过合约（from === address && to === null）及首笔交易时间
      axios.post(base, {
        jsonrpc: '2.0',
        id: 3,
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromAddress: address,
            category: ['external'],
            maxCount: 0x64,
          },
        ],
      }, { timeout: 8000 }).catch(() => ({ data: { result: { transfers: [] } } })),
    ]);

    const txCount = parseInt(txCountRes?.data?.result ?? '0', 16) || 0;
    const nfts = (nftsRes?.data?.result?.ownedNfts ?? []).map((n) => ({
      contract: n.contract?.address,
      title: n.title,
    }));
    const transfers = transfersRes?.data?.result?.transfers ?? [];
    const isDeployer = transfers.some((t) => t.to == null || t.to === '');
    let accountAgeDays = null;
    if (transfers.length > 0) {
      const firstBlock = Math.min(...transfers.map((t) => Number(t.blockNum || 0)).filter(Boolean));
      if (firstBlock > 0) {
        try {
          const blockRes = await axios.post(base, {
            jsonrpc: '2.0',
            id: 4,
            method: 'eth_getBlockByNumber',
            params: [`0x${firstBlock.toString(16)}`, false],
          }, { timeout: 5000 });
          const ts = blockRes?.data?.result?.timestamp;
          if (ts) accountAgeDays = Math.floor((Date.now() / 1000 - parseInt(ts, 16)) / 86400);
        } catch {
          // ignore
        }
      }
    }

    return {
      txCount,
      nfts,
      isDeployer,
      accountAgeDays,
      hasAirdropNFT: false, // 可后续接 Galxe / OAT 等
    };
  } catch (e) {
    console.warn('[identityMiner] Alchemy fetch failed', e.message);
    return { txCount: 0, nfts: [], isDeployer: false, accountAgeDays: null };
  }
}

/** Tally：治理提案发起数（可选）https://docs.tally.xyz/tally-api/welcome */
async function fetchTallyProposalCount(address) {
  const apiKey = process.env.TALLY_API_KEY;
  if (!apiKey) return 0;
  try {
    const res = await axios.post(
      'https://api.tally.xyz/query',
      {
        query: `
          query { accounts(addresses: ["${address}"]) { proposalsCreatedCount } }
        `,
      },
      {
        headers: { 'Api-Key': apiKey, 'Content-Type': 'application/json' },
        timeout: 8000,
      }
    );
    const accounts = res?.data?.data?.accounts ?? [];
    const first = accounts[0];
    return first?.proposalsCreatedCount ?? 0;
  } catch (e) {
    console.warn('[identityMiner] Tally fetch failed', e.message);
    return 0;
  }
}
